"use client";

import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <SiteChrome>
      <PageTemplate>
        <ContactForm variant="contact" />
      </PageTemplate>
    </SiteChrome>
  );
}