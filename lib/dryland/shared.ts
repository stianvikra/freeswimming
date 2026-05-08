import type { Database } from "@/types/database";
import type { DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";

export const DRYLAND_SESSION_KINDS = ["strength", "stretching"] as const;
export const DRYLAND_SOURCE_KINDS = ["manual"] as const;
export const DRYLAND_SESSION_STATUSES = ["draft", "in_progress", "completed"] as const;
export const DRYLAND_EXERCISE_SOURCES = ["bank", "custom"] as const;
export const DRYLAND_EXERCISE_MEDIA_TYPES = ["none", "image", "video"] as const;
export const DRYLAND_EXERCISE_ACCENTS = ["blue", "teal", "amber", "rose", "emerald"] as const;
export const DRYLAND_MAX_SETS_PER_EXERCISE = 20;

export type DrylandSessionKind = (typeof DRYLAND_SESSION_KINDS)[number];
export type DrylandSourceKind = (typeof DRYLAND_SOURCE_KINDS)[number];
export type DrylandSessionStatus = (typeof DRYLAND_SESSION_STATUSES)[number];
export type DrylandExerciseSource = (typeof DRYLAND_EXERCISE_SOURCES)[number];
export type DrylandExerciseMediaType = (typeof DRYLAND_EXERCISE_MEDIA_TYPES)[number];
export type DrylandExerciseAccent = (typeof DRYLAND_EXERCISE_ACCENTS)[number];

export type DrylandSetDraft = {
  id: string;
  reps: number | null;
  holdSeconds: number | null;
  loadKg: number | null;
  restSeconds: number | null;
  isCompleted: boolean;
  completedAt: string | null;
};

export type DrylandExerciseDraft = {
  id: string;
  source: DrylandExerciseSource;
  bankExerciseId: string | null;
  title: string;
  summary: string;
  howTo: string;
  targetAreas: string[];
  accent: DrylandExerciseAccent;
  mediaType: DrylandExerciseMediaType;
  mediaUrl: string | null;
  mediaPosterUrl: string | null;
  mediaLabel: string | null;
  notes: string;
  sets: DrylandSetDraft[];
};

export type DrylandSessionDraft = {
  version: 1;
  sessionKind: DrylandSessionKind;
  title: string;
  description: string;
  focusText: string | null;
  startedAt: string | null;
  completedAt: string | null;
  actualDurationSeconds: number | null;
  exercises: DrylandExerciseDraft[];
};

export type DrylandSessionRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];

export type DrylandSessionSummary = {
  id: string;
  title: string;
  sessionKind: DrylandSessionKind;
  status: DrylandSessionStatus;
  updatedAt: string;
  completedAt: string | null;
  exerciseCount: number;
  setCount: number;
  actualDurationSeconds: number | null;
};

export type DrylandSessionRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceKind: DrylandSourceKind;
  status: DrylandSessionStatus;
  draft: DrylandSessionDraft;
};

export type DrylandLibrarySnapshot = {
  schemaReady: boolean;
  microPlanSchemaReady: boolean;
  loadError: string | null;
  microPlanLoadError: string | null;
  selectedSession: DrylandSessionRecord | null;
  selectedSessionMissing: boolean;
  recentSessions: DrylandSessionSummary[];
  microPlan: DrylandMicroPlanRecord | null;
};

export type DrylandSaveRequestBody = {
  draft?: unknown;
  sessionKind?: unknown;
  sourceKind?: unknown;
};

export type DrylandSaveApiSuccess = {
  ok: true;
  session: DrylandSessionRecord;
  summary: DrylandSessionSummary;
};

export type DrylandSaveApiError = {
  ok: false;
  error: string;
};

export type DrylandSaveApiResponse = DrylandSaveApiSuccess | DrylandSaveApiError;

export type DrylandDeleteApiSuccess = {
  ok: true;
  deletedSessionId: string;
};

export type DrylandDeleteApiError = {
  ok: false;
  error: string;
};

export type DrylandDeleteApiResponse = DrylandDeleteApiSuccess | DrylandDeleteApiError;

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function isIsoDateTime(value: string | null): value is string {
  if (!value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function normalizeOptionalIsoDateTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isIsoDateTime(trimmed) ? trimmed : null;
}

function normalizePositiveInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    return parsed > 0 ? parsed : null;
  }

  return null;
}

function normalizeNonNegativeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value * 100) / 100;
  }

  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    return Math.round(Number.parseFloat(value.trim()) * 100) / 100;
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalizeString(entry))
    .filter((entry, index, list) => entry.length > 0 && list.indexOf(entry) === index)
    .slice(0, 8);
}

function isSessionKind(value: unknown): value is DrylandSessionKind {
  return typeof value === "string" && DRYLAND_SESSION_KINDS.includes(value as DrylandSessionKind);
}

function isExerciseSource(value: unknown): value is DrylandExerciseSource {
  return (
    typeof value === "string" && DRYLAND_EXERCISE_SOURCES.includes(value as DrylandExerciseSource)
  );
}

function isMediaType(value: unknown): value is DrylandExerciseMediaType {
  return (
    typeof value === "string" &&
    DRYLAND_EXERCISE_MEDIA_TYPES.includes(value as DrylandExerciseMediaType)
  );
}

function isAccent(value: unknown): value is DrylandExerciseAccent {
  return (
    typeof value === "string" && DRYLAND_EXERCISE_ACCENTS.includes(value as DrylandExerciseAccent)
  );
}

function buildSessionStatus(draft: DrylandSessionDraft): DrylandSessionStatus {
  if (draft.completedAt) return "completed";
  if (draft.startedAt) return "in_progress";
  return "draft";
}

function normalizeSet(
  value: unknown,
  sessionKind: DrylandSessionKind,
  exerciseIndex: number,
  setIndex: number
): ParseResult<DrylandSetDraft> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: `Set ${setIndex + 1} in exercise ${exerciseIndex + 1} is invalid.` };
  }

  const input = value as Record<string, unknown>;
  const id = normalizeString(input.id) || `set-${exerciseIndex + 1}-${setIndex + 1}`;
  const reps = normalizePositiveInteger(input.reps);
  const holdSeconds = normalizePositiveInteger(input.holdSeconds);
  const loadKg = normalizeNonNegativeNumber(input.loadKg);
  const restSeconds = normalizePositiveInteger(input.restSeconds);
  const isCompleted = input.isCompleted === true;
  const completedAt = isCompleted
    ? (normalizeOptionalIsoDateTime(input.completedAt) ?? new Date().toISOString())
    : null;

  if (sessionKind === "strength") {
    if (reps === null) {
      return { ok: false, error: `Strength sets require reps for exercise ${exerciseIndex + 1}.` };
    }
    return {
      ok: true,
      value: {
        id,
        reps,
        holdSeconds: null,
        loadKg,
        restSeconds,
        isCompleted,
        completedAt,
      },
    };
  }

  if (holdSeconds === null) {
    return {
      ok: false,
      error: `Stretching sets require hold time for exercise ${exerciseIndex + 1}.`,
    };
  }

  return {
    ok: true,
    value: {
      id,
      reps: null,
      holdSeconds,
      loadKg: null,
      restSeconds,
      isCompleted,
      completedAt,
    },
  };
}

function normalizeExercise(
  value: unknown,
  sessionKind: DrylandSessionKind,
  index: number
): ParseResult<DrylandExerciseDraft> {
  if (!value || typeof value !== "object") {
    return { ok: false, error: `Exercise ${index + 1} is invalid.` };
  }

  const input = value as Record<string, unknown>;
  const source = isExerciseSource(input.source) ? input.source : "custom";
  const title = normalizeString(input.title);
  if (!title || title.length > 120) {
    return { ok: false, error: `Exercise ${index + 1} needs a title under 120 characters.` };
  }

  const rawSets = Array.isArray(input.sets) ? input.sets : [];
  if (rawSets.length === 0) {
    return { ok: false, error: `Exercise ${index + 1} needs at least one set.` };
  }
  if (rawSets.length > DRYLAND_MAX_SETS_PER_EXERCISE) {
    return {
      ok: false,
      error: `Exercise ${index + 1} can have at most ${DRYLAND_MAX_SETS_PER_EXERCISE} sets.`,
    };
  }

  const sets: DrylandSetDraft[] = [];
  for (const [setIndex, setValue] of rawSets.entries()) {
    const normalizedSet = normalizeSet(setValue, sessionKind, index, setIndex);
    if (!normalizedSet.ok) return normalizedSet;
    sets.push(normalizedSet.value);
  }

  return {
    ok: true,
    value: {
      id: normalizeString(input.id) || `exercise-${index + 1}`,
      source,
      bankExerciseId: source === "bank" ? normalizeOptionalString(input.bankExerciseId) : null,
      title,
      summary: normalizeString(input.summary).slice(0, 240),
      howTo: normalizeString(input.howTo).slice(0, 600),
      targetAreas: normalizeStringArray(input.targetAreas),
      accent: isAccent(input.accent)
        ? input.accent
        : sessionKind === "strength"
          ? "amber"
          : "emerald",
      mediaType: isMediaType(input.mediaType) ? input.mediaType : "none",
      mediaUrl: normalizeOptionalString(input.mediaUrl),
      mediaPosterUrl: normalizeOptionalString(input.mediaPosterUrl),
      mediaLabel: normalizeOptionalString(input.mediaLabel),
      notes: normalizeString(input.notes).slice(0, 300),
      sets,
    },
  };
}

export function normalizeDrylandSessionDraft(input: unknown): ParseResult<DrylandSessionDraft> {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Dryland draft payload is invalid." };
  }

  const value = input as Record<string, unknown>;
  const sessionKind = isSessionKind(value.sessionKind) ? value.sessionKind : null;
  if (!sessionKind) {
    return { ok: false, error: "Dryland session kind is required." };
  }

  const title = normalizeString(value.title);
  if (!title || title.length > 120) {
    return { ok: false, error: "Dryland session title must be between 1 and 120 characters." };
  }

  const description = normalizeString(value.description).slice(0, 600);
  const focusText = normalizeOptionalString(value.focusText)?.slice(0, 160) ?? null;
  const startedAt = normalizeOptionalIsoDateTime(value.startedAt);
  const completedAt = normalizeOptionalIsoDateTime(value.completedAt);
  const actualDurationSeconds = normalizeNonNegativeNumber(value.actualDurationSeconds);

  if (startedAt && completedAt && Date.parse(completedAt) < Date.parse(startedAt)) {
    return { ok: false, error: "Completed time cannot be earlier than started time." };
  }

  const rawExercises = Array.isArray(value.exercises) ? value.exercises : [];
  if (rawExercises.length === 0) {
    return { ok: false, error: "Add at least one exercise before saving this session." };
  }

  const exercises: DrylandExerciseDraft[] = [];
  for (const [index, exerciseValue] of rawExercises.entries()) {
    const normalizedExercise = normalizeExercise(exerciseValue, sessionKind, index);
    if (!normalizedExercise.ok) return normalizedExercise;
    exercises.push(normalizedExercise.value);
  }

  return {
    ok: true,
    value: {
      version: 1,
      sessionKind,
      title,
      description,
      focusText,
      startedAt,
      completedAt,
      actualDurationSeconds:
        actualDurationSeconds === null ? null : Math.round(actualDurationSeconds),
      exercises,
    },
  };
}

export function getDrylandSessionKindLabel(sessionKind: DrylandSessionKind) {
  return sessionKind === "strength" ? "Strength session" : "Stretching session";
}

export function getDrylandStatusLabel(status: DrylandSessionStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In progress";
    default:
      return "Draft";
  }
}

export function buildDrylandSummary(draft: DrylandSessionDraft) {
  const exerciseCount = draft.exercises.length;
  const setCount = draft.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  return {
    exerciseCount,
    setCount,
    completedSetCount: draft.exercises.reduce(
      (total, exercise) => total + exercise.sets.filter((set) => set.isCompleted).length,
      0
    ),
  };
}

export function formatSecondsLabel(totalSeconds: number | null | undefined) {
  if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return null;
  }

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds} sec`;
}

export function buildDrylandSetChipLabel(
  set: DrylandSetDraft,
  sessionKind: DrylandSessionKind
): string {
  const main =
    sessionKind === "strength"
      ? `${set.reps ?? 0}${set.loadKg ? ` @ ${set.loadKg}kg` : ""}`
      : `${set.holdSeconds ?? 0}s`;
  const pause = set.restSeconds ? ` P: ${formatSecondsLabel(set.restSeconds)}` : "";
  return `${main}${pause}`;
}

export type DrylandExecutionSummary = ReturnType<typeof buildDrylandSummary> & {
  remainingSetCount: number;
  progressPercent: number;
  nextSet: {
    exerciseId: string;
    exerciseIndex: number;
    exerciseTitle: string;
    setId: string;
    setIndex: number;
    label: string;
  } | null;
};

export function buildDrylandExecutionSummary(draft: DrylandSessionDraft): DrylandExecutionSummary {
  const summary = buildDrylandSummary(draft);
  const remainingSetCount = Math.max(0, summary.setCount - summary.completedSetCount);
  const progressPercent =
    summary.setCount > 0 ? Math.round((summary.completedSetCount / summary.setCount) * 100) : 0;
  let nextSet: DrylandExecutionSummary["nextSet"] = null;

  for (const [exerciseIndex, exercise] of draft.exercises.entries()) {
    const setIndex = exercise.sets.findIndex((set) => !set.isCompleted);
    if (setIndex < 0) continue;

    const set = exercise.sets[setIndex];
    if (!set) continue;

    nextSet = {
      exerciseId: exercise.id,
      exerciseIndex,
      exerciseTitle: exercise.title,
      setId: set.id,
      setIndex,
      label: buildDrylandSetChipLabel(set, draft.sessionKind),
    };
    break;
  }

  return {
    ...summary,
    remainingSetCount,
    progressPercent,
    nextSet,
  };
}

export function buildDrylandSessionSummarySubtitle(summary: DrylandSessionSummary) {
  const parts = [
    getDrylandSessionKindLabel(summary.sessionKind),
    `${summary.exerciseCount} exercise${summary.exerciseCount === 1 ? "" : "s"}`,
    `${summary.setCount} set${summary.setCount === 1 ? "" : "s"}`,
  ];

  const durationLabel = formatSecondsLabel(summary.actualDurationSeconds);
  if (durationLabel) {
    parts.push(durationLabel);
  }

  parts.push(getDrylandStatusLabel(summary.status));
  return parts.join(" · ");
}

export function buildDrylandSessionSummary(row: DrylandSessionRow): DrylandSessionSummary {
  const record = buildDrylandSessionRecord(row);
  const summary = buildDrylandSummary(record.draft);
  return {
    id: row.id,
    title: row.title,
    sessionKind: row.session_kind as DrylandSessionKind,
    status: row.status as DrylandSessionStatus,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    actualDurationSeconds: row.actual_duration_seconds,
    exerciseCount: summary.exerciseCount,
    setCount: summary.setCount,
  };
}

export function buildDrylandSessionRecord(row: DrylandSessionRow): DrylandSessionRecord {
  const normalized = normalizeDrylandSessionDraft({
    version: 1,
    sessionKind: row.session_kind,
    title: row.title,
    description: row.description,
    focusText: row.focus_text,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    actualDurationSeconds: row.actual_duration_seconds,
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
  });

  if (!normalized.ok) {
    throw new Error(`Stored dryland session ${row.id} is invalid: ${normalized.error}`);
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceKind: row.source_kind as DrylandSourceKind,
    status: buildSessionStatus(normalized.value),
    draft: normalized.value,
  };
}
