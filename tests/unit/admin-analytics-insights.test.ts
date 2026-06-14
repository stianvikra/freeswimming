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
  payload: {},
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
    vi.useRealTimers();
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
          payload: { sourceKind: "manual" },
          occurred_at: "2026-06-09T10:09:00.000Z",
        },
        {
          ...baseRow,
          event_name: "session_draft_generated",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          occurred_at: "2026-06-09T10:10:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
          payload: { sourceKind: "ai_session_v1" },
          occurred_at: "2026-06-09T10:11:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          channel: "server",
          user_id: "user-1",
          public_aggregate: false,
          payload: { sourceKind: "future_source" },
          occurred_at: "2026-06-09T10:12:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          payload: {
            templateKey: "pool_endurance_base_1000",
            templateSource: "workout_builder_v1",
          },
          occurred_at: "2026-06-09T10:13:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          payload: {
            templateKey: "pool_technique_reset_900",
            templateSource: "workout_builder_v1",
          },
          occurred_at: "2026-06-09T10:14:00.000Z",
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          channel: "client",
          user_id: "user-1",
          public_aggregate: false,
          payload: {
            templateKey: "future_template",
            templateSource: "future_template_source",
          },
          occurred_at: "2026-06-09T10:15:00.000Z",
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
      rollupRows: [
        {
          rollup_day: "2026-06-09",
          event_count: 12,
          refreshed_at: "2026-06-09T10:30:00.000Z",
        },
      ],
      rowCap: 5000,
    });

    expect(insights).toMatchObject({
      ok: true,
      schemaReady: true,
      totalEvents: 12,
      publicAggregateEvents: 1,
      clientEvents: 7,
      serverEvents: 5,
      uniqueKnownUsers: 1,
      lastEventAt: "2026-06-09T10:15:00.000Z",
      funnel: {
        plansViewed: 1,
        checkoutStarted: 1,
        checkoutCompleted: 1,
        checkoutCompletionRate: 1,
      },
      workoutBuilderFunnel: {
        started: 2,
        saved: 3,
        saveRate: 1.5,
      },
      workoutBuilderSourceBreakdown: {
        manualStarts: 2,
        generatedDrafts: 1,
        manualSaves: 1,
        generatedSaves: 1,
        unknownSaves: 1,
        manualSaveRate: 0.5,
        generatedSaveRate: 1,
      },
      workoutBuilderTemplateGeneratedCompletion: {
        generatedDrafts: 1,
        generatedSaves: 1,
        generatedCompletionRate: 1,
        templateUsageCount: 3,
        templateUsageStatus: "mapped",
      },
      workoutBuilderTemplateUsage: {
        templateSelections: 3,
        knownTemplateSelections: 2,
        unknownTemplateSelections: 1,
        templatesSelected: 2,
      },
      lifecycle: {
        rollup: {
          status: "ready",
          latestDay: "2026-06-09",
          totalRolledUpEvents: 12,
        },
      },
    });
    expect(insights.workoutBuilderTemplateUsage.templateCounts).toEqual([
      {
        key: "pool_endurance_base_1000",
        label: "Aerobic base 1000",
        status: "active",
        count: 1,
      },
      {
        key: "pool_technique_reset_900",
        label: "Technique reset 900",
        status: "active",
        count: 1,
      },
    ]);
    expect(insights.workoutContextCta).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      presented: 0,
      accepted: 0,
      acceptedRate: null,
      unknownEvents: 0,
    });
    expect(insights.workoutContextCheckoutStarted).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      started: 0,
      unknownEvents: 0,
    });
    expect(insights.workoutContextCheckoutCancel).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      surface: "plans_checkout_return",
      reason: "checkout_cancelled",
      cancelled: 0,
      unknownEvents: 0,
      reviewDiagnostics: [
        { key: "source_not_mapped", count: 0 },
        { key: "placement_not_mapped", count: 0 },
        { key: "product_not_mapped", count: 0 },
        { key: "surface_not_mapped", count: 0 },
        { key: "reason_not_mapped", count: 0 },
        { key: "incomplete_attribution", count: 0 },
        { key: "other_review_needed", count: 0 },
      ],
    });
    expect(insights.routeCounts[0]).toMatchObject({ key: "/plans", category: "pricing" });
    expect(insights.productCounts[0]).toMatchObject({
      key: "guide_poolside",
      productType: "course_addon",
    });
  });

  it("maps course lesson KPI events without exposing raw payload values", () => {
    const courseRow = {
      ...baseRow,
      source: "course",
      route_template: "/course",
      route_category: "course_landing",
      product_id: null,
      product_type: null,
      payload: {
        source: "course",
        surface: "course_lesson",
        routeTemplate: "/course",
        lessonId: "body-position-front",
        moduleId: "body-position",
        lessonVariant: "concept",
        lessonStatus: "in_progress",
      },
    } satisfies AnalyticsEventInsightRow;

    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...courseRow,
          event_name: "course_lesson_viewed",
        },
        {
          ...courseRow,
          event_name: "course_lesson_viewed",
        },
        {
          ...courseRow,
          event_name: "course_lesson_completed",
          payload: {
            ...courseRow.payload,
            lessonStatus: "done",
          },
        },
        {
          ...courseRow,
          event_name: "course_lesson_continued",
        },
        {
          ...courseRow,
          event_name: "course_lesson_support_clicked",
          payload: {
            ...courseRow.payload,
            actionId: "poolside_guide",
          },
        },
        {
          ...courseRow,
          event_name: "course_lesson_support_clicked",
          payload: {
            ...courseRow.payload,
            actionId: "future_support",
          },
        },
        {
          ...courseRow,
          event_name: "course_lesson_viewed",
          payload: {
            ...courseRow.payload,
            lessonId: "https://example.com/?email=user@example.com",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.courseLessonKpi).toEqual({
      viewed: 2,
      completed: 1,
      continued: 1,
      supportInterest: 1,
      completionRate: 0.5,
      continuationRate: 0.5,
      supportInterestRate: 0.5,
      unknownEvents: 2,
      lessonCounts: [
        {
          key: "body-position-front",
          moduleId: "body-position",
          viewed: 2,
          completed: 1,
          continued: 1,
          supportInterest: 1,
          total: 5,
          completionRate: 0.5,
        },
      ],
    });
    expect(JSON.stringify(insights.courseLessonKpi)).not.toContain("future_support");
    expect(JSON.stringify(insights.courseLessonKpi)).not.toContain("user@example.com");
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
          payload: { sourceKind: "manual" },
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
    expect(insights.workoutBuilderSourceBreakdown).toEqual({
      manualStarts: 0,
      generatedDrafts: 0,
      manualSaves: 1,
      generatedSaves: 0,
      unknownSaves: 0,
      manualSaveRate: null,
      generatedSaveRate: null,
    });
    expect(insights.workoutBuilderTemplateGeneratedCompletion).toEqual({
      generatedDrafts: 0,
      generatedSaves: 0,
      generatedCompletionRate: null,
      templateUsageCount: 0,
      templateUsageStatus: "mapped",
    });
    expect(insights.workoutBuilderTemplateUsage).toEqual({
      templateSelections: 0,
      knownTemplateSelections: 0,
      unknownTemplateSelections: 0,
      templatesSelected: 0,
      templateCounts: [],
    });
  });

  it("maps existing upsell events by safe current surface without exposing raw payload", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "upsell_presented",
          source: "plans",
          payload: {
            source: "plans",
            email: "user@example.com",
            rawUrl: "https://example.com/?email=user@example.com",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_accepted",
          source: "plans",
          payload: { source: "plans" },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "plans",
          payload: { source: "plans", reason: "checkout_cancelled" },
        },
        {
          ...baseRow,
          event_name: "upsell_presented",
          source: null,
          payload: { surface: "library_explore" },
        },
        {
          ...baseRow,
          event_name: "upsell_accepted",
          source: "library_explore",
          payload: { source: "library_explore" },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: null,
          payload: { surface: "my_library", reason: "checkout_cancelled" },
        },
        {
          ...baseRow,
          event_name: "upsell_accepted",
          source: "future_surface",
          payload: { source: "future_surface" },
        },
        {
          ...baseRow,
          event_name: "upsell_presented",
          source: "workout_context",
          payload: {
            source: "workout_context",
            surface: "saved_workout_post_success",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_accepted",
          source: "workout_context",
          payload: {
            source: "workout_context",
            surface: "saved_workout_post_success",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_presented",
          source: "workout_context",
          product_id: "future_product",
          payload: {
            source: "workout_context",
            surface: "saved_workout_post_success",
            placementId: "workout_saved_post_success",
            productId: "future_product",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.existingUpsellBaseline).toEqual({
      presented: 2,
      accepted: 2,
      declined: 2,
      acceptedRate: 1,
      declineRate: 1,
      unknownSourceEvents: 1,
      sourceCounts: [
        {
          key: "library_explore",
          presented: 1,
          accepted: 1,
          declined: 1,
          total: 3,
          acceptedRate: 1,
          declineRate: 1,
        },
        {
          key: "plans",
          presented: 1,
          accepted: 1,
          declined: 1,
          total: 3,
          acceptedRate: 1,
          declineRate: 1,
        },
        {
          key: "unknown",
          presented: 0,
          accepted: 1,
          declined: 0,
          total: 1,
          acceptedRate: null,
          declineRate: null,
        },
      ],
    });
    expect(insights.workoutContextCta).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      presented: 1,
      accepted: 1,
      acceptedRate: 1,
      unknownEvents: 1,
    });
    expect(JSON.stringify(insights.existingUpsellBaseline)).not.toContain("user@example.com");
    expect(JSON.stringify(insights.existingUpsellBaseline)).not.toContain("future_surface");
    expect(JSON.stringify(insights.existingUpsellBaseline)).not.toContain("workout_context");
    expect(JSON.stringify(insights.workoutContextCta)).not.toContain("future_product");
  });

  it("maps workout-context checkout-cancel returns without exposing raw payload", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            surface: "plans_checkout_return",
            reason: "checkout_cancelled",
            checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_secret",
            email: "user@example.com",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "plans",
          payload: { source: "plans", reason: "checkout_cancelled" },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            surface: "future_surface",
            reason: "checkout_cancelled",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            surface: "plans_checkout_return",
            reason: "future_reason",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "workout_context",
          product_id: null,
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            surface: "plans_checkout_return",
            reason: "checkout_cancelled",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.existingUpsellBaseline).toMatchObject({
      presented: 0,
      accepted: 0,
      declined: 1,
      sourceCounts: [
        {
          key: "plans",
          declined: 1,
          total: 1,
        },
      ],
    });
    expect(insights.workoutContextCta).toMatchObject({
      presented: 0,
      accepted: 0,
      unknownEvents: 0,
    });
    expect(insights.workoutContextCheckoutCancel).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      surface: "plans_checkout_return",
      reason: "checkout_cancelled",
      cancelled: 1,
      unknownEvents: 3,
      reviewDiagnostics: [
        { key: "source_not_mapped", count: 0 },
        { key: "placement_not_mapped", count: 0 },
        { key: "product_not_mapped", count: 0 },
        { key: "surface_not_mapped", count: 1 },
        { key: "reason_not_mapped", count: 1 },
        { key: "incomplete_attribution", count: 1 },
        { key: "other_review_needed", count: 0 },
      ],
    });
    expect(JSON.stringify(insights.workoutContextCheckoutCancel)).not.toContain("future_surface");
    expect(JSON.stringify(insights.workoutContextCheckoutCancel)).not.toContain("future_reason");
    expect(JSON.stringify(insights.workoutContextCheckoutCancel)).not.toContain("cs_test_secret");
    expect(JSON.stringify(insights.workoutContextCheckoutCancel)).not.toContain("user@example.com");
  });

  it("keeps workout-context CTA click rate not counted when presentations are missing", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "upsell_accepted",
          source: "workout_context",
          payload: {
            source: "workout_context",
            surface: "saved_workout_post_success",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            email: "user@example.com",
          },
        },
        {
          ...baseRow,
          event_name: "upsell_declined",
          source: "workout_context",
          payload: {
            source: "workout_context",
            surface: "saved_workout_post_success",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.workoutContextCta).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      presented: 0,
      accepted: 1,
      acceptedRate: null,
      unknownEvents: 0,
    });
    expect(insights.workoutContextCheckoutCancel).toMatchObject({
      cancelled: 0,
      unknownEvents: 1,
    });
    expect(JSON.stringify(insights.workoutContextCta)).not.toContain("user@example.com");
    expect(insights.existingUpsellBaseline).toMatchObject({
      presented: 0,
      accepted: 0,
      declined: 0,
      unknownSourceEvents: 0,
      sourceCounts: [],
    });
  });

  it("maps workout-context checkout and access stages without exposing raw payload", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "checkout_started",
          channel: "server",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            sessionId: "cs_test_secret",
            email: "user@example.com",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_started",
          channel: "server",
          source: "workout_context",
          product_id: "future_product",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "future_product",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_started",
          channel: "server",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "future_placement",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_started",
          channel: "server",
          source: "plans",
          product_id: "guide_poolside",
          payload: {
            source: "plans",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_completed",
          channel: "server",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            sessionId: "cs_test_secret",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_completed",
          channel: "server",
          source: "workout_context",
          product_id: "future_product",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "future_product",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_completed",
          channel: "server",
          source: "plans",
          product_id: "guide_poolside",
          payload: {
            source: "plans",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "checkout_completed",
          channel: "server",
          source: "future_source",
          product_id: "guide_poolside",
          payload: {
            source: "future_source",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "entitlement_granted",
          channel: "server",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
            productId: "guide_poolside",
            grantedLatencyMs: 1200,
          },
        },
        {
          ...baseRow,
          event_name: "entitlement_granted",
          channel: "server",
          source: "workout_context",
          product_id: "guide_poolside",
          payload: {
            source: "workout_context",
            placementId: "future_placement",
            productId: "guide_poolside",
          },
        },
        {
          ...baseRow,
          event_name: "entitlement_granted",
          channel: "server",
          source: "workout_context",
          product_id: null,
          payload: {
            source: "workout_context",
            placementId: "workout_saved_post_success",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.funnel.checkoutStarted).toBe(4);
    expect(insights.funnel.checkoutCompleted).toBe(4);
    expect(insights.funnel.entitlementGranted).toBe(3);
    expect(insights.workoutContextCheckoutStarted).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      started: 1,
      unknownEvents: 2,
    });
    expect(insights.workoutContextCheckoutOutcome).toEqual({
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      source: "workout_context",
      completed: 1,
      entitlementGranted: 1,
      entitlementGrantRate: 1,
      unknownEvents: 4,
      completionWithoutAccess: 0,
      accessWithoutCompletion: 0,
      reviewDiagnostics: [
        { key: "source_not_mapped", count: 1 },
        { key: "placement_not_mapped", count: 1 },
        { key: "product_not_mapped", count: 1 },
        { key: "incomplete_attribution", count: 1 },
        { key: "other_review_needed", count: 0 },
      ],
    });
    expect(JSON.stringify(insights.workoutContextCheckoutStarted)).not.toContain("future_product");
    expect(JSON.stringify(insights.workoutContextCheckoutStarted)).not.toContain(
      "future_placement"
    );
    expect(JSON.stringify(insights.workoutContextCheckoutStarted)).not.toContain("cs_test_secret");
    expect(JSON.stringify(insights.workoutContextCheckoutStarted)).not.toContain(
      "user@example.com"
    );
    expect(JSON.stringify(insights.workoutContextCheckoutOutcome)).not.toContain("future_product");
    expect(JSON.stringify(insights.workoutContextCheckoutOutcome)).not.toContain("future_source");
    expect(JSON.stringify(insights.workoutContextCheckoutOutcome)).not.toContain(
      "future_placement"
    );
    expect(JSON.stringify(insights.workoutContextCheckoutOutcome)).not.toContain("cs_test_secret");
    expect(JSON.stringify(insights.workoutContextCheckoutOutcome)).not.toContain(
      "user@example.com"
    );
  });

  it("keeps malformed and missing workout save source kinds unmapped", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          payload: { sourceKind: "manual" },
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          payload: { sourceKind: "ai_session_v1" },
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          payload: { sourceKind: "https://example.com/?email=user@example.com" },
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          payload: {},
        },
        {
          ...baseRow,
          event_name: "session_draft_generated",
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.workoutBuilderSourceBreakdown).toMatchObject({
      manualSaves: 1,
      generatedSaves: 1,
      unknownSaves: 2,
      generatedDrafts: 1,
      generatedSaveRate: 1,
    });
    expect(insights.workoutBuilderTemplateGeneratedCompletion).toMatchObject({
      generatedDrafts: 1,
      generatedSaves: 1,
      generatedCompletionRate: 1,
      templateUsageCount: 0,
      templateUsageStatus: "mapped",
    });
  });

  it("maps template usage only from explicit safe template selection events", () => {
    const insights = buildAnalyticsInsights({
      rows: [
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          payload: {
            templateKey: "pool_endurance_base_1000",
            templateSource: "workout_builder_v1",
          },
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          payload: {
            templateKey: "pool_endurance_base_1000",
            templateSource: "workout_builder_v1",
          },
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          payload: {
            templateKey: "unknown_template",
            templateSource: "workout_builder_v1",
          },
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          payload: {
            templateKey: "pool_technique_reset_900",
            templateSource: "future_source",
          },
        },
        {
          ...baseRow,
          event_name: "workout_builder_template_selected",
          payload: {
            templateKey: "Bad Template Key",
            templateSource: "workout_builder_v1",
            email: "user@example.com",
          },
        },
        {
          ...baseRow,
          event_name: "workout_builder_saved",
          payload: {
            sourceKind: "manual",
            templateKey: "pool_technique_reset_900",
            templateSource: "workout_builder_v1",
          },
        },
      ],
      generatedAt: new Date("2026-06-09T11:00:00.000Z"),
      rangeDays: 30,
    });

    expect(insights.workoutBuilderTemplateUsage).toEqual({
      templateSelections: 5,
      knownTemplateSelections: 2,
      unknownTemplateSelections: 3,
      templatesSelected: 1,
      templateCounts: [
        {
          key: "pool_endurance_base_1000",
          label: "Aerobic base 1000",
          status: "active",
          count: 2,
        },
      ],
    });
    expect(JSON.stringify(insights.workoutBuilderTemplateUsage)).not.toContain("user@example.com");
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T11:00:00.000Z"));

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
