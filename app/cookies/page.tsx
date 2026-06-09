import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

const LAST_UPDATED = "June 9, 2026";

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

          <section className={sectionClass} data-testid="cookie-analytics-card">
            <h2 className={sectionHeadingClass}>Analytics and tracking</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              We do not use advertising trackers in this product flow. Public analytics events are
              limited to aggregate route, source, product, and checkout-funnel signals and do not
              activate third-party ad cookies.
            </p>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>No Meta Pixel, GA4, Google Tag Manager, Hotjar, Clarity, heatmaps, or replay.</li>
              <li>No analytics visitor ID, fingerprint, raw IP, raw User-Agent, or ad click ID.</li>
              <li>
                Plausible is the first public analytics vendor candidate, but no Plausible script is
                active until owner approval, processor/privacy review, and policy evidence are
                complete.
              </li>
            </ul>
          </section>

          <section className={sectionClass} data-testid="cookie-consent-boundary-card">
            <h2 className={sectionHeadingClass}>Consent boundary</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              If non-essential cookies, localStorage visitor IDs, pixels, tag managers, replay,
              heatmaps, or similar tracking technologies are added later, they will be reviewed and
              consent-gated before activation where required, and this policy will be updated.
            </p>
            <p className={`mt-3 ${bodyTextClass}`}>
              Anonymous public traffic is not joined to a logged-in user profile without a new
              privacy review, retention rule, deletion/anonymization handling, and tests.
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
