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

import {
  GET as getAthleteProfile,
  PUT as putAthleteProfile,
} from "@/app/api/my-library/profile/route";
import { PUT as putAthleteCapabilities } from "@/app/api/my-library/profile/capabilities/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildRouteClient(userId: string | null) {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: userId ? { id: userId } : null,
          },
        }),
      },
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  };
}

function buildEmptyProfileSnapshot() {
  return {
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
  };
}

describe("athlete profile routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadAthleteProfileSnapshotMock.mockResolvedValue(buildEmptyProfileSnapshot());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated athlete-profile GET", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await getAthleteProfile();
    expect(response.status).toBe(401);
  });

  it("fails closed for unauthenticated athlete-profile PUT", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await putAthleteProfile(
      new Request("http://127.0.0.1:3000/api/my-library/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: "Stian" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects empty athlete-profile payloads before write", async () => {
    const from = vi.fn();

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putAthleteProfile(
      new Request("http://127.0.0.1:3000/api/my-library/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: " ",
          firstName: "",
          lastName: "",
          ageBand: "",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("saves valid athlete profile payloads for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "profile-1",
        user_id: "user-1",
        display_name: "Poolside Stian",
        first_name: "Stian",
        last_name: "Vikra",
        age_band: "35_44",
        created_at: "2026-03-19T18:00:00.000Z",
        updated_at: "2026-03-19T18:05:00.000Z",
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const upsert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ upsert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putAthleteProfile(
      new Request("http://127.0.0.1:3000/api/my-library/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: "Poolside Stian",
          firstName: "Stian",
          lastName: "Vikra",
          ageBand: "35_44",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("athlete_profiles");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        display_name: "Poolside Stian",
        first_name: "Stian",
        last_name: "Vikra",
        age_band: "35_44",
      },
      { onConflict: "user_id" }
    );
  });

  it("fails closed for unauthenticated swim capability limits PUT", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await putAthleteCapabilities(
      new Request("http://127.0.0.1:3000/api/my-library/profile/capabilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limits: [] }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects invalid swim capability limit payloads before persistence", async () => {
    const rpc = vi.fn();

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        rpc,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putAthleteCapabilities(
      new Request("http://127.0.0.1:3000/api/my-library/profile/capabilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limits: [{ kind: "stroke", stroke: "dogpaddle", maxRepeatDistanceM: 25 }],
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("replaces swim capability limits through one atomic owner-scoped RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
        }),
      },
      rpc,
    };

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    loadAthleteProfileSnapshotMock.mockResolvedValue({
      ...buildEmptyProfileSnapshot(),
      swimCapabilityLimits: [
        {
          id: "limit-1",
          kind: "drill",
          stroke: null,
          strokeLabel: null,
          maxRepeatDistanceM: 25,
          maxRepeatDistanceLabel: "25m",
          maxTotalDistanceM: null,
          maxTotalDistanceLabel: null,
          targetTotalDistanceM: 200,
          targetTotalDistanceLabel: "200m",
          createdAt: "2026-05-16T10:00:00.000Z",
          updatedAt: "2026-05-16T10:00:00.000Z",
        },
      ],
    });

    const response = await putAthleteCapabilities(
      new Request("http://127.0.0.1:3000/api/my-library/profile/capabilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limits: [{ kind: "drill", maxRepeatDistanceM: 25, targetTotalDistanceM: 200 }],
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith("replace_swim_capability_limits", {
      p_limits: [
        {
          limit_kind: "drill",
          stroke: null,
          max_repeat_distance_m: 25,
          max_total_distance_m: null,
          target_total_distance_m: 200,
        },
      ],
    });
    expect(loadAthleteProfileSnapshotMock).toHaveBeenCalledWith(supabase, "user-1");
  });

  it("does not reload or report success when atomic capability replacement fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const rpc = vi.fn().mockResolvedValue({
      error: {
        code: "23514",
        message: "constraint failed",
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        rpc,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await putAthleteCapabilities(
      new Request("http://127.0.0.1:3000/api/my-library/profile/capabilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limits: [{ kind: "kick", maxRepeatDistanceM: 25, targetTotalDistanceM: 200 }],
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Could not save stroke and skill limits right now.");
    expect(consoleError).toHaveBeenCalledWith(
      "[AthleteProfileApi] Could not replace swim capability limits",
      {
        code: "23514",
        message: "constraint failed",
      }
    );
    expect(loadAthleteProfileSnapshotMock).not.toHaveBeenCalled();
  });
});
