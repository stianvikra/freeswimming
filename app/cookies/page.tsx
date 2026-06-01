import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

const LAST_UPDATED = "February 17, 2026";

const pageShellClass = "space-y-6 sm:space-y-7";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass =
  "text-[30px] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]";
const sectionClass = "fs-library-card p-5 sm:p-6";
const sectionAccentClass = "fs-library-card fs-library-card-accent p-5 sm:p-6";
const sectionMutedClass = "fs-library-card fs-library-card-muted p-5 sm:p-6";
const sectionHeadingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const bodyTextClass = "text-sm leading-7 text-[color:var(--fs-color-muted)]";
const linkClass =
  "font-semibold text-[color:var(--fs-color-brand-700)] underline decoration-[color:var(--fs-border-brand)] underline-offset-2 transition hover:text-blue-600 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How freeswimming.org uses cookies and browser storage.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Cookie Policy",
    description: "How freeswimming.org uses cookies and browser storage.",
    url: "/cookies",
    siteName: "freeswimming.org",
    type: "website",
  },
};

export default function CookiesPage() {
  return (
    <SiteChrome>
      <PageTemplate topInset="compact">
        <div className={pageShellClass} data-testid="cookie-policy-page">
          <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
            <p className={eyebrowClass}>Browser storage</p>
            <h1 className={headingClass}>Cookie Policy</h1>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              Last updated: {LAST_UPDATED}
            </p>
            <p className={`mt-3 max-w-[68ch] ${bodyTextClass}`}>
              This page explains what browser storage we use and why.
            </p>
          </header>

          <section className={sectionAccentClass} data-testid="cookie-essential-storage-card">
            <h2 className={sectionHeadingClass}>Essential storage only</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              We use essential cookies/storage to keep authentication and core app functions
              working.
            </p>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>Session cookies used by Supabase authentication.</li>
              <li>Local browser storage for course/guide progress and UX recovery state.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Analytics and tracking</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              We do not use advertising trackers in this product flow. Product analytics events are
              limited to service telemetry and do not activate third-party ad cookies.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Consent boundary</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              If non-essential cookies or trackers are added later, they will be consent-gated
              before activation in GDPR regions and this policy will be updated.
            </p>
          </section>

          <section className={sectionMutedClass}>
            <h2 className={sectionHeadingClass}>How to control storage</h2>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>Sign out to end authenticated sessions.</li>
              <li>Clear site data in your browser settings to remove local progress state.</li>
              <li>
                Use{" "}
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>{" "}
                for privacy questions or rights requests.
              </li>
            </ul>
            <p className="mt-3 text-sm text-[color:var(--fs-color-muted)]">
              See also our{" "}
              <Link href="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
