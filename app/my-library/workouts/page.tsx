import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
import type { WorkoutPoolsideFocusOption } from "@/lib/workouts/shared";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";

export const dynamic = "force-dynamic";

export default async function WorkoutSessionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
          isPrimary: focus.isPrimary,
        }))
      : [];

  return (
    <SiteChrome>
      <section
        data-testid="workout-builder-route-shell"
        data-mobile-density="tight"
        className="mx-auto min-h-screen w-full max-w-[980px] px-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pb-20 sm:pt-28 lg:px-6"
      >
        <div
          data-testid="workout-builder-page-card"
          data-mobile-density="tight"
          className="rounded-[1.75rem] border border-blue-100 bg-white/95 p-3 shadow-[0_16px_60px_rgba(24,58,107,0.14)] sm:rounded-3xl sm:p-6 lg:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                My Swim Sessions
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="sm:hidden">Back</span>
                <span className="hidden sm:inline">Back to My Library</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <WorkoutBuilderHub
              workoutLibrary={workoutLibrary}
              trainingFocusOptions={trainingFocusOptions}
              manualPoolCssMetricSecondsPer100m={athleteProfileSnapshot.cssMetric?.valueSeconds ?? null}
              manualPoolCssPaceLabel={athleteProfileSnapshot.cssMetric?.paceLabel ?? null}
              browseOnly
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
