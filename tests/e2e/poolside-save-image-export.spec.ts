import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

type SaveImageExportMetrics = {
  bottomEdgeStrongPixels: number;
  expectedImageHeight: number;
  expectedImageWidth: number;
  imageHeight: number;
  imageWidth: number;
  leftEdgeStrongPixels: number;
  noteHeight: number;
  noteWidth: number;
  pixelRatio: number;
  rightEdgeStrongPixels: number;
  topEdgeStrongPixels: number;
};

function runOnceOnMobileChromium(projectName: string) {
  test.skip(projectName !== "mobile-chromium", "Runs once on mobile Chromium.");
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
  const poolsideToggle = card
    .getByTestId(`saved-workouts-poolside-${workoutId}`)
    .filter({ visible: true })
    .first();
  const mobileActionsToggle = card.getByTestId(`saved-workout-mobile-actions-toggle-${workoutId}`);
  const printPreviewLink = card.getByTestId(`saved-workout-poolside-${workoutId}-print-preview`);

  await expect(card).toBeVisible({ timeout: 15_000 });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const linkVisible = await printPreviewLink.isVisible().catch(() => false);
    if (linkVisible) {
      return printPreviewLink;
    }

    const poolsideToggleVisible = await poolsideToggle.isVisible().catch(() => false);
    if (!poolsideToggleVisible && (await mobileActionsToggle.isVisible().catch(() => false))) {
      await mobileActionsToggle.scrollIntoViewIfNeeded();
      await mobileActionsToggle.click();
      await expect(card.getByTestId(`saved-workout-mobile-actions-panel-${workoutId}`)).toBeVisible(
        { timeout: 5_000 }
      );
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
    type DownloadProbeMetrics = {
      bottomEdgeStrongPixels: number;
      expectedImageHeight: number;
      expectedImageWidth: number;
      imageHeight: number;
      imageWidth: number;
      leftEdgeStrongPixels: number;
      noteHeight: number;
      noteWidth: number;
      pixelRatio: number;
      rightEdgeStrongPixels: number;
      topEdgeStrongPixels: number;
    };
    type DownloadProbe = {
      buttonClicks: Array<{
        buttonDisabled: boolean;
        previewReady: string | null;
      }>;
      entries: DownloadProbeEntry[];
      errors: string[];
      metricsByHref: Record<string, DownloadProbeMetrics>;
    };

    const windowWithProbe = window as typeof window & {
      __fsPoolsideSaveImageDownloadProbe__?: DownloadProbe;
      __fsPoolsideSaveImageDownloadPatched__?: boolean;
    };

    const probe = windowWithProbe.__fsPoolsideSaveImageDownloadProbe__;
    if (probe) {
      probe.buttonClicks.length = 0;
      probe.entries.length = 0;
      probe.errors.length = 0;
      for (const key of Object.keys(probe.metricsByHref)) {
        delete probe.metricsByHref[key];
      }
    } else {
      windowWithProbe.__fsPoolsideSaveImageDownloadProbe__ = {
        buttonClicks: [],
        entries: [],
        errors: [],
        metricsByHref: {},
      };
    }

    if (windowWithProbe.__fsPoolsideSaveImageDownloadPatched__) {
      return;
    }

    const captureEdgePaddingPx = 8;
    const captureBlobMetrics = (href: string, object: Blob) => {
      if (object.type !== "image/png" || typeof createImageBitmap !== "function") {
        return;
      }

      const previewFrame = document.querySelector<HTMLIFrameElement>(
        '[data-testid="poolside-preview-frame"]'
      );
      const frameDocument = previewFrame?.contentDocument ?? previewFrame?.contentWindow?.document;
      const noteElement = frameDocument?.querySelector<HTMLElement>(
        '[data-testid="workout-pdf-print-view"]'
      );

      if (!noteElement) {
        windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.errors.push(
          "Poolside note export target was not available for PNG metric capture."
        );
        return;
      }

      const rect = noteElement.getBoundingClientRect();
      const noteWidth = Math.ceil(Math.max(rect.width, noteElement.offsetWidth));
      const noteHeight = Math.ceil(
        Math.max(rect.height, noteElement.offsetHeight, noteElement.scrollHeight)
      );
      const pixelRatio = Math.max(2, Math.min(3, window.devicePixelRatio || 1));

      void createImageBitmap(object)
        .then((bitmap) => {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Canvas context was not available for PNG edge checks.");
          }

          context.drawImage(bitmap, 0, 0);
          const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
          const isStrongNonWhitePixel = (index: number) => {
            const alpha = imageData[index + 3];
            return (
              alpha > 20 &&
              (imageData[index] < 246 || imageData[index + 1] < 246 || imageData[index + 2] < 246)
            );
          };
          let rightEdgeStrongPixels = 0;
          let bottomEdgeStrongPixels = 0;
          let leftEdgeStrongPixels = 0;
          let topEdgeStrongPixels = 0;

          for (let y = 0; y < bitmap.height; y += 1) {
            const leftIndex = y * bitmap.width * 4;
            if (isStrongNonWhitePixel(leftIndex)) {
              leftEdgeStrongPixels += 1;
            }

            const index = (y * bitmap.width + (bitmap.width - 1)) * 4;
            if (isStrongNonWhitePixel(index)) {
              rightEdgeStrongPixels += 1;
            }
          }

          for (let x = 0; x < bitmap.width; x += 1) {
            const topIndex = x * 4;
            if (isStrongNonWhitePixel(topIndex)) {
              topEdgeStrongPixels += 1;
            }

            const index = ((bitmap.height - 1) * bitmap.width + x) * 4;
            if (isStrongNonWhitePixel(index)) {
              bottomEdgeStrongPixels += 1;
            }
          }

          windowWithProbe.__fsPoolsideSaveImageDownloadProbe__!.metricsByHref[href] = {
            bottomEdgeStrongPixels,
            expectedImageHeight: Math.round((noteHeight + captureEdgePaddingPx * 2) * pixelRatio),
            expectedImageWidth: Math.round((noteWidth + captureEdgePaddingPx * 2) * pixelRatio),
            imageHeight: bitmap.height,
            imageWidth: bitmap.width,
            leftEdgeStrongPixels,
            noteHeight,
            noteWidth,
            pixelRatio,
            rightEdgeStrongPixels,
            topEdgeStrongPixels,
          };
          bitmap.close();
        })
        .catch((error: unknown) => {
          windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.errors.push(
            error instanceof Error ? error.message : String(error)
          );
        });
    };

    const originalCreateObjectUrl = URL.createObjectURL.bind(URL);
    const originalShare =
      typeof navigator.share === "function" ? navigator.share.bind(navigator) : null;
    const originalCanShare =
      typeof navigator.canShare === "function" ? navigator.canShare.bind(navigator) : null;
    URL.createObjectURL = function patchedPoolsideSaveImageCreateObjectUrl(object) {
      const href = originalCreateObjectUrl(object);
      if (object instanceof Blob) {
        captureBlobMetrics(href, object);
      }
      return href;
    };

    const originalClick = HTMLAnchorElement.prototype.click;
    const captureAnchorClick = (anchor: HTMLAnchorElement) => {
      if (!anchor.download) {
        return false;
      }

      windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.entries.push({
        download: anchor.download,
        href: anchor.href,
      });
      return true;
    };

    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value(data?: ShareData) {
        if (Array.isArray(data?.files) && data.files.length > 0) {
          return true;
        }

        return originalCanShare ? originalCanShare(data) : false;
      },
    });

    Object.defineProperty(navigator, "share", {
      configurable: true,
      async value(data?: ShareData) {
        const fileCandidate = Array.isArray(data?.files) ? data.files[0] : null;
        if (fileCandidate instanceof Blob) {
          const href = URL.createObjectURL(fileCandidate);
          const download =
            "name" in fileCandidate && typeof fileCandidate.name === "string"
              ? fileCandidate.name
              : "shared-poolside-note.png";

          windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.entries.push({
            download,
            href,
          });
          return;
        }

        if (originalShare) {
          await originalShare(data);
        }
      },
    });

    HTMLAnchorElement.prototype.click = function patchedPoolsideSaveImageAnchorClick() {
      if (captureAnchorClick(this)) {
        return undefined;
      }

      return originalClick.call(this);
    };

    const originalCreateElement = Document.prototype.createElement;
    Document.prototype.createElement = function patchedPoolsideSaveImageCreateElement(
      tagName: string,
      options?: ElementCreationOptions
    ) {
      const element = originalCreateElement.call(this, tagName, options);
      if (tagName.toLowerCase() === "a") {
        Object.defineProperty(element, "click", {
          configurable: true,
          value() {
            if (captureAnchorClick(element as HTMLAnchorElement)) {
              return undefined;
            }

            return originalClick.call(element);
          },
        });
      }

      return element;
    };

    const saveImageButton = document.querySelector<HTMLButtonElement>(
      '[data-testid="poolside-preview-save-image"]'
    );
    if (saveImageButton && saveImageButton.dataset.poolsideSaveImageProbeAttached !== "true") {
      saveImageButton.dataset.poolsideSaveImageProbeAttached = "true";
      saveImageButton.addEventListener("click", () => {
        windowWithProbe.__fsPoolsideSaveImageDownloadProbe__?.buttonClicks.push({
          buttonDisabled: saveImageButton.disabled,
          previewReady:
            document
              .querySelector('[data-testid="poolside-preview-frame-state"]')
              ?.getAttribute("data-preview-ready") ?? null,
        });
      });
    }

    windowWithProbe.__fsPoolsideSaveImageDownloadPatched__ = true;
  });
}

async function expectSaveImageDownloadCount(page: Page, expectedCount: number) {
  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() => {
            const probe = (
              window as typeof window & {
                __fsPoolsideSaveImageDownloadProbe__?: {
                  entries: Array<{ download: string; href: string }>;
                };
              }
            ).__fsPoolsideSaveImageDownloadProbe__;
            return probe?.entries.length ?? 0;
          });
        } catch (error) {
          if (isTransientPageEvaluationError(error)) {
            return -1;
          }
          throw error;
        }
      },
      {
        timeout: 15_000,
      }
    )
    .toBe(expectedCount);
}

async function expectSaveImageDownloadIntent(page: Page, expectedFileName: string) {
  await expect
    .poll(
      async () => {
        try {
          return await page.evaluate(() => {
            const probe = (
              window as typeof window & {
                __fsPoolsideSaveImageDownloadProbe__?: {
                  entries: Array<{ download: string; href: string }>;
                  buttonClicks: Array<{
                    buttonDisabled: boolean;
                    previewReady: string | null;
                  }>;
                  errors: string[];
                  metricsByHref: Record<string, SaveImageExportMetrics>;
                };
              }
            ).__fsPoolsideSaveImageDownloadProbe__;
            const entries = probe?.entries ?? [];
            const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
            if (latestEntry) {
              return latestEntry;
            }

            const errorText = document
              .querySelector('[data-testid="poolside-preview-save-image-error"]')
              ?.textContent?.trim();
            const buttonText = document
              .querySelector('[data-testid="poolside-preview-save-image"]')
              ?.textContent?.trim();
            const metricCount = probe ? Object.keys(probe.metricsByHref).length : 0;
            const clickCount = probe?.buttonClicks.length ?? 0;
            const latestButtonClick = clickCount > 0 ? probe?.buttonClicks[clickCount - 1] : null;
            const probeErrors = probe?.errors.join("; ") ?? "";

            return {
              download: errorText
                ? `ERROR: ${errorText}`
                : probeErrors
                  ? `PROBE_ERROR: ${probeErrors}`
                  : `NO_ENTRY button=${buttonText ?? "missing"} metrics=${metricCount} clicks=${clickCount} latestClick=${latestButtonClick ? JSON.stringify(latestButtonClick) : "none"}`,
              href: window.location.href,
            };
          });
        } catch (error) {
          if (isTransientPageEvaluationError(error)) {
            return {
              download: "TRANSIENT_PAGE_EVALUATION",
              href: page.url(),
            };
          }
          throw error;
        }
      },
      {
        timeout: 15_000,
      }
    )
    .toEqual({
      download: expectedFileName,
      href: expect.stringContaining("blob:"),
    });
}

async function expectSaveImageNotice(page: Page, expectedFileName: string) {
  await expect
    .poll(
      async () => {
        const value = await page.getByTestId("poolside-preview-save-image-notice").textContent();
        return (
          typeof value === "string" &&
          (value.includes(expectedFileName) || value.includes("Image ready to share."))
        );
      },
      { timeout: 5_000 }
    )
    .toBe(true);
}

function isTransientPageEvaluationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /execution context was destroyed|navigation|cannot find context/i.test(message);
}

async function readLatestSaveImageExportMetrics(page: Page) {
  const metricsHandle = await page.waitForFunction(
    () => {
      const probe = (
        window as typeof window & {
          __fsPoolsideSaveImageDownloadProbe__?: {
            entries: Array<{ download: string; href: string }>;
            errors: string[];
            metricsByHref: Record<string, SaveImageExportMetrics>;
          };
        }
      ).__fsPoolsideSaveImageDownloadProbe__;
      const entries = probe?.entries ?? [];
      const latestEntry = entries[entries.length - 1];
      if (!probe || !latestEntry) {
        return null;
      }

      const metrics = probe.metricsByHref[latestEntry.href];
      if (metrics) {
        return metrics;
      }

      if (probe.errors.length > 0) {
        throw new Error(probe.errors.join("; "));
      }

      return null;
    },
    undefined,
    { timeout: 15_000 }
  );

  return (await metricsHandle.jsonValue()) as SaveImageExportMetrics;
}

async function expectSaveImageCropMatchesNote(page: Page) {
  const metrics = await readLatestSaveImageExportMetrics(page);

  expect(Math.abs(metrics.imageWidth - metrics.expectedImageWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics.imageHeight - metrics.expectedImageHeight)).toBeLessThanOrEqual(1);
  expect(metrics.leftEdgeStrongPixels).toBe(0);
  expect(metrics.topEdgeStrongPixels).toBe(0);
  expect(metrics.rightEdgeStrongPixels).toBe(0);
  expect(metrics.bottomEdgeStrongPixels).toBe(0);
}

async function expectPoolsideNoteContentWithinBounds(page: Page) {
  await expect
    .poll(
      async () =>
        await page.evaluate(() => {
          const previewFrame = document.querySelector<HTMLIFrameElement>(
            '[data-testid="poolside-preview-frame"]'
          );
          const frameDocument =
            previewFrame?.contentDocument ?? previewFrame?.contentWindow?.document;
          const noteElement = frameDocument?.querySelector<HTMLElement>(
            '[data-testid="workout-pdf-print-view"]'
          );

          if (!noteElement) {
            return null;
          }

          const noteRect = noteElement.getBoundingClientRect();
          let maxRightOverflow = 0;
          let maxBottomOverflow = 0;
          for (const child of Array.from(noteElement.querySelectorAll<HTMLElement>("*"))) {
            const childRect = child.getBoundingClientRect();
            if (childRect.width <= 0 || childRect.height <= 0) {
              continue;
            }

            maxRightOverflow = Math.max(maxRightOverflow, childRect.right - noteRect.right);
            maxBottomOverflow = Math.max(maxBottomOverflow, childRect.bottom - noteRect.bottom);
          }

          return {
            bottom: Math.ceil(maxBottomOverflow),
            right: Math.ceil(maxRightOverflow),
          };
        }),
      {
        timeout: 15_000,
      }
    )
    .toEqual({ bottom: 0, right: 0 });
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

  await expect(page.getByTestId("poolside-preview-frame-state")).toHaveAttribute(
    "data-preview-ready",
    "true",
    {
      timeout: 15_000,
    }
  );
  await expect(page.getByTestId("poolside-preview-frame-loading")).toBeHidden({
    timeout: 15_000,
  });
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

  await page.waitForTimeout(350);
  await expect(page.getByTestId("poolside-preview-frame-state")).toHaveAttribute(
    "data-preview-ready",
    "true"
  );
  await expect(page.getByTestId("poolside-preview-frame-loading")).toBeHidden();
  await expect(page.getByTestId("poolside-preview-save-image")).toBeEnabled();
}

test.describe("poolside save image export", () => {
  test("exports PNG from both local-draft and saved-workout preview entry paths", async ({
    page,
  }, testInfo) => {
    runOnceOnMobileChromium(testInfo.project.name);
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
    await expectPoolsideNoteContentWithinBounds(localPreviewPopup);
    await installSaveImageDownloadProbe(localPreviewPopup);
    await localPreviewPopup.getByTestId("poolside-preview-save-image").click();
    await expectSaveImageDownloadIntent(localPreviewPopup, expectedPortraitFileName);
    await expectSaveImageDownloadCount(localPreviewPopup, 1);
    await expectSaveImageCropMatchesNote(localPreviewPopup);
    await expectSaveImageNotice(localPreviewPopup, expectedPortraitFileName);
    await expect(localPreviewPopup.getByTestId("poolside-preview-save-image")).toBeEnabled();
    await installSaveImageDownloadProbe(localPreviewPopup);
    await localPreviewPopup.getByTestId("poolside-preview-save-image").click();
    await expectSaveImageDownloadIntent(localPreviewPopup, expectedPortraitFileName);
    await expectSaveImageDownloadCount(localPreviewPopup, 1);
    await expectSaveImageCropMatchesNote(localPreviewPopup);
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
    await expectPoolsideNoteContentWithinBounds(savedPreviewPopup);
    await installSaveImageDownloadProbe(savedPreviewPopup);
    await savedPreviewPopup.getByTestId("poolside-preview-save-image").click();
    await expectSaveImageDownloadIntent(savedPreviewPopup, expectedLandscapeFileName);
    await expectSaveImageDownloadCount(savedPreviewPopup, 1);
    await expectSaveImageCropMatchesNote(savedPreviewPopup);
    await expectSaveImageNotice(savedPreviewPopup, expectedLandscapeFileName);
    await savedPreviewPopup.close();
  });
});
