import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Workout builder e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

async function waitForWorkoutBuilderClientReady(page: Page) {
  await expect(page.getByTestId("workout-builder-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    { timeout: 15_000 }
  );
}

test.describe("my library workout builder", () => {
  test("creates a manual starter workout and saves canonical edits", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    const uniqueTitle = `QA manual workout ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await page.getByTestId("my-library-create-manual-workout").click();
    await createResponsePromise;
    await page.waitForURL(/\/my-library\/workouts\/[0-9a-f-]+$/, {
      timeout: 10_000,
      waitUntil: "domcontentloaded",
    });
    await waitForWorkoutBuilderClientReady(page);

    await expect(page.getByTestId("session-draft-title")).toHaveValue("Manual pool workout");
    await expect(page.getByTestId("session-draft-step-name-0")).toHaveValue("Warmup swim");
    await expect(page.getByTestId("session-draft-step-name-1")).toHaveValue("Reset rest");
    await expect(page.getByTestId("session-draft-step-name-2")).toHaveValue("Main swim set");

    await page.getByTestId("session-draft-add-step").click();
    await page.getByTestId("session-draft-step-name-5").fill("QA add-on step");
    await page.getByTestId("session-draft-title").fill(uniqueTitle);

    const patchResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/my-library\/workouts\/[0-9a-f-]+$/.test(response.url()) &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    );

    await page.getByTestId("workout-builder-save").click();
    await patchResponsePromise;

    await expect(page.getByText("Workout changes saved to the canonical workout.")).toBeVisible();
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);
    await expect(page.getByTestId("session-draft-step-name-5")).toHaveValue("QA add-on step");
  });
});
