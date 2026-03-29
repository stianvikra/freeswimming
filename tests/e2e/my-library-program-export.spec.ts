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

    await page.getByTestId("my-library-create-manual-workout").click();
    await createWorkoutResponsePromise;
    await page.waitForURL(/\/my-library\/workouts\/[0-9a-f-]+$/, {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await waitForWorkoutBuilderClientReady(page);

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

    const createProgramResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/programs") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await page.getByTestId("my-library-create-manual-program").click();
    await createProgramResponsePromise;
    await page.waitForURL(/\/my-library\/programs\/[0-9a-f-]+$/, {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await waitForProgramBuilderClientReady(page);

    await page.getByTestId("program-draft-title").fill(uniqueProgramTitle);
    await page.getByTestId("program-day-picker-week-0-day-0").selectOption({
      label: uniqueWorkoutTitle,
    });
    await page.getByTestId("program-day-add-week-0-day-0").click();
    await expect(page.getByTestId("program-editor-save-state")).toHaveText(
      "Unsaved changes stay local until you save this program."
    );

    const saveProgramResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/my-library\/programs\/[0-9a-f-]+$/.test(response.url()) &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    );

    await page.getByTestId("program-builder-save").click();
    await saveProgramResponsePromise;

    await expect(page.getByText("Program changes saved to the canonical program.")).toBeVisible();
    await expect(page.getByTestId("program-editor-save-state")).toHaveText(
      "All program changes are saved to the canonical program."
    );
    await expect(page.getByTestId("program-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      '"kind": "freeswimming_garmin_ready_program_v1"'
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      uniqueProgramTitle
    );
    await expect(page.getByTestId("program-editor-garmin-export-preview")).toContainText(
      uniqueWorkoutTitle
    );

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("program-editor-garmin-export-download").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(expectedJsonFileName);
    await expect(page.getByTestId("program-editor-garmin-export-notice")).toContainText(
      expectedJsonFileName
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
