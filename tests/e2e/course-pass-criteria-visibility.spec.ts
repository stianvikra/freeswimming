import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

async function waitForStableChecklistCount(
  page: Page,
  checklist: Locator,
  minimumStableSamples = 3
) {
  let lastCount = -1;
  let stableSamples = 0;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const nextCount = await checklist.getByRole("checkbox").count();
    if (nextCount > 0 && nextCount === lastCount) {
      stableSamples += 1;
    } else {
      stableSamples = nextCount > 0 ? 1 : 0;
      lastCount = nextCount;
    }

    if (stableSamples >= minimumStableSamples) {
      return nextCount;
    }

    await page.waitForTimeout(250);
  }

  throw new Error("Course pass-criteria checklist did not stabilize in time.");
}

test("course lesson pass criteria drive header and menu progress state", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.goto("/course?lesson=mod1-l1");
  await page.waitForURL(
    /\/en\/course\/course-module-introduction-to-the-course\/course-lesson-introduction-to-the-course-welcome-course-structure$/,
    {
      timeout: 15_000,
    }
  );

  await expect(page.getByText("Pass criteria", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading pass criteria...")).toHaveCount(0);
  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeVisible();
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeDisabled();
  const criteriaCount = await waitForStableChecklistCount(page, checklist);
  expect(criteriaCount).toBeGreaterThan(0);
  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("Not started");

  await checklist.getByRole("checkbox").first().check();
  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("In progress");

  const desktopOutline = page.getByTestId("course-desktop-outline");
  await expect(desktopOutline).toBeVisible();
  await expect(desktopOutline.getByRole("button", { name: /Module 2/i })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  const currentLessonRow = page.locator(
    '[data-testid^="course-outline-lesson-"][aria-current="page"]'
  );
  await expect(currentLessonRow).toContainText("Welcome & Course Structure");
  await expect(currentLessonRow).toContainText("In progress");
  await expect(currentLessonRow).toHaveAttribute("aria-label", /In progress/);

  for (let index = 1; index < criteriaCount; index += 1) {
    await checklist.getByRole("checkbox").nth(index).check();
  }
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeEnabled();
  await expect(page.getByTestId("course-pass-criteria-help")).toContainText(
    "All pass criteria are checked."
  );
  await page.getByTestId("course-pass-criteria-mark-done-button").click();

  await expect(page.getByTestId("course-lesson-status-chip")).toHaveCount(0);
  await expect(page.getByTestId("course-mark-done-button")).toHaveAccessibleName("Done");
  await expect(page.getByTestId("course-mark-done-button")).toHaveAttribute(
    "aria-describedby",
    "course-done-gate-feedback"
  );
  const overviewDoneHelp = page.locator("#course-done-gate-feedback");
  await expect(overviewDoneHelp).toHaveText(
    "Lesson is done. Press Done again to return it to In progress."
  );
  await expect(overviewDoneHelp).toHaveClass(/sr-only/);
  await expect(page.getByTestId("course-pass-criteria-help")).toContainText(
    "Click Done again to return this lesson to In progress while keeping your checked criteria."
  );
  await expect(currentLessonRow).toContainText("Done");
  await expect(currentLessonRow).toHaveAttribute("aria-label", /Done/);

  await page.getByTestId("course-mark-done-button").click();
  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("Ready to complete");
  await expect(page.getByTestId("course-mark-done-button")).toHaveAccessibleName("Mark as done");
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeEnabled();

  const restoredChecklist = page.getByTestId("course-done-gate-checklist");
  await expect(restoredChecklist).toBeVisible();
  const restoredCheckboxes = restoredChecklist.getByRole("checkbox");
  await expect(restoredCheckboxes).toHaveCount(criteriaCount);
  for (let index = 0; index < criteriaCount; index += 1) {
    await expect(restoredCheckboxes.nth(index)).toBeChecked();
  }
});
