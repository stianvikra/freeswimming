export const MAX_COURSE_PROGRESS_ROWS = 400;
const MAX_LESSON_ID_LENGTH = 120;
const MAX_VIDEO_SECONDS = 86_400;

export type CourseProgressRow = {
  lessonId: string;
  done: boolean;
  videoSeconds: number;
  updatedAt: string;
};

export type LocalCourseProgress = {
  doneLessonIds: string[];
  videoProgressByLessonId: Record<string, number>;
};

type NormalizeRowsOptions = {
  fallbackUpdatedAt?: string;
  maxRows?: number;
};

function normalizeLessonId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const lessonId = value.trim();
  if (!lessonId) return null;
  if (lessonId.length > MAX_LESSON_ID_LENGTH) return null;
  return lessonId;
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
  return {
    lessonId: existing.lessonId,
    done: existing.done || incoming.done,
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
  videoSeconds?: unknown;
  video_seconds?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
};

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
    const lessonId = normalizeLessonId(row.lessonId ?? row.lesson_id);
    if (!lessonId) continue;

    const normalizedRow: CourseProgressRow = {
      lessonId,
      done: row.done === true,
      videoSeconds: normalizeVideoSeconds(row.videoSeconds ?? row.video_seconds),
      updatedAt: normalizeUpdatedAt(row.updatedAt ?? row.updated_at, fallback),
    };

    const existing = merged.get(lessonId);
    if (!existing) {
      merged.set(lessonId, normalizedRow);
      continue;
    }

    merged.set(lessonId, mergeProgressRow(existing, normalizedRow));
  }

  return Array.from(merged.values()).sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

export function normalizeDoneLessonIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const unique = new Set<string>();
  for (const item of input) {
    const lessonId = normalizeLessonId(item);
    if (lessonId) unique.add(lessonId);
  }

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function normalizeVideoProgressRecord(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const normalized: Record<string, number> = {};
  for (const [rawLessonId, rawValue] of Object.entries(input)) {
    const lessonId = normalizeLessonId(rawLessonId);
    if (!lessonId) continue;

    const seconds = normalizeVideoSeconds(rawValue);
    if (seconds <= 0) continue;

    normalized[lessonId] = seconds;
  }

  return normalized;
}

function normalizeKnownLessonIds(knownLessonIds: Iterable<string> | undefined): Set<string> {
  const normalized = new Set<string>();
  if (!knownLessonIds) return normalized;

  for (const lessonIdRaw of knownLessonIds) {
    const lessonId = normalizeLessonId(lessonIdRaw);
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
  }
): CourseProgressRow[] {
  const fallbackUpdatedAt = normalizeUpdatedAt(options?.updatedAt, new Date().toISOString());
  const doneLessonIds = normalizeDoneLessonIds(local.doneLessonIds);
  const doneSet = new Set(doneLessonIds);
  const videoProgress = normalizeVideoProgressRecord(local.videoProgressByLessonId);
  const knownLessonIds = normalizeKnownLessonIds(options?.knownLessonIds);

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
      videoSeconds,
      updatedAt: fallbackUpdatedAt,
    });
  }

  return rows.sort((a, b) => a.lessonId.localeCompare(b.lessonId));
}

export function buildLocalCourseProgressFromRows(rows: unknown): LocalCourseProgress {
  const normalizedRows = normalizeCourseProgressRows(rows);

  const doneLessonIds: string[] = [];
  const videoProgressByLessonId: Record<string, number> = {};

  for (const row of normalizedRows) {
    if (row.done) doneLessonIds.push(row.lessonId);
    if (row.videoSeconds > 0) {
      videoProgressByLessonId[row.lessonId] = row.videoSeconds;
    }
  }

  return {
    doneLessonIds,
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
