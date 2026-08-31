import { describe, expect, it } from "vitest";
import {
  applyGuideRuntimeIdDefaults,
  canonicalizeGuideDrillRuntimeId,
  canonicalizeGuideProgressSectionId,
  canonicalizeGuideSessionRuntimeId,
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
  resolveNextGuideRuntimeId,
} from "@/lib/guides/runtime-identity";

describe("guide runtime identity", () => {
  it("canonicalizes session and drill runtime ids", () => {
    expect(canonicalizeGuideSessionRuntimeId("s01")).toBe("S01");
    expect(canonicalizeGuideSessionRuntimeId("S9")).toBe("S09");
    expect(canonicalizeGuideDrillRuntimeId("d02")).toBe("D02");
    expect(canonicalizeGuideDrillRuntimeId("drill-2")).toBeNull();
  });

  it("prefers explicit guide runtime ids and falls back to legacy slug only for compatibility", () => {
    expect(resolveGuideSessionRuntimeId({ sessionId: "s07" }, "guide-0-1000m-session-s99")).toEqual(
      {
        runtimeId: "S07",
        source: "body",
      }
    );
    expect(resolveGuideDrillRuntimeId({}, "guide-poolside-drill-d04")).toEqual({
      runtimeId: "D04",
      source: "legacy_slug",
    });
  });

  it("parses legacy slug suffixes in linear time without changing delimiter semantics", () => {
    expect(resolveGuideSessionRuntimeId({}, "GUIDE-SESSION-S08")).toEqual({
      runtimeId: "S08",
      source: "legacy_slug",
    });
    expect(resolveGuideDrillRuntimeId({}, "guide-drill-x!copy-DRILL-d09")).toEqual({
      runtimeId: "D09",
      source: "legacy_slug",
    });

    expect(resolveGuideSessionRuntimeId({}, "guide-session-x-session-s08")).toEqual({
      runtimeId: null,
      source: "unresolved",
    });
    expect(resolveGuideDrillRuntimeId({}, `${"-drill-a".repeat(10_000)}!`)).toEqual({
      runtimeId: null,
      source: "unresolved",
    });
  });

  it("resolves the next guide runtime id from the highest known canonical id", () => {
    expect(
      resolveNextGuideRuntimeId({
        contentType: "guide_session",
        rows: [
          { slug: "guide-0-1000m-session-s19", body: { sessionId: "S19" } },
          { slug: "guide-0-1000m-session-s20", body: {} },
        ],
      })
    ).toEqual({
      runtimeId: "S21",
      legacySlugFallbackCount: 1,
      unresolvedCount: 0,
    });
  });

  it("applies stable body defaults for guide create flows", () => {
    expect(
      applyGuideRuntimeIdDefaults({
        contentType: "guide_drill",
        body: { setup: "Keep line" },
        runtimeId: "D13",
      })
    ).toEqual({
      guideSlug: "poolside",
      drillId: "D13",
      setup: "Keep line",
    });
  });

  it("canonicalizes known guide progress section ids and preserves unknown guide rows", () => {
    expect(
      canonicalizeGuideProgressSectionId({
        guideSlug: "0-1000m",
        sectionId: "s03",
      })
    ).toEqual({
      runtimeId: "S03",
      source: "body",
    });

    expect(
      canonicalizeGuideProgressSectionId({
        guideSlug: "poolside",
        sectionId: "guide-poolside-drill-d05",
      })
    ).toEqual({
      runtimeId: "D05",
      source: "legacy_slug",
    });

    expect(
      canonicalizeGuideProgressSectionId({
        guideSlug: "future-guide",
        sectionId: "phase-1",
      })
    ).toEqual({
      runtimeId: "phase-1",
      source: "unknown_guide",
    });
  });
});
