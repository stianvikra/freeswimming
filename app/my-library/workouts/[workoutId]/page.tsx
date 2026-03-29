import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function WorkoutBuilderPage({ params, searchParams }: Props) {
  const { workoutId } = await params;
  const resolvedSearchParams = await searchParams;
  const savedSessionsOpenByDefault = resolvedSearchParams.savedSessions === "open";

  if (!UUID_PATTERN.test(workoutId)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/workouts/${workoutId}`)}`);
  }

  const [workoutLibrary, trainingContextSnapshot] = await Promise.all([
    loadWorkoutLibrarySnapshot(supabase, user.id, workoutId),
    loadTrainingContextSnapshot(supabase, user.id),
  ]);
  const trainingFocusTitles =
    trainingContextSnapshot.schemaReady && !trainingContextSnapshot.loadError
      ? trainingContextSnapshot.openFocuses.map((focus) => focus.title)
      : [];

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Swim session builder</h1>
              <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
                Edit one saved swim session at a time, keep the form front and center, and open
                saved sessions only when you want to switch, print, or clean up older work.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/generator"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Open generator
              </Link>
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <WorkoutBuilderHub
              workoutLibrary={workoutLibrary}
              savedSessionsOpenByDefault={savedSessionsOpenByDefault}
              trainingFocusTitles={trainingFocusTitles}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
