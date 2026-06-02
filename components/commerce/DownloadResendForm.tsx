"use client";

import { useId, useState, type FormEvent } from "react";
import CommerceActionFeedback from "@/components/commerce/CommerceActionFeedback";
import {
  normalizeResendEmail,
  RESEND_DOWNLOAD_FALLBACK_ERROR,
  RESEND_DOWNLOAD_GENERIC_MESSAGE,
} from "@/lib/commerce/download-resend";

type Props = {
  initialEmail?: string;
  nextPath?: string;
  source?: "checkout_success" | "library_recovery" | "claim_entry";
  className?: string;
};

type DownloadResendResponse = {
  ok: boolean;
  error?: string;
  message?: string;
};

export default function DownloadResendForm({
  initialEmail = "",
  nextPath = "/my-library",
  source = "checkout_success",
  className = "",
}: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputId = useId();
  const feedbackId = useId();
  const feedbackMessage = pending ? "Sending access link..." : error || successMessage;
  const feedbackTone = pending ? "pending" : error ? "error" : successMessage ? "success" : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const normalizedEmail = normalizeResendEmail(email);
    if (!normalizedEmail) {
      setError("Enter your purchase email.");
      setSuccessMessage("");
      return;
    }

    setPending(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/download/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          nextPath,
          source,
        }),
      });

      const json = (await response.json()) as DownloadResendResponse;
      if (!response.ok || !json.ok) {
        throw new Error(json.error || RESEND_DOWNLOAD_FALLBACK_ERROR);
      }

      setSuccessMessage(json.message || RESEND_DOWNLOAD_GENERIC_MESSAGE);
    } catch (err) {
      const message = err instanceof Error ? err.message : RESEND_DOWNLOAD_FALLBACK_ERROR;
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-2 ${className}`}>
      <label htmlFor={inputId} className="ui-field-label uppercase">
        Purchase email
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="you@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={feedbackMessage ? feedbackId : undefined}
          className="ui-field min-h-12"
        />
        <button
          type="submit"
          disabled={pending}
          aria-describedby={feedbackMessage ? feedbackId : undefined}
          className="fs-cta-primary inline-flex min-h-12 w-full shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending..." : "Email me access link"}
        </button>
      </div>

      {feedbackMessage && feedbackTone ? (
        <CommerceActionFeedback
          id={feedbackId}
          tone={feedbackTone}
          testId="download-resend-feedback"
        >
          {feedbackMessage}
        </CommerceActionFeedback>
      ) : null}
    </form>
  );
}
