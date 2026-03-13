import type { AdminContentItemRow } from "@/lib/admin/content";

export const ADMIN_CONTENT_QA_TEST_SLUG_PREFIXES = ["e2e-admin-content-"] as const;

function normalizeComparableValue(value: string): string {
  return value.trim().toLowerCase();
}

export function isAdminContentQaTestSlug(slug: string): boolean {
  const normalized = normalizeComparableValue(slug);
  return ADMIN_CONTENT_QA_TEST_SLUG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function isAdminContentQaTestRecord(item: Pick<AdminContentItemRow, "slug">): boolean {
  return isAdminContentQaTestSlug(item.slug);
}
