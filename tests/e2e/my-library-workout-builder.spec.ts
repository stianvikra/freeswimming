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

    await page.getByTestId("session-draft-add-repeat").click();
    await page.getByTestId("session-draft-repeat-count-5").fill("6");
    await page.getByTestId("session-draft-step-name-5").fill("Repeat swim focus");
    await page.getByTestId("session-draft-step-stroke-5").selectOption("backstroke");
    await page.getByTestId("session-draft-step-drill-type-5").selectOption("pull");
    await page.getByTestId("session-draft-step-equipment-5").selectOption("fins");
    await page.getByTestId("session-draft-step-target-mode-5").selectOption("target_pace");
    await page.getByTestId("session-draft-step-target-pace-minutes-5").fill("1");
    await page.getByTestId("session-draft-step-target-pace-seconds-5").fill("35");
    await page.getByTestId("session-draft-step-time-6").fill("0.5");
    await page.getByTestId("session-draft-add-step").click();
    await page.getByTestId("session-draft-step-name-7").fill("QA open reset");
    await page.getByTestId("session-draft-step-duration-mode-7").selectOption("lap_button");
    await page.getByTestId("session-draft-step-target-mode-7").selectOption("none");
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
    await expect(page.getByTestId("session-draft-repeat-count-5")).toHaveValue("6");
    await expect(page.getByTestId("session-draft-step-name-5")).toHaveValue("Repeat swim focus");
    await expect(page.getByTestId("session-draft-step-stroke-5")).toHaveValue("backstroke");
    await expect(page.getByTestId("session-draft-step-drill-type-5")).toHaveValue("pull");
    await expect(page.getByTestId("session-draft-step-equipment-5")).toHaveValue("fins");
    await expect(page.getByTestId("session-draft-step-target-mode-5")).toHaveValue("target_pace");
    await expect(page.getByTestId("session-draft-step-target-pace-minutes-5")).toHaveValue("1");
    await expect(page.getByTestId("session-draft-step-target-pace-seconds-5")).toHaveValue("35");
    await expect(page.getByTestId("session-draft-step-time-6")).toHaveValue("0.5");
    await expect(page.getByTestId("session-draft-step-name-7")).toHaveValue("QA open reset");
    await expect(page.getByTestId("session-draft-step-duration-mode-7")).toHaveValue("lap_button");
    await expect(page.getByTestId("session-draft-step-target-mode-7")).toHaveValue("none");
    await expect(
      page.locator("fieldset").filter({ hasText: "Session strokes" }).getByRole("checkbox", {
        name: "Backstroke",
      })
    ).toBeChecked();
    await expect(
      page.locator("fieldset").filter({ hasText: "Equipment" }).getByRole("checkbox", {
        name: "Fins",
      })
    ).toBeChecked();
  });
});
