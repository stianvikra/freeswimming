import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawSessionId = typeof params.session_id === "string" ? params.session_id : "";
  const sessionId = rawSessionId.startsWith("{") ? "" : rawSessionId;

  return (
    <SiteChrome>
      <section className="mx-auto flex min-h-screen w-full max-w-[760px] items-center px-6 pb-16 pt-28">
        <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
          <h1 className="text-3xl font-bold text-slate-900">Thanks, your purchase is processing</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We&apos;re confirming payment and adding access to My Library. This usually takes a few
            seconds.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/my-library"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              Open My Library
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
        </div>
      </section>
    </SiteChrome>
  );
}
