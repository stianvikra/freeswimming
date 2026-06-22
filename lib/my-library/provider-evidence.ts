import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";

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
type ProviderActivityEvidenceInsert =
  Database["public"]["Tables"]["provider_activity_evidence"]["Insert"];
type ProviderConnectionInsert = Database["public"]["Tables"]["provider_connections"]["Insert"];
type ProviderImportRunInsert = Database["public"]["Tables"]["provider_import_runs"]["Insert"];
type ProviderEvidenceWriteClient = Pick<SupabaseClient<Database>, "from">;

const MANUAL_FIXTURE_PROVIDER_KEY = "manual_fixture" satisfies ProviderEvidenceProviderKey;
const PROVIDER_EVIDENCE_FIXTURE_IMPORT_SCHEMA_VERSION =
  "2026-06-22-provider-evidence-fixture-import";
const MAX_MANUAL_FIXTURE_ACTIVITIES = 10;
const MANUAL_FIXTURE_ACTIVITY_TYPES = ["swimming", "lap_swimming", "open_water_swimming"] as const;
const MANUAL_FIXTURE_SPORT_TYPES = ["swimming"] as const;
const MANUAL_FIXTURE_SUB_SPORT_TYPES = ["pool_swimming", "open_water_swimming"] as const;
const MANUAL_FIXTURE_WRITABLE_STATUSES = ["imported", "needs_review"] as const;

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

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readField(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }
  return undefined;
}

function normalizeRequiredString(
  value: unknown,
  maxLength: number
): { ok: true; value: string } | { ok: false; code: string } {
  if (typeof value !== "string") return { ok: false, code: "missing_string" };
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return { ok: false, code: "invalid_string" };
  return { ok: true, value: trimmed };
}

function normalizeOptionalString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : null;
}

function normalizeOptionalIsoDateTime(
  value: unknown
): { ok: true; value: string | null } | { ok: false; code: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "string" || value.trim().length > 120) {
    return { ok: false, code: "invalid_activity_started_at" };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, code: "invalid_activity_started_at" };
  }

  return { ok: true, value: parsed.toISOString() };
}

function normalizeOptionalDateKey(
  value: unknown
): { ok: true; value: string | null } | { ok: false; code: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { ok: false, code: "invalid_activity_date" };
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return { ok: false, code: "invalid_activity_date" };
  }

  return { ok: true, value };
}

function normalizeOptionalNumber(
  value: unknown,
  input: { min: number; max: number; integer?: boolean }
): { ok: true; value: number | null } | { ok: false; code: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false, code: "invalid_number" };
  }

  if (value < input.min || value > input.max || (input.integer && !Number.isInteger(value))) {
    return { ok: false, code: "out_of_range_number" };
  }

  return { ok: true, value: input.integer ? value : Math.round(value * 100) / 100 };
}

function normalizeKnownOptionalValue<T extends readonly string[]>(
  values: T,
  value: unknown
): { value: T[number] | null; unsupported: boolean } {
  if (value === null || value === undefined || value === "") {
    return { value: null, unsupported: false };
  }

  if (includesValue(values, value)) {
    return { value, unsupported: false };
  }

  return { value: null, unsupported: true };
}

function normalizePoolLengthUnit(value: unknown): {
  value: "m" | "yd" | null;
  unsupported: boolean;
} {
  if (value === null || value === undefined || value === "") {
    return { value: null, unsupported: false };
  }

  if (value === "m" || value === "yd") {
    return { value, unsupported: false };
  }

  return { value: null, unsupported: true };
}

function uniqueWarningCodes(codes: string[]) {
  return [...new Set(codes)].sort();
}

function buildManualFixtureRedactedSummary(input: {
  activity: Record<string, unknown>;
  activityDate: string | null;
  warningCodes: string[];
}): Json {
  const callerSummary = readField(input.activity, "redactedSummary", "redacted_summary");
  const callerSummaryTitle = isPlainRecord(callerSummary)
    ? normalizeOptionalString(readField(callerSummary, "title"), 120)
    : null;
  const title =
    normalizeOptionalString(readField(input.activity, "title", "label", "activityTitle"), 120) ??
    callerSummaryTitle;

  return {
    source: MANUAL_FIXTURE_PROVIDER_KEY,
    schemaVersion: PROVIDER_EVIDENCE_FIXTURE_IMPORT_SCHEMA_VERSION,
    activityDate: input.activityDate,
    title,
    warningCodes: uniqueWarningCodes(input.warningCodes),
  };
}

type ManualFixtureParsedActivity = {
  providerActivityId: string;
  status: ProviderActivityEvidenceStatus;
  warningCodes: string[];
  row: Omit<ProviderActivityEvidenceInsert, "provider_connection_id" | "import_run_id" | "user_id">;
};

type ManualFixtureParseResult =
  | {
      ok: true;
      activities: ManualFixtureParsedActivity[];
      counts: {
        totalActivityCount: number;
        duplicateCount: number;
        malformedCount: number;
        unsupportedCount: number;
      };
      warningCodes: string[];
    }
  | {
      ok: false;
      status: 400;
      code: string;
      error: string;
    };

function parseManualFixtureActivity(
  activity: unknown,
  nowIso: string
): ManualFixtureParsedActivity | { malformed: true; warningCodes: string[] } {
  if (!isPlainRecord(activity)) {
    return { malformed: true, warningCodes: ["invalid_activity_shape"] };
  }

  const providerActivityId = normalizeRequiredString(
    readField(activity, "providerActivityId", "provider_activity_id"),
    200
  );
  if (!providerActivityId.ok) {
    return { malformed: true, warningCodes: ["invalid_provider_activity_id"] };
  }

  const activityStartedAt = normalizeOptionalIsoDateTime(
    readField(activity, "activityStartedAt", "activity_started_at")
  );
  if (!activityStartedAt.ok) {
    return { malformed: true, warningCodes: [activityStartedAt.code] };
  }

  const activityDate = normalizeOptionalDateKey(
    readField(activity, "activityDate", "activity_date")
  );
  if (!activityDate.ok) {
    return { malformed: true, warningCodes: [activityDate.code] };
  }

  const durationSeconds = normalizeOptionalNumber(
    readField(activity, "durationSeconds", "duration_seconds"),
    { min: 0, max: 172800, integer: true }
  );
  if (!durationSeconds.ok) {
    return { malformed: true, warningCodes: ["invalid_duration_seconds"] };
  }

  const distanceM = normalizeOptionalNumber(readField(activity, "distanceM", "distance_m"), {
    min: 0,
    max: 1000000,
  });
  if (!distanceM.ok) {
    return { malformed: true, warningCodes: ["invalid_distance_m"] };
  }

  const poolLengthM = normalizeOptionalNumber(readField(activity, "poolLengthM", "pool_length_m"), {
    min: 12.5,
    max: 500,
  });
  if (!poolLengthM.ok) {
    return { malformed: true, warningCodes: ["invalid_pool_length_m"] };
  }

  const requestedStatus = readField(activity, "status");
  const status =
    requestedStatus === undefined || requestedStatus === null || requestedStatus === ""
      ? "imported"
      : normalizeProviderActivityEvidenceStatus(requestedStatus);
  if (!includesValue(MANUAL_FIXTURE_WRITABLE_STATUSES, status)) {
    return { malformed: true, warningCodes: ["unsupported_activity_status"] };
  }

  const activityType = normalizeKnownOptionalValue(
    MANUAL_FIXTURE_ACTIVITY_TYPES,
    readField(activity, "activityType", "activity_type")
  );
  const sportType = normalizeKnownOptionalValue(
    MANUAL_FIXTURE_SPORT_TYPES,
    readField(activity, "sportType", "sport_type")
  );
  const subSportType = normalizeKnownOptionalValue(
    MANUAL_FIXTURE_SUB_SPORT_TYPES,
    readField(activity, "subSportType", "sub_sport_type")
  );
  const poolLengthUnit = normalizePoolLengthUnit(
    readField(activity, "poolLengthUnit", "pool_length_unit")
  );

  const warningCodes: string[] = [];
  if (activityType.unsupported) warningCodes.push("unsupported_activity_type");
  if (sportType.unsupported) warningCodes.push("unsupported_sport_type");
  if (subSportType.unsupported) warningCodes.push("unsupported_sub_sport_type");
  if (poolLengthUnit.unsupported) warningCodes.push("unsupported_pool_length_unit");
  if (poolLengthM.value !== null && poolLengthUnit.value === null) {
    warningCodes.push("missing_pool_length_unit");
  }

  const requestedFileState = readField(activity, "fileState", "file_state");
  const normalizedFileState = normalizeProviderActivityFileState(requestedFileState);
  let fileState: ProviderActivityFileState =
    requestedFileState === undefined || requestedFileState === null || requestedFileState === ""
      ? "none"
      : normalizedFileState;
  if (normalizedFileState === "unsupported") {
    warningCodes.push("unsupported_file_state");
    fileState = "unsupported";
  }

  const rawFileKinds = readField(activity, "availableFileKinds", "available_file_kinds");
  const availableFileKinds = normalizeProviderActivityFileKinds(rawFileKinds);
  if (Array.isArray(rawFileKinds) && availableFileKinds.length !== rawFileKinds.length) {
    warningCodes.push("unsupported_file_kind");
  } else if (rawFileKinds !== undefined && rawFileKinds !== null && !Array.isArray(rawFileKinds)) {
    warningCodes.push("unsupported_file_kind");
  }

  if (availableFileKinds.length > 0 && fileState === "none") {
    fileState = "available_from_provider";
  }

  const finalStatus =
    warningCodes.length > 0 ? "unsupported_activity" : (status as ProviderActivityEvidenceStatus);
  const finalActivityDate = activityDate.value ?? activityStartedAt.value?.slice(0, 10) ?? null;

  return {
    providerActivityId: providerActivityId.value,
    status: finalStatus,
    warningCodes: uniqueWarningCodes(warningCodes),
    row: {
      provider_key: MANUAL_FIXTURE_PROVIDER_KEY,
      provider_activity_id: providerActivityId.value,
      status: finalStatus,
      activity_started_at: activityStartedAt.value,
      activity_date: finalActivityDate,
      activity_type: activityType.value,
      sport_type: sportType.value,
      sub_sport_type: subSportType.value,
      duration_seconds: durationSeconds.value,
      distance_m: distanceM.value,
      pool_length_m: poolLengthM.value,
      pool_length_unit: poolLengthUnit.value,
      file_state: fileState,
      available_file_kinds: availableFileKinds,
      redacted_summary: buildManualFixtureRedactedSummary({
        activity,
        activityDate: finalActivityDate,
        warningCodes,
      }),
      last_seen_at: nowIso,
    },
  };
}

export function isProviderEvidenceFixtureImportEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.PROVIDER_EVIDENCE_FIXTURE_IMPORT_ENABLED === "1";
}

export function parseManualFixtureProviderEvidenceImportPayload(
  payload: unknown,
  nowIso = new Date().toISOString()
): ManualFixtureParseResult {
  if (!isPlainRecord(payload)) {
    return {
      ok: false,
      status: 400,
      code: "invalid_payload",
      error: "Send a valid fixture import payload.",
    };
  }

  const providerKey = readField(payload, "providerKey", "provider_key");
  if (providerKey !== undefined && providerKey !== MANUAL_FIXTURE_PROVIDER_KEY) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_provider",
      error: "Only manual_fixture provider evidence can be imported here.",
    };
  }

  const activities = readField(payload, "activities");
  if (!Array.isArray(activities) || activities.length === 0) {
    return {
      ok: false,
      status: 400,
      code: "invalid_activities",
      error: "Send 1 to 10 fixture activities.",
    };
  }

  if (activities.length > MAX_MANUAL_FIXTURE_ACTIVITIES) {
    return {
      ok: false,
      status: 400,
      code: "too_many_activities",
      error: "Send 10 or fewer fixture activities.",
    };
  }

  const seenProviderActivityIds = new Set<string>();
  const parsedActivities: ManualFixtureParsedActivity[] = [];
  const warningCodes: string[] = [];
  let duplicateCount = 0;
  let malformedCount = 0;
  let unsupportedCount = 0;

  for (const activity of activities) {
    const parsed = parseManualFixtureActivity(activity, nowIso);
    if ("malformed" in parsed) {
      malformedCount += 1;
      warningCodes.push(...parsed.warningCodes);
      continue;
    }

    if (seenProviderActivityIds.has(parsed.providerActivityId)) {
      duplicateCount += 1;
      warningCodes.push("duplicate_provider_activity_id");
      continue;
    }

    seenProviderActivityIds.add(parsed.providerActivityId);
    if (parsed.status === "unsupported_activity") {
      unsupportedCount += 1;
      warningCodes.push(...parsed.warningCodes);
    }
    parsedActivities.push(parsed);
  }

  return {
    ok: true,
    activities: parsedActivities,
    counts: {
      totalActivityCount: activities.length,
      duplicateCount,
      malformedCount,
      unsupportedCount,
    },
    warningCodes: uniqueWarningCodes(warningCodes),
  };
}

type ManualFixtureImportResult =
  | {
      ok: true;
      status: "completed" | "completed_with_warnings";
      providerKey: typeof MANUAL_FIXTURE_PROVIDER_KEY;
      providerConnectionId: string;
      importRunId: string;
      evidenceIds: string[];
      counts: {
        totalActivityCount: number;
        importedCount: number;
        duplicateCount: number;
        malformedCount: number;
        unsupportedCount: number;
      };
      warnings: string[];
    }
  | {
      ok: false;
      status: 400 | 500 | 503;
      code: string;
      error: string;
    };

function buildProviderFixtureImportStorageFailure(
  error: PostgrestLikeError,
  fallbackCode: string,
  fallbackError: string
): ManualFixtureImportResult {
  if (isProviderEvidenceSchemaMissing(error)) {
    return {
      ok: false,
      status: 503,
      code: "provider_evidence_schema_missing",
      error: "Provider evidence storage is not ready.",
    };
  }

  return {
    ok: false,
    status: 500,
    code: fallbackCode,
    error: fallbackError,
  };
}

export async function importManualFixtureProviderEvidence(input: {
  supabase: ProviderEvidenceWriteClient;
  userId: string;
  payload: unknown;
  now?: Date;
}): Promise<ManualFixtureImportResult> {
  const nowIso = (input.now ?? new Date()).toISOString();
  const parsed = parseManualFixtureProviderEvidenceImportPayload(input.payload, nowIso);
  if (!parsed.ok) return parsed;

  const connectionPayload: ProviderConnectionInsert = {
    user_id: input.userId,
    provider_key: MANUAL_FIXTURE_PROVIDER_KEY,
    status: "connected_metadata_only",
    provider_display_name: "Manual fixture",
    connected_at: nowIso,
    last_successful_sync_at: nowIso,
    last_sync_error_code: null,
    redacted_metadata: {
      source: MANUAL_FIXTURE_PROVIDER_KEY,
      schemaVersion: PROVIDER_EVIDENCE_FIXTURE_IMPORT_SCHEMA_VERSION,
    },
  };

  const connectionResult = await input.supabase
    .from("provider_connections")
    .upsert(connectionPayload, { onConflict: "user_id,provider_key" })
    .select("id")
    .single();

  if (connectionResult.error) {
    return buildProviderFixtureImportStorageFailure(
      connectionResult.error,
      "provider_connection_write_failed",
      "Could not prepare provider evidence import."
    );
  }

  const providerConnectionId = connectionResult.data.id;
  const providerActivityIds = parsed.activities.map((activity) => activity.providerActivityId);

  let existingAliasCount = 0;
  if (providerActivityIds.length > 0) {
    const existingAliasesResult = await input.supabase
      .from("provider_activity_evidence")
      .select("provider_activity_id")
      .eq("user_id", input.userId)
      .eq("provider_key", MANUAL_FIXTURE_PROVIDER_KEY)
      .in("provider_activity_id", providerActivityIds);

    if (existingAliasesResult.error) {
      return buildProviderFixtureImportStorageFailure(
        existingAliasesResult.error,
        "provider_evidence_existing_alias_read_failed",
        "Could not prepare provider evidence import."
      );
    }

    existingAliasCount = existingAliasesResult.data?.length ?? 0;
  }

  const duplicateCount = parsed.counts.duplicateCount + existingAliasCount;
  const importedCount = parsed.activities.filter(
    (activity) => activity.status === "imported"
  ).length;
  const hasWarnings =
    duplicateCount > 0 ||
    parsed.counts.malformedCount > 0 ||
    parsed.counts.unsupportedCount > 0 ||
    parsed.warningCodes.length > 0;
  const runStatus: ProviderImportRunStatus = hasWarnings ? "completed_with_warnings" : "completed";
  const warnings = uniqueWarningCodes([
    ...parsed.warningCodes,
    ...(existingAliasCount > 0 ? ["existing_provider_activity_alias"] : []),
  ]);

  const runPayload: ProviderImportRunInsert = {
    user_id: input.userId,
    provider_connection_id: providerConnectionId,
    provider_key: MANUAL_FIXTURE_PROVIDER_KEY,
    run_kind: "manual_fixture",
    status: runStatus,
    started_at: nowIso,
    finished_at: nowIso,
    total_activity_count: parsed.counts.totalActivityCount,
    imported_count: importedCount,
    duplicate_count: duplicateCount,
    malformed_count: parsed.counts.malformedCount,
    unsupported_count: parsed.counts.unsupportedCount,
    error_code: hasWarnings ? "fixture_import_warnings" : null,
    redacted_diagnostics: {
      source: MANUAL_FIXTURE_PROVIDER_KEY,
      schemaVersion: PROVIDER_EVIDENCE_FIXTURE_IMPORT_SCHEMA_VERSION,
      warningCodes: warnings,
      existingAliasCount,
    },
  };

  const runResult = await input.supabase
    .from("provider_import_runs")
    .insert(runPayload)
    .select("id")
    .single();

  if (runResult.error) {
    return buildProviderFixtureImportStorageFailure(
      runResult.error,
      "provider_import_run_write_failed",
      "Could not record provider evidence import."
    );
  }

  const importRunId = runResult.data.id;
  let evidenceIds: string[] = [];
  if (parsed.activities.length > 0) {
    const evidencePayload = parsed.activities.map((activity) => ({
      ...activity.row,
      user_id: input.userId,
      provider_connection_id: providerConnectionId,
      import_run_id: importRunId,
    }));

    const evidenceResult = await input.supabase
      .from("provider_activity_evidence")
      .upsert(evidencePayload, {
        onConflict: "user_id,provider_key,provider_activity_id",
      })
      .select("id");

    if (evidenceResult.error) {
      return buildProviderFixtureImportStorageFailure(
        evidenceResult.error,
        "provider_activity_evidence_write_failed",
        "Could not store provider activity evidence."
      );
    }

    evidenceIds = (evidenceResult.data ?? []).map((row) => row.id);
  }

  return {
    ok: true,
    status: runStatus,
    providerKey: MANUAL_FIXTURE_PROVIDER_KEY,
    providerConnectionId,
    importRunId,
    evidenceIds,
    counts: {
      totalActivityCount: parsed.counts.totalActivityCount,
      importedCount,
      duplicateCount,
      malformedCount: parsed.counts.malformedCount,
      unsupportedCount: parsed.counts.unsupportedCount,
    },
    warnings,
  };
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
