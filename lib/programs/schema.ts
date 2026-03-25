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

export function isProgramSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  return isSchemaMissing(error, ["programs", "source_kind", "weeks"]);
}
