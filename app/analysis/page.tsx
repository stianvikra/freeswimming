// app/analysis/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

export default function AnalysisPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <h1 className="text-2xl font-semibold text-slate-900">Video Analysis</h1>
        <p className="mt-3 text-slate-700">
          Placeholder page for MVP. Explain how analysis works + pricing/options here.
        </p>
      </PageTemplate>
    </SiteChrome>
  );
}