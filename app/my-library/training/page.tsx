import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrainingContextHub, {
  type TrainingGoalPrefill,
} from "@/components/my-library/training/TrainingContextHub";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

function getOptionalQueryString(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getGoalPrefill(
  params: Record<string, string | string[] | undefined>
): TrainingGoalPrefill | null {
  const goalId = getOptionalQueryString(params.goalId);
  if (!goalId) return null;

  const intent = getOptionalQueryString(params.intent);
  if (intent === "focus" || intent === "note") {
    return { goalId, intent };
  }

  return { goalId, intent: "focus" };
}

export default async function MyLibraryTrainingPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Ftraining");
  }

  const initialSnapshot = await loadTrainingContextSnapshot(supabase, user.id);
  const initialGoalPrefill = getGoalPrefill(params);

  return (
    <SiteChrome>
      <section
        data-testid="my-training-workspace"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <TrackEventOnMount
          eventName="training_context_viewed"
          payload={{
            hasPrimaryFocus: Boolean(initialSnapshot.primaryFocus),
            openFocusCount: initialSnapshot.openFocuses.length,
            noteCount: initialSnapshot.recentNotes.length,
          }}
        />
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                My Training
              </h1>
              <p className="mt-3 max-w-[64ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                Keep goals, today&apos;s cue, supporting focuses, and poolside notes in one training
                workspace without turning this page into a wall of setup text.
              </p>
            </div>
            <div data-testid="my-training-route-actions" className="flex flex-wrap gap-2">
              <Link href="/my-library/goals" className={routeActionClass}>
                Open goals
              </Link>
              <Link href="/my-library" className={routeActionClass}>
                Back to My Library
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <TrainingContextHub
            initialSnapshot={initialSnapshot}
            initialGoalPrefill={initialGoalPrefill}
          />
        </div>
      </section>
    </SiteChrome>
  );
}
