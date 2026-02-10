// components/ContactForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import PressButton from "@/components/ui/PressButton";
import PageIntro from "@/components/PageIntro";

type Variant = "contact" | "analysis";
type Status = "idle" | "sending" | "success" | "error";

type Props = {
  variant?: Variant;
};

type ApiResponse = { ok: boolean; error?: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function ContactForm({ variant = "contact" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<"name" | "email" | "message" | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // honeypot
  const [company, setCompany] = useState("");

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const nameId = "contact-name";
  const emailId = "contact-email";
  const messageId = "contact-message";
  const errorId = "contact-form-error";

  const isSending = status === "sending";

  useEffect(() => {
    startedAtRef.current = Date.now();
    // Avoid auto-opening keyboard on touch devices.
    const desktopLike = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (desktopLike) {
      requestAnimationFrame(() => nameRef.current?.focus());
    }
  }, []);

  const copy = useMemo(() => {
    if (variant === "analysis") {
      return {
        pageTitle: "Video Analysis",
        pageSubtitle: "Send a short clip — we’ll tell you exactly what to work on next.",

        helperTitle: "What to include",
        helperBullets: [
          "Your level (adult beginner / triathlete / etc.)",
          "What you struggle with (breathing, balance, arm pull…)",
          "A video link (YouTube / Drive) if you have it",
        ],
        helperLine1: "Best results: 10–20 seconds from the side + 10–20 seconds from the front.",
        helperLine2: "No pressure — if you don’t have a video yet, just describe the problem.",

        formTitle: "Request Video Analysis",
        formSubtitle: "Tell us what you want feedback on — and what your goal is.",

        messagePlaceholder: "Describe your goal + what you want feedback on…",

        exampleTitle: "Example",
        exampleLines: [
          "Skill level (adult beginner / triathlete / etc.)",
          "What you struggle with (breathing, balance, arm pull…)",
          "Video link (YouTube/Drive) if you have it",
        ],

        successTitle: "Request received",
        successBody: "Thanks! We’ve received your request and will reply by email within 24–48 hours.",
        successHint: "You can safely close this page — or tap X to send another request.",

        micro: "We usually reply within 24–48 hours.",
      };
    }

    return {
      pageTitle: "Contact",
      pageSubtitle: "Tell us where you are — and where you want to be.",

      helperTitle: "",
      helperBullets: [] as string[],
      helperLine1: "",
      helperLine2: "",

      formTitle: "Send a message",
      formSubtitle: "Send us a short message and we’ll reply by email.",

      messagePlaceholder: "Write your message…",

      exampleTitle: "Example",
      exampleLines: [
        "What you struggle with",
        "Your goal (1000m, open water, technique)",
        "Optional: link to a video (YouTube/Drive)",
      ],

      successTitle: "Message sent",
      successBody: "Thanks! We’ve received your message and will reply by email within 24–48 hours.",
      successHint: "You can safely close this page — or tap X to send another message.",

      micro: "We usually reply within 24–48 hours.",
    };
  }, [variant]);

  function reset() {
    setStatus("idle");
    setError("");
    setFieldError(null);
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    startedAtRef.current = Date.now();

    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function goEmail() {
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  function goMessage() {
    requestAnimationFrame(() => messageRef.current?.focus());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSending) return;

    setError("");
    setFieldError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setStatus("error");
      setError("Please enter your name.");
      setFieldError("name");
      nameRef.current?.focus();
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setStatus("error");
      setError("Please enter a valid email.");
      setFieldError("email");
      emailRef.current?.focus();
      return;
    }
    if (trimmedMessage.length < 10) {
      setStatus("error");
      setError("Please write a short message.");
      setFieldError("message");
      messageRef.current?.focus();
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
        setFieldError(null);
        return;
      }

      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
      setError("Could not send right now. Please try again.");
      setFieldError(null);
    }
  }

  // Buttons: structure/skin only. Motion/hover is in globals via ui-press.
  const btnPrimary =
    "w-full rounded-2xl px-5 py-4 text-[16px] font-semibold text-white " +
    "bg-gradient-to-b from-blue-500 to-blue-600 " +
    "shadow-[0_18px_50px_rgba(37,99,235,0.28)]";

  const btnIcon =
    "inline-flex h-10 w-10 items-center justify-center rounded-full " +
    "border border-emerald-200 bg-white/70 text-emerald-900 shadow-sm";

  // ✅ Success view
  if (status === "success") {
    return (
      <div>
        <PageIntro title={copy.pageTitle} subtitle="Learn. Drill. Swim." />

        <div className="relative mt-6 overflow-hidden rounded-[24px] border border-emerald-200/75 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(52,211,153,0.12),rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(236,253,245,0.94),rgba(236,253,245,0.84))] p-7 shadow-[0_14px_34px_rgba(16,185,129,0.12)]">
          <PressButton
            tier="icon"
            onClick={reset}
            className={`${btnIcon} absolute right-3 top-3`}
            aria-label="Close"
            title="Send another message"
          >
            <X className="h-5 w-5" />
          </PressButton>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>

            <h2 className="mt-5 text-[24px] font-semibold tracking-tight text-slate-900">
              {copy.successTitle}
            </h2>

            <p className="mt-3 max-w-[38ch] text-[16px] leading-7 text-slate-700">
              {copy.successBody}
            </p>

            <p className="mt-4 max-w-[44ch] text-[14px] leading-6 text-slate-600">
              {copy.successHint}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PageIntro title={copy.pageTitle} subtitle="Learn. Drill. Swim." />
      <p className="mt-2 text-[15px] leading-7 text-slate-700">{copy.pageSubtitle}</p>

      {/* Helper card (analysis only) */}
      {variant === "analysis" && (
        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.90))] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.075)]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#93c8ff] to-transparent opacity-70" />
          <h2 className="text-[18px] font-semibold text-slate-900">{copy.helperTitle}</h2>

          <ul className="mt-3 space-y-3 text-[16px] leading-7 text-slate-700">
            {copy.helperBullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-[11px] h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[16px] leading-7 text-slate-600">{copy.helperLine1}</p>
          <p className="mt-2 text-[16px] leading-7 text-slate-600">{copy.helperLine2}</p>
        </div>
      )}

      {/* Form card */}
      <div className="relative mt-5 overflow-hidden rounded-[22px] border border-blue-100/65 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent opacity-72" />
        <div className="text-center">
          <h2 className="text-[20px] font-semibold text-slate-900">{copy.formTitle}</h2>
          <p className="mt-2 text-[15px] leading-6 text-slate-700">{copy.formSubtitle}</p>
        </div>

        {status === "error" && error && (
          <div
            id={errorId}
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] leading-6 text-rose-700"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* honeypot */}
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
            <label htmlFor={nameId} className="ui-field-label">
              NAME
            </label>
            <input
              id={nameId}
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSending}
              aria-invalid={fieldError === "name" ? true : undefined}
              aria-describedby={fieldError === "name" ? errorId : undefined}
              className="ui-field mt-2"
              placeholder="Your name"
              autoComplete="name"
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goEmail();
                }
              }}
            />
          </div>

          <div>
            <label htmlFor={emailId} className="ui-field-label">
              EMAIL
            </label>
            <input
              id={emailId}
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              aria-invalid={fieldError === "email" ? true : undefined}
              aria-describedby={fieldError === "email" ? errorId : undefined}
              className="ui-field mt-2"
              placeholder="you@email.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goMessage();
                }
              }}
            />
          </div>

          <div>
            <label htmlFor={messageId} className="ui-field-label">
              MESSAGE
            </label>
            <textarea
              id={messageId}
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              aria-invalid={fieldError === "message" ? true : undefined}
              aria-describedby={fieldError === "message" ? errorId : undefined}
              className="ui-field mt-2 min-h-[150px] resize-none leading-6"
              placeholder={copy.messagePlaceholder}
            />

            <div className="mt-3 rounded-2xl border border-blue-100/70 bg-white/78 p-4">
              <p className="text-[13px] font-semibold text-slate-700">{copy.exampleTitle}</p>
              <ul className="mt-2 space-y-1 text-[13px] leading-5 text-slate-600">
                {copy.exampleLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <PressButton
            tier="cta"
            type="submit"
            disabled={isSending}
            className={btnPrimary}
          >
            {isSending ? "Sending…" : "Send"}
          </PressButton>

          <p className="text-center text-[13px] text-slate-500">{copy.micro}</p>
        </form>
      </div>
    </div>
  );
}
