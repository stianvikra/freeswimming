import { describe, expect, it } from "vitest";
import {
  countConsecutiveWeeklyGreenRuns,
  deriveReportMarginSummary,
  parseTrendLogLines,
  recommendTrendDecision,
} from "../../scripts/perf-budget-trend-utils.mjs";

function buildPassEntry(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: "2026-03-12T10:00:00.000Z",
    profile: "public",
    commitSha: "abc123def456",
    pass: true,
    worstMarginPct: 20,
    ...overrides,
  };
}

describe("perf-budget trend utils", () => {
  it("derives worst margin summary from route metrics", () => {
    const summary = deriveReportMarginSummary({
      budgets: {
        lcpMs: 2500,
        cls: 0.1,
        tbtMs: 200,
        jsTransferKb: 450,
        cssTransferKb: 160,
        requestCount: 130,
      },
      routes: [
        {
          route: "/",
          metrics: {
            lcpMs: 2000,
            cls: 0.05,
            tbtMs: 120,
            jsTransferKb: 300,
            cssTransferKb: 80,
            requestCount: 80,
          },
        },
        {
          route: "/plans",
          metrics: {
            lcpMs: 2400,
            cls: 0.09,
            tbtMs: 190,
            jsTransferKb: 420,
            cssTransferKb: 140,
            requestCount: 120,
          },
        },
      ],
    });

    expect(summary.worstMarginPct).toBe(4);
    expect(summary.routeSummaries).toHaveLength(2);
    expect(summary.routeSummaries[1]?.route).toBe("/plans");
    expect(summary.routeSummaries[1]?.worstMarginPct).toBe(4);
  });

  it("detects two consecutive weekly green runs for tighten recommendation", () => {
    const entries = [
      buildPassEntry({
        generatedAt: "2026-03-12T10:00:00.000Z",
        worstMarginPct: 22,
      }),
      buildPassEntry({
        generatedAt: "2026-03-05T10:00:00.000Z",
        commitSha: "prev123def456",
        worstMarginPct: 18,
      }),
    ];

    const recommendation = recommendTrendDecision(entries, {
      profile: "public",
      tightenMinMarginPct: 15,
      tightenMinWeeklyGreenRuns: 2,
    });

    expect(recommendation.decision).toBe("tighten");
    expect(recommendation.consecutiveWeeklyGreenRuns).toBe(2);
  });

  it("holds when weekly green runs are not consecutive", () => {
    const entries = [
      buildPassEntry({
        generatedAt: "2026-03-12T10:00:00.000Z",
        worstMarginPct: 30,
      }),
      buildPassEntry({
        generatedAt: "2026-02-26T10:00:00.000Z",
        commitSha: "prev123def456",
        worstMarginPct: 25,
      }),
    ];

    expect(countConsecutiveWeeklyGreenRuns(entries, "public")).toBe(1);

    const recommendation = recommendTrendDecision(entries, {
      profile: "public",
      tightenMinMarginPct: 15,
      tightenMinWeeklyGreenRuns: 2,
    });

    expect(recommendation.decision).toBe("hold");
  });

  it("recommends revert when latest run fails", () => {
    const entries = [
      buildPassEntry({
        generatedAt: "2026-03-12T10:00:00.000Z",
        pass: false,
        worstMarginPct: -4,
      }),
      buildPassEntry({
        generatedAt: "2026-03-05T10:00:00.000Z",
        commitSha: "prev123def456",
        worstMarginPct: 10,
      }),
    ];

    const recommendation = recommendTrendDecision(entries, { profile: "public" });
    expect(recommendation.decision).toBe("revert");
  });

  it("parses ndjson trend lines and skips malformed records", () => {
    const parsed = parseTrendLogLines(
      [
        JSON.stringify(buildPassEntry({ generatedAt: "2026-03-12T10:00:00.000Z" })),
        "not-json",
        JSON.stringify({ malformed: true }),
        JSON.stringify(buildPassEntry({ generatedAt: "2026-03-05T10:00:00.000Z" })),
      ].join("\n")
    );

    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.generatedAt).toBe("2026-03-12T10:00:00.000Z");
    expect(parsed[1]?.generatedAt).toBe("2026-03-05T10:00:00.000Z");
  });
});
