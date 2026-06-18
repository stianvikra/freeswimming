import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

const fullLessonExperienceDisplay = {
  quickExplanation: true,
  whyThisMatters: true,
  landPractice: true,
  landSafetyNote: true,
  waterPractice: true,
  waterSafetyNote: true,
  feelCues: true,
  commonMistakes: true,
  nextStep: true,
  support: false,
};

test("common mistakes render as visible Coach check content without local collapse state", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  await page.addInitScript(() => {
    window.localStorage.setItem("fs_course_common_mistakes_expanded:body-position--front", "0");
  });

  await page.route("**/api/course/content*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        modules: [
          {
            id: "body-position",
            title: "Body Position",
            subtitle: "Build the line",
            lessons: [
              {
                id: "body-position--front",
                title: "Body Position on the Front",
                youtubeId: "Xh6OblO06LY",
                estMinutes: 4,
                lessonType: "drill",
                goal: "Learn to hold a long line face-down without lifting the head.",
                cues: ["Head quiet", "Easy bubbles"],
                commonMistakes: ["Looking forward"],
                drill: {
                  title: "Front glide",
                  steps: ["Push off gently"],
                },
                lessonExperience: {
                  variant: "water_drill",
                  display: fullLessonExperienceDisplay,
                  quickExplanation: "Keep the head quiet before adding distance.",
                  waterPractice: {
                    title: "Front glide + exhale",
                    steps: ["Push off", "Stop before tension"],
                  },
                  commonMistakes: [
                    { mistake: "Looking forward", fix: "Look down." },
                    { mistake: "Holding breath", fix: "Let small bubbles out." },
                  ],
                  feelCues: ["Quiet head", "Soft neck", "Easy bubbles"],
                  nextStep: "Try side balance.",
                },
              },
            ],
          },
        ],
        preview: {
          enabled: false,
          mode: "published",
        },
      }),
    });
  });

  await page.goto("/course?preview=1&lesson=body-position--front");

  const coachCheck = page.getByTestId("course-coach-check");
  await expect(coachCheck).toBeVisible();
  await expect(
    coachCheck.getByRole("heading", { name: "What good looks and feels like" })
  ).toBeVisible();
  await expect(coachCheck).toContainText("Check these against how you feel in the water.");
  await expect(coachCheck.getByRole("heading", { name: "Common mistakes" })).toBeVisible();
  await expect(coachCheck.getByText("Coach check", { exact: true })).toHaveCount(0);
  await expect(coachCheck.getByText("Catch it early, then switch cues.")).toHaveCount(0);

  const quietCueBox = await coachCheck.getByText("Quiet head", { exact: true }).boundingBox();
  const softCueBox = await coachCheck.getByText("Soft neck", { exact: true }).boundingBox();
  const easyCueBox = await coachCheck.getByText("Easy bubbles", { exact: true }).boundingBox();
  expect(quietCueBox).not.toBeNull();
  expect(softCueBox).not.toBeNull();
  expect(easyCueBox).not.toBeNull();
  expect(softCueBox!.y).toBeGreaterThan(quietCueBox!.y);
  expect(easyCueBox!.y).toBeGreaterThan(softCueBox!.y);

  await expect(coachCheck.getByText("Avoid", { exact: true })).toHaveCount(1);
  await expect(coachCheck.getByText("Do this", { exact: true })).toHaveCount(1);
  await expect(page.getByTestId("course-common-mistake-row")).toHaveCount(2);
  const firstMistakeRow = page.getByTestId("course-common-mistake-row").first();
  const firstFixBox = await firstMistakeRow.getByText("Look down.").boundingBox();
  const firstAvoidBox = await firstMistakeRow.getByText("Looking forward").boundingBox();
  expect(firstFixBox).not.toBeNull();
  expect(firstAvoidBox).not.toBeNull();
  expect(firstFixBox!.x).toBeLessThan(firstAvoidBox!.x);
  await expect(page.getByText("Looking forward")).toBeVisible();
  await expect(page.getByText("Look down.")).toBeVisible();

  await expect(page.getByRole("button", { name: /Common mistakes/i })).toHaveCount(0);
  await expect(page.getByText("Expand to review common errors for this lesson.")).toHaveCount(0);
});
