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
  support: true,
};

test("course lesson experience renders skeleton before support", async ({ page }, testInfo) => {
  test.skip(!isDesktopProject(testInfo), "Runs once on desktop profile.");
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

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
                id: "body-position--body-position-front",
                title: "Body Position on the Front",
                youtubeId: "Xh6OblO06LY",
                estMinutes: 4,
                lessonType: "drill",
                goal: "Learn to hold a long line face-down without lifting the head.",
                cues: ["Head neutral"],
                commonMistakes: ["Looking forward"],
                drill: {
                  title: "Front glide",
                  steps: ["Push off gently"],
                },
                nextStep: "Continue to side balance.",
                lessonExperience: {
                  variant: "water_drill",
                  display: fullLessonExperienceDisplay,
                  quickExplanation: "Keep the head quiet before adding distance.",
                  whyThisMatters:
                    "A quiet head helps the body float longer before breathing gets harder.",
                  landPractice: {
                    title: "Wall line rehearsal",
                    steps: ["Stand tall", "Breathe calmly"],
                  },
                  waterPractice: {
                    title: "Front glide + exhale",
                    steps: ["Push off", "Stop before tension"],
                    safetyNote: "Use shallow water.",
                  },
                  commonMistakes: [
                    { mistake: "Looking forward", fix: "Look down." },
                    "Losing balance",
                  ],
                  feelCues: ["Quiet head", "Easy bubbles"],
                  nextStep: "Try side balance.",
                  support: {
                    body: "Free lesson first, support after.",
                  },
                },
              },
              {
                id: "body-position--side-balance",
                title: "Side balance",
                youtubeId: "Xh6OblO06LY",
                estMinutes: 4,
                lessonType: "drill",
                goal: "Use the quiet head position to find balance on the side.",
                cues: ["Head still"],
                passCriteria: ["I can hold side balance calmly."],
                lessonExperience: {
                  variant: "water_drill",
                  display: {
                    ...fullLessonExperienceDisplay,
                    landPractice: false,
                    landSafetyNote: false,
                    waterPractice: false,
                    waterSafetyNote: false,
                    commonMistakes: false,
                    support: false,
                  },
                  quickExplanation: "Roll gently to the side while keeping the head quiet.",
                  whyThisMatters:
                    "Side balance connects the first floating position to later breathing work.",
                  feelCues: ["Head quiet", "Body long"],
                  nextStep: "Continue to breathing basics.",
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

  await page.goto("/course?lesson=body-position--body-position-front");

  const player = page.getByTestId("course-player-card");
  const lessonInfoStrip = page.getByTestId("course-lesson-info-strip");
  const lessonExperience = page.getByTestId("course-lesson-experience");
  await expect(page.getByTestId("course-lesson-quick-start")).toHaveCount(0);
  await expect(page.getByText("Lesson in 30 seconds")).toHaveCount(0);
  await expect(page.getByText("New field")).toHaveCount(0);
  await expect(player).toBeVisible();
  await expect(lessonInfoStrip).toBeVisible();
  await expect(lessonInfoStrip).toContainText("Lesson info");
  await expect(lessonInfoStrip).not.toContainText("Head neutral");
  await expect(lessonExperience).toContainText("Learn to hold a long line face-down");

  const playerBox = await player.boundingBox();
  const lessonInfoBox = await lessonInfoStrip.boundingBox();
  const lessonExperienceBox = await lessonExperience.boundingBox();
  expect(playerBox?.y ?? 0).toBeLessThan(lessonExperienceBox?.y ?? 0);
  expect(playerBox?.y ?? 0).toBeLessThan(lessonInfoBox?.y ?? 0);
  expect(lessonInfoBox?.y ?? 0).toBeLessThan(lessonExperienceBox?.y ?? 0);

  await expect(lessonExperience).toContainText("Dryland practice");
  await expect(page.getByTestId("course-lesson-why-this-matters")).toContainText(
    "A quiet head helps the body float longer"
  );
  await expect(page.getByText("Wall line rehearsal")).toBeVisible();
  await expect(page.getByTestId("course-practice-land-media")).toBeVisible();
  await expect(page.getByTestId("course-practice-land-media")).toContainText("Visual coming soon");
  await expect(lessonExperience).toContainText("Pool drill");
  await expect(page.getByTestId("course-practice-water-media")).toBeVisible();
  await expect(page.getByTestId("course-practice-water-media")).toContainText("Visual coming soon");
  await expect(page.getByText("Use shallow water.")).toBeVisible();
  await expect(page.getByText("Correction").first()).toBeVisible();
  const mistakeRow = page.getByTestId("course-common-mistake-row").filter({
    hasText: "Looking forward",
  });
  await expect(mistakeRow).toContainText("Look down.");
  const mistakeOnlyRow = page.getByTestId("course-common-mistake-row").filter({
    hasText: "Losing balance",
  });
  await expect(mistakeOnlyRow).toContainText("Correction not added yet");
  await expect(lessonExperience).not.toContainText("One cue");
  await expect(lessonExperience).toContainText("What good looks and feels like");
  await expect(lessonExperience.getByText("Quiet head", { exact: true })).toBeVisible();
  await expect(page.getByTestId("course-next-lesson-preview-visual")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Side balance" })).toBeVisible();
  await expect(
    page.getByText("Use the quiet head position to find balance on the side.")
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Need extra help?" })).toBeVisible();
  await expect(page.getByText("Free lesson first, support after.")).toBeVisible();

  const waterBox = await page.getByText("Pool drill", { exact: true }).boundingBox();
  const whyBox = await page.getByText("Why this matters", { exact: true }).boundingBox();
  const landBox = await page.getByText("Dryland practice", { exact: true }).boundingBox();
  const feelBox = await page
    .getByText("What good looks and feels like", { exact: true })
    .boundingBox();
  const mistakesBox = await page.getByText("Common mistakes", { exact: true }).boundingBox();
  expect(whyBox?.y ?? 0).toBeLessThan(landBox?.y ?? 0);
  expect(landBox?.y ?? 0).toBeLessThan(waterBox?.y ?? 0);
  expect(waterBox?.y ?? 0).toBeLessThan(feelBox?.y ?? 0);
  expect(feelBox?.y ?? 0).toBeLessThan(mistakesBox?.y ?? 0);
});

test("course lesson experience hides inactive containers for concept lessons", async ({
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
        modules: [
          {
            id: "intro-course",
            title: "Introduction",
            subtitle: "Start here",
            lessons: [
              {
                id: "intro-course--how-to-use-course",
                title: "How to Use the Course",
                youtubeId: "Xh6OblO06LY",
                estMinutes: 3,
                lessonType: "learn",
                goal: "Understand how to move through the course without rushing.",
                lessonExperience: {
                  variant: "concept",
                  display: {
                    quickExplanation: true,
                    whyThisMatters: true,
                    landPractice: false,
                    landSafetyNote: true,
                    waterPractice: false,
                    waterSafetyNote: true,
                    feelCues: true,
                    commonMistakes: false,
                    nextStep: true,
                    support: false,
                  },
                  quickExplanation: "Watch the lesson, then choose one small action.",
                  whyThisMatters:
                    "Intro lessons should explain the system without asking for a pool drill.",
                  landPractice: {
                    title: "Preserved draft practice",
                    steps: ["This should not render"],
                  },
                  waterPractice: {
                    title: "Preserved draft water practice",
                    steps: ["This should not render"],
                  },
                  commonMistakes: [{ mistake: "Rushing", fix: "Take one lesson at a time." }],
                  feelCues: ["Calm start"],
                  nextStep: "Open the first water drill when ready.",
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

  await page.goto("/course?lesson=intro-course--how-to-use-course");

  const lessonExperience = page.getByTestId("course-lesson-experience");
  await expect(lessonExperience).toBeVisible();
  await expect(lessonExperience).toContainText("Watch the lesson, then choose one small action.");
  await expect(page.getByTestId("course-lesson-why-this-matters")).toContainText(
    "Intro lessons should explain the system"
  );
  await expect(lessonExperience).not.toContainText("Key reminder");
  await expect(lessonExperience).not.toContainText("What this should feel like in the water.");
  await expect(lessonExperience).toContainText("What good looks and feels like");
  await expect(lessonExperience).toContainText(
    "Use these points to check whether the movement feels right."
  );
  await expect(lessonExperience.getByText("Calm start", { exact: true })).toBeVisible();
  await expect(page.getByText("Open the first water drill when ready.")).toBeVisible();
  await expect(lessonExperience).not.toContainText("Dryland practice");
  await expect(lessonExperience).not.toContainText("Pool drill");
  await expect(lessonExperience).not.toContainText("Common mistakes");
  await expect(lessonExperience).not.toContainText("Need extra help?");
  await expect(page.getByText("Visual not added yet")).toHaveCount(0);
});
