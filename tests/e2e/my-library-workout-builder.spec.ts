import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  clickHrefAndAwaitUrlOrRetryGoto,
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Workout builder e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function runOnceOnMobileChromium(projectName: string) {
  test.skip(
    !projectName.startsWith("mobile-"),
    "Workout builder mobile density e2e is mobile-only."
  );
  test.skip(projectName !== "mobile-chromium", "Runs once on mobile Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

async function waitForWorkoutBuilderClientReady(page: Page) {
  await waitForRouteToSettle(page);
  await expect
    .poll(
      async () => await page.getByTestId("workout-builder-hub").getAttribute("data-client-ready"),
      {
        timeout: 30_000,
      }
    )
    .toBe("true");
}

async function openSavedWorkoutPreview(page: Page, workoutId: string) {
  const card = page.getByTestId(`saved-workout-card-${workoutId}`);
  const viewButton = card.getByTestId(`saved-workouts-view-${workoutId}`);
  const preview = card.getByTestId(`saved-workouts-preview-${workoutId}`);

  await expect(card).toBeVisible({ timeout: 15_000 });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const previewVisible = await preview.isVisible().catch(() => false);
    if (previewVisible) {
      return preview;
    }

    await expect(viewButton).toBeVisible({ timeout: 10_000 });
    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.click();

    const opened = await preview
      .waitFor({
        state: "visible",
        timeout: 3_000,
      })
      .then(() => true)
      .catch(() => false);

    if (opened) {
      return preview;
    }

    await waitForRouteToSettle(page);
    await page.waitForTimeout(250);
  }

  await expect(preview).toBeVisible({ timeout: 15_000 });
  return preview;
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

async function waitForWorkoutBuilderRoute(page: Page) {
  await page.waitForURL(/\/my-library\/workouts\/[0-9a-f-]+(?:\?entry=manual-pool)?$/, {
    timeout: 60_000,
    waitUntil: "commit",
  });
  await page.waitForLoadState("domcontentloaded");
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

async function openRepeatGroupIfCollapsed(page: Page, groupIndex: number) {
  const toggle = page.getByTestId(`session-draft-repeat-toggle-${groupIndex}`);
  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }
}

async function triggerCreateSession(page: Page, testId: string) {
  const createButton = page.getByTestId(testId);
  await expect(createButton).toHaveAttribute("data-client-ready", "true", {
    timeout: 15_000,
  });
  await createButton.click();
  const startScratchButton = page.getByTestId(`${testId}-start-scratch`);
  const chooserVisible = await startScratchButton.isVisible({ timeout: 1_500 }).catch(() => false);

  if (chooserVisible) {
    await startScratchButton.click();
  }
}

test.describe("my library workout builder", () => {
  test("reclaims mobile width and keeps secondary builder actions behind progressive disclosure on phone widths", async ({
    page,
  }, testInfo) => {
    runOnceOnMobileChromium(testInfo.project.name);
    test.slow();

    await loginToMyLibraryViaDevBypass(page);

    const createButton = page.getByTestId("my-library-create-pool-workout");
    const schemaReady = await createButton.isVisible().catch(() => false);

    if (!schemaReady) {
      await expect(
        page.getByText("This canonical swim-session layer is still syncing in this environment.")
      ).toBeVisible();
      return;
    }

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await createResponsePromise;
    await waitForWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);

    await expect(page.getByTestId("workout-builder-route-shell")).toHaveAttribute(
      "data-mobile-density",
      "tight"
    );
    await expect(page.getByTestId("workout-builder-page-card")).toHaveAttribute(
      "data-mobile-density",
      "tight"
    );
    await expect(page.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-mobile-density",
      "tight"
    );

    await expect(page.getByTestId("session-draft-step-mobile-summary-0")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await page.getByTestId("session-draft-step-mobile-summary-0").click();
    await expect(page.getByTestId("session-draft-step-mobile-summary-0")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.getByTestId("session-draft-step-mobile-primary-add-after-0")).toBeVisible();
    await expect(
      page.getByTestId("session-draft-step-mobile-primary-add-repeat-after-0")
    ).toBeVisible();

    await page.getByTestId("session-draft-step-mobile-actions-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-mobile-actions-panel-0")).toBeVisible();
    await expect(page.getByTestId("session-draft-step-mobile-remove-0")).toBeVisible();

    await expect(page.getByTestId("session-draft-repeat-mobile-summary-2")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await page.getByTestId("session-draft-repeat-mobile-summary-2").click();
    await expect(page.getByTestId("session-draft-repeat-mobile-summary-2")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.getByTestId("session-draft-repeat-count-2")).toBeVisible();
    await expect(
      page.getByTestId("session-draft-repeat-mobile-primary-add-step-after-2")
    ).toBeVisible();

    await page.getByTestId("session-draft-repeat-mobile-actions-toggle-2").click();
    await expect(page.getByTestId("session-draft-repeat-mobile-actions-panel-2")).toBeVisible();
    await expect(page.getByTestId("session-draft-repeat-mobile-add-repeat-after-2")).toBeVisible();
    await expect(page.getByTestId("session-draft-repeat-mobile-remove-2")).toBeVisible();
  });

  test("creates a clean new swim session and saves canonical edits when the schema is available", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    test.setTimeout(180_000);

    const uniqueTitle = `QA manual workout ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("link", { name: "Jump to owned items" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Jump to explore section" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Program builder preview" })).toBeVisible();

    const createButton = page.getByTestId("my-library-create-pool-workout");
    const schemaReady = await createButton.isVisible().catch(() => false);

    if (!schemaReady) {
      await expect(
        page.getByText("This canonical swim-session layer is still syncing in this environment.")
      ).toBeVisible();
      return;
    }

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await createResponsePromise;
    await waitForWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "Pool session builder" })
    ).toBeVisible();
    await expect(page.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-containment-style",
      "flat"
    );
    await expect(page.getByTestId("workout-editor-pool-size-panel")).toHaveAttribute(
      "data-containment-style",
      "integrated"
    );
    await expect(page.getByTestId("workout-editor-support-tools-panel")).toHaveAttribute(
      "data-containment-style",
      "sectioned"
    );
    await expect(page.getByTestId("workout-editor-poolside-panel")).toHaveAttribute(
      "data-containment-style",
      "split"
    );

    await expect(page.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.getByTestId("workout-editor-danger-zone")).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-delete-current-workout")).toHaveText(
      "Delete session"
    );
    await expect(page.getByRole("link", { name: "My Swim Sessions" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AI-generated session" })).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-create-pool")).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-create-open-water")).toHaveCount(0);
    await expect(
      page.getByTestId("workout-editor-metadata-panel").getByText("Untitled pool session")
    ).toBeVisible();
    await expect(
      page.getByTestId("workout-editor-metadata-panel").getByRole("button", {
        name: "View PDF",
      })
    ).toBeVisible();
    await expect(
      page.getByTestId("workout-editor-metadata-panel").getByRole("button", {
        name: "Discard changes",
      })
    ).toHaveCount(0);
    await expect(
      page.getByTestId("workout-editor-metadata-panel").getByTestId("workout-builder-save")
    ).toBeVisible();
    await expect(page.getByText("Canonical full-session PDF")).toHaveCount(0);
    await expect(page.getByText("canonical workout")).toHaveCount(0);
    await expect(page.getByText("Title through equipment")).toHaveCount(0);
    await expect(page.getByTestId("session-draft-title")).toBeVisible();
    await expect(page.getByText("Session details")).toBeVisible();
    await expect(page.getByText("Session note")).toBeVisible();
    await expect(page.getByText("Pool Size", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Meters" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Yards" })).toBeVisible();
    await expect(
      page.getByTestId("workout-editor-pool-size-panel").getByText("Unit", { exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByTestId("workout-editor-pool-size-panel").getByText("Common sizes", {
        exact: true,
      })
    ).toHaveCount(0);
    await expect(
      page.getByTestId("workout-editor-pool-size-panel").getByText("Exact size", { exact: true })
    ).toHaveCount(0);
    await expect(page.getByLabel("Exact pool size (m)")).toHaveValue("25");
    const poolSizePanelBox = await page.getByTestId("workout-editor-pool-size-panel").boundingBox();
    const poolSizePresetBox = await page.getByRole("button", { name: "50m" }).boundingBox();
    const poolSizeInputBox = await page.getByLabel("Exact pool size (m)").boundingBox();
    expect(poolSizePanelBox).not.toBeNull();
    expect(poolSizePresetBox).not.toBeNull();
    expect(poolSizeInputBox).not.toBeNull();
    expect(poolSizeInputBox!.width).toBeLessThan(180);
    expect(poolSizeInputBox!.x).toBeLessThan(poolSizePanelBox!.x + poolSizePanelBox!.width * 0.7);
    expect(poolSizeInputBox!.x).toBeLessThanOrEqual(
      poolSizePresetBox!.x + poolSizePresetBox!.width + 120
    );
    await expect(page.getByRole("group", { name: "Environment" })).toHaveCount(0);
    await expect(page.getByText("Training profile")).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Session strokes" })).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Equipment" })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Session type" })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Effort" })).toHaveCount(0);
    await expect(page.getByTestId("session-draft-step-summary-0")).toBeVisible();
    await expect(page.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    await expect(page.getByTestId("session-draft-repeat-summary-2")).toContainText("Main");
    await expect(page.getByTestId("session-draft-repeat-summary-2")).toContainText("Freestyle");
    await expect(page.getByTestId("session-draft-repeat-summary-2")).not.toContainText(
      "Repeat block"
    );
    const collapsedStepSummaryBox = await page
      .getByTestId("session-draft-step-summary-0")
      .boundingBox();
    const collapsedStepToggleBox = await page
      .getByTestId("session-draft-step-toggle-0")
      .boundingBox();
    expect(collapsedStepSummaryBox).not.toBeNull();
    expect(collapsedStepToggleBox).not.toBeNull();
    expect(collapsedStepToggleBox!.x).toBeGreaterThan(collapsedStepSummaryBox!.x + 120);
    expect(collapsedStepToggleBox!.y).toBeLessThan(
      collapsedStepSummaryBox!.y + collapsedStepSummaryBox!.height
    );
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-desktop-actions-0")).toHaveAttribute(
      "data-desktop-layout",
      "bottom"
    );
    const stepSummaryBox = await page.getByTestId("session-draft-step-summary-0").boundingBox();
    const stepActionsBox = await page
      .getByTestId("session-draft-step-desktop-actions-0")
      .boundingBox();
    expect(stepSummaryBox).not.toBeNull();
    expect(stepActionsBox).not.toBeNull();
    expect(stepActionsBox!.y).toBeGreaterThanOrEqual(
      stepSummaryBox!.y + stepSummaryBox!.height - 2
    );
    await expect(
      page.getByTestId("workout-editor-panel").getByRole("heading", { name: "Session steps" })
    ).toBeVisible();
    await expect(page.getByLabel("Step Type")).toBeVisible();
    await expect(page.getByLabel("Stroke Type")).toBeVisible();
    await expect(page.getByLabel("Drill Type")).toBeVisible();
    await expect(page.getByLabel("Duration")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Target" })).toBeVisible();
    await expect(page.getByLabel("Notes", { exact: true })).toBeVisible();
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText("Distance");
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toContainText("Time");
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
    await expect(page.getByTestId("session-draft-step-duration-mode-0")).toHaveValue("fixed_rest");
    await expect(page.getByLabel("Stroke Type")).toHaveCount(0);
    await expect(page.getByLabel("Drill Type")).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Target" })).toHaveCount(0);
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
    await page.getByTestId("session-draft-step-duration-mode-0").selectOption("distance");
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this session."
    );
    await expect(page.getByTestId("workout-editor-support-tools-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(page.getByTestId("workout-editor-support-tools-status")).toHaveText("Ready");
    await expect(
      page.getByText("Advanced export and support tools stay here when you need them.")
    ).toHaveCount(0);
    await openSupportToolsPanel(page);
    await expect(
      page.getByText("Advanced export and support tools stay here when you need them.")
    ).toBeVisible();
    await expect(page.getByText("Open, copy, or download here without saving.")).toBeVisible();
    await page.getByTestId("workout-editor-garmin-export-toggle").click();
    await page.getByTestId("workout-editor-handoff-toggle").click();
    await expect(page.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "local_draft"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Source: Local draft"
    );
    await expect(page.getByTestId("workout-editor-handoff-preview")).toContainText(
      "Title: Untitled pool session"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "local_draft"
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"kind": "freeswimming_garmin_ready_workout_v1"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"draftState": "local_draft"'
    );
    await expect(page.getByTestId("workout-editor-garmin-export-preview")).toContainText(
      '"label": "Distance"'
    );
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    const savedWorkoutPdfPopupPromise = page.waitForEvent("popup");
    await page.getByTestId("workout-editor-pdf-open").click();
    const savedWorkoutPdfPopup = await savedWorkoutPdfPopupPromise;
    await expect(
      savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-print-view"]')
    ).toBeVisible();
    await expect(savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-source"]')).toContainText(
      "Source: Local draft"
    );
    await expect(savedWorkoutPdfPopup.locator('[data-testid="workout-pdf-title"]')).toContainText(
      "Untitled pool session"
    );
    await savedWorkoutPdfPopup.close();

    await page.getByTestId("session-draft-step-remove-0").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toContainText(
      "Delete 100m · Freestyle"
    );
    await expect(page.getByTestId("workout-builder-save")).toBeDisabled();
    await page.getByTestId("workout-editor-removal-cancel-button").click();
    await expect(page.getByTestId("workout-editor-removal-confirm")).toHaveCount(0);
    await page.getByTestId("session-draft-step-remove-0").click();
    await page.getByTestId("workout-editor-removal-confirm-button").click();
    await expect(page.getByTestId("workout-editor-removal-undo")).toContainText(
      "Deleted 100m · Freestyle"
    );
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this session."
    );
    await page.getByTestId("workout-editor-removal-undo-button").click();
    await expect(page.getByTestId("workout-editor-removal-undo")).toHaveCount(0);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this session."
    );
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue("");
    await page.getByLabel("Exact pool size (m)").fill("33.33");
    await expect(page.getByLabel("Exact pool size (m)")).toHaveValue("33.33");
    await page.getByTestId("workout-editor-pool-length-unit-yd").click();
    await expect(page.getByLabel("Exact pool size (yd)")).toBeVisible();
    await expect(page.getByLabel("Exact pool size (yd)")).toHaveValue("25");
    await page.getByTestId("workout-editor-pool-length-unit-m").click();
    await expect(page.getByLabel("Exact pool size (m)")).toHaveValue("25");
    await page.getByTestId("workout-editor-pool-length-unit-yd").click();
    await expect(page.getByLabel("Exact pool size (yd)")).toHaveValue("25");
    await page.getByTestId("session-draft-step-distance-0").selectOption("custom");
    await page.getByTestId("session-draft-step-distance-custom-0").fill("333");
    await openRepeatGroupIfCollapsed(page, 2);
    await expect(page.getByTestId("session-draft-repeat-desktop-actions-2")).toHaveAttribute(
      "data-desktop-layout",
      "bottom"
    );
    const repeatSummaryBox = await page.getByTestId("session-draft-repeat-summary-2").boundingBox();
    const repeatActionsBox = await page
      .getByTestId("session-draft-repeat-desktop-actions-2")
      .boundingBox();
    expect(repeatSummaryBox).not.toBeNull();
    expect(repeatActionsBox).not.toBeNull();
    expect(repeatActionsBox!.y).toBeGreaterThanOrEqual(
      repeatSummaryBox!.y + repeatSummaryBox!.height - 2
    );
    await page.getByTestId("session-draft-repeat-count-2").fill("6");
    await expect(page.getByTestId("session-draft-repeat-ending-rest-mode-2")).toHaveValue(
      "skip_last_rest"
    );
    const repeatSummary = page.getByTestId("session-draft-repeat-summary-2");
    await expect(
      repeatSummary.getByText(
        "Fixed Rest Time 1:00 still runs between rounds. It is skipped only after the final round."
      )
    ).toHaveCount(0);
    await expect(
      repeatSummary.getByText(
        "Fixed Rest Time 1:00 stays outside the repeat block as the post-set rest after the set."
      )
    ).toHaveCount(0);
    await expect(repeatSummary.getByText("Final rest skipped")).toHaveCount(0);
    await expect(repeatSummary).toContainText(
      "6 x 100m · Freestyle · Interval rest 0:30 · Set rest 0:30"
    );
    await expect(repeatSummary).not.toContainText("109.36yd");
    await expect(page.getByText("Keeps the blue surfaces")).toBeVisible();
    await expect(page.getByText("Uses white surfaces.")).toBeVisible();
    await expect(page.getByText("Edit this into the exact repeat you want to hold.")).toHaveCount(
      0
    );
    await expect(
      page.getByText("Adjust or remove this recovery once the set is dialed in.")
    ).toHaveCount(0);
    await expect(page.getByText("Move the full repeat block from the header.")).toHaveCount(0);
    await page.getByRole("button", { name: "Meters" }).click();
    await expect(page.getByTestId("session-draft-step-summary-0")).toContainText(
      "333yd · Freestyle · Easy"
    );
    await expect(page.getByTestId("session-draft-step-summary-0")).not.toContainText(
      /304(?:\.49|\.5)m/
    );
    await expect(page.getByTestId("session-draft-repeat-summary-2")).toContainText(
      "6 x 100m · Freestyle · Interval rest 0:30 · Set rest 0:30"
    );
    await expect(page.getByTestId("session-draft-repeat-summary-2")).not.toContainText("109.36yd");
    await page.getByTestId("session-draft-step-toggle-2").click();
    await expect(
      page.getByTestId("session-draft-repeat-summary-2").getByText("Repeat block")
    ).toBeVisible();
    await page.getByTestId("session-draft-step-distance-2").selectOption("200");
    await page.getByTestId("session-draft-step-stroke-2").selectOption("backstroke");
    await page.getByTestId("session-draft-step-drill-type-2").selectOption("pull");
    await page.getByTestId("session-draft-step-equipment-2").selectOption("fins");
    await page.getByTestId("session-draft-step-target-mode-2").selectOption("target_pace");
    await page.getByTestId("session-draft-step-target-pace-minutes-2").fill("1");
    await page.getByTestId("session-draft-step-target-pace-seconds-2").fill("35");
    await page.getByTestId("session-draft-step-toggle-3").click();
    await page.getByTestId("session-draft-step-rest-time-3").fill("0:45");
    await page.getByTestId("session-draft-step-rest-time-3").blur();
    await page
      .getByTestId("session-draft-step-summary-3")
      .locator("xpath=ancestor::article[1]")
      .getByLabel("Notes", { exact: true })
      .fill("Leave on the top and count strokes.");
    await page.getByTestId("session-draft-title").fill(uniqueTitle);
    await expect(page.getByRole("button", { name: "Discard changes" })).toBeVisible();
    await page.getByRole("button", { name: "Discard changes" }).click();
    await expect(page.getByTestId("workout-editor-discard-undo")).toContainText(
      "Changes discarded."
    );
    await expect(page.getByTestId("session-draft-title")).toHaveValue("Untitled pool session");
    await expect(page.getByRole("button", { name: "Discard changes" })).toHaveCount(0);
    await page.getByTestId("workout-editor-discard-undo-button").click();
    await expect(page.getByTestId("workout-editor-discard-undo")).toHaveCount(0);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);
    await expect(page.getByRole("button", { name: "Discard changes" })).toBeVisible();
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this session."
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
    await expect(page.getByText(/open focuses will be included on the poolside note/i)).toHaveCount(
      0
    );
    await expect(
      page.getByText(
        "Color-first output. Turn on Print backgrounds in your browser if you want the blue fills."
      )
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
    await expect(page.getByRole("button", { name: "View PDF" })).toBeVisible();
    await expect(page.getByTestId("workout-editor-poolside-pdf-open")).toBeVisible();
    await page.getByTestId("workout-editor-poolside-style-ink-saver").click();
    await page.getByTestId("workout-editor-poolside-layout-landscape").click();
    await expect(page.getByText("Print options")).toBeVisible();
    await expect(
      page.getByTestId("workout-editor-poolside-panel").getByText("Style", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByTestId("workout-editor-poolside-panel").getByText("Layout", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(
        "Optional. Use this for the whole-session purpose or one short coaching note that applies across the session."
      )
    ).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    const pdfPopupPromise = page.waitForEvent("popup");
    await page.getByTestId("workout-editor-pdf-open").click();
    const pdfPopup = await pdfPopupPromise;
    await pdfPopup.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("workout-editor-pdf-notice")).toContainText("Opened PDF");
    await expect(pdfPopup.locator('[data-testid="workout-pdf-print-view"]')).toBeVisible();
    await expect.poll(async () => pdfPopup.title()).toContain("FreeSwimming");
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
    await poolsidePopup.waitForLoadState("domcontentloaded");
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toHaveAttribute(
      "data-pdf-variant",
      "poolside"
    );
    await expect.poll(async () => poolsidePopup.title()).toContain("FreeSwimming");
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toHaveAttribute(
      "data-poolside-print-style",
      "ink_saver"
    );
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toHaveAttribute(
      "data-poolside-print-layout",
      "landscape"
    );
    await expect(poolsidePopup.locator("body")).toContainText(uniqueTitle);
    await expect(poolsidePopup.locator("body")).toContainText("Print Preview");
    await expect(poolsidePopup.locator("body")).not.toContainText("Poolside Note");
    await expect(poolsidePopup.locator("body")).not.toContainText("Color mode");
    await expect(poolsidePopup.locator("body")).not.toContainText("Ink saver");
    await expect(poolsidePopup.locator("body")).not.toContainText("Portrait");
    await expect(poolsidePopup.locator("body")).not.toContainText("Landscape");
    await expect(poolsidePopup.locator("body")).not.toContainText("Source: Local draft");
    await expect(poolsidePopup.locator("body")).not.toContainText("Pool session execution");
    await expect(poolsidePopup.locator("body")).toContainText("Total");
    await expect(poolsidePopup.locator("body")).toContainText(/rest/i);
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-total"]')).toBeVisible();
    await expect(poolsidePopup.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.ico");
    await expect(poolsidePopup.locator("body")).not.toContainText("P:");
    await expect(poolsidePopup.locator("body")).not.toContainText("~");
    await page.waitForTimeout(300);
    await expect(poolsidePopup.locator('[data-testid="workout-pdf-print-view"]')).toBeVisible();
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

    await expect(page.getByText("Changes saved to this session.")).toBeVisible();
    await openSupportToolsPanel(page);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All changes are saved to this session."
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
    await expect(page.getByRole("button", { name: "Discard changes" })).toHaveCount(0);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);
    await expect(page.getByTestId("session-draft-pool-length-input")).toHaveValue("25");
    await page.getByTestId("session-draft-step-toggle-0").click();
    await expect(page.getByTestId("session-draft-step-distance-0")).toHaveValue("custom");
    await expect(page.getByTestId("session-draft-step-distance-custom-0")).toHaveValue("333");
    await openRepeatGroupIfCollapsed(page, 2);
    await expect(page.getByTestId("session-draft-repeat-count-2")).toHaveValue("6");
    await page.getByTestId("session-draft-step-toggle-2").click();
    await expect(page.getByTestId("session-draft-step-distance-2")).toHaveValue("200");
    await expect(page.getByTestId("session-draft-step-stroke-2")).toHaveValue("backstroke");
    await expect(page.getByTestId("session-draft-step-drill-type-2")).toHaveValue("pull");
    await expect(page.getByTestId("session-draft-step-equipment-2")).toHaveValue("fins");
    await expect(page.getByTestId("session-draft-step-target-mode-2")).toHaveValue("target_pace");
    await expect(page.getByTestId("session-draft-step-target-pace-minutes-2")).toHaveValue("1");
    await expect(page.getByTestId("session-draft-step-target-pace-seconds-2")).toHaveValue("35");
    await expect(page.locator("fieldset").filter({ hasText: "Session strokes" })).toHaveCount(0);
    await expect(page.locator("fieldset").filter({ hasText: "Equipment" })).toHaveCount(0);

    const workoutMatch = new URL(page.url()).pathname.match(
      /\/my-library\/workouts\/([0-9a-f-]+)$/
    );
    expect(workoutMatch?.[1]).toBeTruthy();
    const workoutId = workoutMatch![1];

    const viewSessionsLink = page.getByTestId("workout-builder-view-sessions-link");
    const viewSessionsHref = await viewSessionsLink.getAttribute("href");
    if (viewSessionsHref) {
      await clickHrefAndAwaitUrlOrRetryGoto({
        page,
        trigger: viewSessionsLink,
        href: viewSessionsHref,
        expectedUrl: /\/my-library\/workouts(?:\?.*)?$/,
        clickNavigationTimeoutMs: 10_000,
      });
    } else {
      await Promise.all([
        page.waitForURL(/\/my-library\/workouts(?:\?.*)?$/, {
          timeout: 20_000,
          waitUntil: "domcontentloaded",
        }),
        viewSessionsLink.click(),
      ]);
    }
    await waitForRouteToSettle(page);
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    await expect(page.getByTestId(`saved-workout-card-${workoutId}`)).toBeVisible();
    const savedWorkoutPreview = await openSavedWorkoutPreview(page, workoutId);
    await expect(savedWorkoutPreview).toContainText("Total:");
    await expect(savedWorkoutPreview).toContainText("Rest");
    const editWorkoutLink = page.getByTestId(`workout-builder-edit-workout-${workoutId}`);
    const editWorkoutHref = await editWorkoutLink.getAttribute("href");
    if (editWorkoutHref) {
      await clickHrefAndAwaitUrlOrRetryGoto({
        page,
        trigger: editWorkoutLink,
        href: editWorkoutHref,
        expectedUrl: new RegExp(`/my-library/workouts/${workoutId}$`),
        clickNavigationTimeoutMs: 10_000,
      });
    } else {
      await editWorkoutLink.click();
      await page.waitForURL(new RegExp(`/my-library/workouts/${workoutId}$`), {
        timeout: 20_000,
        waitUntil: "domcontentloaded",
      });
    }
    await waitForWorkoutBuilderClientReady(page);
    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("workout-editor-danger-zone")).toHaveCount(0);

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/my-library/workouts/${workoutId}`) &&
        response.request().method() === "DELETE"
    );

    const deleteCurrentButton = page.getByRole("button", { name: "Delete session" }).first();
    await expect(deleteCurrentButton).toBeVisible();
    await deleteCurrentButton.click();
    const confirmDeleteButton = page.getByTestId("workout-builder-confirm-delete-current-workout");
    await confirmDeleteButton.scrollIntoViewIfNeeded();
    await expect(confirmDeleteButton).toBeVisible();
    await expect(confirmDeleteButton).toBeEnabled();
    await Promise.all([deleteResponsePromise, confirmDeleteButton.click({ timeout: 15_000 })]);

    const deleteResponse = await deleteResponsePromise;
    const deletePayload = (await deleteResponse.json().catch(() => null)) as {
      ok?: boolean;
    } | null;

    expect(deleteResponse.status()).toBe(200);
    expect(deletePayload?.ok).toBe(true);
    await expect(
      page.getByText("No saved swim session is loaded in this route yet.")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Build pool session" })).toBeVisible();
  });
});
