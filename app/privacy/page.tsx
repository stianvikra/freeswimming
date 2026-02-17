import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

const LAST_UPDATED = "February 17, 2026";

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
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This page explains what data we process, why we process it, and how to use your
              privacy rights in freeswimming.org.
            </p>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Who controls your data</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              freeswimming.org is the controller for app-owned account, entitlement, and progress
              data used in this product.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">What data we use</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Account identifiers like email and user ID.</li>
              <li>Purchase entitlement status for owned guides and services.</li>
              <li>Course and guide progress, including completion states and notes.</li>
              <li>Operational logs needed for support, abuse prevention, and reliability.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Why we use it (legal basis)</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>
                Contract performance: provide account access, restore purchases, and sync progress.
              </li>
              <li>Legitimate interests: product safety, abuse prevention, and service quality.</li>
              <li>
                Legal obligations: payment/accounting compliance handled with our payment provider.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Processors</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {PROCESSORS.map((processor) => (
                <li
                  key={processor.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="font-semibold text-slate-900">{processor.name}</p>
                  <p>{processor.role}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Retention baseline</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {RETENTION_ROWS.map((row) => (
                <li key={row.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">{row.label}</p>
                  <p>{row.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Your data rights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
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
                <Link href="/contact" className="font-semibold text-blue-700 hover:text-blue-600">
                  Contact
                </Link>{" "}
                and include subject: <span className="font-semibold">Privacy request</span>.
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              Operational response target for rights requests is within 30 days.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Cookies and local storage</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              We use essential storage for authentication and core product function. See the{" "}
              <Link href="/cookies" className="font-semibold text-blue-700 hover:text-blue-600">
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
