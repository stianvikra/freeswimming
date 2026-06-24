import type { SupabaseClient } from "@supabase/supabase-js";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import {
  COMPLETED_ACTIVITY_EVENT_SELECT,
  isCompletedActivityEventSchemaMissing,
  type CompletedActivityEventRow,
} from "@/lib/my-library/completed-activity-events";
import {
  buildTrainingActivityViewFromCompletedSwimEvent,
  buildTrainingActivityViewFromEventRow,
  isTrainingActivityEventSchemaMissing,
  isTrainingActivityHistoryTrusted,
  TRAINING_ACTIVITY_EVENT_SELECT,
  type TrainingActivityEventRow,
  type TrainingActivityHistoryView,
} from "@/lib/my-library/training-activity-events";
import {
  HABIT_CHECK_IN_SELECT,
  HABIT_DEFINITION_SELECT,
  HABIT_MOTIVATION_RESET_SELECT,
} from "@/lib/habits/server";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  buildHabitMotivationResetView,
  type HabitCheckInRow,
  type HabitCheckInView,
  type HabitDefinitionRow,
  type HabitDefinitionView,
  type HabitMotivationResetRow,
  type HabitMotivationResetView,
} from "@/lib/habits/shared";
import {
  buildMyLibraryCalendarComparisonWindow,
  getCalendarSourceFilterLabel,
  type MyLibraryCalendarComparisonWindow,
  type MyLibraryCalendarPeriodRange,
  type MyLibraryCalendarPeriodSelection,
  type MyLibraryCalendarSourceFilter,
  type MyLibraryCalendarSourceSelection,
} from "@/lib/my-library/calendar";
import type { Database, Json } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type CalendarSourceCardSource = Exclude<MyLibraryCalendarSourceFilter, "all"> | "unmapped";
type CalendarMetricTone = "positive" | "negative" | "neutral";
type CalendarSourceStatus = "mapped" | "no_data" | "unmapped" | "syncing" | "error";

export type MyLibraryCalendarComparisonMetric = {
  id: string;
  label: string;
  currentLabel: string;
  comparisonLabel: string;
  deltaLabel: string;
  tone: CalendarMetricTone;
};

export type MyLibraryCalendarSourceDetail = {
  id: string;
  label: string;
  value: string;
  supportLabel?: string;
};

export type MyLibraryCalendarSourceComparison = {
  source: CalendarSourceCardSource;
  label: string;
  status: CalendarSourceStatus;
  summary: string;
  supportLabel: string;
  details?: MyLibraryCalendarSourceDetail[];
  metrics: MyLibraryCalendarComparisonMetric[];
};

export type MyLibraryCalendarComparisonModel = {
  selectedSource: MyLibraryCalendarSourceSelection;
  selectedPeriod: MyLibraryCalendarPeriodSelection;
  window: MyLibraryCalendarComparisonWindow;
  sourceComparisons: MyLibraryCalendarSourceComparison[];
  problemLabel: string | null;
};

export type DrylandCalendarSessionEvent = {
  status: string | null;
  completedAt: string | null;
  actualDurationSeconds: number | null;
};

export type MicroSessionCalendarBlockEvent = {
  status: string | null;
  completedAt: string | null;
  skippedAt: string | null;
};

export type MicroSessionCalendarPlanEvent = {
  blocks: MicroSessionCalendarBlockEvent[];
};

const MAPPED_SOURCE_FILTERS: Exclude<MyLibraryCalendarSourceFilter, "all">[] = [
  "habits",
  "micro_sessions",
  "dryland",
  "swimming",
];

function dateToIsoStart(dateKey: string) {
  return `${dateKey}T00:00:00.000Z`;
}

function dateToIsoEnd(dateKey: string) {
  return `${dateKey}T23:59:59.999Z`;
}

function getDateKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function isDateInRange(dateKey: string | null, range: MyLibraryCalendarPeriodRange): boolean {
  return Boolean(dateKey && dateKey >= range.startDate && dateKey <= range.endDate);
}

function listDateKeys(range: MyLibraryCalendarPeriodRange): string[] {
  const dates: string[] = [];
  const parsedStart = Date.parse(`${range.startDate}T00:00:00.000Z`);
  const parsedEnd = Date.parse(`${range.endDate}T00:00:00.000Z`);
  if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd) || parsedEnd < parsedStart) {
    return dates;
  }

  const date = new Date(parsedStart);
  while (date.getTime() <= parsedEnd) {
    dates.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return dates;
}

const METRIC_NUMBER_FORMATTER = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
});

function roundMetricNumber(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMetricNumber(value: number): string {
  return METRIC_NUMBER_FORMATTER.format(roundMetricNumber(value));
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  const safeCount = roundMetricNumber(count);
  return `${formatMetricNumber(safeCount)} ${safeCount === 1 ? singular : plural}`;
}

function formatDistanceM(value: number): string {
  return `${formatMetricNumber(value)} m`;
}

function formatSignedDelta(
  current: number,
  comparison: number,
  unit: string,
  options: { higherIsBetter?: boolean; suffix?: string; pluralUnit?: string } = {}
): { label: string; tone: CalendarMetricTone } {
  const delta = roundMetricNumber(current - comparison);
  const higherIsBetter = options.higherIsBetter !== false;
  if (delta === 0) return { label: "No change", tone: "neutral" };
  const absDelta = Math.abs(delta);
  const suffix = options.suffix ?? ` ${absDelta === 1 ? unit : (options.pluralUnit ?? `${unit}s`)}`;
  const isPositive = higherIsBetter ? delta > 0 : delta < 0;
  return {
    label: `${delta > 0 ? "+" : "-"}${formatMetricNumber(absDelta)}${suffix}`,
    tone: isPositive ? "positive" : "negative",
  };
}

function formatPercentDelta(current: number, comparison: number) {
  const delta = roundMetricNumber(current - comparison);
  if (delta === 0) return { label: "No change", tone: "neutral" as const };
  return {
    label: `${formatMetricNumber(current)}% vs ${formatMetricNumber(comparison)}%`,
    tone: delta > 0 ? ("positive" as const) : ("negative" as const),
  };
}

function buildNumericMetric(input: {
  id: string;
  label: string;
  current: number;
  comparison: number;
  unit: string;
  pluralUnit?: string;
  higherIsBetter?: boolean;
}): MyLibraryCalendarComparisonMetric {
  const delta = formatSignedDelta(input.current, input.comparison, input.unit, {
    higherIsBetter: input.higherIsBetter,
    pluralUnit: input.pluralUnit,
  });
  return {
    id: input.id,
    label: input.label,
    currentLabel: pluralize(input.current, input.unit, input.pluralUnit),
    comparisonLabel: pluralize(input.comparison, input.unit, input.pluralUnit),
    deltaLabel: delta.label,
    tone: delta.tone,
  };
}

function buildDistanceMetric(input: {
  id: string;
  label: string;
  current: number;
  comparison: number;
}): MyLibraryCalendarComparisonMetric {
  const delta = formatSignedDelta(input.current, input.comparison, "m", {
    suffix: " m",
  });
  return {
    id: input.id,
    label: input.label,
    currentLabel: formatDistanceM(input.current),
    comparisonLabel: formatDistanceM(input.comparison),
    deltaLabel: delta.label,
    tone: delta.tone,
  };
}

function buildCompletedSwimsMetric(input: {
  current: number;
  comparison: number;
}): MyLibraryCalendarComparisonMetric {
  const metric = buildNumericMetric({
    id: "swim_activities",
    label: "Completed swims",
    current: input.current,
    comparison: input.comparison,
    unit: "completed swim",
    pluralUnit: "completed swims",
  });
  const delta = formatSignedDelta(input.current, input.comparison, "completed swim", {
    suffix: "",
  });
  return {
    ...metric,
    deltaLabel: delta.label,
    tone: delta.tone,
  };
}

function buildSwimmingMinutesMetric(input: {
  current: number;
  comparison: number;
}): MyLibraryCalendarComparisonMetric {
  const delta = formatSignedDelta(input.current, input.comparison, "min", {
    suffix: " min",
  });
  return {
    id: "swim_minutes",
    label: "Swimming minutes",
    currentLabel: `${formatMetricNumber(input.current)} min`,
    comparisonLabel: `${formatMetricNumber(input.comparison)} min`,
    deltaLabel: delta.label,
    tone: delta.tone,
  };
}

function formatHabitNameList(habits: HabitDefinitionView[], limit = 3) {
  const names = habits
    .map((habit) => habit.title.trim())
    .filter(Boolean)
    .slice(0, limit);
  const extraCount = Math.max(0, habits.length - names.length);
  if (names.length === 0) return "None";
  return `${names.join(", ")}${extraCount > 0 ? ` +${extraCount}` : ""}`;
}

function buildUnmappedSource(
  source: CalendarSourceCardSource,
  supportLabel: string
): MyLibraryCalendarSourceComparison {
  return {
    source,
    label: source === "unmapped" ? "Unmapped source" : getCalendarSourceFilterLabel(source),
    status: "unmapped",
    summary: "This source needs better history before it can be compared.",
    supportLabel,
    metrics: [],
  };
}

function buildProblemModel(input: {
  selectedSource: MyLibraryCalendarSourceSelection;
  selectedPeriod: MyLibraryCalendarPeriodSelection;
  window: MyLibraryCalendarComparisonWindow;
  problemLabel: string;
}): MyLibraryCalendarComparisonModel {
  return {
    selectedSource: input.selectedSource,
    selectedPeriod: input.selectedPeriod,
    window: input.window,
    problemLabel: input.problemLabel,
    sourceComparisons: [
      buildUnmappedSource(
        "unmapped",
        "Choose a supported source and period before the comparison can count private activity data."
      ),
    ],
  };
}

type HabitRangeStats = {
  dayCount: number;
  daysWithHabits: number;
  scheduledHabitSlots: number;
  satisfiedHabitSlots: number;
  perfectDays: number;
  averageCompletionPercent: number;
  timedMinutes: number;
  countTotal: number;
  restDays: number;
  slips: number;
  resetMarkers: number;
  checkInCount: number;
};

function buildHabitRangeStats(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  resetEvents: HabitMotivationResetView[],
  range: MyLibraryCalendarPeriodRange
): HabitRangeStats {
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const habitById = new Map(activeHabits.map((habit) => [habit.id, habit]));
  const dateKeys = listDateKeys(range);
  const daySummaries = dateKeys.map((dateKey) =>
    buildHabitDaySummary(
      activeHabits,
      checkIns.filter((checkIn) => checkIn.checkInDate <= dateKey),
      dateKey
    )
  );
  const daysWithHabits = daySummaries.filter((day) => day.perfectDayItemCount > 0);
  const rangeCheckIns = checkIns.filter((checkIn) => isDateInRange(checkIn.checkInDate, range));
  const resetMarkers = resetEvents.filter(
    (reset) =>
      reset.resetType === "reset_stats" &&
      reset.status === "active" &&
      isDateInRange(reset.effectiveDate, range)
  ).length;
  const slips = rangeCheckIns.filter((checkIn) => {
    const habit = habitById.get(checkIn.habitId);
    return habit?.habitMode === "quit" && checkIn.valueBoolean === false;
  }).length;

  return {
    dayCount: dateKeys.length,
    daysWithHabits: daysWithHabits.length,
    scheduledHabitSlots: daySummaries.reduce((total, day) => total + day.perfectDayItemCount, 0),
    satisfiedHabitSlots: daySummaries.reduce(
      (total, day) => total + day.satisfiedPerfectDayItemCount,
      0
    ),
    perfectDays: daySummaries.filter((day) => day.isPerfectDay).length,
    averageCompletionPercent:
      daysWithHabits.length > 0
        ? Math.round(
            daysWithHabits.reduce((total, day) => total + day.completionPercent, 0) /
              daysWithHabits.length
          )
        : 0,
    timedMinutes: daySummaries.reduce((total, day) => total + day.completedDurationMinutes, 0),
    countTotal: daySummaries.reduce((total, day) => total + day.completedCountTotal, 0),
    restDays: rangeCheckIns.filter((checkIn) => checkIn.status === "skipped").length,
    slips,
    resetMarkers,
    checkInCount: rangeCheckIns.length,
  };
}

export function buildHabitsCalendarComparisonSource({
  habits,
  checkIns,
  resetEvents = [],
  window,
}: {
  habits: HabitDefinitionView[];
  checkIns: HabitCheckInView[];
  resetEvents?: HabitMotivationResetView[];
  window: MyLibraryCalendarComparisonWindow;
}): MyLibraryCalendarSourceComparison {
  const current = buildHabitRangeStats(habits, checkIns, resetEvents, window.current);
  const comparison = buildHabitRangeStats(habits, checkIns, resetEvents, window.comparison);
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const includedHabits = activeHabits.filter((habit) => habit.isPerfectDayItem);
  const hasData =
    current.scheduledHabitSlots +
      comparison.scheduledHabitSlots +
      current.checkInCount +
      comparison.checkInCount +
      current.resetMarkers +
      comparison.resetMarkers >
    0;
  const completionDelta = formatPercentDelta(
    current.averageCompletionPercent,
    comparison.averageCompletionPercent
  );

  return {
    source: "habits",
    label: "Habits",
    status: hasData ? "mapped" : "no_data",
    summary: hasData
      ? `Habits were on target ${current.averageCompletionPercent}% across ${pluralize(
          current.daysWithHabits,
          "tracked day"
        )}.`
      : "No Habits data in either compared range.",
    supportLabel:
      "Habits counts existing check-ins only, including explicit Micro Session Habit credits. Rest days and slips are reported separately; Micro Sessions still report completed micro blocks in their own source.",
    details: [
      {
        id: "active_habits",
        label: "Active habits",
        value: pluralize(activeHabits.length, "habit"),
      },
      {
        id: "included_habits",
        label: "Included habits",
        value: formatHabitNameList(includedHabits),
        supportLabel: "Only active perfect-day habits are included in on-target comparison.",
      },
      {
        id: "tracked_days",
        label: "Tracked days",
        value: pluralize(current.daysWithHabits, "day"),
      },
      {
        id: "habit_reset_markers",
        label: "Habit resets",
        value: pluralize(current.resetMarkers, "marker"),
        supportLabel:
          "Reset stats markers restart motivation stats but are not counted as completed habits, rest days, or slips.",
      },
    ],
    metrics: [
      {
        id: "habit_completion_average",
        label: "Targets hit",
        currentLabel: `${current.averageCompletionPercent}%`,
        comparisonLabel: `${comparison.averageCompletionPercent}%`,
        deltaLabel: completionDelta.label,
        tone: completionDelta.tone,
      },
      {
        id: "habit_on_target_slots",
        label: "Habits on track",
        currentLabel: `${current.satisfiedHabitSlots}/${current.scheduledHabitSlots}`,
        comparisonLabel: `${comparison.satisfiedHabitSlots}/${comparison.scheduledHabitSlots}`,
        deltaLabel: formatSignedDelta(
          current.satisfiedHabitSlots,
          comparison.satisfiedHabitSlots,
          "habit"
        ).label,
        tone: formatSignedDelta(
          current.satisfiedHabitSlots,
          comparison.satisfiedHabitSlots,
          "habit"
        ).tone,
      },
      buildNumericMetric({
        id: "habit_perfect_days",
        label: "Perfect days",
        current: current.perfectDays,
        comparison: comparison.perfectDays,
        unit: "day",
      }),
      buildNumericMetric({
        id: "habit_timed_minutes",
        label: "Timed minutes",
        current: current.timedMinutes,
        comparison: comparison.timedMinutes,
        unit: "minute",
      }),
      {
        id: "habit_rest_slips",
        label: "Rest and slips",
        currentLabel: `${current.restDays} rest / ${current.slips} slips`,
        comparisonLabel: `${comparison.restDays} rest / ${comparison.slips} slips`,
        deltaLabel: "Reported only",
        tone: "neutral",
      },
      {
        id: "habit_reset_markers_metric",
        label: "Habit resets",
        currentLabel: pluralize(current.resetMarkers, "marker"),
        comparisonLabel: pluralize(comparison.resetMarkers, "marker"),
        deltaLabel: "Markers only",
        tone: "neutral",
      },
    ],
  };
}

function buildDrylandRangeStats(
  events: DrylandCalendarSessionEvent[],
  range: MyLibraryCalendarPeriodRange
) {
  const completed = events.filter(
    (event) =>
      event.status === "completed" && isDateInRange(getDateKeyFromIso(event.completedAt), range)
  );
  return {
    completedSessions: completed.length,
    minutes: completed.reduce(
      (total, event) => total + Math.round((event.actualDurationSeconds ?? 0) / 60),
      0
    ),
  };
}

export function buildDrylandCalendarComparisonSource({
  events,
  window,
}: {
  events: DrylandCalendarSessionEvent[];
  window: MyLibraryCalendarComparisonWindow;
}): MyLibraryCalendarSourceComparison {
  const current = buildDrylandRangeStats(events, window.current);
  const comparison = buildDrylandRangeStats(events, window.comparison);
  const hasData = current.completedSessions + comparison.completedSessions > 0;

  return {
    source: "dryland",
    label: "Dryland",
    status: hasData ? "mapped" : "no_data",
    summary: hasData
      ? `${pluralize(current.completedSessions, "completed session")} logged in the selected range.`
      : "No completed dryland sessions in either compared range.",
    supportLabel:
      "Dryland currently compares completed saved sessions and training minutes. Strength sets/reps/load and stretching hold time need a separate mapping before they are counted.",
    metrics: [
      buildNumericMetric({
        id: "dryland_completed_sessions",
        label: "Completed sessions",
        current: current.completedSessions,
        comparison: comparison.completedSessions,
        unit: "session",
      }),
      buildNumericMetric({
        id: "dryland_minutes",
        label: "Training minutes",
        current: current.minutes,
        comparison: comparison.minutes,
        unit: "minute",
      }),
    ],
  };
}

function buildMicroRangeStats(
  plans: MicroSessionCalendarPlanEvent[],
  range: MyLibraryCalendarPeriodRange
) {
  const blocks = plans.flatMap((plan) => plan.blocks);
  const completedUnits = blocks.filter(
    (block) =>
      block.status === "completed" && isDateInRange(getDateKeyFromIso(block.completedAt), range)
  ).length;
  const skippedUnits = blocks.filter(
    (block) =>
      block.status === "skipped" && isDateInRange(getDateKeyFromIso(block.skippedAt), range)
  ).length;
  return { completedUnits, skippedUnits };
}

export function buildMicroSessionsCalendarComparisonSource({
  plans,
  window,
}: {
  plans: MicroSessionCalendarPlanEvent[];
  window: MyLibraryCalendarComparisonWindow;
}): MyLibraryCalendarSourceComparison {
  const current = buildMicroRangeStats(plans, window.current);
  const comparison = buildMicroRangeStats(plans, window.comparison);
  const hasData =
    current.completedUnits +
      current.skippedUnits +
      comparison.completedUnits +
      comparison.skippedUnits >
    0;

  return {
    source: "micro_sessions",
    label: "Micro Sessions",
    status: hasData ? "mapped" : "no_data",
    summary: hasData
      ? `${pluralize(current.completedUnits, "completed micro block")} in the selected range.`
      : "No completed or skipped Micro Session micro blocks in either compared range.",
    supportLabel:
      "Micro Sessions counts completed and skipped micro blocks from saved micro-plan history. Queued future blocks are not counted.",
    metrics: [
      buildNumericMetric({
        id: "micro_completed_units",
        label: "Completed micro blocks",
        current: current.completedUnits,
        comparison: comparison.completedUnits,
        unit: "micro block",
      }),
      buildNumericMetric({
        id: "micro_skipped_units",
        label: "Skipped micro blocks",
        current: current.skippedUnits,
        comparison: comparison.skippedUnits,
        unit: "micro block",
        higherIsBetter: false,
      }),
    ],
  };
}

const SWIMMING_COUNTABLE_OUTCOMES = new Set<TrainingActivityHistoryView["outcome"]>([
  "completed_as_planned",
  "completed_different",
  "completed_on_another_day",
  "partial",
]);

function isTrendEligibleSwimActivity(view: TrainingActivityHistoryView): boolean {
  return (
    isTrainingActivityHistoryTrusted(view) &&
    view.sourceKind === "manual" &&
    view.canonicalSport === "swimming"
  );
}

function isCountableSwimActivity(view: TrainingActivityHistoryView): boolean {
  return isTrendEligibleSwimActivity(view) && SWIMMING_COUNTABLE_OUTCOMES.has(view.outcome);
}

function normalizeMetricValue(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function buildSwimmingRangeStats(
  activities: TrainingActivityHistoryView[],
  range: MyLibraryCalendarPeriodRange
) {
  const rowsInRange = activities.filter((activity) =>
    isDateInRange(activity.activityLocalDate, range)
  );
  const trustedSwimRows = rowsInRange.filter(isTrendEligibleSwimActivity);
  const countableRows = trustedSwimRows.filter(isCountableSwimActivity);
  const completedAsPlanned = trustedSwimRows.filter(
    (activity) => activity.outcome === "completed_as_planned"
  ).length;
  const changed = trustedSwimRows.filter(
    (activity) =>
      activity.outcome === "completed_different" || activity.outcome === "completed_on_another_day"
  ).length;
  const partial = trustedSwimRows.filter((activity) => activity.outcome === "partial").length;
  const cancelled = trustedSwimRows.filter(
    (activity) => activity.outcome === "cancelled_as_actual"
  ).length;

  const outcomeParts = [
    completedAsPlanned > 0 ? `${completedAsPlanned} completed as planned` : null,
    changed > 0 ? `${changed} changed completion` : null,
    partial > 0 ? `${partial} partial` : null,
    cancelled > 0 ? `${cancelled} cancelled` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    trustedRows: trustedSwimRows.length,
    swimActivities: countableRows.length,
    distanceM: countableRows.reduce(
      (total, activity) => total + normalizeMetricValue(activity.distanceM),
      0
    ),
    minutes: countableRows.reduce(
      (total, activity) => total + Math.round(normalizeMetricValue(activity.durationSeconds) / 60),
      0
    ),
    outcomeMix: outcomeParts.length > 0 ? outcomeParts.join(" / ") : "No completed swim completion",
    excludedRows: rowsInRange.length - trustedSwimRows.length,
    excludedProviderReviewRows: rowsInRange.filter(
      (activity) =>
        !trustedSwimRows.includes(activity) &&
        (activity.sourceKind === "provider_evidence" || activity.mappingStatus === "needs_review")
    ).length,
  };
}

function formatExcludedSwimRows(input: {
  excludedRows: number;
  providerReviewRows: number;
}): string {
  if (input.excludedRows === 0) return "0 items";
  if (input.excludedRows === input.providerReviewRows) {
    return pluralize(input.providerReviewRows, "provider/review item");
  }
  if (input.providerReviewRows > 0) {
    const otherRows = input.excludedRows - input.providerReviewRows;
    return `${pluralize(input.providerReviewRows, "provider/review item")} + ${pluralize(
      otherRows,
      "other item"
    )}`;
  }
  return pluralize(input.excludedRows, "item");
}

export function buildSwimmingCalendarComparisonSource({
  activities,
  window,
}: {
  activities: TrainingActivityHistoryView[];
  window: MyLibraryCalendarComparisonWindow;
}): MyLibraryCalendarSourceComparison {
  const current = buildSwimmingRangeStats(activities, window.current);
  const comparison = buildSwimmingRangeStats(activities, window.comparison);
  const hasTrustedData = current.trustedRows + comparison.trustedRows > 0;

  return {
    source: "swimming",
    label: "Swimming",
    status: hasTrustedData ? "mapped" : "no_data",
    summary: hasTrustedData
      ? `${pluralize(current.swimActivities, "completed swim")} in the selected range.`
      : "No trusted manual swim actuals in either compared range.",
    supportLabel:
      "Swimming counts manual swim actuals that are safe to include. Provider, non-swim, and needs-review entries stay out until explicitly mapped.",
    details: [
      {
        id: "trusted_swim_rows",
        label: "Counted swims",
        value: pluralize(current.swimActivities, "completed swim"),
        supportLabel: "Manual Swimming entries included in this comparison.",
      },
      {
        id: "swim_outcome_mix",
        label: "Session completion",
        value: current.outcomeMix,
        supportLabel: "Partial swims count completed work; cancelled sessions add no totals.",
      },
      {
        id: "excluded_swim_rows",
        label: "Excluded sessions",
        value: formatExcludedSwimRows({
          excludedRows: current.excludedRows,
          providerReviewRows: current.excludedProviderReviewRows,
        }),
        supportLabel: "Provider/review or unsupported sessions stay out until mapped.",
      },
    ],
    metrics: hasTrustedData
      ? [
          buildCompletedSwimsMetric({
            current: current.swimActivities,
            comparison: comparison.swimActivities,
          }),
          buildDistanceMetric({
            id: "swim_distance_m",
            label: "Distance",
            current: current.distanceM,
            comparison: comparison.distanceM,
          }),
          buildSwimmingMinutesMetric({
            current: current.minutes,
            comparison: comparison.minutes,
          }),
        ]
      : [],
  };
}

function combineTrainingActivityViews(input: {
  trainingRows: TrainingActivityEventRow[];
  completedRows: CompletedActivityEventRow[];
}): TrainingActivityHistoryView[] {
  const trainingViews = input.trainingRows.map(buildTrainingActivityViewFromEventRow);
  const completedEventIdsWithCanonicalRows = new Set(
    trainingViews
      .map((view) => view.completedActivityEventId)
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  );
  const completedViews = input.completedRows
    .filter((row) => !completedEventIdsWithCanonicalRows.has(row.id))
    .map(buildTrainingActivityViewFromCompletedSwimEvent);

  return [...trainingViews, ...completedViews];
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseMicroPlanBlocks(blocks: Json): MicroSessionCalendarBlockEvent[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter(isJsonObject).map((block) => ({
    status: typeof block.status === "string" ? block.status : null,
    completedAt: typeof block.completedAt === "string" ? block.completedAt : null,
    skippedAt: typeof block.skippedAt === "string" ? block.skippedAt : null,
  }));
}

function getIncludedSources(
  selectedSource: MyLibraryCalendarSourceSelection
): CalendarSourceCardSource[] {
  if (selectedSource === "unmapped") return ["unmapped"];
  if (selectedSource === "all") return [...MAPPED_SOURCE_FILTERS];
  return [selectedSource];
}

function shouldLoadSource(
  selectedSource: MyLibraryCalendarSourceSelection,
  source: Exclude<MyLibraryCalendarSourceFilter, "all">
) {
  return selectedSource === "all" || selectedSource === source;
}

function buildSourceComparisons(input: {
  selectedSource: MyLibraryCalendarSourceSelection;
  window: MyLibraryCalendarComparisonWindow;
  habits: MyLibraryCalendarSourceComparison | null;
  dryland: MyLibraryCalendarSourceComparison | null;
  microSessions: MyLibraryCalendarSourceComparison | null;
  swimming: MyLibraryCalendarSourceComparison | null;
}) {
  const mapped: Record<CalendarSourceCardSource, MyLibraryCalendarSourceComparison> = {
    habits:
      input.habits ??
      buildUnmappedSource("habits", "Habits data was not requested for this comparison."),
    dryland:
      input.dryland ??
      buildUnmappedSource("dryland", "Dryland data was not requested for this comparison."),
    micro_sessions:
      input.microSessions ??
      buildUnmappedSource(
        "micro_sessions",
        "Micro Sessions data was not requested for this comparison."
      ),
    swimming:
      input.swimming ??
      buildUnmappedSource(
        "swimming",
        "Swimming will be included after trusted swim activity history is mapped into Trends."
      ),
    unmapped: buildUnmappedSource(
      "unmapped",
      "The requested source is not mapped to the My Library calendar contract."
    ),
  };

  return getIncludedSources(input.selectedSource).map((source) => mapped[source]);
}

export async function loadMyLibraryCalendarComparison(
  supabase: TypedSupabaseClient,
  userId: string,
  options: {
    selectedDate: string;
    todayDate: string;
    selectedSource: MyLibraryCalendarSourceSelection;
    selectedPeriod: MyLibraryCalendarPeriodSelection;
    compareToDate?: string | null;
  }
): Promise<MyLibraryCalendarComparisonModel> {
  const effectivePeriod = options.selectedPeriod === "unmapped" ? "week" : options.selectedPeriod;
  const window = buildMyLibraryCalendarComparisonWindow({
    selectedDate: options.selectedDate,
    todayDate: options.todayDate,
    period: effectivePeriod,
    compareToDate: options.compareToDate,
  });

  if (options.selectedSource === "unmapped") {
    return buildProblemModel({
      selectedSource: options.selectedSource,
      selectedPeriod: options.selectedPeriod,
      window,
      problemLabel: "The requested calendar source is not mapped.",
    });
  }

  if (options.selectedPeriod === "unmapped") {
    return buildProblemModel({
      selectedSource: options.selectedSource,
      selectedPeriod: options.selectedPeriod,
      window,
      problemLabel: "The requested calendar period is not supported.",
    });
  }

  const rangeStart =
    window.current.startDate < window.comparison.startDate
      ? window.current.startDate
      : window.comparison.startDate;
  const rangeEnd =
    window.current.endDate > window.comparison.endDate
      ? window.current.endDate
      : window.comparison.endDate;

  const loadHabits = shouldLoadSource(options.selectedSource, "habits");
  const loadDryland = shouldLoadSource(options.selectedSource, "dryland");
  const loadMicroSessions = shouldLoadSource(options.selectedSource, "micro_sessions");
  const loadSwimming = shouldLoadSource(options.selectedSource, "swimming");

  const [
    habitResult,
    checkInResult,
    resetResult,
    drylandResult,
    microPlanResult,
    trainingActivityResult,
    completedActivityResult,
  ] = await Promise.all([
    loadHabits
      ? supabase
          .from("habit_definitions")
          .select(HABIT_DEFINITION_SELECT)
          .eq("user_id", userId)
          .order("sort_order", { ascending: true })
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: null, error: null }),
    loadHabits
      ? supabase
          .from("habit_check_ins")
          .select(HABIT_CHECK_IN_SELECT)
          .eq("user_id", userId)
          .gte("check_in_date", rangeStart)
          .lte("check_in_date", rangeEnd)
      : Promise.resolve({ data: null, error: null }),
    loadHabits
      ? supabase
          .from("habit_motivation_resets")
          .select(HABIT_MOTIVATION_RESET_SELECT)
          .eq("user_id", userId)
          .gte("effective_date", rangeStart)
          .lte("effective_date", rangeEnd)
      : Promise.resolve({ data: null, error: null }),
    loadDryland
      ? supabase
          .from("dryland_sessions")
          .select("status, completed_at, actual_duration_seconds")
          .eq("user_id", userId)
          .gte("completed_at", dateToIsoStart(rangeStart))
          .lte("completed_at", dateToIsoEnd(rangeEnd))
      : Promise.resolve({ data: null, error: null }),
    loadMicroSessions
      ? supabase
          .from("dryland_micro_plans")
          .select("blocks, week_starts_at, week_ends_at")
          .eq("user_id", userId)
          .lte("week_starts_at", rangeEnd)
          .gte("week_ends_at", rangeStart)
      : Promise.resolve({ data: null, error: null }),
    loadSwimming
      ? supabase
          .from("training_activity_events")
          .select(TRAINING_ACTIVITY_EVENT_SELECT)
          .eq("user_id", userId)
          .gte("activity_local_date", rangeStart)
          .lte("activity_local_date", rangeEnd)
      : Promise.resolve({ data: null, error: null }),
    loadSwimming
      ? supabase
          .from("completed_activity_events")
          .select(COMPLETED_ACTIVITY_EVENT_SELECT)
          .eq("user_id", userId)
          .gte("completed_on", rangeStart)
          .lte("completed_on", rangeEnd)
      : Promise.resolve({ data: null, error: null }),
  ]);

  let habits: MyLibraryCalendarSourceComparison | null = null;
  if (loadHabits) {
    if (isHabitsSchemaMissing(habitResult.error) || isHabitsSchemaMissing(checkInResult.error)) {
      habits = {
        source: "habits",
        label: "Habits",
        status: "syncing",
        summary: "Habits are still syncing in this environment.",
        supportLabel: "No Habits rows were counted because the schema is not ready.",
        metrics: [],
      };
    } else if (habitResult.error || checkInResult.error) {
      console.error("[MyLibraryCalendar] Could not load Habits comparison", {
        habitError: habitResult.error,
        checkInError: checkInResult.error,
      });
      habits = {
        source: "habits",
        label: "Habits",
        status: "error",
        summary: "Could not load Habits comparison right now.",
        supportLabel: "Retry later; no Habits rows were counted in this response.",
        metrics: [],
      };
    } else {
      const resetEventsReady = !isHabitsSchemaMissing(resetResult.error);
      if (resetResult.error && resetEventsReady) {
        console.error("[MyLibraryCalendar] Could not load Habits reset markers", resetResult.error);
      }

      habits = buildHabitsCalendarComparisonSource({
        habits: ((habitResult.data ?? []) as HabitDefinitionRow[]).map(buildHabitDefinitionView),
        checkIns: ((checkInResult.data ?? []) as HabitCheckInRow[]).map(buildHabitCheckInView),
        resetEvents:
          resetEventsReady && !resetResult.error
            ? ((resetResult.data ?? []) as HabitMotivationResetRow[]).map(
                buildHabitMotivationResetView
              )
            : [],
        window,
      });
    }
  }

  let dryland: MyLibraryCalendarSourceComparison | null = null;
  if (loadDryland) {
    if (isDrylandSchemaMissing(drylandResult.error)) {
      dryland = {
        source: "dryland",
        label: "Dryland",
        status: "syncing",
        summary: "Dryland sessions are still syncing in this environment.",
        supportLabel: "No dryland rows were counted because the schema is not ready.",
        metrics: [],
      };
    } else if (drylandResult.error) {
      console.error("[MyLibraryCalendar] Could not load Dryland comparison", drylandResult.error);
      dryland = {
        source: "dryland",
        label: "Dryland",
        status: "error",
        summary: "Could not load Dryland comparison right now.",
        supportLabel: "Retry later; no dryland rows were counted in this response.",
        metrics: [],
      };
    } else {
      dryland = buildDrylandCalendarComparisonSource({
        events: (drylandResult.data ?? []).map((row) => ({
          status: typeof row.status === "string" ? row.status : null,
          completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
          actualDurationSeconds:
            typeof row.actual_duration_seconds === "number" ? row.actual_duration_seconds : null,
        })),
        window,
      });
    }
  }

  let microSessions: MyLibraryCalendarSourceComparison | null = null;
  if (loadMicroSessions) {
    if (isDrylandSchemaMissing(microPlanResult.error)) {
      microSessions = {
        source: "micro_sessions",
        label: "Micro Sessions",
        status: "syncing",
        summary: "Micro Sessions are still syncing in this environment.",
        supportLabel: "No micro-plan rows were counted because the schema is not ready.",
        metrics: [],
      };
    } else if (microPlanResult.error) {
      console.error(
        "[MyLibraryCalendar] Could not load Micro Sessions comparison",
        microPlanResult.error
      );
      microSessions = {
        source: "micro_sessions",
        label: "Micro Sessions",
        status: "error",
        summary: "Could not load Micro Sessions comparison right now.",
        supportLabel: "Retry later; no micro-plan rows were counted in this response.",
        metrics: [],
      };
    } else {
      microSessions = buildMicroSessionsCalendarComparisonSource({
        plans: (microPlanResult.data ?? []).map((row) => ({
          blocks: parseMicroPlanBlocks(row.blocks),
        })),
        window,
      });
    }
  }

  let swimming: MyLibraryCalendarSourceComparison | null = null;
  if (loadSwimming) {
    if (
      isTrainingActivityEventSchemaMissing(trainingActivityResult.error) ||
      isCompletedActivityEventSchemaMissing(completedActivityResult.error)
    ) {
      swimming = {
        source: "swimming",
        label: "Swimming",
        status: "syncing",
        summary: "Swimming activity history is still syncing in this environment.",
        supportLabel:
          "No swim activity rows were counted because the activity schema is not ready.",
        metrics: [],
      };
    } else if (trainingActivityResult.error || completedActivityResult.error) {
      console.error("[MyLibraryCalendar] Could not load Swimming comparison", {
        trainingActivityError: trainingActivityResult.error,
        completedActivityError: completedActivityResult.error,
      });
      swimming = {
        source: "swimming",
        label: "Swimming",
        status: "error",
        summary: "Could not load Swimming comparison right now.",
        supportLabel: "Retry later; no swim activity rows were counted in this response.",
        metrics: [],
      };
    } else {
      swimming = buildSwimmingCalendarComparisonSource({
        activities: combineTrainingActivityViews({
          trainingRows: (trainingActivityResult.data ?? []) as TrainingActivityEventRow[],
          completedRows: (completedActivityResult.data ?? []) as CompletedActivityEventRow[],
        }),
        window,
      });
    }
  }

  return {
    selectedSource: options.selectedSource,
    selectedPeriod: options.selectedPeriod,
    window,
    problemLabel: null,
    sourceComparisons: buildSourceComparisons({
      selectedSource: options.selectedSource,
      window,
      habits,
      dryland,
      microSessions,
      swimming,
    }),
  };
}
