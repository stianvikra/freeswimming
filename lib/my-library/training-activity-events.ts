import type { Json, Database } from "@/types/database";
import {
  type CompletedActivityEventRow,
  normalizeCompletedActivityEventOutcome,
} from "@/lib/my-library/completed-activity-events";

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export const TRAINING_ACTIVITY_EVENT_SOURCE_KINDS = [
  "manual",
  "provider_evidence",
  "system_reconciled",
] as const;
export const TRAINING_ACTIVITY_EVENT_ACTIVITY_CATEGORIES = ["workout"] as const;
export const TRAINING_ACTIVITY_EVENT_CANONICAL_SPORTS = [
  "swimming",
  "running",
  "cycling",
  "walking",
  "strength_training",
  "yoga",
  "mobility",
  "dryland",
  "unknown",
] as const;
export const TRAINING_ACTIVITY_EVENT_CANONICAL_SUB_SPORTS = [
  "pool_swim",
  "open_water_swim",
  "outdoor_run",
  "treadmill_run",
  "road_cycling",
  "indoor_cycling",
  "walk",
  "hike",
  "strength",
  "yoga",
  "mobility",
  "dryland",
  "unknown",
] as const;
export const TRAINING_ACTIVITY_EVENT_MAPPING_STATUSES = [
  "trusted",
  "needs_review",
  "unmapped",
  "unsupported",
  "duplicate",
  "orphaned",
  "schema_drift",
] as const;
export const TRAINING_ACTIVITY_EVENT_OUTCOMES = [
  "completed_as_planned",
  "completed_different",
  "partial",
  "completed_on_another_day",
  "cancelled_as_actual",
  "needs_review",
  "unmapped",
  "unsupported",
] as const;
export const TRAINING_ACTIVITY_EVENT_TIMEZONE_SOURCES = [
  "provider",
  "manual",
  "user_profile",
  "unknown",
] as const;
export const TRAINING_ACTIVITY_EVENT_DETAIL_KINDS = [
  "none",
  "swim_session_snapshot",
  "provider_summary",
  "unsupported_detail",
] as const;

export type TrainingActivityEventRow =
  Database["public"]["Tables"]["training_activity_events"]["Row"];
export type TrainingActivityEventSourceKind = (typeof TRAINING_ACTIVITY_EVENT_SOURCE_KINDS)[number];
export type TrainingActivityEventActivityCategory =
  (typeof TRAINING_ACTIVITY_EVENT_ACTIVITY_CATEGORIES)[number];
export type TrainingActivityEventCanonicalSport =
  (typeof TRAINING_ACTIVITY_EVENT_CANONICAL_SPORTS)[number];
export type TrainingActivityEventCanonicalSubSport =
  (typeof TRAINING_ACTIVITY_EVENT_CANONICAL_SUB_SPORTS)[number];
export type TrainingActivityEventMappingStatus =
  (typeof TRAINING_ACTIVITY_EVENT_MAPPING_STATUSES)[number];
export type TrainingActivityEventOutcome = (typeof TRAINING_ACTIVITY_EVENT_OUTCOMES)[number];
export type TrainingActivityEventTimezoneSource =
  (typeof TRAINING_ACTIVITY_EVENT_TIMEZONE_SOURCES)[number];
export type TrainingActivityEventDetailKind = (typeof TRAINING_ACTIVITY_EVENT_DETAIL_KINDS)[number];

export type TrainingActivityEventSourceKindSelection = TrainingActivityEventSourceKind | "unmapped";
export type TrainingActivityEventActivityCategorySelection =
  | TrainingActivityEventActivityCategory
  | "unmapped";
export type TrainingActivityEventCanonicalSportSelection =
  | TrainingActivityEventCanonicalSport
  | "unmapped";
export type TrainingActivityEventCanonicalSubSportSelection =
  | TrainingActivityEventCanonicalSubSport
  | "unmapped";
export type TrainingActivityEventMappingStatusSelection =
  | TrainingActivityEventMappingStatus
  | "unmapped";
export type TrainingActivityEventOutcomeSelection = TrainingActivityEventOutcome | "unmapped";
export type TrainingActivityEventTimezoneSourceSelection =
  | TrainingActivityEventTimezoneSource
  | "unmapped";
export type TrainingActivityEventDetailKindSelection = TrainingActivityEventDetailKind | "unmapped";

export type TrainingActivityHistoryView = {
  id: string;
  compatibilitySource: "training_activity_events" | "completed_activity_events";
  sourceKind: TrainingActivityEventSourceKindSelection;
  activityCategory: TrainingActivityEventActivityCategorySelection;
  canonicalSport: TrainingActivityEventCanonicalSportSelection;
  canonicalSubSport: TrainingActivityEventCanonicalSubSportSelection;
  mappingStatus: TrainingActivityEventMappingStatusSelection;
  outcome: TrainingActivityEventOutcomeSelection;
  activityStartedAt: string | null;
  activityEndedAt: string | null;
  activityLocalDate: string | null;
  activityTimezone: string | null;
  timezoneSource: TrainingActivityEventTimezoneSourceSelection;
  durationSeconds: number | null;
  distanceM: number | null;
  elevationM: number | null;
  energyKcal: number | null;
  averageHeartRateBpm: number | null;
  trainingLoad: number | null;
  plannedWorkoutInstanceId: string | null;
  workoutId: string | null;
  programId: string | null;
  completedActivityEventId: string | null;
  providerActivityEvidenceId: string | null;
  detailKind: TrainingActivityEventDetailKindSelection;
  detailSnapshot: Json;
  supportDiagnostics: Json;
  createdAt: string;
  updatedAt: string;
};

export const TRAINING_ACTIVITY_EVENT_SELECT = `
  id,
  user_id,
  source_kind,
  activity_category,
  canonical_sport,
  canonical_sub_sport,
  mapping_status,
  outcome,
  activity_started_at,
  activity_ended_at,
  activity_local_date,
  activity_timezone,
  timezone_source,
  duration_seconds,
  distance_m,
  elevation_m,
  energy_kcal,
  average_heart_rate_bpm,
  training_load,
  planned_workout_instance_id,
  workout_id,
  program_id,
  completed_activity_event_id,
  provider_activity_evidence_id,
  detail_kind,
  detail_snapshot,
  support_diagnostics,
  created_at,
  updated_at
`;

function normalizeOneOf<const T extends readonly string[]>(
  values: T,
  value: unknown,
  fallback: T[number] | "unmapped"
) {
  return values.includes(value as T[number]) ? (value as T[number]) : fallback;
}

function normalizeOptionalJsonObject(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Json;
}

export function normalizeTrainingActivityEventSourceKind(
  value: unknown
): TrainingActivityEventSourceKindSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_SOURCE_KINDS, value, "unmapped");
}

export function normalizeTrainingActivityEventActivityCategory(
  value: unknown
): TrainingActivityEventActivityCategorySelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_ACTIVITY_CATEGORIES, value, "unmapped");
}

export function normalizeTrainingActivityEventCanonicalSport(
  value: unknown
): TrainingActivityEventCanonicalSportSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_CANONICAL_SPORTS, value, "unmapped");
}

export function normalizeTrainingActivityEventCanonicalSubSport(
  value: unknown
): TrainingActivityEventCanonicalSubSportSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_CANONICAL_SUB_SPORTS, value, "unmapped");
}

export function normalizeTrainingActivityEventMappingStatus(
  value: unknown
): TrainingActivityEventMappingStatusSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_MAPPING_STATUSES, value, "unmapped");
}

export function normalizeTrainingActivityEventOutcome(
  value: unknown
): TrainingActivityEventOutcomeSelection {
  if (value === "completed") return "completed_as_planned";
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_OUTCOMES, value, "unmapped");
}

export function normalizeTrainingActivityEventTimezoneSource(
  value: unknown
): TrainingActivityEventTimezoneSourceSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_TIMEZONE_SOURCES, value, "unknown");
}

export function normalizeTrainingActivityEventDetailKind(
  value: unknown
): TrainingActivityEventDetailKindSelection {
  return normalizeOneOf(TRAINING_ACTIVITY_EVENT_DETAIL_KINDS, value, "unmapped");
}

export function isTrainingActivityEventSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;

  if (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205"
  ) {
    return true;
  }

  if (typeof error.code === "string" && error.code.length > 0) {
    return false;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    blob.includes("training_activity_events") ||
    blob.includes("canonical_sport") ||
    blob.includes("canonical_sub_sport") ||
    blob.includes("mapping_status") ||
    blob.includes("activity_local_date") ||
    blob.includes("timezone_source") ||
    blob.includes("detail_snapshot") ||
    blob.includes("support_diagnostics")
  );
}

function inferSwimSubSportFromCompletedEvent(
  row: Pick<CompletedActivityEventRow, "actual_environment">
): TrainingActivityEventCanonicalSubSport {
  if (row.actual_environment === "pool") return "pool_swim";
  if (row.actual_environment === "open_water") return "open_water_swim";
  return "unknown";
}

function buildSafeMappingStatus(input: {
  sourceKind: TrainingActivityEventSourceKindSelection;
  activityCategory: TrainingActivityEventActivityCategorySelection;
  canonicalSport: TrainingActivityEventCanonicalSportSelection;
  canonicalSubSport: TrainingActivityEventCanonicalSubSportSelection;
  outcome: TrainingActivityEventOutcomeSelection;
  requestedMappingStatus: TrainingActivityEventMappingStatusSelection;
}): TrainingActivityEventMappingStatusSelection {
  if (
    input.sourceKind === "unmapped" ||
    input.activityCategory === "unmapped" ||
    input.canonicalSport === "unmapped" ||
    input.canonicalSubSport === "unmapped" ||
    input.outcome === "unmapped"
  ) {
    return "unmapped";
  }

  return input.requestedMappingStatus;
}

export function buildTrainingActivityViewFromCompletedSwimEvent(
  row: CompletedActivityEventRow
): TrainingActivityHistoryView {
  const outcome = normalizeCompletedActivityEventOutcome(row.outcome);
  const sourceKind = row.source_kind === "manual" ? "manual" : "unmapped";
  const activityCategory = "workout";
  const canonicalSport = "swimming";
  const canonicalSubSport = inferSwimSubSportFromCompletedEvent(row);
  const requestedMappingStatus =
    sourceKind === "manual" && outcome !== "unmapped" ? "trusted" : "unmapped";
  const detailSnapshot = normalizeOptionalJsonObject(row.actual_session_snapshot);
  const hasSwimSnapshot = Object.keys(detailSnapshot as Record<string, unknown>).length > 0;

  return {
    id: `completed_activity_events:${row.id}`,
    compatibilitySource: "completed_activity_events",
    sourceKind,
    activityCategory,
    canonicalSport,
    canonicalSubSport,
    mappingStatus: buildSafeMappingStatus({
      sourceKind,
      activityCategory,
      canonicalSport,
      canonicalSubSport,
      outcome,
      requestedMappingStatus,
    }),
    outcome,
    activityStartedAt: row.actual_started_at,
    activityEndedAt: null,
    activityLocalDate: row.completed_on,
    activityTimezone: null,
    timezoneSource: "unknown",
    durationSeconds: row.actual_duration_seconds,
    distanceM: row.actual_distance_m,
    elevationM: null,
    energyKcal: null,
    averageHeartRateBpm: null,
    trainingLoad: null,
    plannedWorkoutInstanceId: row.planned_workout_instance_id,
    workoutId: row.workout_id,
    programId: row.program_id,
    completedActivityEventId: row.id,
    providerActivityEvidenceId: null,
    detailKind: hasSwimSnapshot ? "swim_session_snapshot" : "none",
    detailSnapshot,
    supportDiagnostics:
      requestedMappingStatus === "trusted"
        ? {}
        : {
            reason: "completed_activity_event_unmapped",
            sourceKind: row.source_kind,
            outcome: row.outcome,
          },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildTrainingActivityViewFromEventRow(
  row: TrainingActivityEventRow
): TrainingActivityHistoryView {
  const sourceKind = normalizeTrainingActivityEventSourceKind(row.source_kind);
  const activityCategory = normalizeTrainingActivityEventActivityCategory(row.activity_category);
  const canonicalSport = normalizeTrainingActivityEventCanonicalSport(row.canonical_sport);
  const canonicalSubSport = normalizeTrainingActivityEventCanonicalSubSport(
    row.canonical_sub_sport
  );
  const outcome = normalizeTrainingActivityEventOutcome(row.outcome);
  const requestedMappingStatus = normalizeTrainingActivityEventMappingStatus(row.mapping_status);

  return {
    id: row.id,
    compatibilitySource: "training_activity_events",
    sourceKind,
    activityCategory,
    canonicalSport,
    canonicalSubSport,
    mappingStatus: buildSafeMappingStatus({
      sourceKind,
      activityCategory,
      canonicalSport,
      canonicalSubSport,
      outcome,
      requestedMappingStatus,
    }),
    outcome,
    activityStartedAt: row.activity_started_at,
    activityEndedAt: row.activity_ended_at,
    activityLocalDate: row.activity_local_date,
    activityTimezone: row.activity_timezone,
    timezoneSource: normalizeTrainingActivityEventTimezoneSource(row.timezone_source),
    durationSeconds: row.duration_seconds,
    distanceM: row.distance_m,
    elevationM: row.elevation_m,
    energyKcal: row.energy_kcal,
    averageHeartRateBpm: row.average_heart_rate_bpm,
    trainingLoad: row.training_load,
    plannedWorkoutInstanceId: row.planned_workout_instance_id,
    workoutId: row.workout_id,
    programId: row.program_id,
    completedActivityEventId: row.completed_activity_event_id,
    providerActivityEvidenceId: row.provider_activity_evidence_id,
    detailKind: normalizeTrainingActivityEventDetailKind(row.detail_kind),
    detailSnapshot: normalizeOptionalJsonObject(row.detail_snapshot),
    supportDiagnostics: normalizeOptionalJsonObject(row.support_diagnostics),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isTrainingActivityHistoryTrusted(view: TrainingActivityHistoryView) {
  return (
    view.mappingStatus === "trusted" &&
    view.sourceKind !== "unmapped" &&
    view.activityCategory === "workout" &&
    view.canonicalSport !== "unmapped" &&
    view.outcome !== "unmapped" &&
    view.outcome !== "needs_review" &&
    view.outcome !== "unsupported"
  );
}
