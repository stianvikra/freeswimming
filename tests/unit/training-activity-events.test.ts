import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTrainingActivityViewFromCompletedSwimEvent,
  buildTrainingActivityViewFromEventRow,
  isTrainingActivityEventSchemaMissing,
  isTrainingActivityHistoryTrusted,
  normalizeTrainingActivityEventCanonicalSport,
  normalizeTrainingActivityEventMappingStatus,
  normalizeTrainingActivityEventOutcome,
  normalizeTrainingActivityEventSourceKind,
} from "@/lib/my-library/training-activity-events";
import type { Database } from "@/types/database";

type CompletedActivityEventRow = Database["public"]["Tables"]["completed_activity_events"]["Row"];
type TrainingActivityEventRow = Database["public"]["Tables"]["training_activity_events"]["Row"];

function buildCompletedActivityEventRow(
  overrides?: Partial<CompletedActivityEventRow>
): CompletedActivityEventRow {
  return {
    id: "completed-activity-1",
    user_id: "user-1",
    planned_workout_instance_id: "planned-instance-1",
    workout_id: "workout-1",
    program_id: "program-1",
    outcome: "completed",
    source_kind: "manual",
    completed_on: "2026-06-22",
    actual_started_at: "2026-06-22T06:30:00.000Z",
    actual_duration_seconds: 2280,
    actual_distance_m: 1800,
    actual_environment: "pool",
    actual_pool_length_m: 25,
    actual_pool_length_unit: "m",
    actual_session_snapshot: {
      kind: "manual_actual_session_snapshot_v1",
      snapshot: { steps: [] },
    },
    correction_note: null,
    planned_snapshot: {},
    created_at: "2026-06-22T07:10:00.000Z",
    updated_at: "2026-06-22T07:10:00.000Z",
    ...overrides,
  };
}

function buildTrainingActivityEventRow(
  overrides?: Partial<TrainingActivityEventRow>
): TrainingActivityEventRow {
  return {
    id: "training-activity-1",
    user_id: "user-1",
    source_kind: "manual",
    activity_category: "workout",
    canonical_sport: "swimming",
    canonical_sub_sport: "pool_swim",
    mapping_status: "trusted",
    outcome: "completed_as_planned",
    activity_started_at: "2026-06-22T06:30:00.000Z",
    activity_ended_at: "2026-06-22T07:08:00.000Z",
    activity_local_date: "2026-06-22",
    activity_timezone: "Europe/Oslo",
    timezone_source: "manual",
    duration_seconds: 2280,
    distance_m: 1800,
    elevation_m: null,
    energy_kcal: null,
    average_heart_rate_bpm: null,
    training_load: null,
    planned_workout_instance_id: "planned-instance-1",
    workout_id: "workout-1",
    program_id: "program-1",
    completed_activity_event_id: "completed-activity-1",
    provider_activity_evidence_id: null,
    detail_kind: "swim_session_snapshot",
    detail_snapshot: { kind: "manual_actual_session_snapshot_v1" },
    support_diagnostics: {},
    created_at: "2026-06-22T07:10:00.000Z",
    updated_at: "2026-06-22T07:10:00.000Z",
    ...overrides,
  };
}

describe("training activity event contract", () => {
  it("keeps known values and fails unknown values closed", () => {
    expect(normalizeTrainingActivityEventSourceKind("manual")).toBe("manual");
    expect(normalizeTrainingActivityEventSourceKind("garmin_activity_api")).toBe("unmapped");
    expect(normalizeTrainingActivityEventCanonicalSport("running")).toBe("running");
    expect(normalizeTrainingActivityEventCanonicalSport("triathlon")).toBe("unmapped");
    expect(normalizeTrainingActivityEventMappingStatus("trusted")).toBe("trusted");
    expect(normalizeTrainingActivityEventMappingStatus("auto_matched")).toBe("unmapped");
    expect(normalizeTrainingActivityEventOutcome("completed")).toBe("completed_as_planned");
    expect(normalizeTrainingActivityEventOutcome("provider_completed")).toBe("unmapped");
  });

  it("adapts existing planned swim actuals without changing their source identity", () => {
    const view = buildTrainingActivityViewFromCompletedSwimEvent(buildCompletedActivityEventRow());

    expect(view).toMatchObject({
      id: "completed_activity_events:completed-activity-1",
      compatibilitySource: "completed_activity_events",
      sourceKind: "manual",
      activityCategory: "workout",
      canonicalSport: "swimming",
      canonicalSubSport: "pool_swim",
      mappingStatus: "trusted",
      outcome: "completed_as_planned",
      activityLocalDate: "2026-06-22",
      completedActivityEventId: "completed-activity-1",
      plannedWorkoutInstanceId: "planned-instance-1",
      detailKind: "swim_session_snapshot",
    });
    expect(isTrainingActivityHistoryTrusted(view)).toBe(true);
  });

  it("keeps unknown completed-event source or outcome out of trusted history", () => {
    const view = buildTrainingActivityViewFromCompletedSwimEvent(
      buildCompletedActivityEventRow({
        outcome: "future_provider_completed",
        source_kind: "garmin_activity_api",
      })
    );

    expect(view.sourceKind).toBe("unmapped");
    expect(view.outcome).toBe("unmapped");
    expect(view.mappingStatus).toBe("unmapped");
    expect(view.supportDiagnostics).toMatchObject({
      reason: "completed_activity_event_unmapped",
    });
    expect(isTrainingActivityHistoryTrusted(view)).toBe(false);
  });

  it("normalizes canonical rows and fails inconsistent rows closed", () => {
    const view = buildTrainingActivityViewFromEventRow(
      buildTrainingActivityEventRow({
        source_kind: "provider_runtime_future",
        mapping_status: "trusted",
        outcome: "completed_as_planned",
      })
    );

    expect(view.sourceKind).toBe("unmapped");
    expect(view.mappingStatus).toBe("unmapped");
    expect(isTrainingActivityHistoryTrusted(view)).toBe(false);
  });

  it("detects schema drift and ignores unrelated database errors", () => {
    expect(
      isTrainingActivityEventSchemaMissing({
        code: "42P01",
        message: "relation training_activity_events does not exist",
      })
    ).toBe(true);
    expect(
      isTrainingActivityEventSchemaMissing({
        message: "column canonical_sport does not exist",
      })
    ).toBe(true);
    expect(
      isTrainingActivityEventSchemaMissing({
        code: "23505",
        message: "duplicate key value violates unique constraint",
      })
    ).toBe(false);
  });
});

describe("training activity event migration", () => {
  const migration = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/20260623140000_training_activity_events_foundation.sql"
    ),
    "utf8"
  );

  it("creates a separate owner-scoped table with RLS", () => {
    expect(migration).toContain("create table if not exists public.training_activity_events");
    expect(migration).toContain(
      "user_id uuid not null references auth.users (id) on delete cascade"
    );
    expect(migration).toContain(
      "alter table public.training_activity_events enable row level security"
    );
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("auth.uid() is not null and auth.uid() = user_id");
  });

  it("preserves existing swim completion identity through optional aliases", () => {
    expect(migration).toContain(
      "completed_activity_event_id uuid references public.completed_activity_events"
    );
    expect(migration).toContain("training_activity_events_completed_event_unique");
    expect(migration).toContain("unique index");
    expect(migration).not.toContain("alter table public.completed_activity_events");
  });

  it("keeps provider evidence separate from completion truth", () => {
    expect(migration).toContain(
      "provider_activity_evidence_id uuid references public.provider_activity_evidence"
    );
    expect(migration).toContain("training_activity_events_provider_evidence_unique");
    expect(migration).not.toMatch(/\b(access|refresh)_token\b/i);
    expect(migration).not.toMatch(/\braw_(payload|file)\b/i);
  });

  it("requires explicit mapped taxonomy and fail-closed review states", () => {
    expect(migration).toContain("constraint training_activity_events_canonical_sport_check");
    expect(migration).toContain("'swimming'");
    expect(migration).toContain("'running'");
    expect(migration).toContain("'cycling'");
    expect(migration).toContain("'walking'");
    expect(migration).toContain("'strength_training'");
    expect(migration).toContain("'unknown'");
    expect(migration).toContain("constraint training_activity_events_mapping_status_check");
    expect(migration).toContain("'needs_review'");
    expect(migration).toContain("'unmapped'");
    expect(migration).toContain("'unsupported'");
  });
});
