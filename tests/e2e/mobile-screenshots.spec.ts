import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { DEFAULT_LESSON_ID } from "../../app/course/courseData";
import { isMobileProject } from "./project-guards";

function screenshotPath(outputDir: string, fileName: string) {
  return join(outputDir, `${fileName}.png`);
}

async function waitForStableUi(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(350);
}

async function saveFullPage(page: Page, outputDir: string, fileName: string) {
  await page.screenshot({
    path: screenshotPath(outputDir, fileName),
    fullPage: true,
    animations: "disabled",
  });
}

function resolveOutputDir(testInfo: TestInfo) {
  return (
    process.env.SCREENSHOT_DIR ?? join("test-results", "mobile-screenshots", testInfo.project.name)
  );
}

test("capture mobile full-page screenshots for core app flow", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo), "Mobile screenshots are captured only on mobile projects.");

  const outputDir = resolveOutputDir(testInfo);
  mkdirSync(outputDir, { recursive: true });

  await page.goto("/");
  await waitForStableUi(page);
  await expect(page.getByRole("heading", { name: "Adult learner?" })).toBeVisible();
  await saveFullPage(page, outputDir, "01-home");

  await page.goto(`/course?lesson=${encodeURIComponent(DEFAULT_LESSON_ID)}`);
  await waitForStableUi(page);
  await expect(page.getByText(/Lesson 1 of \d+/)).toBeVisible();
  await saveFullPage(page, outputDir, "02-course");

  await page.getByTestId("course-nav-lessons").click();
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Course menu")).toBeVisible();
  await waitForStableUi(page);
  await saveFullPage(page, outputDir, "03-course-menu");

  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();
  await page.getByTestId("course-nav-left").click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Main menu")).toBeVisible();
  await waitForStableUi(page);
  await saveFullPage(page, outputDir, "04-main-menu");
  await drawer.getByRole("button", { name: "Close menu" }).click();
  await expect(drawer).toBeHidden();

  await page.goto("/programs");
  await waitForStableUi(page);
  await expect(page.getByRole("heading", { name: "Swim Programs", exact: true })).toBeVisible();
  await saveFullPage(page, outputDir, "05-programs");

  await page.goto("/analysis");
  await waitForStableUi(page);
  await expect(page.getByRole("heading", { name: "Video Analysis", exact: true })).toBeVisible();
  await saveFullPage(page, outputDir, "06-analysis");

  await page.goto("/our-method");
  await waitForStableUi(page);
  await expect(page.getByRole("heading", { name: "Our Method", exact: true })).toBeVisible();
  await saveFullPage(page, outputDir, "07-our-method");

  await page.goto("/contact");
  await waitForStableUi(page);
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await saveFullPage(page, outputDir, "08-contact");
});
