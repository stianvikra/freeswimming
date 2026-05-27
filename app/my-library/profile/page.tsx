import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import AthleteProfileHub from "@/components/my-library/profile/AthleteProfileHub";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function MyLibraryProfilePage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fprofile");
  }

  const initialSnapshot = await loadAthleteProfileSnapshot(supabase, user.id);

  return (
    <SiteChrome>
      <section
        data-testid="my-swim-profile-workspace"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
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
          <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                  My Library
                </p>
                <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                  My Swim Profile
                </h1>
              </div>
              <div data-testid="my-swim-profile-route-actions" className="flex flex-wrap gap-2">
                <Link href="/my-library" className={routeActionClass}>
                  Back to My Library
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-6 sm:mt-8">
            <AthleteProfileHub initialSnapshot={initialSnapshot} userId={user.id} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
