import { expect, test, type Page } from "@playwright/test";
import { DEFAULT_LESSON_ID } from "../../app/course/courseData";
import { isMobileProject } from "./project-guards";

type CourseLessonSummary = {
  id: string;
  title: string;
  moduleTitle: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

async function getCanonicalCourseLessons(page: Page): Promise<CourseLessonSummary[]> {
  const response = await page.request.get("/api/course/content");
  expect(response.ok()).toBe(true);

  const payload = (await response.json()) as {
    modules?: Array<{
      title?: string;
      lessons?: Array<{
        id?: string;
        title?: string;
      }>;
    }>;
  };

  const lessons =
    payload.modules?.flatMap((module) =>
      (module.lessons ?? [])
        .map((lesson) =>
          typeof lesson.id === "string" && lesson.id.length > 0
            ? {
                id: lesson.id,
                title:
                  typeof lesson.title === "string" && lesson.title.trim().length > 0
                    ? lesson.title.trim()
                    : lesson.id,
                moduleTitle:
                  typeof module.title === "string" && module.title.trim().length > 0
                    ? module.title.trim()
                    : "Course module",
              }
            : null
        )
        .filter((lesson): lesson is CourseLessonSummary => lesson !== null)
    ) ?? [];

  return lessons.length > 0
    ? lessons
    : [{ id: DEFAULT_LESSON_ID, title: DEFAULT_LESSON_ID, moduleTitle: "Course module" }];
}

async function gotoCourseLesson(page: Page, lessonId: string) {
  const href = `/course?lesson=${encodeURIComponent(lessonId)}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(href, {
        waitUntil: "domcontentloaded",
        timeout: attempt === 0 ? 90_000 : 60_000,
      });
      await waitForCoursePageToSettle(page);
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransientGotoError =
        /ERR_ABORTED|frame was detached|page\.goto: Timeout \d+ms exceeded/i.test(errorMessage);
      if (!isTransientGotoError || attempt === 1) {
        throw error;
      }

      await page.waitForTimeout(1_000);
    }
  }
}

async function getActiveCourseLessonId(page: Page) {
  return page.getByTestId("course-page").getAttribute("data-active-lesson-id");
}

test("course nav uses contextual actions on first and last lesson", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Mobile nav behavior is validated only on mobile projects."
  );
  test.slow();
  testInfo.setTimeout(150_000);

  const canonicalLessons = await getCanonicalCourseLessons(page);
  test.skip(canonicalLessons.length < 2, "Contextual first/last nav needs at least two lessons.");
  const firstLesson = canonicalLessons[0] ?? {
    id: DEFAULT_LESSON_ID,
    title: DEFAULT_LESSON_ID,
    moduleTitle: "Course module",
  };
  const lastLesson = canonicalLessons[canonicalLessons.length - 1] ?? firstLesson;

  await gotoCourseLesson(page, firstLesson.id);

  const leftFirst = page.getByTestId("course-nav-left");
  const middleFirst = page.getByTestId("course-nav-lessons");
  const rightFirst = page.getByTestId("course-nav-right");
  const headerMenu = page.getByTestId("header-menu-toggle");

  await expect(headerMenu).toBeVisible();
  await expect(leftFirst).toHaveText("Previous");
  await expect(leftFirst).toBeVisible();
  await expect(leftFirst).toBeDisabled();
  await expect(middleFirst).toHaveText("Lessons");
  await expect(rightFirst).toHaveText("Next");

  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeHidden();
  await headerMenu.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Main menu")).toBeVisible();
  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();

  await middleFirst.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByTestId("course-menu-progress-card")).toHaveClass(
    /fs-library-card-accent/
  );
  await expect(drawer.locator('[data-testid^="course-menu-module-"]').first()).toHaveClass(
    /fs-library-card/
  );
  const targetModuleButton = drawer
    .getByRole("button", { name: new RegExp(lastLesson.moduleTitle, "i") })
    .first();
  await targetModuleButton.click();
  const lastLessonButton = drawer
    .getByRole("button", {
      name: new RegExp(`^${escapeRegex(lastLesson.title)}(?:\\s|$)`, "i"),
    })
    .first();
  await expect(lastLessonButton).toBeVisible({ timeout: 15_000 });
  await lastLessonButton.click();
  await expect.poll(() => getActiveCourseLessonId(page), { timeout: 15_000 }).toBe(lastLesson.id);
  await expect(drawer).toBeHidden();
  await waitForCoursePageToSettle(page);

  const leftLast = page.getByTestId("course-nav-left");
  const rightLast = page.getByTestId("course-nav-right");

  await expect(leftLast).toHaveText("Previous", { timeout: 15_000 });
  await expect(rightLast).toBeVisible({ timeout: 15_000 });
  await expect(rightLast).toHaveText("Programs", { timeout: 15_000 });

  const rightTag = await rightLast.evaluate((el) => el.tagName);
  expect(rightTag).toBe("A");
});
