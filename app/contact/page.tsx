"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import BackButton from "@/components/BackButton";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageTemplate>
        <BackButton />

        <div className="text-center">
          <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">
            Contact
          </h1>
          <p className="mt-2 text-[17px] leading-7 text-slate-700">
            Tell us where you are — and where you want to be.
          </p>
        </div>

        <ContactForm variant="contact" />
      </PageTemplate>
    </SiteChrome>
  );
}