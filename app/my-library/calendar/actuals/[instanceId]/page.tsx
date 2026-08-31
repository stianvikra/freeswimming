import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import LocalDayTimezoneSynchronizer from "@/components/my-library/LocalDayTimezoneSynchronizer";
import ReviewActualEditor from "@/components/my-library/ReviewActualEditor";
import {
  buildMyLibraryCalendarPlanHref,
  normalizeMyLibraryCalendarPlanDateParam,
  normalizeMyLibraryCalendarProgramIdParam,
} from "@/lib/my-library/calendar";
import { getRequestReadLocalDayContext } from "@/lib/my-library/local-day-server";
import { loadReviewActualEditorModel } from "@/lib/my-library/review-actual";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReviewActualPageProps = {
  params: Promise<{
    instanceId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildReviewActualHref(input: {
  instanceId: string;
  date?: string | null;
  programId?: string | null;
}) {
  const params = new URLSearchParams();
  if (input.date) params.set("date", input.date);
  if (input.programId) params.set("programId", input.programId);
  const query = params.toString();
  return `/my-library/calendar/actuals/${input.instanceId}${query ? `?${query}` : ""}`;
}

export default async function ReviewActualPage({ params, searchParams }: ReviewActualPageProps) {
  const { instanceId } = await params;
  if (!UUID_PATTERN.test(instanceId)) {
    notFound();
  }

  const [resolvedSearchParams, localDayContext] = await Promise.all([
    searchParams ?? Promise.resolve<Record<string, string | string[] | undefined>>({}),
    getRequestReadLocalDayContext(),
  ]);
  const rawSelectedDate = getFirstSearchParam(resolvedSearchParams.date);
  const selectedDate = normalizeMyLibraryCalendarPlanDateParam(
    resolvedSearchParams.date,
    localDayContext.todayDate
  );
  const selectedProgramId = normalizeMyLibraryCalendarProgramIdParam(
    resolvedSearchParams.programId
  );
  const returnHref = buildMyLibraryCalendarPlanHref({
    selectedDate,
    programId: selectedProgramId ?? undefined,
  });

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();
  if (!supabase || !user) {
    const nextHref = buildReviewActualHref({
      instanceId,
      date: rawSelectedDate ? selectedDate : null,
      programId: selectedProgramId,
    });
    redirect(`/auth/sign-in?next=${encodeURIComponent(nextHref)}`);
  }

  const model = await loadReviewActualEditorModel(supabase, user.id, {
    plannedWorkoutInstanceId: instanceId,
    returnHref,
  });

  return (
    <SiteChrome>
      <LocalDayTimezoneSynchronizer />
      <section
        data-testid="review-actual-route-shell"
        className="mx-auto min-h-screen w-full max-w-[1120px] px-4 pt-16 pb-20 sm:px-6 sm:pt-24"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                Calendar
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Review actual
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                Correct what actually happened without changing the plan, source workout, or future
                provider evidence.
              </p>
            </div>
            <Link
              href={returnHref}
              className="fs-cta-secondary inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold sm:w-auto"
            >
              Back to Calendar
            </Link>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <ReviewActualEditor model={model} />
        </div>
      </section>
    </SiteChrome>
  );
}
