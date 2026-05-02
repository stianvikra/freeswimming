import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadAthleteProfileSnapshotMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  loadAthleteProfileSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/athlete-profile/server", () => ({
  loadAthleteProfileSnapshot: loadAthleteProfileSnapshotMock,
}));

import { PUT as putSwimCapabilities } from "@/app/api/my-library/profile/capabilities/route";

const snapshot = {
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

function request(limits: unknown) {
  return new Request("http://127.0.0.1:3000/api/my-library/profile/capabilities", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limits }),
  });
}

function mockSupabase(userId: string | null, from?: ReturnType<typeof vi.fn>) {
  createRouteHandlerSupabaseClientMock.mockResolvedValue({
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: userId ? { id: userId } : null },
        }),
      },
      from,
    },
    applySupabaseCookies: <T>(response: T) => response,
  });
}

describe("swim capability routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadAthleteProfileSnapshotMock.mockResolvedValue(snapshot);
  });

  it("fails closed for unauthenticated capability saves", async () => {
    mockSupabase(null);

    const response = await putSwimCapabilities(request([]));
    expect(response.status).toBe(401);
  });

  it("rejects invalid limits before write", async () => {
    const from = vi.fn();

    mockSupabase("user-1", from);

    const response = await putSwimCapabilities(
      request([{ kind: "stroke", stroke: "backstroke", targetTotalDistanceM: "200" }])
    );
    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("replaces saved capability limits for the authenticated owner", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRows = vi.fn(() => ({ eq }));
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({
      delete: deleteRows,
      insert,
    }));

    mockSupabase("user-1", from);

    const response = await putSwimCapabilities(
      request([
        { kind: "drill", maxRepeatDistanceM: "25", targetTotalDistanceM: "300" },
        {
          kind: "stroke",
          stroke: "backstroke",
          maxRepeatDistanceM: "25",
          maxTotalDistanceM: "200",
        },
      ])
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("swim_capability_limits");
    expect(deleteRows).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        limit_kind: "drill",
        max_repeat_distance_m: 25,
        target_total_distance_m: 300,
      }),
      expect.objectContaining({
        limit_kind: "stroke",
        stroke: "backstroke",
        max_total_distance_m: 200,
      }),
    ]);
  });
});
