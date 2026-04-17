import { expect, test } from "@playwright/test";

const lockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const previewPassword = process.env.PW_SITE_LOCK_PASSWORD ?? "";
const previewBypassToken = process.env.PW_SITE_LOCK_BYPASS_TOKEN ?? "";
const forcePasswordUnlock = process.env.PW_SITE_LOCK_USE_PASSWORD === "1";
const hasUnlockCredential = Boolean(previewPassword || previewBypassToken);
const baseUrl = `http://127.0.0.1:${process.env.PW_PORT ?? "3100"}`;

test.describe("private access gate", () => {
  test.skip(!lockEnabled, "requires SITE_LOCK_ENABLED=1");
  test.skip(!hasUnlockCredential, "requires PW_SITE_LOCK_PASSWORD or PW_SITE_LOCK_BYPASS_TOKEN");

  test("redirects public users to preview access and unlocks", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/preview-access\?/);
    await expect(page.getByAltText("freeswimming.org")).toBeVisible();
    await expect(page.getByRole("heading", { name: /opening carefully/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open preview" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Get notified when preview opens" })
    ).toHaveAttribute("href", "/contact?source=preview_access_notify");
    await expect(page.getByText("Admin preview access")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign in as admin" })).toHaveCount(0);
    await expect(page.getByText(/signed in as/i)).toHaveCount(0);

    await page.getByRole("link", { name: "Get notified when preview opens" }).click();
    await expect(page).toHaveURL(/\/contact\?source=preview_access_notify$/);
    await expect(page.getByRole("heading", { name: "Preview Updates" })).toBeVisible();
    await page.goto("/preview-access?next=%2F");

    // Automation default: bypass token path first for deterministic local/CI runs.
    if (previewBypassToken && !forcePasswordUnlock) {
      const bypassResponse = await request.get(`${baseUrl}/`, {
        headers: {
          "x-site-lock-bypass-token": previewBypassToken,
        },
        maxRedirects: 0,
      });
      expect(bypassResponse.status()).toBe(200);
      return;
    }

    if (previewPassword) {
      await page.getByLabel("Access password").fill(previewPassword);
      await page.getByRole("button", { name: "Open preview" }).click();
      await expect(page).toHaveURL(/\/$/);
      return;
    }

    const fallbackBypassResponse = await request.get(`${baseUrl}/`, {
      headers: {
        "x-site-lock-bypass-token": previewBypassToken,
      },
      maxRedirects: 0,
    });
    expect(fallbackBypassResponse.status()).toBe(200);
  });

  test("blocks protected api paths for unauthenticated public request context", async ({
    request,
  }) => {
    const response = await request.get("/api/progress/course");
    expect(response.status()).toBe(423);
  });

  test("keeps indexing metadata locked while site is private", async ({ request }) => {
    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.status()).toBe(200);
    const sitemapXml = await sitemapResponse.text();
    expect(sitemapXml).not.toContain("<loc>");

    const robotsResponse = await request.get("/robots.txt");
    expect(robotsResponse.status()).toBe(200);
    const robotsText = await robotsResponse.text();
    expect(robotsText).toContain("Disallow: /");
  });
});
