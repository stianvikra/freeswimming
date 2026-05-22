"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { getAdminScreenshotCaptureDriver } from "@/lib/admin/screenshot-capture-client";
import {
  buildAdminScreenshotSelectionFromDrag,
  buildDefaultAdminScreenshotSelection,
  classifyAdminScreenshotCaptureError,
  type AdminScreenshotCapturePhase,
  type AdminScreenshotFrame,
  type AdminScreenshotSelection,
} from "@/lib/admin/screenshot-capture";

type Props = {
  onCaptureReady: (file: File) => Promise<void> | void;
  buttonLabel?: string;
  buttonTestId?: string;
  dialogTitle?: string;
  disabled?: boolean;
  className?: string;
};

type PointerPoint = {
  x: number;
  y: number;
};

type HiddenCaptureTarget = {
  element: HTMLElement;
  visibility: string;
  pointerEvents: string;
};

function hideAdminScreenshotCaptureTargets(): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  const selector = '[data-admin-screenshot-hide-during-capture="true"]';
  const targets = Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => ({
    element,
    visibility: element.style.visibility,
    pointerEvents: element.style.pointerEvents,
  })) satisfies HiddenCaptureTarget[];

  for (const target of targets) {
    target.element.style.visibility = "hidden";
    target.element.style.pointerEvents = "none";
  }

  return () => {
    for (const target of targets) {
      target.element.style.visibility = target.visibility;
      target.element.style.pointerEvents = target.pointerEvents;
    }
  };
}

async function waitForNextPaint() {
  if (typeof window === "undefined") {
    return;
  }

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

function selectionToPercentStyle(params: {
  selection: AdminScreenshotSelection;
  frame: Pick<AdminScreenshotFrame, "width" | "height">;
}) {
  return {
    left: `${(params.selection.x / params.frame.width) * 100}%`,
    top: `${(params.selection.y / params.frame.height) * 100}%`,
    width: `${(params.selection.width / params.frame.width) * 100}%`,
    height: `${(params.selection.height / params.frame.height) * 100}%`,
  };
}

export default function AdminNoteScreenshotCaptureButton({
  onCaptureReady,
  buttonLabel = "Capture screenshot",
  buttonTestId = "admin-note-screenshot-capture-trigger",
  dialogTitle = "Capture a screenshot for this note",
  disabled = false,
  className = "",
}: Props) {
  const captureDriver = useMemo(() => getAdminScreenshotCaptureDriver(), []);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<AdminScreenshotCapturePhase>("idle");
  const [frame, setFrame] = useState<AdminScreenshotFrame | null>(null);
  const [selection, setSelection] = useState<AdminScreenshotSelection | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pointerStartRef = useRef<PointerPoint | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewUrl = useMemo(() => (frame ? URL.createObjectURL(frame.blob) : null), [frame]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetState() {
    setOpen(false);
    setPhase("idle");
    setFrame(null);
    setSelection(null);
    setMessage(null);
    pointerStartRef.current = null;
  }

  function closeDialog() {
    if (phase === "saving") return;
    resetState();
  }

  async function beginCapture() {
    setFrame(null);
    setSelection(null);
    setMessage(null);
    setPhase("requesting_permission");

    if (!captureDriver.isSupported()) {
      setOpen(true);
      setPhase("unsupported");
      setMessage(
        "This browser does not support in-app screenshot capture yet. Use Add images if you already have a screenshot file."
      );
      return;
    }

    let restoreHiddenTargets: () => void = () => undefined;

    try {
      restoreHiddenTargets = hideAdminScreenshotCaptureTargets();
      await waitForNextPaint();
      const nextFrame = await captureDriver.capture();
      restoreHiddenTargets();
      restoreHiddenTargets = () => undefined;
      setOpen(true);
      setFrame(nextFrame);
      setSelection(buildDefaultAdminScreenshotSelection(nextFrame.width, nextFrame.height));
      setPhase("preview");
    } catch (error) {
      restoreHiddenTargets();
      const failure = classifyAdminScreenshotCaptureError(error);
      setOpen(true);
      setPhase(failure.phase);
      setMessage(failure.message);
    }
  }

  function toNaturalPoint(event: React.PointerEvent<HTMLDivElement>): PointerPoint | null {
    if (!frame || !previewRef.current) return null;
    const rect = previewRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    return {
      x: ((event.clientX - rect.left) / rect.width) * frame.width,
      y: ((event.clientY - rect.top) / rect.height) * frame.height,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "preview" || !frame) return;
    const point = toNaturalPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStartRef.current = point;
    setSelection(
      buildAdminScreenshotSelectionFromDrag({
        start: point,
        current: point,
        bounds: frame,
      })
    );
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (phase !== "preview" || !frame || !pointerStartRef.current) return;
    const point = toNaturalPoint(event);
    if (!point) return;

    setSelection(
      buildAdminScreenshotSelectionFromDrag({
        start: pointerStartRef.current,
        current: point,
        bounds: frame,
      })
    );
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStartRef.current = null;
  }

  async function handleSaveScreenshot() {
    if (!frame || !selection || phase === "saving") return;

    setPhase("saving");
    setMessage(null);

    try {
      const file = await captureDriver.cropToFile({
        frame,
        selection,
      });
      await onCaptureReady(file);
      resetState();
    } catch (error) {
      setPhase("preview");
      setMessage(error instanceof Error ? error.message : "Could not save screenshot.");
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        data-testid={buttonTestId}
        disabled={disabled}
        onClick={() => {
          void beginCapture();
        }}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>

      <Modal open={open} onClose={closeDialog} ariaLabel={dialogTitle}>
        <div
          className="flex h-full min-h-0 flex-col"
          data-testid="admin-note-screenshot-capture-dialog"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                Screenshot capture
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{dialogTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use browser capture, then drag over the preview if you want a tighter crop before
                save.
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              disabled={phase === "saving"}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {phase === "requesting_permission" ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4 text-sm text-blue-900">
                <p className="font-semibold">Choose what to capture</p>
                <p className="mt-2">
                  Select the relevant tab or window in the browser share dialog. Nothing is saved
                  until you confirm the preview here.
                </p>
              </div>
            ) : null}

            {phase === "permission_denied" ||
            phase === "cancelled" ||
            phase === "unsupported" ||
            phase === "error" ? (
              <AdminManagerState
                tone="warning"
                title={
                  phase === "unsupported"
                    ? "Capture is not available here"
                    : "Capture did not start"
                }
                density="spacious"
                className="!mt-0"
                actions={
                  <>
                    {phase !== "unsupported" ? (
                      <button
                        type="button"
                        onClick={() => {
                          void beginCapture();
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Retry capture
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Use image upload instead
                    </button>
                  </>
                }
                actionsClassName="mt-4 flex flex-wrap gap-2"
              >
                {message}
              </AdminManagerState>
            ) : null}

            {(phase === "preview" || phase === "saving") && frame && previewUrl && selection ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    Preview
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Drag on the preview to choose a smaller region, or keep the full capture.
                  </p>
                </div>

                {message ? (
                  <AdminManagerState
                    tone="error"
                    announcement="polite"
                    density="compact"
                    className="!mt-0"
                  >
                    {message}
                  </AdminManagerState>
                ) : null}

                <div
                  ref={previewRef}
                  className="relative w-full touch-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/5"
                  style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  data-testid="admin-note-screenshot-preview-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="absolute inset-0 h-full w-full object-cover select-none"
                    draggable={false}
                    data-testid="admin-note-screenshot-preview-image"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-slate-950/10" />
                  <div
                    className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/15 shadow-[0_0_0_9999px_rgba(15,23,42,0.22)]"
                    style={selectionToPercentStyle({ selection, frame })}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                  Selected region: {Math.round(selection.width)} × {Math.round(selection.height)} px
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    disabled={phase === "saving"}
                    onClick={() =>
                      setSelection(buildDefaultAdminScreenshotSelection(frame.width, frame.height))
                    }
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Use full capture
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={closeDialog}
                      disabled={phase === "saving"}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleSaveScreenshot();
                      }}
                      disabled={phase === "saving"}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {phase === "saving" ? "Saving…" : "Save screenshot"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}
