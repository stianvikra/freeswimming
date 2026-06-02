import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import GeneratorIntakeHub from "@/components/my-library/generator/GeneratorIntakeHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import type { GeneratorIntakeBlockSummary } from "@/lib/generator-intake/shared";
import { loadGeneratorIntakeSnapshot } from "@/lib/generator-intake/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const routeActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

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

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fgenerator");
  }

  const initialSnapshot = await loadGeneratorIntakeSnapshot(supabase, user.id);
  const workoutLibrary = await loadWorkoutLibrarySnapshot(supabase, user.id, null);
  const availableBlockCount = Object.values(
    initialSnapshot.blocks as Record<string, GeneratorIntakeBlockSummary>
  ).filter((block) => block.available).length;

  return (
    <SiteChrome>
      <section
        data-testid="ai-session-generator-workspace"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <TrackEventOnMount
          eventName="generator_intake_viewed"
          payload={{
            availableBlockCount,
            hasOpenGoals: initialSnapshot.openGoals.length > 0,
            hasPrimaryFocus: Boolean(initialSnapshot.activeFocus),
            notesIncluded: initialSnapshot.notesIncluded,
          }}
        />
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[color:var(--fs-color-ink-strong)]">
                AI swim session generator
              </h1>
            </div>
            <div data-testid="generator-route-actions" className={getMobileActionGroupClass(2)}>
              <Link
                href="/my-library/workouts"
                className={`${routeActionClass} ${mobileActionItemClass}`}
              >
                My Swim Sessions
              </Link>
              <Link href="/my-library" className={`${routeActionClass} ${mobileActionItemClass}`}>
                Back to My Library
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <GeneratorIntakeHub
            initialSnapshot={initialSnapshot}
            userId={user.id}
            workoutLibrary={workoutLibrary}
          />
        </div>
      </section>
    </SiteChrome>
  );
}
