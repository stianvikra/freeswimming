"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

type Props = {
  variant?: "contact" | "analysis";
};

export default function ContactForm({ variant = "contact" }: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>

        <h3 className="text-[18px] font-semibold text-slate-900">
          Message sent
        </h3>

        <p className="mt-2 text-[15px] leading-6 text-slate-700">
          Thanks for reaching out. We’ve received your message and will get back
          to you by email within 24–48 hours.
        </p>

        <p className="mt-3 text-[14px] text-slate-500">
          You can safely close this page.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="mt-6 space-y-5"
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Name
        </label>
        <input
          type="text"
          placeholder="Your name"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] focus:border-blue-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Email
        </label>
        <input
          type="email"
          placeholder="you@email.com"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] focus:border-blue-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Message
        </label>
        <textarea
          rows={5}
          placeholder={
            variant === "analysis"
              ? `• Your level (adult beginner / triathlete)\n• What you want feedback on\n• Video link (optional)`
              : `• What you struggle with\n• Your goal (1000m, open water, technique)`
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] leading-6 focus:border-blue-400 focus:outline-none"
          required
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-[16px] font-semibold text-white transition hover:bg-blue-700"
      >
        Send
      </button>

      <p className="pt-2 text-center text-[13px] text-slate-500">
        No signup. No paywall. Just swim.
      </p>
    </form>
  );
}