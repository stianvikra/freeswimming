import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthRequestStatus from "@/components/auth/AuthRequestStatus";
import AuthResendButton from "@/components/auth/AuthResendButton";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SiteChrome from "@/components/SiteChrome";
import { getSafeNextPath } from "@/lib/auth/next-path";
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

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : null);
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
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pt-28 pb-16">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Sign in to My Library</h1>

          <AuthRequestStatus sent={sent} error={error} cooldownUntilMs={cooldownUntil} />

          <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/35 p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {tokenMode ? "Check your email" : "Email sign-in link"}
              </h2>
              {!tokenMode ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  We&apos;ll email a secure sign-in link and a one-time code. If you&apos;re using
                  the iPhone Home Screen app and the link opens in Safari, enter the code here
                  instead.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Open the secure link sent to {email}. If you&apos;re using the Home Screen app or
                  the link opens in Safari, enter the one-time code below.
                </p>
              )}
            </div>

            {tokenMode ? (
              <div className="mt-4 space-y-4">
                <form action={verifySignInCode} className="space-y-4">
                  <input type="hidden" name="next" value={nextPath} />
                  <div>
                    <label
                      htmlFor="code-email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm ring-blue-300 transition outline-none focus:ring-2"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor="code"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        One-time code
                      </label>
                      <p id="code-help" className="mb-2 text-xs leading-relaxed text-slate-600">
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
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm ring-blue-300 transition outline-none focus:ring-2"
                        placeholder="123456"
                      />
                    </div>
                    <AuthSubmitButton
                      idleLabel="Sign in with code"
                      pendingLabel="Signing in..."
                      testId="auth-submit-code"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                    />
                  </div>
                </form>

                <form action={requestMagicLink}>
                  <input type="hidden" name="next" value={nextPath} />
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="resend" value="1" />
                  <AuthResendButton cooldownUntilMs={cooldownUntil} />
                </form>
              </div>
            ) : (
              <form action={requestMagicLink} className="mt-4 space-y-4">
                <input type="hidden" name="next" value={nextPath} />
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={email}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm ring-blue-300 transition outline-none focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>
                <AuthSubmitButton
                  idleLabel="Email sign-in link"
                  pendingLabel="Sending..."
                  testId="auth-submit-request"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                />
              </form>
            )}
          </section>
        </div>
      </section>
    </SiteChrome>
  );
}
