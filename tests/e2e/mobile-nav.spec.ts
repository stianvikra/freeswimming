import { expect, test } from "@playwright/test";

test("mobile fixed nav uses link semantics and menu toggles with Escape", async ({ page }) => {
  await page.goto("/contact");

  const nav = page.getByTestId("mobile-fixed-nav");
  await expect(nav).toBeVisible();

  const home = page.getByTestId("mobile-nav-home");
  const course = page.getByTestId("mobile-nav-course");
  const menu = page.getByTestId("mobile-nav-menu");

  await expect(home).toHaveAttribute("href", "/");
  await expect(course).toHaveAttribute("href", "/course");

  const homeTag = await home.evaluate((el) => el.tagName);
  const courseTag = await course.evaluate((el) => el.tagName);
  expect(homeTag).toBe("A");
  expect(courseTag).toBe("A");

  await expect(menu).toHaveAttribute("aria-pressed", "false");
  await menu.click();

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await expect(menu).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menu).toHaveAttribute("aria-pressed", "false");
});
