import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithDevBypassAccountMock } = vi.hoisted(() => ({
  signInWithDevBypassAccountMock: vi.fn(),
}));

vi.mock("@/lib/auth/dev-login", () => ({
  signInWithDevBypassAccount: signInWithDevBypassAccountMock,
}));

import { GET } from "@/app/dev/login/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildRequest(input?: { url?: string; origin?: string; forwardedHost?: string }) {
  return new Request(input?.url ?? "http://127.0.0.1:3000/dev/login?next=/my-library", {
    method: "GET",
    headers: {
      origin: input?.origin ?? "http://127.0.0.1:3000",
      "x-forwarded-host": input?.forwardedHost ?? "127.0.0.1:3000",
    },
  });
}

describe("/dev/login shortcut route", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");
    signInWithDevBypassAccountMock.mockResolvedValue({
      ok: true,
      userEmail: "dev@example.com",
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns 404 when bypass is disabled", async () => {
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "0");

    const response = await GET(buildRequest());
    expect(response.status).toBe(404);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });

  it("returns 403 for non-local requests", async () => {
    const response = await GET(
      buildRequest({
        origin: "https://freeswimming.org",
        forwardedHost: "freeswimming.org",
      })
    );

    expect(response.status).toBe(403);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });

  it("redirects to next path on successful sign-in", async () => {
    const response = await GET(
      buildRequest({
        url: "http://127.0.0.1:3000/dev/login?next=/guides/poolside",
      })
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/guides/poolside");
    expect(signInWithDevBypassAccountMock).toHaveBeenCalledTimes(1);
  });

  it("keeps incoming host for redirects to avoid localhost/127 cookie split", async () => {
    const response = await GET(
      buildRequest({
        url: "http://localhost:3000/dev/login?next=/my-library",
        origin: "http://127.0.0.1:3000",
        forwardedHost: "127.0.0.1:3000",
      })
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/my-library");
  });

  it("sanitizes unsafe next param and redirects to my-library fallback", async () => {
    const response = await GET(
      buildRequest({
        url: "http://127.0.0.1:3000/dev/login?next=https://evil.example/phish",
      })
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/my-library");
  });

  it("redirects to sign-in with error when dev bypass sign-in fails", async () => {
    signInWithDevBypassAccountMock.mockResolvedValue({
      ok: false,
      error: "Could not sign in.",
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await GET(
      buildRequest({
        url: "http://127.0.0.1:3000/dev/login?next=/my-library",
      })
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/auth/sign-in?next=%2Fmy-library&error=Could+not+sign+in."
    );
  });
});
