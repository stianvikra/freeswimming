import type { Database } from "@/types/database";

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export const COMPLETED_ACTIVITY_EVENT_OUTCOMES = [
  "completed_as_planned",
  "completed_different",
  "partial",
  "completed_on_another_day",
  "cancelled_as_actual",
  "needs_review",
] as const;
export const COMPLETED_ACTIVITY_EVENT_LEGACY_OUTCOMES = ["completed"] as const;
export const COMPLETED_ACTIVITY_EVENT_SOURCE_KINDS = ["manual"] as const;

export type CompletedActivityEventOutcome = (typeof COMPLETED_ACTIVITY_EVENT_OUTCOMES)[number];
export type CompletedActivityEventLegacyOutcome =
  (typeof COMPLETED_ACTIVITY_EVENT_LEGACY_OUTCOMES)[number];
export type CompletedActivityEventSourceKind =
  (typeof COMPLETED_ACTIVITY_EVENT_SOURCE_KINDS)[number];
export type CompletedActivityEventOutcomeSelection = CompletedActivityEventOutcome | "unmapped";

export type CompletedActivityEventRow =
  Database["public"]["Tables"]["completed_activity_events"]["Row"];

export const COMPLETED_ACTIVITY_EVENT_SELECT = `
  id,
  user_id,
  planned_workout_instance_id,
  workout_id,
  program_id,
  outcome,
  source_kind,
  completed_on,
  actual_started_at,
  actual_duration_seconds,
  actual_distance_m,
  actual_environment,
  actual_pool_length_m,
  actual_pool_length_unit,
  correction_note,
  planned_snapshot,
  created_at,
  updated_at
`;

export function isCompletedActivityEventSchemaMissing(
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
    blob.includes("completed_activity_events") ||
    blob.includes("planned_workout_instance_id") ||
    blob.includes("completed_on") ||
    blob.includes("actual_started_at") ||
    blob.includes("actual_duration_seconds") ||
    blob.includes("actual_distance_m") ||
    blob.includes("actual_environment") ||
    blob.includes("actual_pool_length") ||
    blob.includes("correction_note") ||
    blob.includes("source_kind")
  );
}

export function normalizeCompletedActivityEventOutcome(
  value: unknown
): CompletedActivityEventOutcomeSelection {
  if (value === "completed") return "completed_as_planned";
  return COMPLETED_ACTIVITY_EVENT_OUTCOMES.includes(value as CompletedActivityEventOutcome)
    ? (value as CompletedActivityEventOutcome)
    : "unmapped";
}

export function isManualCompletedActivityEvent(
  row: Pick<CompletedActivityEventRow, "outcome" | "source_kind">
) {
  return (
    row.source_kind === "manual" &&
    normalizeCompletedActivityEventOutcome(row.outcome) !== "unmapped"
  );
}

export function isCompletedActivityEventDoneOutcome(outcome: CompletedActivityEventOutcome) {
  return (
    outcome === "completed_as_planned" ||
    outcome === "completed_different" ||
    outcome === "completed_on_another_day"
  );
}
