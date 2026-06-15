import { describe, expect, it } from "vitest";
import {
  buildAdminUsersIlikePattern,
  buildAdminUsersOverview,
  parseAdminUsersOverviewSearchParams,
  type AdminUserAuthSourceRow,
  type AdminUserProfileSourceRow,
} from "@/lib/admin/users";

const baseAuthUser: AdminUserAuthSourceRow = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "swimmer@example.com",
  created_at: "2026-06-01T08:00:00.000Z",
  updated_at: "2026-06-10T08:00:00.000Z",
  last_sign_in_at: "2026-06-12T09:30:00.000Z",
  confirmed_at: "2026-06-01T08:05:00.000Z",
  email_confirmed_at: "2026-06-01T08:05:00.000Z",
  phone_confirmed_at: undefined,
  app_metadata: {},
  user_metadata: { display_name: "Pool Swimmer" },
};

const baseProfile: AdminUserProfileSourceRow = {
  id: baseAuthUser.id,
  email: "swimmer@example.com",
  role: "viewer",
  created_at: "2026-06-01T08:00:00.000Z",
  updated_at: "2026-06-10T08:00:00.000Z",
};

describe("admin users overview contracts", () => {
  it("parses bounded search, role, sort, and page params", () => {
    const params = new URLSearchParams({
      q: " swimmer@example.com ",
      role: "admin",
      sort: "email_asc",
      page: "2",
      pageSize: "500",
    });

    expect(parseAdminUsersOverviewSearchParams(params)).toEqual({
      search: "swimmer@example.com",
      role: "admin",
      sort: "email_asc",
      page: 2,
      pageSize: 50,
    });
  });

  it("escapes ilike wildcard characters for legacy profile queries", () => {
    expect(buildAdminUsersIlikePattern("a_b%c\\d")).toBe("%a\\_b\\%c\\\\d%");
  });

  it("builds an auth-canonical user overview without raw provider or analytics payload fields", () => {
    const overview = buildAdminUsersOverview({
      authUsers: [baseAuthUser],
      profiles: [baseProfile],
      athleteProfiles: [
        {
          user_id: baseAuthUser.id,
          display_name: "Fast Freestyler",
          first_name: null,
          last_name: null,
          updated_at: "2026-06-11T08:00:00.000Z",
        },
      ],
      entitlements: [
        {
          id: "entitlement-1",
          user_id: baseAuthUser.id,
          product_id: "guide_poolside",
          source: "stripe_checkout",
          granted_at: "2026-06-11T09:00:00.000Z",
          updated_at: "2026-06-11T09:00:00.000Z",
        },
      ],
      products: [
        {
          id: "guide_poolside",
          title: "Poolside Guide",
          kind: "guide",
          active: true,
        },
      ],
      activityRows: [{ user_id: baseAuthUser.id, occurred_at: "2026-06-12T10:00:00.000Z" }],
      query: {
        search: "",
        role: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 25,
      },
      generatedAt: new Date("2026-06-12T12:00:00.000Z"),
    });

    expect(overview).toMatchObject({
      ok: true,
      summary: {
        totalUsers: 1,
        usersWithAccess: 1,
        usersWithoutAccess: 0,
        viewerUsers: 1,
        missingProfileUsers: 0,
        unconfirmedUsers: 0,
      },
      items: [
        {
          id: baseAuthUser.id,
          email: "swimmer@example.com",
          displayName: "Fast Freestyler",
          displayNameSource: "athlete_profile",
          role: "viewer",
          roleSource: "profile",
          profileStatus: "complete",
          authStatus: "confirmed",
          testerStatus: "not_configured",
          accessStatus: "active",
          entitlementCount: 1,
          latestGrantedAt: "2026-06-11T09:00:00.000Z",
          lastActivityAt: "2026-06-12T10:00:00.000Z",
          lastActivitySource: "product_activity",
          products: [
            {
              id: "guide_poolside",
              title: "Poolside Guide",
              kind: "guide",
              active: true,
              known: true,
            },
          ],
          supportCodes: [],
        },
      ],
    });
    expect(JSON.stringify(overview)).not.toContain("stripe_checkout_session");
    expect(JSON.stringify(overview)).not.toContain("payload");
  });

  it("shows auth users without profiles instead of dropping them", () => {
    const overview = buildAdminUsersOverview({
      authUsers: [
        {
          ...baseAuthUser,
          id: "22222222-2222-4222-8222-222222222222",
          email: "missing-profile@example.com",
          confirmed_at: undefined,
          email_confirmed_at: undefined,
        },
      ],
      profiles: [],
      entitlements: [],
      products: [],
      activityRows: [],
      query: {
        search: "",
        role: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 25,
      },
    });

    expect(overview.summary).toMatchObject({
      totalUsers: 1,
      missingProfileUsers: 1,
      unconfirmedUsers: 1,
      unknownRoleUsers: 1,
    });
    expect(overview.items[0]).toMatchObject({
      email: "missing-profile@example.com",
      role: "unknown",
      roleSource: "none",
      profileStatus: "missing_profile",
      authStatus: "unconfirmed",
      supportCodes: [
        "missing_profile",
        "unknown_role",
        "email_unconfirmed",
        "no_entitlement",
        "last_activity_unknown",
      ],
    });
  });

  it("marks allowlisted admins as an explicit support signal", () => {
    const overview = buildAdminUsersOverview({
      authUsers: [
        {
          ...baseAuthUser,
          app_metadata: {},
        },
      ],
      profiles: [],
      entitlements: [],
      products: [],
      activityRows: [],
      query: {
        search: "",
        role: "admin",
        sort: "updated_desc",
        page: 1,
        pageSize: 25,
      },
      allowlistedEmailsRaw: "swimmer@example.com",
    });

    expect(overview.summary).toMatchObject({
      totalUsers: 1,
      adminUsers: 1,
      missingProfileUsers: 1,
    });
    expect(overview.items[0]).toMatchObject({
      role: "admin",
      roleSource: "allowlist",
      supportCodes: expect.arrayContaining(["missing_profile", "allowlist_override"]),
    });
  });

  it("falls back safely for unknown products, profile email mismatch, and partial data", () => {
    const overview = buildAdminUsersOverview({
      authUsers: [baseAuthUser],
      profiles: [
        {
          ...baseProfile,
          email: "old@example.com",
          role: "future_role" as never,
        },
      ],
      entitlements: [
        {
          id: "entitlement-1",
          user_id: baseAuthUser.id,
          product_id: "future_product",
          source: "manual",
          granted_at: "2026-06-11T09:00:00.000Z",
          updated_at: "2026-06-11T09:00:00.000Z",
        },
      ],
      products: [],
      activityRows: [],
      query: {
        search: "",
        role: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 25,
      },
      partialSummary: true,
    });

    expect(overview.items[0]).toMatchObject({
      role: "unknown",
      profileStatus: "profile_email_mismatch",
      lastActivitySource: "auth_user",
      products: [
        {
          id: "future_product",
          title: "future_product",
          kind: "unknown",
          active: null,
          known: false,
        },
      ],
      supportCodes: [
        "profile_email_mismatch",
        "unknown_role",
        "last_activity_unknown",
        "summary_partial",
      ],
    });
  });
});
