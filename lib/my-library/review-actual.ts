import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PLANNED_WORKOUT_INSTANCE_SELECT,
  PROGRAM_SELECT,
  buildProgramSummary,
} from "@/lib/programs/server";
import {
  isPlannedWorkoutInstanceSchemaMissing,
  isProgramSchemaMissing,
} from "@/lib/programs/schema";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
  WORKOUT_SELECT,
  buildWorkoutEditorRecord,
  tryBuildWorkoutSummary,
} from "@/lib/workouts/server";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  type SessionDraft,
  type SessionDraftStep,
} from "@/lib/session-generator-v1/shared";
import {
  normalizeReviewActualSessionDraft,
  readReviewActualSessionDraft,
} from "@/lib/my-library/review-actual-session";
import type { Database, Json } from "@/types/database";
import {
  COMPLETED_ACTIVITY_EVENT_SELECT,
  isCompletedActivityEventDoneOutcome,
  isCompletedActivityEventSchemaMissing,
  isManualCompletedActivityEvent,
  normalizeCompletedActivityEventOutcome,
  type CompletedActivityEventOutcome,
  type CompletedActivityEventRow,
} from "@/lib/my-library/completed-activity-events";

type TypedSupabaseClient = SupabaseClient<Database>;
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

export type ReviewActualEditorEvent = {
  id: string;
  plannedWorkoutInstanceId: string;
  workoutId: string | null;
  programId: string | null;
  sourceKind: "manual";
  outcome: CompletedActivityEventOutcome;
  isDoneOutcome: boolean;
  completedOn: string;
  actualStartedAt: string | null;
  actualDurationSeconds: number | null;
  actualDistanceM: number | null;
  actualEnvironment: string | null;
  actualPoolLengthM: number | null;
  actualPoolLengthUnit: string | null;
  actualSessionDraft: SessionDraft | null;
  correctionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewActualEditorPlan = {
  plannedWorkoutInstanceId: string;
  plannedOn: string | null;
  plannedUpdatedAt: string | null;
  programId: string | null;
  programTitle: string | null;
  workoutId: string | null;
  workoutTitle: string | null;
  workout: ReviewActualPlanWorkout | null;
  sourceWorkoutMissing: boolean;
  sourceProgramMissing: boolean;
};

export type ReviewActualPlanWorkout = {
  id: string;
  title: string;
  environment: string | null;
  totalDistanceM: number | null;
  estimatedDurationMin: number | null;
  poolLengthM: number | null;
  poolLengthUnit: string | null;
  draft: SessionDraft | null;
  previewSections: ReviewActualPlanStepSection[];
};

export type ReviewActualPlanStepSection = {
  key: string;
  title: string;
  category: SessionDraftStep["category"];
  rows: ReviewActualPlanStepRow[];
};

export type ReviewActualPlanStepRow = {
  key: string;
  text: string;
  secondaryText: string | null;
};

export type ReviewActualEditorModel =
  | {
      status: "ready";
      plan: ReviewActualEditorPlan;
      event: ReviewActualEditorEvent;
      returnHref: string;
    }
  | {
      status: "missing_actual";
      returnHref: string;
    }
  | {
      status: "review_required";
      eventId: string | null;
      sourceKind: string;
      outcome: string;
      returnHref: string;
    }
  | {
      status: "orphan_actual";
      event: ReviewActualEditorEvent;
      returnHref: string;
    }
  | {
      status: "not_found";
      returnHref: string;
    }
  | {
      status: "schema_missing";
      message: string;
      returnHref: string;
    }
  | {
      status: "error";
      message: string;
      returnHref: string;
    };

type PlannedSnapshotWorkout = {
  id?: unknown;
  title?: unknown;
  environment?: unknown;
  totalDistanceM?: unknown;
  estimatedDurationMin?: unknown;
  poolLengthM?: unknown;
  poolLengthUnit?: unknown;
  draft?: unknown;
  previewSections?: unknown;
};

type PlannedSnapshot = {
  workout?: PlannedSnapshotWorkout;
};

function asObject(value: Json): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getPlannedSnapshot(row: CompletedActivityEventRow): PlannedSnapshot | null {
  const snapshot = asObject(row.planned_snapshot);
  if (!snapshot) return null;
  const workout = asObject(snapshot.workout as Json);
  return workout ? { workout } : null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeStepCategory(value: unknown): SessionDraftStep["category"] {
  return SESSION_DRAFT_STEP_CATEGORIES.includes(value as SessionDraftStep["category"])
    ? (value as SessionDraftStep["category"])
    : "main";
}

function buildPreviewSections(value: unknown, fallbackKeyPrefix: string) {
  if (!Array.isArray(value)) return [];

  const sections: ReviewActualPlanStepSection[] = [];

  value.forEach((section, sectionIndex) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) return;
    const sectionRecord = section as Record<string, unknown>;
    const rows = Array.isArray(sectionRecord.rows) ? sectionRecord.rows : [];
    const normalizedRows: ReviewActualPlanStepRow[] = rows
      .map((row, rowIndex) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return null;
        const rowRecord = row as Record<string, unknown>;
        const text = getString(rowRecord.text);
        if (!text) return null;

        return {
          key:
            getString(rowRecord.key) ??
            `${fallbackKeyPrefix}-planned-section-${sectionIndex}-row-${rowIndex}`,
          text,
          secondaryText: getString(rowRecord.secondaryText),
        };
      })
      .filter((row): row is ReviewActualPlanStepRow => Boolean(row));

    if (normalizedRows.length === 0) return;

    sections.push({
      key: getString(sectionRecord.key) ?? `${fallbackKeyPrefix}-planned-section-${sectionIndex}`,
      title: getString(sectionRecord.title) ?? "Workout",
      category: normalizeStepCategory(sectionRecord.category),
      rows: normalizedRows,
    });
  });

  return sections;
}

function buildFallbackWorkoutFromSnapshot(
  row: CompletedActivityEventRow
): ReviewActualPlanWorkout | null {
  const workout = getPlannedSnapshot(row)?.workout;
  if (!workout) return null;

  const id = getString(workout.id) ?? row.workout_id;
  const title = getString(workout.title);
  if (!id || !title) return null;
  const draftResult = normalizeReviewActualSessionDraft(workout.draft);

  return {
    id,
    title,
    environment:
      workout.environment === "pool" || workout.environment === "open_water"
        ? workout.environment
        : null,
    poolLengthM: getNumber(workout.poolLengthM),
    poolLengthUnit:
      workout.poolLengthUnit === "yd" || workout.poolLengthUnit === "m"
        ? workout.poolLengthUnit
        : null,
    totalDistanceM: getNumber(workout.totalDistanceM),
    estimatedDurationMin: getNumber(workout.estimatedDurationMin),
    draft: draftResult.ok ? draftResult.draft : null,
    previewSections: buildPreviewSections(workout.previewSections, id),
  };
}

function buildPlanWorkoutSummary(row: WorkoutRow | null): ReviewActualPlanWorkout | null {
  if (!row) return null;
  const workout = tryBuildWorkoutSummary(row, "review actual editor");
  if (!workout) return null;
  let draft: SessionDraft | null = null;
  try {
    draft = buildWorkoutEditorRecord(row).draft;
  } catch (error) {
    console.warn("[ReviewActualEditor] Could not adapt source workout draft", {
      workoutId: row.id,
      error,
    });
  }

  return {
    id: workout.id,
    title: workout.title,
    environment: workout.environment,
    totalDistanceM: workout.totalDistanceM,
    estimatedDurationMin: workout.estimatedDurationMin,
    poolLengthM: workout.poolLengthM,
    poolLengthUnit: workout.poolLengthUnit ?? null,
    draft,
    previewSections: buildPreviewSections(workout.previewSections, workout.id),
  };
}

function buildEvent(row: CompletedActivityEventRow): ReviewActualEditorEvent | null {
  if (!isManualCompletedActivityEvent(row)) return null;
  const outcome = normalizeCompletedActivityEventOutcome(row.outcome);
  if (outcome === "unmapped") return null;

  return {
    id: row.id,
    plannedWorkoutInstanceId: row.planned_workout_instance_id,
    workoutId: row.workout_id,
    programId: row.program_id,
    sourceKind: "manual",
    outcome,
    isDoneOutcome: isCompletedActivityEventDoneOutcome(outcome),
    completedOn: row.completed_on,
    actualStartedAt: row.actual_started_at,
    actualDurationSeconds: row.actual_duration_seconds,
    actualDistanceM: row.actual_distance_m,
    actualEnvironment: row.actual_environment,
    actualPoolLengthM: row.actual_pool_length_m,
    actualPoolLengthUnit: row.actual_pool_length_unit,
    actualSessionDraft: readReviewActualSessionDraft(row.actual_session_snapshot),
    correctionNote: row.correction_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildPlan(input: {
  instance: PlannedWorkoutInstanceRow;
  event: CompletedActivityEventRow;
  program: ProgramRow | null;
  workout: WorkoutRow | null;
}): ReviewActualEditorPlan {
  const workoutSummary = buildPlanWorkoutSummary(input.workout);
  const snapshotWorkout = buildFallbackWorkoutFromSnapshot(input.event);

  return {
    plannedWorkoutInstanceId: input.instance.id,
    plannedOn: input.instance.planned_on,
    plannedUpdatedAt: input.instance.updated_at,
    programId: input.instance.program_id,
    programTitle: input.program ? buildProgramSummary(input.program).title : null,
    workoutId: input.instance.workout_id,
    workoutTitle: workoutSummary?.title ?? snapshotWorkout?.title ?? null,
    workout: workoutSummary ?? snapshotWorkout,
    sourceWorkoutMissing: Boolean(input.instance.workout_id && !input.workout),
    sourceProgramMissing: !input.program,
  };
}

export async function loadReviewActualEditorModel(
  supabase: TypedSupabaseClient,
  userId: string,
  input: {
    plannedWorkoutInstanceId: string;
    returnHref: string;
  }
): Promise<ReviewActualEditorModel> {
  const completionResult = await supabase
    .from("completed_activity_events")
    .select(COMPLETED_ACTIVITY_EVENT_SELECT)
    .eq("user_id", userId)
    .eq("planned_workout_instance_id", input.plannedWorkoutInstanceId);

  if (isCompletedActivityEventSchemaMissing(completionResult.error)) {
    return {
      status: "schema_missing",
      message: "Completed swim history is still syncing in this environment.",
      returnHref: input.returnHref,
    };
  }

  if (completionResult.error) {
    console.error("[ReviewActualEditor] Could not load actual history", completionResult.error);
    return {
      status: "error",
      message: "Could not load this actual right now.",
      returnHref: input.returnHref,
    };
  }

  const completionRows = (completionResult.data ?? []) as CompletedActivityEventRow[];
  if (completionRows.length === 0) {
    return { status: "missing_actual", returnHref: input.returnHref };
  }

  if (completionRows.length > 1) {
    const first = completionRows[0];
    return {
      status: "review_required",
      eventId: first?.id ?? null,
      sourceKind: first?.source_kind ?? "unknown",
      outcome: first?.outcome ?? "unknown",
      returnHref: input.returnHref,
    };
  }

  const completionRow = completionRows[0] as CompletedActivityEventRow;
  const event = buildEvent(completionRow);
  if (!event) {
    return {
      status: "review_required",
      eventId: completionRow.id,
      sourceKind: completionRow.source_kind,
      outcome: completionRow.outcome,
      returnHref: input.returnHref,
    };
  }

  const instanceResult = await supabase
    .from("planned_workout_instances")
    .select(PLANNED_WORKOUT_INSTANCE_SELECT)
    .eq("user_id", userId)
    .eq("id", input.plannedWorkoutInstanceId)
    .maybeSingle();

  if (isPlannedWorkoutInstanceSchemaMissing(instanceResult.error)) {
    return {
      status: "schema_missing",
      message: "Program calendar planning is still syncing in this environment.",
      returnHref: input.returnHref,
    };
  }

  if (instanceResult.error) {
    console.error("[ReviewActualEditor] Could not load planned instance", instanceResult.error);
    return {
      status: "error",
      message: "Could not load this planned session right now.",
      returnHref: input.returnHref,
    };
  }

  if (!instanceResult.data) {
    return {
      status: "orphan_actual",
      event,
      returnHref: input.returnHref,
    };
  }

  const instance = instanceResult.data as PlannedWorkoutInstanceRow;
  const [programResult, workoutResult] = await Promise.all([
    supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("user_id", userId)
      .eq("id", instance.program_id)
      .maybeSingle(),
    instance.workout_id
      ? supabase
          .from("workouts")
          .select(WORKOUT_SELECT)
          .eq("user_id", userId)
          .eq("id", instance.workout_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (isProgramSchemaMissing(programResult.error)) {
    return {
      status: "schema_missing",
      message: "Program save is still syncing in this environment.",
      returnHref: input.returnHref,
    };
  }

  if (isWorkoutSchemaMissing(workoutResult.error)) {
    return {
      status: "schema_missing",
      message: "Canonical workout save is still syncing in this environment.",
      returnHref: input.returnHref,
    };
  }

  if (programResult.error || workoutResult.error) {
    console.error("[ReviewActualEditor] Could not load source references", {
      programError: programResult.error,
      workoutError: workoutResult.error,
    });
    return {
      status: "error",
      message: "Could not load this actual's source details right now.",
      returnHref: input.returnHref,
    };
  }

  return {
    status: "ready",
    plan: buildPlan({
      instance,
      event: completionRow,
      program: (programResult.data as ProgramRow | null) ?? null,
      workout: (workoutResult.data as WorkoutRow | null) ?? null,
    }),
    event,
    returnHref: input.returnHref,
  };
}
