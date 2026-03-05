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

  const menuToggle = page.getByTestId("header-menu-toggle").first();
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  try {
    await expect(drawer).toBeVisible({ timeout: 3000 });
  } catch {
    await menuToggle.focus();
    await page.keyboard.press("Enter");
    await expect(drawer).toBeVisible();
  }

  const menuTab = drawer.getByRole("button", { name: "Menu", exact: true });
  if ((await menuTab.count()) > 0) {
    await menuTab.first().click();
  }

  const installAction = page.getByTestId("install-app-menu-action");
  await expect(installAction).toBeVisible();
  await expect(installAction).toContainText("Install app");
});
