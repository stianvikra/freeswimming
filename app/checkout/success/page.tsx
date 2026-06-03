import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const dynamic = "force-dynamic";

const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawSessionId = typeof params.session_id === "string" ? params.session_id : "";
  const sessionId = rawSessionId.startsWith("{") ? "" : rawSessionId;
  const { user } = await getServerSupabaseUserIfAuthCookiePresent();
  const signInQuery = new URLSearchParams({
    next: "/my-library",
    source: "checkout_success",
  });
  const libraryHref = user ? "/my-library" : `/auth/sign-in?${signInQuery.toString()}`;
  const libraryCta = user ? "Continue to My Library" : "Sign in to My Library";
  const claimHref = "/claim?next=%2Fmy-library";

  return (
    <SiteChrome>
      <section
        data-testid="checkout-success-page"
        className="mx-auto min-h-screen w-full max-w-[980px] px-4 pt-24 pb-24 sm:px-6 sm:pt-28"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
            Payment received
          </p>
          <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[36px]">
            Open My Library when access is ready.
          </h1>
          <p className="mt-3 max-w-[680px] text-[15px] leading-7 text-[color:var(--fs-color-muted)]">
            Stripe sent the payment result back to Freeswimming. Your purchase is checked and
            attached through the normal entitlement flow before owned items appear in My Library.
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
          <section className="fs-library-card fs-library-card-accent p-5 sm:p-6">
            <p className="text-[12px] font-semibold text-[color:var(--fs-color-brand-700)]">
              Start here
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--fs-color-ink-strong)]">
              {user ? "Continue to your owned items" : "Sign in with your checkout email"}
            </h2>
            <p className={`mt-3 ${mutedTextClass}`}>
              {user
                ? "You are already signed in. Open My Library and refresh there if owned items are still being attached."
                : "Use the same email you used at checkout. Sign-in confirms identity only; entitlement checks decide what appears in your library."}
            </p>

            <div
              className={`mt-5 ${getMobileActionGroupClass(2, {
                desktopJustify: "start",
                stackOnMobile: true,
              })}`}
            >
              <Link href={libraryHref} className={`${primaryActionClass} ${mobileActionItemClass}`}>
                {libraryCta}
              </Link>
              <Link href="/programs" className={`${secondaryActionClass} ${mobileActionItemClass}`}>
                Back to Programs
              </Link>
            </div>

            {sessionId ? (
              <p className="mt-5 text-xs leading-5 text-[color:var(--fs-color-muted)]">
                Payment reference for support: <span className="font-mono">{sessionId}</span>
              </p>
            ) : null}
          </section>

          <section className="fs-library-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
              What happens next
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--fs-color-muted)]">
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  1. Payment is confirmed.
                </span>{" "}
                Stripe handles the payment page and confirmation.
              </li>
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  2. Access is checked.
                </span>{" "}
                Owned items appear only after the normal entitlement checks complete.
              </li>
              <li>
                <span className="font-semibold text-[color:var(--fs-color-ink-strong)]">
                  3. My Library is the home.
                </span>{" "}
                If you are asked to sign in, use the email from checkout.
              </li>
            </ol>
          </section>

          <section className="fs-library-card fs-library-card-muted p-5 sm:p-6 lg:col-span-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(320px,1.12fr)] lg:items-start">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Need the access email again?
                </h2>
                <p className={`mt-2 ${mutedTextClass}`}>
                  Enter the checkout email and we will send a secure access link when the normal
                  checks find available access. The response stays generic to protect privacy.
                </p>
                {!user ? (
                  <p className="mt-3 text-sm leading-6 text-[color:var(--fs-color-muted)]">
                    Prefer a dedicated recovery page?{" "}
                    <Link
                      href={claimHref}
                      className="font-semibold text-[color:var(--fs-color-brand-700)] hover:text-blue-600"
                    >
                      Open claim access
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
              <DownloadResendForm
                initialEmail={user?.email ?? ""}
                nextPath="/my-library"
                source="checkout_success"
              />
            </div>
          </section>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
          Privacy details:{" "}
          <Link
            href="/privacy"
            className="font-semibold text-[color:var(--fs-color-brand-700)] hover:text-blue-600"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/cookies"
            className="font-semibold text-[color:var(--fs-color-brand-700)] hover:text-blue-600"
          >
            Cookie Policy
          </Link>
          .
        </p>
      </section>
    </SiteChrome>
  );
}
