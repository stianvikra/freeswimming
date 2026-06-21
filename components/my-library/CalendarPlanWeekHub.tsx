import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/components/ui/cx";
import CalendarPlanSessionActions from "@/components/my-library/CalendarPlanSessionActions";
import { buildMyLibraryCalendarPlanHref } from "@/lib/my-library/calendar";
import type { MyLibraryCalendarDailyLayer } from "@/lib/my-library/calendar-daily-layers";
import type {
  MyLibraryCalendarPlanDay,
  MyLibraryCalendarPlanMonthDay,
  MyLibraryCalendarPlanModel,
  MyLibraryCalendarPlanSession,
} from "@/lib/my-library/calendar-plan";
import type { ProgramSummary } from "@/lib/programs/shared";

type Props = {
  model: MyLibraryCalendarPlanModel;
};

type FeedbackTone = "warning" | "error" | "empty";

const cardClass = "fs-library-card p-4 sm:p-5";
const mutedCardClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const eyebrowClass =
  "text-[12px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const actionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const calendarActionClass = cx(actionClass, "w-full sm:w-40");
const calendarNavActionClass = cx(actionClass, "min-w-0 px-2 text-xs sm:w-40 sm:px-4 sm:text-sm");
const sessionActionClass = cx(actionClass, "w-full sm:w-[9rem]");
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const filterClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] border px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const selectedFilterClass =
  "border-[color:var(--fs-color-brand-700)] bg-[color:var(--fs-color-brand-700)] text-white";
const idleFilterClass =
  "border-[color:var(--fs-border-soft)] bg-white/80 text-[color:var(--fs-color-ink)] hover:bg-white";
const statusChipClass = "inline-flex text-xs font-semibold text-emerald-700";
const missingChipClass = "inline-flex text-xs font-semibold text-amber-800";
const reviewChipClass = "inline-flex text-xs font-semibold text-slate-600";
const layerChipClass =
  "block rounded-[6px] border px-2 py-1 text-left text-[11px] leading-4 font-semibold";

const feedbackToneClasses: Record<FeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50/80 text-amber-950",
  error: "border-rose-200 bg-rose-50/80 text-rose-900",
  empty: "border-slate-200 bg-slate-50/80 text-slate-700",
};

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const WEEK_TOTAL_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const WEEKDAY_SHORT_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatPlanDateLabel(dateKey: string) {
  return DATE_LABEL_FORMATTER.format(new Date(`${dateKey}T00:00:00.000Z`));
}

function formatWeekTotalDateLabel(dateKey: string) {
  return WEEK_TOTAL_DATE_FORMATTER.format(new Date(`${dateKey}T00:00:00.000Z`));
}

function formatSessionCount(count: number) {
  return `${count} planned session${count === 1 ? "" : "s"}`;
}

function formatCompactSessionCount(count: number) {
  return `${count} session${count === 1 ? "" : "s"}`;
}

function formatReviewCount(count: number) {
  return `${count} review item${count === 1 ? "" : "s"}`;
}

function formatLayerCount(count: number) {
  return `${count} daily layer${count === 1 ? "" : "s"}`;
}

function getSessionStatusLabel(session: MyLibraryCalendarPlanSession) {
  if (session.completion.selection === "manual_completed") return "Completed";
  if (session.completion.selection === "review") return "Completion review";
  if (!session.workout) return "Missing workout";

  switch (session.statusSelection) {
    case "planned":
      return session.dateOverrideKind === "manual" ? "Rescheduled" : "Planned";
    case "skipped":
      return "Skipped";
    case "cancelled":
      return "Cancelled";
    case "unmapped":
    default:
      return "Review status";
  }
}

function getSessionStatusClass(session: MyLibraryCalendarPlanSession) {
  if (session.completion.selection === "manual_completed") return statusChipClass;
  if (session.completion.selection === "review") return reviewChipClass;
  if (!session.workout) return missingChipClass;

  switch (session.statusSelection) {
    case "planned":
      return statusChipClass;
    case "skipped":
      return "inline-flex text-xs font-semibold text-amber-800";
    case "cancelled":
      return "inline-flex text-xs font-semibold text-rose-800";
    case "unmapped":
    default:
      return reviewChipClass;
  }
}

function getSessionSupportText(session: MyLibraryCalendarPlanSession) {
  if (session.completion.selection === "manual_completed") {
    return `Marked done manually on ${formatPlanDateLabel(
      session.completion.completedOn
    )}. Planned identity stays linked for future reconciliation.`;
  }

  if (session.completion.selection === "review") {
    return "Completion state needs review before this item can count as done.";
  }

  if (session.completion.selection === "schema_missing") {
    return "Completed swim history is still syncing in this environment.";
  }

  switch (session.statusSelection) {
    case "planned":
      return session.dateOverrideKind === "manual"
        ? "Rescheduled manually. Ready to mark done from this plan item."
        : "Ready to mark done from this plan item.";
    case "skipped":
      return "Skipped in the plan. This is not completion history.";
    case "cancelled":
      return "Cancelled in the plan. Recover it if it should stay scheduled.";
    case "unmapped":
    default:
      return "Plan status needs review before this item can be marked done.";
  }
}

function doesSessionNeedReview(session: MyLibraryCalendarPlanSession) {
  return (
    !session.workout ||
    session.statusSelection !== "planned" ||
    session.completion.selection === "review"
  );
}

function shouldShowMonthStatusLabel(session: MyLibraryCalendarPlanSession) {
  return (
    !session.workout ||
    session.statusSelection !== "planned" ||
    session.dateOverrideKind === "manual" ||
    session.completion.selection === "manual_completed" ||
    session.completion.selection === "review"
  );
}

function shouldShowDailyLayer(layer: MyLibraryCalendarDailyLayer) {
  return layer.status !== "no_data" && layer.status !== "future";
}

function getVisibleDailyLayers(layers: MyLibraryCalendarDailyLayer[]) {
  return layers.filter(shouldShowDailyLayer);
}

function getDailyLayerToneClass(layer: MyLibraryCalendarDailyLayer) {
  if (layer.status === "error") return "border-rose-200 bg-rose-50/90 text-rose-900";
  if (layer.status === "schema_missing" || layer.status === "review" || layer.tone === "warning") {
    return "border-amber-200 bg-amber-50/90 text-amber-950";
  }
  if (layer.tone === "positive") return "border-emerald-200 bg-emerald-50/90 text-emerald-800";
  if (layer.tone === "muted") return "border-slate-200 bg-slate-50/90 text-slate-600";
  return "border-blue-100 bg-blue-50/80 text-[color:var(--fs-color-brand-700)]";
}

function getDailyLayerMetricToneClass(metric: MyLibraryCalendarDailyLayer["metrics"][number]) {
  if (metric.tone === "warning") return "text-amber-800";
  if (metric.tone === "positive") return "text-emerald-700";
  if (metric.tone === "error") return "text-rose-800";
  if (metric.tone === "muted") return "text-[color:var(--fs-color-muted)]";
  return "text-[color:var(--fs-color-ink-strong)]";
}

function formatDistanceTotal(meters: number | null) {
  return typeof meters === "number" ? `${meters}m` : "Not set";
}

function formatDurationTotal(minutes: number | null) {
  return typeof minutes === "number" ? `~${minutes} min` : "Not set";
}

function getWeekSessions(days: MyLibraryCalendarPlanDay[]) {
  return days.flatMap((day) => day.sessions);
}

function getWeekTotals(days: MyLibraryCalendarPlanDay[]) {
  const sessions = getWeekSessions(days);
  const distanceMeters = sessions.reduce<number | null>((total, session) => {
    const distance = session.workout?.totalDistanceM;
    return typeof distance === "number" ? (total ?? 0) + distance : total;
  }, null);
  const durationMinutes = sessions.reduce<number | null>((total, session) => {
    const minutes = session.workout?.estimatedDurationMin;
    return typeof minutes === "number" ? (total ?? 0) + minutes : total;
  }, null);
  const reviewCount = sessions.filter(doesSessionNeedReview).length;
  const completedCount = sessions.filter(
    (session) => session.completion.selection === "manual_completed"
  ).length;

  return {
    sessionCount: sessions.length,
    distanceMeters,
    durationMinutes,
    reviewCount,
    completedCount,
  };
}

function getWeekTotalRangeLabel(days: MyLibraryCalendarPlanDay[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  if (!firstDay || !lastDay) {
    return "Week";
  }

  return `${formatWeekTotalDateLabel(firstDay.date)}-${formatWeekTotalDateLabel(lastDay.date)}`;
}

function getDayNumberLabel(dateKey: string) {
  return String(Number(dateKey.slice(8, 10)));
}

function chunkMonthDays(days: MyLibraryCalendarPlanMonthDay[]) {
  const weeks: MyLibraryCalendarPlanMonthDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

function Feedback({
  tone,
  children,
  testId,
}: {
  tone: FeedbackTone;
  children: ReactNode;
  testId: string;
}) {
  const isError = tone === "error";
  const isEmpty = tone === "empty";

  return (
    <div
      role={isEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isEmpty ? undefined : isError ? "assertive" : "polite"}
      data-feedback-tone={tone}
      data-testid={testId}
      className={cx(
        "rounded-[var(--fs-radius-card)] border p-4 text-sm leading-6",
        feedbackToneClasses[tone]
      )}
    >
      {children}
    </div>
  );
}

function WeekNavigation({ model }: { model: MyLibraryCalendarPlanModel }) {
  const { window } = model;
  const selectedProgramId = model.selectedProgramId ?? undefined;

  return (
    <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap sm:justify-between sm:gap-3">
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: window.previousWindowDate,
          programId: selectedProgramId,
        })}
        className={calendarNavActionClass}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Link>
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: model.todayDate,
          programId: selectedProgramId,
        })}
        aria-current={model.selectedDate === model.todayDate ? "date" : undefined}
        className={calendarNavActionClass}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Today
      </Link>
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: window.nextWindowDate,
          programId: selectedProgramId,
        })}
        className={calendarNavActionClass}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function MonthNavigation({ model }: { model: MyLibraryCalendarPlanModel }) {
  const selectedProgramId = model.selectedProgramId ?? undefined;

  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: model.month.previousMonthDate,
          programId: selectedProgramId,
        })}
        className={calendarActionClass}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </Link>
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: model.todayDate,
          programId: selectedProgramId,
        })}
        aria-current={model.selectedDate === model.todayDate ? "date" : undefined}
        className={calendarActionClass}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Today
      </Link>
      <Link
        href={buildMyLibraryCalendarPlanHref({
          selectedDate: model.month.nextMonthDate,
          programId: selectedProgramId,
        })}
        className={calendarActionClass}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ProgramFilter({
  model,
  program,
}: {
  model: MyLibraryCalendarPlanModel;
  program: ProgramSummary;
}) {
  const isSelected = model.selectedProgramId === program.id;
  const href = buildMyLibraryCalendarPlanHref({
    selectedDate: model.selectedDate,
    programId: program.id,
  });

  return (
    <Link
      href={href}
      aria-current={isSelected ? "true" : undefined}
      className={cx(filterClass, isSelected ? selectedFilterClass : idleFilterClass)}
    >
      {program.title}
    </Link>
  );
}

function SessionRow({
  session,
  compact = false,
}: {
  session: MyLibraryCalendarPlanSession;
  compact?: boolean;
}) {
  const workoutSummary = session.workout
    ? [
        session.workout.totalDistanceM ? `${session.workout.totalDistanceM}m` : null,
        session.workout.estimatedDurationMin
          ? `~${session.workout.estimatedDurationMin} min`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : (session.workoutId ?? "Missing workout reference");
  const programTitle = session.program?.title ?? "Missing plan";
  const statusLabel = getSessionStatusLabel(session);
  const statusClass = getSessionStatusClass(session);

  return (
    <div
      data-testid={`calendar-plan-session-${session.id}`}
      className="border-t border-[color:var(--fs-border-soft)] py-4 first:border-t-0 first:pt-0 last:pb-0"
    >
      <div
        className={cx(
          "space-y-3",
          !compact &&
            "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:space-y-0"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={statusClass}>{statusLabel}</span>
            <p className="text-xs font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              {programTitle} · {session.weekLabel}
            </p>
          </div>
          <h3 className="mt-2 text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
            {session.workout?.title ?? "Workout reference needs review"}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--fs-color-muted)]">{workoutSummary}</p>
          <p className="mt-1 text-xs font-medium text-[color:var(--fs-color-muted)]">
            {getSessionSupportText(session)}
          </p>
          <CalendarPlanSessionActions session={session} />
        </div>
        <div
          className={cx(
            "grid gap-2 sm:flex sm:flex-wrap sm:items-center",
            !compact && "lg:justify-end",
            session.workout ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {session.program ? (
            <Link
              href={`/my-library/programs/${session.program.id}`}
              className={sessionActionClass}
            >
              Edit Plan
            </Link>
          ) : null}
          {session.workout ? (
            <Link
              href={`/my-library/workouts/${session.workout.id}`}
              className={sessionActionClass}
            >
              Open workout
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MonthDayCell({
  day,
  programId,
  todayDate,
}: {
  day: MyLibraryCalendarPlanMonthDay;
  programId?: string;
  todayDate: string;
}) {
  const visibleSessions = day.sessions.slice(0, 2);
  const hiddenSessionCount = Math.max(0, day.sessions.length - visibleSessions.length);
  const visibleLayers = getVisibleDailyLayers(day.dailyLayers).slice(0, 3);
  const hiddenLayerCount = Math.max(
    0,
    getVisibleDailyLayers(day.dailyLayers).length - visibleLayers.length
  );
  const isPastDate = day.date < todayDate;
  const href = buildMyLibraryCalendarPlanHref({
    selectedDate: day.date,
    programId,
  });
  const layerLabel =
    visibleLayers.length > 0
      ? `, ${visibleLayers.map((layer) => layer.compactLabel).join(", ")}`
      : "";
  const ariaLabel = `${formatPlanDateLabel(day.date)}${day.isToday ? ", today" : ""}, ${formatSessionCount(
    day.sessions.length
  )}${layerLabel}`;
  const dayNumberClass = cx(
    "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-semibold",
    day.isToday
      ? "bg-[color:var(--fs-color-brand-700)] text-white"
      : isPastDate || !day.isCurrentMonth
        ? "text-[color:var(--fs-color-muted)]"
        : "text-[color:var(--fs-color-ink-strong)]"
  );

  return (
    <Link
      href={href}
      aria-current={day.isSelected ? "page" : day.isToday ? "date" : undefined}
      aria-label={ariaLabel}
      data-testid={`calendar-plan-month-day-${day.date}`}
      data-selected={day.isSelected ? "true" : undefined}
      data-today={day.isToday ? "true" : undefined}
      className={cx(
        "block min-h-[10.75rem] p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-inset",
        day.isSelected
          ? "bg-blue-50/55 ring-2 ring-[color:var(--fs-color-brand-700)] ring-inset"
          : day.isCurrentMonth
            ? "bg-white hover:bg-slate-50/70"
            : "bg-slate-50/75 hover:bg-slate-100/70",
        day.isCurrentMonth
          ? "text-[color:var(--fs-color-ink)]"
          : "text-[color:var(--fs-color-muted)]"
      )}
    >
      <span className="flex min-h-6 items-center justify-between gap-2">
        <span data-testid={`calendar-plan-month-day-number-${day.date}`} className={dayNumberClass}>
          {getDayNumberLabel(day.date)}
        </span>
      </span>

      {visibleSessions.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-label="Planned sessions">
          {visibleSessions.map((session) => (
            <li
              key={session.id}
              className={cx(
                "rounded-[6px] border bg-white/90 px-2.5 py-2 text-left text-[12px] leading-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
                session.workout
                  ? session.statusSelection === "planned"
                    ? "border-l-[3px] border-slate-200 border-l-[color:var(--fs-color-brand-500)]"
                    : "border-l-[3px] border-amber-200 border-l-amber-500"
                  : "border-l-[3px] border-rose-200 border-l-rose-500"
              )}
            >
              <span className="line-clamp-2 font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                {session.workout?.title ?? "Workout needs review"}
              </span>
              {shouldShowMonthStatusLabel(session) ? (
                <span className="mt-1 block text-[11px] font-semibold text-[color:var(--fs-color-muted)]">
                  {getSessionStatusLabel(session)}
                </span>
              ) : null}
            </li>
          ))}
          {hiddenSessionCount > 0 ? (
            <li className="px-1 text-xs font-semibold text-[color:var(--fs-color-muted)]">
              +{hiddenSessionCount} more
            </li>
          ) : null}
        </ul>
      ) : (
        <span aria-label="No planned sessions" className="sr-only">
          No planned sessions
        </span>
      )}

      {visibleLayers.length > 0 ? (
        <ul className="mt-3 space-y-1.5" aria-label="Daily source signals">
          {visibleLayers.map((layer) => (
            <li key={layer.source} className={cx(layerChipClass, getDailyLayerToneClass(layer))}>
              {layer.compactLabel}
            </li>
          ))}
          {hiddenLayerCount > 0 ? (
            <li className="px-1 text-xs font-semibold text-[color:var(--fs-color-muted)]">
              +{hiddenLayerCount} more signals
            </li>
          ) : null}
        </ul>
      ) : null}
    </Link>
  );
}

function DailyLayerRows({
  layers,
  compact = false,
  showNoData = false,
}: {
  layers: MyLibraryCalendarDailyLayer[];
  compact?: boolean;
  showNoData?: boolean;
}) {
  const displayLayers = showNoData ? layers : getVisibleDailyLayers(layers);

  if (displayLayers.length === 0) return null;

  return (
    <div className="mt-5 border-t border-[color:var(--fs-border-soft)] pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={eyebrowClass}>Daily layers</p>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
            Whole-day signals
          </h3>
        </div>
        <span className="rounded-[var(--fs-radius-control)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
          {formatLayerCount(displayLayers.length)}
        </span>
      </div>

      <div className="mt-3 divide-y divide-[color:var(--fs-border-soft)]">
        {displayLayers.map((layer) => (
          <div
            key={layer.source}
            data-testid={`calendar-daily-layer-${layer.source}`}
            className={cx(
              "py-3 first:pt-0 last:pb-0",
              !compact && "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4"
            )}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cx(
                    "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                    getDailyLayerToneClass(layer)
                  )}
                >
                  {layer.label}
                </span>
                <span className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
                  {layer.compactLabel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--fs-color-ink)]">
                {layer.summary}
              </p>
              <p className="mt-1 text-xs leading-5 font-medium text-[color:var(--fs-color-muted)]">
                {layer.supportLabel}
              </p>
              {layer.metrics.length > 0 ? (
                <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {layer.metrics.map((metric) => (
                    <div key={metric.id}>
                      <dt className="text-[10px] font-semibold text-[color:var(--fs-color-muted)] uppercase">
                        {metric.label}
                      </dt>
                      <dd
                        className={cx(
                          "text-sm font-semibold",
                          getDailyLayerMetricToneClass(metric)
                        )}
                      >
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            <Link href={layer.href} className={cx(sessionActionClass, "mt-3 sm:w-40 lg:mt-0")}>
              Open source
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthWeekTotalCell({ days }: { days: MyLibraryCalendarPlanMonthDay[] }) {
  const totals = getWeekTotals(days);
  const weekStartDate = days[0]?.date ?? "unknown";

  return (
    <div
      data-testid={`calendar-plan-month-week-total-${weekStartDate}`}
      className="flex min-h-[10.75rem] flex-col border-l-[3px] border-[color:var(--fs-color-brand-500)] bg-blue-50/70 p-3 text-left"
      aria-label={`Week total ${getWeekTotalRangeLabel(days)}, ${formatCompactSessionCount(
        totals.sessionCount
      )}, ${formatDistanceTotal(totals.distanceMeters)}, ${formatDurationTotal(
        totals.durationMinutes
      )}, ${totals.completedCount} completed`}
    >
      <p className="text-[11px] font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
        Week total
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-600">{getWeekTotalRangeLabel(days)}</p>
      {totals.sessionCount > 0 ? (
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-[10px] font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              Sessions
            </dt>
            <dd className="text-sm font-semibold text-slate-950">
              {formatCompactSessionCount(totals.sessionCount)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              Distance
            </dt>
            <dd className="text-sm font-semibold text-slate-950">
              {formatDistanceTotal(totals.distanceMeters)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold text-[color:var(--fs-color-brand-700)] uppercase">
              Time
            </dt>
            <dd className="text-sm font-semibold text-slate-950">
              {formatDurationTotal(totals.durationMinutes)}
            </dd>
          </div>
          {totals.completedCount > 0 ? (
            <div>
              <dt className="text-[10px] font-semibold text-[color:var(--fs-color-muted)] uppercase">
                Done
              </dt>
              <dd className="text-sm font-semibold text-emerald-700">
                {totals.completedCount} completed
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-3 text-sm leading-5 text-[color:var(--fs-color-muted)]">No sessions</p>
      )}
      {totals.reviewCount > 0 ? (
        <p className="mt-auto pt-3 text-[11px] leading-4 font-semibold text-amber-800">
          {formatReviewCount(totals.reviewCount)} needs review.
        </p>
      ) : null}
    </div>
  );
}

function MonthOverview({
  model,
  testId = "calendar-plan-month-overview",
  headingId = "calendar-plan-month-heading",
}: {
  model: MyLibraryCalendarPlanModel;
  testId?: string;
  headingId?: string;
}) {
  const weeks = chunkMonthDays(model.monthDays);
  const selectedProgramId = model.selectedProgramId ?? undefined;

  return (
    <section
      aria-labelledby={headingId}
      data-testid={testId}
      className="fs-library-card overflow-hidden p-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--fs-border-soft)] bg-white/80 p-4 sm:p-5">
        <div>
          <p className={eyebrowClass}>Month</p>
          <h2
            id={headingId}
            className="mt-1 text-xl font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            {model.month.label}
          </h2>
        </div>
        <span className="rounded-[var(--fs-radius-control)] bg-slate-50 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
          {formatSessionCount(model.sessionCount)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[82rem] table-fixed border-collapse bg-white/70">
          <colgroup>
            {WEEKDAY_SHORT_LABELS.map((label) => (
              <col key={label} className="w-[11.5%]" />
            ))}
            <col className="w-[19.5%]" />
          </colgroup>
          <caption className="sr-only">
            Planned swim sessions for {model.month.label}. Select a day to inspect details. The
            final column summarizes each visible calendar week.
          </caption>
          <thead>
            <tr>
              {WEEKDAY_SHORT_LABELS.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="border-b border-[color:var(--fs-border-soft)] bg-slate-50/85 px-3 py-2 text-left text-xs font-semibold text-[color:var(--fs-color-muted)]"
                >
                  {label}
                </th>
              ))}
              <th
                scope="col"
                className="border-b border-l border-[color:var(--fs-border-soft)] bg-slate-50/85 px-3 py-2 text-left text-xs font-semibold text-[color:var(--fs-color-muted)]"
              >
                Week total
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]?.date}>
                {week.map((day) => (
                  <td
                    key={day.date}
                    className="border border-[color:var(--fs-border-soft)] p-0 align-top"
                  >
                    <MonthDayCell
                      day={day}
                      programId={selectedProgramId}
                      todayDate={model.todayDate}
                    />
                  </td>
                ))}
                <td className="border border-[color:var(--fs-border-soft)] p-0 align-top">
                  <MonthWeekTotalCell days={week} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SelectedDayDetail({
  day,
  compact = false,
  testId = `calendar-plan-selected-day-${day.date}`,
  headingId = "calendar-plan-selected-day-heading",
}: {
  day: MyLibraryCalendarPlanDay;
  compact?: boolean;
  testId?: string;
  headingId?: string;
}) {
  return (
    <section aria-labelledby={headingId} data-testid={testId} className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={eyebrowClass}>Selected day</p>
          <h2
            id={headingId}
            className="mt-1 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            {formatPlanDateLabel(day.date)}
          </h2>
        </div>
        <span className="rounded-[var(--fs-radius-control)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
          {formatCompactSessionCount(day.sessions.length)}
        </span>
      </div>

      {day.sessions.length > 0 ? (
        <div className="mt-4">
          {day.sessions.map((session) => (
            <SessionRow key={session.id} session={session} compact={compact} />
          ))}
        </div>
      ) : (
        <p className={cx("mt-4", mutedTextClass)}>No planned swim session on this date.</p>
      )}

      <DailyLayerRows layers={day.dailyLayers} compact={compact} showNoData />
    </section>
  );
}

function DayPlan({ day }: { day: MyLibraryCalendarPlanDay }) {
  return (
    <section data-testid={`calendar-plan-day-${day.date}`} className={cardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={eyebrowClass}>{day.dayLabel}</p>
          <h2 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
            {formatPlanDateLabel(day.date)}
          </h2>
        </div>
        <span className="rounded-[var(--fs-radius-control)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
          {day.sessions.length} planned
        </span>
      </div>

      {day.sessions.length > 0 ? (
        <div className="mt-4">
          {day.sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <p className={cx("mt-4", mutedTextClass)}>No planned swim session on this date.</p>
      )}

      <DailyLayerRows layers={day.dailyLayers} compact />
    </section>
  );
}

export default function CalendarPlanWeekHub({ model }: Props) {
  const selectedProgram = model.programs.find((program) => program.id === model.selectedProgramId);
  const primaryProgram = selectedProgram ?? model.programs[0] ?? model.unanchoredPrograms[0];
  const primaryProgramHref = primaryProgram
    ? `/my-library/programs/${primaryProgram.id}`
    : "/my-library";
  const primaryProgramActionLabel = primaryProgram ? "Open Plan" : "Back to My Library";
  const weekSessionCount = model.days.reduce((total, day) => total + day.sessions.length, 0);

  return (
    <section data-testid="calendar-plan-week-hub" className="space-y-5">
      {!model.schemaReady ? (
        <Feedback tone="warning" testId="calendar-plan-schema-warning">
          Program calendar planning is still syncing in this environment.
        </Feedback>
      ) : null}

      {!model.completionSchemaReady ? (
        <Feedback tone="warning" testId="calendar-plan-completion-schema-warning">
          Completed swim history is still syncing in this environment.
        </Feedback>
      ) : null}

      {model.loadError ? (
        <Feedback tone="error" testId="calendar-plan-load-error">
          {model.loadError}
        </Feedback>
      ) : null}

      {model.selectedProgramMissing ? (
        <Feedback tone="warning" testId="calendar-plan-selected-missing-warning">
          That saved program could not be found for this account.
        </Feedback>
      ) : null}

      {model.unanchoredPrograms.length > 0 ? (
        <Feedback tone="warning" testId="calendar-plan-unanchored-warning">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {model.unanchoredPrograms.length === 1
                  ? "One saved plan needs a Week 1 start date."
                  : `${model.unanchoredPrograms.length} saved plans need a Week 1 start date.`}
              </p>
              <p className="mt-1">
                Set the start week in the program editor before it appears in Plan.
              </p>
            </div>
            <Link
              href={`/my-library/programs/${model.unanchoredPrograms[0].id}`}
              className={cx(primaryActionClass, "w-40")}
            >
              Open Plan
            </Link>
          </div>
        </Feedback>
      ) : null}

      {model.missingWorkoutIds.length > 0 ? (
        <Feedback tone="warning" testId="calendar-plan-missing-workouts-warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              {model.missingWorkoutIds.length === 1
                ? "One planned workout could not be loaded for this account."
                : `${model.missingWorkoutIds.length} planned workouts could not be loaded for this account.`}
            </p>
          </div>
        </Feedback>
      ) : null}

      <div className={mutedCardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={eyebrowClass}>
              <span className="hidden lg:inline">Month</span>
              <span className="lg:hidden">Week</span>
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold text-[color:var(--fs-color-ink-strong)]">
              <CalendarDays className="h-5 w-5 text-[color:var(--fs-color-brand-700)]" />
              <span className="hidden lg:inline">{model.month.label}</span>
              <span className="lg:hidden">{model.window.weekLabel}</span>
            </h2>
            <p className={cx("mt-2", mutedTextClass)}>
              <span className="hidden lg:inline">
                {formatPlanDateLabel(model.month.startDate)} to{" "}
                {formatPlanDateLabel(model.month.endDate)} ·{" "}
                {formatSessionCount(model.sessionCount)}
              </span>
              <span className="lg:hidden">
                {formatPlanDateLabel(model.window.startDate)} to{" "}
                {formatPlanDateLabel(model.window.endDate)} · {formatSessionCount(weekSessionCount)}
              </span>
              {selectedProgram ? ` · ${selectedProgram.title}` : ""}
            </p>
          </div>
          <Link href={primaryProgramHref} className={calendarActionClass}>
            {primaryProgramActionLabel}
          </Link>
        </div>

        <div className="mt-5">
          <div className="hidden lg:block">
            <MonthNavigation model={model} />
          </div>
          <div className="lg:hidden">
            <WeekNavigation model={model} />
          </div>
        </div>
      </div>

      {model.programs.length > 0 ? (
        <div className={mutedCardClass}>
          <p className={eyebrowClass}>Saved plans</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={buildMyLibraryCalendarPlanHref({ selectedDate: model.selectedDate })}
              aria-current={!model.selectedProgramId ? "true" : undefined}
              className={cx(
                filterClass,
                !model.selectedProgramId ? selectedFilterClass : idleFilterClass
              )}
            >
              All plans
            </Link>
            {model.programs.map((program) => (
              <ProgramFilter key={program.id} model={model} program={program} />
            ))}
          </div>
        </div>
      ) : null}

      {model.programs.length === 0 && model.schemaReady && !model.loadError ? (
        <Feedback tone="empty" testId="calendar-plan-empty-state">
          No saved plans are available yet.
        </Feedback>
      ) : (
        <>
          <div className="hidden space-y-4 lg:block">
            <MonthOverview model={model} />
            <SelectedDayDetail day={model.selectedDay} />
          </div>
          <div className="grid gap-3 lg:hidden">
            {model.days.map((day) => (
              <DayPlan key={day.date} day={day} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
