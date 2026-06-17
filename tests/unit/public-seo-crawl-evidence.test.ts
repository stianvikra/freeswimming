import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildPublicSeoCrawlEvidenceReport,
  summarizeCrawlEvidence,
} from "@/lib/seo/public-crawl-evidence";

describe("public SEO crawl evidence contract", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds passing public evidence from canonical route, metadata, sitemap, robots, and schema contracts", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "0");

    const report = buildPublicSeoCrawlEvidenceReport("2026-06-17T12:00:00.000Z");
    const summary = summarizeCrawlEvidence(report.rows);

    expect(report.siteLocked).toBe(false);
    expect(report.routeCount).toBeGreaterThan(0);
    expect(report.representativeLessonUrl).toMatch(
      /^https:\/\/freeswimming\.org\/en\/course\/course-module-/
    );
    expect(summary.fail).toBe(0);
    expect(summary.pass).toBe(report.rows.length);
    expect(report.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: "public sitemap",
          check: "all indexable course lessons are discoverable",
          status: "pass",
        }),
        expect.objectContaining({
          surface: "robots",
          check: "crawler policy separates search inclusion from training opt-out",
          status: "pass",
        }),
        expect.objectContaining({
          surface: "structured data",
          check: "lesson JSON-LD matches visible lesson content",
          status: "pass",
        }),
        expect.objectContaining({
          surface: "unknown route safety",
          check: "unknown lesson routes do not create indexable fake pages",
          status: "pass",
        }),
        expect.objectContaining({
          surface: "deprecated route compatibility",
          check: "known breathing-and-floating lesson redirects to current canonical route",
          status: "pass",
        }),
      ])
    );
  });

  it("keeps external dashboard evidence as manual steps with public targets only", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "0");

    const report = buildPublicSeoCrawlEvidenceReport("2026-06-17T12:00:00.000Z");

    expect(report.externalSteps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tool: "Google Search Console URL Inspection",
          status: "manual-required",
        }),
        expect.objectContaining({
          tool: "Google Rich Results Test",
          status: "manual-required",
        }),
        expect.objectContaining({
          tool: "PageSpeed Insights",
          status: "manual-required",
        }),
        expect.objectContaining({
          tool: "Bing Webmaster Tools or IndexNow",
          status: "manual-required",
        }),
      ])
    );
    expect(
      report.externalSteps.every((step) => step.target.startsWith("https://freeswimming.org/"))
    ).toBe(true);
    expect(report.externalSteps.every((step) => !step.target.includes("/admin"))).toBe(true);
    expect(report.externalSteps.every((step) => !step.target.includes("/my-library"))).toBe(true);
  });

  it("switches to fail-closed private-mode evidence when site lock is enabled", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");

    const report = buildPublicSeoCrawlEvidenceReport("2026-06-17T12:00:00.000Z");
    const summary = summarizeCrawlEvidence(report.rows);

    expect(report.siteLocked).toBe(true);
    expect(summary.fail).toBe(0);
    expect(report.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: "private-mode sitemap",
          check: "site lock removes public sitemap URLs",
          status: "pass",
        }),
        expect.objectContaining({
          surface: "private-mode robots",
          check: "site lock disallows all crawlers",
          status: "pass",
        }),
      ])
    );
  });
});
