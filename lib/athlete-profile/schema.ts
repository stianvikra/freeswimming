type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const ATHLETE_PROFILE_MARKERS = [
  "athlete_profiles",
  "display_name",
  "first_name",
  "last_name",
  "age_band",
];

export function isAthleteProfileSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;

  if (error.code === "42P01" || error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return ATHLETE_PROFILE_MARKERS.some((marker) => blob.includes(marker));
}
