import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildDrylandMicroPlanProgress,
  normalizeDrylandMicroBlocks,
} from "@/lib/dryland/micro-plans";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { clampLocalDayDateToToday } from "@/lib/my-library/local-day";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  buildHabitMotivationResetView,
  buildHabitMotivationSummary,
  buildHabitWeekSummary,
  getHabitMotivationRangeStartDate,
  HABIT_MOTIVATION_RANGE_VALUES,
  type HabitAbsenceReviewAcknowledgementRow,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitMicroSessionLinkStatus,
  type HabitMicroSessionLinkView,
  type HabitMicroSessionProgressView,
  type HabitMotivationResetRow,
  type HabitMotivationRangeSummaries,
  type HabitMotivationResetView,
  type HabitSnapshot,
} from "@/lib/habits/shared";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

export const HABIT_DEFINITION_SELECT = `
  id,
  user_id,
  title,
  notes,
  habit_mode,
  habit_type,
  category,
  target_operator,
  target_value_numeric,
  target_unit,
  target_time,
  start_date,
  last_lapse_date,
  timer_enabled,
  timer_target_seconds,
  cadence_period,
  cadence_target_count,
  cadence_day_policy,
  schedule_days,
  is_perfect_day_item,
  status,
  sort_order,
  created_at,
  updated_at
`;

export const HABIT_CHECK_IN_SELECT = `
  id,
  user_id,
  habit_id,
  check_in_date,
  timezone,
  value_numeric,
  value_boolean,
  value_time,
  timer_seconds,
  manual_minutes,
  note,
  source_kind,
  source_dryland_micro_plan_id,
  source_micro_block_id,
  source_completed_at,
  status,
  completed_at,
  created_at,
  updated_at
`;

export const HABIT_MOTIVATION_RESET_SELECT = `
  id,
  user_id,
  habit_id,
  reset_type,
  status,
  effective_date,
  created_by,
  created_at
`;

export const HABIT_ABSENCE_REVIEW_SELECT = `
  id,
  user_id,
  review_scope,
  review_date,
  status,
  created_at,
  updated_at
`;

const HABIT_MICRO_SESSION_LINK_SELECT = `
  habit_id,
  dryland_micro_plan_id,
  status,
  updated_at
`;

const HABIT_MICRO_SESSION_PLAN_SELECT = `
  id,
  blocks
`;

function getHabitMicroSessionLinkStatus(value: string): HabitMicroSessionLinkStatus {
  if (value === "active" || value === "paused") return value;
  return "unsupported";
}

function buildHabitMicroSessionProgress(
  plan: Pick<DrylandMicroPlanRow, "id" | "blocks">
): HabitMicroSessionProgressView | null {
  const blocks = normalizeDrylandMicroBlocks(plan.blocks);
  if (!blocks.ok) {
    console.error("[Habits] Could not normalize linked micro session plan", {
      planId: plan.id,
      error: blocks.error,
    });
    return null;
  }

  return buildDrylandMicroPlanProgress(blocks.value);
}

async function loadHabitMicroSessionLinksByHabitId(
  supabase: TypedSupabaseClient,
  userId: string,
  habitIds: string[]
): Promise<Map<string, HabitMicroSessionLinkView>> {
  if (habitIds.length === 0) return new Map();

  const linkResult = await supabase
    .from("micro_session_habit_links")
    .select(HABIT_MICRO_SESSION_LINK_SELECT)
    .eq("user_id", userId)
    .in("habit_id", habitIds)
    .in("status", ["active", "paused"])
    .order("updated_at", { ascending: false });

  if (isDrylandSchemaMissing(linkResult.error)) {
    return new Map();
  }

  if (linkResult.error) {
    console.error("[Habits] Could not load linked micro session habits", linkResult.error);
    return new Map();
  }

  const linksByHabitId = new Map<string, HabitMicroSessionLinkView>();
  const planIds = new Set<string>();

  for (const link of (linkResult.data ?? []) as MicroSessionHabitLinkRow[]) {
    if (linksByHabitId.has(link.habit_id)) continue;

    linksByHabitId.set(link.habit_id, {
      planId: link.dryland_micro_plan_id,
      status: getHabitMicroSessionLinkStatus(link.status),
      progress: null,
    });
    planIds.add(link.dryland_micro_plan_id);
  }

  if (planIds.size === 0) return linksByHabitId;

  const planResult = await supabase
    .from("dryland_micro_plans")
    .select(HABIT_MICRO_SESSION_PLAN_SELECT)
    .eq("user_id", userId)
    .in("id", Array.from(planIds));

  if (isDrylandSchemaMissing(planResult.error)) {
    return linksByHabitId;
  }

  if (planResult.error) {
    console.error("[Habits] Could not load linked micro session progress", planResult.error);
    return linksByHabitId;
  }

  const progressByPlanId = new Map<string, HabitMicroSessionProgressView>();
  for (const plan of (planResult.data ?? []) as Pick<DrylandMicroPlanRow, "id" | "blocks">[]) {
    const progress = buildHabitMicroSessionProgress(plan);
    if (progress) progressByPlanId.set(plan.id, progress);
  }

  for (const link of linksByHabitId.values()) {
    link.progress = progressByPlanId.get(link.planId) ?? null;
  }

  return linksByHabitId;
}

function getWeekStartDate(selectedDate: string) {
  const parsed = Date.parse(`${selectedDate}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function addCalendarDays(dateKey: string, days: number): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getWeekEndDate(selectedDate: string) {
  return addCalendarDays(getWeekStartDate(selectedDate), 6);
}

function getMonthStartDate(selectedDate: string) {
  const parsed = Date.parse(`${selectedDate}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

function getHabitCheckInStartDate(
  selectedDate: string,
  habits: ReturnType<typeof buildHabitDefinitionView>[]
) {
  const weekStart = getWeekStartDate(selectedDate);
  const monthStart = getMonthStartDate(selectedDate);
  let checkInStart = weekStart < monthStart ? weekStart : monthStart;

  for (const habit of habits) {
    if (habit.startDate < checkInStart) {
      checkInStart = habit.startDate;
    }
  }

  return checkInStart;
}

function getHabitCheckInEndDate(selectedDate: string, todayDate: string) {
  const weekEnd = getWeekEndDate(selectedDate);
  return weekEnd > todayDate ? todayDate : weekEnd;
}

function buildHabitMotivationSummaries(
  habits: ReturnType<typeof buildHabitDefinitionView>[],
  checkIns: ReturnType<typeof buildHabitCheckInView>[],
  selectedDate: string,
  resetEvents: HabitMotivationResetView[] = []
): HabitMotivationRangeSummaries {
  return HABIT_MOTIVATION_RANGE_VALUES.reduce<HabitMotivationRangeSummaries>((summaries, range) => {
    summaries[range] = buildHabitMotivationSummary(habits, checkIns, selectedDate, {
      historyStartDate: getHabitMotivationRangeStartDate(range, selectedDate),
      resetEvents,
    });
    return summaries;
  }, {});
}

function buildUnavailableSnapshot(selectedDate: string): HabitSnapshot {
  const daySummary = buildHabitDaySummary([], [], selectedDate);
  const motivationSummary = buildHabitMotivationSummary([], [], selectedDate);
  const motivationSummaries = buildHabitMotivationSummaries([], [], selectedDate);
  return {
    schemaReady: false,
    resetEventsReady: false,
    absenceReviewAcknowledgementsReady: false,
    loadError: null,
    selectedDate,
    activeHabits: [],
    archivedHabits: [],
    daySummary,
    weekSummary: buildHabitWeekSummary([], [], selectedDate),
    motivationSummary,
    motivationSummaries,
  };
}

export async function loadHabitSnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  dateContext: {
    selectedDate?: unknown;
    todayDate: string;
  }
): Promise<HabitSnapshot> {
  const selectedDate = clampLocalDayDateToToday(dateContext.selectedDate, dateContext.todayDate);
  const habitResult = await supabase
    .from("habit_definitions")
    .select(HABIT_DEFINITION_SELECT)
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (isHabitsSchemaMissing(habitResult.error)) {
    return buildUnavailableSnapshot(selectedDate);
  }

  if (habitResult.error) {
    console.error("[Habits] Could not load habit definitions", habitResult.error);
    const daySummary = buildHabitDaySummary([], [], selectedDate);
    const motivationSummary = buildHabitMotivationSummary([], [], selectedDate);
    const motivationSummaries = buildHabitMotivationSummaries([], [], selectedDate);
    return {
      schemaReady: true,
      absenceReviewAcknowledgementsReady: false,
      loadError: "Could not load your habits right now.",
      selectedDate,
      activeHabits: [],
      archivedHabits: [],
      daySummary,
      weekSummary: buildHabitWeekSummary([], [], selectedDate),
      motivationSummary,
      motivationSummaries,
    };
  }

  const habitRows = (habitResult.data ?? []) as HabitDefinitionRow[];
  const microSessionLinksByHabitId = await loadHabitMicroSessionLinksByHabitId(
    supabase,
    userId,
    habitRows.map((row) => row.id)
  );
  const habits = habitRows.map((row) =>
    buildHabitDefinitionView(row, {
      microSessionLink: microSessionLinksByHabitId.get(row.id) ?? null,
    })
  );
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const archivedHabits = habits.filter((habit) => habit.status === "archived");
  const checkInStart = getHabitCheckInStartDate(selectedDate, habits);
  const checkInEnd = getHabitCheckInEndDate(selectedDate, dateContext.todayDate);
  const checkInResult = await supabase
    .from("habit_check_ins")
    .select(HABIT_CHECK_IN_SELECT)
    .eq("user_id", userId)
    .gte("check_in_date", checkInStart)
    .lte("check_in_date", checkInEnd);

  if (isHabitsSchemaMissing(checkInResult.error)) {
    return buildUnavailableSnapshot(selectedDate);
  }

  if (checkInResult.error) {
    console.error("[Habits] Could not load habit check-ins", checkInResult.error);
    return {
      schemaReady: true,
      absenceReviewAcknowledgementsReady: false,
      loadError: "Could not load today's habit check-ins right now.",
      selectedDate,
      activeHabits,
      archivedHabits,
      daySummary: buildHabitDaySummary(activeHabits, [], selectedDate),
      weekSummary: buildHabitWeekSummary(activeHabits, [], selectedDate),
      motivationSummary: buildHabitMotivationSummary(habits, [], selectedDate),
      motivationSummaries: buildHabitMotivationSummaries(habits, [], selectedDate),
    };
  }

  const checkIns = ((checkInResult.data ?? []) as HabitCheckInRow[]).map(buildHabitCheckInView);
  const resetResult = await supabase
    .from("habit_motivation_resets")
    .select(HABIT_MOTIVATION_RESET_SELECT)
    .eq("user_id", userId)
    .lte("effective_date", selectedDate);
  const resetEventsReady = !isHabitsSchemaMissing(resetResult.error);
  const resetEvents =
    resetEventsReady && !resetResult.error
      ? ((resetResult.data ?? []) as HabitMotivationResetRow[]).map(buildHabitMotivationResetView)
      : [];

  if (resetResult.error && resetEventsReady) {
    console.error("[Habits] Could not load habit motivation resets", resetResult.error);
  }

  const absenceReviewStart = getWeekStartDate(selectedDate);
  const absenceReviewEnd = getHabitCheckInEndDate(selectedDate, dateContext.todayDate);
  const absenceReviewResult = await supabase
    .from("habit_absence_review_acknowledgements")
    .select(HABIT_ABSENCE_REVIEW_SELECT)
    .eq("user_id", userId)
    .eq("review_scope", "weekly_absence_review")
    .eq("status", "reviewed")
    .gte("review_date", absenceReviewStart)
    .lte("review_date", absenceReviewEnd);
  const absenceReviewAcknowledgementsReady = !isHabitsSchemaMissing(absenceReviewResult.error);
  const absenceReviewAcknowledgedDates =
    absenceReviewAcknowledgementsReady && !absenceReviewResult.error
      ? [
          ...new Set(
            ((absenceReviewResult.data ?? []) as HabitAbsenceReviewAcknowledgementRow[]).map(
              (row) => row.review_date
            )
          ),
        ].sort((left, right) => left.localeCompare(right))
      : undefined;

  if (absenceReviewResult.error && absenceReviewAcknowledgementsReady) {
    console.error(
      "[Habits] Could not load habit absence review acknowledgements",
      absenceReviewResult.error
    );
  }

  const motivationSummary = buildHabitMotivationSummary(habits, checkIns, selectedDate, {
    resetEvents,
  });
  const motivationSummaries = buildHabitMotivationSummaries(
    habits,
    checkIns,
    selectedDate,
    resetEvents
  );

  return {
    schemaReady: true,
    resetEventsReady,
    absenceReviewAcknowledgementsReady,
    loadError: null,
    selectedDate,
    activeHabits,
    archivedHabits,
    daySummary: buildHabitDaySummary(activeHabits, checkIns, selectedDate),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, selectedDate),
    absenceReviewAcknowledgedDates,
    motivationSummary,
    motivationSummaries,
  };
}
