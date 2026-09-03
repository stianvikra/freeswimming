import {
  buildDrylandSetChipLabel,
  formatSecondsLabel,
  getDrylandSessionKindLabel,
  type DrylandExerciseDraft,
  type DrylandSessionDraft,
  type DrylandSessionKind,
} from "@/lib/dryland/shared";
import type { Database } from "@/types/database";

export const DRYLAND_MICRO_PLAN_STATUSES = ["active", "paused", "completed"] as const;
export const DRYLAND_MICRO_BLOCK_STATUSES = ["queued", "completed", "skipped"] as const;
export const DRYLAND_MICRO_RELEASE_MODES = ["available_now", "weekday", "manual"] as const;
export const DRYLAND_MICRO_TARGET_TYPES = ["reps", "duration"] as const;
export const DRYLAND_MICRO_HABIT_LINK_STATUSES = ["active", "paused", "ended"] as const;
export const DRYLAND_MICRO_HABIT_CREDIT_STATUSES = [
  "not_linked",
  "counted",
  "already_counted",
  "removed",
  "paused",
  "blocked",
] as const;
export const DRYLAND_MICRO_MAX_SOURCE_SESSIONS = 6;
export const DRYLAND_MICRO_MAX_UNITS = 80;

export type DrylandMicroPlanStatus = (typeof DRYLAND_MICRO_PLAN_STATUSES)[number];
export type DrylandMicroBlockStatus = (typeof DRYLAND_MICRO_BLOCK_STATUSES)[number];
export type DrylandMicroReleaseMode = (typeof DRYLAND_MICRO_RELEASE_MODES)[number];
export type DrylandMicroTargetType = (typeof DRYLAND_MICRO_TARGET_TYPES)[number];
export type DrylandMicroTargetUnit = "reps" | "sec";
export type DrylandMicroHabitLinkStatus = (typeof DRYLAND_MICRO_HABIT_LINK_STATUSES)[number];
export type DrylandMicroHabitCreditStatus = (typeof DRYLAND_MICRO_HABIT_CREDIT_STATUSES)[number];

export type DrylandMicroBlockSnapshot = {
  id: string;
  sourceDrylandSessionId: string | null;
  sourceSessionTitle: string;
  sourceSessionKind: DrylandSessionKind;
  sourceSessionIndex: number;
  sourceExerciseId: string;
  sourceExerciseIndex: number;
  sourceSetId: string;
  setIndex: number;
  title: string;
  summary: string;
  targetLabel: string;
  targetType: DrylandMicroTargetType;
  targetValue: number | null;
  targetUnit: DrylandMicroTargetUnit;
  loadKg: number | null;
  restSeconds: number | null;
  coachCue: string;
  releaseMode: DrylandMicroReleaseMode;
  releaseOffsetDays: number | null;
  releaseTime: string;
  releasedAt: string | null;
  isArchived: boolean;
  status: DrylandMicroBlockStatus;
  completedAt: string | null;
  skippedAt: string | null;
};

export type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];

export type DrylandMicroPlanRecord = {
  id: string;
  sourceDrylandSessionId: string | null;
  sourceSessionTitle: string;
  title: string;
  sessionKind: DrylandSessionKind;
  sourceSessionSnapshots: DrylandMicroSourceSnapshot[];
  releaseMode: DrylandMicroReleaseMode;
  releaseTime: string;
  status: DrylandMicroPlanStatus;
  timezone: string;
  weekStartsAt: string;
  weekEndsAt: string;
  blocks: DrylandMicroBlockSnapshot[];
  createdAt: string;
  updatedAt: string;
  progress: DrylandMicroPlanProgress;
  habitLink: DrylandMicroHabitLinkRecord | null;
};

export type DrylandMicroPlanProgress = {
  totalBlockCount: number;
  completedBlockCount: number;
  skippedBlockCount: number;
  remainingBlockCount: number;
  progressPercent: number;
};

export type DrylandMicroSourceSnapshot = {
  sourceDrylandSessionId: string | null;
  sourceSessionTitle: string;
  sourceSessionKind: DrylandSessionKind;
  sourceSessionIndex: number;
  releaseOffsetDays: number | null;
  releaseTime: string;
  unitCount: number;
  completedUnitCount: number;
  skippedUnitCount: number;
};

export type DrylandMicroHabitLinkRecord = {
  id: string;
  habitId: string;
  status: DrylandMicroHabitLinkStatus | "unsupported";
  habitDefinitionSupport: "supported" | "unsupported" | "unavailable";
  startsOn: string;
  pausedAt: string | null;
  resumedAt: string | null;
  endedAt: string | null;
  habitTitle: string | null;
  habitStatus: "active" | "archived" | "unsupported";
  habitMode: "build" | "quit" | "timed" | "unsupported";
  habitCadenceLabel: string | null;
  canCount: boolean;
};

export type DrylandMicroHabitCreditResult = {
  status: DrylandMicroHabitCreditStatus;
  code?: "UNSUPPORTED_HABIT_DEFINITION";
  message: string;
};

export type DrylandMicroPlanCreateRequestBody = {
  sourceDrylandSessionId?: unknown;
  sourceDrylandSessionIds?: unknown;
  title?: unknown;
  releaseMode?: unknown;
  releaseTime?: unknown;
  sourceReleaseOffsetDays?: unknown;
  timezone?: unknown;
};

export type DrylandMicroPlanPatchRequestBody = {
  blockId?: unknown;
  blockStatus?: unknown;
  releaseNow?: unknown;
  clearPlan?: unknown;
  completePausedHabitLink?: unknown;
  planStatus?: unknown;
  title?: unknown;
  sourceDrylandSessionIds?: unknown;
  releaseMode?: unknown;
  releaseTime?: unknown;
  sourceReleaseOffsetDays?: unknown;
  createRecurringHabit?: unknown;
  habitTitle?: unknown;
  habitStartDate?: unknown;
  habitLinkStatus?: unknown;
  selectedDate?: unknown;
  timezone?: unknown;
};

export type DrylandMicroPlanApiSuccess = {
  ok: true;
  plan: DrylandMicroPlanRecord;
  reusedExisting?: boolean;
  habitCredit?: DrylandMicroHabitCreditResult;
};

export type DrylandMicroPlanApiError = {
  ok: false;
  code?: "INVALID_TIMEZONE" | "INVALID_DATE" | "UNSUPPORTED_HABIT_DEFINITION";
  error: string;
};

export type DrylandMicroPlanApiResponse = DrylandMicroPlanApiSuccess | DrylandMicroPlanApiError;

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_TIMEZONE_LENGTH = 80;
const DEFAULT_RELEASE_TIME = "06:00";
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }

  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    return Math.round(Number.parseFloat(value.trim()) * 100) / 100;
  }

  return null;
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    return parsed > 0 ? parsed : null;
  }
  return null;
}

function normalizeOptionalIsoDateTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return Number.isFinite(Date.parse(trimmed)) ? trimmed : null;
}

function isMicroPlanStatus(value: unknown): value is DrylandMicroPlanStatus {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_PLAN_STATUSES.includes(value as DrylandMicroPlanStatus)
  );
}

export function isMicroHabitLinkStatus(value: unknown): value is DrylandMicroHabitLinkStatus {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_HABIT_LINK_STATUSES.includes(value as DrylandMicroHabitLinkStatus)
  );
}

export function isDrylandMicroWeeklyProgramComplete(blocks: DrylandMicroBlockSnapshot[]): boolean {
  const activeBlocks = blocks.filter((block) => !block.isArchived);
  return activeBlocks.length > 0 && activeBlocks.every((block) => block.status === "completed");
}

export function getDrylandMicroWeeklyProgramCreditBlockId(
  blocks: DrylandMicroBlockSnapshot[]
): string | null {
  return (
    blocks
      .slice()
      .reverse()
      .find((block) => !block.isArchived && block.status === "completed")?.id ?? null
  );
}

export function isMicroBlockStatus(value: unknown): value is DrylandMicroBlockStatus {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_BLOCK_STATUSES.includes(value as DrylandMicroBlockStatus)
  );
}

export function isMicroReleaseMode(value: unknown): value is DrylandMicroReleaseMode {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_RELEASE_MODES.includes(value as DrylandMicroReleaseMode)
  );
}

function isMicroTargetType(value: unknown): value is DrylandMicroTargetType {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_TARGET_TYPES.includes(value as DrylandMicroTargetType)
  );
}

function isDrylandSessionKind(value: unknown): value is DrylandSessionKind {
  return value === "strength" || value === "stretching";
}

export function normalizeDrylandMicroReleaseMode(value: unknown): DrylandMicroReleaseMode {
  return isMicroReleaseMode(value) ? value : "available_now";
}

export function normalizeDrylandMicroReleaseTime(value: unknown): string {
  const releaseTime = normalizeString(value);
  if (!/^\d{2}:\d{2}$/.test(releaseTime)) return DEFAULT_RELEASE_TIME;

  const [hoursRaw, minutesRaw] = releaseTime.split(":");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = Number.parseInt(minutesRaw ?? "", 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return DEFAULT_RELEASE_TIME;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function normalizeDrylandMicroSourceIds(
  sourceDrylandSessionIds: unknown,
  legacySourceDrylandSessionId?: unknown
): ParseResult<string[]> {
  const rawIds = Array.isArray(sourceDrylandSessionIds)
    ? sourceDrylandSessionIds
    : legacySourceDrylandSessionId !== undefined
      ? [legacySourceDrylandSessionId]
      : [];
  const sourceIds = rawIds
    .map((value) => normalizeString(value))
    .filter((value, index, list) => value.length > 0 && list.indexOf(value) === index);

  if (sourceIds.length === 0) {
    return { ok: false, error: "Select at least one dryland session." };
  }
  if (sourceIds.length > DRYLAND_MICRO_MAX_SOURCE_SESSIONS) {
    return {
      ok: false,
      error: `Select at most ${DRYLAND_MICRO_MAX_SOURCE_SESSIONS} dryland sessions.`,
    };
  }

  return { ok: true, value: sourceIds };
}

function normalizeReleaseOffsetDay(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6) {
    return value;
  }
  if (typeof value === "string" && /^[0-6]$/.test(value.trim())) {
    return Number.parseInt(value.trim(), 10);
  }
  return null;
}

export function getDrylandMicroWeekdayLabel(offsetDay: number | null) {
  if (offsetDay === null || offsetDay < 0 || offsetDay > 6) return "Unscheduled";
  return WEEKDAY_LABELS[offsetDay] ?? "Unscheduled";
}

export function normalizeDrylandMicroPlanTimezone(value: unknown): string {
  const timezone = normalizeString(value).slice(0, MAX_TIMEZONE_LENGTH);
  if (!timezone) return "UTC";

  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "UTC";
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return asUtc - date.getTime();
}

function zonedLocalTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let result = new Date(utcGuess - getTimeZoneOffsetMs(new Date(utcGuess), timeZone));
  result = new Date(utcGuess - getTimeZoneOffsetMs(result, timeZone));
  return result;
}

function addLocalDays(year: number, month: number, day: number, days: number) {
  const localDate = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate(),
  };
}

export function buildDrylandMicroPlanWeekWindow(now: Date, timeZoneInput: unknown) {
  const timezone = normalizeDrylandMicroPlanTimezone(timeZoneInput);
  const local = getTimeZoneParts(now, timezone);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day));
  const mondayOffset = (localDate.getUTCDay() + 6) % 7;
  const weekStartLocal = addLocalDays(local.year, local.month, local.day, -mondayOffset);
  const weekEndLocal = addLocalDays(
    weekStartLocal.year,
    weekStartLocal.month,
    weekStartLocal.day,
    7
  );

  return {
    timezone,
    weekStartsAt: zonedLocalTimeToUtc(
      timezone,
      weekStartLocal.year,
      weekStartLocal.month,
      weekStartLocal.day
    ).toISOString(),
    weekEndsAt: zonedLocalTimeToUtc(
      timezone,
      weekEndLocal.year,
      weekEndLocal.month,
      weekEndLocal.day
    ).toISOString(),
  };
}

function compactTargetAreas(exercise: DrylandExerciseDraft) {
  return exercise.targetAreas.slice(0, 3).join(" · ");
}

function firstUsefulSentence(value: string) {
  return value.split(".")[0]?.trim() || "";
}

function buildExerciseTargetLabel(exercise: DrylandExerciseDraft, sessionKind: DrylandSessionKind) {
  const setCount = exercise.sets.length;
  const setWord = sessionKind === "strength" ? "set" : "hold";
  const firstSet = exercise.sets[0] ?? null;
  const sharedSetLabel = firstSet ? buildDrylandSetChipLabel(firstSet, sessionKind) : "";
  const sameShape =
    firstSet &&
    exercise.sets.every((set) => buildDrylandSetChipLabel(set, sessionKind) === sharedSetLabel);
  const restLabel = firstSet?.restSeconds ? formatSecondsLabel(firstSet.restSeconds) : null;
  const parts = [`${setCount} ${setWord}${setCount === 1 ? "" : "s"}`];

  if (sameShape && sharedSetLabel) {
    parts.push(sharedSetLabel);
  }

  if (restLabel && !sharedSetLabel.includes("P:")) {
    parts.push(`${restLabel} rest`);
  }

  return parts.join(" · ");
}

function cleanIdSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "item";
}

function getDefaultReleaseOffsetDays(sourceCount: number): number[] {
  if (sourceCount <= 1) return [0];
  if (sourceCount === 2) return [0, 3];
  if (sourceCount === 3) return [0, 2, 4];
  if (sourceCount === 4) return [0, 1, 3, 5];
  return Array.from({ length: sourceCount }, (_, index) =>
    Math.min(6, Math.round((index * 6) / Math.max(1, sourceCount - 1)))
  );
}

function normalizeSourceReleaseOffsetMap(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(input)) {
    const normalized = normalizeReleaseOffsetDay(value);
    if (normalized !== null) {
      result[key] = normalized;
    }
  }
  return result;
}

function buildSetTarget(
  set: DrylandExerciseDraft["sets"][number],
  sessionKind: DrylandSessionKind
) {
  if (set.holdSeconds !== null) {
    return {
      targetType: "duration" as const,
      targetValue: set.holdSeconds,
      targetUnit: "sec" as const,
      targetLabel: formatSecondsLabel(set.holdSeconds) ?? `${set.holdSeconds} sec`,
    };
  }

  return {
    targetType: "reps" as const,
    targetValue: set.reps,
    targetUnit: "reps" as const,
    targetLabel: `${set.reps ?? 0} reps`,
    loadKg: sessionKind === "strength" ? set.loadKg : null,
  };
}

function buildMicroUnitTargetLabel(
  set: DrylandExerciseDraft["sets"][number],
  sessionKind: DrylandSessionKind
) {
  const target = buildSetTarget(set, sessionKind);
  const details: string[] = [target.targetLabel];
  if (set.loadKg) {
    details.push(`${set.loadKg}kg`);
  }
  if (set.restSeconds) {
    const restLabel = formatSecondsLabel(set.restSeconds);
    if (restLabel) details.push(`${restLabel} rest`);
  }
  return details.join(" · ");
}

export type DrylandMicroPlanSourceInput = {
  sourceDrylandSessionId: string | null;
  draft: DrylandSessionDraft;
};

export type DrylandMicroPlanBuildOptions = {
  releaseMode?: unknown;
  releaseTime?: unknown;
  sourceReleaseOffsetDays?: unknown;
};

export function buildDrylandMicroBlocksFromSources(
  sources: DrylandMicroPlanSourceInput[],
  options: DrylandMicroPlanBuildOptions = {}
): ParseResult<DrylandMicroBlockSnapshot[]> {
  if (sources.length === 0) {
    return { ok: false, error: "Select at least one source session." };
  }
  if (sources.length > DRYLAND_MICRO_MAX_SOURCE_SESSIONS) {
    return {
      ok: false,
      error: `A micro session can include at most ${DRYLAND_MICRO_MAX_SOURCE_SESSIONS} source sessions.`,
    };
  }

  const releaseMode = normalizeDrylandMicroReleaseMode(options.releaseMode);
  const releaseTime = normalizeDrylandMicroReleaseTime(options.releaseTime);
  const explicitReleaseDays = normalizeSourceReleaseOffsetMap(options.sourceReleaseOffsetDays);
  const defaultReleaseDays = getDefaultReleaseOffsetDays(sources.length);
  const blocks: DrylandMicroBlockSnapshot[] = [];

  for (const [sourceIndex, source] of sources.entries()) {
    const sourceKey = source.sourceDrylandSessionId ?? `source-${sourceIndex + 1}`;
    const releaseOffsetDays =
      releaseMode === "weekday"
        ? (explicitReleaseDays[sourceKey] ?? defaultReleaseDays[sourceIndex] ?? 0)
        : null;

    for (const [exerciseIndex, exercise] of source.draft.exercises.entries()) {
      const sourceExerciseId = exercise.id || `exercise-${exerciseIndex + 1}`;
      for (const [setIndex, set] of exercise.sets.entries()) {
        const sourceSetId = set.id || `set-${exerciseIndex + 1}-${setIndex + 1}`;
        const target = buildSetTarget(set, source.draft.sessionKind);
        const unitId = [
          "unit",
          cleanIdSegment(sourceKey),
          cleanIdSegment(sourceExerciseId),
          cleanIdSegment(sourceSetId),
          setIndex + 1,
        ].join("-");

        blocks.push({
          id: unitId,
          sourceDrylandSessionId: source.sourceDrylandSessionId,
          sourceSessionTitle: source.draft.title,
          sourceSessionKind: source.draft.sessionKind,
          sourceSessionIndex: sourceIndex,
          sourceExerciseId,
          sourceExerciseIndex: exerciseIndex,
          sourceSetId,
          setIndex,
          title: exercise.title,
          summary:
            exercise.summary ||
            compactTargetAreas(exercise) ||
            getDrylandSessionKindLabel(source.draft.sessionKind),
          targetLabel: buildMicroUnitTargetLabel(set, source.draft.sessionKind),
          targetType: target.targetType,
          targetValue: target.targetValue,
          targetUnit: target.targetUnit,
          loadKg: set.loadKg,
          restSeconds: set.restSeconds,
          coachCue:
            exercise.notes.trim() ||
            firstUsefulSentence(exercise.howTo) ||
            compactTargetAreas(exercise) ||
            "Move with control and stop if the movement feels wrong.",
          releaseMode,
          releaseOffsetDays,
          releaseTime,
          releasedAt: releaseMode === "available_now" ? new Date(0).toISOString() : null,
          isArchived: false,
          status: "queued",
          completedAt: null,
          skippedAt: null,
        });
      }
    }
  }

  if (blocks.length > DRYLAND_MICRO_MAX_UNITS) {
    return {
      ok: false,
      error: `A micro session can include at most ${DRYLAND_MICRO_MAX_UNITS} set units.`,
    };
  }

  return { ok: true, value: blocks };
}

export function buildDrylandMicroBlocksFromDraft(
  draft: DrylandSessionDraft
): DrylandMicroBlockSnapshot[] {
  const units = buildDrylandMicroBlocksFromSources([
    {
      sourceDrylandSessionId: null,
      draft,
    },
  ]);

  if (units.ok) return units.value;

  return draft.exercises.map((exercise, index) => {
    const sourceExerciseId = exercise.id || `exercise-${index + 1}`;
    return {
      id: `block-${index + 1}-${sourceExerciseId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`,
      sourceDrylandSessionId: null,
      sourceSessionTitle: draft.title,
      sourceSessionKind: draft.sessionKind,
      sourceSessionIndex: 0,
      sourceExerciseId,
      sourceExerciseIndex: index,
      sourceSetId: `set-${index + 1}-1`,
      setIndex: 0,
      title: exercise.title,
      summary:
        exercise.summary ||
        compactTargetAreas(exercise) ||
        getDrylandSessionKindLabel(draft.sessionKind),
      targetLabel: buildExerciseTargetLabel(exercise, draft.sessionKind),
      targetType: draft.sessionKind === "stretching" ? "duration" : "reps",
      targetValue: null,
      targetUnit: draft.sessionKind === "stretching" ? "sec" : "reps",
      loadKg: null,
      restSeconds: null,
      coachCue:
        exercise.notes.trim() ||
        firstUsefulSentence(exercise.howTo) ||
        compactTargetAreas(exercise) ||
        "Move with control and stop if the movement feels wrong.",
      releaseMode: "available_now",
      releaseOffsetDays: null,
      releaseTime: DEFAULT_RELEASE_TIME,
      releasedAt: new Date(0).toISOString(),
      isArchived: false,
      status: "queued",
      completedAt: null,
      skippedAt: null,
    };
  });
}

function normalizeBlock(value: unknown, index: number): ParseResult<DrylandMicroBlockSnapshot> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: `Micro block ${index + 1} is invalid.` };
  }

  const input = value as Record<string, unknown>;
  const title = normalizeString(input.title).slice(0, 120);
  if (!title) {
    return { ok: false, error: `Micro block ${index + 1} needs a title.` };
  }

  const sourceSessionKind = isDrylandSessionKind(input.sourceSessionKind)
    ? input.sourceSessionKind
    : "strength";
  const targetType = isMicroTargetType(input.targetType)
    ? input.targetType
    : sourceSessionKind === "stretching"
      ? "duration"
      : "reps";
  const releaseMode = normalizeDrylandMicroReleaseMode(input.releaseMode);
  const status = isMicroBlockStatus(input.status) ? input.status : "queued";
  const completedAt =
    status === "completed" ? (normalizeOptionalIsoDateTime(input.completedAt) ?? null) : null;
  const skippedAt =
    status === "skipped" ? (normalizeOptionalIsoDateTime(input.skippedAt) ?? null) : null;
  const sourceSessionIndex =
    typeof input.sourceSessionIndex === "number" && Number.isInteger(input.sourceSessionIndex)
      ? Math.max(0, input.sourceSessionIndex)
      : 0;
  const sourceExerciseIndex =
    typeof input.sourceExerciseIndex === "number" && Number.isInteger(input.sourceExerciseIndex)
      ? Math.max(0, input.sourceExerciseIndex)
      : index;
  const setIndex =
    typeof input.setIndex === "number" && Number.isInteger(input.setIndex)
      ? Math.max(0, input.setIndex)
      : 0;
  const releaseOffsetDays = normalizeReleaseOffsetDay(input.releaseOffsetDays);
  const releasedAt = normalizeOptionalIsoDateTime(input.releasedAt);
  const targetValue = normalizePositiveInteger(input.targetValue);

  return {
    ok: true,
    value: {
      id: normalizeString(input.id) || `block-${index + 1}`,
      sourceDrylandSessionId: normalizeString(input.sourceDrylandSessionId) || null,
      sourceSessionTitle:
        normalizeString(input.sourceSessionTitle).slice(0, 120) || "Source session",
      sourceSessionKind,
      sourceSessionIndex,
      sourceExerciseId: normalizeString(input.sourceExerciseId) || `exercise-${index + 1}`,
      sourceExerciseIndex,
      sourceSetId: normalizeString(input.sourceSetId) || `set-${index + 1}`,
      setIndex,
      title,
      summary: normalizeString(input.summary).slice(0, 240),
      targetLabel: normalizeString(input.targetLabel).slice(0, 160),
      targetType,
      targetValue,
      targetUnit: targetType === "duration" ? "sec" : "reps",
      loadKg: normalizeOptionalNumber(input.loadKg),
      restSeconds: normalizePositiveInteger(input.restSeconds),
      coachCue: normalizeString(input.coachCue).slice(0, 300),
      releaseMode,
      releaseOffsetDays: releaseMode === "weekday" ? releaseOffsetDays : null,
      releaseTime: normalizeDrylandMicroReleaseTime(input.releaseTime),
      releasedAt,
      isArchived: input.isArchived === true,
      status,
      completedAt,
      skippedAt,
    },
  };
}

export function normalizeDrylandMicroBlocks(
  input: unknown
): ParseResult<DrylandMicroBlockSnapshot[]> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "Micro plan needs at least one block." };
  }

  const blocks: DrylandMicroBlockSnapshot[] = [];
  for (const [index, blockValue] of input.entries()) {
    const normalized = normalizeBlock(blockValue, index);
    if (!normalized.ok) return normalized;
    blocks.push(normalized.value);
  }

  return { ok: true, value: blocks };
}

export function buildDrylandMicroSourceSnapshots(
  blocks: DrylandMicroBlockSnapshot[]
): DrylandMicroSourceSnapshot[] {
  const grouped = new Map<string, DrylandMicroSourceSnapshot>();

  for (const block of blocks) {
    if (block.isArchived) continue;

    const key = block.sourceDrylandSessionId ?? `source-${block.sourceSessionIndex}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.unitCount += 1;
      if (block.status === "completed") existing.completedUnitCount += 1;
      if (block.status === "skipped") existing.skippedUnitCount += 1;
      continue;
    }

    grouped.set(key, {
      sourceDrylandSessionId: block.sourceDrylandSessionId,
      sourceSessionTitle: block.sourceSessionTitle,
      sourceSessionKind: block.sourceSessionKind,
      sourceSessionIndex: block.sourceSessionIndex,
      releaseOffsetDays: block.releaseOffsetDays,
      releaseTime: block.releaseTime,
      unitCount: 1,
      completedUnitCount: block.status === "completed" ? 1 : 0,
      skippedUnitCount: block.status === "skipped" ? 1 : 0,
    });
  }

  return Array.from(grouped.values()).sort(
    (first, second) => first.sourceSessionIndex - second.sourceSessionIndex
  );
}

export function deriveDrylandMicroReleaseMode(
  blocks: DrylandMicroBlockSnapshot[]
): DrylandMicroReleaseMode {
  const firstActive = blocks.find((block) => !block.isArchived) ?? blocks[0] ?? null;
  return firstActive?.releaseMode ?? "available_now";
}

export function deriveDrylandMicroReleaseTime(blocks: DrylandMicroBlockSnapshot[]): string {
  const firstActive = blocks.find((block) => !block.isArchived) ?? blocks[0] ?? null;
  return firstActive?.releaseTime ?? DEFAULT_RELEASE_TIME;
}

export function buildDrylandMicroPlanProgress(
  blocks: DrylandMicroBlockSnapshot[]
): DrylandMicroPlanProgress {
  const totalBlockCount = blocks.length;
  const completedBlockCount = blocks.filter((block) => block.status === "completed").length;
  const skippedBlockCount = blocks.filter((block) => block.status === "skipped").length;
  const remainingBlockCount = blocks.filter((block) => block.status === "queued").length;

  return {
    totalBlockCount,
    completedBlockCount,
    skippedBlockCount,
    remainingBlockCount,
    progressPercent:
      totalBlockCount > 0 ? Math.round((completedBlockCount / totalBlockCount) * 100) : 0,
  };
}

export function deriveDrylandMicroPlanStatus(
  blocks: DrylandMicroBlockSnapshot[],
  preferredStatus: DrylandMicroPlanStatus
): DrylandMicroPlanStatus {
  const progress = buildDrylandMicroPlanProgress(blocks);
  if (progress.totalBlockCount > 0 && progress.completedBlockCount === progress.totalBlockCount) {
    return "completed";
  }
  return preferredStatus === "completed" ? "active" : preferredStatus;
}

export function applyDrylandMicroBlockStatus(
  blocks: DrylandMicroBlockSnapshot[],
  blockId: string,
  blockStatus: DrylandMicroBlockStatus,
  now = new Date()
): ParseResult<DrylandMicroBlockSnapshot[]> {
  let found = false;
  const timestamp = now.toISOString();
  const nextBlocks = blocks.map((block) => {
    if (block.id !== blockId) return block;
    found = true;

    if (blockStatus === "completed") {
      return {
        ...block,
        status: blockStatus,
        completedAt: block.completedAt ?? timestamp,
        skippedAt: null,
      };
    }

    if (blockStatus === "skipped") {
      return {
        ...block,
        status: blockStatus,
        completedAt: null,
        skippedAt: block.skippedAt ?? timestamp,
      };
    }

    return {
      ...block,
      status: blockStatus,
      completedAt: null,
      skippedAt: null,
    };
  });

  if (!found) {
    return { ok: false, error: "Micro block not found." };
  }

  return { ok: true, value: nextBlocks };
}

export function applyDrylandMicroBlockReleaseNow(
  blocks: DrylandMicroBlockSnapshot[],
  blockId: string,
  now = new Date()
): ParseResult<DrylandMicroBlockSnapshot[]> {
  let found = false;
  const timestamp = now.toISOString();
  const nextBlocks = blocks.map((block) => {
    if (block.id !== blockId) return block;
    found = true;

    return {
      ...block,
      releasedAt: block.releasedAt ?? timestamp,
    };
  });

  if (!found) {
    return { ok: false, error: "Micro block not found." };
  }

  return { ok: true, value: nextBlocks };
}

export function mergeDrylandMicroBlocksForPlanEdit(
  currentBlocks: DrylandMicroBlockSnapshot[],
  generatedBlocks: DrylandMicroBlockSnapshot[]
): DrylandMicroBlockSnapshot[] {
  const currentById = new Map(currentBlocks.map((block) => [block.id, block]));
  const nextBlocks = generatedBlocks.map((block) => {
    const current = currentById.get(block.id);
    if (!current) return block;
    const shouldPreserveRelease =
      current.releaseMode === block.releaseMode &&
      current.releaseOffsetDays === block.releaseOffsetDays &&
      current.releaseTime === block.releaseTime;

    return {
      ...block,
      status: current.status,
      completedAt: current.completedAt,
      skippedAt: current.skippedAt,
      releasedAt: shouldPreserveRelease
        ? (current.releasedAt ?? block.releasedAt)
        : block.releasedAt,
    };
  });

  const retainedHistory = currentBlocks
    .filter(
      (block) =>
        (block.status === "completed" || block.status === "skipped") &&
        !generatedBlocks.some((nextBlock) => nextBlock.id === block.id)
    )
    .map((block) => ({
      ...block,
      isArchived: true,
    }));

  return [...nextBlocks, ...retainedHistory];
}

export function getDrylandMicroBlockReleaseDate(
  plan: Pick<DrylandMicroPlanRecord, "timezone" | "weekStartsAt">,
  block: DrylandMicroBlockSnapshot
): Date | null {
  if (block.releaseMode === "available_now") {
    return new Date(plan.weekStartsAt);
  }

  if (block.releasedAt) {
    const released = new Date(block.releasedAt);
    return Number.isNaN(released.getTime()) ? null : released;
  }

  if (block.releaseMode === "manual" || block.releaseOffsetDays === null) {
    return null;
  }

  const weekStart = new Date(plan.weekStartsAt);
  if (Number.isNaN(weekStart.getTime())) return null;

  const local = getTimeZoneParts(weekStart, plan.timezone);
  const releaseLocal = addLocalDays(local.year, local.month, local.day, block.releaseOffsetDays);
  const [hourRaw, minuteRaw] = normalizeDrylandMicroReleaseTime(block.releaseTime).split(":");
  return zonedLocalTimeToUtc(
    plan.timezone,
    releaseLocal.year,
    releaseLocal.month,
    releaseLocal.day,
    Number.parseInt(hourRaw ?? "0", 10),
    Number.parseInt(minuteRaw ?? "0", 10)
  );
}

export function isDrylandMicroBlockAvailable(
  plan: Pick<DrylandMicroPlanRecord, "timezone" | "weekStartsAt">,
  block: DrylandMicroBlockSnapshot,
  now = new Date()
) {
  if (block.status !== "queued") return true;
  if (block.releaseMode === "available_now") return true;

  const releaseDate = getDrylandMicroBlockReleaseDate(plan, block);
  return releaseDate !== null && releaseDate.getTime() <= now.getTime();
}

export function buildDrylandMicroPlanRecord(
  row: DrylandMicroPlanRow,
  habitLink: DrylandMicroHabitLinkRecord | null = null
): DrylandMicroPlanRecord {
  const blocks = normalizeDrylandMicroBlocks(row.blocks);
  if (!blocks.ok) {
    throw new Error(`Stored dryland micro plan ${row.id} is invalid: ${blocks.error}`);
  }

  if (!isDrylandSessionKind(row.session_kind)) {
    throw new Error(`Stored dryland micro plan ${row.id} has an invalid session kind.`);
  }

  if (!isMicroPlanStatus(row.status)) {
    throw new Error(`Stored dryland micro plan ${row.id} has an invalid status.`);
  }

  return {
    id: row.id,
    sourceDrylandSessionId: row.source_dryland_session_id,
    sourceSessionTitle: row.source_session_title,
    title: row.title,
    sessionKind: row.session_kind,
    sourceSessionSnapshots: buildDrylandMicroSourceSnapshots(blocks.value),
    releaseMode: deriveDrylandMicroReleaseMode(blocks.value),
    releaseTime: deriveDrylandMicroReleaseTime(blocks.value),
    status: row.status,
    timezone: row.timezone,
    weekStartsAt: row.week_starts_at,
    weekEndsAt: row.week_ends_at,
    blocks: blocks.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: buildDrylandMicroPlanProgress(blocks.value),
    habitLink,
  };
}
