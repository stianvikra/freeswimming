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
        providerConnections: unknown[];
        providerActivityEvidence: unknown[];
        providerImportRuns: unknown[];
      };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.export.schemaVersion).toBe("2026-06-22-provider-evidence-export");
    expect(payload.export.providerConnections).toEqual([]);
    expect(payload.export.providerActivityEvidence).toEqual([]);
    expect(payload.export.providerImportRuns).toEqual([]);
    expect(supabase.from).toHaveBeenCalledWith("provider_connections");
    expect(supabase.from).toHaveBeenCalledWith("provider_activity_evidence");
    expect(supabase.from).toHaveBeenCalledWith("provider_import_runs");
  });
});
