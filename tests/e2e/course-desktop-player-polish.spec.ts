import { expect, test, type Locator, type Page } from "@playwright/test";
import { isDesktopProject, isMobileProject } from "./project-guards";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

async function gotoCourse(page: Page) {
  await gotoWithTransientRetry(page, "/course", 60_000);
  await waitForRouteToSettle(page);
  await expect(page.getByTestId("course-page")).toBeVisible();
}

async function expectInFirstViewport(locator: Locator, viewportHeight: number) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, "element should have a visible bounding box").not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewportHeight - 8);
}

test("course desktop player pre-play state shows title, CTA, poster, and no guest progress console", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs on desktop profiles only.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  const backgroundApiRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/progress/course" || url.pathname === "/api/admin/notes") {
      backgroundApiRequests.push(`${request.method()} ${url.pathname}${url.search}`);
    }
  });

  await gotoCourse(page);
  await page.waitForTimeout(1_500);

  const viewportHeight = page.viewportSize()?.height ?? 900;
  const player = page.getByTestId("course-player-card");
  const playButton = page.getByRole("button", { name: /^Play lesson:/ });
  const title = page.getByTestId("course-video-title");
  const cta = page.getByTestId("course-video-play-cta");
  const poster = page.getByTestId("course-video-poster");
  const introBrandMark = page.getByTestId("course-intro-brand-mark").locator("img");

  await expect(player).toBeVisible();
  await expect(introBrandMark).toBeVisible();
  const introBrandMetrics = await introBrandMark.evaluate((img: HTMLImageElement) => {
    const box = img.getBoundingClientRect();
    return {
      naturalRatio: img.naturalWidth / img.naturalHeight,
      renderedRatio: box.width / box.height,
    };
  });
  expect(
    Math.abs(introBrandMetrics.renderedRatio - introBrandMetrics.naturalRatio),
    "intro brand mark should render without vertical or horizontal squeeze"
  ).toBeLessThan(0.05);
  await expectInFirstViewport(title, viewportHeight);
  await expectInFirstViewport(cta, viewportHeight);
  await expect(playButton).toBeVisible();
  await expect(poster).toBeVisible();
  await expect(poster).toHaveAttribute("src", /https:\/\/i\.ytimg\.com\/vi\/.+\/hqdefault\.jpg/);
  await expect(poster).toHaveAttribute("alt", "");
  await expect(poster).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByTestId("course-admin-edit-link")).toHaveCount(0);
  expect(backgroundApiRequests).toEqual([]);
  await page.getByRole("button", { name: "Overview details" }).click();
  await expect(page.getByText("Lesson and playback progress saved on this device.")).toHaveCount(0);
});

test("course mobile intro keeps the title on one line", async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo), "Runs on mobile profiles only.");
  test.skip(testInfo.project.name !== "mobile-chromium", "Runs once on mobile Chromium.");

  await gotoCourse(page);

  const heading = page.getByRole("heading", { name: "Free Course" }).first();
  await expect(heading).toBeVisible();
  const headingMetrics = await heading.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
    return {
      height: box.height,
      lineHeight,
    };
  });

  expect(
    headingMetrics.height,
    "course intro heading should not wrap on mobile"
  ).toBeLessThanOrEqual(headingMetrics.lineHeight * 1.25);
});

test("course mobile shows the player and lesson info before the progress overview", async ({
  page,
}, testInfo) => {
  test.skip(!isMobileProject(testInfo), "Runs on mobile profiles only.");
  test.skip(testInfo.project.name !== "mobile-chromium", "Runs once on mobile Chromium.");

  await gotoCourse(page);

  const player = page.getByTestId("course-player-card");
  const lessonInfo = page.getByTestId("course-lesson-info-strip");
  const overviewStatus = page.getByTestId("course-lesson-status-chip");

  await expect(player).toBeVisible();
  await expect(lessonInfo).toBeVisible();
  await expect(lessonInfo).toContainText("Lesson info");
  await expect(overviewStatus).toBeVisible();

  const playerBox = await player.boundingBox();
  const lessonInfoBox = await lessonInfo.boundingBox();
  const overviewBox = await overviewStatus.boundingBox();

  expect(playerBox?.y ?? 0).toBeLessThan(lessonInfoBox?.y ?? 0);
  expect(lessonInfoBox?.y ?? 0).toBeLessThan(overviewBox?.y ?? 0);
});
