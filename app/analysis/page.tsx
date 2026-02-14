// app/analysis/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function AnalysisPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <div className="mx-auto max-w-[720px]">
          <ContactForm variant="analysis" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
