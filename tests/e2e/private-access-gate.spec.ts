import { expect, test } from "@playwright/test";

const lockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const previewPassword = process.env.PW_SITE_LOCK_PASSWORD ?? "";

test.describe("private access gate", () => {
  test.skip(!lockEnabled, "requires SITE_LOCK_ENABLED=1");
  test.skip(!previewPassword, "requires PW_SITE_LOCK_PASSWORD");

  test("redirects public users to preview access and unlocks with password", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/preview-access\?/);
    await expect(
      page.getByRole("heading", { name: "freeswimming.org is currently private" })
    ).toBeVisible();

    await page.getByLabel("Access password").fill(previewPassword);
    await page.getByRole("button", { name: "Open preview" }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test("blocks protected api paths for unauthenticated public request context", async ({
    request,
  }) => {
    const response = await request.get("/api/progress/course");
    expect(response.status()).toBe(423);
  });
});
