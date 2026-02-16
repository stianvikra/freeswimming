import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  description: "Sign in with a magic link or one-time code to access My Library.",
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
  const sent = params.sent === "1";
  const email = typeof params.email === "string" ? params.email : "";
  const tokenMode = sent && email.length > 0;

  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pb-16 pt-28">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Sign in to My Library</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Enter your email and we&apos;ll send a one-time sign-in email. If the link opens in a
            different browser, you can still sign in with the code from the email.
          </p>

          {sent ? (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Sign-in email sent. Enter the code below.
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

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
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                  >
                    Sign in with code
                  </button>
                </div>
              </form>

              <form action={requestMagicLink}>
                <input type="hidden" name="next" value={nextPath} />
                <input type="hidden" name="email" value={email} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Request new login code
                </button>
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
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
              >
                Request login code
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteChrome>
  );
}
