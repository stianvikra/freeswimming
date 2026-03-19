import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import {
  GET as getAthleteProfile,
  PUT as putAthleteProfile,
} from "@/app/api/my-library/profile/route";

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

describe("athlete profile routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
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
});
