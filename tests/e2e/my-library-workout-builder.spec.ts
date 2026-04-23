import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
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

async function waitForLocalWorkoutBuilderRoute(page: Page) {
  await page.waitForURL(
    /\/my-library\/workouts\?draft=(?:pool|open_water)&entry=manual-(?:pool|open-water)$/,
    {
      timeout: 60_000,
      waitUntil: "commit",
    }
  );
  await page.waitForLoadState("domcontentloaded");
}

async function waitForSavedWorkoutBuilderRoute(page: Page) {
  await page.waitForURL(
    /\/my-library\/workouts\/[0-9a-f-]+(?:\?entry=manual-(?:pool|open-water))?$/,
    {
      timeout: 60_000,
      waitUntil: "commit",
    }
  );
  await page.waitForLoadState("domcontentloaded");
}

async function openMetadataPanelIfCollapsed(page: Page) {
  const toggle = page.getByTestId("workout-editor-metadata-toggle");
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

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await expect(page.getByTestId("mobile-fixed-nav")).toHaveCount(0);

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
    test.setTimeout(120_000);

    const uniqueTitle = `QA local draft ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);

    const createButton = page.getByTestId("my-library-create-pool-workout");
    const schemaReady = await createButton.isVisible().catch(() => false);

    if (!schemaReady) {
      await expect(
        page.getByText("This canonical swim-session layer is still syncing in this environment.")
      ).toBeVisible();
      return;
    }

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);

    await expect(
      page.getByRole("heading", { level: 1, name: "Pool session builder" })
    ).toBeVisible();
    await expect(page.getByTestId("workout-builder-delete-current-workout")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Discard draft" })).toBeVisible();
    await openMetadataPanelIfCollapsed(page);
    await page.getByTestId("session-draft-title").fill(uniqueTitle);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "This session is not saved yet."
    );
    await expect(page.getByRole("button", { name: "Save session" })).toBeVisible();
    await expect(page.getByTestId("workout-builder-save")).toBeEnabled();

    await gotoWithTransientRetry(page, "/my-library/workouts");
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    await expect(
      page.locator("[data-testid^='saved-workout-card-']", { hasText: uniqueTitle })
    ).toHaveCount(0);

    await triggerCreateSession(page, "workout-builder-browse-create-pool");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);

    const firstSaveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/my-library/workouts") &&
        response.request().method() === "POST"
    );

    await page.getByTestId("workout-builder-save").click();
    const firstSaveResponse = await firstSaveResponsePromise;
    const firstSavePayload = (await firstSaveResponse.json().catch(() => null)) as {
      ok?: boolean;
    } | null;

    expect(firstSaveResponse.status()).toBe(200);
    expect(firstSavePayload?.ok).toBe(true);
    await waitForSavedWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByTestId("mobile-fixed-nav")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Back to My Swim Sessions" })).toHaveAttribute(
      "href",
      "/my-library/workouts"
    );

    await expect(page.getByRole("button", { name: "Discard draft" })).toHaveCount(0);
    await expect(page.getByTestId("workout-builder-delete-current-workout")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All changes are saved to this session."
    );
    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);

    const workoutMatch = new URL(page.url()).pathname.match(
      /\/my-library\/workouts\/([0-9a-f-]+)$/
    );
    expect(workoutMatch?.[1]).toBeTruthy();
    const workoutId = workoutMatch![1];

    await gotoWithTransientRetry(page, "/my-library/workouts");
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    const savedWorkoutCard = page.getByTestId(`saved-workout-card-${workoutId}`);
    await expect(savedWorkoutCard).toBeVisible();
    await expect(savedWorkoutCard).toContainText(uniqueTitle);
    await expect(savedWorkoutCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(
      page.getByText("Use selection mode when you want to delete multiple saved sessions at once.")
    ).toHaveCount(0);

    await page.getByTestId("workout-builder-saved-sessions-bulk-select-toggle").click();
    const selectionHitArea = page.getByTestId(`saved-workout-selection-hit-area-${workoutId}`);
    const selectionCheckbox = page.getByTestId(`saved-workout-select-${workoutId}`);
    await selectionHitArea.click();
    await expect(selectionCheckbox).toBeChecked();
    await expect(savedWorkoutCard).toHaveAttribute("data-selected", "true");
    await expect(savedWorkoutCard.getByTestId(`saved-workouts-view-${workoutId}`)).toHaveCount(0);
    await expect(
      savedWorkoutCard.getByTestId(`saved-workout-mobile-actions-toggle-${workoutId}`)
    ).toHaveCount(0);
    await expect(page.getByText("1 selected")).toBeVisible();
    await page.getByTestId("workout-builder-saved-sessions-bulk-cancel").click();
    await expect(selectionCheckbox).toHaveCount(0);

    const savedWorkoutPreview = await openSavedWorkoutPreview(page, workoutId);
    await expect(savedWorkoutPreview).toContainText("Total");
  });

  test("resumes and discards a local pool draft without adding it to My Swim Sessions first", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
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

    const resumeTitle = `Recovered local draft ${Date.now()}`;

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);

    await openMetadataPanelIfCollapsed(page);
    await page.getByTestId("session-draft-title").fill(resumeTitle);
    await expect(page.getByRole("button", { name: "Discard draft" })).toBeVisible();

    await gotoWithTransientRetry(page, "/my-library/workouts");
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    await expect(page.getByText(resumeTitle)).toHaveCount(0);

    await triggerCreateSession(page, "workout-builder-browse-create-pool");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(resumeTitle);

    await page.getByRole("button", { name: "Discard draft" }).click();
    await expect(page.getByText("Discard this local draft?")).toBeVisible();
    await page.getByTestId("workout-builder-confirm-discard-current-draft").click();
    await page.waitForURL(/\/my-library\/workouts(?:\?.*)?$/, {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByText("Discarded the local pool draft.")).toBeVisible();
    await expect(page.getByTestId("session-draft-title")).toHaveCount(0);

    await triggerCreateSession(page, "workout-builder-browse-create-pool");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await openMetadataPanelIfCollapsed(page);
    await expect(page.getByText("Untitled pool session")).toBeVisible();
    await expect(page.getByTestId("session-draft-title")).toHaveValue("");
    await expect(page.getByText(resumeTitle)).toHaveCount(0);
  });
});
