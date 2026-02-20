type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const MISSING_SCHEMA_CODES = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function buildErrorBlob(error: PostgrestLikeError): string {
  return `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
}

function hasMissingSchemaCode(error: PostgrestLikeError): boolean {
  return Boolean(error.code && MISSING_SCHEMA_CODES.has(error.code));
}

function includesAnyMarker(blob: string, markers: string[]): boolean {
  return markers.some((marker) => blob.includes(marker));
}

export function isAdminContentSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;

  const blob = buildErrorBlob(error);
  return includesAnyMarker(blob, [
    "admin_content_items",
    "admin_content_type",
    "admin_content_status",
  ]);
}

export function isAdminRuntimeFlagsSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;

  const blob = buildErrorBlob(error);
  return includesAnyMarker(blob, ["admin_runtime_flags"]);
}

export function isAdminNotesSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;

  const blob = buildErrorBlob(error);
  return includesAnyMarker(blob, ["admin_notes"]);
}

export function getAdminSchemaSetupMessage(section: "content" | "operations" | "notes"): string {
  const area =
    section === "content"
      ? "Admin content"
      : section === "operations"
        ? "Admin operations"
        : "Admin notes";

  return `${area} setup is not ready in this environment yet. Apply latest Supabase migrations and refresh.`;
}
