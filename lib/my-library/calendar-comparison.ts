import type { SupabaseClient } from "@supabase/supabase-js";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_CHECK_IN_SELECT, HABIT_DEFINITION_SELECT } from "@/lib/habits/server";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  type HabitCheckInRow,
  type HabitCheckInView,
  type HabitDefinitionRow,
  type HabitDefinitionView,
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

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatSignedDelta(
  current: number,
  comparison: number,
  unit: string,
  options: { higherIsBetter?: boolean; suffix?: string } = {}
): { label: string; tone: CalendarMetricTone } {
  const delta = current - comparison;
  const higherIsBetter = options.higherIsBetter !== false;
  if (delta === 0) return { label: "No change", tone: "neutral" };
  const absDelta = Math.abs(delta);
  const suffix = options.suffix ?? ` ${absDelta === 1 ? unit : `${unit}s`}`;
  const isPositive = higherIsBetter ? delta > 0 : delta < 0;
  return {
    label: `${delta > 0 ? "+" : "-"}${absDelta}${suffix}`,
    tone: isPositive ? "positive" : "negative",
  };
}

function formatPercentDelta(current: number, comparison: number) {
  const delta = current - comparison;
  if (delta === 0) return { label: "No change", tone: "neutral" as const };
  return {
    label: `${delta > 0 ? "+" : ""}${delta} pp`,
    tone: delta > 0 ? ("positive" as const) : ("negative" as const),
  };
}

function buildNumericMetric(input: {
  id: string;
  label: string;
  current: number;
  comparison: number;
  unit: string;
  higherIsBetter?: boolean;
}): MyLibraryCalendarComparisonMetric {
  const delta = formatSignedDelta(input.current, input.comparison, input.unit, {
    higherIsBetter: input.higherIsBetter,
  });
  return {
    id: input.id,
    label: input.label,
    currentLabel: pluralize(input.current, input.unit),
    comparisonLabel: pluralize(input.comparison, input.unit),
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
    summary: "This source is not counted in comparison yet.",
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
  checkInCount: number;
};

function buildHabitRangeStats(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
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
    checkInCount: rangeCheckIns.length,
  };
}

export function buildHabitsCalendarComparisonSource({
  habits,
  checkIns,
  window,
}: {
  habits: HabitDefinitionView[];
  checkIns: HabitCheckInView[];
  window: MyLibraryCalendarComparisonWindow;
}): MyLibraryCalendarSourceComparison {
  const current = buildHabitRangeStats(habits, checkIns, window.current);
  const comparison = buildHabitRangeStats(habits, checkIns, window.comparison);
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const includedHabits = activeHabits.filter((habit) => habit.isPerfectDayItem);
  const hasData =
    current.scheduledHabitSlots +
      comparison.scheduledHabitSlots +
      current.checkInCount +
      comparison.checkInCount >
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
      ? `${current.averageCompletionPercent}% average on target across ${pluralize(
          current.daysWithHabits,
          "day"
        )} with habits.`
      : "No Habits data in either compared range.",
    supportLabel:
      "Habits counts existing check-ins only. Rest days and slips are reported separately and are not counted as completed habits.",
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
    ],
    metrics: [
      {
        id: "habit_completion_average",
        label: "Average on target",
        currentLabel: `${current.averageCompletionPercent}%`,
        comparisonLabel: `${comparison.averageCompletionPercent}%`,
        deltaLabel: completionDelta.label,
        tone: completionDelta.tone,
      },
      {
        id: "habit_on_target_slots",
        label: "On-target habits",
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
      ? `${pluralize(current.completedSessions, "completed session")} in the current range.`
      : "No completed dryland sessions in either compared range.",
    supportLabel:
      "Dryland counts saved sessions with a completed date. Draft and in-progress sessions are not counted.",
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
      ? `${pluralize(current.completedUnits, "completed unit")} in the current range.`
      : "No completed or skipped Micro Session units in either compared range.",
    supportLabel:
      "Micro Sessions counts completed and skipped units from saved micro-plan history. Queued future units are not counted.",
    metrics: [
      buildNumericMetric({
        id: "micro_completed_units",
        label: "Completed units",
        current: current.completedUnits,
        comparison: comparison.completedUnits,
        unit: "unit",
      }),
      buildNumericMetric({
        id: "micro_skipped_units",
        label: "Skipped units",
        current: current.skippedUnits,
        comparison: comparison.skippedUnits,
        unit: "unit",
        higherIsBetter: false,
      }),
    ],
  };
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
    swimming: buildUnmappedSource(
      "swimming",
      "Saved swim sessions do not yet have a canonical completed-on date, so Swimming is not counted in period comparison yet."
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

  const [habitResult, checkInResult, drylandResult, microPlanResult] = await Promise.all([
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
      habits = buildHabitsCalendarComparisonSource({
        habits: ((habitResult.data ?? []) as HabitDefinitionRow[]).map(buildHabitDefinitionView),
        checkIns: ((checkInResult.data ?? []) as HabitCheckInRow[]).map(buildHabitCheckInView),
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
    }),
  };
}
