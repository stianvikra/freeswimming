"use client";

import { useId, useState } from "react";
import { cx } from "@/components/ui/cx";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type Props = {
  apiPath: string;
  fallbackFileName?: string;
  className?: string;
};

const DEFAULT_ERROR_MESSAGE = "Could not download PDF right now. Please try again.";

function toFileNameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return fallback;
    }
  }

  const simpleMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return fallback;
}

export default function GuidePdfDownloadButton({
  apiPath,
  fallbackFileName = "guide.pdf",
  className = "",
}: Props) {
  const feedbackId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const feedbackMessage = pending ? "Preparing PDF download..." : error;
  const feedbackTone = pending ? "pending" : error ? "error" : "idle";

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError("");

    void sendClientAnalyticsEvent("item_download_started", {
      apiPath,
    });

    try {
      const response = await fetch(apiPath, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || DEFAULT_ERROR_MESSAGE);
      }

      const blob = await response.blob();
      const filename = toFileNameFromDisposition(
        response.headers.get("content-disposition"),
        fallbackFileName
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cx("relative", feedbackMessage ? "pb-12" : "", className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-describedby={feedbackMessage ? feedbackId : undefined}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Downloading PDF..." : "Download PDF"}
      </button>
      {feedbackMessage ? (
        <p
          id={feedbackId}
          role="status"
          aria-live="polite"
          className={cx(
            "absolute top-12 left-0 z-10 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-lg border px-3 py-2 text-xs leading-5 font-medium",
            feedbackTone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-sky-200 bg-sky-50 text-sky-800"
          )}
        >
          {feedbackMessage}
        </p>
      ) : null}
    </div>
  );
}
