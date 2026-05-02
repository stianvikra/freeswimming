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

import { PUT as putTrainingPreferences } from "@/app/api/my-library/profile/preferences/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("training preferences routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadAthleteProfileSnapshotMock.mockResolvedValue({
      profileSchemaReady: true,
      metricsSchemaReady: true,
      preferencesSchemaReady: true,
      personalRecordsSchemaReady: true,
      swimCapabilityLimitsSchemaReady: true,
      loadError: null,
      metricsLoadError: null,
      preferencesLoadError: null,
      personalRecordsLoadError: null,
      swimCapabilityLimitsLoadError: null,
      profile: null,
      cssMetric: null,
      preferences: null,
      personalRecords: [],
      swimCapabilityLimits: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated preferences save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putTrainingPreferences(
      new Request("http://127.0.0.1:3000/api/my-library/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poolLengthM: "25" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects unsupported preference values before write", async () => {
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

    const response = await putTrainingPreferences(
      new Request("http://127.0.0.1:3000/api/my-library/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poolLengthM: "33" }),
      })
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("saves valid preferences for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "pref-1" },
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

    const response = await putTrainingPreferences(
      new Request("http://127.0.0.1:3000/api/my-library/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          poolLengthM: "25",
          availableDays: ["wednesday", "monday"],
          preferredWeeklySessionCount: "5",
          preferredSessionMinutes: "60",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("training_preferences");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        pool_length_m: 25,
        available_days: ["monday", "wednesday"],
        preferred_weekly_session_count: 5,
        preferred_session_minutes: 60,
      },
      { onConflict: "user_id" }
    );
  });
});
