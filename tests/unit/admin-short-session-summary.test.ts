import { describe, expect, it } from "vitest";

import {
  formatAdminShortSessionSummary,
  summarizePlaywrightReport,
} from "@/scripts/summarize-admin-short-session.mjs";

describe("summarizePlaywrightReport", () => {
  it("counts final test statuses and groups skip reasons", () => {
    const report = {
      suites: [
        {
          title: "root",
          specs: [
            {
              title: "passing test",
              tests: [
                {
                  annotations: [],
                  results: [{ status: "passed" }],
                },
              ],
            },
            {
              title: "skipped with annotation",
              tests: [
                {
                  annotations: [
                    {
                      type: "skip",
                      description: "Dev auth bypass is not enabled in this environment.",
                    },
                  ],
                  results: [{ status: "skipped" }],
                },
              ],
            },
            {
              title: "skipped with same reason",
              tests: [
                {
                  annotations: [
                    {
                      type: "skip",
                      description: "Dev auth bypass is not enabled in this environment.",
                    },
                  ],
                  results: [{ status: "skipped" }],
                },
              ],
            },
            {
              title: "failing test",
              tests: [
                {
                  annotations: [],
                  results: [{ status: "failed" }],
                },
              ],
            },
          ],
          suites: [],
        },
      ],
    };

    const summary = summarizePlaywrightReport(report);

    expect(summary.total).toBe(4);
    expect(summary.counts.passed).toBe(1);
    expect(summary.counts.skipped).toBe(2);
    expect(summary.counts.failed).toBe(1);
    expect(summary.skipReasons).toEqual([
      {
        count: 2,
        reason: "Dev auth bypass is not enabled in this environment.",
      },
    ]);
  });

  it("falls back to default skip reason when description is missing", () => {
    const report = {
      suites: [
        {
          title: "root",
          specs: [
            {
              title: "skipped test",
              tests: [
                {
                  annotations: [{ type: "skip" }],
                  results: [{ status: "skipped" }],
                },
              ],
            },
          ],
          suites: [],
        },
      ],
    };

    const summary = summarizePlaywrightReport(report);
    expect(summary.skipReasons).toEqual([
      {
        count: 1,
        reason: "No explicit skip reason provided.",
      },
    ]);
  });
});

describe("formatAdminShortSessionSummary", () => {
  it("renders stable summary lines for shell output", () => {
    const summary = {
      total: 3,
      counts: {
        passed: 1,
        skipped: 1,
        failed: 1,
        timedOut: 0,
        interrupted: 0,
        unknown: 0,
      },
      skipReasons: [
        { reason: "Dev bypass account is signed in but not allowlisted/admin.", count: 1 },
      ],
    };

    const output = formatAdminShortSessionSummary(summary);
    expect(output).toContain("total=3, passed=1, skipped=1, failed=1");
    expect(output).toContain("- 1x Dev bypass account is signed in but not allowlisted/admin.");
  });
});
