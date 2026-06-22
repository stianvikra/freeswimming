import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createAdminSupabaseClientMock, createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { POST } from "@/app/api/my-library/provider-evidence/fixture-import/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("http://127.0.0.1:3000/api/my-library/provider-evidence/fixture-import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function mockRouteUser(user: { id: string } | null = { id: "user-1" }) {
  createRouteHandlerSupabaseClientMock.mockResolvedValue({
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
        }),
      },
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  });
}

function buildAdminSupabaseMock(input?: {
  existingProviderActivityIds?: string[];
  connectionError?: { code?: string; message: string } | null;
  existingAliasError?: { code?: string; message: string } | null;
  runError?: { code?: string; message: string } | null;
  evidenceError?: { code?: string; message: string } | null;
}) {
  const connectionSingle = vi.fn().mockResolvedValue({
    data: { id: "provider-connection-1" },
    error: input?.connectionError ?? null,
  });
  const connectionSelect = vi.fn(() => ({ single: connectionSingle }));
  const connectionUpsert = vi.fn(() => ({ select: connectionSelect }));

  const existingAliasQuery = {
    eq: vi.fn(() => existingAliasQuery),
    in: vi.fn().mockResolvedValue({
      data: (input?.existingProviderActivityIds ?? []).map((providerActivityId) => ({
        provider_activity_id: providerActivityId,
      })),
      error: input?.existingAliasError ?? null,
    }),
  };

  const evidenceSelect = vi.fn((columns: string) => {
    if (columns === "provider_activity_id") return existingAliasQuery;
    throw new Error(`Unexpected provider evidence select columns: ${columns}`);
  });
  const evidenceUpsertSelect = vi.fn().mockResolvedValue({
    data: [{ id: "provider-activity-evidence-1" }],
    error: input?.evidenceError ?? null,
  });
  const evidenceUpsert = vi.fn(() => ({ select: evidenceUpsertSelect }));

  const runSingle = vi.fn().mockResolvedValue({
    data: { id: "provider-import-run-1" },
    error: input?.runError ?? null,
  });
  const runSelect = vi.fn(() => ({ single: runSingle }));
  const runInsert = vi.fn(() => ({ select: runSelect }));

  const from = vi.fn((table: string) => {
    if (table === "provider_connections") {
      return { upsert: connectionUpsert };
    }
    if (table === "provider_activity_evidence") {
      return { select: evidenceSelect, upsert: evidenceUpsert };
    }
    if (table === "provider_import_runs") {
      return { insert: runInsert };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  const adminSupabase = { from };
  createAdminSupabaseClientMock.mockReturnValue(adminSupabase);

  return {
    from,
    connectionUpsert,
    existingAliasQuery,
    evidenceUpsert,
    runInsert,
  };
}

describe("/api/my-library/provider-evidence/fixture-import route", () => {
  beforeEach(() => {
    vi.stubEnv("PROVIDER_EVIDENCE_FIXTURE_IMPORT_ENABLED", "1");
    createAdminSupabaseClientMock.mockReset();
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("fails closed when the fixture import flag is disabled", async () => {
    vi.stubEnv("PROVIDER_EVIDENCE_FIXTURE_IMPORT_ENABLED", "0");

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: [{ providerActivityId: "fixture-1" }],
      })
    );
    const payload = (await response.json()) as { ok: boolean; code: string };

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({
      ok: false,
      code: "fixture_import_disabled",
    });
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("fails closed for unauthenticated requests", async () => {
    mockRouteUser(null);

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: [{ providerActivityId: "fixture-1" }],
      })
    );

    expect(response.status).toBe(401);
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects non-fixture providers before service-role writes", async () => {
    mockRouteUser();

    const response = await POST(
      buildRequest({
        providerKey: "garmin_activity_api",
        user_id: "other-user",
        activities: [{ providerActivityId: "garmin-1" }],
      })
    );
    const payload = (await response.json()) as { ok: boolean; code: string };

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      code: "unsupported_provider",
    });
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported content types before auth or service-role work", async () => {
    const response = await POST(
      buildRequest(
        {
          providerKey: "manual_fixture",
          activities: [{ providerActivityId: "fixture-1" }],
        },
        { "Content-Type": "text/plain" }
      )
    );
    const payload = (await response.json()) as { ok: boolean; code: string };

    expect(response.status).toBe(415);
    expect(payload).toMatchObject({
      ok: false,
      code: "unsupported_content_type",
    });
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("imports owner-scoped manual fixture evidence idempotently by provider alias", async () => {
    mockRouteUser({ id: "user-1" });
    const admin = buildAdminSupabaseMock({
      existingProviderActivityIds: ["fixture-1"],
    });

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        user_id: "other-user",
        userId: "other-user",
        activities: [
          {
            providerActivityId: "fixture-1",
            title: "Morning fixture swim",
            activityStartedAt: "2026-06-22T06:30:00.000Z",
            activityType: "lap_swimming",
            sportType: "swimming",
            subSportType: "pool_swimming",
            durationSeconds: 1800,
            distanceM: 1200,
            poolLengthM: 25,
            poolLengthUnit: "m",
            fileState: "available_from_provider",
            availableFileKinds: ["fit"],
            redactedSummary: {
              title: "Fixture summary",
              access_token: "must-not-persist",
            },
          },
          {
            providerActivityId: "fixture-1",
            title: "Duplicate alias should not create another evidence row",
          },
        ],
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      status: string;
      counts: { importedCount: number; duplicateCount: number };
      evidenceIds: string[];
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      status: "completed_with_warnings",
      counts: {
        importedCount: 1,
        duplicateCount: 2,
      },
      evidenceIds: ["provider-activity-evidence-1"],
    });
    expect(admin.connectionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        provider_key: "manual_fixture",
      }),
      { onConflict: "user_id,provider_key" }
    );
    expect(admin.runInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        provider_key: "manual_fixture",
        total_activity_count: 2,
        imported_count: 1,
        duplicate_count: 2,
      })
    );
    expect(admin.evidenceUpsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          user_id: "user-1",
          provider_key: "manual_fixture",
          provider_activity_id: "fixture-1",
          status: "imported",
          redacted_summary: expect.not.objectContaining({
            access_token: expect.any(String),
          }),
        }),
      ],
      { onConflict: "user_id,provider_key,provider_activity_id" }
    );
    expect(admin.from).not.toHaveBeenCalledWith("completed_activity_events");
  });

  it("records malformed and unsupported fixture rows without unexpected 500s", async () => {
    mockRouteUser({ id: "user-1" });
    const admin = buildAdminSupabaseMock();

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: [
          {
            providerActivityId: "unsupported-1",
            sportType: "cycling",
            fileState: "stored_in_bucket",
            availableFileKinds: ["fit", "json_payload"],
          },
          {
            title: "Missing providerActivityId is malformed",
          },
        ],
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      status: string;
      counts: { importedCount: number; malformedCount: number; unsupportedCount: number };
      warnings: string[];
    };

    expect(response.status).toBe(200);
    expect(payload.status).toBe("completed_with_warnings");
    expect(payload.counts).toMatchObject({
      importedCount: 0,
      malformedCount: 1,
      unsupportedCount: 1,
    });
    expect(payload.warnings).toEqual(
      expect.arrayContaining([
        "invalid_provider_activity_id",
        "unsupported_file_kind",
        "unsupported_file_state",
        "unsupported_sport_type",
      ])
    );
    expect(admin.runInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        malformed_count: 1,
        unsupported_count: 1,
      })
    );
    expect(admin.evidenceUpsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          provider_activity_id: "unsupported-1",
          status: "unsupported_activity",
          sport_type: null,
          file_state: "unsupported",
          available_file_kinds: ["fit"],
        }),
      ],
      { onConflict: "user_id,provider_key,provider_activity_id" }
    );
  });

  it("returns a deterministic schema-missing response", async () => {
    mockRouteUser({ id: "user-1" });
    buildAdminSupabaseMock({
      connectionError: {
        code: "42P01",
        message: "relation provider_connections does not exist",
      },
    });

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: [{ providerActivityId: "fixture-1" }],
      })
    );
    const payload = (await response.json()) as { ok: boolean; code: string; error: string };

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      ok: false,
      code: "provider_evidence_schema_missing",
      error: "Provider evidence storage is not ready.",
    });
  });

  it("returns a bounded failure for unexpected provider evidence write errors", async () => {
    mockRouteUser({ id: "user-1" });
    buildAdminSupabaseMock({
      connectionError: {
        code: "PGRST500",
        message: "unexpected database failure",
      },
    });

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: [{ providerActivityId: "fixture-1" }],
      })
    );
    const payload = (await response.json()) as { ok: boolean; code: string; error: string };

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      ok: false,
      code: "provider_connection_write_failed",
      error: "Could not prepare provider evidence import.",
    });
  });

  it("rejects oversized fixture imports before service-role writes", async () => {
    mockRouteUser({ id: "user-1" });

    const response = await POST(
      buildRequest({
        providerKey: "manual_fixture",
        activities: Array.from({ length: 11 }, (_, index) => ({
          providerActivityId: `fixture-${index}`,
        })),
      })
    );

    expect(response.status).toBe(400);
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });
});
