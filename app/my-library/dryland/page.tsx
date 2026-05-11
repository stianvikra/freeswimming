import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import DrylandBuilderHub from "@/components/my-library/dryland/DrylandBuilderHub";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";

export const dynamic = "force-dynamic";

type DrylandSessionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DrylandSessionsPage({ searchParams }: DrylandSessionsPageProps) {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fdryland");
  }

  const drylandLibrary = await loadDrylandLibrarySnapshot(supabase, user.id, null);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const microParam = resolvedSearchParams.micro;
  const initialMicroPlanEditorOpen = Array.isArray(microParam)
    ? microParam.includes("edit")
    : microParam === "edit";

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[1080px] px-6 pt-28 pb-20">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Dryland Sessions</h1>
              <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
                Saved dryland sessions and weekly micro blocks.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <DrylandBuilderHub
              drylandLibrary={drylandLibrary}
              browseOnly
              initialMicroPlanEditorOpen={initialMicroPlanEditorOpen}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
