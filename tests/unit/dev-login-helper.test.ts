import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, getDevAuthBypassConfigMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  getDevAuthBypassConfigMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/auth/dev-auth-bypass", () => ({
  getDevAuthBypassConfig: getDevAuthBypassConfigMock,
}));

import { signInWithDevBypassAccount } from "@/lib/auth/dev-login";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("signInWithDevBypassAccount", () => {
  beforeEach(() => {
    getDevAuthBypassConfigMock.mockReturnValue({
      email: "dev@example.com",
      password: "dev-password",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retries transient auth fetch failures before succeeding", async () => {
    const signOutMock = vi.fn().mockResolvedValue(undefined);
    const signInWithPasswordMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("fetch failed"), {
          status: 0,
          code: "UND_ERR_CONNECT_TIMEOUT",
        })
      )
      .mockResolvedValueOnce({ error: null });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          signOut: signOutMock,
          signInWithPassword: signInWithPasswordMock,
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const result = await signInWithDevBypassAccount();

    expect(result.ok).toBe(true);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signInWithPasswordMock).toHaveBeenCalledTimes(2);
  });

  it("fails closed on non-retryable auth errors", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const signInWithPasswordMock = vi.fn().mockResolvedValue({
      error: {
        message: "Invalid login credentials",
        status: 400,
      },
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          signOut: vi.fn().mockResolvedValue(undefined),
          signInWithPassword: signInWithPasswordMock,
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const result = await signInWithDevBypassAccount();

    expect(result.ok).toBe(false);
    expect(signInWithPasswordMock).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});
