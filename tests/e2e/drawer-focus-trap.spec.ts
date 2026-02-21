import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

test.use({
  viewport: { width: 1280, height: 720 },
  isMobile: false,
  hasTouch: false,
});

test("drawer traps keyboard focus and restores trigger focus on close", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Keyboard focus trap coverage runs on desktop projects.");

  await page.goto("/contact");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

  const trigger = page.getByTestId("header-menu-toggle");
  await expect(trigger).toBeVisible();

  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();

  const closeButton = drawer.getByRole("button", { name: "Close menu" });
  const closeNavButton = drawer.locator('button:not([aria-label]):has-text("Close")');

  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(closeNavButton).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});
