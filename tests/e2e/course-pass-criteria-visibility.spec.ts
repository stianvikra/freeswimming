import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

test("learn lessons show pass criteria by default unless hidden", async ({ page }, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.goto("/course?lesson=mod1-l1");

  await expect(page.getByText("Pass criteria", { exact: true })).toBeVisible();
  await expect(page.getByTestId("course-done-gate-checklist")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark as done" })).toBeDisabled();
});
