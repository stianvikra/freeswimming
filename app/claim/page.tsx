import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const metadata: Metadata = {
  title: "Claim Access",
  description:
    "Claim your purchases and progress by requesting a secure sign-in link to My Library.",
};

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

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  const signInQuery = new URLSearchParams({ next: nextPath });
  if (prefilledEmail) {
    signInQuery.set("email", prefilledEmail);
  }
  const signInHref = `/auth/sign-in?${signInQuery.toString()}`;

  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pb-16 pt-28">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Claim your purchases and progress</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Use the same email you used at checkout. If purchases exist for that email, we send a
            secure access link so you can open My Library.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Send secure access link</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              To protect privacy, we always return the same response copy.
            </p>
            <DownloadResendForm
              initialEmail={prefilledEmail}
              nextPath={nextPath}
              source="claim_entry"
              className="mt-3"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={signInHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              I already have a sign-in code
            </Link>
            <Link
              href="/programs"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Back to Programs
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
