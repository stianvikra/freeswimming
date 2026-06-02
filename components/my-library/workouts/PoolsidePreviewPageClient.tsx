"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { cx } from "@/components/ui/cx";
import { BRAND_FONT_PUBLIC_PATH, getWorkoutPdfLogoPath } from "@/lib/brand";
import {
  applyWorkoutPoolsidePreviewSettings,
  buildWorkoutPoolsideImageFileName,
  buildWorkoutPoolsidePrintFrameHref,
  normalizeWorkoutPoolsidePreviewSettings,
  readStoredWorkoutPoolsidePreviewDraft,
  type StoredWorkoutPoolsidePreviewDraft,
  type WorkoutPoolsidePreviewSettings,
} from "@/lib/workouts/poolside-preview";
import { getWorkoutPoolsideImageExportDriver } from "@/lib/workouts/poolside-image-export-client";
import { buildWorkoutPdfHtmlDocument } from "@/lib/workouts/shared";

const CSS_PIXELS_PER_MM = 96 / 25.4;
const EMBEDDED_PREVIEW_LOADING_HEIGHT = 180;
const EMBEDDED_PREVIEW_MIN_READY_HEIGHT = 220;
const EMBEDDED_PREVIEW_FRAME_PADDING = 48;
const EMBEDDED_PREVIEW_STAGE_GUTTER = 12;
const previewActionBaseClass =
  "inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const previewPrimaryActionClass = cx("fs-cta-primary", previewActionBaseClass);
const previewSecondaryActionClass = cx("fs-cta-secondary hover:bg-white", previewActionBaseClass);

function getEmbeddedPreviewFallbackWidth(layout: WorkoutPoolsidePreviewSettings["printLayout"]) {
  return layout === "landscape" ? 644 : 388;
}

function readSingleSearchParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value && value.trim().length > 0 ? value : null;
}

function arePreviewSettingsEqual(
  left: WorkoutPoolsidePreviewSettings,
  right: WorkoutPoolsidePreviewSettings
) {
  return (
    left.printStyle === right.printStyle &&
    left.printLayout === right.printLayout &&
    left.notationMode === right.notationMode &&
    left.restLayout === right.restLayout &&
    left.sessionNoteMode === right.sessionNoteMode &&
    left.stepNotesMode === right.stepNotesMode
  );
}

function isShareCancelled(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /abort|cancel/i.test(message);
}

function getElementRenderSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    width: Math.ceil(Math.max(rect.width, element.offsetWidth, element.scrollWidth)),
    height: Math.ceil(Math.max(rect.height, element.offsetHeight, element.scrollHeight)),
  };
}

function isNoteElementReadyForCapture(element: HTMLElement | null): element is HTMLElement {
  if (!element || !element.isConnected) {
    return false;
  }

  const size = getElementRenderSize(element);
  return size.width > 0 && size.height > 0;
}

export default function PoolsidePreviewPageClient() {
  const searchParams = useSearchParams();
  const searchSignature = searchParams.toString();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const previewSource = useMemo(() => {
    const params = new URLSearchParams(searchSignature);
    return {
      workoutId: readSingleSearchParam(params, "workoutId"),
      previewId: readSingleSearchParam(params, "previewId"),
      focusIds: params.getAll("focusId"),
    };
  }, [searchSignature]);
  const [settings, setSettings] = useState<WorkoutPoolsidePreviewSettings>(() =>
    normalizeWorkoutPoolsidePreviewSettings({
      printStyle: searchParams.get("printStyle"),
      printLayout: searchParams.get("printLayout"),
      notationMode: searchParams.get("notationMode"),
      restLayout: searchParams.get("restLayout"),
      sessionNoteMode: searchParams.get("sessionNoteMode"),
      stepNotesMode: searchParams.get("stepNotesMode"),
    })
  );
  const [localPreviewDraft, setLocalPreviewDraft] = useState<
    StoredWorkoutPoolsidePreviewDraft | null | undefined
  >(undefined);
  const [previewViewportWidth, setPreviewViewportWidth] = useState(0);
  const [embeddedPreviewHeight, setEmbeddedPreviewHeight] = useState(
    EMBEDDED_PREVIEW_MIN_READY_HEIGHT
  );
  const [embeddedPreviewViewportWidth, setEmbeddedPreviewViewportWidth] = useState(() =>
    getEmbeddedPreviewFallbackWidth(settings.printLayout)
  );
  const [embeddedNoteReady, setEmbeddedNoteReady] = useState(false);
  const saveImageFeedbackId = useId();
  const [saveImagePending, setSaveImagePending] = useState(false);
  const [saveImageError, setSaveImageError] = useState("");
  const [saveImageNotice, setSaveImageNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchSignature);
    const nextSettings = normalizeWorkoutPoolsidePreviewSettings({
      printStyle: params.get("printStyle"),
      printLayout: params.get("printLayout"),
      notationMode: params.get("notationMode"),
      restLayout: params.get("restLayout"),
      sessionNoteMode: params.get("sessionNoteMode"),
      stepNotesMode: params.get("stepNotesMode"),
    });
    setSettings((current) =>
      arePreviewSettingsEqual(current, nextSettings) ? current : nextSettings
    );

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const currentPath = `${url.pathname}${url.search}`;
      applyWorkoutPoolsidePreviewSettings(url.searchParams, nextSettings);
      const nextPath = `${url.pathname}?${url.searchParams.toString()}`;

      if (nextPath !== currentPath) {
        window.history.replaceState(null, "", nextPath);
      }
    }
  }, [searchSignature]);

  useEffect(() => {
    if (!previewSource.previewId) {
      setLocalPreviewDraft(undefined);
      return;
    }
    setLocalPreviewDraft(readStoredWorkoutPoolsidePreviewDraft(previewSource.previewId));
  }, [previewSource.previewId]);

  useEffect(() => {
    setEmbeddedPreviewViewportWidth(getEmbeddedPreviewFallbackWidth(settings.printLayout));
  }, [settings.printLayout]);

  useLayoutEffect(() => {
    const viewport = previewViewportRef.current;

    if (!viewport) {
      return;
    }

    const resolveViewportWidth = (measuredWidth: number) => {
      if (measuredWidth > 0) {
        return measuredWidth;
      }

      return Math.max(0, window.innerWidth - 56);
    };

    const measure = () => {
      setPreviewViewportWidth(resolveViewportWidth(viewport.getBoundingClientRect().width));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      const rafId = window.requestAnimationFrame(measure);

      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = resolveViewportWidth(entries[0]?.contentRect.width ?? 0);
      setPreviewViewportWidth((current) =>
        Math.abs(current - nextWidth) < 1 ? current : nextWidth
      );
    });

    observer.observe(viewport);
    const rafId = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [localPreviewDraft, previewSource.previewId, previewSource.workoutId]);

  const previewSourceLabel = previewSource.workoutId ? "Saved workout" : "Current builder state";
  const previewUnavailable =
    !previewSource.workoutId && (!previewSource.previewId || localPreviewDraft === null);
  const previewFrameHref = useMemo(() => {
    if (!previewSource.workoutId) {
      return null;
    }

    return buildWorkoutPoolsidePrintFrameHref(previewSource.workoutId, {
      selectedFocusIds: previewSource.focusIds,
      settings,
    });
  }, [previewSource.focusIds, previewSource.workoutId, settings]);
  const previewFrameDoc = useMemo(() => {
    if (!localPreviewDraft || typeof window === "undefined") {
      return null;
    }

    return buildWorkoutPdfHtmlDocument(localPreviewDraft.draft, {
      draftState: localPreviewDraft.draftState,
      variant: "poolside",
      focusPoints: localPreviewDraft.focusPoints,
      poolsidePrintStyle: settings.printStyle,
      poolsidePrintLayout: settings.printLayout,
      poolsideNotationMode: settings.notationMode,
      poolsideRestLayout: settings.restLayout,
      poolsideSessionNoteMode: settings.sessionNoteMode,
      poolsideStepNotesMode: settings.stepNotesMode,
      swimmerName: localPreviewDraft.swimmerName,
      logoUrl: new URL(
        getWorkoutPdfLogoPath({
          variant: "poolside",
          poolsidePrintStyle: settings.printStyle,
        }),
        window.location.origin
      ).toString(),
      fontUrl: new URL(BRAND_FONT_PUBLIC_PATH, window.location.origin).toString(),
      previewChrome: "embedded",
    });
  }, [localPreviewDraft, settings]);
  const previewFrameKey = useMemo(
    () =>
      [
        previewFrameHref ?? "local-draft",
        localPreviewDraft?.updatedAt ?? "no-local-draft",
        settings.printStyle,
        settings.printLayout,
        settings.notationMode,
        settings.restLayout,
        settings.sessionNoteMode,
        settings.stepNotesMode,
      ].join("|"),
    [localPreviewDraft?.updatedAt, previewFrameHref, settings]
  );

  useLayoutEffect(() => {
    setEmbeddedNoteReady(false);
    setEmbeddedPreviewHeight(EMBEDDED_PREVIEW_MIN_READY_HEIGHT);
    setEmbeddedPreviewViewportWidth(getEmbeddedPreviewFallbackWidth(settings.printLayout));
  }, [previewFrameKey, settings.printLayout]);

  function syncPreviewSettings(nextSettings: WorkoutPoolsidePreviewSettings) {
    setSettings(nextSettings);

    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    applyWorkoutPoolsidePreviewSettings(url.searchParams, nextSettings);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  function updateSetting<Key extends keyof WorkoutPoolsidePreviewSettings>(
    key: Key,
    value: WorkoutPoolsidePreviewSettings[Key]
  ) {
    syncPreviewSettings({
      ...settings,
      [key]: value,
    });
  }

  function handlePrint() {
    const previewWindow = iframeRef.current?.contentWindow;

    if (previewWindow) {
      previewWindow.focus?.();
      previewWindow.print();
      return;
    }

    window.print();
  }

  function handleClose() {
    if (window.opener) {
      window.close();
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/my-library/workouts");
  }

  function syncEmbeddedPreviewMetrics() {
    const frame = iframeRef.current;
    const frameWindow = frame?.contentWindow;
    const frameDocument = frameWindow?.document;

    if (!frameDocument) {
      return;
    }

    const measure = () => {
      const article = frameDocument.querySelector<HTMLElement>(
        '[data-testid="workout-pdf-print-view"]'
      );
      const shell = frameDocument.querySelector<HTMLElement>(".shell");
      if (!isNoteElementReadyForCapture(article)) {
        setEmbeddedNoteReady(false);
        return false;
      }

      const renderedPageWidthMm = Number(article.getAttribute("data-poolside-page-width-mm") ?? "");
      const articleSize = getElementRenderSize(article);
      const nextHeight = Math.max(
        EMBEDDED_PREVIEW_MIN_READY_HEIGHT,
        Math.ceil(Math.max(shell?.scrollHeight ?? 0, articleSize.height))
      );
      const measuredViewportWidth = Math.ceil(
        Math.max(articleSize.width + EMBEDDED_PREVIEW_FRAME_PADDING, EMBEDDED_PREVIEW_FRAME_PADDING)
      );
      const expectedViewportWidth = Number.isFinite(renderedPageWidthMm)
        ? Math.max(
            320,
            Math.ceil(renderedPageWidthMm * CSS_PIXELS_PER_MM + EMBEDDED_PREVIEW_FRAME_PADDING)
          )
        : getEmbeddedPreviewFallbackWidth(settings.printLayout);
      const nextViewportWidth = Math.max(expectedViewportWidth, measuredViewportWidth);

      setEmbeddedPreviewHeight((current) => (current === nextHeight ? current : nextHeight));
      setEmbeddedPreviewViewportWidth((current) =>
        current === nextViewportWidth ? current : nextViewportWidth
      );
      setEmbeddedNoteReady(true);
      return true;
    };

    measure();
    frameWindow.requestAnimationFrame?.(() => {
      measure();
    });
    frameWindow.setTimeout(measure, 160);
    frameWindow.setTimeout(measure, 420);
  }

  async function resolvePreviewNoteForExport() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const frameDocument = iframeRef.current?.contentWindow?.document ?? null;
      const noteElement =
        frameDocument?.querySelector<HTMLElement>('[data-testid="workout-pdf-print-view"]') ?? null;

      if (frameDocument && isNoteElementReadyForCapture(noteElement)) {
        return { frameDocument, noteElement };
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 80);
      });
    }

    throw new Error("Poolside note is not ready to export yet. Try again.");
  }

  function triggerImageDownload(file: File) {
    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function shouldPreferNativeShare() {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
    );
  }

  async function handleSaveImage() {
    if (previewUnavailable || saveImagePending) {
      return;
    }

    setSaveImagePending(true);
    setSaveImageError("");
    setSaveImageNotice("");

    try {
      const { frameDocument, noteElement } = await resolvePreviewNoteForExport();
      const noteTitle =
        frameDocument
          .querySelector<HTMLElement>('[data-testid="workout-pdf-title"]')
          ?.textContent?.trim() ||
        localPreviewDraft?.draft.title?.trim() ||
        "Poolside note";
      const fileName = buildWorkoutPoolsideImageFileName({
        title: noteTitle,
        printLayout: settings.printLayout,
      });
      const blob = await getWorkoutPoolsideImageExportDriver().captureNoteBlob(noteElement);
      const imageFile = new File([blob], fileName, { type: "image/png" });
      const shareApi = navigator.share;
      const canShareFile =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [imageFile] });

      if (shouldPreferNativeShare() && typeof shareApi === "function" && canShareFile) {
        try {
          await shareApi({
            files: [imageFile],
            title: noteTitle,
          });
          setSaveImageNotice("Image ready to share.");
          return;
        } catch (error) {
          if (isShareCancelled(error)) {
            return;
          }
        }
      }

      triggerImageDownload(imageFile);
      setSaveImageNotice(`Saved ${fileName}.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save the poolside note image right now.";
      setSaveImageError(message);
    } finally {
      setSaveImagePending(false);
    }
  }

  const embeddedPreviewScale =
    previewViewportWidth > 0
      ? Math.min(
          1,
          Math.max(0, previewViewportWidth - EMBEDDED_PREVIEW_STAGE_GUTTER * 2) /
            embeddedPreviewViewportWidth
        )
      : 1;
  const embeddedStageWidth = embeddedPreviewViewportWidth * embeddedPreviewScale;
  const embeddedStageHeight = embeddedPreviewHeight * embeddedPreviewScale;
  const embeddedPreviewReady = previewViewportWidth > 0 && embeddedNoteReady;
  const displayedEmbeddedStageHeight = embeddedPreviewReady
    ? embeddedStageHeight
    : EMBEDDED_PREVIEW_LOADING_HEIGHT;
  const saveImageFeedbackTone = saveImagePending
    ? "pending"
    : saveImageError
      ? "error"
      : saveImageNotice
        ? "success"
        : "idle";
  const saveImageFeedbackMessage =
    saveImageFeedbackTone === "pending"
      ? "Preparing image export..."
      : saveImageError || saveImageNotice;
  const saveImageFeedbackTitle =
    saveImageFeedbackTone === "pending"
      ? "Preparing image"
      : saveImageFeedbackTone === "error"
        ? "Image export failed"
        : saveImageNotice.startsWith("Saved ")
          ? "Image saved"
          : "Image ready";
  const saveImageFeedbackTestId =
    saveImageFeedbackTone === "pending"
      ? "poolside-preview-save-image-pending"
      : saveImageFeedbackTone === "error"
        ? "poolside-preview-save-image-error"
        : "poolside-preview-save-image-notice";

  return (
    <main
      data-testid="poolside-preview-page"
      className="min-h-screen overflow-x-hidden bg-slate-100"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-4 px-3 py-4 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-[0_20px_60px_rgba(24,58,107,0.12)]">
          <div className="border-b border-blue-100 bg-blue-50/75 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                  Poolside Note
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-[2rem]">
                  Print Preview
                </h1>
                <p data-testid="poolside-preview-source" className="mt-2 text-sm text-slate-600">
                  {previewSourceLabel}
                </p>
              </div>

              <div data-testid="poolside-preview-actions" className={getMobileActionGroupClass(3)}>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={previewUnavailable}
                  data-testid="poolside-preview-print"
                  className={cx(previewPrimaryActionClass, mobileActionItemClass)}
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={previewUnavailable || saveImagePending || !embeddedNoteReady}
                  aria-describedby={saveImageFeedbackMessage ? saveImageFeedbackId : undefined}
                  data-testid="poolside-preview-save-image"
                  className={cx(previewSecondaryActionClass, mobileActionItemClass)}
                >
                  {saveImagePending ? "Preparing image..." : "Save image"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  data-testid="poolside-preview-close"
                  className={cx(previewSecondaryActionClass, mobileActionItemClass)}
                >
                  Close
                </button>
              </div>
            </div>
            {saveImageFeedbackMessage ? (
              <div
                id={saveImageFeedbackId}
                role={saveImageFeedbackTone === "error" ? "alert" : "status"}
                aria-live={saveImageFeedbackTone === "error" ? "assertive" : "polite"}
                aria-atomic="true"
                data-testid={saveImageFeedbackTestId}
                className={cx(
                  "mt-3 max-w-2xl rounded-xl border px-3 py-2 text-sm leading-6",
                  saveImageFeedbackTone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : saveImageFeedbackTone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-sky-200 bg-sky-50 text-sky-900"
                )}
              >
                <p className="font-semibold">{saveImageFeedbackTitle}</p>
                <p className="text-xs leading-5">{saveImageFeedbackMessage}</p>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <label className="grid gap-2" htmlFor="poolside-preview-style">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Ink usage
                </span>
                <select
                  id="poolside-preview-style"
                  value={settings.printStyle}
                  onChange={(event) =>
                    updateSetting(
                      "printStyle",
                      event.target.value as WorkoutPoolsidePreviewSettings["printStyle"]
                    )
                  }
                  data-testid="poolside-preview-style"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="color">Color mode</option>
                  <option value="ink_saver">Ink saver</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-layout">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Layout
                </span>
                <select
                  id="poolside-preview-layout"
                  value={settings.printLayout}
                  onChange={(event) =>
                    updateSetting(
                      "printLayout",
                      event.target.value as WorkoutPoolsidePreviewSettings["printLayout"]
                    )
                  }
                  data-testid="poolside-preview-layout"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-notation">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Abbreviations
                </span>
                <select
                  id="poolside-preview-notation"
                  value={settings.notationMode}
                  onChange={(event) =>
                    updateSetting(
                      "notationMode",
                      event.target.value as WorkoutPoolsidePreviewSettings["notationMode"]
                    )
                  }
                  data-testid="poolside-preview-notation"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="auto">Auto</option>
                  <option value="full">Complete words</option>
                  <option value="abbreviated">Abbreviated</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-rest-layout">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Rest placement
                </span>
                <select
                  id="poolside-preview-rest-layout"
                  value={settings.restLayout}
                  onChange={(event) =>
                    updateSetting(
                      "restLayout",
                      event.target.value as WorkoutPoolsidePreviewSettings["restLayout"]
                    )
                  }
                  data-testid="poolside-preview-rest-layout"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="auto">Auto</option>
                  <option value="inline">All inline</option>
                  <option value="below_step">All separate line</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-session-note">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Session note
                </span>
                <select
                  id="poolside-preview-session-note"
                  value={settings.sessionNoteMode}
                  onChange={(event) =>
                    updateSetting(
                      "sessionNoteMode",
                      event.target.value as WorkoutPoolsidePreviewSettings["sessionNoteMode"]
                    )
                  }
                  data-testid="poolside-preview-session-note"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="off">Hidden</option>
                  <option value="include">Shown</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-step-notes">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Step notes
                </span>
                <select
                  id="poolside-preview-step-notes"
                  value={settings.stepNotesMode}
                  onChange={(event) =>
                    updateSetting(
                      "stepNotesMode",
                      event.target.value as WorkoutPoolsidePreviewSettings["stepNotesMode"]
                    )
                  }
                  data-testid="poolside-preview-step-notes"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="off">Hidden</option>
                  <option value="drills_only">Drill steps</option>
                  <option value="all">All notes</option>
                </select>
              </label>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {previewSource.previewId &&
            localPreviewDraft === undefined &&
            !previewSource.workoutId ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                Loading preview...
              </div>
            ) : previewUnavailable ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-900">
                This preview is no longer available. Open Print Preview again from the builder or
                from My Swim Sessions.
              </div>
            ) : (
              <div
                ref={previewViewportRef}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 px-2 py-2 sm:px-3 sm:py-3"
              >
                <div
                  className="relative mx-auto"
                  data-testid="poolside-preview-frame-state"
                  data-preview-ready={embeddedPreviewReady ? "true" : "false"}
                  style={{
                    width: `${embeddedStageWidth}px`,
                    height: `${displayedEmbeddedStageHeight}px`,
                    transition: "height 160ms ease",
                  }}
                >
                  {!embeddedPreviewReady ? (
                    <div
                      data-testid="poolside-preview-frame-loading"
                      className="absolute inset-0 grid place-items-center rounded-xl border border-blue-100 bg-white/70 px-4 text-center text-sm font-medium text-slate-600"
                    >
                      Loading note preview...
                    </div>
                  ) : null}
                  <div
                    className={`relative origin-top-left ${
                      embeddedPreviewReady
                        ? "opacity-100"
                        : "pointer-events-none absolute top-0 left-0 opacity-0"
                    }`}
                    aria-hidden={embeddedPreviewReady ? undefined : true}
                    style={{
                      width: `${embeddedPreviewViewportWidth}px`,
                      height: `${embeddedPreviewHeight}px`,
                      transform: `scale(${embeddedPreviewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      key={previewFrameKey}
                      ref={iframeRef}
                      title="Poolside note preview"
                      data-testid="poolside-preview-frame"
                      src={previewFrameHref ?? undefined}
                      srcDoc={previewFrameHref ? undefined : (previewFrameDoc ?? undefined)}
                      onLoad={syncEmbeddedPreviewMetrics}
                      className="block border-0 bg-slate-100"
                      style={{
                        width: `${embeddedPreviewViewportWidth}px`,
                        height: `${embeddedPreviewHeight}px`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
