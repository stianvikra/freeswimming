// app/contact/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageTemplate size="wide">
        <h1 className="text-2xl font-semibold text-slate-900">Contact</h1>
        <p className="mt-3 text-slate-700">
          Placeholder page for MVP. Add a simple contact form or email link here.
        </p>
      </PageTemplate>
    </SiteChrome>
  );
}