type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

function isSchemaMissing(error: PostgrestLikeError | null | undefined, markers: string[]): boolean {
  if (!error) return false;

  if (error.code === "42P01" || error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return markers.some((marker) => blob.includes(marker));
}

export function isAthleteProfileSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  return isSchemaMissing(error, [
    "athlete_profiles",
    "display_name",
    "first_name",
    "last_name",
    "age_band",
  ]);
}

export function isTrainingMetricSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  return isSchemaMissing(error, [
    "training_metrics",
    "metric_key",
    "value_seconds",
    "recorded_on",
    "source_note",
  ]);
}

export function isTrainingPreferencesSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  return isSchemaMissing(error, [
    "training_preferences",
    "pool_length_m",
    "available_days",
    "preferred_weekly_session_count",
    "preferred_session_minutes",
  ]);
}

export function isPersonalRecordsSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  return isSchemaMissing(error, [
    "personal_records",
    "distance_m",
    "stroke",
    "course",
    "time_centiseconds",
    "recorded_on",
    "source_note",
  ]);
}

export function isSwimCapabilityLimitsSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  return isSchemaMissing(error, [
    "swim_capability_limits",
    "limit_kind",
    "stroke",
    "max_repeat_distance_m",
    "max_total_distance_m",
    "target_total_distance_m",
    "replace_swim_capability_limits",
  ]);
}
