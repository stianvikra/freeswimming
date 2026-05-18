// app/analysis/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import ContactForm from "@/components/ContactForm";

export default function AnalysisPage() {
  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[760px] px-4 pt-9 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-16 sm:pb-16">
        <ContactForm variant="analysis" />
      </section>
    </SiteChrome>
  );
}
