import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminAnalyticsDashboard from "@/components/admin/AdminAnalyticsDashboard";
import type { AnalyticsDashboardPayload } from "@/lib/analytics/admin-dashboard";
import type { AnalyticsInsightsResponse } from "@/lib/analytics/admin-insights";

const basePayload: AnalyticsInsightsResponse = {
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

function okResponse(payload: AnalyticsDashboardPayload = basePayload) {
  return {
    ok: true,
    json: async () => payload,
  };
}

function errorResponse(error = "Could not load analytics insights right now.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminAnalyticsDashboard", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the read-only dashboard in the required scan order", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminAnalyticsDashboard />);

    expect(screen.getByTestId("admin-analytics-dashboard-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading analytics dashboard...");

    await screen.findByTestId("admin-analytics-health");
    expect(screen.getByTestId("admin-analytics-kpis")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-funnel")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-workout-builder-funnel")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-workout-builder-source-breakdown")).toBeVisible();
    expect(
      screen.getByTestId("admin-analytics-workout-builder-template-generated-completion")
    ).toBeVisible();
    expect(screen.getByTestId("admin-analytics-workout-builder-template-usage")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-top-lists")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-caveats")).toBeVisible();

    expect(screen.getByText("Fresh")).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-funnel")).getByText("Checkout completed")
    ).toBeVisible();
    const builderFunnel = screen.getByTestId("admin-analytics-workout-builder-funnel");
    expect(within(builderFunnel).getByText("Started to saved signal")).toBeVisible();
    expect(within(builderFunnel).getByText("Started")).toBeVisible();
    expect(within(builderFunnel).getByText("Saved")).toBeVisible();
    expect(within(builderFunnel).getByText("Save rate")).toBeVisible();
    expect(within(builderFunnel).getByText("5")).toBeVisible();
    expect(within(builderFunnel).getByText("3")).toBeVisible();
    expect(within(builderFunnel).getByText("60%")).toBeVisible();
    expect(within(builderFunnel).queryByRole("button")).not.toBeInTheDocument();
    const sourceBreakdown = screen.getByTestId("admin-analytics-workout-builder-source-breakdown");
    expect(within(sourceBreakdown).getByText("Source breakdown")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Manual starts")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Generated drafts")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Manual saves")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Generated saves")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Manual save rate")).toBeVisible();
    expect(within(sourceBreakdown).getByText("Generated save rate")).toBeVisible();
    expect(within(sourceBreakdown).getByText("40%")).toBeVisible();
    expect(within(sourceBreakdown).getByText("25%")).toBeVisible();
    expect(within(sourceBreakdown).queryByRole("button")).not.toBeInTheDocument();
    const generatedCompletion = screen.getByTestId(
      "admin-analytics-workout-builder-template-generated-completion"
    );
    expect(within(generatedCompletion).getByText("Generated completion")).toBeVisible();
    expect(within(generatedCompletion).getByText("Generated drafts")).toBeVisible();
    expect(within(generatedCompletion).getByText("Generated saves")).toBeVisible();
    expect(within(generatedCompletion).getByText("Completion rate")).toBeVisible();
    expect(within(generatedCompletion).getByText("Template usage")).toBeVisible();
    expect(within(generatedCompletion).getByText("Explicit selections")).toBeVisible();
    expect(within(generatedCompletion).queryByRole("button")).not.toBeInTheDocument();
    const templateUsage = screen.getByTestId("admin-analytics-workout-builder-template-usage");
    expect(within(templateUsage).getByText("Template usage")).toBeVisible();
    expect(within(templateUsage).getByText("Template selections")).toBeVisible();
    expect(within(templateUsage).getByText("Templates selected")).toBeVisible();
    expect(within(templateUsage).getByText("Unknown template")).toBeVisible();
    expect(within(templateUsage).getByText("Aerobic base 1000")).toBeVisible();
    expect(within(templateUsage).getByText("Technique reset 900")).toBeVisible();
    expect(within(templateUsage).queryByRole("button")).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("admin-analytics-top-events")).getByText("Plans viewed")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-top-routes")).getByText("/plans")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-top-products")).getByText("Guide Poolside")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-caveats")).getByText(/not Stripe reconciliation/i)
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-caveats")).getByText(/not unique-user conversion/i)
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-caveats")).getByText(/not export success/i)
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-caveats")).getByText(
        /Template usage is product telemetry only/i
      )
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-analytics-caveats")).getByText(
        /not linked to user profiles/i
      )
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/analytics/insights?rangeDays=30", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("switches bounded ranges without writing analytics state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse())
      .mockResolvedValueOnce(okResponse({ ...basePayload, rangeDays: 7 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminAnalyticsDashboard />);

    await screen.findByTestId("admin-analytics-health");
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/analytics/insights?rangeDays=7", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
    });
    expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows schema-missing, capped, and no-data caveats without raw payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okResponse({
        ok: true,
        schemaReady: false,
        warning: "Analytics persistence is not ready yet.",
        generatedAt: "2026-06-09T12:00:00.000Z",
        rangeDays: 30,
        items: [],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminAnalyticsDashboard />);

    const health = await screen.findByTestId("admin-analytics-health");
    expect(within(health).getByText("Schema missing")).toBeVisible();
    expect(screen.getByText("Not ready")).toBeVisible();
    expect(screen.getByTestId("admin-analytics-workout-builder-funnel")).toHaveTextContent(
      "Not counted"
    );
    expect(
      screen.getByTestId("admin-analytics-workout-builder-source-breakdown")
    ).toHaveTextContent("Not counted");
    expect(
      screen.getByTestId("admin-analytics-workout-builder-template-generated-completion")
    ).toHaveTextContent("Not counted");
    expect(screen.getByTestId("admin-analytics-workout-builder-template-usage")).toHaveTextContent(
      "Not counted"
    );
    expect(screen.getByText(/database errors/i)).toBeVisible();
    expect(screen.queryByText(/payload/i, { selector: "code" })).not.toBeInTheDocument();
  });

  it("keeps unsafe identifiers out of rendered labels and supports retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse())
      .mockResolvedValueOnce(
        okResponse({
          ...basePayload,
          eventCounts: [{ key: "email=user@example.com", count: 1 }],
          routeCounts: [
            { key: "https://example.com/?email=user@example.com", category: null, count: 1 },
          ],
          productCounts: [{ key: "customer@example.com", productType: null, count: 1 }],
          workoutBuilderFunnel: {
            started: 0,
            saved: 2,
            saveRate: null,
          },
          workoutBuilderSourceBreakdown: {
            manualStarts: 0,
            generatedDrafts: 0,
            manualSaves: 0,
            generatedSaves: 0,
            unknownSaves: 2,
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
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminAnalyticsDashboard />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load analytics insights right now.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("Unknown event");
    expect(screen.getByTestId("admin-analytics-workout-builder-funnel")).toHaveTextContent(
      "Not counted"
    );
    expect(
      screen.getByTestId("admin-analytics-workout-builder-source-breakdown")
    ).toHaveTextContent("Unknown saves");
    expect(
      screen.getByTestId("admin-analytics-workout-builder-template-generated-completion")
    ).toHaveTextContent("0");
    expect(screen.getByTestId("admin-analytics-workout-builder-template-usage")).toHaveTextContent(
      "No template selections in this range"
    );
    expect(screen.getByText("Unknown route")).toBeVisible();
    expect(screen.getByText("Unknown product")).toBeVisible();
    expect(document.body).not.toHaveTextContent("user@example.com");
  });

  it("renders top lists as compact list rows instead of horizontal tables", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminAnalyticsDashboard />);

    const topLists = await screen.findByTestId("admin-analytics-top-lists");
    expect(within(topLists).queryByRole("table")).not.toBeInTheDocument();
    expect(within(topLists).getAllByRole("list")).toHaveLength(3);
    expect(topLists).toHaveClass("grid", "lg:grid-cols-3");
  });
});
