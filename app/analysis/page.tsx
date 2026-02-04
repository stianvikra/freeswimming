// app/analysis/page.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function AnalysisPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteChrome>
      <PageTemplate>
        {/* Header always visible */}
        <div className="text-center">
          <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
            Video analysis
          </h1>
          <p className="mt-2 text-[17px] leading-7 text-slate-700">
            Send a short clip — we&apos;ll tell you exactly what to work on next.
          </p>
        </div>

        <div className="relative mt-6">
          {/* Normal view */}
          {!sent && (
            <>
              {/* What to include */}
              <div className="rounded-[22px] border border-slate-200/70 bg-white/60 p-5 shadow-sm">
                <h2 className="text-[18px] font-semibold text-slate-900">
                  What to include
                </h2>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[17px] leading-7 text-slate-700">
                  <li>Your level (adult beginner / triathlete / etc.)</li>
                  <li>What you struggle with (breathing, balance, arm pull…)</li>
                  <li>A video link (YouTube / Drive) if you have it</li>
                </ul>

                <p className="mt-4 text-[16px] leading-7 text-slate-600">
                  Best results: 10–20 seconds from the side + 10–20 seconds from the front.
                </p>
                <p className="mt-2 text-[16px] leading-7 text-slate-600">
                  No pressure — if you don&apos;t have a video yet, just describe the problem.
                </p>
              </div>

              <ContactForm variant="analysis" onSuccess={() => setSent(true)} />
            </>
          )}

          {/* Success overlay – covers everything under header */}
          {sent && (
            <div className="relative overflow-hidden rounded-[22px] border border-emerald-200/70 bg-emerald-50/80 p-6 shadow-sm backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setSent(false)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white/70 text-emerald-900 shadow-sm transition hover:bg-white"
                aria-label="Close"
                title="Send another request"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>

                <h2 className="mt-4 text-[22px] font-semibold tracking-tight text-slate-900">
                  Request received
                </h2>

                <p className="mt-2 max-w-[34ch] text-[15px] leading-6 text-slate-700">
                  Thanks! We’ve received your request and will reply by email within{" "}
                  <span className="font-medium">24–48 hours</span>.
                </p>

                <p className="mt-4 text-[13px] text-slate-600">
                  You can safely close this page — or tap <span className="font-medium">X</span> to send another request.
                </p>
              </div>
            </div>
          )}
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}