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
  const viewParam = resolvedSearchParams.view;
  const microValues = Array.isArray(microParam) ? microParam : microParam ? [microParam] : [];
  const viewValues = Array.isArray(viewParam) ? viewParam : viewParam ? [viewParam] : [];
  const initialMicroPlanEditorOpen = Array.isArray(microParam)
    ? microParam.includes("edit")
    : microParam === "edit";
  const isMicroFocused = microValues.some((value) => ["active", "edit", "setup"].includes(value));
  const preferMobileBubbles = isMicroFocused && viewValues.includes("auto");

  return (
    <SiteChrome>
      <section
        className={`mx-auto min-h-screen w-full max-w-[1080px] pb-20 ${
          isMicroFocused ? "px-4 pt-20 sm:px-6 sm:pt-28" : "px-6 pt-28"
        }`}
      >
        <div className="space-y-8">
          {isMicroFocused ? <h1 className="sr-only">Micro Sessions</h1> : null}
          <div
            className={`flex flex-wrap items-start justify-between gap-3 ${
              isMicroFocused ? "hidden sm:flex" : ""
            }`}
          >
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {isMicroFocused ? "Micro Sessions" : "Dryland Sessions"}
              </h1>
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

          <div className={isMicroFocused ? "mt-0 sm:mt-8" : "mt-8"}>
            <DrylandBuilderHub
              drylandLibrary={drylandLibrary}
              browseOnly
              initialMicroPlanEditorOpen={initialMicroPlanEditorOpen}
              isMicroFocused={isMicroFocused}
              preferMobileBubbles={preferMobileBubbles}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
