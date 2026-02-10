import { expect, test } from "@playwright/test";

test("menu tab is neutral on section pages and active only when drawer is open", async ({
  page,
}) => {
  await page.goto("/programs");

  const menu = page.getByTestId("mobile-nav-menu");
  const home = page.getByTestId("mobile-nav-home");
  const course = page.getByTestId("mobile-nav-course");

  await expect(menu).toHaveAttribute("aria-pressed", "false");
  await expect(menu).toHaveClass(/bg-white\/95/);
  await expect(menu).not.toHaveClass(/from-blue-500/);
  await expect(home).not.toHaveAttribute("aria-current", "page");
  await expect(course).not.toHaveAttribute("aria-current", "page");

  await menu.click();

  await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
  await expect(menu).toHaveAttribute("aria-pressed", "true");
  await expect(menu).toHaveClass(/from-blue-500/);
});
