import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import HabitPerfectDayHub from "@/components/my-library/habits/HabitPerfectDayHub";
import { loadHabitSnapshot } from "@/lib/habits/server";
import {
  getTodayCalendarDate,
  normalizeMyLibraryCalendarDateParam,
} from "@/lib/my-library/calendar";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyLibraryHabitsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function MyLibraryHabitsPage({ searchParams }: MyLibraryHabitsPageProps) {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fhabits");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const viewParam = resolvedSearchParams.view;
  const viewValues = Array.isArray(viewParam) ? viewParam : viewParam ? [viewParam] : [];
  const preferMobileActiveFocus = viewValues.includes("active");
  const todayDate = getTodayCalendarDate();
  const selectedDate = normalizeMyLibraryCalendarDateParam(resolvedSearchParams.date, todayDate);
  const initialSnapshot = await loadHabitSnapshot(supabase, user.id, selectedDate);
  const selectedDateLabel =
    initialSnapshot.selectedDate === todayDate ? "today" : initialSnapshot.selectedDate;

  return (
    <SiteChrome>
      <section
        data-testid="habits-workspace"
        className={`mx-auto w-full max-w-[1040px] px-4 pt-24 pb-8 sm:px-6 sm:pt-28 sm:pb-10 ${
          preferMobileActiveFocus ? "max-sm:max-w-[720px]" : ""
        }`}
      >
        <TrackEventOnMount
          eventName="habits_viewed"
          payload={{
            activeHabitCount: initialSnapshot.activeHabits.length,
            perfectDayPercent: initialSnapshot.daySummary.completionPercent,
          }}
        />
        {preferMobileActiveFocus ? <h1 className="sr-only">Habits</h1> : null}
        <header
          className={`border-b border-[color:var(--fs-border-brand)] pb-5 ${
            preferMobileActiveFocus ? "hidden sm:block" : ""
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href="/my-library"
                className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)] underline-offset-2 transition hover:underline"
              >
                My Library
              </Link>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Habits
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                Private habit check-ins for {selectedDateLabel}.
              </p>
            </div>
            <div data-testid="habits-route-actions" className="hidden sm:block">
              <Link href="/my-library" className={routeActionClass}>
                Back
              </Link>
            </div>
          </div>
        </header>

        <div className={preferMobileActiveFocus ? "mt-0 sm:mt-8" : "mt-6 sm:mt-8"}>
          <HabitPerfectDayHub
            initialSnapshot={initialSnapshot}
            preferMobileActiveFocus={preferMobileActiveFocus}
            todayDate={todayDate}
            userId={user.id}
          />
        </div>
      </section>
    </SiteChrome>
  );
}
