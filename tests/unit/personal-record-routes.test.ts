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

import { POST as postPersonalRecord } from "@/app/api/my-library/profile/records/route";
import {
  DELETE as deletePersonalRecord,
  PUT as putPersonalRecord,
} from "@/app/api/my-library/profile/records/[recordId]/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildSnapshot() {
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

describe("personal record routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadAthleteProfileSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated record save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postPersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ distanceM: "100" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects malformed time before write", async () => {
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

    const response = await postPersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distanceM: "100",
          stroke: "freestyle",
          course: "pool_25m",
          time: "10234",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("creates valid personal records for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "record-1" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postPersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distanceM: "100",
          stroke: "freestyle",
          course: "pool_25m",
          time: "1:02.34",
          recordedOn: "2026-03-19",
          sourceNote: "Club night",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("personal_records");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      distance_m: 100,
      stroke: "freestyle",
      course: "pool_25m",
      time_centiseconds: 6234,
      recorded_on: "2026-03-19",
      source_note: "Club night",
    });
  });

  it("returns a conflict when another record already owns the same event", async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "23505" },
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postPersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distanceM: "100",
          stroke: "freestyle",
          course: "pool_25m",
          time: "1:02.34",
        }),
      })
    );

    expect(response.status).toBe(409);
  });

  it("updates and deletes records owned by the authenticated user", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: "record-1" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "record-1" },
        error: null,
      });
    const select = vi.fn(() => ({ maybeSingle }));
    const update = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ select })) })) }));
    const deleteChain = {
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({ maybeSingle })),
        })),
      })),
    };
    const from = vi
      .fn()
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ delete: vi.fn(() => deleteChain) });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const putResponse = await putPersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records/record-1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distanceM: "100",
          stroke: "freestyle",
          course: "pool_50m",
          time: "1:05.00",
        }),
      }),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    const deleteResponse = await deletePersonalRecord(
      new Request("http://127.0.0.1:3000/api/my-library/profile/records/record-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ recordId: "record-1" }) }
    );

    expect(putResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
