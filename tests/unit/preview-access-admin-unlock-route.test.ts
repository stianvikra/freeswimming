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

import { GET, POST } from "@/app/preview-access/admin-unlock/route";

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

  it("redirects anonymous GET requests back to the preview password page", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });

    const response = await GET(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock?next=%2Fadmin")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/preview-access?next=%2Fadmin"
    );
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ minimumRole: "admin" })
    );
  });

  it("sets preview access cookie and redirects for authenticated admin GET requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "user-1" },
      role: "admin",
    });
    createSiteLockSessionTokenMock.mockResolvedValue("signed-preview-token");

    const response = await GET(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock?next=%2Fmy-library")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/my-library");
    expect(response.headers.get("set-cookie")).toContain("fs_preview_access=signed-preview-token");
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ minimumRole: "admin" })
    );
  });

  it("does not issue preview access cookie for non-admin GET requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });

    const response = await GET(
      new Request("http://127.0.0.1:3000/preview-access/admin-unlock?next=%2Fmy-library")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/preview-access?next=%2Fmy-library"
    );
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(createSiteLockSessionTokenMock).not.toHaveBeenCalled();
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
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ minimumRole: "admin" })
    );
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
    expect(payload.error).toMatch(/stronger admin verification/i);
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
