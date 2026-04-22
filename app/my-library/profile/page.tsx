import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import AthleteProfileHub from "@/components/my-library/profile/AthleteProfileHub";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fprofile");
  }

  const initialSnapshot = await loadAthleteProfileSnapshot(supabase, user.id);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <TrackEventOnMount
          eventName="athlete_profile_viewed"
          payload={{
            hasProfile: Boolean(initialSnapshot.profile),
            hasCssMetric: Boolean(initialSnapshot.cssMetric),
            hasPreferences: Boolean(initialSnapshot.preferences),
            personalRecordCount: initialSnapshot.personalRecords.length,
            profileSchemaReady: initialSnapshot.profileSchemaReady,
            metricsSchemaReady: initialSnapshot.metricsSchemaReady,
            preferencesSchemaReady: initialSnapshot.preferencesSchemaReady,
            personalRecordsSchemaReady: initialSnapshot.personalRecordsSchemaReady,
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Athlete profile, training setup & records
              </h1>
              <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
                Keep a private swimmer profile, trusted CSS, practical training preferences, and
                current personal records together in one place without mixing them into Goals,
                Focus, or Notes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/training"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Open focus & notes
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
            <h2 className="text-base font-semibold text-slate-900">How this fits</h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Athlete profile
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Private swimmer context that stays stable between sessions.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  Metrics & preferences
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Trusted CSS and practical defaults that later help shape session generation.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Personal records
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Private current bests for explicit swim events, ready for later generator use.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Goals, Focus & Notes
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Direction, current work, and reflections still stay separate from training setup.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <AthleteProfileHub initialSnapshot={initialSnapshot} userId={user.id} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
