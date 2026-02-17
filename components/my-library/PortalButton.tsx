"use client";

import { useState } from "react";

type Props = {
  returnPath?: string;
  className?: string;
  onNavigate?: (url: string) => void;
};

type PortalResponse = {
  ok: boolean;
  url?: string;
  error?: string;
};

const DEFAULT_ERROR_MESSAGE = "Could not open billing portal right now. Please try again.";

export function redirectToUrl(url: string) {
  window.location.assign(url);
}

export default function PortalButton({
  returnPath = "/my-library",
  className = "",
  onNavigate = redirectToUrl,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>("");

  async function onClick() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnPath }),
      });

      const json = (await response.json()) as PortalResponse;
      if (!response.ok || !json.ok || !json.url) {
        throw new Error(json.error || DEFAULT_ERROR_MESSAGE);
      }

      onNavigate(json.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      setError(message);
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        data-testid="my-library-portal-button"
        className={`inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {pending ? "Opening billing..." : "Manage billing"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
