import {
  computeSessionDraftDerivedTotals,
  resolveSessionDraftPoolLengthUnit,
  type SessionDraft,
} from "@/lib/session-generator-v1/shared";
import { normalizeSessionDraftForWorkoutPersistence } from "@/lib/workouts/persistence";
import type { Json } from "@/types/database";

export const REVIEW_ACTUAL_SESSION_SNAPSHOT_KIND = "manual_actual_session_snapshot_v1";

export type ReviewActualSessionSnapshot = {
  version: 1;
  kind: typeof REVIEW_ACTUAL_SESSION_SNAPSHOT_KIND;
  source: "planned_session_default" | "manual_actual_edit";
  plannedWorkoutInstanceId: string;
  actualEventId: string | null;
  updatedAt: string;
  draft: SessionDraft;
  derived: {
    totalDistanceM: number | null;
    estimatedDurationMin: number | null;
    environment: SessionDraft["environment"];
    poolLengthM: number | null;
    poolLengthUnit: "m" | "yd";
  };
};

export type ReviewActualSessionDraftResult =
  | { ok: true; draft: SessionDraft; snapshot: ReviewActualSessionSnapshot }
  | { ok: false; error: string };

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeReviewActualSessionDraft(input: unknown):
  | {
      ok: true;
      draft: SessionDraft;
    }
  | { ok: false; error: string } {
  const normalized = normalizeSessionDraftForWorkoutPersistence(input as SessionDraft | null);
  if (!normalized.ok) {
    return { ok: false, error: normalized.error.replace(/^Workout /, "Actual session ") };
  }

  return { ok: true, draft: normalized.value };
}

export function readReviewActualSessionDraft(value: unknown): SessionDraft | null {
  const snapshot = asObject(value);
  const draft = snapshot?.kind === REVIEW_ACTUAL_SESSION_SNAPSHOT_KIND ? snapshot.draft : null;
  if (!draft) return null;

  const normalized = normalizeReviewActualSessionDraft(draft);
  return normalized.ok ? normalized.draft : null;
}

export function buildReviewActualSessionSnapshot(input: {
  draft: SessionDraft;
  source: ReviewActualSessionSnapshot["source"];
  plannedWorkoutInstanceId: string;
  actualEventId?: string | null;
  updatedAt?: string;
}): ReviewActualSessionDraftResult {
  const normalized = normalizeReviewActualSessionDraft(input.draft);
  if (!normalized.ok) return normalized;

  const totals = computeSessionDraftDerivedTotals(normalized.draft);
  const draft: SessionDraft = {
    ...normalized.draft,
    totalDistanceM: totals.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin,
  };

  return {
    ok: true,
    draft,
    snapshot: {
      version: 1,
      kind: REVIEW_ACTUAL_SESSION_SNAPSHOT_KIND,
      source: input.source,
      plannedWorkoutInstanceId: input.plannedWorkoutInstanceId,
      actualEventId: input.actualEventId ?? null,
      updatedAt: input.updatedAt ?? new Date().toISOString(),
      draft,
      derived: {
        totalDistanceM: totals.totalDistanceM,
        estimatedDurationMin: totals.estimatedDurationMin,
        environment: draft.environment,
        poolLengthM: draft.environment === "pool" ? draft.poolLengthM : null,
        poolLengthUnit: resolveSessionDraftPoolLengthUnit(draft.poolLengthUnit),
      },
    },
  };
}

export function serializeReviewActualSessionSnapshot(snapshot: ReviewActualSessionSnapshot): Json {
  return snapshot as unknown as Json;
}
