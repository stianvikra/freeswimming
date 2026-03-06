type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const MISSING_SCHEMA_CODES = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function includesSchemaMarker(error: PostgrestLikeError): boolean {
  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return blob.includes("qr_redirect_links") || blob.includes("qr_link_status");
}

export function isQrRedirectSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  if (error.code && MISSING_SCHEMA_CODES.has(error.code)) return true;
  if (error.code && (error.code.startsWith("42") || error.code.startsWith("PGRST"))) return true;
  return includesSchemaMarker(error);
}
