import type { SupabaseClient } from "@supabase/supabase-js";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  buildHabitWeekSummary,
  normalizeHabitDate,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitSnapshot,
} from "@/lib/habits/shared";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

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
  note,
  status,
  completed_at,
  created_at,
  updated_at
`;

function getWeekStartDate(selectedDate: string) {
  const parsed = Date.parse(`${selectedDate}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - 6);
  return date.toISOString().slice(0, 10);
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
  activeHabits: ReturnType<typeof buildHabitDefinitionView>[]
) {
  const weekStart = getWeekStartDate(selectedDate);
  const monthStart = getMonthStartDate(selectedDate);
  let checkInStart = weekStart < monthStart ? weekStart : monthStart;

  for (const habit of activeHabits) {
    const needsHistoryForMotivation =
      habit.habitMode === "quit" ||
      (habit.habitMode === "build" && habit.cadencePeriod === "daily");
    if (needsHistoryForMotivation && habit.startDate < checkInStart) {
      checkInStart = habit.startDate;
    }
  }

  return checkInStart;
}

function buildUnavailableSnapshot(selectedDate: string): HabitSnapshot {
  const daySummary = buildHabitDaySummary([], [], selectedDate);
  return {
    schemaReady: false,
    loadError: null,
    selectedDate,
    activeHabits: [],
    archivedHabits: [],
    daySummary,
    weekSummary: buildHabitWeekSummary([], [], selectedDate),
  };
}

export async function loadHabitSnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  selectedDateInput?: unknown
): Promise<HabitSnapshot> {
  const selectedDate = normalizeHabitDate(selectedDateInput);
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
    return {
      schemaReady: true,
      loadError: "Could not load your habits right now.",
      selectedDate,
      activeHabits: [],
      archivedHabits: [],
      daySummary,
      weekSummary: buildHabitWeekSummary([], [], selectedDate),
    };
  }

  const habits = ((habitResult.data ?? []) as HabitDefinitionRow[]).map(buildHabitDefinitionView);
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const archivedHabits = habits.filter((habit) => habit.status === "archived");
  const checkInStart = getHabitCheckInStartDate(selectedDate, activeHabits);
  const checkInResult = await supabase
    .from("habit_check_ins")
    .select(HABIT_CHECK_IN_SELECT)
    .eq("user_id", userId)
    .gte("check_in_date", checkInStart)
    .lte("check_in_date", selectedDate);

  if (isHabitsSchemaMissing(checkInResult.error)) {
    return buildUnavailableSnapshot(selectedDate);
  }

  if (checkInResult.error) {
    console.error("[Habits] Could not load habit check-ins", checkInResult.error);
    return {
      schemaReady: true,
      loadError: "Could not load today's habit check-ins right now.",
      selectedDate,
      activeHabits,
      archivedHabits,
      daySummary: buildHabitDaySummary(activeHabits, [], selectedDate),
      weekSummary: buildHabitWeekSummary(activeHabits, [], selectedDate),
    };
  }

  const checkIns = ((checkInResult.data ?? []) as HabitCheckInRow[]).map(buildHabitCheckInView);

  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    activeHabits,
    archivedHabits,
    daySummary: buildHabitDaySummary(activeHabits, checkIns, selectedDate),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, selectedDate),
  };
}
