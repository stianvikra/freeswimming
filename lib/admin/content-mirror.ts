import { COURSE_MODULES } from "@/app/course/courseData";
import type { AdminContentItemRow } from "@/lib/admin/content";
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
  status: "matched" | "missing" | "extra";
};

export type AdminContentMirrorSnapshot = {
  checkedAt: string;
  metrics: AdminContentMirrorMetric[];
  summary: {
    matchedCount: number;
    mismatchCount: number;
  };
};

function countCourseLessons(): number {
  return COURSE_MODULES.reduce((total, module) => total + module.lessons.length, 0);
}

function countAdminContentByType(
  items: AdminContentItemRow[],
  type: AdminContentItemRow["content_type"]
): number {
  return items.filter((item) => item.content_type === type).length;
}

function resolveMetricStatus(delta: number): "matched" | "missing" | "extra" {
  if (delta === 0) return "matched";
  return delta < 0 ? "missing" : "extra";
}

function buildMetric(
  key: AdminContentMirrorMetric["key"],
  label: string,
  platformCount: number,
  adminCount: number
): AdminContentMirrorMetric {
  const delta = adminCount - platformCount;
  return {
    key,
    label,
    platformCount,
    adminCount,
    delta,
    status: resolveMetricStatus(delta),
  };
}

export function buildAdminContentMirrorSnapshot(
  items: AdminContentItemRow[],
  productRows: Pick<ProductRow, "id" | "active">[] = []
): AdminContentMirrorSnapshot {
  const catalogProducts = getCatalogProductsWithAvailability();
  const platformPrograms = catalogProducts.filter((product) => product.active).length;
  const adminPrograms = productRows.filter((product) => product.active).length;

  const metrics: AdminContentMirrorMetric[] = [
    buildMetric(
      "course_module",
      "Course modules",
      COURSE_MODULES.length,
      countAdminContentByType(items, "course_module")
    ),
    buildMetric(
      "course_lesson",
      "Course lessons",
      countCourseLessons(),
      countAdminContentByType(items, "course_lesson")
    ),
    buildMetric(
      "guide_session",
      "0-1000 sessions",
      GUIDE_0_TO_1000M_SESSIONS.length,
      countAdminContentByType(items, "guide_session")
    ),
    buildMetric(
      "guide_drill",
      "Poolside drills",
      GUIDE_POOLSIDE_DRILLS.length,
      countAdminContentByType(items, "guide_drill")
    ),
    buildMetric("programs", "Programs/products", platformPrograms, adminPrograms),
  ];

  const mismatchCount = metrics.filter((metric) => metric.status !== "matched").length;

  return {
    checkedAt: new Date().toISOString(),
    metrics,
    summary: {
      matchedCount: metrics.length - mismatchCount,
      mismatchCount,
    },
  };
}
