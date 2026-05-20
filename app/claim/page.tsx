import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Claim Access",
  description:
    "Claim your purchases and progress by requesting a secure sign-in link to My Library.",
};

const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";

function getOptionalQueryString(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export default async function ClaimPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(getOptionalQueryString(params.next));
  const prefilledEmail = getOptionalQueryString(params.email) ?? "";

  const { user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (user) {
    redirect(nextPath);
  }

  const signInQuery = new URLSearchParams({ next: nextPath });
  signInQuery.set("source", "claim_entry");
  if (prefilledEmail) {
    signInQuery.set("email", prefilledEmail);
  }
  const signInHref = `/auth/sign-in?${signInQuery.toString()}`;

  return (
    <SiteChrome>
      <main
        data-testid="claim-page"
        className="mx-auto min-h-screen w-full max-w-[980px] px-4 pt-24 pb-24 sm:px-6 sm:pt-28"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
            Claim access
          </p>
          <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[36px]">
            Recover My Library access.
          </h1>
          <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-[color:var(--fs-color-muted)]">
            Use the same email you used at checkout. We will send a secure link when the normal
            checks find access for that email.
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
          <section className="fs-library-card fs-library-card-accent p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
              Send secure access link
            </h2>
            <p className={`mt-2 ${mutedTextClass}`}>
              The response is intentionally generic so the page never reveals whether a specific
              email has a purchase.
            </p>
            <DownloadResendForm
              initialEmail={prefilledEmail}
              nextPath={nextPath}
              source="claim_entry"
              className="mt-4"
            />
          </section>

          <section className="fs-library-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
              Before you continue
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--fs-color-muted)]">
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Use checkout email.
                </span>{" "}
                A different email can sign in, but it will not automatically find the purchase.
              </li>
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Checks decide access.
                </span>{" "}
                Sign-in and claim links do not grant purchases before entitlement checks complete.
              </li>
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  My Library is the destination.
                </span>{" "}
                After the link opens, owned items appear there when access is attached.
              </li>
            </ul>
          </section>

          <section className="fs-library-card fs-library-card-muted p-5 sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Already have a fresh sign-in email?
                </h2>
                <p className={`mt-1 ${mutedTextClass}`}>
                  Open the secure link or use the one-time code from that email.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={signInHref} className={primaryActionClass}>
                  Sign in to My Library
                </Link>
                <Link href="/programs" className={secondaryActionClass}>
                  Back to Programs
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
