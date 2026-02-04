// app/contact/page.tsx
"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageTemplate>
        <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-slate-900">
          Contact
        </h1>

        <p className="mt-2 text-[15px] leading-6 text-slate-600">
          Have a question or need help getting started? Send us a message — we
          read everything.
        </p>

        <div className="mt-6">
          <ContactForm variant="contact" />
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}