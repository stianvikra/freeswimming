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

async function waitForWorkoutBuilderSaveReady(page: Page) {
  const schemaWarning = page.getByText(
    "Canonical workout save is still syncing in this environment."
  );
  const saveButton = page.getByTestId("workout-builder-save");

  if ((await schemaWarning.count()) > 0 && (await schemaWarning.first().isVisible())) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForWorkoutBuilderClientReady(page);
  }

  await expect(saveButton).toBeVisible({ timeout: 15_000 });
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
    await waitForWorkoutBuilderSaveReady(page);

    await expect(page.getByTestId("session-draft-title")).toHaveValue("Manual pool workout");
    await expect(page.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    await expect(page.getByTestId("session-draft-step-name-0")).toHaveCount(0);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All builder changes are saved to the canonical workout."
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();

    await page.getByTestId("session-draft-step-remove-0").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toContainText(
      "Remove Warmup swim?"
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();
    await page.getByTestId("workout-editor-removal-cancel-button").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toHaveCount(0);
    await page.getByTestId("session-draft-step-remove-0").click();
    await page.getByTestId("workout-editor-removal-confirm-button").click();
    await expect(page.getByTestId("workout-editor-removal-undo")).toContainText(
      "Removed Warmup swim."
    );
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this workout."
    );
    await page.getByTestId("workout-editor-removal-undo-button").click();
    await expect(page.getByTestId("workout-editor-removal-undo")).toHaveCount(0);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All builder changes are saved to the canonical workout."
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();

    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-name-0")).toHaveValue("Warmup swim");
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-name-0")).toHaveCount(0);

    await page.getByTestId("session-draft-pool-length-input").fill("33.33");
    await page.getByTestId("session-draft-step-toggle-0").click();
    await page.getByTestId("session-draft-step-distance-0").selectOption("custom");
    await page.getByTestId("session-draft-step-distance-custom-0").fill("333");
    await page.getByTestId("session-draft-add-repeat").click();
    await page.getByTestId("session-draft-repeat-count-5").fill("6");
    await page.getByTestId("session-draft-step-name-5").fill("Repeat swim focus");
    await page.getByTestId("session-draft-step-distance-5").selectOption("200");
    await page.getByTestId("session-draft-step-stroke-5").selectOption("backstroke");
    await page.getByTestId("session-draft-step-drill-type-5").selectOption("pull");
    await page.getByTestId("session-draft-step-equipment-5").selectOption("fins");
    await page.getByTestId("session-draft-step-target-mode-5").selectOption("target_pace");
    await page.getByTestId("session-draft-step-target-pace-minutes-5").fill("1");
    await page.getByTestId("session-draft-step-target-pace-seconds-5").fill("35");
    await page.getByTestId("session-draft-step-toggle-6").click();
    await page.getByTestId("session-draft-step-duration-mode-6").selectOption("send_off");
    await page.getByTestId("session-draft-step-sendoff-minutes-6").fill("2");
    await page.getByTestId("session-draft-step-sendoff-seconds-6").fill("00");
    await page.getByTestId("session-draft-repeat-duplicate-5").click();
    await expect(page.getByTestId("session-draft-repeat-count-6")).toHaveValue("6");
    await page.getByTestId("session-draft-repeat-count-6").fill("3");
    await page.getByTestId("session-draft-step-name-7").fill("Repeat swim copy focus");
    await page.getByTestId("session-draft-add-step").click();
    await page.getByTestId("session-draft-step-name-9").fill("QA CSS send-off reset");
    await page.getByTestId("session-draft-step-duration-mode-9").selectOption("css_send_off");
    await page.getByTestId("session-draft-step-stroke-9").selectOption("reverse_im_order");
    await page.getByTestId("session-draft-step-css-sendoff-offset-9").selectOption("2");
    await page.getByTestId("session-draft-step-target-mode-9").selectOption("none");
    await page.getByTestId("session-draft-title").fill(uniqueTitle);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this workout."
    );
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    const patchResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/my-library\/workouts\/[0-9a-f-]+$/.test(response.url()) &&
        response.request().method() === "PATCH"
    );

    await page.getByTestId("workout-builder-save").click();
    const patchResponse = await patchResponsePromise;
    const patchPayload = (await patchResponse.json().catch(() => null)) as { ok?: boolean } | null;

    expect(patchResponse.status()).toBe(200);
    expect(patchPayload?.ok).toBe(true);

    await expect(page.getByText("Workout changes saved to the canonical workout.")).toBeVisible();
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All builder changes are saved to the canonical workout."
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);
    await expect(page.getByTestId("session-draft-pool-length-input")).toHaveValue("33.33");
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-distance-0")).toHaveValue("custom");
    await expect(page.getByTestId("session-draft-step-distance-custom-0")).toHaveValue("333");
    await expect(page.getByTestId("session-draft-repeat-count-5")).toHaveValue("6");
    await expect(page.getByTestId("session-draft-repeat-count-6")).toHaveValue("3");
    await page.getByTestId("session-draft-step-toggle-5").click();
    await expect(page.getByTestId("session-draft-step-name-5")).toHaveValue("Repeat swim focus");
    await expect(page.getByTestId("session-draft-step-distance-5")).toHaveValue("200");
    await expect(page.getByTestId("session-draft-step-stroke-5")).toHaveValue("backstroke");
    await expect(page.getByTestId("session-draft-step-drill-type-5")).toHaveValue("pull");
    await expect(page.getByTestId("session-draft-step-equipment-5")).toHaveValue("fins");
    await expect(page.getByTestId("session-draft-step-target-mode-5")).toHaveValue("target_pace");
    await expect(page.getByTestId("session-draft-step-target-pace-minutes-5")).toHaveValue("1");
    await expect(page.getByTestId("session-draft-step-target-pace-seconds-5")).toHaveValue("35");
    await page.getByTestId("session-draft-step-toggle-7").click();
    await expect(page.getByTestId("session-draft-step-name-7")).toHaveValue(
      "Repeat swim copy focus"
    );
    await expect(page.getByTestId("session-draft-step-distance-7")).toHaveValue("200");
    await page.getByTestId("session-draft-step-toggle-6").click();
    await expect(page.getByTestId("session-draft-step-duration-mode-6")).toHaveValue("send_off");
    await expect(page.getByTestId("session-draft-step-sendoff-minutes-6")).toHaveValue("2");
    await expect(page.getByTestId("session-draft-step-sendoff-seconds-6")).toHaveValue("00");
    await page.getByTestId("session-draft-step-toggle-9").click();
    await expect(page.getByTestId("session-draft-step-name-9")).toHaveValue(
      "QA CSS send-off reset"
    );
    await expect(page.getByTestId("session-draft-step-stroke-9")).toHaveValue("reverse_im_order");
    await expect(page.getByTestId("session-draft-step-duration-mode-9")).toHaveValue(
      "css_send_off"
    );
    await expect(page.getByTestId("session-draft-step-css-sendoff-offset-9")).toHaveValue("2");
    await expect(page.getByTestId("session-draft-step-target-mode-9")).toHaveValue("none");
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
