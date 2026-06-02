import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import DrylandBuilderHub from "@/components/my-library/dryland/DrylandBuilderHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";

export const dynamic = "force-dynamic";

type DrylandSessionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

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
        data-testid="dryland-workspace"
        className={`mx-auto min-h-screen w-full max-w-[1080px] pb-20 ${
          isMicroFocused ? "px-4 pt-20 sm:px-6 sm:pt-28" : "px-6 pt-20 sm:pt-28"
        }`}
      >
        <div className="space-y-8">
          {isMicroFocused ? <h1 className="sr-only">Micro Sessions</h1> : null}
          <header
            className={`border-b border-[color:var(--fs-border-brand)] pb-5 ${
              isMicroFocused ? "hidden sm:flex" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                  My Library
                </p>
                <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                  {isMicroFocused ? "Micro Sessions" : "Dryland Sessions"}
                </h1>
              </div>
              <div data-testid="dryland-route-actions" className={getMobileActionGroupClass(1)}>
                <Link href="/my-library" className={`${routeActionClass} ${mobileActionItemClass}`}>
                  Back to My Library
                </Link>
              </div>
            </div>
          </header>

          <div className={isMicroFocused ? "mt-0 sm:mt-8" : "mt-6 sm:mt-8"}>
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
