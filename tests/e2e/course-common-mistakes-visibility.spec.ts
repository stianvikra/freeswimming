import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

test("common mistakes stays visible by default and remembers per-lesson collapse locally", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.goto("/course?lesson=mod1-l1");

  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("fs_course_common_mistakes_expanded:")) {
        window.localStorage.removeItem(key);
      }
    }
  });

  await page.reload();

  const firstLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(firstLessonToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Trying to learn everything at once")).toBeVisible();

  await firstLessonToggle.click();
  await expect(firstLessonToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Expand to review common errors for this lesson.")).toBeVisible();

  await page.reload();

  const reloadedFirstLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(reloadedFirstLessonToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Expand to review common errors for this lesson.")).toBeVisible();

  await page.goto("/course?lesson=mod1-l2");

  const secondLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(secondLessonToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Getting lost")).toBeVisible();

  await page.goto("/course?lesson=mod1-l1");

  const revisitedFirstLessonToggle = page.getByRole("button", { name: /Common mistakes/i }).first();
  await expect(revisitedFirstLessonToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Expand to review common errors for this lesson.")).toBeVisible();
});
