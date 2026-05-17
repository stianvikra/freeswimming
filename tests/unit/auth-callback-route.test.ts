import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { GET } from "@/app/auth/callback/route";

function buildRouteClient({
  exchangeError = null,
  verifyError = null,
}: {
  exchangeError?: Error | null;
  verifyError?: Error | null;
} = {}) {
  const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: exchangeError });
  const verifyOtp = vi.fn().mockResolvedValue({ error: verifyError });
  const applySupabaseCookies = vi.fn(<T extends Response>(response: T): T => {
    response.headers.set("x-supabase-cookies-applied", "1");
    return response;
  });

  return {
    supabase: {
      auth: {
        exchangeCodeForSession,
        verifyOtp,
      },
    },
    applySupabaseCookies,
    exchangeCodeForSession,
    verifyOtp,
  };
}

describe("/auth/callback route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  it("exchanges a code, applies Supabase cookies, and redirects to the safe next path", async () => {
    const routeClient = buildRouteClient();
    createRouteHandlerSupabaseClientMock.mockResolvedValue(routeClient);

    const response = await GET(
      new Request("https://freeswimming.org/auth/callback?code=abc123&next=%2Fmy-library")
    );

    expect(routeClient.exchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(routeClient.applySupabaseCookies).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-supabase-cookies-applied")).toBe("1");
    expect(response.headers.get("location")).toBe("https://freeswimming.org/my-library");
  });

  it("verifies token_hash callbacks and applies Supabase cookies", async () => {
    const routeClient = buildRouteClient();
    createRouteHandlerSupabaseClientMock.mockResolvedValue(routeClient);

    const response = await GET(
      new Request(
        "https://freeswimming.org/auth/callback?token_hash=hash123&type=magiclink&next=%2Fmy-library"
      )
    );

    expect(routeClient.verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash123",
      type: "magiclink",
    });
    expect(routeClient.applySupabaseCookies).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-supabase-cookies-applied")).toBe("1");
    expect(response.headers.get("location")).toBe("https://freeswimming.org/my-library");
  });

  it("does not create a Supabase client when callback input is missing", async () => {
    const response = await GET(
      new Request("https://freeswimming.org/auth/callback?next=%2Fcourse")
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
    expect(location.pathname).toBe("/auth/sign-in");
    expect(location.searchParams.get("next")).toBe("/course");
    expect(location.searchParams.get("error")).toContain("Could not verify sign-in");
  });

  it("keeps failed exchanges recoverable and applies any pending auth cookies", async () => {
    const routeClient = buildRouteClient({ exchangeError: new Error("expired") });
    createRouteHandlerSupabaseClientMock.mockResolvedValue(routeClient);

    const response = await GET(
      new Request("https://freeswimming.org/auth/callback?code=expired&next=%2Fmy-library")
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(routeClient.applySupabaseCookies).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-supabase-cookies-applied")).toBe("1");
    expect(location.pathname).toBe("/auth/sign-in");
    expect(location.searchParams.get("next")).toBe("/my-library");
    expect(location.searchParams.get("error")).toContain("Request a new sign-in email");
  });
});
