import { expect, test, type Page } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

const COMMON_MISTAKES_STORAGE_KEY_PREFIX = "fs_course_common_mistakes_expanded:";
const COMMON_MISTAKES_LESSON_CANDIDATES = [
  "intro-course--welcome-course-structure",
  "intro-course--course-navigation-basics",
  "kick-drills--kick-basics-support-not-speed",
  "kick-drills--standing-leg-kicks-poolside",
  "body-position--body-position-skill",
  "rotation--driven-by-core",
] as const;

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

async function gotoCourseLesson(page: Page, lessonId: string) {
  const courseContentResponse = page
    .waitForResponse(
      (response) =>
        response.url().includes("/api/course/content") && response.request().method() === "GET",
      { timeout: 15_000 }
    )
    .catch(() => null);

  await page.goto(`/course?lesson=${lessonId}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await courseContentResponse;
  await waitForCoursePageToSettle(page);
  await expect(page.getByTestId("course-page")).toHaveAttribute("data-course-content-state", "success");
  await page.waitForTimeout(300);
}

async function findLessonWithVisibleCommonMistakes(page: Page, lessonIds: readonly string[]) {
  for (const lessonId of lessonIds) {
    await gotoCourseLesson(page, lessonId);
    const activeLessonId = await page.getByTestId("course-page").getAttribute("data-active-lesson-id");
    if (activeLessonId !== lessonId) {
      continue;
    }
    const toggle = page.getByRole("button", { name: /Common mistakes/i }).first();
    if (await toggle.isVisible().catch(() => false)) {
      return { lessonId, toggle };
    }
  }

  return null;
}

async function waitForCollapsedCommonMistakes(page: Page, lessonId: string) {
  await expect(page.getByTestId("course-page")).toHaveAttribute("data-active-lesson-id", lessonId);
  const toggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Expand to review common errors for this lesson.")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        ({ lessonId: currentLessonId, prefix }) =>
          window.localStorage.getItem(`${prefix}${currentLessonId}`),
        { lessonId, prefix: COMMON_MISTAKES_STORAGE_KEY_PREFIX }
      )
    )
    .toBe("0");
}

test("common mistakes stays visible by default and persists per-lesson collapse locally", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.slow();

  await gotoCourseLesson(page, COMMON_MISTAKES_LESSON_CANDIDATES[0]);

  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("fs_course_common_mistakes_expanded:")) {
        window.localStorage.removeItem(key);
      }
    }
  });

  const firstLesson = await findLessonWithVisibleCommonMistakes(
    page,
    COMMON_MISTAKES_LESSON_CANDIDATES
  );
  if (!firstLesson) {
    test.skip(
      true,
      "Published course content in this environment does not expose a common mistakes section for the tested lessons."
    );
    return;
  }

  await expect(firstLesson.toggle).toHaveAttribute("aria-expanded", "true");

  await page.evaluate(
    ({ lessonId, prefix }) => {
      window.localStorage.setItem(`${prefix}${lessonId}`, "0");
    },
    { lessonId: firstLesson.lessonId, prefix: COMMON_MISTAKES_STORAGE_KEY_PREFIX }
  );

  await gotoCourseLesson(page, firstLesson.lessonId);
  await waitForCollapsedCommonMistakes(page, firstLesson.lessonId);

  const secondLesson = await findLessonWithVisibleCommonMistakes(
    page,
    COMMON_MISTAKES_LESSON_CANDIDATES.filter((lessonId) => lessonId !== firstLesson.lessonId)
  );
  if (!secondLesson) {
    test.skip(
      true,
      "Published course content in this environment does not expose a second common mistakes section for the tested lessons."
    );
    return;
  }

  await expect(secondLesson.toggle).toHaveAttribute("aria-expanded", "true");

  await gotoCourseLesson(page, firstLesson.lessonId);
  await waitForCollapsedCommonMistakes(page, firstLesson.lessonId);
});
