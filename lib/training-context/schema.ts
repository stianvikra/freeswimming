type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const TRAINING_CONTEXT_MARKERS = [
  "training_focuses",
  "training_notes",
  "is_primary",
  "note_type",
  "context_type",
  "resolved_at",
];

export function isTrainingContextSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;

  if (error.code === "42P01" || error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return TRAINING_CONTEXT_MARKERS.some((marker) => blob.includes(marker));
}
