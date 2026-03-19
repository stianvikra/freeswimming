import type { Database } from "@/types/database";

export const TRAINING_METRIC_KEYS = ["css"] as const;
export type TrainingMetricKey = (typeof TRAINING_METRIC_KEYS)[number];

export const TRAINING_POOL_LENGTH_VALUES = [25, 50] as const;
export type TrainingPoolLength = (typeof TRAINING_POOL_LENGTH_VALUES)[number];

export const TRAINING_SESSION_DURATION_VALUES = [30, 45, 60, 75, 90] as const;
export type TrainingSessionDuration = (typeof TRAINING_SESSION_DURATION_VALUES)[number];

export const TRAINING_WEEKDAY_VALUES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type TrainingWeekday = (typeof TRAINING_WEEKDAY_VALUES)[number];

export const TRAINING_WEEKDAY_OPTIONS: readonly { value: TrainingWeekday; label: string }[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
] as const;

export const TRAINING_POOL_LENGTH_OPTIONS: readonly {
  value: TrainingPoolLength;
  label: string;
}[] = [
  { value: 25, label: "25m pool" },
  { value: 50, label: "50m pool" },
] as const;

export const TRAINING_SESSION_DURATION_OPTIONS: readonly {
  value: TrainingSessionDuration;
  label: string;
}[] = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 75, label: "75 min" },
  { value: 90, label: "90 min" },
] as const;

export type TrainingMetricRow = Database["public"]["Tables"]["training_metrics"]["Row"];
export type TrainingMetricInsert = Database["public"]["Tables"]["training_metrics"]["Insert"];
export type TrainingPreferencesRow = Database["public"]["Tables"]["training_preferences"]["Row"];
export type TrainingPreferencesInsert =
  Database["public"]["Tables"]["training_preferences"]["Insert"];

type CssMetricInput = {
  pace?: string | null;
  recordedOn?: string | null;
  sourceNote?: string | null;
};

type TrainingPreferencesInput = {
  poolLengthM?: number | string | null;
  availableDays?: string[] | null;
  preferredWeeklySessionCount?: number | string | null;
  preferredSessionMinutes?: number | string | null;
};

type BuildResult<T> =
  | { kind: "empty" }
  | { kind: "invalid"; error: string }
  | { kind: "valid"; value: T };

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeInteger(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (!/^\d+$/.test(normalized)) return null;
  return Number.parseInt(normalized, 10);
}

function isValidIsoDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const asDate = new Date(Date.UTC(year, month - 1, day));
  return (
    asDate.getUTCFullYear() === year &&
    asDate.getUTCMonth() === month - 1 &&
    asDate.getUTCDate() === day
  );
}

export function formatCssSecondsPer100m(valueSeconds: number | null): string | null {
  if (!valueSeconds || valueSeconds <= 0) return null;
  const minutes = Math.floor(valueSeconds / 60);
  const seconds = valueSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getPoolLengthLabel(value: TrainingPoolLength | null): string | null {
  if (!value) return null;
  return TRAINING_POOL_LENGTH_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function getSessionDurationLabel(value: TrainingSessionDuration | null): string | null {
  if (!value) return null;
  return TRAINING_SESSION_DURATION_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function getWeekdayLabel(value: TrainingWeekday): string {
  return TRAINING_WEEKDAY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function normalizeWeekdays(input: string[] | null | undefined): TrainingWeekday[] {
  const normalized = Array.isArray(input)
    ? input.filter((value): value is TrainingWeekday =>
        TRAINING_WEEKDAY_VALUES.some((candidate) => candidate === value)
      )
    : [];

  const unique = Array.from(new Set(normalized));
  return TRAINING_WEEKDAY_VALUES.filter((weekday) => unique.includes(weekday));
}

export function buildCssMetricUpsert(
  input: CssMetricInput
): BuildResult<Omit<TrainingMetricInsert, "id" | "user_id" | "created_at" | "updated_at">> {
  const pace = normalizeText(input.pace);
  const recordedOn = normalizeNullableText(input.recordedOn);
  const sourceNote = normalizeNullableText(input.sourceNote);

  if (!pace && !recordedOn && !sourceNote) {
    return { kind: "empty" };
  }

  if (!pace) {
    return { kind: "invalid", error: "Add a CSS pace before saving." };
  }

  const paceMatch = /^(\d{1,2}):([0-5]\d)$/.exec(pace);
  if (!paceMatch) {
    return { kind: "invalid", error: "Use CSS pace format m:ss, for example 1:58." };
  }

  const minutes = Number.parseInt(paceMatch[1] ?? "0", 10);
  const seconds = Number.parseInt(paceMatch[2] ?? "0", 10);
  const valueSeconds = minutes * 60 + seconds;

  if (valueSeconds <= 0 || valueSeconds > 3600) {
    return { kind: "invalid", error: "CSS pace must be between 0:01 and 60:00." };
  }

  if (recordedOn && !isValidIsoDateOnly(recordedOn)) {
    return { kind: "invalid", error: "Use a valid CSS date in YYYY-MM-DD format." };
  }

  if (sourceNote && sourceNote.length > 280) {
    return { kind: "invalid", error: "CSS source note must be 280 characters or fewer." };
  }

  return {
    kind: "valid",
    value: {
      metric_key: "css",
      unit: "seconds_per_100m",
      value_seconds: valueSeconds,
      recorded_on: recordedOn,
      source_note: sourceNote,
    },
  };
}

export function buildTrainingPreferencesUpsert(
  input: TrainingPreferencesInput
): BuildResult<Omit<TrainingPreferencesInsert, "id" | "user_id" | "created_at" | "updated_at">> {
  const poolLengthM = normalizeInteger(input.poolLengthM);
  const preferredWeeklySessionCount = normalizeInteger(input.preferredWeeklySessionCount);
  const preferredSessionMinutes = normalizeInteger(input.preferredSessionMinutes);
  const availableDays = normalizeWeekdays(input.availableDays);

  const hasAnyValue =
    poolLengthM !== null ||
    preferredWeeklySessionCount !== null ||
    preferredSessionMinutes !== null ||
    availableDays.length > 0;

  if (!hasAnyValue) {
    return { kind: "empty" };
  }

  if (
    input.poolLengthM !== undefined &&
    input.poolLengthM !== null &&
    `${input.poolLengthM}`.trim() !== "" &&
    !TRAINING_POOL_LENGTH_VALUES.some((value) => value === poolLengthM)
  ) {
    return { kind: "invalid", error: "Pool length must be 25m or 50m." };
  }

  if (
    input.preferredWeeklySessionCount !== undefined &&
    input.preferredWeeklySessionCount !== null &&
    `${input.preferredWeeklySessionCount}`.trim() !== "" &&
    (preferredWeeklySessionCount === null ||
      preferredWeeklySessionCount < 1 ||
      preferredWeeklySessionCount > 14)
  ) {
    return {
      kind: "invalid",
      error: "Preferred weekly session count must be between 1 and 14.",
    };
  }

  if (
    input.preferredSessionMinutes !== undefined &&
    input.preferredSessionMinutes !== null &&
    `${input.preferredSessionMinutes}`.trim() !== "" &&
    !TRAINING_SESSION_DURATION_VALUES.some((value) => value === preferredSessionMinutes)
  ) {
    return {
      kind: "invalid",
      error: "Preferred session duration must match one of the supported options.",
    };
  }

  if (
    Array.isArray(input.availableDays) &&
    input.availableDays.length > 0 &&
    availableDays.length !== input.availableDays.length
  ) {
    return { kind: "invalid", error: "Available days contain an unsupported value." };
  }

  return {
    kind: "valid",
    value: {
      pool_length_m: poolLengthM as TrainingPoolLength | null,
      available_days: availableDays.length > 0 ? availableDays : null,
      preferred_weekly_session_count: preferredWeeklySessionCount,
      preferred_session_minutes:
        (preferredSessionMinutes as TrainingSessionDuration | null) ?? null,
    },
  };
}
