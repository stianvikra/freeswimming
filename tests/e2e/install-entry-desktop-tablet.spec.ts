import { expect, test } from "@playwright/test";
import { isDesktopOrTabletProject } from "./project-guards";

test("main menu exposes install action on desktop and tablet layouts", async ({
  page,
}, testInfo) => {
  test.skip(
    !isDesktopOrTabletProject(testInfo),
    "This coverage is for desktop and tablet layouts only."
  );
  test.slow();

  await page.goto("/contact", { waitUntil: "domcontentloaded", timeout: 60_000 });
  // The desktop/tablet menu can miss the first interaction while the page is still settling
  // after a fresh compile; wait that transient overlay out before probing the drawer.
  await expect(page.getByText("Compiling", { exact: true }))
    .toHaveCount(0, { timeout: 15_000 })
    .catch(() => {});
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

  const menuToggle = page.getByTestId("header-menu-toggle").first();
  await expect(menuToggle).toBeVisible();
  await expect(menuToggle).toBeEnabled();
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });

  const openAttempts: Array<() => Promise<void>> = [
    async () => {
      await menuToggle.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await menuToggle.click();
    },
    async () => {
      await menuToggle.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await menuToggle.focus();
      await page.keyboard.press("Space");
    },
  ];

  let menuOpened = false;
  for (const openAttempt of openAttempts) {
    await page.keyboard.press("Escape").catch(() => {});
    await menuToggle.scrollIntoViewIfNeeded();
    await openAttempt();
    await expect(drawer)
      .toBeVisible({ timeout: 4000 })
      .catch(() => {});
    if (await drawer.isVisible().catch(() => false)) {
      menuOpened = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  if (!menuOpened) {
    throw new Error("Navigation drawer did not open from menu toggle.");
  }

  const menuTab = drawer.getByRole("button", { name: "Menu", exact: true });
  if ((await menuTab.count()) > 0) {
    await menuTab.first().click();
  }

  const installAction = page.getByTestId("install-app-menu-action");
  await expect(installAction).toBeVisible();
  await expect(installAction).toContainText("Install app");
});
