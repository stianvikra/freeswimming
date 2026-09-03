import {
  HABIT_CADENCE_DAY_POLICY_VALUES,
  HABIT_CADENCE_PERIOD_VALUES,
  buildHabitDayStatusView,
  buildHabitDaySummary,
  classifyHabitDefinition,
  getHabitDayStatusLabel,
  getHabitItemTrackingStateLabel,
  type HabitCheckInView,
  type HabitDayItem,
  type HabitDefinitionRow,
  type HabitDefinitionView,
  type HabitMotivationResetView,
  type HabitDayStatusView,
  type SupportedHabitDefinitionRow,
} from "@/lib/habits/shared";
import {
  DRYLAND_MICRO_BLOCK_STATUSES,
  type DrylandMicroBlockStatus,
} from "@/lib/dryland/micro-plans";
import type { Json } from "@/types/database";

export type MyLibraryCalendarDailyLayerSource = "habits" | "micro_sessions";

export type MyLibraryCalendarDailyLayerStatus =
  | "mapped"
  | "no_data"
  | "future"
  | "schema_missing"
  | "error"
  | "review";

export type MyLibraryCalendarDailyLayerTone =
  | "neutral"
  | "positive"
  | "warning"
  | "error"
  | "muted";

export type MyLibraryCalendarDailyLayerMetric = {
  id: string;
  label: string;
  value: string;
  tone?: MyLibraryCalendarDailyLayerTone;
};

export type MyLibraryCalendarDailyLayerStats = {
  dailyHabitCompletedCount?: number;
  dailyHabitTotalCount?: number;
  habitPotentialDayCount?: number;
  habitIncludedDayCount?: number;
  habitNotTrackedDayCount?: number;
  weeklyHabitCompletedOnDateCount?: number;
  weeklyHabitCompletedCount?: number;
  weeklyHabitTotalCount?: number;
  monthlyHabitCompletedOnDateCount?: number;
  microCompletedUnitCount?: number;
  microSkippedUnitCount?: number;
  microExerciseKeys?: string[];
  microRepsTotal?: number;
  microLoadKgTotal?: number;
};

export type MyLibraryCalendarDailyLayer = {
  source: MyLibraryCalendarDailyLayerSource;
  label: string;
  status: MyLibraryCalendarDailyLayerStatus;
  tone: MyLibraryCalendarDailyLayerTone;
  compactLabel: string;
  summary: string;
  supportLabel: string;
  href: string;
  metrics: MyLibraryCalendarDailyLayerMetric[];
  stats?: MyLibraryCalendarDailyLayerStats;
};

export type MyLibraryCalendarDailyLayersByDate = Record<string, MyLibraryCalendarDailyLayer[]>;

export type MyLibraryCalendarMicroPlanLayerEvent = {
  id: string;
  blocks: Json;
};

type UnsupportedHabitScope = {
  count: number;
  labels: string[];
};

export type CalendarHabitDayStatusEntry = HabitDayStatusView;

export type CalendarHabitDayStatusState =
  | {
      status: "ready";
      entries: CalendarHabitDayStatusEntry[];
    }
  | {
      status: "schema_missing" | "error";
    };

export type CalendarHabitDayStatusRow = {
  review_date: string;
  day_status: string | null;
  status: string;
};

export function buildCalendarHabitDayStatusState(
  rows: CalendarHabitDayStatusRow[]
): CalendarHabitDayStatusState {
  try {
    const entries = rows.flatMap((row) => {
      const entry = buildHabitDayStatusView({
        reviewDate: row.review_date,
        dayStatus: row.day_status,
        acknowledgementStatus: row.status,
      });
      return entry ? [entry] : [];
    });

    return { status: "ready", entries };
  } catch {
    return { status: "error" };
  }
}

type CalendarHabitLayerState =
  | {
      status: "ready";
      habits: HabitDefinitionView[];
      checkIns: HabitCheckInView[];
      resetEvents: HabitMotivationResetView[];
      unsupported: UnsupportedHabitScope;
      dayStatuses?: CalendarHabitDayStatusState;
    }
  | {
      status: "schema_missing" | "error";
    };

type CalendarMicroLayerState =
  | {
      status: "ready";
      plans: MyLibraryCalendarMicroPlanLayerEvent[];
    }
  | {
      status: "schema_missing" | "error";
    };

const SOURCE_HREFS: Record<MyLibraryCalendarDailyLayerSource, string> = {
  habits: "/my-library/habits",
  micro_sessions: "/my-library/dryland",
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getDateKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isMappedMicroBlockStatus(value: unknown): value is DrylandMicroBlockStatus {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_BLOCK_STATUSES.includes(value as DrylandMicroBlockStatus)
  );
}

function hasUnsupportedCalendarCadence(row: HabitDefinitionRow): boolean {
  const hasUnknownCadencePeriod =
    row.cadence_period !== null &&
    !HABIT_CADENCE_PERIOD_VALUES.includes(row.cadence_period as never);
  const hasUnknownCadenceDayPolicy =
    row.cadence_day_policy !== null &&
    !HABIT_CADENCE_DAY_POLICY_VALUES.includes(row.cadence_day_policy as never);

  return hasUnknownCadencePeriod || hasUnknownCadenceDayPolicy;
}

export function partitionCalendarHabitRows(rows: HabitDefinitionRow[]): {
  supportedRows: SupportedHabitDefinitionRow[];
  unsupported: UnsupportedHabitScope;
} {
  const supportedRows: SupportedHabitDefinitionRow[] = [];
  const unsupportedLabels: string[] = [];

  for (const row of rows) {
    const definition = classifyHabitDefinition(row);
    if (definition.kind === "unsupported") {
      unsupportedLabels.push(definition.descriptor.title || definition.descriptor.id);
      continue;
    }

    // H-081 remains separate: keep Calendar's existing cadence gate after the
    // shared H-080 type/mode/status boundary.
    if (hasUnsupportedCalendarCadence(definition.row)) {
      unsupportedLabels.push(definition.row.title || definition.row.id);
      continue;
    }

    supportedRows.push(definition.row);
  }

  return {
    supportedRows,
    unsupported: {
      count: unsupportedLabels.length,
      labels: unsupportedLabels.slice(0, 3),
    },
  };
}

function buildUnavailableLayer(input: {
  source: MyLibraryCalendarDailyLayerSource;
  status: Extract<MyLibraryCalendarDailyLayerStatus, "schema_missing" | "error" | "future">;
  date: string;
  compactLabel: string;
  summary: string;
  supportLabel: string;
}): MyLibraryCalendarDailyLayer {
  return {
    source: input.source,
    label: input.source === "micro_sessions" ? "Micro Sessions" : "Habits",
    status: input.status,
    tone: input.status === "future" ? "muted" : input.status === "error" ? "error" : "warning",
    compactLabel: input.compactLabel,
    summary: input.summary,
    supportLabel: input.supportLabel,
    href:
      input.source === "micro_sessions"
        ? SOURCE_HREFS.micro_sessions
        : `${SOURCE_HREFS.habits}?date=${input.date}`,
    metrics: [],
  };
}

function getHabitVisibleItems(items: HabitDayItem[]): HabitDayItem[] {
  return items.filter(
    (item) =>
      item.isScheduledForDate ||
      item.checkIn !== null ||
      item.priorityGroup === "due_weekly" ||
      item.priorityGroup === "due_monthly"
  );
}

function getDailyHabitItems(items: HabitDayItem[]) {
  return items.filter(
    (item) =>
      item.habit.cadencePeriod === "daily" &&
      item.habit.isPerfectDayItem &&
      item.isScheduledForDate &&
      item.checkIn?.status !== "skipped"
  );
}

function getWeeklyHabitItems(items: HabitDayItem[]) {
  return items.filter(
    (item) =>
      item.habit.cadencePeriod === "weekly" &&
      item.habit.isPerfectDayItem &&
      item.habit.startDate <= item.cadenceProgress.periodEnd
  );
}

function getWeeklyHabitCompletedOnDateCount(items: HabitDayItem[]) {
  return items.filter((item) => item.checkIn !== null && item.evaluation.isSatisfied).length;
}

function getMonthlyHabitItems(items: HabitDayItem[]) {
  return items.filter(
    (item) =>
      item.habit.cadencePeriod === "monthly" &&
      item.habit.isPerfectDayItem &&
      item.habit.startDate <= item.cadenceProgress.periodEnd
  );
}

function getHabitLayerCompactLabel(input: {
  dailyCompletedCount: number;
  dailyTotalCount: number;
  weeklyCompletedOnDateCount: number;
  monthlyCompletedOnDateCount: number;
  hasReview: boolean;
  hasIncompleteTracking: boolean;
}) {
  if (input.dailyTotalCount > 0) {
    const progress = `${input.dailyCompletedCount}/${input.dailyTotalCount} habits`;
    if (input.hasReview) return `${progress} · review`;
    return input.hasIncompleteTracking ? `${progress} · coverage gap` : progress;
  }

  if (input.weeklyCompletedOnDateCount > 0) {
    const progress = pluralize(input.weeklyCompletedOnDateCount, "weekly habit");
    return input.hasReview ? `${progress} · review` : progress;
  }

  if (input.monthlyCompletedOnDateCount > 0) {
    const progress = pluralize(input.monthlyCompletedOnDateCount, "monthly habit");
    return input.hasReview ? `${progress} · review` : progress;
  }

  if (input.hasReview) return "Habits review needed";
  if (input.hasIncompleteTracking) return getHabitItemTrackingStateLabel("incomplete");
  return "No habits";
}

function getHabitLayerSummary(input: {
  dailyCompletedCount: number;
  dailyTotalCount: number;
  weeklyCompletedOnDateCount: number;
  monthlyCompletedOnDateCount: number;
  hasReview: boolean;
  hasVisibleItems: boolean;
  hasIncompleteTracking: boolean;
}) {
  const lines: string[] = [];
  if (input.dailyTotalCount > 0) {
    lines.push(
      `${input.dailyCompletedCount}/${input.dailyTotalCount} daily habits on track for this day.`
    );
  }
  if (input.weeklyCompletedOnDateCount > 0) {
    lines.push(`${pluralize(input.weeklyCompletedOnDateCount, "weekly habit")} completed today.`);
  }
  if (input.monthlyCompletedOnDateCount > 0) {
    lines.push(`${pluralize(input.monthlyCompletedOnDateCount, "monthly habit")} completed today.`);
  }
  if (input.hasReview) {
    lines.push("Some Habits need review before Calendar can count them.");
  }
  if (input.hasIncompleteTracking) {
    lines.push("A cadence period has incomplete tracking and is excluded from performance.");
  }
  if (lines.length > 0) return lines.join(" ");
  if (input.hasVisibleItems)
    return "Weekly and monthly Habits are counted in the week or period totals.";
  return "No due, done, rest, or slip Habit signals on this date.";
}

function buildHabitsLayer(input: {
  date: string;
  todayDate: string;
  state: CalendarHabitLayerState;
}): MyLibraryCalendarDailyLayer {
  const state = input.state;

  if (input.date > input.todayDate) {
    return buildUnavailableLayer({
      source: "habits",
      status: "future",
      date: input.date,
      compactLabel: "Habits future",
      summary: "Future Habits dates are not counted.",
      supportLabel: "Open Habits to plan ahead; Calendar only counts Habits through today.",
    });
  }

  if (state.status === "schema_missing") {
    return buildUnavailableLayer({
      source: "habits",
      status: "schema_missing",
      date: input.date,
      compactLabel: "Habits syncing",
      summary: "Habits are still syncing in this environment.",
      supportLabel: "No Habits rows were counted because the schema is not ready.",
    });
  }

  if (state.status === "error") {
    return buildUnavailableLayer({
      source: "habits",
      status: "error",
      date: input.date,
      compactLabel: "Habits error",
      summary: "Could not load Habits for this date.",
      supportLabel: "Retry later; no Habits rows were counted in Calendar.",
    });
  }

  if (state.status !== "ready") {
    return buildUnavailableLayer({
      source: "habits",
      status: "error",
      date: input.date,
      compactLabel: "Habits error",
      summary: "Could not load Habits for this date.",
      supportLabel: "Retry later; no Habits rows were counted in Calendar.",
    });
  }

  const supportedHabitIds = new Set(state.habits.map((habit) => habit.id));
  const dayStatusState = state.dayStatuses ?? { status: "ready", entries: [] };
  const dayCheckIns = state.checkIns.filter(
    (checkIn) => supportedHabitIds.has(checkIn.habitId) && checkIn.checkInDate <= input.date
  );
  if (dayStatusState.status === "schema_missing") {
    return buildUnavailableLayer({
      source: "habits",
      status: "schema_missing",
      date: input.date,
      compactLabel: "Habits syncing",
      summary: "Habit day status is still syncing for this date.",
      supportLabel: "No Habit result was counted because day-status coverage is not ready.",
    });
  }

  if (dayStatusState.status === "error") {
    return buildUnavailableLayer({
      source: "habits",
      status: "error",
      date: input.date,
      compactLabel: "Habits error",
      summary: "Could not load Habit day status for this date.",
      supportLabel: "Retry later; Calendar did not assume that this date was tracked.",
    });
  }

  const daySummary = buildHabitDaySummary(state.habits, dayCheckIns, input.date, {
    dayStatuses: dayStatusState.status === "ready" ? dayStatusState.entries : [],
  });

  if (
    daySummary.trackingState === "needs_review" ||
    daySummary.metricCoverage.state === "needs_review"
  ) {
    return {
      source: "habits",
      label: "Habits",
      status: "review",
      tone: "warning",
      compactLabel: "Habits review needed",
      summary: "This Habit day status needs review before Calendar can count the date.",
      supportLabel: "The unknown status was not treated as Done, Missed, Rest, Slip, or success.",
      href: `${SOURCE_HREFS.habits}?date=${input.date}`,
      metrics: [
        {
          id: "habit_day_status_review",
          label: "Status",
          value: getHabitDayStatusLabel("unsupported"),
          tone: "warning",
        },
      ],
    };
  }

  if (daySummary.trackingState === "not_tracked") {
    return {
      source: "habits",
      label: "Habits",
      status: "mapped",
      tone: "muted",
      compactLabel: getHabitDayStatusLabel("not_tracked"),
      summary: "Habit activity was not tracked on this date.",
      supportLabel:
        "This date is excluded from Habit performance but remains in coverage. A later check-in replaces this status.",
      href: `${SOURCE_HREFS.habits}?date=${input.date}`,
      metrics: [
        {
          id: "habit_not_tracked",
          label: "Status",
          value: getHabitDayStatusLabel("not_tracked"),
          tone: "muted",
        },
      ],
      stats: {
        dailyHabitCompletedCount: 0,
        dailyHabitTotalCount: 0,
        habitPotentialDayCount: daySummary.potentialPerfectDayItemCount > 0 ? 1 : 0,
        habitIncludedDayCount: 0,
        // Keep the raw whole-day status visible in Calendar week totals even
        // when an any-day cadence has its performance opportunity later in
        // the week or month. This is coverage evidence, never an outcome.
        habitNotTrackedDayCount: 1,
      },
    };
  }

  const visibleItems = getHabitVisibleItems(daySummary.items);
  const dailyHabitItems = getDailyHabitItems(daySummary.items);
  const weeklyHabitItems = getWeeklyHabitItems(daySummary.items);
  const knownWeeklyHabitItems = weeklyHabitItems.filter((item) => item.trackingState === "known");
  const dailyHabitTotalCount = dailyHabitItems.length;
  const dailyHabitCompletedCount = dailyHabitItems.filter(
    (item) => item.evaluation.isSatisfied
  ).length;
  const weeklyHabitCompletedOnDateCount = getWeeklyHabitCompletedOnDateCount(weeklyHabitItems);
  const monthlyHabitItems = getMonthlyHabitItems(daySummary.items);
  const monthlyHabitCompletedOnDateCount = getWeeklyHabitCompletedOnDateCount(monthlyHabitItems);
  const weeklyHabitTotalCount = knownWeeklyHabitItems.reduce(
    (total, item) => total + item.cadenceProgress.targetCount,
    0
  );
  const weeklyHabitCompletedCount = knownWeeklyHabitItems.reduce(
    (total, item) =>
      total + Math.min(item.cadenceProgress.completedCount, item.cadenceProgress.targetCount),
    0
  );
  const dueDailyCount = dailyHabitItems.filter((item) => !item.evaluation.isSatisfied).length;
  const restCount = visibleItems.filter((item) => item.checkIn?.status === "skipped").length;
  const slipCount = visibleItems.filter(
    (item) => item.habit.habitMode === "quit" && item.checkIn?.valueBoolean === false
  ).length;
  const resetCount = state.resetEvents.filter(
    (reset) =>
      supportedHabitIds.has(reset.habitId) &&
      reset.effectiveDate === input.date &&
      reset.resetType === "reset_stats" &&
      reset.status === "active"
  ).length;
  const hasReview = state.unsupported.count > 0;
  const hasIncompleteTracking = daySummary.items.some(
    (item) => item.trackingState === "incomplete"
  );
  const hasUserVisibleSignal =
    dailyHabitTotalCount > 0 ||
    weeklyHabitCompletedOnDateCount > 0 ||
    monthlyHabitCompletedOnDateCount > 0 ||
    restCount > 0 ||
    slipCount > 0 ||
    resetCount > 0 ||
    hasIncompleteTracking;
  const status: MyLibraryCalendarDailyLayerStatus = hasReview
    ? "review"
    : hasUserVisibleSignal
      ? "mapped"
      : "no_data";
  const compactLabel = getHabitLayerCompactLabel({
    dailyCompletedCount: dailyHabitCompletedCount,
    dailyTotalCount: dailyHabitTotalCount,
    weeklyCompletedOnDateCount: weeklyHabitCompletedOnDateCount,
    monthlyCompletedOnDateCount: monthlyHabitCompletedOnDateCount,
    hasReview,
    hasIncompleteTracking,
  });
  const reviewSupport =
    state.unsupported.count > 0
      ? ` ${pluralize(
          state.unsupported.count,
          "Habit"
        )} ${state.unsupported.count === 1 ? "needs" : "need"} review before ${
          state.unsupported.count === 1 ? "it counts" : "they count"
        }.`
      : "";
  const metrics: MyLibraryCalendarDailyLayerMetric[] = [
    {
      id: "habit_daily",
      label: "Daily habits",
      value: `${dailyHabitCompletedCount}/${dailyHabitTotalCount}`,
    },
    {
      id: "habit_due",
      label: "Due",
      value: pluralize(dueDailyCount, "habit"),
    },
    ...(weeklyHabitCompletedOnDateCount > 0
      ? [
          {
            id: "habit_weekly_completed_today",
            label: "Weekly done",
            value: pluralize(weeklyHabitCompletedOnDateCount, "habit"),
            tone: "positive" as const,
          },
        ]
      : []),
    ...(weeklyHabitTotalCount > 0
      ? [
          {
            id: "habit_weekly_total",
            label: "Weekly total",
            value: `${weeklyHabitCompletedCount}/${weeklyHabitTotalCount}`,
          },
        ]
      : []),
    ...(monthlyHabitCompletedOnDateCount > 0
      ? [
          {
            id: "habit_monthly_completed_today",
            label: "Monthly done",
            value: pluralize(monthlyHabitCompletedOnDateCount, "habit"),
            tone: "positive" as const,
          },
        ]
      : []),
    { id: "habit_rest", label: "Rest", value: pluralize(restCount, "day"), tone: "muted" },
    { id: "habit_slips", label: "Slips", value: pluralize(slipCount, "slip"), tone: "warning" },
    ...(resetCount > 0
      ? [
          {
            id: "habit_resets",
            label: "Reset markers",
            value: pluralize(resetCount, "marker"),
            tone: "muted" as const,
          },
        ]
      : []),
    ...(state.unsupported.count > 0
      ? [
          {
            id: "habit_review",
            label: getHabitDayStatusLabel("unsupported"),
            value: pluralize(state.unsupported.count, "habit"),
            tone: "warning" as const,
          },
        ]
      : []),
    ...(hasIncompleteTracking
      ? [
          {
            id: "habit_tracking_incomplete",
            label: "Coverage",
            value: getHabitItemTrackingStateLabel("incomplete"),
            tone: "muted" as const,
          },
        ]
      : []),
  ];

  return {
    source: "habits",
    label: "Habits",
    status,
    tone:
      status === "review"
        ? "warning"
        : hasIncompleteTracking
          ? "muted"
          : hasUserVisibleSignal
            ? "neutral"
            : "muted",
    compactLabel,
    summary: getHabitLayerSummary({
      dailyCompletedCount: dailyHabitCompletedCount,
      dailyTotalCount: dailyHabitTotalCount,
      weeklyCompletedOnDateCount: weeklyHabitCompletedOnDateCount,
      monthlyCompletedOnDateCount: monthlyHabitCompletedOnDateCount,
      hasReview,
      hasVisibleItems: visibleItems.length > 0,
      hasIncompleteTracking,
    }),
    supportLabel: `Daily Habits are counted on the date. Weekly Habits are credited on the completion date and summarized in the week total; unfinished weekly Habits do not make Sunday look like a failed daily Habit.${reviewSupport}`,
    href: `${SOURCE_HREFS.habits}?date=${input.date}`,
    metrics,
    stats: {
      dailyHabitCompletedCount,
      dailyHabitTotalCount,
      habitPotentialDayCount: daySummary.potentialPerfectDayItemCount > 0 ? 1 : 0,
      habitIncludedDayCount:
        daySummary.potentialPerfectDayItemCount > 0 &&
        daySummary.metricCoverage.knownUnitCount === daySummary.metricCoverage.potentialUnitCount
          ? 1
          : 0,
      habitNotTrackedDayCount: 0,
      weeklyHabitCompletedOnDateCount,
      weeklyHabitCompletedCount,
      weeklyHabitTotalCount,
      monthlyHabitCompletedOnDateCount,
    },
  };
}

function getMicroBlocksForDate(plans: MyLibraryCalendarMicroPlanLayerEvent[], date: string) {
  let completedCount = 0;
  let skippedCount = 0;
  let unknownCount = 0;
  let invalidPlanCount = 0;
  let repsTotal = 0;
  let loadKgTotal = 0;
  const exerciseKeys = new Set<string>();

  for (const plan of plans) {
    if (!Array.isArray(plan.blocks)) {
      invalidPlanCount += 1;
      continue;
    }

    for (const block of plan.blocks) {
      if (!isJsonObject(block)) {
        unknownCount += 1;
        continue;
      }

      const status = block.status;
      if (!isMappedMicroBlockStatus(status)) {
        unknownCount += 1;
        continue;
      }

      if (status === "completed" && getDateKeyFromIso(String(block.completedAt ?? "")) === date) {
        completedCount += 1;
        const exerciseKey =
          typeof block.sourceExerciseId === "string" && block.sourceExerciseId.trim().length > 0
            ? block.sourceExerciseId.trim()
            : typeof block.title === "string" && block.title.trim().length > 0
              ? block.title.trim()
              : null;
        if (exerciseKey) exerciseKeys.add(exerciseKey);

        const targetValue = isPositiveFiniteNumber(block.targetValue) ? block.targetValue : 0;
        if (block.targetType === "reps") {
          repsTotal += targetValue;
          if (targetValue > 0 && isPositiveFiniteNumber(block.loadKg)) {
            loadKgTotal += targetValue * block.loadKg;
          }
        }
      }
      if (status === "skipped" && getDateKeyFromIso(String(block.skippedAt ?? "")) === date) {
        skippedCount += 1;
      }
    }
  }

  return {
    completedCount,
    skippedCount,
    unknownCount,
    invalidPlanCount,
    exerciseKeys: Array.from(exerciseKeys).sort(),
    exerciseCount: exerciseKeys.size,
    repsTotal,
    loadKgTotal: Math.round(loadKgTotal * 10) / 10,
  };
}

function buildMicroSessionsLayer(input: {
  date: string;
  state: CalendarMicroLayerState;
}): MyLibraryCalendarDailyLayer {
  const state = input.state;

  if (state.status === "schema_missing") {
    return buildUnavailableLayer({
      source: "micro_sessions",
      status: "schema_missing",
      date: input.date,
      compactLabel: "Micro syncing",
      summary: "Micro Sessions are still syncing in this environment.",
      supportLabel: "No micro-plan rows were counted because the schema is not ready.",
    });
  }

  if (state.status === "error") {
    return buildUnavailableLayer({
      source: "micro_sessions",
      status: "error",
      date: input.date,
      compactLabel: "Micro error",
      summary: "Could not load Micro Sessions for this date.",
      supportLabel: "Retry later; no micro-plan rows were counted in Calendar.",
    });
  }

  if (state.status !== "ready") {
    return buildUnavailableLayer({
      source: "micro_sessions",
      status: "error",
      date: input.date,
      compactLabel: "Micro error",
      summary: "Could not load Micro Sessions for this date.",
      supportLabel: "Retry later; no micro-plan rows were counted in Calendar.",
    });
  }

  const stats = getMicroBlocksForDate(state.plans, input.date);
  const hasActivity = stats.completedCount + stats.skippedCount > 0;
  const hasReview = stats.unknownCount + stats.invalidPlanCount > 0;
  const status: MyLibraryCalendarDailyLayerStatus = hasActivity
    ? "mapped"
    : hasReview
      ? "review"
      : "no_data";

  return {
    source: "micro_sessions",
    label: "Micro Sessions",
    status,
    tone: hasActivity ? "neutral" : hasReview ? "warning" : "muted",
    compactLabel: hasActivity
      ? pluralize(stats.completedCount, "micro unit")
      : hasReview
        ? "Micro review needed"
        : "No micro",
    summary: hasActivity
      ? [
          `${pluralize(stats.completedCount, "completed micro unit")}`,
          stats.exerciseCount > 0 ? pluralize(stats.exerciseCount, "exercise") : null,
          stats.repsTotal > 0 ? `${formatNumber(stats.repsTotal)} reps` : null,
          stats.loadKgTotal > 0 ? `${formatNumber(stats.loadKgTotal)} kg lifted` : null,
          stats.skippedCount > 0 ? `${pluralize(stats.skippedCount, "skipped unit")}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : hasReview
        ? "Some Micro Session blocks need review before Calendar can count them."
        : "No completed or skipped Micro Session units on this date.",
    supportLabel:
      "Micro Sessions are counted as their own source. Habit credit from a linked weekly Habit is shown in Habits separately and does not make micro units part of the Habit count.",
    href: SOURCE_HREFS.micro_sessions,
    metrics: [
      {
        id: "micro_completed",
        label: "Completed",
        value: pluralize(stats.completedCount, "unit"),
        tone: "positive",
      },
      ...(stats.exerciseCount > 0
        ? [{ id: "micro_exercises", label: "Exercises", value: String(stats.exerciseCount) }]
        : []),
      ...(stats.repsTotal > 0
        ? [{ id: "micro_reps", label: "Reps", value: formatNumber(stats.repsTotal) }]
        : []),
      ...(stats.loadKgTotal > 0
        ? [{ id: "micro_load", label: "Load", value: `${formatNumber(stats.loadKgTotal)} kg` }]
        : []),
      {
        id: "micro_skipped",
        label: "Skipped",
        value: pluralize(stats.skippedCount, "unit"),
        tone: stats.skippedCount > 0 ? "warning" : "muted",
      },
      ...(hasReview
        ? [
            {
              id: "micro_review",
              label: "Needs mapping",
              value: pluralize(stats.unknownCount + stats.invalidPlanCount, "unit"),
              tone: "warning" as const,
            },
          ]
        : []),
    ],
    stats: {
      microCompletedUnitCount: stats.completedCount,
      microSkippedUnitCount: stats.skippedCount,
      microExerciseKeys: stats.exerciseKeys,
      microRepsTotal: stats.repsTotal,
      microLoadKgTotal: stats.loadKgTotal,
    },
  };
}

export function buildMyLibraryCalendarDailyLayers(input: {
  dateKeys: string[];
  todayDate: string;
  habits: CalendarHabitLayerState;
  microSessions: CalendarMicroLayerState;
}): MyLibraryCalendarDailyLayersByDate {
  const layersByDate: MyLibraryCalendarDailyLayersByDate = {};

  for (const date of input.dateKeys) {
    layersByDate[date] = [
      buildHabitsLayer({ date, todayDate: input.todayDate, state: input.habits }),
      buildMicroSessionsLayer({ date, state: input.microSessions }),
    ];
  }

  return layersByDate;
}
