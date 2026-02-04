"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function AnalysisPage() {
  return (
    <SiteChrome>
      <PageTemplate>

        <div className="text-center">
          <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
            Video analysis
          </h1>
          <p className="mt-2 text-[17px] leading-7 text-slate-700">
            Send a short clip — we&apos;ll tell you exactly what to work on next.
          </p>
        </div>

        {/* What to include */}
        <div className="mt-6 rounded-[22px] border border-slate-200/70 bg-white/60 p-5 shadow-sm">
          <h2 className="text-[18px] font-semibold text-slate-900">
            What to include
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-[17px] leading-7 text-slate-700">
            <li>Your level (adult beginner / triathlete / etc.)</li>
            <li>What you struggle with (breathing, balance, arm pull...)</li>
            <li>A video link (YouTube / Drive) if you have it</li>
          </ul>

          <p className="mt-4 text-[16px] leading-7 text-slate-600">
            Best results: 10–20 seconds from the side + 10–20 seconds from the front.
          </p>
          <p className="mt-2 text-[16px] leading-7 text-slate-600">
            No pressure — if you don&apos;t have a video yet, just describe the problem.
          </p>
        </div>

        <ContactForm variant="analysis" />
      </PageTemplate>
    </SiteChrome>
  );
}