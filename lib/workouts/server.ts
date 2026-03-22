import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
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

export function buildWorkoutEditorRecord(row: WorkoutRow): WorkoutEditorRecord {
  const draft = normalizeSessionDraftForWorkoutPersistence({
    version: 1,
    status: "draft",
    generatorKind: row.generator_kind as SessionDraft["generatorKind"],
    createdAt: row.generated_at,
    sourceFingerprint: row.source_fingerprint,
    title: row.title,
    titleSuggestions: normalizeTextArray(row.title_suggestions),
    description: row.description,
    environment: row.environment as SessionDraft["environment"],
    poolLengthM: normalizePoolLength(row.pool_length_m),
    sessionType: row.session_type as SessionDraft["sessionType"],
    effort: row.effort as SessionDraft["effort"],
    sizeMode: row.size_mode as SessionDraft["sizeMode"],
    targetDistanceM: row.target_distance_m,
    targetTimeMin: row.target_time_min,
    totalDistanceM: row.total_distance_m,
    estimatedDurationMin: row.estimated_duration_min,
    basePaceSecondsPer100m: row.base_pace_seconds_per_100,
    usedCssPaceLabel: row.used_css_pace_label,
    allowedStrokes: normalizeTextArray(row.allowed_strokes) as SessionDraft["allowedStrokes"],
    equipmentAllowlist: normalizeTextArray(
      row.equipment_allowlist
    ) as SessionDraft["equipmentAllowlist"],
    focusText: row.focus_text,
    goalTitle: row.goal_title,
    constraintText: row.constraint_text,
    warnings: normalizeTextArray(row.warnings),
    steps: Array.isArray(row.steps) ? (row.steps as SessionDraft["steps"]) : [],
  });

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
  return {
    id: row.id,
    title: row.title,
    environment: row.environment as SessionDraft["environment"],
    poolLengthM: normalizePoolLength(row.pool_length_m),
    sessionType: row.session_type as SessionDraft["sessionType"],
    effort: row.effort as SessionDraft["effort"],
    totalDistanceM: row.total_distance_m,
    estimatedDurationMin: row.estimated_duration_min,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    sourceKind: row.source_kind as WorkoutSourceKind,
    status: row.status as WorkoutStatus,
  };
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
    return {
      schemaReady: true,
      loadError: "Could not open that saved workout right now.",
      selectedWorkout: null,
      selectedWorkoutMissing: false,
      recentWorkouts: recentResult.data.map(buildWorkoutSummary),
    };
  }

  try {
    return {
      schemaReady: true,
      loadError: null,
      selectedWorkout: selectedResult.data ? buildWorkoutEditorRecord(selectedResult.data) : null,
      selectedWorkoutMissing: Boolean(selectedWorkoutId && !selectedResult.data),
      recentWorkouts: recentResult.data.map(buildWorkoutSummary),
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
  if (value === null) return null;
  return value === 12.5 || value === 25 || value === 50 ? value : null;
}
