import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type { ManualWorkoutBuilderMode } from "@/lib/workouts/manual";
import type { WorkoutSourceKind } from "@/lib/workouts/shared";

export const WORKOUT_BUILDER_ANALYTICS_SOURCE = "workout_builder";
export const WORKOUT_BUILDER_ANALYTICS_SURFACE = "my_library_workouts";

export type WorkoutBuilderSaveKind = "first_canonical_save" | "existing_workout_update";

function toFiniteNumberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getWorkoutBuilderMode(environment: SessionDraft["environment"]): ManualWorkoutBuilderMode {
  return environment === "open_water" ? "open_water" : "pool";
}

export function getManualWorkoutBuilderEntry(builderMode: ManualWorkoutBuilderMode): string {
  return builderMode === "open_water" ? "manual-open-water" : "manual-pool";
}

export function buildWorkoutBuilderStartedPayload(input: {
  builderMode: ManualWorkoutBuilderMode;
  hasCssPaceDefault?: boolean;
}) {
  return {
    source: WORKOUT_BUILDER_ANALYTICS_SOURCE,
    surface: WORKOUT_BUILDER_ANALYTICS_SURFACE,
    builderMode: input.builderMode,
    builderEntry: getManualWorkoutBuilderEntry(input.builderMode),
    hasCssPaceDefault: Boolean(input.hasCssPaceDefault),
  };
}

export function buildWorkoutBuilderSavedPayload(input: {
  draft: SessionDraft;
  sourceKind: WorkoutSourceKind;
  saveKind: WorkoutBuilderSaveKind;
}) {
  return {
    source: WORKOUT_BUILDER_ANALYTICS_SOURCE,
    surface: WORKOUT_BUILDER_ANALYTICS_SURFACE,
    sourceKind: input.sourceKind,
    saveKind: input.saveKind,
    builderMode: getWorkoutBuilderMode(input.draft.environment),
    environment: input.draft.environment,
    sessionType: input.draft.sessionType,
    sizeMode: input.draft.sizeMode,
    stepCount: input.draft.steps.length,
    totalDistanceM: toFiniteNumberOrNull(input.draft.totalDistanceM),
    estimatedDurationMin: toFiniteNumberOrNull(input.draft.estimatedDurationMin),
  };
}
