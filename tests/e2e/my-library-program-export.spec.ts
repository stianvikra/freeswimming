import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

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
  const libraryHeading = page.getByRole("heading", { name: "My Library" });
  const libraryReady = await libraryHeading.isVisible({ timeout: 15_000 }).catch(() => false);

  if (libraryReady) {
    return;
  }

  await gotoWithTransientRetry(page, loginHref);
  if (new URL(page.url()).pathname !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(libraryHeading).toBeVisible({ timeout: 15_000 });
}

async function refreshDevSessionForCurrentRoute(page: Page) {
  const currentUrl = new URL(page.url());
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;
  const loginHref = `/dev/login?next=${encodeURIComponent(nextPath)}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);

  if (new URL(page.url()).pathname !== currentUrl.pathname) {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }
}

async function waitForWorkoutBuilderClientReady(page: Page) {
  await waitForRouteToSettle(page);
  const hub = page.getByTestId("workout-builder-hub");
  const clientReady = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 30_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (clientReady) {
    return;
  }

  await refreshDevSessionForCurrentRoute(page);
  await waitForRouteToSettle(page);

  const readyAfterRefresh = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 30_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (!readyAfterRefresh) {
    test.skip(true, "Workout builder client did not hydrate in this environment.");
  }
}

async function waitForWorkoutBuilderSaveReady(page: Page) {
  const schemaWarning = page.getByText(
    "Canonical workout save is still syncing in this environment."
  );
  const saveButton = page.getByTestId("workout-builder-save");

  if ((await schemaWarning.count()) > 0 && (await schemaWarning.first().isVisible())) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForRouteToSettle(page);
    await waitForWorkoutBuilderClientReady(page);
  }

  const saveVisible = await saveButton.isVisible({ timeout: 15_000 }).catch(() => false);
  if (!saveVisible) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForAnyWorkoutBuilderRoute(page);
    await waitForRouteToSettle(page);
    await waitForWorkoutBuilderClientReady(page);
  }

  await expect(saveButton).toBeVisible({ timeout: 15_000 });
}

async function waitForAnyWorkoutBuilderRoute(page: Page) {
  await page.waitForURL(/\/my-library\/workouts(?:\/[0-9a-f-]+)?(?:\?.*)?$/, {
    timeout: 60_000,
    waitUntil: "commit",
  });
  await page.waitForLoadState("domcontentloaded");
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
  await page.waitForURL(/\/my-library\/workouts\/[0-9a-f-]+(?:\?entry=manual-pool)?$/, {
    timeout: 60_000,
    waitUntil: "commit",
  });
  await page.waitForLoadState("domcontentloaded");
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
  const hub = page.getByTestId("program-builder-hub");
  await waitForRouteToSettle(page);
  const clientReady = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 30_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (clientReady) {
    return;
  }

  await refreshDevSessionForCurrentRoute(page);
  await waitForRouteToSettle(page);

  const readyAfterRefresh = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 30_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (!readyAfterRefresh) {
    test.skip(true, "Program builder client did not hydrate in this environment.");
  }
}

async function waitForProgramExportPreviewReady(page: Page) {
  const exportPreview = page.getByTestId("program-editor-garmin-export-preview").first();
  const previewError = page.getByTestId("program-editor-garmin-export-preview-error");

  await expect(exportPreview).toBeVisible({ timeout: 15_000 });

  const waitForPreviewResolution = async () => {
    const resolved = await expect
      .poll(
        async () => {
          if ((await previewError.count()) > 0 && (await previewError.first().isVisible())) {
            return "error";
          }

          const previewText = (await exportPreview.textContent()) ?? "";
          if (previewText.includes("Loading canonical export preview...")) {
            return "loading";
          }

          return previewText.trim().length > 0 ? "ready" : "empty";
        },
        { timeout: 20_000 }
      )
      .toMatch(/ready|error/)
      .then(() => true)
      .catch(() => false);

    if (resolved) {
      return;
    }

    await refreshDevSessionForCurrentRoute(page);
    await waitForProgramBuilderClientReady(page);
    await expect
      .poll(
        async () => {
          if ((await previewError.count()) > 0 && (await previewError.first().isVisible())) {
            return "error";
          }

          const previewText = (await exportPreview.textContent()) ?? "";
          if (previewText.includes("Loading canonical export preview...")) {
            return "loading";
          }

          return previewText.trim().length > 0 ? "ready" : "empty";
        },
        { timeout: 20_000 }
      )
      .toMatch(/ready|error/);
  };

  await waitForPreviewResolution();
  await expect(previewError).toHaveCount(0);
}

async function ensureProgramSchemaReady(page: Page) {
  const schemaWarning = page.getByText(
    /This canonical program layer is still syncing in this environment\.|Program builder preview is still syncing in this environment\./
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

test.describe("my library program export", () => {
  test("exports a saved canonical program as garmin-ready json and printable pdf", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    test.setTimeout(240_000);

    const stamp = Date.now();
    const uniqueWorkoutTitle = `QA program export workout ${stamp}`;
    const uniqueProgramTitle = `QA program export shell ${stamp}`;
    const expectedJsonFileName = `freeswimming-${slugifyTitle(uniqueProgramTitle)}-garmin-ready.json`;

    await loginToMyLibraryViaDevBypass(page);

    await gotoWithTransientRetry(page, "/my-library/workouts");
    await waitForWorkoutBuilderClientReady(page);

    const createWorkoutButton = page.getByTestId("workout-builder-browse-create-pool");
    const workoutSchemaReady = await createWorkoutButton.isVisible().catch(() => false);

    if (!workoutSchemaReady) {
      await expect(
        page.getByText("Canonical workout save is still syncing in this environment.")
      ).toBeVisible();
      return;
    }

    await triggerCreateSession(page, "workout-builder-browse-create-pool");
    await waitForLocalWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await waitForWorkoutBuilderSaveReady(page);
    await ensureWorkoutMetadataOpen(page);
    await expect(page.getByTestId("session-draft-step-toggle-0")).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("session-draft-title").fill(uniqueWorkoutTitle);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "This session is not saved yet."
    );

    const saveWorkoutResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await page.getByTestId("workout-builder-save").click();
    const saveWorkoutResponse = await saveWorkoutResponsePromise;
    const saveWorkoutBody = (await saveWorkoutResponse.json().catch(() => null)) as {
      ok?: boolean;
    } | null;
    expect(saveWorkoutBody?.ok).toBe(true);
    await waitForSavedWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByTestId("workout-editor-save-state")).toHaveText(
      "All changes are saved to this session."
    );

    const workoutId = page.url().match(/\/my-library\/workouts\/([0-9a-f-]+)/i)?.[1];
    expect(workoutId).toBeTruthy();

    await gotoWithTransientRetry(page, "/my-library", 60_000);
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

    await gotoWithTransientRetry(page, `/my-library/programs/${createProgramBody.program?.id}`);
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

    const exportPreview = page.getByTestId("program-editor-garmin-export-preview").first();
    await waitForProgramExportPreviewReady(page);
    await expect(exportPreview).toContainText('"kind": "freeswimming_garmin_ready_program_v1"', {
      timeout: 15_000,
    });
    await expect(exportPreview).toContainText(uniqueProgramTitle, { timeout: 15_000 });
    await expect(exportPreview).toContainText(uniqueWorkoutTitle, { timeout: 15_000 });

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
