import { describe, expect, it } from "vitest";
import {
  buildAnalyticsDashboardViewModel,
  formatAnalyticsIdentifierLabel,
  formatAnalyticsPercent,
  normalizeAnalyticsDashboardRangeDays,
  type AnalyticsDashboardPayload,
} from "@/lib/analytics/admin-dashboard";

const now = new Date("2026-06-09T12:00:00.000Z");

const basePayload: AnalyticsDashboardPayload = {
  ok: true,
  schemaReady: true,
  generatedAt: "2026-06-09T12:00:00.000Z",
  rangeDays: 30,
  since: "2026-05-10T12:00:00.000Z",
  until: "2026-06-09T12:00:00.000Z",
  rowCap: 5000,
  capped: false,
  totalEvents: 10,
  lastEventAt: "2026-06-09T10:15:00.000Z",
  uniqueKnownUsers: 1,
  publicAggregateEvents: 2,
  clientEvents: 2,
  serverEvents: 2,
  eventCounts: [
    { key: "workout_builder_started", count: 5 },
    { key: "workout_builder_saved", count: 3 },
    { key: "plans_viewed", count: 2 },
    { key: "new_safe_event", count: 1 },
  ],
  routeCounts: [{ key: "/plans", category: "pricing", count: 2 }],
  productCounts: [{ key: "guide_poolside", productType: "course_addon", count: 2 }],
  lifecycle: {
    rawRetentionDays: 180,
    rollupWindowDays: 400,
    rawPruneBefore: "2025-12-11T12:00:00.000Z",
    rollup: {
      status: "ready",
      schemaReady: true,
      queryOk: true,
      latestDay: "2026-06-09",
      oldestDay: "2026-06-09",
      latestRefreshAt: "2026-06-09T11:30:00.000Z",
      daysWithRollups: 1,
      totalRolledUpEvents: 4,
      staleAfterDays: 2,
      message: "Analytics daily rollups are ready for the reported window.",
    },
  },
  funnel: {
    publicPageViewed: 2,
    plansViewed: 2,
    productViewed: 1,
    checkoutStarted: 1,
    checkoutCompleted: 1,
    entitlementGranted: 1,
    checkoutCompletionRate: 1,
    entitlementGrantRate: 1,
  },
  workoutBuilderFunnel: {
    started: 5,
    saved: 3,
    saveRate: 0.6,
  },
};

describe("admin analytics dashboard view model", () => {
  it("normalizes ranges and formats percentages for compact controls", () => {
    expect(normalizeAnalyticsDashboardRangeDays(7)).toBe(7);
    expect(normalizeAnalyticsDashboardRangeDays(120)).toBe(30);
    expect(formatAnalyticsPercent(0.5)).toBe("50%");
    expect(formatAnalyticsPercent(null)).toBe("Not counted");
  });

  it("builds a fixed dashboard order with fresh health, metrics, funnel, lists, and caveats", () => {
    const viewModel = buildAnalyticsDashboardViewModel(basePayload, { now });

    expect(viewModel.state).toBe("fresh");
    expect(viewModel.stateLabel).toBe("Fresh");
    expect(viewModel.rangeLabel).toBe("30 days");
    expect(viewModel.lastEventLabel).toBe("Today 10:15");
    expect(viewModel.metrics.map((metric) => metric.id)).toEqual([
      "total-events",
      "last-event",
      "public-aggregate",
      "known-users",
      "client-server",
      "checkout-rate",
    ]);
    expect(viewModel.metrics[0]).toMatchObject({ label: "Total events", value: "10" });
    expect(viewModel.funnel.map((step) => step.id)).toEqual([
      "public-page-viewed",
      "plans-viewed",
      "product-viewed",
      "checkout-started",
      "checkout-completed",
      "entitlement-granted",
    ]);
    expect(viewModel.workoutBuilderFunnel.metrics).toEqual([
      {
        id: "builder-started",
        label: "Started",
        value: "5",
        detail: "Manual builder starts",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: "3",
        detail: "Successful creates or updates",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: "60%",
        detail: "Saved / started",
      },
    ]);
    expect(viewModel.workoutBuilderFunnel.caveat).toContain("not unique-user");
    expect(viewModel.eventItems[0]).toMatchObject({
      label: "Workout builder started",
      secondary: "workout_builder_started",
      count: "5",
    });
    expect(viewModel.eventItems[1]).toMatchObject({
      label: "Workout builder saved",
      secondary: "workout_builder_saved",
      count: "3",
    });
    expect(viewModel.eventItems[2]).toMatchObject({
      label: "Plans viewed",
      secondary: "plans_viewed",
      count: "2",
    });
    expect(viewModel.routeItems[0]).toMatchObject({
      label: "/plans",
      secondary: "pricing",
      count: "2",
    });
    expect(viewModel.productItems[0]).toMatchObject({
      label: "Guide Poolside",
      secondary: "course_addon",
      count: "2",
    });
    expect(viewModel.caveats.join(" ")).toContain("not Stripe reconciliation");
    expect(viewModel.caveats.join(" ")).toContain("not linked to user profiles");
  });

  it("renders capped, quiet, no-data, and schema-missing trust states deterministically", () => {
    expect(buildAnalyticsDashboardViewModel({ ...basePayload, capped: true }, { now }).state).toBe(
      "capped"
    );
    expect(
      buildAnalyticsDashboardViewModel(
        { ...basePayload, lastEventAt: "2026-06-01T10:15:00.000Z" },
        { now }
      ).state
    ).toBe("quiet");
    expect(
      buildAnalyticsDashboardViewModel(
        {
          ...basePayload,
          totalEvents: 0,
          lastEventAt: null,
          eventCounts: [],
          routeCounts: [],
          productCounts: [],
          workoutBuilderFunnel: {
            started: 0,
            saved: 0,
            saveRate: null,
          },
        },
        { now }
      ).state
    ).toBe("no-data");
    expect(
      buildAnalyticsDashboardViewModel(
        {
          ok: true,
          schemaReady: false,
          warning: "Analytics persistence is not ready yet.",
          generatedAt: "2026-06-09T12:00:00.000Z",
          rangeDays: 30,
          items: [],
        },
        { now }
      )
    ).toMatchObject({
      state: "schema-missing",
      stateLabel: "Schema missing",
      metrics: [{ id: "schema", value: "Not ready" }],
      workoutBuilderFunnel: {
        metrics: [
          { id: "builder-started", value: "Not counted" },
          { id: "builder-saved", value: "Not counted" },
          { id: "builder-save-rate", value: "Not counted" },
        ],
      },
    });
  });

  it("handles zero starts and duplicate save telemetry without inferring fake rates", () => {
    const zeroStarts = buildAnalyticsDashboardViewModel(
      {
        ...basePayload,
        eventCounts: [
          { key: "workout_builder_saved", count: 2 },
          { key: "future_safe_event", count: 1 },
        ],
        workoutBuilderFunnel: {
          started: 0,
          saved: 2,
          saveRate: null,
        },
      },
      { now }
    );

    expect(zeroStarts.workoutBuilderFunnel.metrics).toEqual([
      {
        id: "builder-started",
        label: "Started",
        value: "0",
        detail: "Manual builder starts",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: "2",
        detail: "Successful creates or updates",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: "Not counted",
        detail: "Saved / started",
      },
    ]);
    expect(zeroStarts.workoutBuilderFunnel.caveat).toContain("until a builder start exists");

    const duplicateTelemetry = buildAnalyticsDashboardViewModel(
      {
        ...basePayload,
        workoutBuilderFunnel: {
          started: 2,
          saved: 3,
          saveRate: 1.5,
        },
      },
      { now }
    );

    expect(duplicateTelemetry.workoutBuilderFunnel.metrics[2]).toMatchObject({
      label: "Save rate",
      value: "150%",
    });
    expect(duplicateTelemetry.workoutBuilderFunnel.caveat).toContain("Duplicate starts and saves");
  });

  it("does not expose unsafe raw payload-like identifiers in labels or secondary text", () => {
    const viewModel = buildAnalyticsDashboardViewModel(
      {
        ...basePayload,
        eventCounts: [{ key: "email=user@example.com", count: 1 }],
        routeCounts: [
          {
            key: "https://example.com/plans",
            category: "email=user@example.com",
            count: 1,
          },
        ],
        productCounts: [
          { key: "customer@example.com", productType: "email=user@example.com", count: 1 },
        ],
        workoutBuilderFunnel: {
          started: 0,
          saved: 0,
          saveRate: null,
        },
      },
      { now }
    );

    expect(viewModel.eventItems[0]).toMatchObject({
      label: "Unknown event",
      secondary: null,
    });
    expect(viewModel.routeItems[0]).toMatchObject({
      label: "Unknown route",
      secondary: null,
    });
    expect(viewModel.productItems[0]).toMatchObject({
      label: "Unknown product",
      secondary: null,
    });
    expect(JSON.stringify(viewModel)).not.toContain("user@example.com");
    expect(formatAnalyticsIdentifierLabel("future_safe_event", "event")).toMatchObject({
      label: "Future Safe Event",
      secondary: "future_safe_event",
    });
    expect(formatAnalyticsIdentifierLabel("https://example.com/plans", "route")).toMatchObject({
      label: "Unknown route",
      secondary: null,
    });
  });

  it("labels workout-builder funnel events while preserving fallback labels", () => {
    expect(formatAnalyticsIdentifierLabel("workout_builder_started", "event")).toMatchObject({
      label: "Workout builder started",
      secondary: "workout_builder_started",
    });
    expect(formatAnalyticsIdentifierLabel("workout_builder_saved", "event")).toMatchObject({
      label: "Workout builder saved",
      secondary: "workout_builder_saved",
    });
    expect(formatAnalyticsIdentifierLabel("future_safe_event", "event")).toMatchObject({
      label: "Future Safe Event",
      secondary: "future_safe_event",
    });
  });
});
