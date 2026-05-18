import { expect, test, type Page } from "@playwright/test";

test.skip(
  ({ viewport }) => !viewport || viewport.width > 500,
  "Bottom mobile nav behavior is validated only on mobile projects."
);

async function waitForProgramsPageToSettle(page: Page) {
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

test("programs hides fixed bottom nav while header menu owns drawer state", async ({ page }) => {
  test.slow();

  await page.goto("/programs", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForProgramsPageToSettle(page);

  const menu = page.getByTestId("header-menu-toggle");
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });

  await expect(page.getByRole("heading", { name: "Swim Programs", exact: true })).toBeVisible();
  await expect(page.getByTestId("mobile-fixed-nav")).toBeHidden();
  await expect(page.getByTestId("mobile-nav-menu")).toHaveCount(0);
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  const openAttempts: Array<() => Promise<void>> = [
    async () => {
      await menu.click();
    },
    async () => {
      await menu.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await menu.click();
    },
    async () => {
      await menu.focus();
      await page.keyboard.press("Space");
    },
  ];

  let menuOpened = false;
  for (const openAttempt of openAttempts) {
    await page.keyboard.press("Escape").catch(() => {});
    await waitForProgramsPageToSettle(page);
    await menu.scrollIntoViewIfNeeded();
    await openAttempt();
    await expect(drawer)
      .toBeVisible({ timeout: 4_000 })
      .catch(() => {});
    if (await drawer.isVisible().catch(() => false)) {
      menuOpened = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(menuOpened).toBe(true);
  await expect(drawer).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
});
