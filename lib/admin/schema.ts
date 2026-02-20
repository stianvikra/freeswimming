type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const MISSING_SCHEMA_CODES = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);
const SETUP_BLOCKED_CODES = new Set(["42501"]);
const SETUP_BLOCKED_MARKERS = [
  "permission denied",
  "row-level security",
  "violates row-level security",
  "insufficient privilege",
];

function buildErrorBlob(error: PostgrestLikeError): string {
  return `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
}

function hasMissingSchemaCode(error: PostgrestLikeError): boolean {
  return Boolean(error.code && MISSING_SCHEMA_CODES.has(error.code));
}

function hasSetupBlockedCode(error: PostgrestLikeError): boolean {
  return Boolean(error.code && SETUP_BLOCKED_CODES.has(error.code));
}

function hasLikelySetupCode(error: PostgrestLikeError): boolean {
  if (!error.code) return false;
  return error.code.startsWith("42") || error.code.startsWith("PGRST");
}

function includesAnyMarker(blob: string, markers: string[]): boolean {
  return markers.some((marker) => blob.includes(marker));
}

export function isAdminContentSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;
  if (hasLikelySetupCode(error)) return true;

  const blob = buildErrorBlob(error);
  if (hasSetupBlockedCode(error) || includesAnyMarker(blob, SETUP_BLOCKED_MARKERS)) return true;

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
  if (hasLikelySetupCode(error)) return true;

  const blob = buildErrorBlob(error);
  if (hasSetupBlockedCode(error) || includesAnyMarker(blob, SETUP_BLOCKED_MARKERS)) return true;

  return includesAnyMarker(blob, ["admin_runtime_flags"]);
}

export function isAdminNotesSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;
  if (hasLikelySetupCode(error)) return true;

  const blob = buildErrorBlob(error);
  if (hasSetupBlockedCode(error) || includesAnyMarker(blob, SETUP_BLOCKED_MARKERS)) return true;

  return includesAnyMarker(blob, ["admin_notes"]);
}

export function isAdminCommerceSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;
  if (hasLikelySetupCode(error)) return true;

  const blob = buildErrorBlob(error);
  if (hasSetupBlockedCode(error) || includesAnyMarker(blob, SETUP_BLOCKED_MARKERS)) return true;

  return includesAnyMarker(blob, ["products", "profiles", "role"]);
}

export function isAdminCategoriesSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
  if (!error) return false;
  if (hasMissingSchemaCode(error)) return true;
  if (hasLikelySetupCode(error)) return true;

  const blob = buildErrorBlob(error);
  if (hasSetupBlockedCode(error) || includesAnyMarker(blob, SETUP_BLOCKED_MARKERS)) return true;

  return includesAnyMarker(blob, ["admin_categories"]);
}

export function getAdminSchemaSetupMessage(
  section: "content" | "operations" | "notes" | "commerce" | "categories"
): string {
  const area =
    section === "content"
      ? "Admin content"
      : section === "operations"
        ? "Admin operations"
        : section === "notes"
          ? "Admin notes"
          : section === "commerce"
            ? "Admin commerce"
            : "Admin categories";

  return `${area} setup is not ready in this environment yet. Apply latest Supabase migrations (tables + grants + RLS policies), then refresh.`;
}
