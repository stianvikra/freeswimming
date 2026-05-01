import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import GeneratorIntakeHub from "@/components/my-library/generator/GeneratorIntakeHub";
import type { GeneratorIntakeBlockSummary } from "@/lib/generator-intake/shared";
import { loadGeneratorIntakeSnapshot } from "@/lib/generator-intake/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getOptionalWorkoutId(value: string | string[] | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}

export default async function MyLibraryGeneratorPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedWorkoutId = getOptionalWorkoutId(params.workout);
  if (selectedWorkoutId) {
    redirect(`/my-library/workouts/${selectedWorkoutId}`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fgenerator");
  }

  const initialSnapshot = await loadGeneratorIntakeSnapshot(supabase, user.id);
  const workoutLibrary = await loadWorkoutLibrarySnapshot(supabase, user.id, null);
  const availableBlockCount = Object.values(
    initialSnapshot.blocks as Record<string, GeneratorIntakeBlockSummary>
  ).filter((block) => block.available).length;

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <TrackEventOnMount
          eventName="generator_intake_viewed"
          payload={{
            availableBlockCount,
            hasOpenGoals: initialSnapshot.openGoals.length > 0,
            hasPrimaryFocus: Boolean(initialSnapshot.activeFocus),
            notesIncluded: initialSnapshot.notesIncluded,
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">AI swim session generator</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/workouts"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                My Swim Sessions
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
            <GeneratorIntakeHub
              initialSnapshot={initialSnapshot}
              userId={user.id}
              workoutLibrary={workoutLibrary}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
