"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

type Props = {
  lessonTitle: string;
  sharePath: string;
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

export default function CourseOpenOnPhoneCard({ lessonTitle, sharePath }: Props) {
  const origin = useWindowOrigin();
  const [qrState, setQrState] = useState<QrState>(null);
  const [qrRetryNonce, setQrRetryNonce] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
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
    setActionError(null);
    setActionNotice(null);
    setCopied(false);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setActionNotice("Link copied.");
    } catch {
      setActionError("Could not copy link automatically.");
    }
  }

  async function shareLink() {
    if (!shareUrl) return;
    setActionError(null);
    setActionNotice(null);

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
      setActionNotice("Link shared.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/abort|cancel/i.test(message)) return;
      setActionError("Could not open share sheet right now.");
    }
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
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600">
            Loading QR...
          </p>
        ) : null}

        {qrError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
            <p>{qrError}</p>
            <button
              type="button"
              onClick={() => setQrRetryNonce((value) => value + 1)}
              className="mt-2 inline-flex h-7 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
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
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
          data-testid="course-open-on-phone-share"
        >
          Share link
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
          data-testid="course-open-on-phone-copy"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      {actionNotice ? (
        <p className="mt-2 text-[12px] font-medium text-emerald-700">{actionNotice}</p>
      ) : null}
      {actionError ? (
        <p className="mt-2 text-[12px] font-medium text-rose-700">{actionError}</p>
      ) : null}
    </div>
  );
}
