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
    { key: "session_draft_generated", count: 4 },
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
  existingUpsellBaseline: {
    presented: 1,
    accepted: 1,
    declined: 1,
    acceptedRate: 1,
    declineRate: 1,
    unknownSourceEvents: 0,
    sourceCounts: [
      {
        key: "plans",
        presented: 1,
        accepted: 1,
        declined: 1,
        total: 3,
        acceptedRate: 1,
        declineRate: 1,
      },
    ],
  },
  workoutBuilderFunnel: {
    started: 5,
    saved: 3,
    saveRate: 0.6,
  },
  workoutBuilderSourceBreakdown: {
    manualStarts: 5,
    generatedDrafts: 4,
    manualSaves: 2,
    generatedSaves: 1,
    unknownSaves: 0,
    manualSaveRate: 0.4,
    generatedSaveRate: 0.25,
  },
  workoutBuilderTemplateGeneratedCompletion: {
    generatedDrafts: 4,
    generatedSaves: 1,
    generatedCompletionRate: 0.25,
    templateUsageCount: 3,
    templateUsageStatus: "mapped",
  },
  workoutBuilderTemplateUsage: {
    templateSelections: 3,
    knownTemplateSelections: 2,
    unknownTemplateSelections: 1,
    templatesSelected: 2,
    templateCounts: [
      {
        key: "pool_endurance_base_1000",
        label: "Aerobic base 1000",
        status: "active",
        count: 2,
      },
      {
        key: "pool_technique_reset_900",
        label: "Technique reset 900",
        status: "active",
        count: 1,
      },
    ],
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
    expect(viewModel.existingUpsellBaseline.metrics).toEqual([
      {
        id: "upsell-presented",
        label: "Presented",
        value: "1",
        detail: "Current commercial surfaces",
      },
      {
        id: "upsell-accepted",
        label: "Accepted",
        value: "1",
        detail: "Clicked commercial action",
      },
      {
        id: "upsell-accepted-rate",
        label: "Accepted rate",
        value: "100%",
        detail: "Accepted / presented",
      },
      {
        id: "upsell-declined",
        label: "Cancelled returns",
        value: "1",
        detail: "Checkout cancelled return",
      },
      {
        id: "upsell-decline-rate",
        label: "Cancel rate",
        value: "100%",
        detail: "Cancelled / presented",
      },
    ]);
    expect(viewModel.existingUpsellBaseline.sourceItems).toEqual([
      {
        key: "plans",
        label: "Plans",
        secondary: "1 presented / 1 accepted / 1 cancelled",
        count: "3",
      },
    ]);
    expect(viewModel.existingUpsellBaseline.caveat).toContain("not checkout completion");
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
    expect(viewModel.workoutBuilderSourceBreakdown.metrics).toEqual([
      {
        id: "source-manual-starts",
        label: "Manual starts",
        value: "5",
        detail: "Manual builder entries",
      },
      {
        id: "source-generated-drafts",
        label: "Generated drafts",
        value: "4",
        detail: "AI session drafts",
      },
      {
        id: "source-manual-saves",
        label: "Manual saves",
        value: "2",
        detail: "Saved manual workouts",
      },
      {
        id: "source-generated-saves",
        label: "Generated saves",
        value: "1",
        detail: "Saved generated sessions",
      },
      {
        id: "source-manual-save-rate",
        label: "Manual save rate",
        value: "40%",
        detail: "Manual saves / starts",
      },
      {
        id: "source-generated-save-rate",
        label: "Generated save rate",
        value: "25%",
        detail: "Generated saves / drafts",
      },
      {
        id: "source-unknown-saves",
        label: "Unknown saves",
        value: "0",
        detail: "Missing or unmapped source",
      },
    ]);
    expect(viewModel.workoutBuilderSourceBreakdown.caveat).toContain("not unique-user");
    expect(viewModel.workoutBuilderTemplateGeneratedCompletion.metrics).toEqual([
      {
        id: "generated-completion-drafts",
        label: "Generated drafts",
        value: "4",
        detail: "AI session drafts",
      },
      {
        id: "generated-completion-saves",
        label: "Generated saves",
        value: "1",
        detail: "Saved generated sessions",
      },
      {
        id: "generated-completion-rate",
        label: "Completion rate",
        value: "25%",
        detail: "Generated saves / drafts",
      },
      {
        id: "template-usage",
        label: "Template usage",
        value: "3",
        detail: "Explicit selections",
      },
    ]);
    expect(viewModel.workoutBuilderTemplateGeneratedCompletion.caveat).toContain(
      "counted only from explicit template-selection events"
    );
    expect(viewModel.workoutBuilderTemplateUsage.metrics).toEqual([
      {
        id: "template-selections",
        label: "Template selections",
        value: "3",
        detail: "Explicit Use template events",
      },
      {
        id: "templates-selected",
        label: "Templates selected",
        value: "2",
        detail: "Known template keys",
      },
      {
        id: "unknown-template-selections",
        label: "Unknown template",
        value: "1",
        detail: "Missing or unmapped key/source",
      },
    ]);
    expect(viewModel.workoutBuilderTemplateUsage.items).toEqual([
      {
        key: "pool_endurance_base_1000",
        label: "Aerobic base 1000",
        secondary: "Active template - pool_endurance_base_1000",
        count: "2",
      },
      {
        key: "pool_technique_reset_900",
        label: "Technique reset 900",
        secondary: "Active template - pool_technique_reset_900",
        count: "1",
      },
    ]);
    expect(viewModel.workoutBuilderTemplateUsage.caveat).toContain("Unknown template selections");
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
    expect(viewModel.eventItems[3]).toMatchObject({
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
    expect(viewModel.caveats.join(" ")).toContain("accepted is not checkout completion");
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
          existingUpsellBaseline: {
            presented: 0,
            accepted: 0,
            declined: 0,
            acceptedRate: null,
            declineRate: null,
            unknownSourceEvents: 0,
            sourceCounts: [],
          },
          workoutBuilderFunnel: {
            started: 0,
            saved: 0,
            saveRate: null,
          },
          workoutBuilderSourceBreakdown: {
            manualStarts: 0,
            generatedDrafts: 0,
            manualSaves: 0,
            generatedSaves: 0,
            unknownSaves: 0,
            manualSaveRate: null,
            generatedSaveRate: null,
          },
          workoutBuilderTemplateGeneratedCompletion: {
            generatedDrafts: 0,
            generatedSaves: 0,
            generatedCompletionRate: null,
            templateUsageCount: 0,
            templateUsageStatus: "mapped",
          },
          workoutBuilderTemplateUsage: {
            templateSelections: 0,
            knownTemplateSelections: 0,
            unknownTemplateSelections: 0,
            templatesSelected: 0,
            templateCounts: [],
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
      existingUpsellBaseline: {
        metrics: [
          { id: "upsell-presented", value: "Not counted" },
          { id: "upsell-accepted", value: "Not counted" },
          { id: "upsell-accepted-rate", value: "Not counted" },
          { id: "upsell-declined", value: "Not counted" },
          { id: "upsell-decline-rate", value: "Not counted" },
        ],
      },
      workoutBuilderSourceBreakdown: {
        metrics: [
          { id: "source-manual-starts", value: "Not counted" },
          { id: "source-generated-drafts", value: "Not counted" },
          { id: "source-manual-saves", value: "Not counted" },
          { id: "source-generated-saves", value: "Not counted" },
          { id: "source-manual-save-rate", value: "Not counted" },
          { id: "source-generated-save-rate", value: "Not counted" },
          { id: "source-unknown-saves", value: "Not counted" },
        ],
      },
      workoutBuilderTemplateGeneratedCompletion: {
        metrics: [
          { id: "generated-completion-drafts", value: "Not counted" },
          { id: "generated-completion-saves", value: "Not counted" },
          { id: "generated-completion-rate", value: "Not counted" },
          { id: "template-usage", value: "Not counted" },
        ],
      },
      workoutBuilderTemplateUsage: {
        metrics: [
          { id: "template-selections", value: "Not counted" },
          { id: "templates-selected", value: "Not counted" },
          { id: "unknown-template-selections", value: "Not counted" },
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
        existingUpsellBaseline: {
          presented: 0,
          accepted: 2,
          declined: 1,
          acceptedRate: null,
          declineRate: null,
          unknownSourceEvents: 0,
          sourceCounts: [
            {
              key: "plans",
              presented: 0,
              accepted: 2,
              declined: 1,
              total: 3,
              acceptedRate: null,
              declineRate: null,
            },
          ],
        },
        workoutBuilderSourceBreakdown: {
          manualStarts: 0,
          generatedDrafts: 1,
          manualSaves: 2,
          generatedSaves: 0,
          unknownSaves: 0,
          manualSaveRate: null,
          generatedSaveRate: 0,
        },
        workoutBuilderTemplateGeneratedCompletion: {
          generatedDrafts: 1,
          generatedSaves: 0,
          generatedCompletionRate: 0,
          templateUsageCount: 0,
          templateUsageStatus: "mapped",
        },
        workoutBuilderTemplateUsage: {
          templateSelections: 0,
          knownTemplateSelections: 0,
          unknownTemplateSelections: 0,
          templatesSelected: 0,
          templateCounts: [],
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
    expect(zeroStarts.existingUpsellBaseline.metrics).toContainEqual({
      id: "upsell-accepted-rate",
      label: "Accepted rate",
      value: "Not counted",
      detail: "Accepted / presented",
    });
    expect(zeroStarts.existingUpsellBaseline.caveat).toContain(
      "until an upsell presentation exists"
    );
    expect(zeroStarts.workoutBuilderSourceBreakdown.metrics).toContainEqual({
      id: "source-manual-save-rate",
      label: "Manual save rate",
      value: "Not counted",
      detail: "Manual saves / starts",
    });
    expect(zeroStarts.workoutBuilderTemplateGeneratedCompletion.metrics).toContainEqual({
      id: "generated-completion-rate",
      label: "Completion rate",
      value: "0%",
      detail: "Generated saves / drafts",
    });
    expect(zeroStarts.workoutBuilderTemplateGeneratedCompletion.metrics).toContainEqual({
      id: "template-usage",
      label: "Template usage",
      value: "0",
      detail: "Explicit selections",
    });
    expect(zeroStarts.workoutBuilderTemplateUsage.emptyLabel).toBe(
      "No template selections in this range."
    );

    const duplicateTelemetry = buildAnalyticsDashboardViewModel(
      {
        ...basePayload,
        workoutBuilderFunnel: {
          started: 2,
          saved: 3,
          saveRate: 1.5,
        },
        existingUpsellBaseline: {
          presented: 2,
          accepted: 3,
          declined: 0,
          acceptedRate: 1.5,
          declineRate: 0,
          unknownSourceEvents: 1,
          sourceCounts: [
            {
              key: "future_source",
              presented: 1,
              accepted: 0,
              declined: 0,
              total: 1,
              acceptedRate: 0,
              declineRate: 0,
            },
          ],
        },
        workoutBuilderSourceBreakdown: {
          manualStarts: 2,
          generatedDrafts: 1,
          manualSaves: 3,
          generatedSaves: 2,
          unknownSaves: 1,
          manualSaveRate: 1.5,
          generatedSaveRate: 2,
        },
        workoutBuilderTemplateGeneratedCompletion: {
          generatedDrafts: 1,
          generatedSaves: 2,
          generatedCompletionRate: 2,
          templateUsageCount: 3,
          templateUsageStatus: "mapped",
        },
        workoutBuilderTemplateUsage: {
          templateSelections: 3,
          knownTemplateSelections: 3,
          unknownTemplateSelections: 0,
          templatesSelected: 1,
          templateCounts: [
            {
              key: "pool_endurance_base_1000",
              label: "Aerobic base 1000",
              status: "active",
              count: 3,
            },
          ],
        },
      },
      { now }
    );

    expect(duplicateTelemetry.workoutBuilderFunnel.metrics[2]).toMatchObject({
      label: "Save rate",
      value: "150%",
    });
    expect(duplicateTelemetry.existingUpsellBaseline.metrics).toContainEqual({
      id: "upsell-accepted-rate",
      label: "Accepted rate",
      value: "150%",
      detail: "Accepted / presented",
    });
    expect(duplicateTelemetry.existingUpsellBaseline.sourceItems[0]).toMatchObject({
      key: "unknown",
      label: "Unknown source",
    });
    expect(duplicateTelemetry.existingUpsellBaseline.caveat).toContain("Unknown source events");
    expect(duplicateTelemetry.workoutBuilderFunnel.caveat).toContain("Duplicate starts and saves");
    expect(duplicateTelemetry.workoutBuilderSourceBreakdown.metrics).toContainEqual({
      id: "source-generated-save-rate",
      label: "Generated save rate",
      value: "200%",
      detail: "Generated saves / drafts",
    });
    expect(duplicateTelemetry.workoutBuilderTemplateGeneratedCompletion.metrics).toContainEqual({
      id: "generated-completion-rate",
      label: "Completion rate",
      value: "200%",
      detail: "Generated saves / drafts",
    });
    expect(duplicateTelemetry.workoutBuilderTemplateUsage.metrics).toContainEqual({
      id: "template-selections",
      label: "Template selections",
      value: "3",
      detail: "Explicit Use template events",
    });
    expect(duplicateTelemetry.workoutBuilderTemplateUsage.caveat).toContain("Duplicate selections");
    expect(duplicateTelemetry.workoutBuilderSourceBreakdown.caveat).toContain("Unknown saves");
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
        workoutBuilderSourceBreakdown: {
          manualStarts: 0,
          generatedDrafts: 0,
          manualSaves: 0,
          generatedSaves: 0,
          unknownSaves: 1,
          manualSaveRate: null,
          generatedSaveRate: null,
        },
        workoutBuilderTemplateGeneratedCompletion: {
          generatedDrafts: 0,
          generatedSaves: 0,
          generatedCompletionRate: null,
          templateUsageCount: 2,
          templateUsageStatus: "mapped",
        },
        workoutBuilderTemplateUsage: {
          templateSelections: 2,
          knownTemplateSelections: 1,
          unknownTemplateSelections: 1,
          templatesSelected: 1,
          templateCounts: [
            {
              key: "pool_endurance_base_1000",
              label: "user@example.com",
              status: "active",
              count: 1,
            },
          ],
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
    expect(viewModel.workoutBuilderTemplateUsage.items[0]).toMatchObject({
      label: "Unknown template",
      secondary: "Active template - pool_endurance_base_1000",
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
    expect(
      formatAnalyticsIdentifierLabel("workout_builder_template_selected", "event")
    ).toMatchObject({
      label: "Workout builder template selected",
      secondary: "workout_builder_template_selected",
    });
    expect(formatAnalyticsIdentifierLabel("upsell_presented", "event")).toMatchObject({
      label: "Upsell presented",
      secondary: "upsell_presented",
    });
    expect(formatAnalyticsIdentifierLabel("upsell_accepted", "event")).toMatchObject({
      label: "Upsell accepted",
      secondary: "upsell_accepted",
    });
    expect(formatAnalyticsIdentifierLabel("upsell_declined", "event")).toMatchObject({
      label: "Upsell declined",
      secondary: "upsell_declined",
    });
    expect(formatAnalyticsIdentifierLabel("session_draft_generated", "event")).toMatchObject({
      label: "Session draft generated",
      secondary: "session_draft_generated",
    });
    expect(formatAnalyticsIdentifierLabel("future_safe_event", "event")).toMatchObject({
      label: "Future Safe Event",
      secondary: "future_safe_event",
    });
  });
});
