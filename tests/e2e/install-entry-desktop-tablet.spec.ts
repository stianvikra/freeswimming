import { expect, test } from "@playwright/test";
import { isDesktopOrTabletProject } from "./project-guards";

test("main menu exposes install action on desktop and tablet layouts", async ({
  page,
}, testInfo) => {
  test.skip(
    !isDesktopOrTabletProject(testInfo),
    "This coverage is for desktop and tablet layouts only."
  );

  await page.goto("/course?lesson=mod3-l1");

  const menuToggle = page.getByTestId("header-menu-toggle");
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Menu", exact: true }).click();

  const installAction = page.getByTestId("install-app-menu-action");
  await expect(installAction).toBeVisible();
  await expect(installAction).toContainText("Install app");
});
