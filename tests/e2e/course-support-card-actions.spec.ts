import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

test("course support card defaults to video analysis and poolside actions", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.goto("/course?lesson=mod1-l1");

  await expect(page.getByRole("heading", { name: "Need extra help?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Video Analysis (Optional)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Poolside Guide" })).toBeVisible();
  await expect(page.getByRole("link", { name: "0-1000 Guide" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Contact us" })).toHaveCount(0);
});
