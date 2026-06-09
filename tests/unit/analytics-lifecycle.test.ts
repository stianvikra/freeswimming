import { describe, expect, it } from "vitest";
import {
  ANALYTICS_DAILY_ROLLUP_WINDOW_DAYS,
  ANALYTICS_RAW_EVENT_RETENTION_DAYS,
  buildAnalyticsLifecycleStatus,
  isAnalyticsRollupSchemaMissing,
  type AnalyticsDailyRollupStatusRow,
} from "@/lib/analytics/lifecycle";

const generatedAt = new Date("2026-06-09T12:00:00.000Z");

const rollupRow: AnalyticsDailyRollupStatusRow = {
  rollup_day: "2026-06-08",
  event_count: 3,
  refreshed_at: "2026-06-09T08:00:00.000Z",
};

describe("analytics lifecycle status", () => {
  it("builds ready lifecycle metadata from daily rollups", () => {
    const status = buildAnalyticsLifecycleStatus({
      generatedAt,
      rollupRows: [
        rollupRow,
        {
          ...rollupRow,
          rollup_day: "2026-06-07",
          event_count: 2,
          refreshed_at: "2026-06-09T07:00:00.000Z",
        },
        {
          ...rollupRow,
          rollup_day: "2026-06-08",
          event_count: 4,
          refreshed_at: "2026-06-09T09:00:00.000Z",
        },
      ],
    });

    expect(status).toMatchObject({
      rawRetentionDays: ANALYTICS_RAW_EVENT_RETENTION_DAYS,
      rollupWindowDays: ANALYTICS_DAILY_ROLLUP_WINDOW_DAYS,
      rawPruneBefore: "2025-12-11T12:00:00.000Z",
      rollup: {
        status: "ready",
        schemaReady: true,
        queryOk: true,
        latestDay: "2026-06-08",
        oldestDay: "2026-06-07",
        latestRefreshAt: "2026-06-09T09:00:00.000Z",
        daysWithRollups: 2,
        totalRolledUpEvents: 9,
      },
    });
  });

  it("reports empty, stale, schema-missing, and query-failed states without raw errors", () => {
    expect(buildAnalyticsLifecycleStatus({ generatedAt }).rollup).toMatchObject({
      status: "empty",
      message: "No analytics daily rollups have been refreshed yet.",
    });
    expect(
      buildAnalyticsLifecycleStatus({
        generatedAt,
        rollupRows: [{ ...rollupRow, rollup_day: "2026-06-01" }],
      }).rollup
    ).toMatchObject({
      status: "stale",
      message: "Analytics daily rollups are stale; refresh rollups before pruning raw events.",
    });
    expect(
      buildAnalyticsLifecycleStatus({ generatedAt, rollupSchemaReady: false }).rollup
    ).toMatchObject({
      status: "schema-missing",
      schemaReady: false,
    });
    expect(
      buildAnalyticsLifecycleStatus({ generatedAt, rollupQueryOk: false }).rollup
    ).toMatchObject({
      status: "query-failed",
      queryOk: false,
      message: "Analytics rollup status could not be loaded right now.",
    });
  });

  it("detects missing rollup schema errors", () => {
    expect(
      isAnalyticsRollupSchemaMissing({
        code: "42P01",
        message: 'relation "analytics_event_daily_rollups" does not exist',
      })
    ).toBe(true);
    expect(
      isAnalyticsRollupSchemaMissing({
        message: "permission denied for analytics_event_daily_rollups",
      })
    ).toBe(false);
  });
});
