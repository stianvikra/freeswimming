type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

function isSchemaMissing(error: PostgrestLikeError | null | undefined, markers: string[]): boolean {
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
  return markers.some((marker) => blob.includes(marker));
}

export function isDrylandSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  return isSchemaMissing(error, [
    "dryland_sessions",
    "dryland_micro_plans",
    "micro_session_habit_links",
    "session_kind",
    "source_dryland_session_id",
    "week_starts_at",
    "week_ends_at",
    "blocks",
    "actual_duration_seconds",
    "started_at",
    "completed_at",
    "exercises",
    "source_dryland_micro_plan_id",
  ]);
}
