import { expect, test, type Locator, type Page } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

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

async function collapseCommonMistakesToggle(page: Page, toggle: Locator) {
  await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 10_000 });

  const attempts: Array<() => Promise<void>> = [
    async () => {
      await toggle.evaluate((element) => {
        if (element instanceof HTMLElement) {
          element.click();
        }
      });
    },
    async () => {
      await toggle.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await toggle.dispatchEvent("click");
    },
    async () => {
      await toggle.focus();
      await page.keyboard.press("Space");
    },
  ];

  for (const attempt of attempts) {
    await attempt().catch(() => {});
    const isCollapsed = await expect
      .poll(() => toggle.evaluate((element) => element.getAttribute("aria-expanded")), {
        timeout: 1_500,
      })
      .toBe("false")
      .then(() => true)
      .catch(() => false);
    if (isCollapsed) {
      return;
    }
    if (!page.isClosed()) {
      await page.waitForTimeout(100);
    }
  }

  await expect(toggle).toHaveAttribute("aria-expanded", "false", { timeout: 5_000 });
}

test("common mistakes stays visible by default and persists per-lesson collapse locally", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.slow();

  await page.goto("/course?lesson=mod1-l1", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForCoursePageToSettle(page);

  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("fs_course_common_mistakes_expanded:")) {
        window.localStorage.removeItem(key);
      }
    }
  });

  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForCoursePageToSettle(page);

  const firstLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(firstLessonToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Trying to learn everything at once")).toBeVisible();

  await collapseCommonMistakesToggle(page, firstLessonToggle);
  await expect(firstLessonToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Expand to review common errors for this lesson.")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.entries(window.localStorage)
          .filter(([key]) => key.startsWith("fs_course_common_mistakes_expanded:"))
          .map(([, value]) => value)
      )
    )
    .toEqual(["0"]);

  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForCoursePageToSettle(page);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.entries(window.localStorage)
          .filter(([key]) => key.startsWith("fs_course_common_mistakes_expanded:"))
          .map(([, value]) => value)
      )
    )
    .toEqual(["0"]);

  await page.goto("/course?lesson=mod1-l2", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForCoursePageToSettle(page);

  const secondLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(secondLessonToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Getting lost")).toBeVisible();

  await page.goto("/course?lesson=mod1-l1", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForCoursePageToSettle(page);

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Object.entries(window.localStorage)
            .filter(([key]) => key.startsWith("fs_course_common_mistakes_expanded:"))
            .map(([, value]) => value)
        ),
      { timeout: 15_000 }
    )
    .toEqual(["0"]);
});
