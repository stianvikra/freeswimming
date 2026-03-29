import { expect, test, type Page } from "@playwright/test";

async function waitForRouteToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      return;
    }
  }

  await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
}

async function gotoStable(page: Page, href: string) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(href, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await waitForRouteToSettle(page);
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/ERR_ABORTED|frame was detached/i.test(message) || attempt === 2) {
        throw error;
      }
      await page.waitForTimeout(750);
    }
  }

  throw lastError;
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
