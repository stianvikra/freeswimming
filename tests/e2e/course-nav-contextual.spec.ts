import { expect, test, type Page } from "@playwright/test";
import { COURSE_LESSONS_FLAT, DEFAULT_LESSON_ID } from "../../app/course/courseData";
import { isMobileProject } from "./project-guards";

async function waitForCoursePageToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      break;
    }
  }

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

test("course nav uses contextual actions on first and last lesson", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Mobile nav behavior is validated only on mobile projects."
  );
  test.slow();

  const firstLessonId = DEFAULT_LESSON_ID;
  const lastLessonId = COURSE_LESSONS_FLAT.at(-1)?.id ?? DEFAULT_LESSON_ID;

  await page.goto(`/course?lesson=${encodeURIComponent(firstLessonId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForCoursePageToSettle(page);

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

  const openAttempts: Array<() => Promise<void>> = [
    async () => {
      await leftFirst.click();
    },
    async () => {
      await leftFirst.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await leftFirst.click();
    },
    async () => {
      await leftFirst.focus();
      await page.keyboard.press("Space");
    },
  ];

  let drawerOpened = false;
  for (const openAttempt of openAttempts) {
    await page.keyboard.press("Escape").catch(() => {});
    await waitForCoursePageToSettle(page);
    await leftFirst.scrollIntoViewIfNeeded();
    await openAttempt();
    await expect(drawer)
      .toBeVisible({ timeout: 4_000 })
      .catch(() => {});
    if (await drawer.isVisible().catch(() => false)) {
      drawerOpened = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(drawerOpened).toBe(true);
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Main menu")).toBeVisible();

  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();

  await page.goto(`/course?lesson=${encodeURIComponent(lastLessonId)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForCoursePageToSettle(page);

  const leftLast = page.getByTestId("course-nav-left");
  const rightLast = page.getByTestId("course-nav-right");

  await expect(leftLast).toHaveText("Prev");
  await expect(rightLast).toBeVisible({ timeout: 15_000 });
  await expect(rightLast).toHaveText("Programs", { timeout: 15_000 });

  const rightTag = await rightLast.evaluate((el) => el.tagName);
  expect(rightTag).toBe("A");
});
