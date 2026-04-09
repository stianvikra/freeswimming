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

async function openSupportToolsPanel(page: Page) {
  const toggle = page.getByTestId("workout-editor-support-tools-toggle");

  if ((await toggle.count()) === 0) {
    return;
  }

  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }
}

async function openMetadataPanelIfCollapsed(page: Page) {
  const toggle = page.getByTestId("workout-editor-metadata-toggle");
  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }
}

async function triggerCreateSession(page: Page, testId: string) {
  await page.getByTestId(testId).click();
  const startScratchButton = page.getByTestId(`${testId}-start-scratch`);
  const chooserVisible = await startScratchButton.isVisible({ timeout: 1_500 }).catch(() => false);

  if (chooserVisible) {
    await startScratchButton.click();
  }
}

test.describe("my library workout builder", () => {
  test("creates a clean new swim session and saves canonical edits", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    const uniqueTitle = `QA manual workout ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("link", { name: "Jump to owned items" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Jump to explore section" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Program builder preview" })).toBeVisible();

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await createResponsePromise;
    await expect(page).toHaveURL(/\/my-library\/workouts\/[0-9a-f-]+(?:\?entry=manual-pool)?$/, {
      timeout: 20_000,
    });
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);

    await expect(page.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.getByTestId("workout-builder-delete-current-workout")).toHaveText(
      "Delete session"
    );
    await expect(page.getByRole("link", { name: "My Swim Sessions" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AI-generated session" })).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-create-pool")).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-create-open-water")).toHaveCount(0);
    await expect(page.getByTestId("session-draft-title")).toBeVisible();
    await expect(page.getByText("Pool Swim")).toBeVisible();
    await expect(page.getByText("Session note")).toBeVisible();
    await expect(page.getByText("Pool Size", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unspecified" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Environment" })).toHaveCount(0);
    await expect(page.getByText("Training profile")).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Session strokes" })).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Equipment" })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Session type" })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Effort" })).toHaveCount(0);
    await expect(page.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(
      page.getByTestId("workout-editor-panel").getByRole("heading", { name: "Session builder" })
    ).toBeVisible();
    await expect(page.getByLabel("Step Type")).toBeVisible();
    await expect(page.getByLabel("Stroke Type")).toBeVisible();
    await expect(page.getByLabel("Drill Type")).toBeVisible();
    await expect(page.getByLabel("Duration")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Target" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Notes" })).toBeVisible();
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Distance"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Lap Button Press"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).not.toContainText(
      "Fixed Rest Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).not.toContainText(
      "Send-Off Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).not.toContainText(
      "CSS-Based Send-Off Time"
    );
    await expect(page.locator("label").filter({ hasText: /^Step name$/ })).toHaveCount(0);
    await expect(page.locator("label").filter({ hasText: /^Effort cue$/ })).toHaveCount(0);
    await expect(page.locator("label").filter({ hasText: /^Target summary$/ })).toHaveCount(0);
    await expect(page.locator("label").filter({ hasText: /^Target notes$/ })).toHaveCount(0);
    await page.getByLabel("Step Type").selectOption("rest");
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toHaveValue(
      "fixed_rest"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Fixed Rest Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Send-Off Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "CSS-Based Send-Off Time"
    );
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText(
      "Lap Button Press"
    );
    const restDurationOptions = page
      .getByTestId("session-draft-step-duration-mode-0")
      .locator("option");
    await expect(restDurationOptions.filter({ hasText: /^Distance$/ })).toHaveCount(0);
    await expect(restDurationOptions.filter({ hasText: /^Time$/ })).toHaveCount(0);
    await page.getByLabel("Step Type").selectOption("main");
    await page.getByTestId("session-draft-step-duration-mode-0").selectOption("time");
    await page.getByTestId("session-draft-step-time-0").fill("1:30");
    await page.getByTestId("session-draft-step-time-0").blur();
    await expect(page.getByTestId("session-draft-step-time-0")).toHaveValue("1:30");
    await expect(page.getByText("Use `MM:SS`.")).toBeVisible();
    await page.getByTestId("session-draft-step-duration-mode-0").selectOption("distance");
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All builder changes are saved to the canonical workout."
    );
    await expect(page.getByTestId("workout-editor-support-tools-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(page.getByTestId("workout-editor-support-tools-status")).toHaveText("Ready");
    await expect(
      page.getByText(
        "Optional export and handoff tools stay here so the workout itself can remain the primary editing surface."
      )
    ).toHaveCount(0);
    await openSupportToolsPanel(page);
    await page.getByTestId("workout-editor-garmin-export-toggle").click();
    await page.getByTestId("workout-editor-handoff-toggle").click();
    await expect(page.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "canonical"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Source: Canonical workout"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Title: Untitled pool session"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"kind": "freeswimming_garmin_ready_workout_v1"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"draftState": "canonical"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"label": "Distance"'
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();

    const savedWorkoutPdfPopupPromise = page.waitForEvent("popup");
    await page.getByTestId("workout-editor-pdf-open").click();
    const savedWorkoutPdfPopup = await savedWorkoutPdfPopupPromise;
    await expect(
      savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-print-view"]')
    ).toBeVisible();
    await expect(savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-source"]')).toContainText(
      "Source: Canonical workout"
    );
    await expect(savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-title"]')).toContainText(
      "Untitled pool session"
    );
    await savedWorkoutPdfPopup.close();

    await page.getByTestId("session-draft-step-remove-0").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toContainText(
      "Remove 100m · Freestyle?"
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();
    await page.getByTestId("workout-editor-removal-cancel-button").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toHaveCount(0);
    await page.getByTestId("session-draft-step-remove-0").click();
    await page.getByTestId("workout-editor-removal-confirm-button").click();
    await expect(page.getByTestId("workout-editor-removal-undo")).toContainText(
      "Removed 100m · Freestyle."
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

    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue("");
    await page.getByTestId("workout-editor-pool-length-unit-yd").click();
    await expect(page.getByLabel("Exact pool size (yd)")).toBeVisible();
    await page.getByRole("button", { name: "25yd" }).click();
    await page.getByTestId("session-draft-step-distance-0").selectOption("custom");
    await page.getByTestId("session-draft-step-distance-custom-0").fill("333");
    await page.getByTestId("session-draft-add-repeat").click();
    await page.getByTestId("session-draft-repeat-count-1").fill("6");
    await expect(page.getByTestId("session-draft-repeat-ending-rest-mode-1")).toHaveValue(
      "skip_last_rest"
    );
    await expect(
      page.getByText(
        "Fixed Rest Time 1:00 still runs between rounds. It is skipped only after the final round."
      )
    ).toBeVisible();
    await expect(page.getByText("Edit this into the exact repeat you want to hold.")).toHaveCount(0);
    await expect(
      page.getByText("Adjust or remove this recovery once the set is dialed in.")
    ).toHaveCount(0);
    await expect(page.getByText("Move the full repeat block from the header.")).toHaveCount(0);
    await page.getByTestId("session-draft-step-distance-1").selectOption("200");
    await page.getByTestId("session-draft-step-stroke-1").selectOption("backstroke");
    await page.getByTestId("session-draft-step-drill-type-1").selectOption("pull");
    await page.getByTestId("session-draft-step-equipment-1").selectOption("fins");
    await page.getByTestId("session-draft-step-target-mode-1").selectOption("target_pace");
    await page.getByTestId("session-draft-step-target-pace-minutes-1").fill("1");
    await page.getByTestId("session-draft-step-target-pace-seconds-1").fill("35");
    await page.getByTestId("session-draft-step-toggle-2").click();
    await page.getByTestId("session-draft-step-rest-minutes-2").fill("0");
    await page.getByTestId("session-draft-step-rest-seconds-2").fill("45");
    await page.getByLabel("Notes").fill("Leave on the top and count strokes.");
    await page.getByTestId("session-draft-title").fill(uniqueTitle);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this workout."
    );
    await expect(page.getByTestId("workout-editor-support-tools-status")).toHaveText(
      "1 review item"
    );
    await openSupportToolsPanel(page);
    await expect(page.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    await expect(page.getByTestId("workout-editor-garmin-readiness-summary")).toHaveText(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    await expect(
      page.getByText(/open focuses will be included on the poolside note/i)
    ).toHaveCount(0);
    await expect(
      page.getByText("Color-first output. Turn on Print backgrounds in your browser if you want the blue fills.")
    ).toHaveCount(0);
    await page.getByTestId("workout-editor-garmin-readiness-toggle").click();
    await expect(page.getByTestId("workout-editor-garmin-readiness-issue-0")).toContainText("Fins");
    await expect(page.getByTestId("workout-editor-garmin-readiness-issue-0")).toContainText(
      "Manual Garmin translation is still required"
    );
    await expect(page.getByTestId("workout-editor-garmin-readiness-issue-1")).toHaveCount(0);
    await expect(page.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "local_draft"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Source: Local draft"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(uniqueTitle);
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Review before export/send"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Final rest skipped"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Notes: Leave on the top and count strokes."
    );
    await expect(page.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "local_draft"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"draftState": "local_draft"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"repeatEndingRestMode": "skip_last_rest"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      `"title": "${uniqueTitle}"`
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"label": "Fixed Rest Time"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"reviewIssueIds": ['
    );
    await expect(page.getByTestId("workout-editor-pdf-source")).toHaveAttribute(
      "data-pdf-state",
      "local_draft"
    );
    await expect(page.getByTestId("workout-editor-pdf-open")).toBeVisible();
    await expect(page.getByTestId("workout-editor-poolside-pdf-open")).toBeVisible();
    await page.getByTestId("workout-editor-poolside-style-ink-saver").click();
    await expect(
      page.getByText(
        "Optional. Use this for the whole-session purpose or one short coaching note that applies across the session."
      )
    ).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    const pdfPopupPromise = page.waitForEvent("popup");
    await page.getByTestId("workout-editor-pdf-open").click();
    const pdfPopup = await pdfPopupPromise;
    await expect(page.getByTestId("workout-editor-pdf-notice")).toContainText("Opened PDF");
    await expect(pdfPopup.locator('[data-testid="workout-pdf-print-view"]')).toBeVisible();
    await expect(pdfPopup.locator('[data-testid="workout-pdf-source"]')).toContainText(
      "Source: Local draft"
    );
    await expect(pdfPopup.locator('[data-testid="workout-pdf-title"]')).toContainText(uniqueTitle);
    await expect(pdfPopup.locator("body")).toContainText("Workout PDF");
    await expect(pdfPopup.locator("body")).toContainText("Print / Save PDF");
    await expect(pdfPopup.locator("body")).toContainText("200m");
    await expect(pdfPopup.locator("body")).toContainText("Backstroke");
    await pdfPopup.close();

    const poolsidePopupPromise = page.waitForEvent("popup");
    await page.getByTestId("workout-editor-poolside-pdf-open").click();
    const poolsidePopup = await poolsidePopupPromise;
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toHaveAttribute(
      "data-pdf-variant",
      "poolside"
    );
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toHaveAttribute(
      "data-poolside-print-style",
      "ink_saver"
    );
    await expect(poolsidePopup.locator("body")).toContainText("Poolside Note");
    await expect(poolsidePopup.locator("body")).toContainText("Ink saver");
    await expect(poolsidePopup.locator("body")).toContainText("Tot:");
    await expect(poolsidePopup.locator("body")).toContainText("P: Fixed Rest Time 0:45");
    await poolsidePopup.close();

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
    await openSupportToolsPanel(page);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All builder changes are saved to the canonical workout."
    );
    await expect(page.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    await expect(page.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "canonical"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Source: Canonical workout"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(uniqueTitle);
    await expect(page.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"draftState": "canonical"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      `"title": "${uniqueTitle}"`
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);
    await expect(page.getByTestId("session-draft-pool-length-input")).toHaveValue("25");
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-distance-0")).toHaveValue("custom");
    await expect(page.getByTestId("session-draft-step-distance-custom-0")).toHaveValue("333");
    await expect(page.getByTestId("session-draft-repeat-count-1")).toHaveValue("6");
    await page.getByTestId("session-draft-step-toggle-1").click();
    await expect(page.getByTestId("session-draft-step-distance-1")).toHaveValue("200");
    await expect(page.getByTestId("session-draft-step-stroke-1")).toHaveValue("backstroke");
    await expect(page.getByTestId("session-draft-step-drill-type-1")).toHaveValue("pull");
    await expect(page.getByTestId("session-draft-step-equipment-1")).toHaveValue("fins");
    await expect(page.getByTestId("session-draft-step-target-mode-1")).toHaveValue("target_pace");
    await expect(page.getByTestId("session-draft-step-target-pace-minutes-1")).toHaveValue("1");
    await expect(page.getByTestId("session-draft-step-target-pace-seconds-1")).toHaveValue("35");
    await expect(page.locator("fieldset").filter({ hasText: "Session strokes" })).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Equipment" })).toHaveCount(0);

    const workoutMatch = new URL(page.url()).pathname.match(
      /\/my-library\/workouts\/([0-9a-f-]+)$/
    );
    expect(workoutMatch?.[1]).toBeTruthy();
    const workoutId = workoutMatch![1];

    await Promise.all([
      page.waitForURL(/\/my-library\/workouts(?:\?.*)?$/, {
        timeout: 20_000,
        waitUntil: "domcontentloaded",
      }),
      page.getByTestId("workout-builder-view-sessions-link").click(),
    ]);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    await expect(page.getByTestId(`saved-workout-card-${workoutId}`)).toBeVisible();
    await page.getByTestId(`saved-workouts-view-${workoutId}`).click();
    await expect(page.getByTestId(`saved-workouts-preview-${workoutId}`)).toContainText("Tot:");
    await expect(page.getByTestId(`saved-workouts-preview-${workoutId}`)).toContainText("P:");
    await page.getByTestId(`workout-builder-edit-workout-${workoutId}`).click();
    await page.waitForURL(new RegExp(`/my-library/workouts/${workoutId}$`), {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await waitForWorkoutBuilderClientReady(page);

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/my-library/workouts/${workoutId}`) &&
        response.request().method() === "DELETE"
    );

    await page.getByTestId("workout-builder-delete-current-workout").click();
    await page.getByTestId("workout-builder-confirm-delete-current-workout").click();

    const deleteResponse = await deleteResponsePromise;
    const deletePayload = (await deleteResponse.json().catch(() => null)) as {
      ok?: boolean;
    } | null;

    expect(deleteResponse.status()).toBe(200);
    expect(deletePayload?.ok).toBe(true);
    await page.waitForURL(/\/my-library$/, {
      timeout: 10_000,
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
  });
});
