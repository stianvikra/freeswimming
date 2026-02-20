import { describe, expect, it } from "vitest";
import type { AdminContentItemRow } from "@/lib/admin/content";
import { buildPlatformContentSeedItems } from "@/lib/admin/content-import";
import { buildAdminContentMirrorSnapshot } from "@/lib/admin/content-mirror";
import { getCatalogProductsWithAvailability } from "@/lib/commerce/catalog";

const TIMESTAMP = "2026-02-20T00:00:00.000Z";

function toAdminContentRows(): AdminContentItemRow[] {
  const { items: seedItems } = buildPlatformContentSeedItems();
  return seedItems.map((item, index) => ({
    id: `seed-${index}`,
    content_type: item.contentType,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    category: item.category,
    body: item.body as AdminContentItemRow["body"],
    sort_order: item.sortOrder,
    status: item.status,
    parent_id: null,
    published_at: item.status === "published" ? TIMESTAMP : null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    created_by: null,
    updated_by: null,
  }));
}

function toProductRows(): Array<{ id: string; active: boolean }> {
  return getCatalogProductsWithAvailability()
    .filter((product) => product.active)
    .map((product) => ({
      id: product.id,
      active: product.active,
    }));
}

describe("buildAdminContentMirrorSnapshot", () => {
  it("returns fully matched parity when admin mirrors platform seed", () => {
    const snapshot = buildAdminContentMirrorSnapshot(toAdminContentRows(), toProductRows());

    expect(snapshot.metrics).toHaveLength(5);
    expect(snapshot.metrics.map((entry) => entry.key)).toEqual([
      "course_module",
      "course_lesson",
      "guide_session",
      "guide_drill",
      "programs",
    ]);
    expect(snapshot.summary.mismatchCount).toBe(0);
    expect(snapshot.summary.coverageMismatchCount).toBe(0);
    expect(snapshot.metrics.every((metric) => metric.status === "matched")).toBe(true);
  });

  it("flags drift when counts match but identity coverage differs", () => {
    const adminRows = toAdminContentRows();
    const lessonIndex = adminRows.findIndex((row) => row.content_type === "course_lesson");
    expect(lessonIndex).toBeGreaterThanOrEqual(0);

    const lessonRow = adminRows[lessonIndex];
    if (!lessonRow) {
      throw new Error("Expected a course lesson row in seeded content.");
    }

    adminRows[lessonIndex] = {
      ...lessonRow,
      slug: `${lessonRow.slug}-drift`,
    };

    const snapshot = buildAdminContentMirrorSnapshot(adminRows, toProductRows());
    const lessonMetric = snapshot.metrics.find((entry) => entry.key === "course_lesson");

    expect(lessonMetric).toBeDefined();
    expect(lessonMetric?.delta).toBe(0);
    expect(lessonMetric?.status).toBe("drift");
    expect(lessonMetric?.coverage.missingCount).toBe(1);
    expect(lessonMetric?.coverage.extraCount).toBe(1);
    expect(snapshot.summary.mismatchCount).toBeGreaterThan(0);
    expect(snapshot.summary.coverageMismatchCount).toBeGreaterThan(0);
  });

  it("returns missing mismatches when admin content is empty", () => {
    const snapshot = buildAdminContentMirrorSnapshot([], []);

    expect(snapshot.metrics).toHaveLength(5);
    expect(snapshot.metrics.map((entry) => entry.key)).toEqual([
      "course_module",
      "course_lesson",
      "guide_session",
      "guide_drill",
      "programs",
    ]);
    expect(snapshot.summary.mismatchCount).toBeGreaterThan(0);
    expect(snapshot.metrics.some((entry) => entry.status === "missing")).toBe(true);
  });
});
