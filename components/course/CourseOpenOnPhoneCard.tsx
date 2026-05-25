"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { generateQrAssets } from "@/lib/qr-links/codegen";

type QrReadyState = {
  status: "ready";
  url: string;
  svgDataUrl: string;
};

type QrErrorState = {
  status: "error";
  url: string;
  message: string;
};

type QrState = QrReadyState | QrErrorState | null;
type CourseOpenOnPhoneFeedbackTone = "loading" | "success" | "error";
type ActionFeedbackState = {
  tone: Extract<CourseOpenOnPhoneFeedbackTone, "success" | "error">;
  message: string;
} | null;

type Props = {
  lessonTitle: string;
  sharePath: string;
};

const feedbackToneClasses: Record<CourseOpenOnPhoneFeedbackTone, string> = {
  loading: "border-slate-200 bg-white text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const EMPTY_SUBSCRIBE = () => () => {};

function useWindowOrigin(): string {
  return useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => window.location.origin,
    () => ""
  );
}

function resolveShareUrl(origin: string, sharePath: string): string {
  if (!origin) return "";
  try {
    return new URL(sharePath, origin).toString();
  } catch {
    return "";
  }
}

function CourseOpenOnPhoneFeedback({
  id,
  tone,
  children,
  className = "",
  testId,
}: {
  id?: string;
  tone: CourseOpenOnPhoneFeedbackTone;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  const isError = tone === "error";

  return (
    <div
      id={id}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={`rounded-lg border px-3 py-2 text-[12px] leading-5 ${feedbackToneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default function CourseOpenOnPhoneCard({ lessonTitle, sharePath }: Props) {
  const origin = useWindowOrigin();
  const feedbackBaseId = useId();
  const qrFeedbackId = `${feedbackBaseId}-qr-feedback`;
  const actionFeedbackId = `${feedbackBaseId}-action-feedback`;
  const [qrState, setQrState] = useState<QrState>(null);
  const [qrRetryNonce, setQrRetryNonce] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedbackState>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => resolveShareUrl(origin, sharePath), [origin, sharePath]);

  useEffect(() => {
    if (!shareUrl) return;

    let cancelled = false;

    void generateQrAssets(shareUrl)
      .then((assets) => {
        if (cancelled) return;
        setQrState({
          status: "ready",
          url: shareUrl,
          svgDataUrl: assets.svgDataUrl,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setQrState({
          status: "error",
          url: shareUrl,
          message: "Could not generate QR image right now.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [shareUrl, qrRetryNonce]);

  const isQrLoading = Boolean(shareUrl) && (qrState === null || qrState.url !== shareUrl);
  const qrError = qrState?.status === "error" && qrState.url === shareUrl ? qrState.message : null;
  const qrSvgDataUrl =
    qrState?.status === "ready" && qrState.url === shareUrl ? qrState.svgDataUrl : null;

  async function copyLink() {
    if (!shareUrl) return;
    setActionFeedback(null);
    setCopied(false);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setActionFeedback({ tone: "success", message: "Link copied." });
    } catch {
      setActionFeedback({ tone: "error", message: "Could not copy link automatically." });
    }
  }

  async function shareLink() {
    if (!shareUrl) return;
    setActionFeedback(null);

    const shareApi = navigator.share;
    if (typeof shareApi !== "function") {
      await copyLink();
      return;
    }

    try {
      await shareApi({
        title: `FreeSwimming: ${lessonTitle}`,
        text: `Continue lesson: ${lessonTitle}`,
        url: shareUrl,
      });
      setActionFeedback({ tone: "success", message: "Link shared." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/abort|cancel/i.test(message)) return;
      setActionFeedback({ tone: "error", message: "Could not open share sheet right now." });
    }
  }

  function retryQrGeneration() {
    setQrState(null);
    setQrRetryNonce((value) => value + 1);
  }

  return (
    <div
      className="mt-3 rounded-2xl border border-teal-200/70 bg-teal-50/45 p-3"
      data-testid="course-open-on-phone-card"
    >
      <h4 className="text-[13px] font-semibold text-slate-900">Open on phone</h4>
      <p className="mt-1 text-[12px] leading-5 text-slate-600">
        Desktop/tablet: scan the QR code. Mobile: share or copy the lesson link.
      </p>

      <div className="mt-3 hidden sm:block">
        {isQrLoading ? (
          <CourseOpenOnPhoneFeedback
            id={qrFeedbackId}
            tone="loading"
            testId="course-open-on-phone-qr-loading"
          >
            Loading QR...
          </CourseOpenOnPhoneFeedback>
        ) : null}

        {qrError ? (
          <CourseOpenOnPhoneFeedback
            id={qrFeedbackId}
            tone="error"
            testId="course-open-on-phone-qr-error"
          >
            <p>{qrError}</p>
            <button
              type="button"
              onClick={retryQrGeneration}
              aria-describedby={qrFeedbackId}
              className="mt-2 inline-flex h-7 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Retry
            </button>
          </CourseOpenOnPhoneFeedback>
        ) : null}

        {qrSvgDataUrl ? (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-2">
            <Image
              src={qrSvgDataUrl}
              alt={`QR code for ${lessonTitle}`}
              width={128}
              height={128}
              unoptimized
              className="h-32 w-32"
              data-testid="course-open-on-phone-qr"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void shareLink()}
          aria-describedby={actionFeedback ? actionFeedbackId : undefined}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
          data-testid="course-open-on-phone-share"
        >
          Share link
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          aria-describedby={actionFeedback ? actionFeedbackId : undefined}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
          data-testid="course-open-on-phone-copy"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      {actionFeedback ? (
        <CourseOpenOnPhoneFeedback
          id={actionFeedbackId}
          tone={actionFeedback.tone}
          className="mt-2 font-medium"
          testId="course-open-on-phone-action-feedback"
        >
          {actionFeedback.message}
        </CourseOpenOnPhoneFeedback>
      ) : null}
    </div>
  );
}
