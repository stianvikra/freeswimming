import { afterEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientIfAuthCookiePresentMock,
  resolveAdminRoleFromSupabaseMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientIfAuthCookiePresentMock: vi.fn(),
  resolveAdminRoleFromSupabaseMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClientIfAuthCookiePresent:
    createRouteHandlerSupabaseClientIfAuthCookiePresentMock,
}));

vi.mock("@/lib/admin/server", () => ({
  resolveAdminRoleFromSupabase: resolveAdminRoleFromSupabaseMock,
}));

import { GET } from "@/app/api/runtime/flags/route";

describe("/api/runtime/flags route", () => {
  afterEach(() => {
    createRouteHandlerSupabaseClientIfAuthCookiePresentMock.mockReset();
    resolveAdminRoleFromSupabaseMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("returns dashboard visibility fallback in example-host mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.com");

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.flags?.dashboardVisible).toBe(false);
    expect(createRouteHandlerSupabaseClientIfAuthCookiePresentMock).not.toHaveBeenCalled();
  });

  it("returns dashboard fallback without creating a Supabase client when no auth cookie exists", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project-ref.supabase.co");
    createRouteHandlerSupabaseClientIfAuthCookiePresentMock.mockResolvedValueOnce(null);

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.flags?.dashboardVisible).toBe(false);
    expect(createRouteHandlerSupabaseClientIfAuthCookiePresentMock).toHaveBeenCalledTimes(1);
    expect(resolveAdminRoleFromSupabaseMock).not.toHaveBeenCalled();
  });

  it("loads dashboard visibility for signed-in admins when auth cookies exist", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project-ref.supabase.co");
    const applySupabaseCookies = vi.fn((response: Response) => response);
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "owner@example.com" } },
          error: null,
        }),
      },
    };
    createRouteHandlerSupabaseClientIfAuthCookiePresentMock.mockResolvedValueOnce({
      supabase,
      applySupabaseCookies,
    });
    resolveAdminRoleFromSupabaseMock.mockResolvedValueOnce("admin");

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.flags?.dashboardVisible).toBe(true);
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(resolveAdminRoleFromSupabaseMock).toHaveBeenCalledWith(
      supabase,
      { id: "user-1", email: "owner@example.com" },
      { allowlistedEmailsRaw: undefined }
    );
    expect(applySupabaseCookies).toHaveBeenCalledTimes(1);
  });
});
