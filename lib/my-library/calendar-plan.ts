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
} from "@/lib/my-library/calendar";
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
};

export type MyLibraryCalendarPlanDay = {
  date: string;
  dayIndex: number;
  dayLabel: (typeof PROGRAM_WEEKDAY_LABELS)[number];
  sessions: MyLibraryCalendarPlanSession[];
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
  sessions: MyLibraryCalendarPlanSession[]
): MyLibraryCalendarPlanDay {
  const dayIndex = getPlanDayIndex(date);
  return {
    date,
    dayIndex,
    dayLabel: PROGRAM_WEEKDAY_LABELS[dayIndex],
    sessions,
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
  }));
  const monthDays = buildEmptyPlanMonthDays(month).map((day) => ({
    ...day,
    sessions: plannedSessions.filter((session) => session.date === day.date),
  }));
  const selectedDay = buildPlanDay(
    input.selectedDate,
    plannedSessions.filter((session) => session.date === input.selectedDate)
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
    programs: programSummaries,
    unanchoredPrograms,
    missingWorkoutIds,
    days,
    monthDays,
    selectedDay,
    sessionCount: visibleMonthSessionCount,
  };
}
