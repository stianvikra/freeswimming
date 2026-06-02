import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
import type { ManualWorkoutBuilderMode } from "@/lib/workouts/manual";
import type { WorkoutPoolsideFocusOption } from "@/lib/workouts/shared";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

function readSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const raw = searchParams[key];
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
}

export default async function WorkoutSessionsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const entryMode = readSearchParamValue(resolvedSearchParams, "entry");
  const rawDraftMode = readSearchParamValue(resolvedSearchParams, "draft");
  const localDraftMode: ManualWorkoutBuilderMode | null =
    rawDraftMode === "pool" || rawDraftMode === "open_water" ? rawDraftMode : null;
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fworkouts");
  }

  const [workoutLibrary, trainingContextSnapshot, athleteProfileSnapshot] = await Promise.all([
    loadWorkoutLibrarySnapshot(supabase, user.id, null),
    loadTrainingContextSnapshot(supabase, user.id),
    loadAthleteProfileSnapshot(supabase, user.id),
  ]);
  const trainingFocusOptions: WorkoutPoolsideFocusOption[] =
    trainingContextSnapshot.schemaReady && !trainingContextSnapshot.loadError
      ? trainingContextSnapshot.openFocuses.map((focus) => ({
          id: focus.id,
          title: focus.title,
          description: focus.details,
          isPrimary: focus.isPrimary,
        }))
      : [];
  const builderHeading =
    localDraftMode === "pool"
      ? "Pool session builder"
      : localDraftMode === "open_water"
        ? "Open-water session builder"
        : "My Swim Sessions";
  const preferExpandedDetailsOnLoad =
    localDraftMode !== null ||
    entryMode === "manual-create" ||
    entryMode === "manual-pool" ||
    entryMode === "manual-open-water";

  const backHref = localDraftMode === null ? "/my-library" : "/my-library/workouts";

  return (
    <SiteChrome mobileNavMode={localDraftMode === null ? "default" : "hidden"}>
      <section
        data-testid="workout-builder-route-shell"
        data-mobile-density="tight"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-28 sm:pb-20"
      >
        <div
          data-testid="workout-builder-page-card"
          data-mobile-density="tight"
          className="space-y-6 sm:space-y-8"
        >
          <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                  My Library
                </p>
                <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                  {builderHeading}
                </h1>
              </div>
              <div data-testid="workout-route-actions" className={getMobileActionGroupClass(1)}>
                <Link href={backHref} className={`${routeActionClass} ${mobileActionItemClass}`}>
                  {localDraftMode === null ? "Back to My Library" : "Back to My Swim Sessions"}
                </Link>
              </div>
            </div>
          </header>

          <div>
            <WorkoutBuilderHub
              workoutLibrary={workoutLibrary}
              trainingFocusOptions={trainingFocusOptions}
              manualPoolCssMetricSecondsPer100m={
                athleteProfileSnapshot.cssMetric?.valueSeconds ?? null
              }
              manualPoolCssPaceLabel={athleteProfileSnapshot.cssMetric?.paceLabel ?? null}
              swimmerName={athleteProfileSnapshot.profile?.primaryName ?? null}
              browseOnly={localDraftMode === null}
              hideShellIntro={localDraftMode !== null}
              preferExpandedDetailsOnLoad={preferExpandedDetailsOnLoad}
              userId={user.id}
              manualLocalDraftMode={localDraftMode}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
