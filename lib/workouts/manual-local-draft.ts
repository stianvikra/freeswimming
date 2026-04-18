import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import {
  buildManualOpenWaterWorkoutEmptyDraft,
  buildManualPoolWorkoutEmptyDraft,
  type ManualWorkoutBuilderMode,
  type ManualWorkoutDraftDefaults,
} from "@/lib/workouts/manual";

const MANUAL_WORKOUT_LOCAL_DRAFT_STORAGE_PREFIX = "my-library-manual-workout-draft-v1:";

type StoredManualWorkoutDraft = {
  version: 1;
  mode: ManualWorkoutBuilderMode;
  draft: SessionDraft;
  updatedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function buildFallbackDraft(
  mode: ManualWorkoutBuilderMode,
  defaults?: ManualWorkoutDraftDefaults
): SessionDraft {
  return mode === "pool"
    ? buildManualPoolWorkoutEmptyDraft(new Date(), defaults)
    : buildManualOpenWaterWorkoutEmptyDraft(new Date(), defaults);
}

function isStoredManualWorkoutDraft(
  value: unknown,
  mode: ManualWorkoutBuilderMode
): value is StoredManualWorkoutDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredManualWorkoutDraft>;
  const draft = candidate.draft as Partial<SessionDraft> | undefined;
  const expectedEnvironment = mode === "pool" ? "pool" : "open_water";

  return (
    candidate.version === 1 &&
    candidate.mode === mode &&
    typeof candidate.updatedAt === "number" &&
    draft !== undefined &&
    typeof draft.title === "string" &&
    typeof draft.sourceFingerprint === "string" &&
    draft.environment === expectedEnvironment &&
    Array.isArray(draft.steps)
  );
}

export function buildManualWorkoutLocalDraftStorageKey(
  userId: string,
  mode: ManualWorkoutBuilderMode
) {
  return `${MANUAL_WORKOUT_LOCAL_DRAFT_STORAGE_PREFIX}${userId}:${mode}`;
}

export function readStoredManualWorkoutDraft(
  userId: string,
  mode: ManualWorkoutBuilderMode
): SessionDraft | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildManualWorkoutLocalDraftStorageKey(userId, mode));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isStoredManualWorkoutDraft(parsed, mode)) {
      return null;
    }

    return parsed.draft;
  } catch {
    return null;
  }
}

export function writeStoredManualWorkoutDraft(
  userId: string,
  mode: ManualWorkoutBuilderMode,
  draft: SessionDraft
) {
  if (!isBrowser()) {
    return;
  }

  try {
    const snapshot: StoredManualWorkoutDraft = {
      version: 1,
      mode,
      draft,
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(
      buildManualWorkoutLocalDraftStorageKey(userId, mode),
      JSON.stringify(snapshot)
    );
  } catch {
    // local draft persistence is best effort only
  }
}

export function clearStoredManualWorkoutDraft(userId: string, mode: ManualWorkoutBuilderMode) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(buildManualWorkoutLocalDraftStorageKey(userId, mode));
  } catch {
    // local draft persistence is best effort only
  }
}

export function loadOrCreateStoredManualWorkoutDraft(
  userId: string,
  mode: ManualWorkoutBuilderMode,
  defaults?: ManualWorkoutDraftDefaults
): { draft: SessionDraft; recovered: boolean } {
  const storedDraft = readStoredManualWorkoutDraft(userId, mode);

  if (storedDraft) {
    return {
      draft: storedDraft,
      recovered: true,
    };
  }

  const draft = buildFallbackDraft(mode, defaults);
  writeStoredManualWorkoutDraft(userId, mode, draft);

  return {
    draft,
    recovered: false,
  };
}
