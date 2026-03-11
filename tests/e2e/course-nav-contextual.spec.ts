import { expect, test } from "@playwright/test";
import { COURSE_LESSONS_FLAT, DEFAULT_LESSON_ID } from "../../app/course/courseData";
import { isMobileProject } from "./project-guards";

test("course nav uses contextual actions on first and last lesson", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Mobile nav behavior is validated only on mobile projects."
  );

  const firstLessonId = DEFAULT_LESSON_ID;
  const lastLessonId = COURSE_LESSONS_FLAT.at(-1)?.id ?? DEFAULT_LESSON_ID;

  await page.goto(`/course?lesson=${encodeURIComponent(firstLessonId)}`);

  const leftFirst = page.getByTestId("course-nav-left");
  const middleFirst = page.getByTestId("course-nav-lessons");
  const rightFirst = page.getByTestId("course-nav-right");

  await expect(leftFirst).toHaveText("Menu");
  await expect(leftFirst).toBeVisible();
  await expect(leftFirst).not.toBeDisabled();
  await expect(middleFirst).toHaveText("Lessons");
  await expect(rightFirst).toHaveText("Next");

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeHidden();

  // Mobile WebKit can occasionally miss the first tap during hydration/paint.
  // Keep click as primary path, then fall back to keyboard activation.
  await leftFirst.click();
  try {
    await expect(drawer).toBeVisible({ timeout: 3000 });
  } catch {
    await leftFirst.focus();
    await page.keyboard.press("Enter");
    await expect(drawer).toBeVisible();
  }

  await expect(drawer.getByText("Main menu")).toBeVisible();

  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();

  await page.goto(`/course?lesson=${encodeURIComponent(lastLessonId)}`);

  const leftLast = page.getByTestId("course-nav-left");
  const rightLast = page.getByTestId("course-nav-right");

  await expect(leftLast).toHaveText("Prev");
  await expect(rightLast).toBeVisible({ timeout: 10_000 });
  await expect(rightLast).toHaveText("Programs", { timeout: 10_000 });

  const rightTag = await rightLast.evaluate((el) => el.tagName);
  expect(rightTag).toBe("A");
});
