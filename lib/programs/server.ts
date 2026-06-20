import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPlannedWorkoutInstanceSchemaMissing,
  isProgramSchemaMissing,
} from "@/lib/programs/schema";
import {
  buildProgramAssignmentDate,
  buildManualProgramStarterState,
  countProgramAssignments,
  normalizeProgramForPersistence,
  programWeeksToJson,
  type ProgramEditorRecord,
  type ProgramLibrarySnapshot,
  type ProgramSaveRequestBody,
  type ProgramSourceKind,
  type ProgramStatus,
  type ProgramSummary,
} from "@/lib/programs/shared";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
  buildWorkoutEditorRecord,
  tryBuildWorkoutSummary,
  WORKOUT_SELECT,
} from "@/lib/workouts/server";
import type { WorkoutEditorRecord, WorkoutSummary } from "@/lib/workouts/shared";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];
type PlannedWorkoutInstanceInsert =
  Database["public"]["Tables"]["planned_workout_instances"]["Insert"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

export const PROGRAM_SELECT = `
  id,
  user_id,
  source_kind,
  status,
  starts_on,
  title,
  weeks,
  created_at,
  updated_at
`;

export const PLANNED_WORKOUT_INSTANCE_SELECT = `
  id,
  user_id,
  program_id,
  program_week_id,
  program_week_index,
  program_assignment_id,
  workout_id,
  planned_on,
  day_index,
  position,
  status,
  source_kind,
  created_at,
  updated_at
`;

export type ProgramExportSnapshot = {
  program: ProgramEditorRecord;
  workoutsById: Map<string, WorkoutEditorRecord>;
};

export function buildProgramInsert(
  userId: string,
  body: ProgramSaveRequestBody | null | undefined,
  sourceKind: ProgramSourceKind = "manual"
): ProgramInsert {
  const starter = buildManualProgramStarterState();
  const normalized = normalizeProgramForPersistence({
    title: body?.title ?? starter.title,
    startsOn: body?.startsOn ?? starter.startsOn,
    weeks: body?.weeks ?? starter.weeks,
  });

  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    user_id: userId,
    source_kind: sourceKind,
    status: "draft",
    starts_on: normalized.value.startsOn,
    title: normalized.value.title,
    weeks: programWeeksToJson(normalized.value.weeks),
  };
}

export function buildProgramUpdate(body: ProgramSaveRequestBody | null | undefined): ProgramUpdate {
  const normalized = normalizeProgramForPersistence(body);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    starts_on: normalized.value.startsOn,
    title: normalized.value.title,
    weeks: programWeeksToJson(normalized.value.weeks),
  };
}

export function buildProgramEditorRecord(row: ProgramRow): ProgramEditorRecord {
  const normalized = normalizeProgramForPersistence(
    {
      title: row.title,
      startsOn: row.starts_on,
      weeks: Array.isArray(row.weeks) ? (row.weeks as ProgramEditorRecord["weeks"]) : null,
    },
    {
      requireStartsOn: false,
    }
  );

  if (!normalized.ok) {
    throw new Error(`Stored program ${row.id} is invalid: ${normalized.error}`);
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceKind: row.source_kind as ProgramSourceKind,
    status: row.status as ProgramStatus,
    startsOn: normalized.value.startsOn,
    title: normalized.value.title,
    weeks: normalized.value.weeks,
  };
}

export function buildProgramSummary(row: ProgramRow): ProgramSummary {
  const editor = buildProgramEditorRecord(row);
  return {
    id: row.id,
    title: editor.title,
    startsOn: editor.startsOn,
    weekCount: editor.weeks.length,
    assignmentCount: countProgramAssignments(editor.weeks),
    updatedAt: row.updated_at,
    sourceKind: row.source_kind as ProgramSourceKind,
    status: row.status as ProgramStatus,
  };
}

export function buildPlannedWorkoutInstanceInserts(
  userId: string,
  program: ProgramEditorRecord
): PlannedWorkoutInstanceInsert[] {
  if (!program.startsOn) return [];

  return program.weeks.flatMap((week, weekIndex) =>
    week.assignments.map((assignment) => ({
      user_id: userId,
      program_id: program.id,
      program_week_id: week.id,
      program_week_index: weekIndex,
      program_assignment_id: assignment.id,
      workout_id: assignment.workoutId,
      planned_on: buildProgramAssignmentDate(program.startsOn!, weekIndex, assignment.dayIndex),
      day_index: assignment.dayIndex,
      position: assignment.position,
      status: "planned",
      source_kind: "program_assignment",
    }))
  );
}

export async function syncPlannedWorkoutInstancesForProgram(
  supabase: TypedSupabaseClient,
  userId: string,
  program: ProgramEditorRecord
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const nextInstances = buildPlannedWorkoutInstanceInserts(userId, program);
  const existingResult = await supabase
    .from("planned_workout_instances")
    .select("id, program_assignment_id")
    .eq("user_id", userId)
    .eq("program_id", program.id)
    .eq("status", "planned");

  if (isPlannedWorkoutInstanceSchemaMissing(existingResult.error)) {
    return {
      ok: false,
      status: 503,
      error: "Program calendar planning is still syncing in this environment.",
    };
  }

  if (existingResult.error) {
    console.error("[Programs] Could not load planned workout instances for sync", {
      programId: program.id,
      error: existingResult.error,
    });
    return { ok: false, status: 500, error: "Could not update planned calendar sessions." };
  }

  if (nextInstances.length > 0) {
    const upsertResult = await supabase.from("planned_workout_instances").upsert(nextInstances, {
      onConflict: "program_id,program_assignment_id",
    });

    if (isPlannedWorkoutInstanceSchemaMissing(upsertResult.error)) {
      return {
        ok: false,
        status: 503,
        error: "Program calendar planning is still syncing in this environment.",
      };
    }

    if (upsertResult.error) {
      console.error("[Programs] Could not upsert planned workout instances", {
        programId: program.id,
        error: upsertResult.error,
      });
      return { ok: false, status: 500, error: "Could not update planned calendar sessions." };
    }
  }

  const nextAssignmentIds = new Set(
    nextInstances.map((instance) => instance.program_assignment_id)
  );
  const staleInstanceIds = (existingResult.data ?? [])
    .filter((row) => !nextAssignmentIds.has(row.program_assignment_id))
    .map((row) => row.id);

  if (staleInstanceIds.length > 0) {
    const deleteResult = await supabase
      .from("planned_workout_instances")
      .delete()
      .eq("user_id", userId)
      .eq("program_id", program.id)
      .eq("status", "planned")
      .in("id", staleInstanceIds);

    if (isPlannedWorkoutInstanceSchemaMissing(deleteResult.error)) {
      return {
        ok: false,
        status: 503,
        error: "Program calendar planning is still syncing in this environment.",
      };
    }

    if (deleteResult.error) {
      console.error("[Programs] Could not delete stale planned workout instances", {
        programId: program.id,
        error: deleteResult.error,
      });
      return { ok: false, status: 500, error: "Could not update planned calendar sessions." };
    }
  }

  return { ok: true };
}

export async function validateProgramWorkoutOwnership(
  supabase: TypedSupabaseClient,
  userId: string,
  input: ProgramSaveRequestBody | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeProgramForPersistence(input);
  if (!normalized.ok) {
    return normalized;
  }

  const workoutIds = Array.from(
    new Set(
      normalized.value.weeks.flatMap((week) =>
        week.assignments.map((assignment) => assignment.workoutId)
      )
    )
  );

  if (workoutIds.length === 0) {
    return { ok: true };
  }

  const result = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .in("id", workoutIds);

  if (isWorkoutSchemaMissing(result.error)) {
    return {
      ok: false,
      error: "Canonical workout save is still syncing in this environment.",
    };
  }

  if (result.error) {
    console.error("[Programs] Could not validate referenced workouts", result.error);
    return { ok: false, error: "Could not validate scheduled workouts right now." };
  }

  const ownedWorkoutIds = new Set((result.data ?? []).map((row) => row.id));
  const missingWorkoutIds = workoutIds.filter((id) => !ownedWorkoutIds.has(id));
  if (missingWorkoutIds.length > 0) {
    return {
      ok: false,
      error:
        missingWorkoutIds.length === 1
          ? "One scheduled workout could not be found for this account."
          : `${missingWorkoutIds.length} scheduled workouts could not be found for this account.`,
    };
  }

  return { ok: true };
}

export async function loadProgramLibrarySnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  selectedProgramId: string | null
): Promise<ProgramLibrarySnapshot> {
  const [recentProgramsResult, selectedProgramResult, recentWorkoutsResult] = await Promise.all([
    supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(6),
    selectedProgramId
      ? supabase
          .from("programs")
          .select(PROGRAM_SELECT)
          .eq("user_id", userId)
          .eq("id", selectedProgramId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("workouts")
      .select(WORKOUT_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  if (
    isProgramSchemaMissing(recentProgramsResult.error) ||
    isProgramSchemaMissing(selectedProgramResult.error)
  ) {
    return {
      schemaReady: false,
      loadError: null,
      selectedProgram: null,
      selectedProgramMissing: false,
      recentPrograms: [],
      availableWorkouts: [],
      missingWorkoutIds: [],
    };
  }

  const recentWorkouts =
    isWorkoutSchemaMissing(recentWorkoutsResult.error) || recentWorkoutsResult.error
      ? []
      : (recentWorkoutsResult.data ?? [])
          .map((row) => tryBuildWorkoutSummary(row as WorkoutRow, "program-library recent list"))
          .filter((workout): workout is WorkoutSummary => Boolean(workout));

  if (recentProgramsResult.error) {
    console.error("[Programs] Could not load program summaries", recentProgramsResult.error);
    return {
      schemaReady: true,
      loadError: "Could not load saved programs right now.",
      selectedProgram: null,
      selectedProgramMissing: false,
      recentPrograms: [],
      availableWorkouts: recentWorkouts,
      missingWorkoutIds: [],
    };
  }

  if (selectedProgramResult.error) {
    console.error("[Programs] Could not load selected program", selectedProgramResult.error);
    return {
      schemaReady: true,
      loadError: "Could not open that saved program right now.",
      selectedProgram: null,
      selectedProgramMissing: false,
      recentPrograms: recentProgramsResult.data.map(buildProgramSummary),
      availableWorkouts: recentWorkouts,
      missingWorkoutIds: [],
    };
  }

  try {
    const selectedProgram = selectedProgramResult.data
      ? buildProgramEditorRecord(selectedProgramResult.data)
      : null;
    const recentPrograms = recentProgramsResult.data.map(buildProgramSummary);
    const referencedWorkoutIds = Array.from(
      new Set(
        selectedProgram?.weeks.flatMap((week) =>
          week.assignments.map((assignment) => assignment.workoutId)
        ) ?? []
      )
    );
    const knownWorkoutIds = new Set(recentWorkouts.map((workout) => workout.id));
    const missingFromRecent = referencedWorkoutIds.filter((id) => !knownWorkoutIds.has(id));

    let referencedWorkouts: WorkoutSummary[] = [];
    if (missingFromRecent.length > 0) {
      const result = await supabase
        .from("workouts")
        .select(WORKOUT_SELECT)
        .eq("user_id", userId)
        .in("id", missingFromRecent);

      if (!result.error) {
        referencedWorkouts = (result.data ?? [])
          .map((row) =>
            tryBuildWorkoutSummary(row as WorkoutRow, "program-library referenced workouts")
          )
          .filter((workout): workout is WorkoutSummary => Boolean(workout));
      }
    }

    const availableWorkoutMap = new Map<string, WorkoutSummary>();
    for (const workout of [...recentWorkouts, ...referencedWorkouts]) {
      availableWorkoutMap.set(workout.id, workout);
    }

    return {
      schemaReady: true,
      loadError: null,
      selectedProgram,
      selectedProgramMissing: Boolean(selectedProgramId && !selectedProgramResult.data),
      recentPrograms,
      availableWorkouts: Array.from(availableWorkoutMap.values()),
      missingWorkoutIds: referencedWorkoutIds.filter((id) => !availableWorkoutMap.has(id)),
    };
  } catch (error) {
    console.error("[Programs] Stored program payload is invalid", error);
    return {
      schemaReady: true,
      loadError: "A saved program could not be opened because its stored data is invalid.",
      selectedProgram: null,
      selectedProgramMissing: false,
      recentPrograms: [],
      availableWorkouts: recentWorkouts,
      missingWorkoutIds: [],
    };
  }
}

export async function loadProgramExportSnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  programId: string
): Promise<
  { ok: true; value: ProgramExportSnapshot } | { ok: false; status: number; error: string }
> {
  const programResult = await supabase
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("user_id", userId)
    .eq("id", programId)
    .maybeSingle();

  if (isProgramSchemaMissing(programResult.error)) {
    return {
      ok: false,
      status: 503,
      error: "Canonical program export is still syncing in this environment.",
    };
  }

  if (programResult.error) {
    console.error("[Programs] Could not load canonical program export source", programResult.error);
    return { ok: false, status: 500, error: "Could not load this program export right now." };
  }

  if (!programResult.data) {
    return { ok: false, status: 404, error: "Program not found." };
  }

  let program: ProgramEditorRecord;
  try {
    program = buildProgramEditorRecord(programResult.data);
  } catch (error) {
    console.error("[Programs] Stored program payload is invalid for export", error);
    return {
      ok: false,
      status: 500,
      error: "This saved program could not be exported because its stored data is invalid.",
    };
  }

  const workoutIds = Array.from(
    new Set(
      program.weeks.flatMap((week) => week.assignments.map((assignment) => assignment.workoutId))
    )
  );

  if (workoutIds.length === 0) {
    return {
      ok: true,
      value: {
        program,
        workoutsById: new Map<string, WorkoutEditorRecord>(),
      },
    };
  }

  const workoutsResult = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("user_id", userId)
    .in("id", workoutIds);

  if (isWorkoutSchemaMissing(workoutsResult.error)) {
    return {
      ok: false,
      status: 503,
      error: "Canonical workout export is still syncing in this environment.",
    };
  }

  if (workoutsResult.error) {
    console.error("[Programs] Could not load referenced workouts for export", workoutsResult.error);
    return { ok: false, status: 500, error: "Could not load scheduled workouts right now." };
  }

  const workoutsById = new Map<string, WorkoutEditorRecord>();
  for (const row of workoutsResult.data ?? []) {
    try {
      const workout = buildWorkoutEditorRecord(row as WorkoutRow);
      workoutsById.set(workout.id, workout);
    } catch (error) {
      console.error("[Programs] Stored workout payload is invalid for program export", error);
    }
  }

  return {
    ok: true,
    value: {
      program,
      workoutsById,
    },
  };
}
