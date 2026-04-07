import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Program export e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function slugifyTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function ensureWorkoutMetadataOpen(page: Page) {
  const metadataToggle = page.getByTestId("workout-editor-metadata-toggle");
  await expect(metadataToggle).toBeVisible({ timeout: 15_000 });

  if ((await metadataToggle.getAttribute("aria-expanded")) !== "true") {
    await metadataToggle.click();
  }

  await expect(metadataToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("session-draft-title")).toBeVisible({ timeout: 15_000 });
}

async function waitForProgramBuilderClientReady(page: Page) {
  await expect(page.getByTestId("program-builder-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    { timeout: 15_000 }
  );
}

async function ensureProgramSchemaReady(page: Page) {
  const schemaWarning = page.getByText(
    /This canonical program layer is still syncing in this environment\.|Program planning tools are still syncing in this environment\./
  );

  if ((await schemaWarning.count()) > 0 && (await schemaWarning.first().isVisible())) {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
  }

  if ((await schemaWarning.count()) > 0 && (await schemaWarning.first().isVisible())) {
    test.skip(true, "Program schema is not ready in this environment.");
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

test.describe("my library program export", () => {
  test("exports a saved canonical program as garmin-ready json and printable pdf", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    const stamp = Date.now();
    const uniqueWorkoutTitle = `QA program export workout ${stamp}`;
    const uniqueProgramTitle = `QA program export shell ${stamp}`;
    const expectedJsonFileName = `freeswimming-${slugifyTitle(uniqueProgramTitle)}-garmin-ready.json`;

    await loginToMyLibraryViaDevBypass(page);

    const createWorkoutResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await triggerCreateSession(page, "my-library-create-pool-workout");
    await createWorkoutResponsePromise;
    await expect(page).toHaveURL(/\/my-library\/workouts\/[0-9a-f-]+(?:\?entry=manual-pool)?$/, {
      timeout: 20_000,
    });
    const workoutId = page.url().match(/\/my-library\/workouts\/([0-9a-f-]+)/i)?.[1];
    expect(workoutId).toBeTruthy();
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await ensureWorkoutMetadataOpen(page);
    await expect(page.getByTestId("session-draft-step-toggle-0")).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("session-draft-title").fill(uniqueWorkoutTitle);

    const saveWorkoutResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/my-library\/workouts\/[0-9a-f-]+$/.test(response.url()) &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    );

    await page.getByTestId("workout-builder-save").click();
    await saveWorkoutResponsePromise;
    await expect(page.getByText("Workout changes saved to the canonical workout.")).toBeVisible();

    await page.goto("/my-library", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await ensureProgramSchemaReady(page);

    // Keep this scenario focused on canonical export behavior. Button wiring and picker interactions
    // are covered in dedicated builder tests.
    const createProgramResponse = await page.request.post("/api/my-library/programs", {
      data: {
        title: uniqueProgramTitle,
        weeks: [
          {
            id: `qa-week-${stamp}`,
            label: "Week 1",
            assignments: [
              {
                id: `qa-assignment-${stamp}`,
                workoutId,
                dayIndex: 0,
                position: 0,
              },
            ],
          },
        ],
      },
    });
    expect(createProgramResponse.ok()).toBe(true);
    const createProgramBody = (await createProgramResponse.json()) as {
      ok: boolean;
      program?: { id: string };
      error?: string;
    };
    expect(createProgramBody.ok).toBe(true);
    expect(createProgramBody.program?.id).toBeTruthy();

    await page.goto(`/my-library/programs/${createProgramBody.program?.id}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await waitForProgramBuilderClientReady(page);

    await expect(page.getByTestId("program-draft-title")).toHaveValue(uniqueProgramTitle);
    await expect(page.getByTestId("program-week-0")).toContainText(uniqueWorkoutTitle);
    await expect(page.getByTestId("program-editor-save-state")).toHaveText(
      "All program changes are saved to the canonical program."
    );
    await expect(page.getByTestId("program-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("program-editor-garmin-export-download").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedJsonFileName);
    await expect(page.getByTestId("program-editor-garmin-export-notice")).toContainText(
      expectedJsonFileName
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      '"kind": "freeswimming_garmin_ready_program_v1"',
      { timeout: 15_000 }
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      uniqueProgramTitle
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      uniqueWorkoutTitle
    );

    const pdfPopupPromise = page.waitForEvent("popup");
    await page.getByTestId("program-editor-pdf-open").click();
    const pdfPopup = await pdfPopupPromise;

    await expect(page.getByTestId("program-editor-pdf-notice")).toContainText("Opened print view");
    await expect(pdfPopup.locator('[data-testid="program-pdf-print-view"]')).toBeVisible();
    await expect(pdfPopup.locator('[data-testid="program-pdf-source"]')).toContainText(
      "Source: Canonical program"
    );
    await expect(pdfPopup.locator('[data-testid="program-pdf-title"]')).toContainText(
      uniqueProgramTitle
    );
    await expect(pdfPopup.locator("body")).toContainText("Program PDF print view");
    await expect(pdfPopup.locator("body")).toContainText("Print / Save PDF");
    await expect(pdfPopup.locator("body")).toContainText(uniqueWorkoutTitle);
    await pdfPopup.close();
  });
});
