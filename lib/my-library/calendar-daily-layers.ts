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

function isHabitItemSatisfied(item: HabitDayItem): boolean {
  return item.evaluation.isSatisfied || item.cadenceProgress.isTargetMet;
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
  const satisfiedCount = visibleItems.filter(isHabitItemSatisfied).length;
  const dueCount = visibleItems.filter((item) => item.priorityGroup.startsWith("due_")).length;
  const restCount = visibleItems.filter((item) => item.checkIn?.status === "skipped").length;
  const slipCount = visibleItems.filter(
    (item) => item.habit.habitMode === "quit" && item.checkIn?.valueBoolean === false
  ).length;
  const periodCount = visibleItems.filter((item) => item.priorityGroup === "done_period").length;
  const resetCount = state.resetEvents.filter(
    (reset) =>
      reset.effectiveDate === input.date &&
      reset.resetType === "reset_stats" &&
      reset.status === "active"
  ).length;
  const hasReview = state.unsupported.count > 0;
  const status: MyLibraryCalendarDailyLayerStatus =
    hasReview && visibleItems.length === 0
      ? "review"
      : visibleItems.length > 0
        ? "mapped"
        : "no_data";
  const compactLabel =
    visibleItems.length > 0
      ? `${satisfiedCount}/${visibleItems.length} habits`
      : hasReview
        ? "Habits review needed"
        : "No habits";
  const reviewSupport =
    state.unsupported.count > 0
      ? ` ${pluralize(
          state.unsupported.count,
          "Habit"
        )} need a Calendar cadence mapping before they count.`
      : "";

  return {
    source: "habits",
    label: "Habits",
    status,
    tone: status === "review" ? "warning" : visibleItems.length > 0 ? "neutral" : "muted",
    compactLabel,
    summary:
      visibleItems.length > 0
        ? `${satisfiedCount}/${visibleItems.length} Habit signals on target.`
        : hasReview
          ? "Some Habits need review before Calendar can count them."
          : "No due, done, rest, or slip Habit signals on this date.",
    supportLabel: `Daily, weekly, and monthly Habits use the existing Habits day summary. Reset markers are shown separately and never count as completions.${reviewSupport}`,
    href: `${SOURCE_HREFS.habits}?date=${input.date}`,
    metrics: [
      { id: "habit_due", label: "Due", value: pluralize(dueCount, "habit") },
      { id: "habit_done_period", label: "Period done", value: pluralize(periodCount, "habit") },
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
    ],
  };
}

function getMicroBlocksForDate(plans: MyLibraryCalendarMicroPlanLayerEvent[], date: string) {
  let completedCount = 0;
  let skippedCount = 0;
  let unknownCount = 0;
  let invalidPlanCount = 0;

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
      }
      if (status === "skipped" && getDateKeyFromIso(String(block.skippedAt ?? "")) === date) {
        skippedCount += 1;
      }
    }
  }

  return { completedCount, skippedCount, unknownCount, invalidPlanCount };
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
      ? `${pluralize(stats.completedCount, "completed micro unit")} and ${pluralize(
          stats.skippedCount,
          "skipped unit"
        )}.`
      : hasReview
        ? "Some Micro Session blocks need review before Calendar can count them."
        : "No completed or skipped Micro Session units on this date.",
    supportLabel:
      "Micro Sessions counts only completed and skipped units by their saved timestamps. Queued, open, unfinished, unknown, and paused habit-link credit states are not counted.",
    href: SOURCE_HREFS.micro_sessions,
    metrics: [
      {
        id: "micro_completed",
        label: "Completed",
        value: pluralize(stats.completedCount, "unit"),
        tone: "positive",
      },
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
