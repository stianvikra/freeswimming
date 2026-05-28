import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthRequestStatus from "@/components/auth/AuthRequestStatus";
import AuthResendButton from "@/components/auth/AuthResendButton";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SiteChrome from "@/components/SiteChrome";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getSignInContextCopy } from "@/lib/auth/sign-in-context";
import { requestMagicLink, verifySignInCode } from "@/app/auth/sign-in/actions";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to My Library with a secure email link or one-time code.",
};

const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const inputClass =
  "w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-4 py-3 text-base text-slate-900 shadow-sm ring-blue-200 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2";
const readonlyInputClass =
  "w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm ring-blue-200 transition outline-none focus:border-blue-500 focus:ring-2";
const labelClass = "mb-2 block text-sm font-medium text-[color:var(--fs-color-ink)]";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : null);
  const context = getSignInContextCopy(
    nextPath,
    typeof params.source === "string" ? params.source : null
  );
  const { user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (user) {
    redirect(nextPath);
  }

  const error = typeof params.error === "string" ? params.error : "";
  const cooldownUntilRaw =
    typeof params.cooldownUntil === "string" ? Number(params.cooldownUntil) : NaN;
  const cooldownUntil = Number.isFinite(cooldownUntilRaw) ? cooldownUntilRaw : null;
  const sent = params.sent === "1";
  const email = typeof params.email === "string" ? params.email : "";
  const tokenMode = sent && email.length > 0;

  return (
    <SiteChrome mobileNavMode="hidden">
      <section
        data-testid="auth-sign-in-workspace"
        className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <div
          data-testid="auth-sign-in-shell"
          className="fs-library-card fs-library-card-accent w-full p-5 sm:p-6"
        >
          <h1 className="text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
            {context.title}
          </h1>
          <p data-testid="auth-context-copy" className={`mt-3 ${mutedTextClass}`}>
            {context.description}
          </p>

          <AuthRequestStatus sent={sent} error={error} cooldownUntilMs={cooldownUntil} />

          <section
            data-testid="auth-sign-in-form-panel"
            className="fs-library-card fs-library-card-muted mt-6 p-4 sm:p-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--fs-color-ink-strong)]">
                {tokenMode ? "Check your email" : "Email sign-in link"}
              </h2>
              {!tokenMode ? (
                <p className={`mt-2 ${mutedTextClass}`}>
                  We&apos;ll email a secure sign-in link and a one-time code. If you&apos;re using
                  the iPhone Home Screen app and the link opens in Safari, enter the code here
                  instead.
                </p>
              ) : (
                <p className={`mt-2 ${mutedTextClass}`}>
                  Open the secure link sent to {email}. If you&apos;re using the Home Screen app or
                  the link opens in Safari, enter the one-time code below.
                </p>
              )}
            </div>

            {tokenMode ? (
              <div className="mt-4 space-y-4">
                <form action={verifySignInCode} className="space-y-4">
                  <input type="hidden" name="next" value={nextPath} />
                  {context.source ? (
                    <input type="hidden" name="source" value={context.source} />
                  ) : null}
                  <div>
                    <label htmlFor="code-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="code-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      readOnly
                      defaultValue={email}
                      className={readonlyInputClass}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label htmlFor="code" className={labelClass}>
                        One-time code
                      </label>
                      <p
                        id="code-help"
                        className="mb-2 text-xs leading-relaxed text-[color:var(--fs-color-muted)]"
                      >
                        Use this in the Home Screen app if the link opens in Safari or does not
                        open.
                      </p>
                      <input
                        id="code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                        aria-describedby="code-help"
                        className={inputClass}
                        placeholder="123456"
                      />
                    </div>
                    <AuthSubmitButton
                      idleLabel="Sign in with code"
                      pendingLabel="Signing in..."
                      testId="auth-submit-code"
                      className={primaryActionClass}
                    />
                  </div>
                </form>

                <form action={requestMagicLink}>
                  <input type="hidden" name="next" value={nextPath} />
                  {context.source ? (
                    <input type="hidden" name="source" value={context.source} />
                  ) : null}
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="resend" value="1" />
                  <AuthResendButton cooldownUntilMs={cooldownUntil} />
                </form>
              </div>
            ) : (
              <form action={requestMagicLink} className="mt-4 space-y-4">
                <input type="hidden" name="next" value={nextPath} />
                {context.source ? (
                  <input type="hidden" name="source" value={context.source} />
                ) : null}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={email}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <AuthSubmitButton
                  idleLabel="Email sign-in link"
                  pendingLabel="Sending..."
                  testId="auth-submit-request"
                  className={primaryActionClass}
                />
              </form>
            )}
          </section>
        </div>
      </section>
    </SiteChrome>
  );
}
