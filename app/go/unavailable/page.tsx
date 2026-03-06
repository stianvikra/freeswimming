import type { Metadata } from "next";
import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

const REASON_COPY: Record<string, { title: string; message: string }> = {
  invalid_slug: {
    title: "This QR link is not valid",
    message: "The code format did not match a valid freeswimming redirect link.",
  },
  not_found: {
    title: "This QR link is not active",
    message: "The link is missing or currently disabled in our system.",
  },
  schema_not_ready: {
    title: "QR link setup is still syncing",
    message: "The redirect system is not fully ready in this environment yet.",
  },
  lookup_failed: {
    title: "We could not load this QR link right now",
    message: "There was a temporary lookup problem. Please retry in a moment.",
  },
  invalid_url: {
    title: "The QR destination was rejected",
    message: "This link points to an invalid destination URL.",
  },
  invalid_protocol: {
    title: "The QR destination was rejected",
    message: "Only secure HTTPS destinations are allowed for QR links.",
  },
  credentials_not_allowed: {
    title: "The QR destination was rejected",
    message: "Destination URLs with credentials are blocked for safety.",
  },
  disallowed_host: {
    title: "The QR destination was rejected",
    message: "The destination host is not on the allowed host list.",
  },
};

export const metadata: Metadata = {
  title: "QR link unavailable",
  description: "Fallback page when a freeswimming QR redirect cannot be resolved safely.",
  robots: {
    index: false,
    follow: false,
  },
};

function readSingleParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const value = params[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getSafeRetryPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/go/v/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

export default async function GoUnavailablePage({ searchParams }: Props) {
  const params = await searchParams;
  const slug = readSingleParam(params, "slug");
  const reason = readSingleParam(params, "reason") ?? "lookup_failed";
  const retryPath = getSafeRetryPath(readSingleParam(params, "retry"));
  const copy = REASON_COPY[reason] ?? REASON_COPY.lookup_failed;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 py-16">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_42px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          QR link status
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.message}</p>
        {slug ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            Link slug: <span className="font-semibold text-slate-900">{slug}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {retryPath ? (
            <Link
              href={retryPath}
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Retry QR link
            </Link>
          ) : null}
          <Link
            href="/course"
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open course
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
