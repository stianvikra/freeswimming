// app/programs/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";

export default function ProgramsPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="relative overflow-hidden rounded-[22px] border border-blue-100/60 bg-[radial-gradient(560px_220px_at_16%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.76))] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
          <div className="text-center">
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              Swim Programs
            </h1>
            <p className="mt-2 text-[17px] leading-7 text-slate-700">
              Structured plans + poolside PDFs. Pick a goal — follow the steps.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-200/70 via-blue-100/60 to-transparent" />
        </div>

        <div className="mt-6 grid gap-4">
          <div className="relative overflow-hidden rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#93c8ff] to-transparent opacity-70" />
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              Most popular
            </div>
            <h2 className="mt-2 text-[18px] font-semibold text-slate-900">
              Poolside PDF Guide
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              A simple drill library you can bring to the pool — with QR links to the videos.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-700">
              <li>Quick “what to do today” structure</li>
              <li>Best drills for balance + body position</li>
              <li>Works with the free course lessons</li>
            </ul>

            <div className="mt-5">
              <ActionButton
                title="VIEW PDF OPTIONS"
                subtitle="(Coming soon)"
                variant="secondary"
                disabled
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-blue-100/70 bg-[radial-gradient(520px_220px_at_15%_0%,rgba(99,168,255,0.13),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(244,248,255,0.95),rgba(239,246,255,0.88))] p-6 shadow-[0_14px_34px_rgba(37,99,235,0.1)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent opacity-72" />
            <h2 className="text-[18px] font-semibold text-slate-900">Want personal guidance?</h2>
            <p className="mt-2 text-[15px] leading-7 text-slate-700">
              Send a short clip and we’ll tell you exactly what to focus on next.
            </p>
            <div className="mt-5">
              <ActionButton
                title="VIDEO ANALYSIS"
                subtitle="Get feedback (optional)"
                href="/analysis"
                variant="primary"
              />
            </div>
          </div>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
