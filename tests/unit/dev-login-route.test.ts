import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithDevBypassAccountMock } = vi.hoisted(() => {
  const signInWithDevBypassAccount = vi.fn();

  return {
    signInWithDevBypassAccountMock: signInWithDevBypassAccount,
  };
});

vi.mock("@/lib/auth/dev-login", () => ({
  signInWithDevBypassAccount: signInWithDevBypassAccountMock,
}));

import { POST } from "@/app/api/dev-login/route";

function buildRequest(input?: {
  token?: string;
  origin?: string;
  forwardedHost?: string;
  contentType?: string;
  body?: Record<string, unknown>;
}) {
  return new Request("http://127.0.0.1:3000/api/dev-login", {
    method: "POST",
    headers: {
      "content-type": input?.contentType ?? "application/json",
      origin: input?.origin ?? "http://127.0.0.1:3000",
      "x-forwarded-host": input?.forwardedHost ?? "127.0.0.1:3000",
      "x-dev-auth-token": input?.token ?? "dev-token",
    },
    body: JSON.stringify(input?.body ?? { next: "/my-library" }),
  });
}

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("/api/dev-login route", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");
    vi.stubEnv("DEV_AUTH_BYPASS_TOKEN", "dev-token");
    vi.stubEnv("DEV_AUTH_BYPASS_EMAIL", "dev@example.com");
    vi.stubEnv("DEV_AUTH_BYPASS_PASSWORD", "dev-password");

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

  it("returns 404 when bypass is disabled or outside development mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");

    const response = await POST(buildRequest());
    expect(response.status).toBe(404);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });

  it("returns 403 for non-local requests", async () => {
    const response = await POST(
      buildRequest({
        origin: "https://freeswimming.org",
        forwardedHost: "freeswimming.org",
      })
    );
    expect(response.status).toBe(403);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const response = await POST(
      buildRequest({
        token: "wrong-token",
      })
    );
    expect(response.status).toBe(401);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });

  it("signs in with configured dev credentials and returns safe next path", async () => {
    const response = await POST(
      buildRequest({
        body: { next: "/guides/poolside" },
      })
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      nextPath?: string;
      userEmail?: string;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      nextPath: "/guides/poolside",
      userEmail: "dev@example.com",
    });
    expect(signInWithDevBypassAccountMock).toHaveBeenCalledTimes(1);
  });

  it("sanitizes non-local next path and uses fallback", async () => {
    const response = await POST(
      buildRequest({
        body: { next: "https://evil.example/redirect" },
      })
    );
    const payload = (await response.json()) as { nextPath?: string };

    expect(response.status).toBe(200);
    expect(payload.nextPath).toBe("/my-library");
  });

  it("returns 401 when configured dev credentials cannot sign in", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    signInWithDevBypassAccountMock.mockResolvedValue({
      ok: false,
      error: "Could not sign in.",
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await POST(buildRequest());
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(401);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Could not sign in.");
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("rejects unsupported content type", async () => {
    const response = await POST(
      buildRequest({
        contentType: "text/plain",
      })
    );
    expect(response.status).toBe(415);
    expect(signInWithDevBypassAccountMock).not.toHaveBeenCalled();
  });
});
