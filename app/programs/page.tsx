// app/programs/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";

export default function ProgramsPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="text-center">
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            Swim Programs
          </h1>
          <p className="mt-2 text-[17px] leading-7 text-slate-700">
            Structured plans + poolside PDFs. Pick a goal — follow the steps.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
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

          <div className="rounded-[22px] border border-blue-100/70 bg-blue-50/60 p-6 shadow-sm">
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