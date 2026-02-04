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
            Optional personal feedback — clear, kind, and actionable.
          </p>

          <div className="mt-4 rounded-3xl bg-white/70 border border-white/70 shadow-[0_14px_46px_rgba(15,23,42,0.08)] px-5 py-4 text-left">
            <div className="text-[12px] font-semibold tracking-wide text-slate-600">
              WHAT TO SEND
            </div>
            <ul className="mt-2 space-y-1 text-[14.5px] leading-6 text-slate-700">
              <li>• Link to your swim video (side + front if possible)</li>
              <li>• Your goal (distance / open water / technique / breathing)</li>
              <li>• What feels hardest right now</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <ContactForm variant="analysis" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}