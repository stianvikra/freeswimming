"use client";

import { useId, useState } from "react";
import CommerceActionFeedback from "@/components/commerce/CommerceActionFeedback";
import { cx } from "@/components/ui/cx";

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
const buttonClassName =
  "fs-cta-secondary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

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
  const feedbackId = useId();
  const feedbackMessage = pending ? "Opening billing portal..." : error;
  const feedbackTone = pending ? "pending" : error ? "error" : null;

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
        aria-describedby={feedbackMessage ? feedbackId : undefined}
        className={cx(buttonClassName, className)}
      >
        {pending ? "Opening billing..." : "Manage billing"}
      </button>
      {feedbackMessage && feedbackTone ? (
        <CommerceActionFeedback id={feedbackId} tone={feedbackTone} testId="portal-feedback">
          {feedbackMessage}
        </CommerceActionFeedback>
      ) : null}
    </div>
  );
}
