export const MAX_COURSE_PROGRESS_ROWS = 400;
const MAX_LESSON_ID_LENGTH = 120;
const MAX_VIDEO_SECONDS = 86_400;

export type CourseProgressRow = {
  lessonId: string;
  done: boolean;
  doneConfirmedAt: string | null;
  videoSeconds: number;
  updatedAt: string;
};

export type LocalCourseProgress = {
  doneLessonIds: string[];
  doneConfirmationByLessonId: Record<string, string>;
  videoProgressByLessonId: Record<string, number>;
};

export type CourseProgressLessonIdResolver = (lessonId: string) => string | null;

type NormalizeRowsOptions = {
  fallbackUpdatedAt?: string;
  maxRows?: number;
  resolveLessonId?: CourseProgressLessonIdResolver;
};

function normalizeLessonIdBase(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const lessonId = value.trim();
  if (!lessonId) return null;
  if (lessonId.length > MAX_LESSON_ID_LENGTH) return null;
  return lessonId;
}

function normalizeLessonId(
  value: unknown,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): string | null {
  const lessonId = normalizeLessonIdBase(value);
  if (!lessonId) return null;

  if (!options?.resolveLessonId) {
    return lessonId;
  }

  return normalizeLessonIdBase(options.resolveLessonId(lessonId));
}

function normalizeVideoSeconds(value: unknown): number {
  const raw =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(MAX_VIDEO_SECONDS, Math.floor(raw));
}

function normalizeUpdatedAt(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return fallback;
  return new Date(ts).toISOString();
}

function compareIso(a: string, b: string): number {
  const at = Date.parse(a);
  const bt = Date.parse(b);
  if (!Number.isFinite(at) && !Number.isFinite(bt)) return 0;
  if (!Number.isFinite(at)) return -1;
  if (!Number.isFinite(bt)) return 1;
  return at - bt;
}

function mergeProgressRow(
  existing: CourseProgressRow,
  incoming: CourseProgressRow
): CourseProgressRow {
  const mergedDone = existing.done || incoming.done;

  let doneConfirmedAt: string | null = null;
  if (mergedDone) {
    const left = existing.doneConfirmedAt;
    const right = incoming.doneConfirmedAt;
    if (left && right) {
      doneConfirmedAt = compareIso(left, right) >= 0 ? left : right;
    } else {
      doneConfirmedAt = left ?? right ?? null;
    }
  }

  return {
    lessonId: existing.lessonId,
    done: mergedDone,
    doneConfirmedAt,
    videoSeconds: Math.max(existing.videoSeconds, incoming.videoSeconds),
    updatedAt:
      compareIso(existing.updatedAt, incoming.updatedAt) >= 0
        ? existing.updatedAt
        : incoming.updatedAt,
  };
}

type ProgressLike = {
  lessonId?: unknown;
  lesson_id?: unknown;
  done?: unknown;
  doneConfirmedAt?: unknown;
  done_confirmed_at?: unknown;
  videoSeconds?: unknown;
  video_seconds?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
};

function normalizeDoneConfirmedAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return null;
  return new Date(ts).toISOString();
}

export function normalizeCourseProgressRows(
  input: unknown,
  options?: NormalizeRowsOptions
): CourseProgressRow[] {
  if (!Array.isArray(input)) return [];

  const fallback = normalizeUpdatedAt(options?.fallbackUpdatedAt, new Date().toISOString());
  const maxRows = Math.max(0, options?.maxRows ?? input.length);
  const merged = new Map<string, CourseProgressRow>();

  for (let i = 0; i < input.length && i < maxRows; i += 1) {
    const candidate = input[i];
    if (!candidate || typeof candidate !== "object") continue;

    const row = candidate as ProgressLike;
    const lessonId = normalizeLessonId(row.lessonId ?? row.lesson_id, {
      resolveLessonId: options?.resolveLessonId,
    });
    if (!lessonId) continue;

    const normalizedRow: CourseProgressRow = {
      lessonId,
      done: row.done === true,
      doneConfirmedAt: null,
      videoSeconds: normalizeVideoSeconds(row.videoSeconds ?? row.video_seconds),
      updatedAt: normalizeUpdatedAt(row.updatedAt ?? row.updated_at, fallback),
    };
    if (normalizedRow.done) {
      normalizedRow.doneConfirmedAt = normalizeDoneConfirmedAt(
        row.doneConfirmedAt ?? row.done_confirmed_at
      );
    }

    const existing = merged.get(lessonId);
    if (!existing) {
      merged.set(lessonId, normalizedRow);
      continue;
    }

    merged.set(lessonId, mergeProgressRow(existing, normalizedRow));
  }

  return Array.from(merged.values()).sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

export function normalizeDoneLessonIds(
  input: unknown,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): string[] {
  if (!Array.isArray(input)) return [];

  const unique = new Set<string>();
  for (const item of input) {
    const lessonId = normalizeLessonId(item, {
      resolveLessonId: options?.resolveLessonId,
    });
    if (lessonId) unique.add(lessonId);
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function normalizeVideoProgressRecord(
  input: unknown,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): Record<string, number> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const normalized: Record<string, number> = {};
  for (const [rawLessonId, rawValue] of Object.entries(input)) {
    const lessonId = normalizeLessonId(rawLessonId, {
      resolveLessonId: options?.resolveLessonId,
    });
    if (!lessonId) continue;

    const seconds = normalizeVideoSeconds(rawValue);
    if (seconds <= 0) continue;

    normalized[lessonId] = seconds;
  }

  return normalized;
}

export function normalizeDoneConfirmationRecord(
  input: unknown,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [rawLessonId, rawValue] of Object.entries(input)) {
    const lessonId = normalizeLessonId(rawLessonId, {
      resolveLessonId: options?.resolveLessonId,
    });
    if (!lessonId) continue;
    const confirmedAt = normalizeDoneConfirmedAt(rawValue);
    if (!confirmedAt) continue;
    normalized[lessonId] = confirmedAt;
  }

  return normalized;
}

function normalizeKnownLessonIds(
  knownLessonIds: Iterable<string> | undefined,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): Set<string> {
  const normalized = new Set<string>();
  if (!knownLessonIds) return normalized;

  for (const lessonIdRaw of knownLessonIds) {
    const lessonId = normalizeLessonId(lessonIdRaw, {
      resolveLessonId: options?.resolveLessonId,
    });
    if (!lessonId) continue;
    normalized.add(lessonId);
  }

  return normalized;
}

export function buildCourseProgressRowsFromLocal(
  local: LocalCourseProgress,
  options?: {
    knownLessonIds?: Iterable<string>;
    updatedAt?: string;
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): CourseProgressRow[] {
  const fallbackUpdatedAt = normalizeUpdatedAt(options?.updatedAt, new Date().toISOString());
  const doneLessonIds = normalizeDoneLessonIds(local.doneLessonIds, {
    resolveLessonId: options?.resolveLessonId,
  });
  const doneConfirmationByLessonId = normalizeDoneConfirmationRecord(
    local.doneConfirmationByLessonId,
    {
      resolveLessonId: options?.resolveLessonId,
    }
  );
  const doneSet = new Set(doneLessonIds);
  const videoProgress = normalizeVideoProgressRecord(local.videoProgressByLessonId, {
    resolveLessonId: options?.resolveLessonId,
  });
  const knownLessonIds = normalizeKnownLessonIds(options?.knownLessonIds, {
    resolveLessonId: options?.resolveLessonId,
  });

  for (const lessonId of doneSet) {
    knownLessonIds.add(lessonId);
  }

  for (const lessonId of Object.keys(videoProgress)) {
    knownLessonIds.add(lessonId);
  }

  const rows: CourseProgressRow[] = [];
  for (const lessonId of knownLessonIds) {
    const done = doneSet.has(lessonId);
    const videoSeconds = videoProgress[lessonId] ?? 0;

    // Keep previously-known lesson rows even when done/video reset, so server can clear stale values.
    rows.push({
      lessonId,
      done,
      doneConfirmedAt: done ? (doneConfirmationByLessonId[lessonId] ?? null) : null,
      videoSeconds,
      updatedAt: fallbackUpdatedAt,
    });
  }

  return rows.sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

export function buildLocalCourseProgressFromRows(
  rows: unknown,
  options?: {
    resolveLessonId?: CourseProgressLessonIdResolver;
  }
): LocalCourseProgress {
  const normalizedRows = normalizeCourseProgressRows(rows, {
    resolveLessonId: options?.resolveLessonId,
  });

  const doneLessonIds: string[] = [];
  const doneConfirmationByLessonId: Record<string, string> = {};
  const videoProgressByLessonId: Record<string, number> = {};

  for (const row of normalizedRows) {
    if (row.done) doneLessonIds.push(row.lessonId);
    if (row.done && row.doneConfirmedAt) {
      doneConfirmationByLessonId[row.lessonId] = row.doneConfirmedAt;
    }
    if (row.videoSeconds > 0) {
      videoProgressByLessonId[row.lessonId] = row.videoSeconds;
    }
  }

  return {
    doneLessonIds,
    doneConfirmationByLessonId,
    videoProgressByLessonId,
  };
}

export function mergeCourseProgressRows(
  localRows: unknown,
  remoteRows: unknown
): CourseProgressRow[] {
  return normalizeCourseProgressRows(
    [...normalizeCourseProgressRows(localRows), ...normalizeCourseProgressRows(remoteRows)],
    {
      maxRows: MAX_COURSE_PROGRESS_ROWS,
    }
  );
}

export function areCourseProgressRowsEqual(localRows: unknown, remoteRows: unknown): boolean {
  const left = normalizeCourseProgressRows(localRows);
  const right = normalizeCourseProgressRows(remoteRows);

  if (left.length !== right.length) return false;

  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (a.lessonId !== b.lessonId) return false;
    if (a.done !== b.done) return false;
    if ((a.doneConfirmedAt ?? null) !== (b.doneConfirmedAt ?? null)) return false;
    if (a.videoSeconds !== b.videoSeconds) return false;
  }

  return true;
}

export function resolveCourseDirtyLessonIdsAfterHydrate(options: {
  existingDirtyLessonIds?: Iterable<string>;
  mergedRows: unknown;
  remoteRows: unknown;
}): string[] {
  const dirtyLessonIds = normalizeKnownLessonIds(options.existingDirtyLessonIds);
  const mergedRows = normalizeCourseProgressRows(options.mergedRows, {
    maxRows: MAX_COURSE_PROGRESS_ROWS,
  });

  if (!areCourseProgressRowsEqual(mergedRows, options.remoteRows)) {
    for (const row of mergedRows) {
      dirtyLessonIds.add(row.lessonId);
    }
  }

  return Array.from(dirtyLessonIds).sort((a, b) => a.localeCompare(b));
}
