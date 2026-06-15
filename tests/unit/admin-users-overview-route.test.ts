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
import { PATCH as patchAdminUserRole } from "@/app/api/admin/users/[userId]/role/route";

const userId = "11111111-1111-4111-8111-111111111111";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildInTerminalChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    in: vi.fn(),
    eq: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.in.mockResolvedValue(result);
  chain.eq.mockReturnValue(chain);

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

function buildMaybeSingleChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(result);

  return chain;
}

function buildAuthUser(overrides: Record<string, unknown> = {}) {
  return {
    id: userId,
    email: "swimmer@example.com",
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-10T08:00:00.000Z",
    last_sign_in_at: "2026-06-12T09:30:00.000Z",
    confirmed_at: "2026-06-01T08:05:00.000Z",
    email_confirmed_at: "2026-06-01T08:05:00.000Z",
    app_metadata: {},
    user_metadata: { display_name: "Pool Swimmer" },
    ...overrides,
  };
}

function createOverviewAdminClient() {
  const profilesChain = buildInTerminalChain({
    data: [
      {
        id: userId,
        email: "swimmer@example.com",
        role: "viewer",
        created_at: "2026-06-01T08:00:00.000Z",
        updated_at: "2026-06-10T08:00:00.000Z",
      },
    ],
    error: null,
  });
  const athleteProfilesChain = buildInTerminalChain({
    data: [
      {
        user_id: userId,
        display_name: "Fast Freestyler",
        first_name: null,
        last_name: null,
        updated_at: "2026-06-11T08:00:00.000Z",
      },
    ],
    error: null,
  });
  const entitlementsChain = buildListChain({
    data: [
      {
        id: "entitlement-1",
        user_id: userId,
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
    data: [{ user_id: userId, occurred_at: "2026-06-12T10:00:00.000Z", payload: {} }],
    error: null,
  });
  const productsChain = buildListChain({
    data: [{ id: "guide_poolside", title: "Poolside Guide", kind: "guide", active: true }],
    error: null,
  });
  const from = vi.fn((table: string) => {
    if (table === "profiles") return { select: profilesChain.select };
    if (table === "athlete_profiles") return { select: athleteProfilesChain.select };
    if (table === "entitlements") return { select: entitlementsChain.select };
    if (table === "analytics_events") return { select: activityChain.select };
    if (table === "products") return { select: productsChain.select };
    return { select: vi.fn() };
  });
  const listUsers = vi.fn().mockResolvedValue({
    data: {
      users: [buildAuthUser()],
      aud: "authenticated",
      nextPage: null,
      lastPage: 1,
      total: 1,
    },
    error: null,
  });

  return {
    client: { from, auth: { admin: { listUsers } } },
    chains: {
      profilesChain,
      athleteProfilesChain,
      entitlementsChain,
      activityChain,
      productsChain,
    },
    listUsers,
  };
}

describe("admin users overview route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id", email: "admin@example.com" },
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

  it("returns a controlled failure when Auth Admin user listing fails", async () => {
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [], nextPage: null },
      error: { message: "Auth Admin unavailable" },
    });
    const from = vi.fn();
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from,
      auth: { admin: { listUsers } },
    });

    const response = await getAdminUsersOverview(
      new Request("https://freeswimming.test/api/admin/users/overview")
    );
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    expect(response.status).toBe(500);
    expect(payload).toEqual({ ok: false, error: "Could not load auth users right now." });
    expect(from).not.toHaveBeenCalled();
  });

  it("returns minimized auth-canonical user rows behind the admin gate", async () => {
    const { client, chains, listUsers } = createOverviewAdminClient();
    createAdminSupabaseClientMock.mockReturnValueOnce(client);

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
    expect(listUsers).toHaveBeenCalledWith({ page: 1, perPage: 1000 });
    expect(chains.profilesChain.in).toHaveBeenCalledWith("id", [userId]);
    expect(payload.query).toMatchObject({ search: "swimmer", role: "viewer", sort: "email_asc" });
    expect(payload.items?.[0]).toMatchObject({
      id: userId,
      email: "swimmer@example.com",
      displayName: "Fast Freestyler",
      role: "viewer",
      roleSource: "profile",
      profileStatus: "complete",
      authStatus: "confirmed",
      accessStatus: "active",
      entitlementCount: 1,
      lastActivityAt: "2026-06-12T10:00:00.000Z",
      products: [{ id: "guide_poolside", title: "Poolside Guide" }],
    });
    expect(JSON.stringify(payload)).not.toContain("should-not-leak");
    expect(JSON.stringify(payload)).not.toContain("payload");
  });

  it("keeps auth users visible when profiles are missing", async () => {
    const profilesChain = buildInTerminalChain({ data: [], error: null });
    const emptyInChain = buildInTerminalChain({ data: [], error: null });
    const emptyListChain = buildListChain({ data: [], error: null });
    const productsChain = buildListChain({ data: [], error: null });
    const from = vi.fn((table: string) => {
      if (table === "profiles") return { select: profilesChain.select };
      if (table === "athlete_profiles") return { select: emptyInChain.select };
      if (table === "entitlements") return { select: emptyListChain.select };
      if (table === "analytics_events") return { select: emptyListChain.select };
      if (table === "products") return { select: productsChain.select };
      return { select: vi.fn() };
    });
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from,
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [buildAuthUser({ email_confirmed_at: undefined, confirmed_at: undefined })],
              nextPage: null,
              lastPage: 1,
              total: 1,
            },
            error: null,
          }),
        },
      },
    });

    const response = await getAdminUsersOverview(
      new Request("https://freeswimming.test/api/admin/users/overview")
    );
    const payload = (await response.json()) as {
      items?: Array<Record<string, unknown>>;
      summary?: Record<string, unknown>;
    };

    expect(response.status).toBe(200);
    expect(payload.summary).toMatchObject({ totalUsers: 1, missingProfileUsers: 1 });
    expect(payload.items?.[0]).toMatchObject({
      profileStatus: "missing_profile",
      role: "unknown",
      supportCodes: expect.arrayContaining(["missing_profile", "unknown_role"]),
    });
  });
});

describe("admin user role route", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id", email: "admin@example.com" },
      role: "admin",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin role for role mutation", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "Forbidden.",
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "editor", expectedRole: "viewer", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as { ok?: boolean; code?: string };

    expect(response.status).toBe(403);
    expect(payload).toMatchObject({ ok: false, code: "forbidden" });
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("keeps unauthenticated role mutation distinct from forbidden", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "editor", expectedRole: "viewer", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as { ok?: boolean; code?: string };

    expect(response.status).toBe(401);
    expect(payload).toMatchObject({ ok: false, code: "unauthorized" });
    expect(createAdminSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("updates role through audited RPC after conflict check", async () => {
    const profileChain = buildMaybeSingleChain({
      data: {
        id: userId,
        email: "swimmer@example.com",
        role: "viewer",
        created_at: "2026-06-01T08:00:00.000Z",
        updated_at: "2026-06-10T08:00:00.000Z",
      },
      error: null,
    });
    const getUserById = vi.fn().mockResolvedValue({
      data: { user: buildAuthUser() },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({ data: { id: userId, role: "editor" }, error: null });
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(() => ({ select: profileChain.select })),
      auth: { admin: { getUserById } },
      rpc,
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "editor", expectedRole: "viewer", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ ok: true, userId, role: "editor", auditLogged: true });
    expect(rpc).toHaveBeenCalledWith("admin_set_user_role", {
      p_target_user_id: userId,
      p_target_email: "swimmer@example.com",
      p_next_role: "editor",
      p_actor_user_id: "admin-user-id",
      p_actor_email: "admin@example.com",
      p_reason: "owner_request",
      p_before: expect.objectContaining({ role: "viewer", roleSource: "profile" }),
      p_after: expect.objectContaining({ role: "editor", roleSource: "profile" }),
    });
  });

  it("repairs missing profile roles through the audited RPC", async () => {
    const profileChain = buildMaybeSingleChain({
      data: null,
      error: null,
    });
    const getUserById = vi.fn().mockResolvedValue({
      data: { user: buildAuthUser() },
      error: null,
    });
    const rpc = vi.fn().mockResolvedValue({ data: { id: userId, role: "viewer" }, error: null });
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(() => ({ select: profileChain.select })),
      auth: { admin: { getUserById } },
      rpc,
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "viewer", expectedRole: "unknown", reason: "repair" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ ok: true, userId, role: "viewer", auditLogged: true });
    expect(rpc).toHaveBeenCalledWith("admin_set_user_role", {
      p_target_user_id: userId,
      p_target_email: "swimmer@example.com",
      p_next_role: "viewer",
      p_actor_user_id: "admin-user-id",
      p_actor_email: "admin@example.com",
      p_reason: "repair",
      p_before: expect.objectContaining({ role: "unknown", roleSource: "none" }),
      p_after: expect.objectContaining({ role: "viewer", roleSource: "profile" }),
    });
  });

  it("does not mask Auth Admin lookup failures as missing users", async () => {
    const rpc = vi.fn();
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Auth service unavailable", status: 500 },
          }),
        },
      },
      rpc,
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "editor", expectedRole: "viewer", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(500);
    expect(payload).toMatchObject({ ok: false, code: "audit_or_update_failed" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects stale role mutations before RPC", async () => {
    const profileChain = buildMaybeSingleChain({
      data: {
        id: userId,
        email: "swimmer@example.com",
        role: "admin",
        created_at: "2026-06-01T08:00:00.000Z",
        updated_at: "2026-06-10T08:00:00.000Z",
      },
      error: null,
    });
    const rpc = vi.fn();
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(() => ({ select: profileChain.select })),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({ data: { user: buildAuthUser() }, error: null }),
        },
      },
      rpc,
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "editor", expectedRole: "viewer", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(409);
    expect(payload).toMatchObject({ ok: false, code: "role_conflict" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps last-admin RPC guard to a conflict response", async () => {
    const profileChain = buildMaybeSingleChain({
      data: {
        id: userId,
        email: "swimmer@example.com",
        role: "admin",
        created_at: "2026-06-01T08:00:00.000Z",
        updated_at: "2026-06-10T08:00:00.000Z",
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValueOnce({
      from: vi.fn(() => ({ select: profileChain.select })),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({ data: { user: buildAuthUser() }, error: null }),
        },
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "last_admin_role_change_blocked" },
      }),
    });

    const response = await patchAdminUserRole(
      new Request(`https://freeswimming.test/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "viewer", expectedRole: "admin", reason: "owner_request" }),
      }),
      { params: Promise.resolve({ userId }) }
    );
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(409);
    expect(payload).toMatchObject({ ok: false, code: "last_admin" });
  });
});
