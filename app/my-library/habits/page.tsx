import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import HabitPerfectDayHub from "@/components/my-library/habits/HabitPerfectDayHub";
import { loadHabitSnapshot } from "@/lib/habits/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryHabitsPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fhabits");
  }

  const initialSnapshot = await loadHabitSnapshot(supabase, user.id);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <TrackEventOnMount
          eventName="habits_viewed"
          payload={{
            activeHabitCount: initialSnapshot.activeHabits.length,
            perfectDayPercent: initialSnapshot.daySummary.completionPercent,
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Habits</h1>
              <p className="mt-2 max-w-[62ch] text-sm text-slate-600">
                My Perfect Day keeps small training and life habits private, measurable, and easy to
                reset.
              </p>
            </div>
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Back to My Library
            </Link>
          </div>

          <div className="mt-8">
            <HabitPerfectDayHub initialSnapshot={initialSnapshot} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
