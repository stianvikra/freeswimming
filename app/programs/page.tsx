// app/programs/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import PageIntro from "@/components/PageIntro";

export default function ProgramsPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <PageIntro title="Swim Programs" subtitle="Learn. Drill. Swim." />

        <div className="mt-4 grid gap-4">
          <div className="relative overflow-hidden rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9))] p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#5aa6ff] via-[#93c8ff] to-transparent opacity-70" />
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              Most popular
            </div>
            <h2 className="mt-2 text-[18px] font-semibold text-slate-900">Poolside PDF Guide</h2>
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
                title="GET PDF UPDATES"
                subtitle="Join waitlist"
                href="/contact"
                variant="secondary"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-blue-100/70 bg-[radial-gradient(520px_220px_at_15%_0%,rgba(99,168,255,0.13),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(244,248,255,0.95),rgba(239,246,255,0.88))] p-6 shadow-[0_14px_34px_rgba(37,99,235,0.1)]">
            <div className="opacity-72 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent" />
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
