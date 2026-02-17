"use client";

import { useId, useState, type FormEvent } from "react";
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
      <label
        htmlFor={inputId}
        className="text-xs font-medium uppercase tracking-wide text-slate-600"
      >
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
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending..." : "Email me access link"}
        </button>
      </div>

      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      {!error && successMessage ? (
        <p className="text-xs text-emerald-700">{successMessage}</p>
      ) : null}
    </form>
  );
}
