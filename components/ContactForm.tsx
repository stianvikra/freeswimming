// components/ContactForm.tsx
"use client";

import { useMemo, useRef, useState } from "react";

type Variant = "contact" | "analysis";

type Props = {
  variant?: Variant;
};

export default function ContactForm({ variant = "contact" }: Props) {
  const startedAtRef = useRef<number>(Date.now());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (variant === "analysis" ? "Request video analysis" : "Send a message"),
    [variant]
  );

  const subtitle = useMemo(() => {
    if (variant === "analysis") {
      return "Tell us what you want feedback on — and what your goal is.";
    }
    return "Questions, collaborations, or guidance? Write us.";
  }, [variant]);

const placeholder = useMemo(() => {
  if (variant === "analysis") {
    return `Example:
• Skill level (adult beginner / triathlete / etc.)
• What you struggle with
• Link to your video (YouTube/Drive) if you have it
• Your goal (1000m, open water, technique, breathing…)`;
  }
  return "Write your message here…";
}, [variant]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return setError("Please enter a valid email.");
    if (message.trim().length < 10) return setError("Please write a short message.");

    setLoading(true);
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
        setError(data?.error || "Could not send right now. Please try again.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.10)] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
          <span className="text-xl">✓</span>
        </div>
        <h2 className="mt-4 text-[20px] font-semibold text-slate-900">
          Message received
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-slate-600">
          We&apos;ll get back to you by email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-white/85 backdrop-blur border border-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.10)] p-6"
    >
      <div className="text-center">
        <h2 className="text-[20px] font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-[15px] leading-6 text-slate-600">{subtitle}</p>
      </div>

      {/* Honeypot (hidden) */}
      <div className="hidden">
        <label className="text-sm">Company</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <div className="mt-6 grid gap-4">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-[15px] text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-200/30"
            placeholder="Your name"
          />
        </Field>

        <Field label="Email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-[15px] text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-200/30"
            placeholder="you@email.com"
          />
        </Field>

        <Field label="Message">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-[15px] leading-6 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-blue-200 focus:ring-4 focus:ring-blue-200/30"
            placeholder={placeholder}
          />
        </Field>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-[14px] font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={[
            "mt-1 h-12 w-full rounded-2xl text-[15px] font-semibold text-white",
            "bg-gradient-to-b from-[#5aa6ff] to-[#3a87e6]",
            "shadow-[0_18px_55px_rgba(45,143,255,0.22)] transition",
            "active:translate-y-[1px]",
            loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-[1.03]",
          ].join(" ")}
        >
          {loading ? "Sending…" : "Send"}
        </button>

        <p className="text-center text-[12px] font-medium text-slate-500">
          No signup. No paywall. Just swim.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold tracking-wide text-slate-600">
        {label.toUpperCase()}
      </div>
      {children}
    </label>
  );
}