import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { loadWorkoutContextCtaProductAvailable } from "@/lib/commerce/workout-context-cta-server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
import type { WorkoutPoolsideFocusOption } from "@/lib/workouts/shared";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";

export const dynamic = "force-dynamic";

type Params = Promise<{
  workoutId: string;
}>;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  params: Params;
  searchParams: SearchParams;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const raw = searchParams[key];
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
}

export default async function WorkoutBuilderPage({ params, searchParams }: Props) {
  const { workoutId } = await params;
  const resolvedSearchParams = await searchParams;
  const entryMode = readSearchParamValue(resolvedSearchParams, "entry");
  const preferExpandedDetailsOnLoad =
    entryMode === "manual-create" ||
    entryMode === "manual-pool" ||
    entryMode === "manual-open-water" ||
    entryMode === "template";

  if (!UUID_PATTERN.test(workoutId)) {
    notFound();
  }

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/workouts/${workoutId}`)}`);
  }

  const [
    workoutLibrary,
    trainingContextSnapshot,
    athleteProfileSnapshot,
    workoutContextCtaProductAvailable,
  ] = await Promise.all([
    loadWorkoutLibrarySnapshot(supabase, user.id, workoutId),
    loadTrainingContextSnapshot(supabase, user.id),
    loadAthleteProfileSnapshot(supabase, user.id),
    loadWorkoutContextCtaProductAvailable(),
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
    workoutLibrary.selectedWorkout?.draft.environment === "pool" || entryMode === "manual-pool"
      ? "Pool session builder"
      : workoutLibrary.selectedWorkout?.draft.environment === "open_water" ||
          entryMode === "manual-open-water"
        ? "Open-water session builder"
        : "Swim session builder";

  return (
    <SiteChrome mobileNavMode="hidden">
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
              <div
                data-testid="workout-builder-route-actions"
                className={getMobileActionGroupClass(1)}
              >
                <Link
                  href="/my-library/workouts"
                  className={`${routeActionClass} ${mobileActionItemClass}`}
                >
                  Back to My Swim Sessions
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
              userId={user.id}
              hideShellIntro
              preferExpandedDetailsOnLoad={preferExpandedDetailsOnLoad}
              workoutContextCtaProductAvailable={workoutContextCtaProductAvailable}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
