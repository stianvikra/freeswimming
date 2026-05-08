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

export type DrylandMicroPlanStatus = (typeof DRYLAND_MICRO_PLAN_STATUSES)[number];
export type DrylandMicroBlockStatus = (typeof DRYLAND_MICRO_BLOCK_STATUSES)[number];

export type DrylandMicroBlockSnapshot = {
  id: string;
  sourceExerciseId: string;
  title: string;
  summary: string;
  targetLabel: string;
  coachCue: string;
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
  status: DrylandMicroPlanStatus;
  timezone: string;
  weekStartsAt: string;
  weekEndsAt: string;
  blocks: DrylandMicroBlockSnapshot[];
  createdAt: string;
  updatedAt: string;
  progress: DrylandMicroPlanProgress;
};

export type DrylandMicroPlanProgress = {
  totalBlockCount: number;
  completedBlockCount: number;
  skippedBlockCount: number;
  remainingBlockCount: number;
  progressPercent: number;
};

export type DrylandMicroPlanCreateRequestBody = {
  sourceDrylandSessionId?: unknown;
  timezone?: unknown;
};

export type DrylandMicroPlanPatchRequestBody = {
  blockId?: unknown;
  blockStatus?: unknown;
  planStatus?: unknown;
};

export type DrylandMicroPlanApiSuccess = {
  ok: true;
  plan: DrylandMicroPlanRecord;
  reusedExisting?: boolean;
};

export type DrylandMicroPlanApiError = {
  ok: false;
  error: string;
};

export type DrylandMicroPlanApiResponse = DrylandMicroPlanApiSuccess | DrylandMicroPlanApiError;

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_TIMEZONE_LENGTH = 80;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

export function isMicroBlockStatus(value: unknown): value is DrylandMicroBlockStatus {
  return (
    typeof value === "string" &&
    DRYLAND_MICRO_BLOCK_STATUSES.includes(value as DrylandMicroBlockStatus)
  );
}

function isDrylandSessionKind(value: unknown): value is DrylandSessionKind {
  return value === "strength" || value === "stretching";
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

export function buildDrylandMicroBlocksFromDraft(
  draft: DrylandSessionDraft
): DrylandMicroBlockSnapshot[] {
  return draft.exercises.map((exercise, index) => {
    const sourceExerciseId = exercise.id || `exercise-${index + 1}`;
    return {
      id: `block-${index + 1}-${sourceExerciseId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`,
      sourceExerciseId,
      title: exercise.title,
      summary:
        exercise.summary ||
        compactTargetAreas(exercise) ||
        getDrylandSessionKindLabel(draft.sessionKind),
      targetLabel: buildExerciseTargetLabel(exercise, draft.sessionKind),
      coachCue:
        exercise.notes.trim() ||
        firstUsefulSentence(exercise.howTo) ||
        compactTargetAreas(exercise) ||
        "Move with control and stop if the movement feels wrong.",
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

  const status = isMicroBlockStatus(input.status) ? input.status : "queued";
  const completedAt =
    status === "completed" ? (normalizeOptionalIsoDateTime(input.completedAt) ?? null) : null;
  const skippedAt =
    status === "skipped" ? (normalizeOptionalIsoDateTime(input.skippedAt) ?? null) : null;

  return {
    ok: true,
    value: {
      id: normalizeString(input.id) || `block-${index + 1}`,
      sourceExerciseId: normalizeString(input.sourceExerciseId) || `exercise-${index + 1}`,
      title,
      summary: normalizeString(input.summary).slice(0, 240),
      targetLabel: normalizeString(input.targetLabel).slice(0, 160),
      coachCue: normalizeString(input.coachCue).slice(0, 300),
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

export function buildDrylandMicroPlanRecord(row: DrylandMicroPlanRow): DrylandMicroPlanRecord {
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
    status: row.status,
    timezone: row.timezone,
    weekStartsAt: row.week_starts_at,
    weekEndsAt: row.week_ends_at,
    blocks: blocks.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: buildDrylandMicroPlanProgress(blocks.value),
  };
}
