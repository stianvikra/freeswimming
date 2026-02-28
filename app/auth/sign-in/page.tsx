import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthRequestStatus from "@/components/auth/AuthRequestStatus";
import AuthResendButton from "@/components/auth/AuthResendButton";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SiteChrome from "@/components/SiteChrome";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { requestMagicLink, verifySignInCode } from "@/app/auth/sign-in/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in with a one-time login code to access My Library.",
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : null);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pb-16 pt-28">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Sign in to My Library</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Enter your email and we&apos;ll send an e-mail with your one-time login code. If you
            don&apos;t see it after a minute, check your spam/junk folder.
          </p>

          <AuthRequestStatus sent={sent} error={error} cooldownUntilMs={cooldownUntil} />

          {tokenMode ? (
            <div className="mt-6 space-y-4">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
                      Sign-in code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
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
            <form action={requestMagicLink} className="mt-6 space-y-4">
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
                  placeholder="you@example.com"
                />
              </div>
              <AuthSubmitButton
                idleLabel="Request login code"
                pendingLabel="Requesting login code..."
                testId="auth-submit-request"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
              />
            </form>
          )}
        </div>
      </section>
    </SiteChrome>
  );
}
