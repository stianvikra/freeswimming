import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAdminSupabaseClientMock,
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

import { GET as getAdminUsersOverview } from "@/app/api/admin/users/overview/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildProfilesChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    ilike: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.ilike.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.range.mockResolvedValue(result);

  return chain;
}

function buildListChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    in: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockResolvedValue(result);

  return chain;
}

describe("admin users overview route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "viewer",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated access", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });

    const response = await getAdminUsersOverview(
      new Request("https://freeswimming.test/api/admin/users/overview")
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload).toEqual({ ok: false, error: "Unauthorized." });
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("returns minimized user overview rows behind the admin gate", async () => {
    const profilesChain = buildProfilesChain({
      data: [
        {
          id: "user-1",
          email: "swimmer@example.com",
          role: "viewer",
          created_at: "2026-06-01T08:00:00.000Z",
          updated_at: "2026-06-10T08:00:00.000Z",
        },
      ],
      count: 1,
      error: null,
    });
    const entitlementsChain = buildListChain({
      data: [
        {
          id: "entitlement-1",
          user_id: "user-1",
          product_id: "guide_poolside",
          source: "stripe_checkout",
          granted_at: "2026-06-11T09:00:00.000Z",
          updated_at: "2026-06-11T09:00:00.000Z",
          stripe_checkout_session_id: "should-not-leak",
        },
      ],
      error: null,
    });
    const activityChain = buildListChain({
      data: [{ user_id: "user-1", occurred_at: "2026-06-12T10:00:00.000Z", payload: {} }],
      error: null,
    });
    const productsChain = buildListChain({
      data: [{ id: "guide_poolside", title: "Poolside Guide", kind: "guide", active: true }],
      error: null,
    });
    const from = vi.fn((table: string) => {
      if (table === "profiles") return { select: profilesChain.select };
      if (table === "entitlements") return { select: entitlementsChain.select };
      if (table === "analytics_events") return { select: activityChain.select };
      if (table === "products") return { select: productsChain.select };
      return { select: vi.fn() };
    });
    createAdminSupabaseClientMock.mockReturnValueOnce({ from });

    const response = await getAdminUsersOverview(
      new Request(
        "https://freeswimming.test/api/admin/users/overview?q=swimmer&role=viewer&sort=email_asc"
      )
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      items?: Array<Record<string, unknown>>;
      query?: Record<string, unknown>;
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(requireAdminRoleFromSupabaseMock).toHaveBeenCalledWith(expect.anything(), {
      allowlistedEmailsRaw: undefined,
      minimumRole: "viewer",
    });
    expect(profilesChain.ilike).toHaveBeenCalledWith("email", "%swimmer%");
    expect(profilesChain.eq).toHaveBeenCalledWith("role", "viewer");
    expect(payload.query).toMatchObject({ search: "swimmer", role: "viewer", sort: "email_asc" });
    expect(payload.items?.[0]).toMatchObject({
      id: "user-1",
      email: "swimmer@example.com",
      role: "viewer",
      accessStatus: "active",
      entitlementCount: 1,
      lastActivityAt: "2026-06-12T10:00:00.000Z",
      products: [{ id: "guide_poolside", title: "Poolside Guide" }],
    });
    expect(JSON.stringify(payload)).not.toContain("should-not-leak");
    expect(JSON.stringify(payload)).not.toContain("payload");
  });

  it("returns setup guidance when the profiles schema is unavailable", async () => {
    const profilesChain = buildProfilesChain({
      data: null,
      count: null,
      error: {
        code: "42P01",
        message: 'relation "profiles" does not exist',
      },
    });
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(() => ({ select: profilesChain.select })),
    });

    const response = await getAdminUsersOverview(
      new Request("https://freeswimming.test/api/admin/users/overview")
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      warnings?: string[];
      items?: unknown[];
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.items).toEqual([]);
    expect(payload.warnings?.join(" ")).toContain("Admin users setup is not ready");
  });
});
