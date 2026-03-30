import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));
const { requireAdminRoleFromSupabaseMock } = vi.hoisted(() => ({
  requireAdminRoleFromSupabaseMock: vi.fn(),
}));
const { createSiteLockSessionTokenMock } = vi.hoisted(() => ({
  createSiteLockSessionTokenMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));
vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));
vi.mock("@/lib/site-lock/session", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/site-lock/session")>("@/lib/site-lock/session");
  return {
    ...actual,
    createSiteLockSessionToken: createSiteLockSessionTokenMock,
  };
});

import { POST } from "@/app/preview-access/admin-unlock/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

describe("/preview-access/admin-unlock route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    requireAdminRoleFromSupabaseMock.mockReset();
    createSiteLockSessionTokenMock.mockReset();

    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("fails closed when no admin session is available", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ next: "/admin" }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(401);
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/sign in as an admin/i);
  });

  it("requires aal2 before issuing preview access cookie", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getClaims: vi.fn().mockResolvedValue({
            data: {
              claims: { aal: "aal1" },
            },
            error: null,
          }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "user-1" },
      role: "admin",
    });

    const response = await POST(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ next: "/admin" }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(403);
    expect(payload.ok).toBe(false);
    expect(payload.error).toMatch(/verify your admin passkey/i);
  });

  it("sets preview access cookie for aal2 admin sessions", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getClaims: vi.fn().mockResolvedValue({
            data: {
              claims: { aal: "aal2" },
            },
            error: null,
          }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "user-1" },
      role: "admin",
    });
    createSiteLockSessionTokenMock.mockResolvedValue("signed-preview-token");

    const response = await POST(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ next: "/admin" }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; redirectPath: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.redirectPath).toBe("/admin");
    expect(response.headers.get("set-cookie")).toContain("fs_preview_access=signed-preview-token");
  });
});
