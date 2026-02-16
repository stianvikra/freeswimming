import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { requestMagicLink } from "@/app/auth/sign-in/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in with a magic link to access My Library.",
};

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? params.error : "";
  const sent = params.sent === "1";

  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pb-16 pt-28">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Sign in to My Library</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Enter your email and we&apos;ll send a one-time magic link.
          </p>

          {sent ? (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Magic link sent. Check your email and open the link on this device.
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              Send magic link
            </button>
          </form>
        </div>
      </section>
    </SiteChrome>
  );
}
