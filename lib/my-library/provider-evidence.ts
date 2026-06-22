import type { Database } from "@/types/database";

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export const PROVIDER_EVIDENCE_PROVIDER_KEYS = [
  "garmin_activity_api",
  "strava_activity_api",
  "apple_health",
  "android_health_connect",
  "manual_fixture",
] as const;

export const PROVIDER_CONNECTION_STATUSES = [
  "not_connected",
  "connected_metadata_only",
  "revoked",
  "disabled",
  "needs_review",
  "provider_unavailable",
] as const;

export const PROVIDER_ACTIVITY_EVIDENCE_STATUSES = [
  "imported",
  "needs_review",
  "duplicate_provider_activity",
  "malformed",
  "unsupported_activity",
  "ignored",
  "unmapped",
] as const;

export const PROVIDER_IMPORT_RUN_KINDS = [
  "manual_fixture",
  "backfill",
  "webhook_signal",
  "polling_import",
  "support_repair",
] as const;

export const PROVIDER_IMPORT_RUN_STATUSES = [
  "queued",
  "running",
  "completed",
  "completed_with_warnings",
  "failed_retryable",
  "failed_final",
  "disabled",
] as const;

export const PROVIDER_ACTIVITY_FILE_STATES = [
  "none",
  "available_from_provider",
  "deferred_storage",
  "unsupported",
  "redacted",
] as const;

export const PROVIDER_ACTIVITY_FILE_KINDS = ["fit", "gpx", "tcx"] as const;

export type ProviderEvidenceProviderKey = (typeof PROVIDER_EVIDENCE_PROVIDER_KEYS)[number];
export type ProviderConnectionStatus = (typeof PROVIDER_CONNECTION_STATUSES)[number];
export type ProviderActivityEvidenceStatus = (typeof PROVIDER_ACTIVITY_EVIDENCE_STATUSES)[number];
export type ProviderImportRunKind = (typeof PROVIDER_IMPORT_RUN_KINDS)[number];
export type ProviderImportRunStatus = (typeof PROVIDER_IMPORT_RUN_STATUSES)[number];
export type ProviderActivityFileState = (typeof PROVIDER_ACTIVITY_FILE_STATES)[number];
export type ProviderActivityFileKind = (typeof PROVIDER_ACTIVITY_FILE_KINDS)[number];

export type ProviderEvidenceProviderKeySelection = ProviderEvidenceProviderKey | "unmapped";
export type ProviderConnectionStatusSelection = ProviderConnectionStatus | "needs_review";
export type ProviderActivityEvidenceStatusSelection = ProviderActivityEvidenceStatus | "unmapped";
export type ProviderImportRunKindSelection = ProviderImportRunKind | "support_repair";
export type ProviderImportRunStatusSelection = ProviderImportRunStatus | "failed_final";
export type ProviderActivityFileStateSelection = ProviderActivityFileState | "unsupported";
export type ProviderActivityFileKindSelection = ProviderActivityFileKind | "unsupported";

export type ProviderConnectionRow = Database["public"]["Tables"]["provider_connections"]["Row"];
export type ProviderActivityEvidenceRow =
  Database["public"]["Tables"]["provider_activity_evidence"]["Row"];
export type ProviderImportRunRow = Database["public"]["Tables"]["provider_import_runs"]["Row"];

export const PROVIDER_CONNECTION_SELECT = `
  id,
  user_id,
  provider_key,
  status,
  provider_user_id,
  provider_display_name,
  connected_at,
  revoked_at,
  disabled_at,
  last_successful_sync_at,
  last_sync_error_code,
  redacted_metadata,
  created_at,
  updated_at
`;

export const PROVIDER_ACTIVITY_EVIDENCE_SELECT = `
  id,
  user_id,
  provider_connection_id,
  import_run_id,
  provider_key,
  provider_activity_id,
  status,
  activity_started_at,
  activity_date,
  activity_type,
  sport_type,
  sub_sport_type,
  duration_seconds,
  distance_m,
  pool_length_m,
  pool_length_unit,
  file_state,
  available_file_kinds,
  redacted_summary,
  first_seen_at,
  last_seen_at,
  created_at,
  updated_at
`;

export const PROVIDER_IMPORT_RUN_SELECT = `
  id,
  user_id,
  provider_connection_id,
  provider_key,
  run_kind,
  status,
  started_at,
  finished_at,
  total_activity_count,
  imported_count,
  duplicate_count,
  malformed_count,
  unsupported_count,
  error_code,
  redacted_diagnostics,
  created_at,
  updated_at
`;

function includesValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

export function normalizeProviderEvidenceProviderKey(
  value: unknown
): ProviderEvidenceProviderKeySelection {
  return includesValue(PROVIDER_EVIDENCE_PROVIDER_KEYS, value) ? value : "unmapped";
}

export function normalizeProviderConnectionStatus(
  value: unknown
): ProviderConnectionStatusSelection {
  return includesValue(PROVIDER_CONNECTION_STATUSES, value) ? value : "needs_review";
}

export function normalizeProviderActivityEvidenceStatus(
  value: unknown
): ProviderActivityEvidenceStatusSelection {
  return includesValue(PROVIDER_ACTIVITY_EVIDENCE_STATUSES, value) ? value : "unmapped";
}

export function normalizeProviderImportRunKind(value: unknown): ProviderImportRunKindSelection {
  return includesValue(PROVIDER_IMPORT_RUN_KINDS, value) ? value : "support_repair";
}

export function normalizeProviderImportRunStatus(value: unknown): ProviderImportRunStatusSelection {
  return includesValue(PROVIDER_IMPORT_RUN_STATUSES, value) ? value : "failed_final";
}

export function normalizeProviderActivityFileState(
  value: unknown
): ProviderActivityFileStateSelection {
  return includesValue(PROVIDER_ACTIVITY_FILE_STATES, value) ? value : "unsupported";
}

export function normalizeProviderActivityFileKind(
  value: unknown
): ProviderActivityFileKindSelection {
  return includesValue(PROVIDER_ACTIVITY_FILE_KINDS, value) ? value : "unsupported";
}

export function normalizeProviderActivityFileKinds(values: unknown): ProviderActivityFileKind[] {
  if (!Array.isArray(values)) return [];
  return values.filter((value): value is ProviderActivityFileKind =>
    includesValue(PROVIDER_ACTIVITY_FILE_KINDS, value)
  );
}

export function buildProviderActivityEvidenceIdentityKey(input: {
  userId: string;
  providerKey: ProviderEvidenceProviderKey;
  providerActivityId: string;
}) {
  return `${input.userId}:${input.providerKey}:${input.providerActivityId}`;
}

export function isProviderEvidenceSchemaMissing(
  error: PostgrestLikeError | null | undefined
): boolean {
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
  return (
    blob.includes("provider_connections") ||
    blob.includes("provider_activity_evidence") ||
    blob.includes("provider_import_runs") ||
    blob.includes("provider_connection_id") ||
    blob.includes("provider_activity_id") ||
    blob.includes("provider_key") ||
    blob.includes("redacted_metadata") ||
    blob.includes("redacted_summary") ||
    blob.includes("redacted_diagnostics")
  );
}

export function isProviderActivityEvidenceCompletionTruth() {
  return false;
}
