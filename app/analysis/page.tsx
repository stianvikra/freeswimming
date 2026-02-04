// app/analysis/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function AnalysisPage() {
  return (
    <SiteChrome>
      <PageTemplate>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            Video analysis
          </h1>
          <p className="mt-2 text-[16px] leading-6 text-slate-700">
            Send a short clip — we’ll tell you exactly what to work on next.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur">
          <div className="text-[13px] font-semibold tracking-wide text-slate-700">
            What to include
          </div>

          <ul className="mt-2 space-y-1.5 text-[14px] leading-5 text-slate-600">
            <li>• Your level (adult beginner / triathlete / etc.)</li>
            <li>• What you struggle with (breathing, balance, arm pull…)</li>
            <li>• A video link (YouTube / Drive) if you have it</li>
          </ul>

          <div className="mt-3 text-[12px] font-medium text-slate-500">
            No pressure — if you don’t have a video yet, just describe the
            problem.
          </div>
        </div>

        <div className="mt-6">
          <ContactForm variant="analysis" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}