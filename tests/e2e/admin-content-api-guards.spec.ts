import type { APIRequestContext, Page } from "@playwright/test";
import { expect, request as playwrightRequest, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);
const dummyContentId = "11111111-1111-4111-8111-111111111111";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function skipForUnexpectedDevLoginDestination(destination: URL): void {
  if (destination.pathname === "/auth/sign-in") {
    const errorMessage = destination.searchParams.get("error");
    if (errorMessage && /could not sign in/i.test(errorMessage)) {
      test.skip(
        true,
        "Dev auth bypass is enabled but sign-in failed; check DEV_AUTH_BYPASS_EMAIL/DEV_AUTH_BYPASS_PASSWORD."
      );
    }
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  if (destination.pathname === "/preview-access") {
    test.skip(true, "Site lock is enabled; dev-login did not reach /admin.");
  }

  test.skip(true, `Dev login redirected to unexpected path (${destination.pathname}).`);
}

async function loginAsAdminViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
  const destinationAfterDevLogin = new URL(page.url());
  const pathAfterDevLogin = destinationAfterDevLogin.pathname;

  if (pathAfterDevLogin !== "/admin") {
    skipForUnexpectedDevLoginDestination(destinationAfterDevLogin);
  }

  const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
  if (await noAccessHeading.isVisible().catch(() => false)) {
    test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
  }

  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();
  const roleBadge = page.getByText(/^Role:\s*/i).first();
  if (await roleBadge.isVisible().catch(() => false)) {
    const roleText = ((await roleBadge.textContent()) ?? "").toLowerCase();
    if (!roleText.includes("admin") && !roleText.includes("editor")) {
      test.skip(true, "Current admin session is read-only (viewer) in this environment.");
    }
  }
}

async function createAuthenticatedRequestContext(page: Page): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
    storageState: await page.context().storageState(),
  });
}

test.describe("admin content API guards", () => {
  test("rejects unauthenticated mutation calls and invalid id probes", async ({
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const unauthenticatedCalls = [
      {
        method: "POST",
        url: "/api/admin/content",
        body: {
          contentType: "course_module",
          title: "Unauthenticated create probe",
          status: "draft",
        },
      },
      {
        method: "PATCH",
        url: `/api/admin/content/${dummyContentId}`,
        body: {
          title: "Unauthenticated patch probe",
        },
      },
      {
        method: "DELETE",
        url: `/api/admin/content/${dummyContentId}`,
      },
      {
        method: "POST",
        url: "/api/admin/content/course-structure",
        body: {
          action: "normalize",
        },
      },
      {
        method: "POST",
        url: "/api/admin/qr-links",
        body: {
          slug: "unauth-qr-probe",
          destinationUrl: "https://freeswimming.org/course",
          status: "active",
        },
      },
      {
        method: "PATCH",
        url: `/api/admin/qr-links/${dummyContentId}`,
        body: {
          status: "disabled",
        },
      },
      {
        method: "DELETE",
        url: `/api/admin/qr-links/${dummyContentId}`,
      },
    ] as const;

    for (const call of unauthenticatedCalls) {
      const response = await request.fetch(call.url, {
        method: call.method,
        headers:
          call.method === "DELETE"
            ? undefined
            : {
                "content-type": "application/json",
              },
        data: call.method === "DELETE" ? undefined : JSON.stringify(call.body),
      });

      expect(
        unauthenticatedDeniedStatuses.has(response.status()),
        `Unexpected status ${response.status()} for ${call.method} ${call.url}`
      ).toBeTruthy();
    }

    const invalidIdResponse = await request.patch("/api/admin/content/not-a-uuid", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        title: "Invalid id probe",
      }),
    });

    expect(invalidIdResponse.status()).toBe(400);
    await expect(invalidIdResponse.json()).resolves.toMatchObject({
      ok: false,
      error: "Invalid content item id.",
    });
  });

  test("rejects malformed payloads for authenticated admin mutation calls", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page);
    const adminRequest = await createAuthenticatedRequestContext(page);

    try {
      const unsupportedPatch = await adminRequest.patch(`/api/admin/content/${dummyContentId}`, {
        headers: {
          "content-type": "text/plain",
        },
        data: "invalid",
      });
      expect(unsupportedPatch.status()).toBe(415);

      const invalidJsonPatch = await adminRequest.fetch(`/api/admin/content/${dummyContentId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        data: Buffer.from("{"),
      });
      expect(invalidJsonPatch.status()).toBe(400);
      await expect(invalidJsonPatch.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });

      const invalidPatchBody = await adminRequest.patch(`/api/admin/content/${dummyContentId}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          body: ["invalid"],
        }),
      });
      expect(invalidPatchBody.status()).toBe(400);
      await expect(invalidPatchBody.json()).resolves.toMatchObject({
        ok: false,
        error: "Body must be a JSON object.",
      });

      const emptyPatch = await adminRequest.patch(`/api/admin/content/${dummyContentId}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({}),
      });
      expect(emptyPatch.status()).toBe(400);
      await expect(emptyPatch.json()).resolves.toMatchObject({
        ok: false,
        error: "No updatable fields were provided.",
      });

      const selfParentPatch = await adminRequest.patch(`/api/admin/content/${dummyContentId}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          parentId: dummyContentId,
        }),
      });
      expect(selfParentPatch.status()).toBe(400);
      await expect(selfParentPatch.json()).resolves.toMatchObject({
        ok: false,
        error: "parentId cannot reference the same content item.",
      });

      const unsupportedCreate = await adminRequest.post("/api/admin/content", {
        headers: {
          "content-type": "text/plain",
        },
        data: "invalid",
      });
      expect(unsupportedCreate.status()).toBe(415);

      const invalidJsonCreate = await adminRequest.fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        data: Buffer.from("{"),
      });
      expect(invalidJsonCreate.status()).toBe(400);
      await expect(invalidJsonCreate.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });

      const invalidCreateTitle = await adminRequest.post("/api/admin/content", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          contentType: "course_module",
          title: "x",
          status: "draft",
        }),
      });
      expect(invalidCreateTitle.status()).toBe(400);
      await expect(invalidCreateTitle.json()).resolves.toMatchObject({
        ok: false,
        error: "Title must be between 2 and 120 characters.",
      });

      const unsupportedCourseStructure = await adminRequest.post(
        "/api/admin/content/course-structure",
        {
          headers: {
            "content-type": "text/plain",
          },
          data: "invalid",
        }
      );
      expect(unsupportedCourseStructure.status()).toBe(415);

      const invalidJsonCourseStructure = await adminRequest.fetch(
        "/api/admin/content/course-structure",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          data: Buffer.from("{"),
        }
      );
      expect(invalidJsonCourseStructure.status()).toBe(400);
      await expect(invalidJsonCourseStructure.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });

      const invalidCourseStructurePayload = await adminRequest.post(
        "/api/admin/content/course-structure",
        {
          headers: {
            "content-type": "application/json",
          },
          data: JSON.stringify({
            action: "move_module",
            moduleId: "not-a-uuid",
            direction: "up",
          }),
        }
      );
      expect(invalidCourseStructurePayload.status()).toBe(400);
      await expect(invalidCourseStructurePayload.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid module id.",
      });

      const unsupportedQrCreate = await adminRequest.post("/api/admin/qr-links", {
        headers: {
          "content-type": "text/plain",
        },
        data: "invalid",
      });
      expect(unsupportedQrCreate.status()).toBe(415);

      const invalidJsonQrCreate = await adminRequest.fetch("/api/admin/qr-links", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        data: Buffer.from("{"),
      });
      expect(invalidJsonQrCreate.status()).toBe(400);
      await expect(invalidJsonQrCreate.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });

      const unsafeQrCreate = await adminRequest.post("/api/admin/qr-links", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          slug: `guard-unsafe-${Date.now().toString(36)}`,
          destinationUrl: "https://evil.example/phish",
          status: "active",
        }),
      });
      expect(unsafeQrCreate.status()).toBe(400);
      await expect(unsafeQrCreate.json()).resolves.toMatchObject({
        ok: false,
        error: "destinationUrl host is not allowlisted.",
      });

      const createdQrResponse = await adminRequest.post("/api/admin/qr-links", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          slug: `guard-safe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          destinationUrl: "https://freeswimming.org/course",
          status: "active",
        }),
      });
      expect(createdQrResponse.status()).toBe(200);
      const createdQrPayload = (await createdQrResponse.json()) as {
        item?: { id?: string };
      };
      const createdQrId = createdQrPayload.item?.id;
      expect(createdQrId).toBeTruthy();

      const unsupportedQrPatch = await adminRequest.patch(`/api/admin/qr-links/${createdQrId}`, {
        headers: {
          "content-type": "text/plain",
        },
        data: "invalid",
      });
      expect(unsupportedQrPatch.status()).toBe(415);

      const invalidJsonQrPatch = await adminRequest.fetch(`/api/admin/qr-links/${createdQrId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        data: Buffer.from("{"),
      });
      expect(invalidJsonQrPatch.status()).toBe(400);
      await expect(invalidJsonQrPatch.json()).resolves.toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });

      const unsafeQrPatch = await adminRequest.patch(`/api/admin/qr-links/${createdQrId}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          destinationUrl: "https://evil.example/redirect",
        }),
      });
      expect(unsafeQrPatch.status()).toBe(400);
      await expect(unsafeQrPatch.json()).resolves.toMatchObject({
        ok: false,
        error: "destinationUrl host is not allowlisted.",
      });
    } finally {
      await adminRequest.dispose();
    }
  });
});
