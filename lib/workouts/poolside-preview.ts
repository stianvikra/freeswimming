import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type {
  WorkoutHandoffDraftState,
  WorkoutPoolsideNotationMode,
  WorkoutPoolsidePrintLayout,
  WorkoutPoolsidePrintStyle,
  WorkoutPoolsideRestLayout,
} from "@/lib/workouts/shared";
import {
  normalizeWorkoutPoolsideNotationMode,
  normalizeWorkoutPoolsidePrintLayout,
  normalizeWorkoutPoolsidePrintStyle,
  normalizeWorkoutPoolsideRestLayout,
} from "@/lib/workouts/shared";

const WORKOUT_POOLSIDE_PREVIEW_STORAGE_PREFIX = "my-library-workout-poolside-preview-v1:";

export type WorkoutPoolsidePreviewSettings = {
  printStyle: WorkoutPoolsidePrintStyle;
  printLayout: WorkoutPoolsidePrintLayout;
  notationMode: WorkoutPoolsideNotationMode;
  restLayout: WorkoutPoolsideRestLayout;
};

export type StoredWorkoutPoolsidePreviewDraft = {
  version: 1;
  updatedAt: number;
  draft: SessionDraft;
  draftState: WorkoutHandoffDraftState;
  focusPoints: string[];
  swimmerName: string | null;
};

export const DEFAULT_WORKOUT_POOLSIDE_PREVIEW_SETTINGS: WorkoutPoolsidePreviewSettings = {
  printStyle: "color",
  printLayout: "portrait",
  notationMode: "auto",
  restLayout: "auto",
};

function slugifyPoolsideFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isBrowser() {
  return typeof window !== "undefined";
}

function buildWorkoutPoolsidePreviewStorageKey(previewId: string) {
  return `${WORKOUT_POOLSIDE_PREVIEW_STORAGE_PREFIX}${previewId}`;
}

function isStoredWorkoutPoolsidePreviewDraft(
  value: unknown
): value is StoredWorkoutPoolsidePreviewDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredWorkoutPoolsidePreviewDraft>;
  const draft = candidate.draft as Partial<SessionDraft> | undefined;

  return (
    candidate.version === 1 &&
    typeof candidate.updatedAt === "number" &&
    draft !== undefined &&
    typeof draft.title === "string" &&
    typeof draft.sourceFingerprint === "string" &&
    Array.isArray(draft.steps) &&
    (candidate.draftState === "canonical" || candidate.draftState === "local_draft") &&
    Array.isArray(candidate.focusPoints) &&
    candidate.focusPoints.every((point) => typeof point === "string") &&
    (candidate.swimmerName === null || typeof candidate.swimmerName === "string")
  );
}

export function createWorkoutPoolsidePreviewId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `poolside-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeWorkoutPoolsidePreviewSettings(input?: {
  printStyle?: string | null | undefined;
  printLayout?: string | null | undefined;
  notationMode?: string | null | undefined;
  restLayout?: string | null | undefined;
}): WorkoutPoolsidePreviewSettings {
  return {
    printStyle: normalizeWorkoutPoolsidePrintStyle(input?.printStyle),
    printLayout: normalizeWorkoutPoolsidePrintLayout(input?.printLayout),
    notationMode: normalizeWorkoutPoolsideNotationMode(input?.notationMode),
    restLayout: normalizeWorkoutPoolsideRestLayout(input?.restLayout),
  };
}

export function applyWorkoutPoolsidePreviewSettings(
  searchParams: URLSearchParams,
  settings?: Partial<WorkoutPoolsidePreviewSettings>
) {
  const normalized = normalizeWorkoutPoolsidePreviewSettings(settings);
  searchParams.set("printStyle", normalized.printStyle);
  searchParams.set("printLayout", normalized.printLayout);
  searchParams.set("notationMode", normalized.notationMode);
  searchParams.set("restLayout", normalized.restLayout);
}

export function buildWorkoutPoolsidePreviewHref(
  baseHref: string,
  options?: {
    selectedFocusIds?: string[];
    settings?: Partial<WorkoutPoolsidePreviewSettings>;
  }
) {
  const url = new URL(baseHref, "http://localhost");
  applyWorkoutPoolsidePreviewSettings(url.searchParams, options?.settings);

  if (Array.isArray(options?.selectedFocusIds)) {
    url.searchParams.set("focusMode", "custom");
    url.searchParams.delete("focusId");
    options.selectedFocusIds.forEach((focusId) => {
      url.searchParams.append("focusId", focusId);
    });
  }

  return `${url.pathname}${url.search}`;
}

export function buildWorkoutPoolsidePrintFrameHref(
  workoutId: string,
  options?: {
    selectedFocusIds?: string[];
    settings?: Partial<WorkoutPoolsidePreviewSettings>;
  }
) {
  const url = new URL(`/api/my-library/workouts/${workoutId}/export/pdf`, "http://localhost");
  url.searchParams.set("variant", "poolside");
  url.searchParams.set("previewChrome", "embedded");
  applyWorkoutPoolsidePreviewSettings(url.searchParams, options?.settings);

  if (Array.isArray(options?.selectedFocusIds)) {
    url.searchParams.set("focusMode", "custom");
    url.searchParams.delete("focusId");
    options.selectedFocusIds.forEach((focusId) => {
      url.searchParams.append("focusId", focusId);
    });
  }

  return `${url.pathname}${url.search}`;
}

export function buildWorkoutPoolsideImageFileName(params: {
  title?: string | null;
  printLayout: WorkoutPoolsidePreviewSettings["printLayout"];
}) {
  const normalizedTitle = params.title?.trim().length ? params.title.trim() : "poolside-note";
  const slug = slugifyPoolsideFilePart(normalizedTitle) || "poolside-note";
  if (slug === "poolside-note") {
    return `freeswimming-poolside-note-${params.printLayout}.png`;
  }

  return `freeswimming-${slug}-poolside-note-${params.printLayout}.png`;
}

export function writeStoredWorkoutPoolsidePreviewDraft(
  previewId: string,
  payload: Omit<StoredWorkoutPoolsidePreviewDraft, "version" | "updatedAt">
) {
  if (!isBrowser()) {
    return;
  }

  try {
    const snapshot: StoredWorkoutPoolsidePreviewDraft = {
      version: 1,
      updatedAt: Date.now(),
      ...payload,
    };
    window.localStorage.setItem(
      buildWorkoutPoolsidePreviewStorageKey(previewId),
      JSON.stringify(snapshot)
    );
  } catch {
    // preview storage is best effort only
  }
}

export function readStoredWorkoutPoolsidePreviewDraft(previewId: string) {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildWorkoutPoolsidePreviewStorageKey(previewId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isStoredWorkoutPoolsidePreviewDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
