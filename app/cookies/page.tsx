import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";

const LAST_UPDATED = "February 17, 2026";

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
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cookie Policy</h1>
            <p className="mt-2 text-sm text-slate-600">Last updated: {LAST_UPDATED}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This page explains what browser storage we use and why.
            </p>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Essential storage only</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              We use essential cookies/storage to keep authentication and core app functions
              working.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Session cookies used by Supabase authentication.</li>
              <li>Local browser storage for course/guide progress and UX recovery state.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Analytics and tracking</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              We do not use advertising trackers in this product flow. Product analytics events are
              limited to service telemetry and do not activate third-party ad cookies.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Consent boundary</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              If non-essential cookies or trackers are added later, they will be consent-gated
              before activation in GDPR regions and this policy will be updated.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">How to control storage</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
              <li>Sign out to end authenticated sessions.</li>
              <li>Clear site data in your browser settings to remove local progress state.</li>
              <li>
                Use{" "}
                <Link href="/contact" className="font-semibold text-blue-700 hover:text-blue-600">
                  Contact
                </Link>{" "}
                for privacy questions or rights requests.
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-600">
              See also our{" "}
              <Link href="/privacy" className="font-semibold text-blue-700 hover:text-blue-600">
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
