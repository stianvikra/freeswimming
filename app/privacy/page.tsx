import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

const LAST_UPDATED = "June 9, 2026";

const PROCESSORS = [
  {
    name: "Supabase",
    role: "Authentication, database, and account-linked progress storage.",
  },
  {
    name: "Stripe",
    role: "Payment processing, invoicing, and payment-compliance recordkeeping.",
  },
  {
    name: "Vercel",
    role: "Application hosting and delivery.",
  },
];

const RETENTION_ROWS = [
  {
    label: "Account profile and entitlements",
    detail: "Kept while your account is active. Removed when account deletion is confirmed.",
  },
  {
    label: "Course and guide progress",
    detail: "Kept while your account is active. Removed when account deletion is confirmed.",
  },
  {
    label: "Support messages",
    detail: "Kept for support and safety follow-up, then removed on regular cleanup cadence.",
  },
  {
    label: "Payment records",
    detail:
      "Managed by Stripe under legal/accounting obligations and may be retained after app account deletion.",
  },
];

const pageShellClass = "space-y-6 sm:space-y-7";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass =
  "text-[30px] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]";
const sectionClass = "fs-library-card p-5 sm:p-6";
const sectionAccentClass = "fs-library-card fs-library-card-accent p-5 sm:p-6";
const sectionMutedClass = "fs-library-card fs-library-card-muted p-5 sm:p-6";
const sectionHeadingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const bodyTextClass = "text-sm leading-7 text-[color:var(--fs-color-muted)]";
const rowCardClass =
  "rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-white/78 p-3";
const linkClass =
  "font-semibold text-[color:var(--fs-color-brand-700)] underline decoration-[color:var(--fs-border-brand)] underline-offset-2 transition hover:text-blue-600 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How freeswimming.org handles personal data for account, payments, and progress sync.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How freeswimming.org handles personal data for account, payments, and progress sync.",
    url: "/privacy",
    siteName: "freeswimming.org",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <SiteChrome>
      <PageTemplate topInset="compact">
        <div className={pageShellClass} data-testid="privacy-policy-page">
          <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
            <p className={eyebrowClass}>Privacy</p>
            <h1 className={headingClass}>Privacy Policy</h1>
            <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
              Last updated: {LAST_UPDATED}
            </p>
            <p className={`mt-3 max-w-[68ch] ${bodyTextClass}`}>
              This page explains what data we process, why we process it, and how to use your
              privacy rights in freeswimming.org.
            </p>
          </header>

          <section className={sectionAccentClass} data-testid="privacy-controller-card">
            <h2 className={sectionHeadingClass}>Who controls your data</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              freeswimming.org is the controller for app-owned account, entitlement, and progress
              data used in this product.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>What data we use</h2>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>Account identifiers like email and user ID.</li>
              <li>Purchase entitlement status for owned guides and services.</li>
              <li>Course and guide progress, including completion states and notes.</li>
              <li>Operational logs needed for support, abuse prevention, and reliability.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Why we use it (legal basis)</h2>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>
                Contract performance: provide account access, restore purchases, and sync progress.
              </li>
              <li>Legitimate interests: product safety, abuse prevention, and service quality.</li>
              <li>
                Legal obligations: payment/accounting compliance handled with our payment provider.
              </li>
            </ul>
          </section>

          <section className={sectionClass} data-testid="privacy-public-analytics-card">
            <h2 className={sectionHeadingClass}>Public website analytics</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              We use a privacy-first public analytics foundation to understand aggregate page,
              source, product, and checkout-funnel health. Public events use route templates, route
              categories, coarse device/source dimensions, and canonical product IDs where
              applicable.
            </p>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>No Meta Pixel, GA4, Google Tag Manager, Hotjar, Clarity, heatmaps, or replay.</li>
              <li>No raw IP, raw User-Agent, fingerprint, ad click ID, or full clickstream.</li>
              <li>No public anonymous browsing trail is joined to your account profile.</li>
              <li>
                Plausible is the first vendor candidate, but no public analytics vendor is active
                until a processor/privacy review and policy update are complete.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Processors</h2>
            <ul className={`mt-3 space-y-2 ${bodyTextClass}`}>
              {PROCESSORS.map((processor) => (
                <li key={processor.name} className={rowCardClass}>
                  <p className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {processor.name}
                  </p>
                  <p>{processor.role}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Retention baseline</h2>
            <ul className={`mt-3 space-y-2 ${bodyTextClass}`}>
              {RETENTION_ROWS.map((row) => (
                <li key={row.label} className={rowCardClass}>
                  <p className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {row.label}
                  </p>
                  <p>{row.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={sectionAccentClass}>
            <h2 className={sectionHeadingClass}>Your data rights</h2>
            <ul className={`mt-3 list-disc space-y-2 pl-5 ${bodyTextClass}`}>
              <li>
                Export your app-owned data from your signed-in session via{" "}
                <span className="font-mono text-xs">GET /api/user/export</span>.
              </li>
              <li>
                Delete your app-owned account data from your signed-in session via{" "}
                <span className="font-mono text-xs">POST /api/user/delete</span>.
              </li>
              <li>
                For access/rectification/objection requests, use{" "}
                <Link href="/contact" className={linkClass}>
                  Contact
                </Link>{" "}
                and include subject: <span className="font-semibold">Privacy request</span>.
              </li>
            </ul>
            <p className="mt-3 text-sm text-[color:var(--fs-color-muted)]">
              Operational response target for rights requests is within 30 days.
            </p>
          </section>

          <section className={sectionMutedClass}>
            <h2 className={sectionHeadingClass}>Cookies and local storage</h2>
            <p className={`mt-2 ${bodyTextClass}`}>
              We use essential storage for authentication and core product function. Public
              analytics does not add tracking cookies or a browser visitor ID in this foundation.
              See the{" "}
              <Link href="/cookies" className={linkClass}>
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </section>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
