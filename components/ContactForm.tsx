"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Variant = "contact" | "analysis";

type Props = {
  variant?: Variant;
};

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function SuccessCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
          {/* check icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 7L10.5 16.5L4 10"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="min-w-0">
          <p className="text-[16px] font-semibold leading-6 text-emerald-950">
            Message sent
          </p>
          <p className="mt-1 text-[15px] leading-6 text-emerald-900/80">
            {message}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-emerald-900/70">
            You can close this page — we’ll reply by email.
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600">
          {/* alert icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 9v5"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M12 18h.01"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M10.3 4.3L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
              opacity="0.0"
            />
          </svg>
        </span>

        <div className="min-w-0">
          <p className="text-[16px] font-semibold leading-6 text-rose-950">
            Couldn’t send
          </p>
          <p className="mt-1 text-[15px] leading-6 text-rose-900/80">
            {message}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-rose-900/70">
            Please try again in a moment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContactForm({ variant = "contact" }: Props) {
  // Capture "startedAt" without violating render purity rules.
  const startedAtRef = useRef<number | null>(null);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const title = variant === "analysis" ? "Request video analysis" : "Send a message";
  const subtitle =
    variant === "analysis"
      ? "Tell us what you want feedback on — and what your goal is."
      : "Tell us where you are — and where you want to be.";

  const messagePlaceholder = useMemo(() => {
    if (variant === "analysis") {
      return (
        "Example:\n" +
        "• Your level (adult beginner / triathlete)\n" +
        "• What you want feedback on\n" +
        "• Video link (optional)\n"
      );
    }
    return (
      "Write your message here...\n\n" +
      "Example:\n" +
      "• What you struggle with\n" +
      "• Your goal (1000m, open water, technique)\n"
    );
  }, [variant]);

  const canSubmit =
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    message.trim().length >= 10;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.state === "sending") return;

    // Minimal client-side validation (server still validates too)
    if (name.trim().length < 2) {
      setStatus({ state: "error", message: "Please enter your name." });
      return;
    }
    if (!isValidEmail(email)) {
      setStatus({ state: "error", message: "Please enter a valid email." });
      return;
    }
    if (message.trim().length < 10) {
      setStatus({ state: "error", message: "Please write a short message." });
      return;
    }

    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant,
          name,
          email,
          message,
          company, // honeypot
          startedAt: startedAtRef.current,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !data?.ok) {
        setStatus({
          state: "error",
          message: data?.error || "Could not send right now. Please try again.",
        });
        return;
      }

      setStatus({
        state: "success",
        message:
          variant === "analysis"
            ? "Sent! We’ll reply with what to work on next."
            : "Sent! We’ll get back to you shortly.",
      });

      // Clear message only (keep name/email for convenience)
      setMessage("");
    } catch {
      setStatus({
        state: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  return (
    <div className="mt-8 rounded-[26px] border border-slate-200/60 bg-white/70 p-5 shadow-[0_18px_60px_rgba(16,24,40,0.10)] backdrop-blur-xl sm:p-6">
      <div className="text-center">
        <h2 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-[17px] leading-7 text-slate-700">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* Honeypot (hidden) */}
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div>
          <label className="block text-[13px] font-semibold tracking-wide text-slate-700">
            NAME
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold tracking-wide text-slate-700">
            EMAIL
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold tracking-wide text-slate-700">
            MESSAGE
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messagePlaceholder}
            rows={6}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50"
          />
        </div>

        {status.state === "error" && <ErrorCard message={status.message} />}
        {status.state === "success" && <SuccessCard message={status.message} />}

        <button
          type="submit"
          disabled={!canSubmit || status.state === "sending"}
          className="mt-2 w-full rounded-2xl bg-slate-900 px-4 py-4 text-[16px] font-semibold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
        >
          {status.state === "sending" ? "Sending..." : "Send"}
        </button>

        {/* Micro-trust line */}
        <p className="text-center text-[13px] text-slate-500">
          We usually reply within 24–48 hours.
        </p>

        {/* Brand line */}
        <p className="text-center text-[14px] font-medium text-slate-500">
          No signup. No paywall. Just swim.
        </p>
      </form>
    </div>
  );
}