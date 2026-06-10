import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAnalyticsInsights,
  parseAnalyticsInsightsRangeDays,
  type AnalyticsEventInsightRow,
} from "@/lib/analytics/admin-insights";

const { createRouteHandlerSupabaseClientMock, requireAdminRoleFromSupabaseMock } = vi.hoisted(
  () => ({
    createRouteHandlerSupabaseClientMock: vi.fn(),
    requireAdminRoleFromSupabaseMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

import { GET as getAdminAnalyticsInsights } from "@/app/api/admin/analytics/insights/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildQueryChain(result: unknown) {
  const chain = {
    select: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.gte.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockResolvedValue(result);

  return chain;
}

function buildSupabaseQueries(input: { eventsResult: unknown; rollupsResult?: unknown }) {
  const eventsChain = buildQueryChain(input.eventsResult);
  const rollupsChain = buildQueryChain(input.rollupsResult ?? { data: [], error: null });
  const from = vi.fn((table: string) => {
    if (table === "analytics_events") return { select: eventsChain.select };
    if (table === "analytics_event_daily_rollups") return { select: rollupsChain.select };
    return { select: vi.fn() };
  });

  return {
    from,
    eventsChain,
    rollupsChain,
  };
}

const baseRow: AnalyticsEventInsightRow = {
  event_name: "plans_viewed",
  channel: "client",
  user_id: null,
  public_aggregate: true,
  source: "plans",
  route_template: "/plans",
  route_category: "pricing",
  product_id: "guide_poolside",
  product_type: "course_addon",
  occurred_at: "2026-06-09T10:00:00.000Z",
};

describe("admin analytics insights", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "viewer",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("bounds requested ranges", () => {
    expect(parseAnalyticsInsightsRangeDays(null)).toBe(30);
    expect(parseAnalyticsInsightsRangeDays("-1")).toBe(30);
    expect(parseAnalyticsInsightsRangeDays("7")).toBe(7);
    expect(parseAnalyticsInsightsRangeDays("120")).toBe(90);
  });

  it("builds a privacy-safe aggregate response", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        baseRow,
        {
          ...baseRow,
          event_name: "checkout_started",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:05:00.000Z",
        },
        {
          ...baseRow,
          event_name: "checkout_completed",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:06:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_started",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:07:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_started",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:08:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:09:00.000Z",
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
      rollupRows: [
        {
          rollup_day: "2026-06-09",
          event_count: 6,
          refreshed_at: "2026-06-09T10:30:00.000Z",
        },
      ],
      rowCap: 5000,
    });

    expect(insights).toMatchObject({
      ok: true,
      schemaReady: true,
      totalEvents: 6,
      publicAggregateEvents: 1,
      clientEvents: 3,
      serverEvents: 3,
      uniqueKnownUsers: 1,
      lastEventAt: "2026-06-09T10:09:00.000Z",
      funnel: {
        plansViewed: 1,
        checkoutStarted: 1,
        checkoutCompleted: 1,
        checkoutCompletionRate: 1,
      },
      workoutBuilderFunnel: {
        started: 2,
        saved: 1,
        saveRate: 0.5,
      },
      lifecycle: {
        rollup: {
          status: "ready",
          latestDay: "2026-06-09",
          totalRolledUpEvents: 6,
        },
      },
    });
    expect(insights.routeCounts[0]).toMatchObject({ key: "/plans", category: "pricing" });
    expect(insights.productCounts[0]).toMatchObject({
      key: "guide_poolside",
      productType: "course_addon",
    });
  });

  it("keeps workout builder save-rate not counted when starts are missing", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.workoutBuilderFunnel).toEqual({
      started: 0,
      saved: 1,
      saveRate: null,
    });
  });

  it("fails closed for unauthenticated admin insights access", async () => {
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: "Unauthorized.",
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from: vi.fn() },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await getAdminAnalyticsInsights(
      new Request("https://freeswimming.test/api/admin/analytics/insights")
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ ok: false, error: "Unauthorized." });
  });

  it("returns setup guidance when the analytics schema is missing", async () => {
    const chain = buildQueryChain({
      data: null,
      error: {
        code: "42P01",
        message: 'relation "analytics_events" does not exist',
      },
    });
    const from = vi.fn().mockReturnValue({ select: chain.select });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await getAdminAnalyticsInsights(
      new Request("https://freeswimming.test/api/admin/analytics/insights?rangeDays=7")
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      schemaReady?: boolean;
      warning?: string;
      rangeDays?: number;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      schemaReady: false,
      rangeDays: 7,
    });
    expect(payload.warning).toContain("Analytics persistence is not ready");
  });

  it("queries bounded rows for viewer+ admins", async () => {
    const { from, eventsChain, rollupsChain } = buildSupabaseQueries({
      eventsResult: {
        data: [baseRow],
        error: null,
      },
      rollupsResult: {
        data: [
          {
            rollup_day: "2026-06-09",
            event_count: 1,
            refreshed_at: "2026-06-09T10:00:00.000Z",
          },
        ],
        error: null,
      },
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await getAdminAnalyticsInsights(
      new Request("https://freeswimming.test/api/admin/analytics/insights?rangeDays=120")
    );
    const payload = (await response.json()) as { ok?: boolean; rangeDays?: number };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      rangeDays: 90,
      lifecycle: {
        rollup: {
          status: "ready",
          schemaReady: true,
          latestDay: "2026-06-09",
        },
      },
    });
    expect(from).toHaveBeenCalledWith("analytics_events");
    expect(from).toHaveBeenCalledWith("analytics_event_daily_rollups");
    expect(eventsChain.gte).toHaveBeenCalledWith("occurred_at", expect.any(String));
    expect(eventsChain.order).toHaveBeenCalledWith("occurred_at", { ascending: false });
    expect(eventsChain.limit).toHaveBeenCalledWith(5001);
    expect(rollupsChain.gte).toHaveBeenCalledWith("rollup_day", expect.any(String));
    expect(rollupsChain.order).toHaveBeenCalledWith("rollup_day", { ascending: false });
    expect(rollupsChain.limit).toHaveBeenCalledWith(97);
  });

  it("keeps raw insights available when rollup schema is missing", async () => {
    const { from } = buildSupabaseQueries({
      eventsResult: {
        data: [baseRow],
        error: null,
      },
      rollupsResult: {
        data: null,
        error: {
          code: "42P01",
          message: 'relation "analytics_event_daily_rollups" does not exist',
        },
      },
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValueOnce({
      supabase: { from },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await getAdminAnalyticsInsights(
      new Request("https://freeswimming.test/api/admin/analytics/insights?rangeDays=7")
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      lifecycle?: {
        rollup?: {
          status?: string;
          schemaReady?: boolean;
        };
      };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      lifecycle: {
        rollup: {
          status: "schema-missing",
          schemaReady: false,
        },
      },
    });
  });
});
