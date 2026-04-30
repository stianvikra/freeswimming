import { expect, test, type Page } from "@playwright/test";
import { isDesktopProject } from "./project-guards";
import { gotoWithTransientRetry } from "./utils/transient-navigation";

test.use({
  viewport: { width: 1280, height: 720 },
  isMobile: false,
  hasTouch: false,
});

async function waitForDrawerTriggerToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });
  await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });

  const trigger = page.getByTestId("header-menu-toggle");
  await expect(trigger).toBeVisible();
  await expect
    .poll(
      () =>
        trigger.evaluate((node) =>
          Object.keys(node).some(
            (key) => key.startsWith("__reactProps$") || key.startsWith("__reactFiber$")
          )
        ),
      {
        timeout: 15_000,
        message: "Expected the header menu toggle to finish React hydration before focus checks.",
      }
    )
    .toBe(true);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  await page.bringToFront();
}

test("drawer traps keyboard focus and restores trigger focus on close", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Keyboard focus trap coverage runs on desktop projects.");
  testInfo.setTimeout(60_000);

  await gotoWithTransientRetry(page, "/contact", 60_000);
  await waitForDrawerTriggerToSettle(page);

  const trigger = page.getByTestId("header-menu-toggle");
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await expect
    .poll(
      () =>
        page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? null),
      {
        timeout: 5_000,
      }
    )
    .toBe("header-menu-toggle");

  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

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
  await expect
    .poll(
      () =>
        page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? null),
      {
        timeout: 5_000,
      }
    )
    .toBe("header-menu-toggle");
});
