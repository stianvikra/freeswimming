"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
const EMBEDDED_PREVIEW_MIN_HEIGHT = 680;
const EMBEDDED_PREVIEW_FRAME_PADDING = 48;
const EMBEDDED_PREVIEW_STAGE_GUTTER = 12;

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
    left.restLayout === right.restLayout
  );
}

function isShareCancelled(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /abort|cancel/i.test(message);
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
    })
  );
  const [localPreviewDraft, setLocalPreviewDraft] = useState<
    StoredWorkoutPoolsidePreviewDraft | null | undefined
  >(undefined);
  const [previewViewportWidth, setPreviewViewportWidth] = useState(() =>
    typeof window === "undefined" ? 0 : Math.max(0, window.innerWidth - 56)
  );
  const [embeddedPreviewHeight, setEmbeddedPreviewHeight] = useState(EMBEDDED_PREVIEW_MIN_HEIGHT);
  const [embeddedPreviewViewportWidth, setEmbeddedPreviewViewportWidth] = useState(() =>
    getEmbeddedPreviewFallbackWidth(settings.printLayout)
  );
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

    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    const measure = () => {
      setPreviewViewportWidth(viewport.getBoundingClientRect().width);
    };

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      setPreviewViewportWidth((current) =>
        Math.abs(current - nextWidth) < 1 ? current : nextWidth
      );
    });

    observer.observe(viewport);
    measure();
    const rafId = window.requestAnimationFrame(measure);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

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
      const root = frameDocument.documentElement;
      const body = frameDocument.body;
      const article = frameDocument.querySelector<HTMLElement>(
        '[data-testid="workout-pdf-print-view"]'
      );
      const shell = frameDocument.querySelector<HTMLElement>(".shell");
      const renderedPageWidthMm = Number(
        article?.getAttribute("data-poolside-page-width-mm") ?? ""
      );
      const nextHeight = Math.max(
        EMBEDDED_PREVIEW_MIN_HEIGHT,
        Math.ceil(
          Math.max(
            root?.scrollHeight ?? 0,
            body?.scrollHeight ?? 0,
            shell?.scrollHeight ?? 0,
            article?.offsetHeight ?? 0
          )
        )
      );
      const measuredViewportWidth = Math.ceil(
        Math.max(
          root?.scrollWidth ?? 0,
          body?.scrollWidth ?? 0,
          shell?.scrollWidth ?? 0,
          (article?.offsetWidth ?? 0) + EMBEDDED_PREVIEW_FRAME_PADDING
        )
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
    };

    measure();
    frameWindow.setTimeout(measure, 160);
  }

  async function resolvePreviewNoteForExport() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const frameDocument = iframeRef.current?.contentWindow?.document ?? null;
      const noteElement =
        frameDocument?.querySelector<HTMLElement>('[data-testid="workout-pdf-print-view"]') ?? null;

      if (frameDocument && noteElement) {
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
    return typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
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
        error instanceof Error ? error.message : "Could not save the poolside note image right now.";
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
  const embeddedPreviewReady = previewViewportWidth > 0;

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
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Poolside Note
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-[2rem]">
                  Print Preview
                </h1>
                <p data-testid="poolside-preview-source" className="mt-2 text-sm text-slate-600">
                  {previewSourceLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={previewUnavailable}
                  data-testid="poolside-preview-print"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={previewUnavailable || saveImagePending}
                  data-testid="poolside-preview-save-image"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveImagePending ? "Preparing image..." : "Save image"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  data-testid="poolside-preview-close"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
            {saveImageNotice ? (
              <p
                role="status"
                data-testid="poolside-preview-save-image-notice"
                className="mt-3 text-sm text-blue-800"
              >
                {saveImageNotice}
              </p>
            ) : null}
            {saveImageError ? (
              <p
                role="alert"
                data-testid="poolside-preview-save-image-error"
                className="mt-3 text-sm text-rose-700"
              >
                {saveImageError}
              </p>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2" htmlFor="poolside-preview-style">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="color">Color mode</option>
                  <option value="ink_saver">Ink saver</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-layout">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-notation">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="auto">Auto</option>
                  <option value="full">Complete words</option>
                  <option value="abbreviated">Abbreviated</option>
                </select>
              </label>

              <label className="grid gap-2" htmlFor="poolside-preview-rest-layout">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="auto">Auto</option>
                  <option value="inline">All inline</option>
                  <option value="below_step">All separate line</option>
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
                  className="mx-auto"
                  style={{
                    width: `${embeddedStageWidth}px`,
                    height: `${embeddedStageHeight}px`,
                    opacity: embeddedPreviewReady ? 1 : 0,
                    transition: "opacity 120ms ease",
                  }}
                >
                  <div
                    className="relative origin-top-left"
                    style={{
                      width: `${embeddedPreviewViewportWidth}px`,
                      height: `${embeddedPreviewHeight}px`,
                      transform: `scale(${embeddedPreviewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
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
