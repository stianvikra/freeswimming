import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Poolside image export e2e is desktop-only.");
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

async function openSavedWorkoutPoolsidePanel(page: Page, workoutId: string) {
  const card = page.getByTestId(`saved-workout-card-${workoutId}`);
  const poolsideToggle = card.getByTestId(`saved-workouts-poolside-${workoutId}`);
  const printPreviewLink = card.getByTestId(`saved-workout-poolside-${workoutId}-print-preview`);

  await expect(card).toBeVisible({ timeout: 15_000 });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const linkVisible = await printPreviewLink.isVisible().catch(() => false);
    if (linkVisible) {
      return printPreviewLink;
    }

    await expect(poolsideToggle).toBeVisible({ timeout: 10_000 });
    await poolsideToggle.scrollIntoViewIfNeeded();
    await poolsideToggle.click();

    const opened = await printPreviewLink
      .waitFor({
        state: "visible",
        timeout: 3_000,
      })
      .then(() => true)
      .catch(() => false);

    if (opened) {
      return printPreviewLink;
    }

    await waitForRouteToSettle(page);
    await page.waitForTimeout(250);
  }

  await expect(printPreviewLink).toBeVisible({ timeout: 15_000 });
  return printPreviewLink;
}

async function openPoolsidePreviewPopup(triggerPage: Page, trigger: () => Promise<void>) {
  const popupPromise = triggerPage.waitForEvent("popup");
  await trigger();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await waitForRouteToSettle(popup);
  await expect(popup.getByTestId("poolside-preview-page")).toBeVisible({ timeout: 15_000 });
  return popup;
}

async function installSaveImageDownloadProbe(page: Page) {
  await page.evaluate(() => {
    type DownloadProbeEntry = {
      download: string;
      href: string;
    };

    const windowWithProbe = window as typeof window & {
      __fsPoolsideSaveImageDownloadProbe__?: {
        entries: DownloadProbeEntry[];
      };
      __fsPoolsideSaveImageDownloadPatched__?: boolean;
    };

    const probe = windowWithProbe.__fsPoolsideSaveImageDownloadProbe__;
    if (probe) {
      probe.entries.length = 0;
    } else {
      windowWithProbe.__fsPoolsideSaveImageDownloadProbe__ = { entries: [] };
    }

    if (windowWithProbe.__fsPoolsideSaveImageDownloadPatched__) {
      return;
    }

    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedPoolsideSaveImageAnchorClick() {
      if (this.download) {
        windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.entries.push({
          download: this.download,
          href: this.href,
        });
      }

      return originalClick.call(this);
    };

    windowWithProbe.__fsPoolsideSaveImageDownloadPatched__ = true;
  });
}

async function expectSaveImageDownloadIntent(page: Page, expectedFileName: string) {
  await expect
    .poll(
      async () =>
        await page.evaluate(() => {
          const probe = (window as typeof window & {
            __fsPoolsideSaveImageDownloadProbe__?: {
              entries: Array<{ download: string; href: string }>;
            };
          }).__fsPoolsideSaveImageDownloadProbe__;
          const entries = probe?.entries ?? [];
          return entries.length > 0 ? entries[entries.length - 1] : null;
        }),
      {
        timeout: 15_000,
      }
    )
    .toEqual({
      download: expectedFileName,
      href: expect.stringContaining("blob:"),
    });
}

async function waitForEmbeddedPoolsidePreview(
  page: Page,
  expected: {
    printLayout?: "portrait" | "landscape";
    restLayout?: "auto" | "inline" | "separate";
    notationMode?: "auto" | "full" | "abbreviated";
  } = {}
) {
  const previewFrame = page.frameLocator('[data-testid="poolside-preview-frame"]');
  const article = previewFrame.locator('[data-testid="workout-pdf-print-view"]');

  await expect(article).toBeVisible({ timeout: 15_000 });

  if (expected.printLayout) {
    await expect(article).toHaveAttribute("data-poolside-print-layout", expected.printLayout, {
      timeout: 15_000,
    });
  }

  if (expected.restLayout) {
    await expect(article).toHaveAttribute("data-poolside-rest-layout", expected.restLayout, {
      timeout: 15_000,
    });
  }

  if (expected.notationMode) {
    await expect(article).toHaveAttribute("data-poolside-notation-mode", expected.notationMode, {
      timeout: 15_000,
    });
  }
}

test.describe("poolside save image export", () => {
  test("exports PNG from both local-draft and saved-workout preview entry paths", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    test.setTimeout(180_000);

    const uniqueTitle = `QA poolside image export ${Date.now()}`;
    const expectedPortraitFileName = `freeswimming-${slugifyTitle(
      uniqueTitle
    )}-poolside-note-portrait.png`;
    const expectedLandscapeFileName = `freeswimming-${slugifyTitle(
      uniqueTitle
    )}-poolside-note-landscape.png`;

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
    await openMetadataPanelIfCollapsed(page);
    await page.getByTestId("session-draft-title").fill(uniqueTitle);

    const localPreviewPopup = await openPoolsidePreviewPopup(page, async () => {
      await page.getByTestId("workout-editor-poolside-pdf-open").click();
    });

    await waitForEmbeddedPoolsidePreview(localPreviewPopup, { printLayout: "portrait" });
    await installSaveImageDownloadProbe(localPreviewPopup);
    await localPreviewPopup.getByTestId("poolside-preview-save-image").click();
    await expectSaveImageDownloadIntent(localPreviewPopup, expectedPortraitFileName);
    await expect(localPreviewPopup.getByTestId("poolside-preview-save-image-notice")).toContainText(
      expectedPortraitFileName
    );
    await localPreviewPopup.close();

    const firstSaveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/my-library/workouts") &&
        response.request().method() === "POST"
    );
    await page.getByTestId("workout-builder-save").click();
    const firstSaveResponse = await firstSaveResponsePromise;
    expect(firstSaveResponse.status()).toBe(200);
    await waitForSavedWorkoutBuilderRoute(page);
    await waitForWorkoutBuilderClientReady(page);

    const workoutMatch = new URL(page.url()).pathname.match(
      /\/my-library\/workouts\/([0-9a-f-]+)$/
    );
    expect(workoutMatch?.[1]).toBeTruthy();
    const workoutId = workoutMatch![1];

    await gotoWithTransientRetry(page, "/my-library/workouts");
    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "My Swim Sessions" })).toBeVisible();
    const savedPrintPreviewLink = await openSavedWorkoutPoolsidePanel(page, workoutId);

    const savedPreviewPopup = await openPoolsidePreviewPopup(page, async () => {
      await savedPrintPreviewLink.click();
    });

    await waitForEmbeddedPoolsidePreview(savedPreviewPopup, { printLayout: "portrait" });
    await savedPreviewPopup.getByTestId("poolside-preview-layout").selectOption("landscape");
    await waitForEmbeddedPoolsidePreview(savedPreviewPopup, { printLayout: "landscape" });
    await installSaveImageDownloadProbe(savedPreviewPopup);
    await savedPreviewPopup.getByTestId("poolside-preview-save-image").click();
    await expectSaveImageDownloadIntent(savedPreviewPopup, expectedLandscapeFileName);
    await expect(savedPreviewPopup.getByTestId("poolside-preview-save-image-notice")).toContainText(
      expectedLandscapeFileName
    );
    await savedPreviewPopup.close();
  });
});
