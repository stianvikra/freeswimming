type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const GOALS_MVP_COLUMN_MARKERS = [
  "goal_type",
  "source",
  "target_distance_m",
  "target_time_seconds",
  "target_count",
  "target_ref",
  "progress_value",
  "achieved_at",
];

export function isGoalsMvpSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;

  if (error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return GOALS_MVP_COLUMN_MARKERS.some((marker) => blob.includes(marker));
}
