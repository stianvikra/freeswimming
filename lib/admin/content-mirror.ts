import { COURSE_MODULES } from "@/app/course/courseData";
import type { AdminContentItemRow } from "@/lib/admin/content";
import { buildPlatformContentSeedItems } from "@/lib/admin/content-import";
import { getCatalogProductsWithAvailability } from "@/lib/commerce/catalog";
import { GUIDE_0_TO_1000M_SESSIONS } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_DRILLS } from "@/lib/guides/guide-poolside";
import type { Database } from "@/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type AdminContentMirrorMetric = {
  key: "course_module" | "course_lesson" | "guide_session" | "guide_drill" | "programs";
  label: string;
  platformCount: number;
  adminCount: number;
  delta: number;
  status: "matched" | "missing" | "extra" | "drift";
  coverage: {
    missingCount: number;
    extraCount: number;
    ignoredCount: number;
    missingSamples: string[];
    extraSamples: string[];
    ignoredSamples: string[];
  };
};

export type AdminContentMirrorSnapshot = {
  checkedAt: string;
  metrics: AdminContentMirrorMetric[];
  summary: {
    matchedCount: number;
    mismatchCount: number;
    coverageMismatchCount: number;
    ignoredRecordCount: number;
    ignoredMetricCount: number;
  };
};

const ADMIN_CONTENT_MIRROR_IGNORED_SLUG_PREFIXES = ["e2e-admin-content-"] as const;

function countCourseLessons(): number {
  return COURSE_MODULES.reduce((total, module) => total + module.lessons.length, 0);
}

function countAdminContentByType(
  items: AdminContentItemRow[],
  type: AdminContentItemRow["content_type"]
): number {
  return items.filter((item) => item.content_type === type).length;
}

function normalizeComparableValue(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map(normalizeComparableValue).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function isIgnoredAdminContentMirrorSlug(slug: string): boolean {
  const normalized = normalizeComparableValue(slug);
  return ADMIN_CONTENT_MIRROR_IGNORED_SLUG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function buildCoverage(
  expectedValues: string[],
  adminValues: string[],
  ignoredValues: string[] = []
): {
  missingCount: number;
  extraCount: number;
  ignoredCount: number;
  missingSamples: string[];
  extraSamples: string[];
  ignoredSamples: string[];
} {
  const expectedSet = new Set(uniqueSorted(expectedValues));
  const adminSet = new Set(uniqueSorted(adminValues));
  const ignoredSet = uniqueSorted(ignoredValues);

  const missingValues = [...expectedSet].filter((value) => !adminSet.has(value));
  const extraValues = [...adminSet].filter((value) => !expectedSet.has(value));

  return {
    missingCount: missingValues.length,
    extraCount: extraValues.length,
    ignoredCount: ignoredSet.length,
    missingSamples: missingValues.slice(0, 3),
    extraSamples: extraValues.slice(0, 3),
    ignoredSamples: ignoredSet.slice(0, 3),
  };
}

function resolveMetricStatus(
  delta: number,
  coverage: {
    missingCount: number;
    extraCount: number;
  }
): "matched" | "missing" | "extra" | "drift" {
  const hasCoverageMismatch = coverage.missingCount > 0 || coverage.extraCount > 0;
  if (delta === 0 && !hasCoverageMismatch) return "matched";
  if (delta === 0 && hasCoverageMismatch) return "drift";
  return delta < 0 ? "missing" : "extra";
}

function buildMetric(
  key: AdminContentMirrorMetric["key"],
  label: string,
  platformCount: number,
  adminCount: number,
  coverage: AdminContentMirrorMetric["coverage"]
): AdminContentMirrorMetric {
  const delta = adminCount - platformCount;
  return {
    key,
    label,
    platformCount,
    adminCount,
    delta,
    status: resolveMetricStatus(delta, coverage),
    coverage,
  };
}

export function buildAdminContentMirrorSnapshot(
  items: AdminContentItemRow[],
  productRows: Pick<ProductRow, "id" | "active">[] = []
): AdminContentMirrorSnapshot {
  const catalogProducts = getCatalogProductsWithAvailability();
  const platformPrograms = catalogProducts.filter((product) => product.active).length;
  const adminPrograms = productRows.filter((product) => product.active).length;

  const { items: seedItems } = buildPlatformContentSeedItems();
  const expectedByType = new Map<AdminContentItemRow["content_type"], string[]>();
  const adminByType = new Map<AdminContentItemRow["content_type"], string[]>();
  const ignoredByType = new Map<AdminContentItemRow["content_type"], string[]>();

  seedItems.forEach((item) => {
    expectedByType.set(item.contentType, [
      ...(expectedByType.get(item.contentType) ?? []),
      item.slug,
    ]);
  });

  const comparableItems = items.filter((item) => {
    if (!isIgnoredAdminContentMirrorSlug(item.slug)) {
      return true;
    }
    ignoredByType.set(item.content_type, [
      ...(ignoredByType.get(item.content_type) ?? []),
      item.slug,
    ]);
    return false;
  });

  comparableItems.forEach((item) => {
    adminByType.set(item.content_type, [...(adminByType.get(item.content_type) ?? []), item.slug]);
  });

  const expectedProgramIds = catalogProducts
    .filter((product) => product.active)
    .map((product) => product.id);
  const adminProgramIds = productRows
    .filter((product) => product.active)
    .map((product) => product.id);

  const metrics: AdminContentMirrorMetric[] = [
    buildMetric(
      "course_module",
      "Course modules",
      COURSE_MODULES.length,
      countAdminContentByType(comparableItems, "course_module"),
      buildCoverage(
        expectedByType.get("course_module") ?? [],
        adminByType.get("course_module") ?? [],
        ignoredByType.get("course_module") ?? []
      )
    ),
    buildMetric(
      "course_lesson",
      "Course lessons",
      countCourseLessons(),
      countAdminContentByType(comparableItems, "course_lesson"),
      buildCoverage(
        expectedByType.get("course_lesson") ?? [],
        adminByType.get("course_lesson") ?? [],
        ignoredByType.get("course_lesson") ?? []
      )
    ),
    buildMetric(
      "guide_session",
      "0-1000 sessions",
      GUIDE_0_TO_1000M_SESSIONS.length,
      countAdminContentByType(comparableItems, "guide_session"),
      buildCoverage(
        expectedByType.get("guide_session") ?? [],
        adminByType.get("guide_session") ?? [],
        ignoredByType.get("guide_session") ?? []
      )
    ),
    buildMetric(
      "guide_drill",
      "Poolside drills",
      GUIDE_POOLSIDE_DRILLS.length,
      countAdminContentByType(comparableItems, "guide_drill"),
      buildCoverage(
        expectedByType.get("guide_drill") ?? [],
        adminByType.get("guide_drill") ?? [],
        ignoredByType.get("guide_drill") ?? []
      )
    ),
    buildMetric(
      "programs",
      "Programs/products",
      platformPrograms,
      adminPrograms,
      buildCoverage(expectedProgramIds, adminProgramIds)
    ),
  ];

  const mismatchCount = metrics.filter((metric) => metric.status !== "matched").length;
  const coverageMismatchCount = metrics.filter(
    (metric) => metric.coverage.missingCount > 0 || metric.coverage.extraCount > 0
  ).length;
  const ignoredRecordCount = metrics.reduce(
    (total, metric) => total + metric.coverage.ignoredCount,
    0
  );
  const ignoredMetricCount = metrics.filter((metric) => metric.coverage.ignoredCount > 0).length;

  return {
    checkedAt: new Date().toISOString(),
    metrics,
    summary: {
      matchedCount: metrics.length - mismatchCount,
      mismatchCount,
      coverageMismatchCount,
      ignoredRecordCount,
      ignoredMetricCount,
    },
  };
}
