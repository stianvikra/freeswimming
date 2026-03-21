import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrainingContextHub, {
  type TrainingGoalPrefill,
} from "@/components/my-library/training/TrainingContextHub";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Ftraining");
  }

  const initialSnapshot = await loadTrainingContextSnapshot(supabase, user.id);
  const initialGoalPrefill = getGoalPrefill(params);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <TrackEventOnMount
          eventName="training_context_viewed"
          payload={{
            hasPrimaryFocus: Boolean(initialSnapshot.primaryFocus),
            openFocusCount: initialSnapshot.openFocuses.length,
            noteCount: initialSnapshot.recentNotes.length,
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Focus & Notes</h1>
              <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
                Keep multiple swim focuses open when needed, choose one primary cue when other My
                Library surfaces need a single current focus, and capture what you notice in the
                pool so you can come back with answers or clear next actions after the session.
                Saved goals can prefill the next step here without becoming the same thing as your
                focus or notes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/goals"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Open goals
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
            <h2 className="text-base font-semibold text-slate-900">How these work together</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Goals</p>
                <p className="mt-2 text-sm text-slate-700">Where you want to go over time.</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Focus
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  What you are training on now, with one optional primary cue.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Notes
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  What you noticed or want to check later.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <TrainingContextHub
              initialSnapshot={initialSnapshot}
              initialGoalPrefill={initialGoalPrefill}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
