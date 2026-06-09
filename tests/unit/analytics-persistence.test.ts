import { afterEach, describe, expect, it, vi } from "vitest";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import {
  buildAnalyticsEventInsert,
  isPublicAggregateAnalyticsRecord,
  persistAnalyticsEvent,
} from "@/lib/analytics/persistence";

function buildSupabaseInsertMock(result: unknown) {
  const insert = vi.fn().mockResolvedValue(result);
  const from = vi.fn().mockReturnValue({ insert });
  return {
    supabase: { from },
    from,
    insert,
  };
}

describe("analytics persistence", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("maps public aggregate records without user identity", () => {
    const record = trackAnalyticsEvent({
      eventName: "plans_viewed",
      channel: "client",
      userId: "user-123",
      payload: {
        source: "plans",
        routeTemplate: "/plans",
        routeCategory: "pricing",
        productId: "guide_poolside",
        productType: "course_addon",
      },
    });

    expect(isPublicAggregateAnalyticsRecord(record)).toBe(true);
    expect(buildAnalyticsEventInsert(record)).toMatchObject({
      event_name: "plans_viewed",
      channel: "client",
      user_id: null,
      public_aggregate: true,
      source: "plans",
      route_template: "/plans",
      route_category: "pricing",
      product_id: "guide_poolside",
      product_type: "course_addon",
    });
  });

  it("preserves known user identity for product app events", () => {
    const record = trackAnalyticsEvent({
      eventName: "library_viewed",
      channel: "client",
      userId: "user-123",
      payload: {
        ownedCount: 1,
        productId: "Email: swimmer@example.com",
      },
    });

    expect(isPublicAggregateAnalyticsRecord(record)).toBe(false);
    expect(buildAnalyticsEventInsert(record)).toMatchObject({
      event_name: "library_viewed",
      user_id: "user-123",
      public_aggregate: false,
      route_template: null,
      product_id: null,
    });
  });

  it("persists through the analytics_events table", async () => {
    const record = trackAnalyticsEvent({
      eventName: "checkout_started",
      channel: "server",
      payload: {
        productId: "guide_poolside",
      },
    });
    const { supabase, from, insert } = buildSupabaseInsertMock({ error: null });

    await expect(persistAnalyticsEvent(record, { supabase })).resolves.toEqual({ ok: true });

    expect(from).toHaveBeenCalledWith("analytics_events");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: "checkout_started",
        product_id: "guide_poolside",
      })
    );
  });

  it("fails soft when Supabase rejects the insert", async () => {
    const record = trackAnalyticsEvent({
      eventName: "checkout_started",
      channel: "server",
      payload: {
        productId: "guide_poolside",
      },
    });
    const { supabase } = buildSupabaseInsertMock({
      error: {
        message: "relation does not exist",
      },
    });

    await expect(persistAnalyticsEvent(record, { supabase })).resolves.toEqual({
      ok: false,
      error: "relation does not exist",
    });
  });

  it("skips silently for example Supabase URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.com");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const record = trackAnalyticsEvent({
      eventName: "plans_viewed",
      channel: "client",
      payload: {
        source: "plans",
      },
    });

    await expect(persistAnalyticsEvent(record)).resolves.toEqual({
      ok: false,
      error: "Analytics persistence skipped for example Supabase URL.",
    });

    expect(consoleError).not.toHaveBeenCalled();
  });
});
