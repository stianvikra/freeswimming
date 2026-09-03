import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPlannedWorkoutInstanceSchemaMissing,
  isProgramSchemaMissing,
} from "@/lib/programs/schema";
import {
  PLANNED_WORKOUT_INSTANCE_SELECT,
  PROGRAM_SELECT,
  buildProgramEditorRecord,
  buildProgramSummary,
} from "@/lib/programs/server";
import { PROGRAM_WEEKDAY_LABELS, type ProgramSummary } from "@/lib/programs/shared";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import { WORKOUT_SELECT, tryBuildWorkoutSummary } from "@/lib/workouts/server";
import type { WorkoutSummary } from "@/lib/workouts/shared";
import type { Database } from "@/types/database";
import {
  addCalendarDays,
  buildMyLibraryCalendarMonthWindow,
  buildMyLibraryCalendarWindow,
  getMyLibraryCalendarPeriodStartDate,
} from "@/lib/my-library/calendar";
import {
  buildMyLibraryCalendarDailyLayers,
  partitionCalendarHabitRows,
  type MyLibraryCalendarDailyLayer,
  type MyLibraryCalendarDailyLayersByDate,
} from "@/lib/my-library/calendar-daily-layers";
import {
  COMPLETED_ACTIVITY_EVENT_SELECT,
  isCompletedActivityEventDoneOutcome,
  isCompletedActivityEventSchemaMissing,
  isManualCompletedActivityEvent,
  normalizeCompletedActivityEventOutcome,
  type CompletedActivityEventRow,
  type CompletedActivityEventOutcome,
} from "@/lib/my-library/completed-activity-events";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import {
  HABIT_CHECK_IN_SELECT,
  HABIT_DEFINITION_SELECT,
  HABIT_MOTIVATION_RESET_SELECT,
} from "@/lib/habits/server";
import {
  buildHabitCheckInView,
  buildHabitDefinitionView,
  buildHabitMotivationResetView,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitMotivationResetRow,
} from "@/lib/habits/shared";
import {
  normalizePlannedWorkoutInstanceDateOverrideKind,
  normalizePlannedWorkoutInstanceStatus,
  type PlannedWorkoutInstanceDateOverrideKind,
  type PlannedWorkoutInstanceStatusSelection,
} from "@/lib/my-library/planned-workout-instances";

type TypedSupabaseClient = SupabaseClient<Database>;
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];
type DrylandMicroPlanRow = Pick<
  Database["public"]["Tables"]["dryland_micro_plans"]["Row"],
  "id" | "blocks"
>;

export type MyLibraryCalendarCompletionState =
  | {
      selection: "none";
    }
  | {
      selection: "manual_actual";
      eventId: string;
      completedOn: string;
      actualStartedAt: string | null;
      actualDurationSeconds: number | null;
      actualDistanceM: number | null;
      actualEnvironment: string | null;
      actualPoolLengthM: number | null;
      actualPoolLengthUnit: string | null;
      correctionNote: string | null;
      sourceKind: "manual";
      outcome: CompletedActivityEventOutcome;
      isDoneOutcome: boolean;
      createdAt: string;
      updatedAt: string;
    }
  | {
      selection: "review";
      eventId: string | null;
      completedOn: string | null;
      sourceKind: string;
      outcome: string;
    }
  | {
      selection: "schema_missing";
    };

export type MyLibraryCalendarPlanSession = {
  id: string;
  date: string;
  status: string;
  statusSelection: PlannedWorkoutInstanceStatusSelection;
  dateOverrideKind: PlannedWorkoutInstanceDateOverrideKind;
  updatedAt: string;
  program: ProgramSummary | null;
  weekId: string;
  weekLabel: string;
  weekIndex: number;
  assignmentId: string;
  workoutId: string | null;
  dayIndex: number;
  position: number;
  workout: WorkoutSummary | null;
  completion: MyLibraryCalendarCompletionState;
};

export type MyLibraryCalendarPlanDay = {
  date: string;
  dayIndex: number;
  dayLabel: (typeof PROGRAM_WEEKDAY_LABELS)[number];
  sessions: MyLibraryCalendarPlanSession[];
  dailyLayers: MyLibraryCalendarDailyLayer[];
};

export type MyLibraryCalendarPlanMonthDay = MyLibraryCalendarPlanDay & {
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
};

export type MyLibraryCalendarPlanModel = {
  schemaReady: boolean;
  loadError: string | null;
  selectedDate: string;
  todayDate: string;
  window: ReturnType<typeof buildMyLibraryCalendarWindow>;
  month: ReturnType<typeof buildMyLibraryCalendarMonthWindow>;
  selectedProgramId: string | null;
  selectedProgramMissing: boolean;
  completionSchemaReady: boolean;
  programs: ProgramSummary[];
  unanchoredPrograms: ProgramSummary[];
  missingWorkoutIds: string[];
  days: MyLibraryCalendarPlanDay[];
  monthDays: MyLibraryCalendarPlanMonthDay[];
  selectedDay: MyLibraryCalendarPlanDay;
  sessionCount: number;
};

function emptyPlanModel(input: {
  selectedDate: string;
  todayDate: string;
  selectedProgramId: string | null;
  schemaReady: boolean;
  loadError: string | null;
}): MyLibraryCalendarPlanModel {
  const window = buildMyLibraryCalendarWindow(input.selectedDate);
  const month = buildMyLibraryCalendarMonthWindow({
    selectedDate: input.selectedDate,
    todayDate: input.todayDate,
  });

  return {
    schemaReady: input.schemaReady,
    loadError: input.loadError,
    selectedDate: input.selectedDate,
    todayDate: input.todayDate,
    window,
    month,
    selectedProgramId: input.selectedProgramId,
    selectedProgramMissing: false,
    completionSchemaReady: true,
    programs: [],
    unanchoredPrograms: [],
    missingWorkoutIds: [],
    days: buildEmptyPlanDays(window),
    monthDays: buildEmptyPlanMonthDays(month),
    selectedDay: buildPlanDay(input.selectedDate, []),
    sessionCount: 0,
  };
}

function getPlanDayIndex(dateKey: string): number {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return 0;
  return (parsed.getUTCDay() + 6) % 7;
}

function buildPlanDay(
  date: string,
  sessions: MyLibraryCalendarPlanSession[],
  dailyLayers: MyLibraryCalendarDailyLayer[] = []
): MyLibraryCalendarPlanDay {
  const dayIndex = getPlanDayIndex(date);
  return {
    date,
    dayIndex,
    dayLabel: PROGRAM_WEEKDAY_LABELS[dayIndex],
    sessions,
    dailyLayers,
  };
}

function buildPlanDays(startDate: string, endDate: string): MyLibraryCalendarPlanDay[] {
  const days: MyLibraryCalendarPlanDay[] = [];
  let date = startDate;

  while (date <= endDate) {
    days.push(buildPlanDay(date, []));
    date = addCalendarDays(date, 1);
  }

  return days;
}

function buildEmptyPlanDays(
  window: ReturnType<typeof buildMyLibraryCalendarWindow>
): MyLibraryCalendarPlanDay[] {
  return buildPlanDays(window.startDate, window.endDate);
}

function buildEmptyPlanMonthDays(
  month: ReturnType<typeof buildMyLibraryCalendarMonthWindow>
): MyLibraryCalendarPlanMonthDay[] {
  return buildPlanDays(month.gridStartDate, month.gridEndDate).map((day) => ({
    ...day,
    isCurrentMonth: day.date >= month.startDate && day.date <= month.endDate,
    isSelected: day.date === month.selectedDate,
    isToday: day.date === month.todayDate,
  }));
}

function buildDateKeys(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let date = startDate;

  while (date <= endDate) {
    dates.push(date);
    date = addCalendarDays(date, 1);
  }

  return dates;
}

function dateToIsoEnd(dateKey: string) {
  return `${dateKey}T23:59:59.999Z`;
}

async function loadCalendarDailyLayers(
  supabase: TypedSupabaseClient,
  userId: string,
  input: {
    month: ReturnType<typeof buildMyLibraryCalendarMonthWindow>;
    todayDate: string;
  }
): Promise<MyLibraryCalendarDailyLayersByDate> {
  const dateKeys = buildDateKeys(input.month.gridStartDate, input.month.gridEndDate);
  const habitHistoryStart = getMyLibraryCalendarPeriodStartDate(input.month.gridStartDate, "month");
  const habitHistoryEnd =
    input.month.gridEndDate < input.todayDate ? input.month.gridEndDate : input.todayDate;

  const [habitResult, microPlanResult] = await Promise.all([
    supabase
      .from("habit_definitions")
      .select(HABIT_DEFINITION_SELECT)
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase
      .from("dryland_micro_plans")
      .select("id, blocks, week_starts_at, week_ends_at")
      .eq("user_id", userId)
      .lte("week_starts_at", dateToIsoEnd(input.month.gridEndDate))
      .gte("week_ends_at", `${input.month.gridStartDate}T00:00:00.000Z`),
  ]);

  let habitLayerState: Parameters<typeof buildMyLibraryCalendarDailyLayers>[0]["habits"];
  if (isHabitsSchemaMissing(habitResult.error)) {
    habitLayerState = { status: "schema_missing" };
  } else if (habitResult.error) {
    console.error("[CalendarPlan] Could not load daily Habits layers", habitResult.error);
    habitLayerState = { status: "error" };
  } else {
    const { supportedRows, unsupported } = partitionCalendarHabitRows(
      (habitResult.data ?? []) as HabitDefinitionRow[]
    );
    const supportedHabitIds = new Set(supportedRows.map((row) => row.id));
    const habits = supportedRows
      .map(buildHabitDefinitionView)
      .filter((habit) => habit.status === "active");
    const [checkInResult, resetResult] = await Promise.all([
      habitHistoryEnd >= habitHistoryStart
        ? supabase
            .from("habit_check_ins")
            .select(HABIT_CHECK_IN_SELECT)
            .eq("user_id", userId)
            .gte("check_in_date", habitHistoryStart)
            .lte("check_in_date", habitHistoryEnd)
        : Promise.resolve({ data: [], error: null }),
      habitHistoryEnd >= habitHistoryStart
        ? supabase
            .from("habit_motivation_resets")
            .select(HABIT_MOTIVATION_RESET_SELECT)
            .eq("user_id", userId)
            .gte("effective_date", habitHistoryStart)
            .lte("effective_date", habitHistoryEnd)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (isHabitsSchemaMissing(checkInResult.error)) {
      habitLayerState = { status: "schema_missing" };
    } else if (checkInResult.error) {
      console.error("[CalendarPlan] Could not load daily Habit check-ins", checkInResult.error);
      habitLayerState = { status: "error" };
    } else {
      if (resetResult.error && !isHabitsSchemaMissing(resetResult.error)) {
        console.error("[CalendarPlan] Could not load daily Habit reset markers", resetResult.error);
      }

      habitLayerState = {
        status: "ready",
        habits,
        checkIns: ((checkInResult.data ?? []) as HabitCheckInRow[])
          .filter((row) => supportedHabitIds.has(row.habit_id))
          .map(buildHabitCheckInView),
        resetEvents:
          resetResult.error || isHabitsSchemaMissing(resetResult.error)
            ? []
            : ((resetResult.data ?? []) as HabitMotivationResetRow[])
                .filter((row) => supportedHabitIds.has(row.habit_id))
                .map(buildHabitMotivationResetView),
        unsupported,
      };
    }
  }

  const microLayerState: Parameters<typeof buildMyLibraryCalendarDailyLayers>[0]["microSessions"] =
    isDrylandSchemaMissing(microPlanResult.error)
      ? { status: "schema_missing" }
      : microPlanResult.error
        ? (() => {
            console.error(
              "[CalendarPlan] Could not load daily Micro Sessions layers",
              microPlanResult.error
            );
            return { status: "error" as const };
          })()
        : {
            status: "ready",
            plans: ((microPlanResult.data ?? []) as DrylandMicroPlanRow[]).map((row) => ({
              id: row.id,
              blocks: row.blocks,
            })),
          };

  return buildMyLibraryCalendarDailyLayers({
    dateKeys,
    todayDate: input.todayDate,
    habits: habitLayerState,
    microSessions: microLayerState,
  });
}

function dedupeProgramRows(rows: ProgramRow[]): ProgramRow[] {
  const byId = new Map<string, ProgramRow>();
  for (const row of rows) {
    byId.set(row.id, row);
  }
  return Array.from(byId.values());
}

function getProgramWeekLabel(program: ProgramRow | null, instance: PlannedWorkoutInstanceRow) {
  if (!program || !Array.isArray(program.weeks)) {
    return `Week ${instance.program_week_index + 1}`;
  }

  const weeks = program.weeks as Array<{ id?: string; label?: string }>;
  const week = weeks.find((candidate) => candidate.id === instance.program_week_id);
  return typeof week?.label === "string" && week.label.trim().length > 0
    ? week.label
    : `Week ${instance.program_week_index + 1}`;
}

function groupCompletedEventsByPlannedInstance(rows: CompletedActivityEventRow[]) {
  const byPlannedInstanceId = new Map<string, CompletedActivityEventRow[]>();
  for (const row of rows) {
    const existing = byPlannedInstanceId.get(row.planned_workout_instance_id) ?? [];
    existing.push(row);
    byPlannedInstanceId.set(row.planned_workout_instance_id, existing);
  }
  return byPlannedInstanceId;
}

function buildCompletionState(
  rows: CompletedActivityEventRow[],
  completionSchemaReady: boolean
): MyLibraryCalendarCompletionState {
  if (!completionSchemaReady) {
    return { selection: "schema_missing" };
  }

  if (rows.length === 0) {
    return { selection: "none" };
  }

  if (rows.length > 1) {
    const firstRow = rows[0];
    return {
      selection: "review",
      eventId: firstRow?.id ?? null,
      completedOn: firstRow?.completed_on ?? null,
      sourceKind: firstRow?.source_kind ?? "unknown",
      outcome: firstRow?.outcome ?? "unknown",
    };
  }

  const manualCompleted = rows.find(isManualCompletedActivityEvent);
  if (manualCompleted) {
    const outcome = normalizeCompletedActivityEventOutcome(manualCompleted.outcome);
    if (outcome === "unmapped") {
      return {
        selection: "review",
        eventId: manualCompleted.id,
        completedOn: manualCompleted.completed_on,
        sourceKind: manualCompleted.source_kind,
        outcome: manualCompleted.outcome,
      };
    }

    return {
      selection: "manual_actual",
      eventId: manualCompleted.id,
      completedOn: manualCompleted.completed_on,
      actualStartedAt: manualCompleted.actual_started_at,
      actualDurationSeconds: manualCompleted.actual_duration_seconds,
      actualDistanceM: manualCompleted.actual_distance_m,
      actualEnvironment: manualCompleted.actual_environment,
      actualPoolLengthM: manualCompleted.actual_pool_length_m,
      actualPoolLengthUnit: manualCompleted.actual_pool_length_unit,
      correctionNote: manualCompleted.correction_note,
      sourceKind: "manual",
      outcome,
      isDoneOutcome: isCompletedActivityEventDoneOutcome(outcome),
      createdAt: manualCompleted.created_at,
      updatedAt: manualCompleted.updated_at,
    };
  }

  const firstRow = rows[0];
  return {
    selection: "review",
    eventId: firstRow?.id ?? null,
    completedOn: firstRow?.completed_on ?? null,
    sourceKind: firstRow?.source_kind ?? "unknown",
    outcome: firstRow?.outcome ?? "unknown",
  };
}

async function loadMissingPrograms(
  supabase: TypedSupabaseClient,
  userId: string,
  knownRows: ProgramRow[],
  instances: PlannedWorkoutInstanceRow[]
): Promise<
  { ok: true; rows: ProgramRow[] } | { ok: false; schemaReady: boolean; loadError: string | null }
> {
  const knownProgramIds = new Set(knownRows.map((row) => row.id));
  const missingProgramIds = Array.from(
    new Set(
      instances
        .map((instance) => instance.program_id)
        .filter((programId) => !knownProgramIds.has(programId))
    )
  );

  if (missingProgramIds.length === 0) {
    return { ok: true, rows: [] };
  }

  const result = await supabase
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("user_id", userId)
    .in("id", missingProgramIds);

  if (isProgramSchemaMissing(result.error)) {
    return { ok: false, schemaReady: false, loadError: null };
  }

  if (result.error) {
    console.error("[CalendarPlan] Could not load instance programs", result.error);
    return {
      ok: false,
      schemaReady: true,
      loadError: "Could not load planned program details right now.",
    };
  }

  return { ok: true, rows: (result.data ?? []) as ProgramRow[] };
}

export async function loadMyLibraryCalendarPlan(
  supabase: TypedSupabaseClient,
  userId: string,
  input: {
    selectedDate: string;
    todayDate?: string;
    selectedProgramId: string | null;
  }
): Promise<MyLibraryCalendarPlanModel> {
  const window = buildMyLibraryCalendarWindow(input.selectedDate);
  const todayDate = input.todayDate ?? input.selectedDate;
  const month = buildMyLibraryCalendarMonthWindow({
    selectedDate: input.selectedDate,
    todayDate,
  });
  const dailyLayersByDate = await loadCalendarDailyLayers(supabase, userId, {
    month,
    todayDate,
  });
  let instancesQuery = supabase
    .from("planned_workout_instances")
    .select(PLANNED_WORKOUT_INSTANCE_SELECT)
    .eq("user_id", userId)
    .gte("planned_on", month.gridStartDate)
    .lte("planned_on", month.gridEndDate);

  if (input.selectedProgramId) {
    instancesQuery = instancesQuery.eq("program_id", input.selectedProgramId);
  }

  const [recentProgramsResult, selectedProgramResult, instancesResult] = await Promise.all([
    supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
    input.selectedProgramId
      ? supabase
          .from("programs")
          .select(PROGRAM_SELECT)
          .eq("user_id", userId)
          .eq("id", input.selectedProgramId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    instancesQuery.order("planned_on", { ascending: true }).order("position", { ascending: true }),
  ]);

  if (
    isProgramSchemaMissing(recentProgramsResult.error) ||
    isProgramSchemaMissing(selectedProgramResult.error) ||
    isPlannedWorkoutInstanceSchemaMissing(instancesResult.error)
  ) {
    return emptyPlanModel({
      selectedDate: input.selectedDate,
      todayDate,
      selectedProgramId: input.selectedProgramId,
      schemaReady: false,
      loadError: null,
    });
  }

  if (recentProgramsResult.error || selectedProgramResult.error || instancesResult.error) {
    console.error("[CalendarPlan] Could not load planned calendar data", {
      recentProgramsError: recentProgramsResult.error,
      selectedProgramError: selectedProgramResult.error,
      instancesError: instancesResult.error,
    });
    return emptyPlanModel({
      selectedDate: input.selectedDate,
      todayDate,
      selectedProgramId: input.selectedProgramId,
      schemaReady: true,
      loadError: "Could not load planned program sessions right now.",
    });
  }

  const baseProgramRows = dedupeProgramRows([
    ...((selectedProgramResult.data ? [selectedProgramResult.data] : []) as ProgramRow[]),
    ...((recentProgramsResult.data ?? []) as ProgramRow[]),
  ]);
  const instances = (instancesResult.data ?? []) as PlannedWorkoutInstanceRow[];
  const missingProgramsResult = await loadMissingPrograms(
    supabase,
    userId,
    baseProgramRows,
    instances
  );

  if (!missingProgramsResult.ok) {
    return emptyPlanModel({
      selectedDate: input.selectedDate,
      todayDate,
      selectedProgramId: input.selectedProgramId,
      schemaReady: missingProgramsResult.schemaReady,
      loadError: missingProgramsResult.loadError,
    });
  }

  const programRows = dedupeProgramRows([...baseProgramRows, ...missingProgramsResult.rows]);
  let programSummaries: ProgramSummary[];
  try {
    programSummaries = programRows.map(buildProgramSummary);
  } catch (error) {
    console.error("[CalendarPlan] Stored program payload is invalid", error);
    return emptyPlanModel({
      selectedDate: input.selectedDate,
      todayDate,
      selectedProgramId: input.selectedProgramId,
      schemaReady: true,
      loadError: "A saved program could not be planned because its stored data is invalid.",
    });
  }

  const programRowById = new Map(programRows.map((program) => [program.id, program]));
  const programSummaryById = new Map(programSummaries.map((program) => [program.id, program]));
  const unanchoredPrograms = programRows
    .map((row) => {
      try {
        return buildProgramEditorRecord(row);
      } catch {
        return null;
      }
    })
    .filter((program) => program && !program.startsOn)
    .map((program) => (program ? programSummaryById.get(program.id) : null))
    .filter((program): program is ProgramSummary => Boolean(program));
  const workoutIds = Array.from(
    new Set(
      instances
        .map((instance) => instance.workout_id)
        .filter((workoutId): workoutId is string => Boolean(workoutId))
    )
  );

  let workouts: WorkoutSummary[] = [];
  let loadError: string | null = null;
  if (workoutIds.length > 0) {
    const workoutsResult = await supabase
      .from("workouts")
      .select(WORKOUT_SELECT)
      .eq("user_id", userId)
      .in("id", workoutIds);

    if (isWorkoutSchemaMissing(workoutsResult.error)) {
      workouts = [];
    } else if (workoutsResult.error) {
      console.error("[CalendarPlan] Could not load planned workouts", workoutsResult.error);
      loadError = "Planned workouts could not be fully loaded right now.";
      workouts = [];
    } else {
      workouts = (workoutsResult.data ?? [])
        .map((row) => tryBuildWorkoutSummary(row as WorkoutRow, "calendar-plan workouts"))
        .filter((workout): workout is WorkoutSummary => Boolean(workout));
    }
  }

  const workoutsById = new Map(workouts.map((workout) => [workout.id, workout]));
  let completionSchemaReady = true;
  let completedActivityRows: CompletedActivityEventRow[] = [];
  const plannedInstanceIds = instances.map((instance) => instance.id);

  if (plannedInstanceIds.length > 0) {
    const completedActivityResult = await supabase
      .from("completed_activity_events")
      .select(COMPLETED_ACTIVITY_EVENT_SELECT)
      .eq("user_id", userId)
      .in("planned_workout_instance_id", plannedInstanceIds);

    if (isCompletedActivityEventSchemaMissing(completedActivityResult.error)) {
      completionSchemaReady = false;
    } else if (completedActivityResult.error) {
      console.error(
        "[CalendarPlan] Could not load completed activity events",
        completedActivityResult.error
      );
      loadError = loadError ?? "Completed swim history could not be fully loaded right now.";
    } else {
      completedActivityRows = (completedActivityResult.data ?? []) as CompletedActivityEventRow[];
    }
  }

  const completionsByPlannedInstanceId =
    groupCompletedEventsByPlannedInstance(completedActivityRows);
  const plannedSessions = instances
    .map((instance) => {
      const programRow = programRowById.get(instance.program_id) ?? null;
      return {
        id: instance.id,
        date: instance.planned_on,
        status: instance.status,
        statusSelection: normalizePlannedWorkoutInstanceStatus(instance.status),
        dateOverrideKind: normalizePlannedWorkoutInstanceDateOverrideKind(
          instance.date_override_kind
        ),
        updatedAt: instance.updated_at,
        program: programSummaryById.get(instance.program_id) ?? null,
        weekId: instance.program_week_id,
        weekLabel: getProgramWeekLabel(programRow, instance),
        weekIndex: instance.program_week_index,
        assignmentId: instance.program_assignment_id,
        workoutId: instance.workout_id,
        dayIndex: instance.day_index,
        position: instance.position,
        workout: instance.workout_id ? (workoutsById.get(instance.workout_id) ?? null) : null,
        completion: buildCompletionState(
          completionsByPlannedInstanceId.get(instance.id) ?? [],
          completionSchemaReady
        ),
      };
    })
    .sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.position - right.position ||
        (left.program?.title ?? "").localeCompare(right.program?.title ?? "")
    );
  const missingWorkoutIds = workoutIds.filter((workoutId) => !workoutsById.has(workoutId));
  const days = buildEmptyPlanDays(window).map((day) => ({
    ...day,
    sessions: plannedSessions.filter((session) => session.date === day.date),
    dailyLayers: dailyLayersByDate[day.date] ?? [],
  }));
  const monthDays = buildEmptyPlanMonthDays(month).map((day) => ({
    ...day,
    sessions: plannedSessions.filter((session) => session.date === day.date),
    dailyLayers: dailyLayersByDate[day.date] ?? [],
  }));
  const selectedDay = buildPlanDay(
    input.selectedDate,
    plannedSessions.filter((session) => session.date === input.selectedDate),
    dailyLayersByDate[input.selectedDate] ?? []
  );
  const visibleMonthSessionCount = plannedSessions.filter(
    (session) => session.date >= month.startDate && session.date <= month.endDate
  ).length;

  return {
    schemaReady: true,
    loadError,
    selectedDate: input.selectedDate,
    todayDate,
    window,
    month,
    selectedProgramId: input.selectedProgramId,
    selectedProgramMissing: Boolean(input.selectedProgramId && !selectedProgramResult.data),
    completionSchemaReady,
    programs: programSummaries,
    unanchoredPrograms,
    missingWorkoutIds,
    days,
    monthDays,
    selectedDay,
    sessionCount: visibleMonthSessionCount,
  };
}
