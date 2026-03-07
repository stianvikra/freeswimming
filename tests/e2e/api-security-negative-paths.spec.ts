import { expect, test, type APIResponse } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const dummyUuid = "11111111-1111-4111-8111-111111111111";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function expectUnauthorizedNoLeak(response: APIResponse) {
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"] ?? "").toContain("no-store");

  const payload = (await response.json()) as {
    ok?: boolean;
    error?: string;
    stack?: string;
    details?: string;
  };

  expect(payload).toMatchObject({
    ok: false,
    error: "Unauthorized.",
  });

  const payloadSerialized = JSON.stringify(payload).toLowerCase();
  expect(payloadSerialized).not.toContain("stack");
  expect(payloadSerialized).not.toContain("supabase");
  expect(payloadSerialized).not.toContain("stripe");
}

async function expectUnauthorizedNoLeakWithTransientRetry(send: () => Promise<APIResponse>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await expectUnauthorizedNoLeak(await send());
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransientNetworkError =
        /ECONNRESET|ECONNREFUSED|ETIMEDOUT|Request context disposed|socket hang up/i.test(
          errorMessage
        );
      if (!isTransientNetworkError || attempt === 2) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

test.describe("api security negative paths", () => {
  test("returns deterministic non-sensitive errors for portal + checkout guardrails", async ({
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const portalUnsupported = await request.post("/api/portal", {
      headers: {
        "content-type": "text/plain",
      },
      data: "invalid",
    });
    expect(portalUnsupported.status()).toBe(415);
    await expect(portalUnsupported.json()).resolves.toMatchObject({
      ok: false,
      error: "Unsupported content type.",
    });

    const portalInvalidJson = await request.fetch("/api/portal", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: "{",
    });
    const portalInvalidJsonStatus = portalInvalidJson.status();
    expect([400, 401]).toContain(portalInvalidJsonStatus);
    const portalInvalidJsonPayload = (await portalInvalidJson.json()) as {
      ok?: boolean;
      error?: string;
    };
    if (portalInvalidJsonStatus === 400) {
      expect(portalInvalidJsonPayload).toMatchObject({
        ok: false,
        error: "Invalid JSON.",
      });
    } else {
      expect(portalInvalidJsonPayload).toMatchObject({
        ok: false,
        error: "Unauthorized.",
      });
    }

    const portalUnauthenticated = await request.post("/api/portal", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        returnPath: "/my-library",
      }),
    });
    expect(portalUnauthenticated.status()).toBe(401);
    const portalUnauthenticatedPayload = (await portalUnauthenticated.json()) as {
      ok?: boolean;
      error?: string;
      stack?: string;
      details?: string;
    };
    expect(portalUnauthenticatedPayload).toMatchObject({
      ok: false,
      error: "Unauthorized.",
    });
    const portalPayloadSerialized = JSON.stringify(portalUnauthenticatedPayload).toLowerCase();
    expect(portalPayloadSerialized).not.toContain("stack");
    expect(portalPayloadSerialized).not.toContain("supabase");
    expect(portalPayloadSerialized).not.toContain("stripe");

    const checkoutUnsupported = await request.post("/api/checkout/session", {
      headers: {
        "content-type": "text/plain",
      },
      data: "invalid",
    });
    expect(checkoutUnsupported.status()).toBe(415);
    await expect(checkoutUnsupported.json()).resolves.toMatchObject({
      ok: false,
      error: "Unsupported content type.",
    });

    const checkoutUnknownProduct = await request.post("/api/checkout/session", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        productId: "non-existent-product",
      }),
    });
    expect(checkoutUnknownProduct.status()).toBe(400);
    const checkoutUnknownProductPayload = (await checkoutUnknownProduct.json()) as {
      ok?: boolean;
      error?: string;
    };
    expect(checkoutUnknownProductPayload).toMatchObject({
      ok: false,
      error: "Unknown product.",
    });
  });

  test("returns deterministic non-sensitive unauthorized responses for progress + user data APIs", async ({
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await expectUnauthorizedNoLeak(await request.get("/api/progress/course"));
    await expectUnauthorizedNoLeak(
      await request.post("/api/progress/course", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          rows: [],
        }),
      })
    );

    await expectUnauthorizedNoLeak(await request.get("/api/progress/guide"));
    await expectUnauthorizedNoLeak(
      await request.post("/api/progress/guide", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          rows: [],
        }),
      })
    );

    await expectUnauthorizedNoLeak(await request.get("/api/user/export"));
    await expectUnauthorizedNoLeak(
      await request.post("/api/user/delete", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          confirm: "DELETE",
        }),
      })
    );
  });

  test("returns deterministic non-sensitive unauthorized responses for extended admin api set", async ({
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await expectUnauthorizedNoLeakWithTransientRetry(() => request.get("/api/admin/content"));
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post("/api/admin/content", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          contentType: "course_module",
          title: "Unauthorized probe",
          status: "draft",
        }),
      })
    );

    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post("/api/admin/content/course-structure", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          action: "normalize",
        }),
      })
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.get(`/api/admin/content/${dummyUuid}/revisions`)
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post(`/api/admin/content/${dummyUuid}/revisions`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          revisionId: dummyUuid,
        }),
      })
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post("/api/admin/content/import")
    );

    await expectUnauthorizedNoLeakWithTransientRetry(() => request.get("/api/admin/products"));
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.patch(`/api/admin/products/${dummyUuid}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          title: "Unauthorized product update probe",
          active: true,
        }),
      })
    );

    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.get("/api/admin/operations/flags")
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() => request.get("/api/admin/notes"));
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.patch(`/api/admin/notes/${dummyUuid}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          title: "Unauthorized note update probe",
        }),
      })
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.delete(`/api/admin/notes/${dummyUuid}`)
    );

    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.get("/api/admin/categories/notes")
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post("/api/admin/categories/notes", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          title: "Unauthorized category create probe",
          slug: "unauthorized-create-probe",
          sortOrder: 10,
        }),
      })
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.patch(`/api/admin/categories/notes/${dummyUuid}`, {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          title: "Unauthorized category update probe",
        }),
      })
    );
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.delete(`/api/admin/categories/notes/${dummyUuid}`)
    );

    await expectUnauthorizedNoLeakWithTransientRetry(() => request.get("/api/admin/qr-links"));
    await expectUnauthorizedNoLeakWithTransientRetry(() =>
      request.post("/api/admin/qr-links", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          slug: "unauthorized-qr-probe",
          destinationUrl: "https://freeswimming.org/course",
          status: "active",
        }),
      })
    );
  });
});
