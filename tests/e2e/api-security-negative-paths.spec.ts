import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
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
});
