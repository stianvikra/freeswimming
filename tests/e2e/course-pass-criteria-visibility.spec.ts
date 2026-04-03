import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

async function waitForStableChecklistCount(page: Page, checklist: Locator, minimumStableSamples = 3) {
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

test("course lesson pass criteria drive header and menu progress state", async ({ page }, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.goto("/course?lesson=mod1-l1");
  await page.waitForURL(/\/course\?lesson=intro-course--welcome-course-structure$/, {
    timeout: 15_000,
  });

  await expect(page.getByText("Pass criteria", { exact: true })).toBeVisible();
  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeVisible();
  await expect(page.getByTestId("course-pass-criteria-mark-done-button")).toBeDisabled();
  const criteriaCount = await waitForStableChecklistCount(page, checklist);
  expect(criteriaCount).toBeGreaterThan(0);
  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("Ready to start");

  await checklist.getByRole("checkbox").first().check();
  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("In progress");

  await page.getByRole("button", { name: "Open lessons" }).click();
  const navigationMenu = page.getByRole("dialog", { name: "Navigation menu" });
  const currentLessonRow = page.locator(
    '[data-testid^="course-menu-lesson-"][aria-current="page"]'
  );
  await expect(currentLessonRow).toContainText("Welcome & Course Structure");
  await expect(currentLessonRow).toContainText("In progress");
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(navigationMenu).toBeHidden();

  for (let index = 1; index < criteriaCount; index += 1) {
    await checklist.getByRole("checkbox").nth(index).check();
  }
  await page.getByTestId("course-pass-criteria-mark-done-button").click();

  await expect(page.getByTestId("course-lesson-status-chip")).toHaveText("Done");
  await page.getByRole("button", { name: "Open lessons" }).click();
  await expect(currentLessonRow).toContainText("Done");
});
