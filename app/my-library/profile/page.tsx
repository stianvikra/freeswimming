import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import AthleteProfileHub from "@/components/my-library/profile/AthleteProfileHub";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryProfilePage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fprofile");
  }

  const initialSnapshot = await loadAthleteProfileSnapshot(supabase, user.id);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <TrackEventOnMount
          eventName="athlete_profile_viewed"
          payload={{
            hasProfile: Boolean(initialSnapshot.profile),
            hasCssMetric: Boolean(initialSnapshot.cssMetric),
            hasPreferences: Boolean(initialSnapshot.preferences),
            personalRecordCount: initialSnapshot.personalRecords.length,
            hasSwimCapabilityLimits: initialSnapshot.swimCapabilityLimits.length > 0,
            swimCapabilityLimitCount: initialSnapshot.swimCapabilityLimits.length,
            profileSchemaReady: initialSnapshot.profileSchemaReady,
            metricsSchemaReady: initialSnapshot.metricsSchemaReady,
            preferencesSchemaReady: initialSnapshot.preferencesSchemaReady,
            personalRecordsSchemaReady: initialSnapshot.personalRecordsSchemaReady,
            swimCapabilityLimitsSchemaReady: initialSnapshot.swimCapabilityLimitsSchemaReady,
          }}
        />
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">My Swim Profile</h1>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
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
