import type { Database } from "@/types/database";

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export const COMPLETED_ACTIVITY_EVENT_OUTCOMES = ["completed"] as const;
export const COMPLETED_ACTIVITY_EVENT_SOURCE_KINDS = ["manual"] as const;

export type CompletedActivityEventOutcome = (typeof COMPLETED_ACTIVITY_EVENT_OUTCOMES)[number];
export type CompletedActivityEventSourceKind =
  (typeof COMPLETED_ACTIVITY_EVENT_SOURCE_KINDS)[number];

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
    blob.includes("source_kind")
  );
}

export function isManualCompletedActivityEvent(
  row: Pick<CompletedActivityEventRow, "outcome" | "source_kind">
) {
  return row.outcome === "completed" && row.source_kind === "manual";
}
