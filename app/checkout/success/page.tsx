import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const dynamic = "force-dynamic";

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
  const libraryCta = user ? "Download from My Library" : "Sign in to My Library";
  const claimHref = "/claim?next=%2Fmy-library";

  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pt-28 pb-16">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Thanks, your payment was received</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We&apos;re confirming payment and adding access to My Library. This usually takes a few
            seconds.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={libraryHref}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              {libraryCta}
            </Link>
            <Link
              href="/programs"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Back to Programs
            </Link>
          </div>

          {sessionId ? (
            <p className="mt-6 text-xs text-slate-500">
              Session reference: <span className="font-mono">{sessionId}</span>
            </p>
          ) : null}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Need the access email again?</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Use the same email you paid with. If that email has a purchase, we&apos;ll send a
              secure access link to open your library.
            </p>
            <DownloadResendForm
              initialEmail={user?.email ?? ""}
              nextPath="/my-library"
              source="checkout_success"
              className="mt-3"
            />
            {!user ? (
              <p className="mt-3 text-xs text-slate-600">
                Prefer a dedicated flow?{" "}
                <Link href={claimHref} className="font-semibold text-blue-700 hover:text-blue-600">
                  Open claim page
                </Link>
                .
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-600">
            Privacy details:{" "}
            <Link href="/privacy" className="font-semibold text-blue-700 hover:text-blue-600">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/cookies" className="font-semibold text-blue-700 hover:text-blue-600">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
