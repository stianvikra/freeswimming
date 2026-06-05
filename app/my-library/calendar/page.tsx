import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import CalendarPeriodComparisonHub from "@/components/my-library/CalendarPeriodComparisonHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { loadMyLibraryCalendarComparison } from "@/lib/my-library/calendar-comparison";
import {
  getTodayCalendarDate,
  normalizeMyLibraryCalendarDateParam,
  normalizeMyLibraryCalendarPeriodParam,
  normalizeMyLibraryCalendarSourceParam,
  normalizeOptionalMyLibraryCalendarDateParam,
} from "@/lib/my-library/calendar";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MyLibraryCalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function MyLibraryCalendarPage({ searchParams }: MyLibraryCalendarPageProps) {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fcalendar");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const todayDate = getTodayCalendarDate();
  const selectedDate = normalizeMyLibraryCalendarDateParam(resolvedSearchParams.date, todayDate);
  const selectedSource = normalizeMyLibraryCalendarSourceParam(resolvedSearchParams.source);
  const selectedPeriod = normalizeMyLibraryCalendarPeriodParam(resolvedSearchParams.period);
  const compareToDate = normalizeOptionalMyLibraryCalendarDateParam(
    resolvedSearchParams.compareTo,
    todayDate
  );
  const model = await loadMyLibraryCalendarComparison(supabase, user.id, {
    selectedDate,
    todayDate,
    selectedSource,
    selectedPeriod,
    compareToDate,
  });

  return (
    <SiteChrome>
      <section
        data-testid="calendar-workspace"
        className="mx-auto min-h-screen w-full max-w-[1080px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Calendar
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                Compare private activity trends across selected My Library sources.
              </p>
            </div>
            <div data-testid="calendar-route-actions" className={getMobileActionGroupClass(1)}>
              <Link href="/my-library" className={`${routeActionClass} ${mobileActionItemClass}`}>
                Back to My Library
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <CalendarPeriodComparisonHub model={model} />
        </div>
      </section>
    </SiteChrome>
  );
}
