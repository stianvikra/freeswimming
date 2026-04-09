import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_SIZE_MODES,
  normalizeSessionDraftPoolLength,
  resolveSessionDraftPoolLengthUnit,
  type SessionDraft,
} from "@/lib/session-generator-v1/shared";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
  buildWorkoutSummaryPreviewText,
  normalizeSessionDraftForWorkoutPersistence,
  type WorkoutEditorRecord,
  type WorkoutLibrarySnapshot,
  type WorkoutSourceKind,
  type WorkoutStatus,
  type WorkoutSummary,
} from "@/lib/workouts/shared";
import type { Database, Json } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];
type WorkoutInsert = Database["public"]["Tables"]["workouts"]["Insert"];
type WorkoutUpdate = Database["public"]["Tables"]["workouts"]["Update"];

export const WORKOUT_SELECT = `
  id,
  user_id,
  source_kind,
  status,
  generator_kind,
  source_fingerprint,
  title,
  title_suggestions,
  description,
  environment,
  pool_length_m,
  pool_length_unit,
  session_type,
  effort,
  size_mode,
  target_distance_m,
  target_time_min,
  total_distance_m,
  estimated_duration_min,
  base_pace_seconds_per_100,
  used_css_pace_label,
  allowed_strokes,
  equipment_allowlist,
  focus_text,
  goal_title,
  constraint_text,
  warnings,
  steps,
  generated_at,
  accepted_at,
  created_at,
  updated_at
`;

export function buildWorkoutInsert(
  userId: string,
  draft: SessionDraft | null | undefined,
  sourceKind: WorkoutSourceKind = "ai_session_v1"
): WorkoutInsert {
  const normalized = normalizeSessionDraftForWorkoutPersistence(draft);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    user_id: userId,
    source_kind: sourceKind,
    status: "accepted",
    generator_kind: normalized.value.generatorKind,
    source_fingerprint: normalized.value.sourceFingerprint,
    title: normalized.value.title,
    title_suggestions: normalized.value.titleSuggestions,
    description: normalized.value.description,
    environment: normalized.value.environment,
    pool_length_m: normalized.value.poolLengthM,
    pool_length_unit: normalized.value.poolLengthUnit ?? "m",
    session_type: normalized.value.sessionType,
    effort: normalized.value.effort,
    size_mode: normalized.value.sizeMode,
    target_distance_m: normalized.value.targetDistanceM,
    target_time_min: normalized.value.targetTimeMin,
    total_distance_m: normalized.value.totalDistanceM,
    estimated_duration_min: normalized.value.estimatedDurationMin,
    base_pace_seconds_per_100: normalized.value.basePaceSecondsPer100m,
    used_css_pace_label: normalized.value.usedCssPaceLabel,
    allowed_strokes: normalized.value.allowedStrokes,
    equipment_allowlist: normalized.value.equipmentAllowlist,
    focus_text: normalized.value.focusText,
    goal_title: normalized.value.goalTitle,
    constraint_text: normalized.value.constraintText,
    warnings: normalized.value.warnings,
    steps: normalized.value.steps as unknown as Json,
    generated_at: normalized.value.createdAt,
    accepted_at: new Date().toISOString(),
  };
}

export function buildWorkoutUpdate(draft: SessionDraft | null | undefined): WorkoutUpdate {
  const normalized = normalizeSessionDraftForWorkoutPersistence(draft);
  if (!normalized.ok) {
    throw new Error(normalized.error);
  }

  return {
    title: normalized.value.title,
    title_suggestions: normalized.value.titleSuggestions,
    description: normalized.value.description,
    environment: normalized.value.environment,
    pool_length_m: normalized.value.poolLengthM,
    pool_length_unit: normalized.value.poolLengthUnit ?? "m",
    session_type: normalized.value.sessionType,
    effort: normalized.value.effort,
    size_mode: normalized.value.sizeMode,
    target_distance_m: normalized.value.targetDistanceM,
    target_time_min: normalized.value.targetTimeMin,
    total_distance_m: normalized.value.totalDistanceM,
    estimated_duration_min: normalized.value.estimatedDurationMin,
    base_pace_seconds_per_100: normalized.value.basePaceSecondsPer100m,
    used_css_pace_label: normalized.value.usedCssPaceLabel,
    source_fingerprint: normalized.value.sourceFingerprint,
    focus_text: normalized.value.focusText,
    goal_title: normalized.value.goalTitle,
    constraint_text: normalized.value.constraintText,
    warnings: normalized.value.warnings,
    allowed_strokes: normalized.value.allowedStrokes,
    equipment_allowlist: normalized.value.equipmentAllowlist,
    steps: normalized.value.steps as unknown as Json,
    generated_at: normalized.value.createdAt,
  };
}

function inferStoredWorkoutSizeMode(row: WorkoutRow): SessionDraft["sizeMode"] {
  if (SESSION_GENERATOR_SIZE_MODES.includes(row.size_mode as SessionDraft["sizeMode"])) {
    return row.size_mode as SessionDraft["sizeMode"];
  }

  if (typeof row.target_time_min === "number" && row.target_time_min > 0) {
    return "estimated_time";
  }

  return "distance";
}

function buildStoredWorkoutDraftInput(row: WorkoutRow): SessionDraft {
  const titleSuggestions = normalizeTextArray(row.title_suggestions);
  const allowedStrokes = normalizeTextArray(row.allowed_strokes) as SessionDraft["allowedStrokes"];
  const sizeMode = inferStoredWorkoutSizeMode(row);

  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: row.generated_at ?? row.accepted_at ?? row.created_at ?? row.updated_at,
    sourceFingerprint: row.source_fingerprint ?? `legacy-${row.id}`,
    title: row.title,
    titleSuggestions: titleSuggestions.length > 0 ? titleSuggestions : [row.title],
    description: row.description ?? "",
    environment: SESSION_GENERATOR_ENVIRONMENTS.includes(
      row.environment as SessionDraft["environment"]
    )
      ? (row.environment as SessionDraft["environment"])
      : "pool",
    poolLengthUnit: resolveSessionDraftPoolLengthUnit(row.pool_length_unit),
    poolLengthM: normalizePoolLength(row.pool_length_m),
    sessionType: SESSION_GENERATOR_SESSION_TYPES.includes(row.session_type as SessionDraft["sessionType"])
      ? (row.session_type as SessionDraft["sessionType"])
      : "endurance",
    effort: SESSION_GENERATOR_EFFORT_PRESETS.includes(row.effort as SessionDraft["effort"])
      ? (row.effort as SessionDraft["effort"])
      : "moderate",
    sizeMode,
    targetDistanceM:
      sizeMode === "distance" ? (row.target_distance_m ?? row.total_distance_m) : null,
    targetTimeMin:
      sizeMode === "estimated_time" ? (row.target_time_min ?? row.estimated_duration_min) : null,
    totalDistanceM: row.total_distance_m,
    estimatedDurationMin: row.estimated_duration_min,
    basePaceSecondsPer100m: row.base_pace_seconds_per_100 ?? 120,
    usedCssPaceLabel: row.used_css_pace_label,
    allowedStrokes: allowedStrokes.length > 0 ? allowedStrokes : ["freestyle"],
    equipmentAllowlist: normalizeTextArray(
      row.equipment_allowlist
    ) as SessionDraft["equipmentAllowlist"],
    focusText: row.focus_text,
    goalTitle: row.goal_title,
    constraintText: row.constraint_text,
    warnings: normalizeTextArray(row.warnings),
    steps: Array.isArray(row.steps) ? (row.steps as SessionDraft["steps"]) : [],
  };
}

export function buildWorkoutEditorRecord(row: WorkoutRow): WorkoutEditorRecord {
  const draft = normalizeSessionDraftForWorkoutPersistence(buildStoredWorkoutDraftInput(row));

  if (!draft.ok) {
    throw new Error(`Stored workout ${row.id} is invalid: ${draft.error}`);
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    sourceKind: row.source_kind as WorkoutSourceKind,
    status: row.status as WorkoutStatus,
    draft: draft.value,
  };
}

export function buildWorkoutSummary(row: WorkoutRow): WorkoutSummary {
  const draft = buildWorkoutEditorRecord(row).draft;

  return {
    id: row.id,
    title: draft.title,
    environment: draft.environment,
    poolLengthUnit: draft.poolLengthUnit,
    poolLengthM: draft.poolLengthM,
    sessionType: draft.sessionType,
    effort: draft.effort,
    totalDistanceM: draft.totalDistanceM,
    estimatedDurationMin: draft.estimatedDurationMin,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    sourceKind: row.source_kind as WorkoutSourceKind,
    status: row.status as WorkoutStatus,
    previewText: buildWorkoutSummaryPreviewText(draft),
  };
}

export function tryBuildWorkoutSummary(
  row: WorkoutRow,
  contextLabel: string
): WorkoutSummary | null {
  try {
    return buildWorkoutSummary(row);
  } catch (error) {
    console.error(`[Workouts] Skipping invalid stored workout summary in ${contextLabel}`, {
      workoutId: row.id,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

function tryBuildWorkoutEditorRecord(
  row: WorkoutRow,
  contextLabel: string
): WorkoutEditorRecord | null {
  try {
    return buildWorkoutEditorRecord(row);
  } catch (error) {
    console.error(`[Workouts] Stored workout payload is invalid in ${contextLabel}`, {
      workoutId: row.id,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
}

export async function loadWorkoutLibrarySnapshot(
  supabase: TypedSupabaseClient,
  userId: string,
  selectedWorkoutId: string | null
): Promise<WorkoutLibrarySnapshot> {
  const [recentResult, selectedResult] = await Promise.all([
    supabase
      .from("workouts")
      .select(WORKOUT_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(6),
    selectedWorkoutId
      ? supabase
          .from("workouts")
          .select(WORKOUT_SELECT)
          .eq("user_id", userId)
          .eq("id", selectedWorkoutId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (isWorkoutSchemaMissing(recentResult.error) || isWorkoutSchemaMissing(selectedResult.error)) {
    return {
      schemaReady: false,
      loadError: null,
      selectedWorkout: null,
      selectedWorkoutMissing: false,
      recentWorkouts: [],
    };
  }

  if (recentResult.error) {
    console.error("[Workouts] Could not load workout summaries", recentResult.error);
    return {
      schemaReady: true,
      loadError: "Could not load saved workouts right now.",
      selectedWorkout: null,
      selectedWorkoutMissing: false,
      recentWorkouts: [],
    };
  }

  if (selectedResult.error) {
    console.error("[Workouts] Could not load selected workout", selectedResult.error);
    const recentWorkouts = (recentResult.data ?? [])
      .map((row) => tryBuildWorkoutSummary(row as WorkoutRow, "workout-library recent list"))
      .filter((workout): workout is WorkoutSummary => Boolean(workout));
    return {
      schemaReady: true,
      loadError: "Could not open that saved workout right now.",
      selectedWorkout: null,
      selectedWorkoutMissing: false,
      recentWorkouts,
    };
  }

  try {
    const recentWorkouts = (recentResult.data ?? [])
      .map((row) => tryBuildWorkoutSummary(row as WorkoutRow, "workout-library recent list"))
      .filter((workout): workout is WorkoutSummary => Boolean(workout));
    const selectedWorkout = selectedResult.data
      ? tryBuildWorkoutEditorRecord(selectedResult.data, "selected workout")
      : null;
    const invalidSelectedWorkout = Boolean(selectedResult.data && !selectedWorkout);

    return {
      schemaReady: true,
      loadError: invalidSelectedWorkout
        ? "This saved workout could not be opened because its stored data is invalid."
        : null,
      selectedWorkout,
      selectedWorkoutMissing: Boolean(selectedWorkoutId && (!selectedResult.data || invalidSelectedWorkout)),
      recentWorkouts,
    };
  } catch (error) {
    console.error("[Workouts] Stored workout payload is invalid", error);
    return {
      schemaReady: true,
      loadError: "A saved workout could not be opened because its stored data is invalid.",
      selectedWorkout: null,
      selectedWorkoutMissing: false,
      recentWorkouts: [],
    };
  }
}

function normalizeTextArray(value: string[] | null) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function normalizePoolLength(value: number | null): SessionDraft["poolLengthM"] {
  return normalizeSessionDraftPoolLength(value);
}
