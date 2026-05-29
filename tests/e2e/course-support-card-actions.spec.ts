import { expect, test } from "@playwright/test";
import { isDesktopProject, isMobileProject } from "./project-guards";

function buildDeterministicCourseModules(lessonOverrides: Record<string, unknown> = {}) {
  return [
    {
      id: "mod1",
      title: "Module 1",
      subtitle: "Deterministic e2e fixture",
      lessons: [
        {
          id: "mod1-l1",
          title: "Fixture lesson",
          youtubeId: "Xh6OblO06LY",
          estMinutes: 3,
          lessonType: "learn",
          goal: "Fixture goal",
          cues: ["Fixture cue"],
          commonMistakes: ["Fixture mistake"],
          drill: {
            title: "Fixture drill",
            steps: ["Fixture step 1", "Fixture step 2"],
          },
          nextStep: "Fixture next step",
          ...lessonOverrides,
        },
      ],
    },
  ];
}

test("course support card defaults to video analysis and poolside actions", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.route("**/api/course/content*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        modules: buildDeterministicCourseModules(),
        preview: {
          enabled: false,
          mode: "published",
        },
      }),
    });
  });

  await page.goto("/course?lesson=mod1-l1");

  await expect(page.getByTestId("course-support-card")).toHaveClass(/fs-library-card/);
  await expect(page.getByRole("heading", { name: "Need extra help?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Video Analysis (Optional)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Poolside Guide" })).toBeVisible();
  await expect(page.getByTestId("course-support-action-videoAnalysis")).toHaveClass(
    /fs-cta-secondary/
  );
  await expect(page.getByTestId("course-support-action-poolsideGuide")).toHaveClass(
    /fs-cta-secondary/
  );
  await expect(page.getByRole("link", { name: "0-1000 Guide" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Contact us" })).toHaveCount(0);
  await expect(page.getByTestId("course-open-on-phone-card")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-qr")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-share")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-copy")).toBeVisible();
});

test("course support card honors configured primary support action", async ({ page }, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.route("**/api/course/content*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        modules: buildDeterministicCourseModules({
          supportCard: {
            actions: {
              videoAnalysis: true,
              poolsideGuide: true,
              guide0To1000: false,
              contact: false,
            },
            primaryAction: "videoAnalysis",
          },
        }),
        preview: {
          enabled: false,
          mode: "published",
        },
      }),
    });
  });

  await page.goto("/course?lesson=mod1-l1");

  await expect(page.getByTestId("course-support-action-videoAnalysis")).toHaveClass(
    /fs-cta-primary/
  );
  await expect(page.getByTestId("course-support-action-poolsideGuide")).toHaveClass(
    /fs-cta-secondary/
  );
});

test("course support card hides static QR on mobile and keeps share actions", async ({
  page,
}, testInfo) => {
  test.skip(!isMobileProject(testInfo), "Runs once on mobile profile.");
  test.skip(testInfo.project.name !== "mobile-chromium", "Runs once on mobile Chromium.");
  test.slow();

  await page.route("**/api/course/content*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        modules: buildDeterministicCourseModules(),
        preview: {
          enabled: false,
          mode: "published",
        },
      }),
    });
  });

  await page.goto("/course?lesson=mod1-l1");

  await expect(page.getByTestId("course-support-card")).toHaveClass(/fs-library-card/);
  await expect(page.getByTestId("course-open-on-phone-card")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-share")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-copy")).toBeVisible();
  await expect(page.getByTestId("course-open-on-phone-qr")).not.toBeVisible();
});
