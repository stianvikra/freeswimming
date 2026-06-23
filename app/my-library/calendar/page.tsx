import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import CalendarPeriodComparisonHub from "@/components/my-library/CalendarPeriodComparisonHub";
import CalendarPlanWeekHub from "@/components/my-library/CalendarPlanWeekHub";
import { loadMyLibraryCalendarComparison } from "@/lib/my-library/calendar-comparison";
import { loadMyLibraryCalendarPlan } from "@/lib/my-library/calendar-plan";
import {
  buildMyLibraryCalendarComparisonHref,
  buildMyLibraryCalendarPlanHref,
  getTodayCalendarDate,
  normalizeMyLibraryCalendarDateParam,
  normalizeMyLibraryCalendarPeriodParam,
  normalizeMyLibraryCalendarPlanDateParam,
  normalizeMyLibraryCalendarProgramIdParam,
  normalizeMyLibraryCalendarSourceParam,
  normalizeOptionalMyLibraryCalendarDateParam,
  normalizeMyLibraryCalendarViewParam,
} from "@/lib/my-library/calendar";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyLibraryCalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const modeLinkClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] border px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const activeModeLinkClass =
  "border-[color:var(--fs-color-brand-700)] bg-[color:var(--fs-color-brand-700)] text-white";
const inactiveModeLinkClass =
  "border-[color:var(--fs-border-soft)] bg-white/80 text-[color:var(--fs-color-ink)] hover:bg-white";

export default async function MyLibraryCalendarPage({ searchParams }: MyLibraryCalendarPageProps) {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fcalendar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const todayDate = getTodayCalendarDate();
  const selectedView = normalizeMyLibraryCalendarViewParam(resolvedSearchParams.view);
  const comparisonSelectedDate = normalizeMyLibraryCalendarDateParam(
    resolvedSearchParams.date,
    todayDate
  );
  const planSelectedDate = normalizeMyLibraryCalendarPlanDateParam(
    resolvedSearchParams.date,
    todayDate
  );
  const selectedSource = normalizeMyLibraryCalendarSourceParam(resolvedSearchParams.source);
  const selectedPeriod = normalizeMyLibraryCalendarPeriodParam(resolvedSearchParams.period);
  const compareToDate = normalizeOptionalMyLibraryCalendarDateParam(
    resolvedSearchParams.compareTo,
    todayDate
  );
  const selectedProgramId = normalizeMyLibraryCalendarProgramIdParam(
    resolvedSearchParams.programId
  );
  const comparisonSourceForHref = selectedSource === "unmapped" ? "all" : selectedSource;
  const comparisonPeriodForHref = selectedPeriod === "unmapped" ? "week" : selectedPeriod;
  const content =
    selectedView === "plan" ? (
      <CalendarPlanWeekHub
        model={await loadMyLibraryCalendarPlan(supabase, user.id, {
          selectedDate: planSelectedDate,
          todayDate,
          selectedProgramId,
        })}
      />
    ) : (
      <CalendarPeriodComparisonHub
        model={await loadMyLibraryCalendarComparison(supabase, user.id, {
          selectedDate: comparisonSelectedDate,
          todayDate,
          selectedSource,
          selectedPeriod,
          compareToDate,
        })}
      />
    );

  return (
    <SiteChrome>
      <section
        data-testid="calendar-workspace"
        className={`mx-auto min-h-screen w-full px-4 pt-16 pb-20 sm:px-6 sm:pt-24 ${
          selectedView === "plan" ? "max-w-[1680px]" : "max-w-[1080px]"
        }`}
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Calendar
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                {selectedView === "plan"
                  ? "Scan planned swim sessions by month and open a day for details."
                  : "Review private activity trends across selected My Library sources."}
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center lg:grid lg:justify-items-end">
              <nav
                data-testid="calendar-mode-switch"
                aria-label="Calendar mode"
                className="flex flex-wrap gap-2 lg:justify-end"
              >
                <Link
                  href={buildMyLibraryCalendarPlanHref({ selectedDate: planSelectedDate })}
                  aria-current={selectedView === "plan" ? "page" : undefined}
                  className={`${modeLinkClass} ${
                    selectedView === "plan" ? activeModeLinkClass : inactiveModeLinkClass
                  }`}
                >
                  Plan
                </Link>
                <Link
                  href={buildMyLibraryCalendarComparisonHref({
                    source: comparisonSourceForHref,
                    period: comparisonPeriodForHref,
                    selectedDate: comparisonSelectedDate,
                    compareTo: compareToDate,
                  })}
                  aria-current={selectedView === "compare" ? "page" : undefined}
                  className={`${modeLinkClass} ${
                    selectedView === "compare" ? activeModeLinkClass : inactiveModeLinkClass
                  }`}
                >
                  Trends
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">{content}</div>
      </section>
    </SiteChrome>
  );
}
