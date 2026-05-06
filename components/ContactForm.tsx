// components/ContactForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CheckCircle2, X } from "lucide-react";
import BrandImage from "@/components/brand/BrandImage";
import PressButton from "@/components/ui/PressButton";
import PageIntro from "@/components/PageIntro";
import { BRAND_USAGE } from "@/lib/brand";

type Variant = "contact" | "analysis" | "goals_coaching" | "preview_access_notify";
type Status = "idle" | "sending" | "success" | "error";

type Props = {
  variant?: Variant;
};

type ApiResponse = { ok: boolean; error?: string };
const GOALS_COACHING_LEVEL_OPTIONS = [
  { value: "learning_freestyle", label: "Learning freestyle (2:00+ /100m)" },
  { value: "beginner", label: "Beginner (1:50 /100m)" },
  { value: "intermediate", label: "Intermediate (1:40 /100m)" },
  { value: "fast", label: "Fast (1:30 or faster /100m)" },
] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function focusFieldOnNextFrame<T extends HTMLElement>(ref: RefObject<T | null>) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ref.current?.focus();
    });
  });
}

export default function ContactForm({ variant = "contact" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<
    | "name"
    | "email"
    | "message"
    | "primary_goal"
    | "level"
    | "training_days"
    | "weekly_volume"
    | null
  >(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [level, setLevel] = useState("");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState("3");
  const [weeklyVolume, setWeeklyVolume] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // honeypot
  const [company, setCompany] = useState("");

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const primaryGoalRef = useRef<HTMLInputElement | null>(null);
  const levelRef = useRef<HTMLSelectElement | null>(null);
  const trainingDaysRef = useRef<HTMLSelectElement | null>(null);
  const weeklyVolumeRef = useRef<HTMLInputElement | null>(null);

  const startedAtRef = useRef<number | null>(null);
  const nameId = "contact-name";
  const emailId = "contact-email";
  const messageId = "contact-message";
  const primaryGoalId = "contact-goals-primary-goal";
  const levelId = "contact-goals-level";
  const trainingDaysId = "contact-goals-training-days";
  const weeklyVolumeId = "contact-goals-weekly-volume";
  const targetDateId = "contact-goals-target-date";
  const errorId = "contact-form-error";

  const isSending = status === "sending";

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    switch (fieldError) {
      case "name":
        focusFieldOnNextFrame(nameRef);
        break;
      case "email":
        focusFieldOnNextFrame(emailRef);
        break;
      case "message":
        focusFieldOnNextFrame(messageRef);
        break;
      case "primary_goal":
        focusFieldOnNextFrame(primaryGoalRef);
        break;
      case "level":
        focusFieldOnNextFrame(levelRef);
        break;
      case "training_days":
        focusFieldOnNextFrame(trainingDaysRef);
        break;
      case "weekly_volume":
        focusFieldOnNextFrame(weeklyVolumeRef);
        break;
      default:
        break;
    }
  }, [fieldError]);

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
        successBody:
          "Thanks! We’ve received your request and will reply by email within 24–48 hours.",
        successHint: "You can safely close this page — or tap X to send another request.",

        micro: "We usually reply within 24–48 hours.",
        messageRequired: true,
        showGoalsIntake: false,
      };
    }

    if (variant === "goals_coaching") {
      return {
        pageTitle: "Goals Coaching",
        pageSubtitle:
          "Get a structured training schedule built around your current level and target.",

        helperTitle: "What we use to build your plan",
        helperBullets: [
          "Primary goal and target timeline",
          "Your current pace level",
          "Available training days and weekly volume",
        ],
        helperLine1: "This helps us recommend realistic weekly progressions and recovery balance.",
        helperLine2: "We reply with a clear step-by-step schedule you can follow right away.",

        formTitle: "Request Goal-Based Training Schedule",
        formSubtitle: "Complete the intake so we can tailor your next training block.",

        messagePlaceholder:
          "Optional details: current blockers, upcoming race/open-water date, or injury notes.",

        exampleTitle: "What helps us most",
        exampleLines: [
          "Current swim routine and available days",
          "Main challenge (breathing, endurance, pace control)",
          "How fast you want to reach your target",
        ],

        successTitle: "Schedule request received",
        successBody:
          "Thanks! We’ve received your intake and will reply with a tailored schedule by email within 24–48 hours.",
        successHint: "You can safely close this page — or tap X to submit another intake.",

        micro: "Structured coaching replies are usually sent within 24–48 hours.",
        messageRequired: false,
        showGoalsIntake: true,
      };
    }

    if (variant === "preview_access_notify") {
      return {
        pageTitle: "Apply for early access",
        pageSubtitle: "Apply for earlier access to freeswimming.",

        helperTitle: "",
        helperBullets: [] as string[],
        helperLine1: "",
        helperLine2: "",

        formTitle: "",
        formSubtitle: "",

        messagePlaceholder: "Optional: whether you'd like earlier tester access.",

        exampleTitle: "",
        exampleLines: [] as string[],

        successTitle: "Application received",
        successBody: "Thanks! We’ll reply when early access opens more broadly.",
        successHint: "You can safely close this page — or tap X to send another request.",

        micro: "",
        messageRequired: false,
        showGoalsIntake: false,
      };
    }

    return {
      pageTitle: "Contact",
      pageSubtitle: "Tell us where you are — and where you want to be.",

      helperTitle: "",
      helperBullets: [] as string[],
      helperLine1: "",
      helperLine2: "",

      formTitle: "",
      formSubtitle: "",

      messagePlaceholder: "Write your message…",

      exampleTitle: "",
      exampleLines: [] as string[],

      successTitle: "Message received",
      successBody: "Thanks! We’ve received your message and will reply by email when we can.",
      successHint: "You can safely close this page — or tap X to send another message.",

      micro: "",
      messageRequired: true,
      showGoalsIntake: false,
    };
  }, [variant]);

  function reset() {
    setStatus("idle");
    setError("");
    setFieldError(null);
    setName("");
    setEmail("");
    setMessage("");
    setPrimaryGoal("");
    setLevel("");
    setTrainingDaysPerWeek("3");
    setWeeklyVolume("");
    setTargetDate("");
    setCompany("");
    startedAtRef.current = Date.now();

    window.scrollTo({ top: 0, behavior: "smooth" });
    focusFieldOnNextFrame(nameRef);
  }

  function goEmail() {
    focusFieldOnNextFrame(emailRef);
  }

  function goMessage() {
    focusFieldOnNextFrame(messageRef);
  }

  function goPrimaryGoal() {
    focusFieldOnNextFrame(primaryGoalRef);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSending) return;

    setError("");
    setFieldError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedPrimaryGoal = primaryGoal.trim();
    const trimmedWeeklyVolume = weeklyVolume.trim();
    const parsedTrainingDays = Number(trainingDaysPerWeek);

    const isGoalsCoaching = variant === "goals_coaching";

    if (trimmedName.length < 2) {
      setStatus("error");
      setError("Please enter your name.");
      setFieldError("name");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setStatus("error");
      setError("Please enter a valid email.");
      setFieldError("email");
      return;
    }
    if (isGoalsCoaching && trimmedPrimaryGoal.length < 3) {
      setStatus("error");
      setError("Please enter your primary goal.");
      setFieldError("primary_goal");
      return;
    }
    if (isGoalsCoaching && !GOALS_COACHING_LEVEL_OPTIONS.some((option) => option.value === level)) {
      setStatus("error");
      setError("Please choose your current level.");
      setFieldError("level");
      return;
    }
    if (
      isGoalsCoaching &&
      (!Number.isFinite(parsedTrainingDays) || parsedTrainingDays < 1 || parsedTrainingDays > 7)
    ) {
      setStatus("error");
      setError("Please choose how many training days you have per week.");
      setFieldError("training_days");
      return;
    }
    if (isGoalsCoaching && trimmedWeeklyVolume.length < 2) {
      setStatus("error");
      setError("Please enter your current weekly volume.");
      setFieldError("weekly_volume");
      return;
    }
    if (copy.messageRequired && trimmedMessage.length < 10) {
      setStatus("error");
      setError("Please write a short message.");
      setFieldError("message");
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
          goalsCoaching: isGoalsCoaching
            ? {
                primaryGoal: trimmedPrimaryGoal,
                level,
                trainingDaysPerWeek: parsedTrainingDays,
                weeklyVolume: trimmedWeeklyVolume,
                targetDate: targetDate.trim() || null,
              }
            : undefined,
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
  const isContact = variant === "contact";
  const isPreviewNotify = variant === "preview_access_notify";
  const showHelperCard = variant !== "contact" && !isPreviewNotify;
  const showExampleCard = copy.exampleLines.length > 0 && !isPreviewNotify;
  const showFormIntro = Boolean(copy.formTitle || copy.formSubtitle);
  const formCardTopMargin = isPreviewNotify ? "mt-4" : "mt-5";
  const messageLabel = isPreviewNotify
    ? "OPTIONAL NOTE"
    : copy.messageRequired
      ? "MESSAGE"
      : "MESSAGE (OPTIONAL)";
  const submitLabel = isPreviewNotify
    ? "Apply for early access"
    : isContact
      ? "Send message"
      : "Send";
  const intro = isPreviewNotify ? (
    <div className="pt-1">
      <h1 className="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
        Apply for early access
      </h1>
      <BrandImage
        asset={BRAND_USAGE.methodLockup}
        className="mt-3 h-9 w-auto sm:h-10"
        sizes="(max-width: 640px) 260px, 340px"
        priority
      />
    </div>
  ) : isContact ? (
    <div className="pt-1">
      <BrandImage
        asset={BRAND_USAGE.methodLockup}
        className="h-9 w-auto sm:h-10"
        sizes="(max-width: 640px) 260px, 340px"
        priority
      />
      <h1 className="mt-5 text-[30px] leading-[1.04] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[34px]">
        Contact
      </h1>
      <p className="mt-3 max-w-[30ch] text-[16px] leading-7 text-slate-700">
        Questions, early access, or feedback.
      </p>
    </div>
  ) : (
    <PageIntro title={copy.pageTitle} subtitle="Learn. Drill. Swim." />
  );

  // ✅ Success view
  if (status === "success") {
    return (
      <div>
        {intro}

        <div className="relative mt-6 overflow-hidden rounded-[24px] border border-emerald-200/75 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(52,211,153,0.12),rgba(255,255,255,0)_70%),linear-gradient(180deg,rgba(236,253,245,0.94),rgba(236,253,245,0.84))] p-7 shadow-[0_14px_34px_rgba(16,185,129,0.12)]">
          <PressButton
            tier="icon"
            onClick={reset}
            className={`${btnIcon} absolute top-3 right-3`}
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
      {intro}

      {/* Helper card (analysis + goals coaching) */}
      {showHelperCard && (
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
      <div
        className={`relative ${formCardTopMargin} overflow-hidden rounded-[22px] border border-blue-100/65 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:p-6`}
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent opacity-72" />
        {showFormIntro ? (
          <div className={isPreviewNotify ? "text-left" : "text-center"}>
            {copy.formTitle ? (
              <h2 className="text-[20px] font-semibold text-slate-900">{copy.formTitle}</h2>
            ) : null}
            {copy.formSubtitle ? (
              <p className="mt-2 text-[15px] leading-6 text-slate-700">{copy.formSubtitle}</p>
            ) : null}
          </div>
        ) : null}

        {status === "error" && error && (
          <div
            id={errorId}
            className={`${showFormIntro ? "mt-5" : "mt-0"} rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] leading-6 text-rose-700`}
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className={`${showFormIntro ? "mt-6" : "mt-0"} space-y-5`}>
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
              placeholder="your@email.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (variant === "goals_coaching") {
                    goPrimaryGoal();
                  } else {
                    goMessage();
                  }
                }
              }}
            />
          </div>

          {copy.showGoalsIntake && (
            <>
              <div>
                <label htmlFor={primaryGoalId} className="ui-field-label">
                  PRIMARY GOAL
                </label>
                <input
                  id={primaryGoalId}
                  ref={primaryGoalRef}
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  disabled={isSending}
                  aria-invalid={fieldError === "primary_goal" ? true : undefined}
                  aria-describedby={fieldError === "primary_goal" ? errorId : undefined}
                  className="ui-field mt-2"
                  placeholder="Example: 1000m under 18:00"
                />
              </div>

              <div>
                <label htmlFor={levelId} className="ui-field-label">
                  CURRENT LEVEL
                </label>
                <select
                  id={levelId}
                  ref={levelRef}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isSending}
                  aria-invalid={fieldError === "level" ? true : undefined}
                  aria-describedby={fieldError === "level" ? errorId : undefined}
                  className="ui-field mt-2"
                >
                  <option value="">Select level</option>
                  {GOALS_COACHING_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={trainingDaysId} className="ui-field-label">
                  TRAINING DAYS PER WEEK
                </label>
                <select
                  id={trainingDaysId}
                  ref={trainingDaysRef}
                  value={trainingDaysPerWeek}
                  onChange={(e) => setTrainingDaysPerWeek(e.target.value)}
                  disabled={isSending}
                  aria-invalid={fieldError === "training_days" ? true : undefined}
                  aria-describedby={fieldError === "training_days" ? errorId : undefined}
                  className="ui-field mt-2"
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days</option>
                  <option value="6">6 days</option>
                  <option value="7">7 days</option>
                </select>
              </div>

              <div>
                <label htmlFor={weeklyVolumeId} className="ui-field-label">
                  CURRENT WEEKLY VOLUME
                </label>
                <input
                  id={weeklyVolumeId}
                  ref={weeklyVolumeRef}
                  value={weeklyVolume}
                  onChange={(e) => setWeeklyVolume(e.target.value)}
                  disabled={isSending}
                  aria-invalid={fieldError === "weekly_volume" ? true : undefined}
                  aria-describedby={fieldError === "weekly_volume" ? errorId : undefined}
                  className="ui-field mt-2"
                  placeholder="Example: 3 sessions, ~2500m total"
                />
              </div>

              <div>
                <label htmlFor={targetDateId} className="ui-field-label">
                  TARGET DATE (OPTIONAL)
                </label>
                <input
                  id={targetDateId}
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isSending}
                  className="ui-field mt-2"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor={messageId} className="ui-field-label">
              {messageLabel}
            </label>
            <textarea
              id={messageId}
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              aria-invalid={fieldError === "message" ? true : undefined}
              aria-describedby={fieldError === "message" ? errorId : undefined}
              className={`ui-field mt-2 resize-none leading-6 ${isPreviewNotify ? "min-h-[120px]" : "min-h-[150px]"}`}
              placeholder={copy.messagePlaceholder}
            />

            {showExampleCard ? (
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
            ) : null}
          </div>

          <PressButton tier="cta" type="submit" disabled={isSending} className={btnPrimary}>
            {isSending ? "Sending…" : submitLabel}
          </PressButton>

          {copy.micro ? (
            <p className="text-center text-[13px] text-slate-500">{copy.micro}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
