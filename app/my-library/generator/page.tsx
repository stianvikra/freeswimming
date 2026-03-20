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
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <TrackEventOnMount
          eventName="generator_intake_viewed"
          payload={{
            availableBlockCount,
            hasOpenGoals: initialSnapshot.openGoals.length > 0,
            hasActiveFocus: Boolean(initialSnapshot.activeFocus),
            notesIncluded: initialSnapshot.notesIncluded,
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Generator intake</h1>
              <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
                Review which saved My Library signals should prefill session generation, then apply
                one-run overrides without editing your stored profile, records, goals, or focus.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/profile"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Review profile data
              </Link>
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <h2 className="text-base font-semibold text-slate-900">How this intake works</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Saved My Library data
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Profile, CSS, preferences, records, goals, and active focus stay server-owned.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  This run only
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Include or exclude blocks and set overrides that do not write back into My
                  Library.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Canonical workout save
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  This page can now accept one reviewed session into a canonical workout and hand it
                  off into the dedicated workout builder route for later editing.
                </p>
              </div>
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
