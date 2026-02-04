// app/contact/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageTemplate>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            Contact
          </h1>
          <p className="mt-2 text-[16px] leading-6 text-slate-700">
            Tell us where you are — and where you want to be.
          </p>
        </div>

        <div className="mt-6">
          <ContactForm variant="contact" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}