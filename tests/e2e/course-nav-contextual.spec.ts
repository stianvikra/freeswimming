import { expect, test } from "@playwright/test";

test("course nav uses contextual actions on first and last lesson", async ({ page }) => {
  await page.goto("/course?lesson=m1-l1");

  const leftFirst = page.getByTestId("course-nav-left");
  const middleFirst = page.getByTestId("course-nav-lessons");
  const rightFirst = page.getByTestId("course-nav-right");

  await expect(leftFirst).toHaveText("Menu");
  await expect(leftFirst).not.toBeDisabled();
  await expect(middleFirst).toHaveText("Lessons");
  await expect(rightFirst).toHaveText("Next");

  await leftFirst.click();

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Main menu")).toBeVisible();

  await drawer.getByRole("button", { name: "Back" }).click();
  await expect(drawer).toBeHidden();

  await page.goto("/course?lesson=m4-l1");

  const leftLast = page.getByTestId("course-nav-left");
  const rightLast = page.getByTestId("course-nav-right");

  await expect(leftLast).toHaveText("Prev");
  await expect(rightLast).toHaveText("Programs");

  const rightTag = await rightLast.evaluate((el) => el.tagName);
  expect(rightTag).toBe("A");
});
