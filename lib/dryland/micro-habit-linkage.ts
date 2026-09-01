import type { SupabaseClient } from "@supabase/supabase-js";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_CHECK_IN_SELECT, HABIT_DEFINITION_SELECT } from "@/lib/habits/server";
import {
  buildHabitCheckInView,
  buildHabitDefinitionView,
  classifyHabitDefinition,
  normalizeHabitTimezone,
  UNSUPPORTED_HABIT_DEFINITION_CODE,
  type HabitCheckInRow,
  type HabitDefinitionRow,
} from "@/lib/habits/shared";
import {
  isMicroHabitLinkStatus,
  type DrylandMicroHabitCreditResult,
  type DrylandMicroHabitLinkRecord,
} from "@/lib/dryland/micro-plans";
import { isLocalDayDateKey } from "@/lib/my-library/local-day";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];
type HabitCheckInInsert = Database["public"]["Tables"]["habit_check_ins"]["Insert"];

export const MICRO_SESSION_HABIT_LINK_SELECT = `
  id,
  user_id,
  dryland_micro_plan_id,
  habit_id,
  status,
  starts_on,
  paused_at,
  resumed_at,
  ended_at,
  created_at,
  updated_at
`;

export function buildDrylandMicroHabitLinkRecord(
  link: MicroSessionHabitLinkRow,
  habit: HabitDefinitionRow | null
): DrylandMicroHabitLinkRecord {
  const habitClassification = habit ? classifyHabitDefinition(habit) : null;
  const habitView =
    habitClassification?.kind === "supported"
      ? buildHabitDefinitionView(habitClassification.row)
      : null;
  const startsOn = isLocalDayDateKey(link.starts_on) ? link.starts_on : "";
  const status = startsOn && isMicroHabitLinkStatus(link.status) ? link.status : "unsupported";
  const habitStatus = habitView?.status ?? "unsupported";
  const habitMode = habitView?.habitMode ?? "unsupported";

  return {
    id: link.id,
    habitId: link.habit_id,
    status,
    habitDefinitionSupport: !habitClassification
      ? "unavailable"
      : habitClassification.kind === "supported"
        ? "supported"
        : "unsupported",
    startsOn,
    pausedAt: link.paused_at,
    resumedAt: link.resumed_at,
    endedAt: link.ended_at,
    habitTitle: habit?.title ?? null,
    habitStatus,
    habitMode,
    habitCadenceLabel: habitView?.cadenceLabel ?? null,
    canCount:
      habitClassification?.kind === "supported" &&
      status === "active" &&
      habitStatus === "active" &&
      habitMode === "build",
  };
}

export async function loadDrylandMicroHabitLinkRecord(
  supabase: TypedSupabaseClient,
  userId: string,
  planId: string,
  options: { required?: boolean } = {}
): Promise<DrylandMicroHabitLinkRecord | null> {
  const linkResult = await supabase
    .from("micro_session_habit_links")
    .select(MICRO_SESSION_HABIT_LINK_SELECT)
    .eq("user_id", userId)
    .eq("dryland_micro_plan_id", planId)
    .in("status", ["active", "paused"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isDrylandSchemaMissing(linkResult.error)) {
    if (options.required) {
      throw new Error("Micro Session habit linkage is still syncing in this environment.");
    }
    return null;
  }

  if (linkResult.error) {
    if (options.required) {
      throw new Error("Could not load the linked habit right now.");
    }
    console.error("[DrylandMicroHabitLink] Could not load link", linkResult.error);
    return null;
  }

  if (!linkResult.data) return null;

  const link = linkResult.data as MicroSessionHabitLinkRow;
  if (!isLocalDayDateKey(link.starts_on)) {
    console.error("[DrylandMicroHabitLink] Invalid persisted link start date", {
      linkId: link.id,
      planId,
    });
    if (options.required) {
      throw new Error("Linked Habit start date is invalid.");
    }
    return buildDrylandMicroHabitLinkRecord(link, null);
  }
  const habitResult = await supabase
    .from("habit_definitions")
    .select(HABIT_DEFINITION_SELECT)
    .eq("user_id", userId)
    .eq("id", link.habit_id)
    .maybeSingle();

  if (isHabitsSchemaMissing(habitResult.error)) {
    if (options.required) {
      throw new Error("Habits are still syncing in this environment.");
    }
    return buildDrylandMicroHabitLinkRecord(link, null);
  }

  if (habitResult.error) {
    if (options.required) {
      throw new Error("Could not load the linked habit right now.");
    }
    console.error("[DrylandMicroHabitLink] Could not load linked habit", habitResult.error);
    return buildDrylandMicroHabitLinkRecord(link, null);
  }

  return buildDrylandMicroHabitLinkRecord(link, (habitResult.data as HabitDefinitionRow) ?? null);
}

function buildMicroHabitCheckInInsert(input: {
  userId: string;
  habitId: string;
  checkInDate: string;
  timezone: unknown;
  planId: string;
  blockId: string;
  completedAt: string;
}): HabitCheckInInsert {
  if (!isLocalDayDateKey(input.checkInDate)) {
    throw new Error("Micro Session Habit check-in date must be valid.");
  }
  return {
    user_id: input.userId,
    habit_id: input.habitId,
    check_in_date: input.checkInDate,
    timezone: normalizeHabitTimezone(input.timezone),
    value_numeric: null,
    value_boolean: true,
    value_time: null,
    timer_seconds: 0,
    manual_minutes: 0,
    note: null,
    status: "logged",
    source_kind: "micro_session",
    source_dryland_micro_plan_id: input.planId,
    source_micro_block_id: input.blockId,
    source_completed_at: input.completedAt,
    completed_at: input.completedAt,
  };
}

function addUtcDays(dateKey: string, days: number): string {
  if (!isLocalDayDateKey(dateKey)) {
    throw new RangeError("Micro Session Habit date must be valid.");
  }
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getCalendarWeekStartDate(dateKey: string): string {
  if (!isLocalDayDateKey(dateKey)) {
    throw new RangeError("Micro Session Habit date must be valid.");
  }
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function getCalendarWeekEndDate(dateKey: string): string {
  return addUtcDays(getCalendarWeekStartDate(dateKey), 6);
}

export async function recordMicroSessionHabitCredit(
  supabase: TypedSupabaseClient,
  input: {
    userId: string;
    planId: string;
    blockId: string;
    link: DrylandMicroHabitLinkRecord | null;
    selectedDate: unknown;
    todayDate: string;
    timezone: unknown;
    completedAt: string;
  }
): Promise<DrylandMicroHabitCreditResult> {
  if (!input.link) {
    return {
      status: "not_linked",
      message: "This weekly Micro Session is not linked to a Habit.",
    };
  }

  if (input.link.habitDefinitionSupport === "unsupported") {
    return {
      status: "blocked",
      code: UNSUPPORTED_HABIT_DEFINITION_CODE,
      message: "Micro Session saved, but the linked Habit needs review and did not count.",
    };
  }

  if (input.link.status === "paused") {
    return {
      status: "paused",
      message: "Habit paused - weekly program did not count.",
    };
  }

  if (!input.link.canCount) {
    return {
      status: "blocked",
      message: "Linked Habit is not active, so the weekly program did not count.",
    };
  }

  if (!isLocalDayDateKey(input.selectedDate) || !isLocalDayDateKey(input.todayDate)) {
    return {
      status: "blocked",
      message: "Micro Session saved, but the Habit date was invalid.",
    };
  }

  const checkInDate = input.selectedDate;
  if (checkInDate > input.todayDate) {
    return {
      status: "blocked",
      message: "Micro Session saved, but future Habit credit was not counted.",
    };
  }
  const weekStart = getCalendarWeekStartDate(checkInDate);
  const weekEnd = getCalendarWeekEndDate(checkInDate);
  if (checkInDate < input.link.startsOn) {
    return {
      status: "blocked",
      message: "Linked Habit starts later, so the weekly program did not count.",
    };
  }

  const existingResult = await supabase
    .from("habit_check_ins")
    .select(HABIT_CHECK_IN_SELECT)
    .eq("user_id", input.userId)
    .eq("habit_id", input.link.habitId)
    .eq("check_in_date", checkInDate)
    .maybeSingle();

  if (isHabitsSchemaMissing(existingResult.error)) {
    return {
      status: "blocked",
      message: "Habits are still syncing. Micro Session saved, Habit not counted.",
    };
  }

  if (existingResult.error) {
    console.error("[DrylandMicroHabitLink] Could not check existing Habit credit", {
      planId: input.planId,
      habitId: input.link.habitId,
      checkInDate,
      error: existingResult.error,
    });
    return {
      status: "blocked",
      message: "Micro Session saved, but Habit credit could not be checked.",
    };
  }

  if (existingResult.data) {
    const existing = buildHabitCheckInView(existingResult.data as HabitCheckInRow);
    if (existing.status === "skipped") {
      return {
        status: "blocked",
        message: "Rest day is set for this Habit, so the weekly program did not count.",
      };
    }

    return {
      status: "already_counted",
      message: "Habit already completed for this week.",
    };
  }

  const existingWeekResult = await supabase
    .from("habit_check_ins")
    .select(HABIT_CHECK_IN_SELECT)
    .eq("user_id", input.userId)
    .eq("habit_id", input.link.habitId)
    .gte("check_in_date", weekStart)
    .lte("check_in_date", weekEnd)
    .limit(1)
    .maybeSingle();

  if (isHabitsSchemaMissing(existingWeekResult.error)) {
    return {
      status: "blocked",
      message: "Habits are still syncing. Micro Session saved, Habit not counted.",
    };
  }

  if (existingWeekResult.error) {
    console.error("[DrylandMicroHabitLink] Could not check weekly Habit credit", {
      planId: input.planId,
      habitId: input.link.habitId,
      weekStart,
      weekEnd,
      error: existingWeekResult.error,
    });
    return {
      status: "blocked",
      message: "Micro Session saved, but weekly Habit credit could not be checked.",
    };
  }

  if (existingWeekResult.data) {
    const existing = buildHabitCheckInView(existingWeekResult.data as HabitCheckInRow);
    if (existing.status === "logged") {
      return {
        status: "already_counted",
        message: "Habit already completed for this week.",
      };
    }
  }

  const insertPayload = buildMicroHabitCheckInInsert({
    userId: input.userId,
    habitId: input.link.habitId,
    checkInDate,
    timezone: input.timezone,
    planId: input.planId,
    blockId: input.blockId,
    completedAt: input.completedAt,
  });

  const insertResult = await supabase
    .from("habit_check_ins")
    .insert(insertPayload)
    .select(HABIT_CHECK_IN_SELECT)
    .single();

  if (isHabitsSchemaMissing(insertResult.error)) {
    return {
      status: "blocked",
      message: "Habits are still syncing. Micro Session saved, Habit not counted.",
    };
  }

  if (insertResult.error) {
    console.error("[DrylandMicroHabitLink] Could not create Habit credit", {
      planId: input.planId,
      habitId: input.link.habitId,
      checkInDate,
      error: insertResult.error,
    });
    return {
      status: "blocked",
      message: "Micro Session saved, but Habit credit could not be saved.",
    };
  }

  return {
    status: "counted",
    message: input.link.habitTitle
      ? `Habit completed for this week: ${input.link.habitTitle}`
      : "Habit completed for this week.",
  };
}

export async function removeMicroSessionHabitCredit(
  supabase: TypedSupabaseClient,
  input: {
    userId: string;
    planId: string;
    link: DrylandMicroHabitLinkRecord | null;
    selectedDate: unknown;
    todayDate: string;
  }
): Promise<DrylandMicroHabitCreditResult | undefined> {
  if (!input.link) return undefined;

  const hasUnsupportedDefinition = input.link.habitDefinitionSupport === "unsupported";

  if (input.link.status === "unsupported" || !isLocalDayDateKey(input.link.startsOn)) {
    return {
      status: "blocked",
      message: "Micro Session updated, but the linked Habit boundary was invalid.",
    };
  }

  if (!isLocalDayDateKey(input.selectedDate) || !isLocalDayDateKey(input.todayDate)) {
    return {
      status: "blocked",
      message: "Micro Session updated, but the Habit date was invalid.",
    };
  }

  const checkInDate = input.selectedDate;
  if (checkInDate > input.todayDate) {
    return {
      status: "blocked",
      message: "Micro Session updated, but future Habit credit was not changed.",
    };
  }
  const weekStart = getCalendarWeekStartDate(checkInDate);
  const weekEnd = getCalendarWeekEndDate(checkInDate);
  const deleteResult = await supabase
    .from("habit_check_ins")
    .delete()
    .eq("user_id", input.userId)
    .eq("habit_id", input.link.habitId)
    .eq("source_kind", "micro_session")
    .eq("source_dryland_micro_plan_id", input.planId)
    .gte("check_in_date", weekStart)
    .lte("check_in_date", weekEnd)
    .select("id");

  if (isHabitsSchemaMissing(deleteResult.error)) {
    return {
      status: "blocked",
      ...(hasUnsupportedDefinition ? { code: UNSUPPORTED_HABIT_DEFINITION_CODE } : {}),
      message: "Habits are still syncing. Micro Session updated, Habit credit not changed.",
    };
  }

  if (deleteResult.error) {
    console.error("[DrylandMicroHabitLink] Could not remove weekly Habit credit", {
      planId: input.planId,
      habitId: input.link.habitId,
      weekStart,
      weekEnd,
      error: deleteResult.error,
    });
    return {
      status: "blocked",
      ...(hasUnsupportedDefinition ? { code: UNSUPPORTED_HABIT_DEFINITION_CODE } : {}),
      message: "Micro Session updated, but weekly Habit credit could not be removed.",
    };
  }

  if ((deleteResult.data ?? []).length === 0) {
    return {
      status: "blocked",
      ...(hasUnsupportedDefinition ? { code: UNSUPPORTED_HABIT_DEFINITION_CODE } : {}),
      message: "Micro Session updated, but no source-backed Habit credit was found.",
    };
  }

  return {
    status: "removed",
    ...(hasUnsupportedDefinition ? { code: UNSUPPORTED_HABIT_DEFINITION_CODE } : {}),
    message: hasUnsupportedDefinition
      ? "Habit credit removed for this week. The linked Habit still needs review."
      : "Habit credit removed for this week.",
  };
}
