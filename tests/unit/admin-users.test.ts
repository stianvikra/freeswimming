import { describe, expect, it } from "vitest";
import {
  buildAdminUsersIlikePattern,
  buildAdminUsersOverview,
  parseAdminUsersOverviewSearchParams,
  type AdminUserProfileSourceRow,
} from "@/lib/admin/users";

const baseProfile: AdminUserProfileSourceRow = {
  id: "user-1",
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

  it("escapes ilike wildcard characters in email search", () => {
    expect(buildAdminUsersIlikePattern("a_b%c\\d")).toBe("%a\\_b\\%c\\\\d%");
  });

  it("builds a minimized user overview without raw provider or analytics payload fields", () => {
    const overview = buildAdminUsersOverview({
      profiles: [baseProfile],
      entitlements: [
        {
          id: "entitlement-1",
          user_id: "user-1",
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
      activityRows: [{ user_id: "user-1", occurred_at: "2026-06-12T10:00:00.000Z" }],
      query: {
        search: "",
        role: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 25,
      },
      totalCount: 1,
      hasNextPage: false,
      generatedAt: new Date("2026-06-12T12:00:00.000Z"),
    });

    expect(overview).toMatchObject({
      ok: true,
      summary: {
        totalUsers: 1,
        usersWithAccess: 1,
        usersWithoutAccess: 0,
        viewerUsers: 1,
      },
      items: [
        {
          id: "user-1",
          email: "swimmer@example.com",
          role: "viewer",
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

  it("falls back safely for unknown roles, unknown products, and missing activity", () => {
    const overview = buildAdminUsersOverview({
      profiles: [
        {
          ...baseProfile,
          role: "future_role" as never,
        },
      ],
      entitlements: [
        {
          id: "entitlement-1",
          user_id: "user-1",
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
      totalCount: 1,
      hasNextPage: false,
      partialSummary: true,
    });

    expect(overview.items[0]).toMatchObject({
      role: "unknown",
      lastActivitySource: "profile_update",
      products: [
        {
          id: "future_product",
          title: "future_product",
          kind: "unknown",
          active: null,
          known: false,
        },
      ],
      supportCodes: ["unknown_role", "last_activity_unknown", "summary_partial"],
    });
  });
});
