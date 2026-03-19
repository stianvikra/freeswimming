import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadAthleteProfileSnapshotMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  loadAthleteProfileSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/athlete-profile/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/athlete-profile/server")>(
    "@/lib/athlete-profile/server"
  );

  return {
    ...actual,
    loadAthleteProfileSnapshot: loadAthleteProfileSnapshotMock,
  };
});

import { PUT as putTrainingMetric } from "@/app/api/my-library/profile/metrics/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("training metric routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadAthleteProfileSnapshotMock.mockResolvedValue({
      profileSchemaReady: true,
      metricsSchemaReady: true,
      preferencesSchemaReady: true,
      personalRecordsSchemaReady: true,
      loadError: null,
      metricsLoadError: null,
      preferencesLoadError: null,
      personalRecordsLoadError: null,
      profile: null,
      cssMetric: null,
      preferences: null,
      personalRecords: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated metric save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putTrainingMetric(
      new Request("http://127.0.0.1:3000/api/my-library/profile/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pace: "1:58" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects malformed CSS before write", async () => {
    const from = vi.fn();

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putTrainingMetric(
      new Request("http://127.0.0.1:3000/api/my-library/profile/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pace: "118" }),
      })
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("saves canonical CSS for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "metric-1" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ upsert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putTrainingMetric(
      new Request("http://127.0.0.1:3000/api/my-library/profile/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pace: "1:58",
          recordedOn: "2026-03-19",
          sourceNote: "400 + 200 test",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("training_metrics");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        metric_key: "css",
        unit: "seconds_per_100m",
        value_seconds: 118,
        recorded_on: "2026-03-19",
        source_note: "400 + 200 test",
      },
      { onConflict: "user_id,metric_key" }
    );
  });
});
