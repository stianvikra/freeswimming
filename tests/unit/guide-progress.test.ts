import { describe, expect, it } from "vitest";
import {
  MAX_GUIDE_PROGRESS_ROWS,
  normalizeGuideProgressRows,
  normalizeGuideProgressRowsWithStats,
} from "@/lib/course/guide-progress";

describe("normalizeGuideProgressRows", () => {
  it("normalizes snake_case/camelCase fields and sorts stable by guide+section", () => {
    const rows = normalizeGuideProgressRows([
      {
        guide_slug: "0-1000m",
        section_id: "s02",
        completed: true,
        notes: "keep elbow high",
        updated_at: "2026-02-17T10:00:00.000Z",
      },
      {
        guideSlug: "0-1000m",
        sectionId: "s01",
        completed: false,
        notes: "focus on breathing",
        updatedAt: "2026-02-17T09:00:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        guideSlug: "0-1000m",
        sectionId: "S01",
        completed: false,
        notes: "focus on breathing",
        updatedAt: "2026-02-17T09:00:00.000Z",
      },
      {
        guideSlug: "0-1000m",
        sectionId: "S02",
        completed: true,
        notes: "keep elbow high",
        updatedAt: "2026-02-17T10:00:00.000Z",
      },
    ]);
  });

  it("deduplicates by guide+section and keeps newest updatedAt row", () => {
    const rows = normalizeGuideProgressRows([
      {
        guideSlug: "poolside",
        sectionId: "d01",
        completed: false,
        notes: "old",
        updatedAt: "2026-02-17T08:00:00.000Z",
      },
      {
        guideSlug: "poolside",
        sectionId: "guide-poolside-drill-d01",
        completed: true,
        notes: "new",
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        guideSlug: "poolside",
        sectionId: "D01",
        completed: true,
        notes: "new",
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
    ]);
  });

  it("drops invalid rows and respects maxRows option", () => {
    const rows = normalizeGuideProgressRows(
      [
        {
          guideSlug: "guide-a",
          sectionId: "s1",
          completed: true,
        },
        {
          guideSlug: "",
          sectionId: "s2",
          completed: true,
        },
        {
          guideSlug: "guide-a",
          sectionId: "s3",
          completed: true,
        },
      ],
      { maxRows: 1 }
    );

    expect(rows).toEqual([
      expect.objectContaining({
        guideSlug: "guide-a",
        sectionId: "s1",
      }),
    ]);
  });

  it("returns empty list for non-array input", () => {
    expect(normalizeGuideProgressRows(null)).toEqual([]);
    expect(normalizeGuideProgressRows({ rows: [] })).toEqual([]);
  });

  it("returns canonicalization stats for known guide fallback rows", () => {
    const normalized = normalizeGuideProgressRowsWithStats([
      {
        guideSlug: "0-1000m",
        sectionId: "guide-0-1000m-session-s04",
        completed: true,
      },
      {
        guideSlug: "poolside",
        sectionId: "bad-drill-ref",
        completed: true,
      },
    ]);

    expect(normalized.rows).toEqual([
      expect.objectContaining({
        guideSlug: "0-1000m",
        sectionId: "S04",
      }),
    ]);
    expect(normalized.stats).toEqual({
      canonicalizedSectionIds: 1,
      unresolvedKnownGuideRows: 1,
    });
  });

  it("caps parsing to MAX_GUIDE_PROGRESS_ROWS when requested", () => {
    const input = new Array(MAX_GUIDE_PROGRESS_ROWS + 5).fill(null).map((_, index) => ({
      guideSlug: "guide",
      sectionId: `s${index}`,
      completed: true,
    }));

    const rows = normalizeGuideProgressRows(input, {
      maxRows: MAX_GUIDE_PROGRESS_ROWS,
    });

    expect(rows.length).toBe(MAX_GUIDE_PROGRESS_ROWS);
  });
});
