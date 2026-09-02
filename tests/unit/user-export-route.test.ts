import { afterEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, loadPublishedCourseModulesCachedMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  loadPublishedCourseModulesCachedMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/admin/content-course", () => ({
  loadPublishedCourseModulesCached: loadPublishedCourseModulesCachedMock,
}));

import { GET } from "@/app/api/user/export/route";

type QueryResult = {
  data: unknown;
  error: { code?: string; message?: string } | null;
};

function buildQuery(result: QueryResult) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };

  return query;
}

function buildExportSupabaseClient(resultsByTable: Record<string, QueryResult>) {
  const fallbackResult = { data: [], error: null };
  const from = vi.fn((table: string) => buildQuery(resultsByTable[table] ?? fallbackResult));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-1",
            email: "swimmer@example.com",
          },
        },
      }),
    },
    from,
  };
}

describe("/api/user/export route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns raw future Habit values only through the authenticated private export", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([]);
    const supabase = buildExportSupabaseClient({
      profiles: {
        data: {
          id: "user-1",
          email: "swimmer@example.com",
          created_at: "2026-08-31T08:00:00.000Z",
          updated_at: "2026-08-31T08:00:00.000Z",
        },
        error: null,
      },
      athlete_profiles: { data: null, error: null },
      training_preferences: { data: null, error: null },
      habit_definitions: {
        data: [
          {
            id: "habit-future",
            title: "Private future habit",
            notes: "Private future note",
            habit_mode: "future_mode",
            habit_type: "future_type",
            status: "future_status",
          },
        ],
        error: null,
      },
      habit_check_ins: {
        data: [
          {
            id: "check-future",
            habit_id: "habit-future",
            note: "Private preserved history",
            source_kind: "micro_session",
            source_dryland_micro_plan_id: "micro-plan-1",
          },
        ],
        error: null,
      },
    });
    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.export.habitDefinitions).toEqual([
      expect.objectContaining({
        id: "habit-future",
        habitMode: "future_mode",
        habitType: "future_type",
        status: "future_status",
      }),
    ]);
    expect(payload.export.habitCheckIns).toEqual([
      expect.objectContaining({
        id: "check-future",
        habitId: "habit-future",
        note: "Private preserved history",
        sourceKind: "micro_session",
        sourceDrylandMicroPlanId: "micro-plan-1",
      }),
    ]);
    expect(payload).toMatchObject({
      ok: true,
      export: { schemaVersion: "2026-06-23-training-activity-export" },
    });
    expect(supabase.from).toHaveBeenCalledWith("habit_definitions");
    expect(supabase.from).toHaveBeenCalledWith("habit_check_ins");
  });

  it("returns an export with empty provider arrays when provider evidence schema is missing", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([]);
    const missingProviderTable = {
      data: null,
      error: {
        code: "42P01",
        message: "relation provider_activity_evidence does not exist",
      },
    };
    const supabase = buildExportSupabaseClient({
      profiles: {
        data: {
          id: "user-1",
          email: "swimmer@example.com",
          created_at: "2026-06-22T08:00:00.000Z",
          updated_at: "2026-06-22T08:00:00.000Z",
        },
        error: null,
      },
      athlete_profiles: { data: null, error: null },
      training_preferences: { data: null, error: null },
      provider_connections: missingProviderTable,
      provider_activity_evidence: missingProviderTable,
      provider_import_runs: missingProviderTable,
    });

    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET();
    const payload = (await response.json()) as {
      ok: boolean;
      export: {
        schemaVersion: string;
        trainingActivityEvents: unknown[];
        providerConnections: unknown[];
        providerActivityEvidence: unknown[];
        providerImportRuns: unknown[];
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.export.schemaVersion).toBe("2026-06-23-training-activity-export");
    expect(payload.export.trainingActivityEvents).toEqual([]);
    expect(payload.export.providerConnections).toEqual([]);
    expect(payload.export.providerActivityEvidence).toEqual([]);
    expect(payload.export.providerImportRuns).toEqual([]);
    expect(supabase.from).toHaveBeenCalledWith("provider_connections");
    expect(supabase.from).toHaveBeenCalledWith("training_activity_events");
    expect(supabase.from).toHaveBeenCalledWith("provider_activity_evidence");
    expect(supabase.from).toHaveBeenCalledWith("provider_import_runs");
  });

  it("includes redacted manual fixture provider evidence summaries", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([]);
    const supabase = buildExportSupabaseClient({
      profiles: {
        data: {
          id: "user-1",
          email: "swimmer@example.com",
          created_at: "2026-06-22T08:00:00.000Z",
          updated_at: "2026-06-22T08:00:00.000Z",
        },
        error: null,
      },
      athlete_profiles: { data: null, error: null },
      training_preferences: { data: null, error: null },
      training_activity_events: {
        data: [
          {
            id: "training-activity-1",
            user_id: "user-1",
            source_kind: "manual",
            activity_category: "workout",
            canonical_sport: "swimming",
            canonical_sub_sport: "pool_swim",
            mapping_status: "trusted",
            outcome: "completed_as_planned",
            activity_started_at: "2026-06-22T06:30:00.000Z",
            activity_ended_at: null,
            activity_local_date: "2026-06-22",
            activity_timezone: null,
            timezone_source: "unknown",
            duration_seconds: 1800,
            distance_m: 1200,
            elevation_m: null,
            energy_kcal: null,
            average_heart_rate_bpm: null,
            training_load: null,
            planned_workout_instance_id: "planned-instance-1",
            workout_id: "workout-1",
            program_id: "program-1",
            completed_activity_event_id: "completed-activity-1",
            provider_activity_evidence_id: null,
            detail_kind: "none",
            detail_snapshot: {},
            support_diagnostics: {},
            created_at: "2026-06-22T09:00:00.000Z",
            updated_at: "2026-06-22T09:00:00.000Z",
          },
        ],
        error: null,
      },
      provider_connections: {
        data: [
          {
            id: "provider-connection-1",
            user_id: "user-1",
            provider_key: "manual_fixture",
            status: "connected_metadata_only",
            provider_user_id: null,
            provider_display_name: "Manual fixture",
            connected_at: "2026-06-22T09:00:00.000Z",
            revoked_at: null,
            disabled_at: null,
            last_successful_sync_at: "2026-06-22T09:00:00.000Z",
            last_sync_error_code: null,
            redacted_metadata: {
              source: "manual_fixture",
              schemaVersion: "2026-06-22-provider-evidence-fixture-import",
            },
            created_at: "2026-06-22T09:00:00.000Z",
            updated_at: "2026-06-22T09:00:00.000Z",
          },
        ],
        error: null,
      },
      provider_activity_evidence: {
        data: [
          {
            id: "provider-activity-1",
            user_id: "user-1",
            provider_connection_id: "provider-connection-1",
            import_run_id: "provider-import-run-1",
            provider_key: "manual_fixture",
            provider_activity_id: "fixture-1",
            status: "imported",
            activity_started_at: "2026-06-22T06:30:00.000Z",
            activity_date: "2026-06-22",
            activity_type: "lap_swimming",
            sport_type: "swimming",
            sub_sport_type: "pool_swimming",
            duration_seconds: 1800,
            distance_m: 1200,
            pool_length_m: 25,
            pool_length_unit: "m",
            file_state: "available_from_provider",
            available_file_kinds: ["fit"],
            redacted_summary: {
              source: "manual_fixture",
              schemaVersion: "2026-06-22-provider-evidence-fixture-import",
              title: "Morning fixture swim",
              warningCodes: [],
            },
            first_seen_at: "2026-06-22T09:00:00.000Z",
            last_seen_at: "2026-06-22T09:00:00.000Z",
            created_at: "2026-06-22T09:00:00.000Z",
            updated_at: "2026-06-22T09:00:00.000Z",
          },
        ],
        error: null,
      },
      provider_import_runs: {
        data: [
          {
            id: "provider-import-run-1",
            user_id: "user-1",
            provider_connection_id: "provider-connection-1",
            provider_key: "manual_fixture",
            run_kind: "manual_fixture",
            status: "completed",
            started_at: "2026-06-22T09:00:00.000Z",
            finished_at: "2026-06-22T09:00:00.000Z",
            total_activity_count: 1,
            imported_count: 1,
            duplicate_count: 0,
            malformed_count: 0,
            unsupported_count: 0,
            error_code: null,
            redacted_diagnostics: {
              source: "manual_fixture",
              schemaVersion: "2026-06-22-provider-evidence-fixture-import",
            },
            created_at: "2026-06-22T09:00:00.000Z",
            updated_at: "2026-06-22T09:00:00.000Z",
          },
        ],
        error: null,
      },
    });

    createServerSupabaseClientMock.mockResolvedValueOnce(supabase);

    const response = await GET();
    const payload = (await response.json()) as {
      ok: boolean;
      export: {
        trainingActivityEvents: Array<{
          sourceKind: string;
          canonicalSport: string;
          completedActivityEventId: string | null;
        }>;
        providerConnections: Array<{ providerKey: string; redactedMetadata: unknown }>;
        providerActivityEvidence: Array<{
          providerKey: string;
          providerActivityId: string;
          redactedSummary: Record<string, unknown>;
        }>;
        providerImportRuns: Array<{ providerKey: string; totalActivityCount: number }>;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.export.trainingActivityEvents[0]).toMatchObject({
      sourceKind: "manual",
      canonicalSport: "swimming",
      completedActivityEventId: "completed-activity-1",
    });
    expect(payload.export.providerConnections[0]).toMatchObject({
      providerKey: "manual_fixture",
      redactedMetadata: {
        source: "manual_fixture",
        schemaVersion: "2026-06-22-provider-evidence-fixture-import",
      },
    });
    expect(payload.export.providerActivityEvidence[0]).toMatchObject({
      providerKey: "manual_fixture",
      providerActivityId: "fixture-1",
      redactedSummary: {
        source: "manual_fixture",
        schemaVersion: "2026-06-22-provider-evidence-fixture-import",
        title: "Morning fixture swim",
      },
    });
    expect(payload.export.providerActivityEvidence[0]?.redactedSummary).not.toHaveProperty(
      "access_token"
    );
    expect(payload.export.providerImportRuns[0]).toMatchObject({
      providerKey: "manual_fixture",
      totalActivityCount: 1,
    });
  });
});
