// components/ContactForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Variant = "contact" | "analysis";

type Props = {
  variant?: Variant;
  onSuccess?: () => void; // ✅ NEW: parent can show full-page success overlay
};

type ApiResponse = { ok: boolean; error?: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function ContactForm({ variant = "contact", onSuccess }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // honeypot
  const [company, setCompany] = useState("");

  const nameRef = useRef<HTMLInputElement | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
    nameRef.current?.focus();
  }, []);

  const copy = useMemo(() => {
    if (variant === "analysis") {
      return {
        formTitle: "Request video analysis",
        formSubtitle: "Tell us what you want feedback on — and what your goal is.",
        messagePlaceholder:
          "Example:\n" +
          "• Your level (adult beginner / triathlete / etc.)\n" +
          "• What you want feedback on\n" +
          "• Video link (YouTube/Drive) if you have it\n",
        micro: "We usually reply within 24–48 hours.",
      };
    }
    return {
      formTitle: "Send a message",
      formSubtitle: "Send us a short message and we’ll reply by email.",
      messagePlaceholder:
        "Write your message here...\n\n" +
        "Example:\n" +
        "• What you struggle with\n" +
        "• Your goal (1000m, open water, technique)\n" +
        "• Optional: link to a video (YouTube/Drive)\n",
      micro: "We usually reply within 24–48 hours.",
    };
  }, [variant]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setStatus("error");
      setError("Please enter your name.");
      nameRef.current?.focus();
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setStatus("error");
      setError("Please enter a valid email.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setStatus("error");
      setError("Please write a short message.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant,
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          company, // honeypot
          startedAt: startedAtRef.current,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok || !data?.ok) {
        setStatus("error");
        setError(data?.error || "Could not send right now. Please try again.");
        return;
      }

      // ✅ let parent show success overlay
      onSuccess?.();

      // keep form ready if they return (optional)
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Could not send right now. Please try again.");
    }
  }

  return (
    <div className="mt-6 rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-slate-900">{copy.formTitle}</h2>
        <p className="mt-2 text-[15px] leading-6 text-slate-700">{copy.formSubtitle}</p>
      </div>

      {status === "error" && error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] leading-6 text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {/* honeypot (hidden) */}
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        <div>
          <label className="block text-[12px] font-semibold tracking-wide text-slate-700">
            NAME
          </label>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "sending"}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/50 disabled:opacity-70"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold tracking-wide text-slate-700">
            EMAIL
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/50 disabled:opacity-70"
            placeholder="you@email.com"
            inputMode="email"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold tracking-wide text-slate-700">
            MESSAGE
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === "sending"}
            className="mt-2 min-h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[16px] leading-6 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-200/50 disabled:opacity-70"
            placeholder={copy.messagePlaceholder}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-2 w-full rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-5 py-4 text-[16px] font-semibold text-white shadow-[0_18px_50px_rgba(37,99,235,0.28)] transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>

        <p className="text-center text-[13px] text-slate-500">{copy.micro}</p>

        <p className="text-center text-[13px] font-medium text-slate-600">
          No signup. No paywall. Just swim.
        </p>
      </form>
    </div>
  );
}