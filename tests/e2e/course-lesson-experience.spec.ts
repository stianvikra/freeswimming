import { expect, test } from "@playwright/test";
import { isDesktopProject } from "./project-guards";

const fullLessonExperienceDisplay = {
  quickExplanation: true,
  whyThisMatters: true,
  landPractice: true,
  waterPractice: true,
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
  const lessonExperience = page.getByTestId("course-lesson-experience");
  await expect(page.getByTestId("course-lesson-quick-start")).toHaveCount(0);
  await expect(page.getByText("Lesson in 30 seconds")).toHaveCount(0);
  await expect(page.getByText("New field")).toHaveCount(0);
  await expect(player).toBeVisible();
  await expect(lessonExperience).toContainText("Learn to hold a long line face-down");

  const playerBox = await player.boundingBox();
  const lessonExperienceBox = await lessonExperience.boundingBox();
  expect(playerBox?.y ?? 0).toBeLessThan(lessonExperienceBox?.y ?? 0);

  await expect(lessonExperience).toContainText("Land practice");
  await expect(lessonExperience).toContainText("Dryland prep");
  await expect(page.getByTestId("course-lesson-why-this-matters")).toContainText(
    "A quiet head helps the body float longer"
  );
  await expect(page.getByText("Wall line rehearsal")).toBeVisible();
  await expect(page.getByTestId("course-practice-land-media")).toContainText(
    "Visual not added yet"
  );
  await expect(lessonExperience).toContainText("Water practice");
  await expect(page.getByTestId("course-practice-water-media")).toContainText(
    "Visual not added yet"
  );
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
  await expect(lessonExperience).toContainText("One cue");
  await expect(lessonExperience.getByText("Quiet head", { exact: true })).toBeVisible();
  await expect(page.getByText("Try side balance.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Need extra help?" })).toBeVisible();
  await expect(page.getByText("Free lesson first, support after.")).toBeVisible();

  const waterBox = await page.getByText("Water practice", { exact: true }).boundingBox();
  const whyBox = await page.getByText("Why this matters", { exact: true }).boundingBox();
  const landBox = await page.getByText("Land practice", { exact: true }).boundingBox();
  const feelBox = await page.getByText("Feel cues", { exact: true }).boundingBox();
  const mistakesBox = await page.getByRole("button", { name: /Common mistakes/i }).boundingBox();
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
                    waterPractice: false,
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
  await expect(lessonExperience).toContainText("Use this as the lesson's one reminder.");
  await expect(lessonExperience).not.toContainText(
    "Use these immediately after the water practice."
  );
  await expect(lessonExperience.getByText("Calm start", { exact: true })).toBeVisible();
  await expect(page.getByText("Open the first water drill when ready.")).toBeVisible();
  await expect(lessonExperience).not.toContainText("Land practice");
  await expect(lessonExperience).not.toContainText("Water practice");
  await expect(lessonExperience).not.toContainText("Common mistakes");
  await expect(lessonExperience).not.toContainText("Need extra help?");
  await expect(page.getByText("Visual not added yet")).toHaveCount(0);
});
