import {
  HABIT_CADENCE_DAY_POLICY_VALUES,
  HABIT_CADENCE_PERIOD_VALUES,
  HABIT_MODE_VALUES,
  buildHabitDaySummary,
  type HabitCheckInView,
  type HabitDayItem,
  type HabitDefinitionRow,
  type HabitDefinitionView,
  type HabitMotivationResetView,
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

type CalendarHabitLayerState =
  | {
      status: "ready";
      habits: HabitDefinitionView[];
      checkIns: HabitCheckInView[];
      resetEvents: HabitMotivationResetView[];
      unsupported: UnsupportedHabitScope;
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

function hasUnsupportedHabitContract(row: HabitDefinitionRow): boolean {
  const hasUnknownCadencePeriod =
    row.cadence_period !== null &&
    !HABIT_CADENCE_PERIOD_VALUES.includes(row.cadence_period as never);
  const hasUnknownCadenceDayPolicy =
    row.cadence_day_policy !== null &&
    !HABIT_CADENCE_DAY_POLICY_VALUES.includes(row.cadence_day_policy as never);
  const hasUnknownHabitMode =
    row.habit_mode !== null && !HABIT_MODE_VALUES.includes(row.habit_mode as never);

  return hasUnknownCadencePeriod || hasUnknownCadenceDayPolicy || hasUnknownHabitMode;
}

export function partitionCalendarHabitRows(rows: HabitDefinitionRow[]): {
  supportedRows: HabitDefinitionRow[];
  unsupported: UnsupportedHabitScope;
} {
  const supportedRows: HabitDefinitionRow[] = [];
  const unsupportedLabels: string[] = [];

  for (const row of rows) {
    if (hasUnsupportedHabitContract(row)) {
      unsupportedLabels.push(row.title || row.id);
    } else {
      supportedRows.push(row);
    }
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
}) {
  if (input.dailyTotalCount > 0) {
    return `${input.dailyCompletedCount}/${input.dailyTotalCount} habits`;
  }

  if (input.weeklyCompletedOnDateCount > 0) {
    return pluralize(input.weeklyCompletedOnDateCount, "weekly habit");
  }

  if (input.monthlyCompletedOnDateCount > 0) {
    return pluralize(input.monthlyCompletedOnDateCount, "monthly habit");
  }

  if (input.hasReview) return "Habits review needed";
  return "No habits";
}

function getHabitLayerSummary(input: {
  dailyCompletedCount: number;
  dailyTotalCount: number;
  weeklyCompletedOnDateCount: number;
  monthlyCompletedOnDateCount: number;
  hasReview: boolean;
  hasVisibleItems: boolean;
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
  if (lines.length > 0) return lines.join(" ");
  if (input.hasReview) return "Some Habits need review before Calendar can count them.";
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

  const dayCheckIns = state.checkIns.filter((checkIn) => checkIn.checkInDate <= input.date);
  const daySummary = buildHabitDaySummary(state.habits, dayCheckIns, input.date);
  const visibleItems = getHabitVisibleItems(daySummary.items);
  const dailyHabitItems = getDailyHabitItems(daySummary.items);
  const weeklyHabitItems = getWeeklyHabitItems(daySummary.items);
  const dailyHabitTotalCount = dailyHabitItems.length;
  const dailyHabitCompletedCount = dailyHabitItems.filter(
    (item) => item.evaluation.isSatisfied
  ).length;
  const weeklyHabitCompletedOnDateCount = getWeeklyHabitCompletedOnDateCount(weeklyHabitItems);
  const monthlyHabitItems = getMonthlyHabitItems(daySummary.items);
  const monthlyHabitCompletedOnDateCount = getWeeklyHabitCompletedOnDateCount(monthlyHabitItems);
  const weeklyHabitTotalCount = weeklyHabitItems.reduce(
    (total, item) => total + item.cadenceProgress.targetCount,
    0
  );
  const weeklyHabitCompletedCount = weeklyHabitItems.reduce(
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
      reset.effectiveDate === input.date &&
      reset.resetType === "reset_stats" &&
      reset.status === "active"
  ).length;
  const hasReview = state.unsupported.count > 0;
  const hasUserVisibleSignal =
    dailyHabitTotalCount > 0 ||
    weeklyHabitCompletedOnDateCount > 0 ||
    monthlyHabitCompletedOnDateCount > 0 ||
    restCount > 0 ||
    slipCount > 0 ||
    resetCount > 0;
  const status: MyLibraryCalendarDailyLayerStatus =
    hasReview && !hasUserVisibleSignal ? "review" : hasUserVisibleSignal ? "mapped" : "no_data";
  const compactLabel = getHabitLayerCompactLabel({
    dailyCompletedCount: dailyHabitCompletedCount,
    dailyTotalCount: dailyHabitTotalCount,
    weeklyCompletedOnDateCount: weeklyHabitCompletedOnDateCount,
    monthlyCompletedOnDateCount: monthlyHabitCompletedOnDateCount,
    hasReview,
  });
  const reviewSupport =
    state.unsupported.count > 0
      ? ` ${pluralize(
          state.unsupported.count,
          "Habit"
        )} need a Calendar cadence mapping before they count.`
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
            label: "Needs mapping",
            value: pluralize(state.unsupported.count, "habit"),
            tone: "warning" as const,
          },
        ]
      : []),
  ];

  return {
    source: "habits",
    label: "Habits",
    status,
    tone: status === "review" ? "warning" : hasUserVisibleSignal ? "neutral" : "muted",
    compactLabel,
    summary: getHabitLayerSummary({
      dailyCompletedCount: dailyHabitCompletedCount,
      dailyTotalCount: dailyHabitTotalCount,
      weeklyCompletedOnDateCount: weeklyHabitCompletedOnDateCount,
      monthlyCompletedOnDateCount: monthlyHabitCompletedOnDateCount,
      hasReview,
      hasVisibleItems: visibleItems.length > 0,
    }),
    supportLabel: `Daily Habits are counted on the date. Weekly Habits are credited on the completion date and summarized in the week total; unfinished weekly Habits do not make Sunday look like a failed daily Habit.${reviewSupport}`,
    href: `${SOURCE_HREFS.habits}?date=${input.date}`,
    metrics,
    stats: {
      dailyHabitCompletedCount,
      dailyHabitTotalCount,
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
