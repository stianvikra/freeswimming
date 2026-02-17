import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signOutMock, signInWithPasswordMock, createServerSupabaseClientMock } = vi.hoisted(() => {
  const signOut = vi.fn();
  const signInWithPassword = vi.fn();
  const createServerSupabaseClient = vi.fn(async () => ({
    auth: {
      signOut,
      signInWithPassword,
    },
  }));

  return {
    signOutMock: signOut,
    signInWithPasswordMock: signInWithPassword,
    createServerSupabaseClientMock: createServerSupabaseClient,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
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

describe("/api/dev-login route", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");
    vi.stubEnv("DEV_AUTH_BYPASS_TOKEN", "dev-token");
    vi.stubEnv("DEV_AUTH_BYPASS_EMAIL", "dev@example.com");
    vi.stubEnv("DEV_AUTH_BYPASS_PASSWORD", "dev-password");

    signOutMock.mockResolvedValue({ error: null });
    signInWithPasswordMock.mockResolvedValue({ error: null });
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
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("returns 403 for non-local requests", async () => {
    const response = await POST(
      buildRequest({
        origin: "https://freeswimming.org",
        forwardedHost: "freeswimming.org",
      })
    );
    expect(response.status).toBe(403);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    const response = await POST(
      buildRequest({
        token: "wrong-token",
      })
    );
    expect(response.status).toBe(401);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
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
    expect(createServerSupabaseClientMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "dev@example.com",
      password: "dev-password",
    });
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
    signInWithPasswordMock.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const response = await POST(buildRequest());
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(401);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Could not sign in.");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("rejects unsupported content type", async () => {
    const response = await POST(
      buildRequest({
        contentType: "text/plain",
      })
    );
    expect(response.status).toBe(415);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });
});
