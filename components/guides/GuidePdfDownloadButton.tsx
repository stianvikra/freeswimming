"use client";

import { useState } from "react";

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError("");

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
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Downloading PDF..." : "Download PDF"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
