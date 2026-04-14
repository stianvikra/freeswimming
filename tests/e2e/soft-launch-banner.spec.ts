import { expect, test, type Page } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

async function gotoStable(page: Page, href: string) {
  await gotoWithTransientRetry(page, href, 60_000);
  await waitForRouteToSettle(page);
}

test("public pages do not render legacy under-construction banner", async ({ page }) => {
  test.slow();

  await gotoStable(page, "/");
  if (new URL(page.url()).pathname === "/preview-access") {
    test.skip(true, "Public-banner assertions are skipped while site lock is enabled.");
  }

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByText("This site is under construction.")).toHaveCount(0);

  await expect(page.getByTestId("header-auth-link")).toBeVisible();
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);

  await gotoStable(page, "/auth/sign-in");

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);
  await expect(page.getByTestId("header-auth-link")).toHaveCount(0);
});
