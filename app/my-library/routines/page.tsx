import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TodayTabsPanel from "@/components/my-library/TodayTabsPanel";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";
import { loadHabitSnapshot } from "@/lib/habits/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryRoutinesPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Froutines");
  }

  const [drylandLibrarySnapshot, habitSnapshot] = await Promise.all([
    loadDrylandLibrarySnapshot(supabase, user.id, null),
    loadHabitSnapshot(supabase, user.id),
  ]);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                My Library
              </p>
              <h1
                id="my-library-routines-page-heading"
                className="mt-2 text-3xl font-bold text-slate-900"
              >
                My Routines
              </h1>
            </div>
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Back to My Library
            </Link>
          </div>

          <div className="mt-8">
            <TodayTabsPanel
              drylandLibrary={{
                microPlan: drylandLibrarySnapshot.microPlan,
                microPlanLoadError: drylandLibrarySnapshot.microPlanLoadError,
                microPlanSchemaReady: drylandLibrarySnapshot.microPlanSchemaReady,
                recentSessions: drylandLibrarySnapshot.recentSessions,
              }}
              habitSnapshot={habitSnapshot}
              nowIso={new Date().toISOString()}
              headingId="my-library-routines-page-heading"
              showHeader={false}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
