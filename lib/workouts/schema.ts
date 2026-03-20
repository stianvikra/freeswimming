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

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return markers.some((marker) => blob.includes(marker));
}

export function isWorkoutSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  return isSchemaMissing(error, [
    "workouts",
    "source_kind",
    "generator_kind",
    "source_fingerprint",
    "pool_length_m",
    "session_type",
    "target_distance_m",
    "target_time_min",
    "base_pace_seconds_per_100",
    "allowed_strokes",
    "equipment_allowlist",
    "steps",
    "accepted_at",
    "generated_at",
  ]);
}
