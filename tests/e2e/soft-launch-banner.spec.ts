import { expect, test } from "@playwright/test";

test("public pages do not render legacy under-construction banner", async ({ page }) => {
  await page.goto("/");
  if (new URL(page.url()).pathname === "/preview-access") {
    test.skip(true, "Public-banner assertions are skipped while site lock is enabled.");
  }

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByText("This site is under construction.")).toHaveCount(0);

  await expect(page.getByTestId("header-auth-link")).toBeVisible();
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);

  await page.goto("/auth/sign-in");

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);
  await expect(page.getByTestId("header-auth-link")).toHaveCount(0);
});
