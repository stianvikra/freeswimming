import type { Database } from "@/types/database";
import type { CatalogProduct, CatalogProductOverridesById } from "@/lib/commerce/catalog";
import { isCatalogProductId } from "@/lib/commerce/catalog";

type CatalogProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "slug" | "title" | "kind" | "active"
>;

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeKind(value: string): CatalogProduct["kind"] | null {
  if (value === "course_addon" || value === "analysis") {
    return value;
  }
  return null;
}

export function buildCatalogOverridesFromRows(
  rows: CatalogProductRow[]
): CatalogProductOverridesById {
  const overrides: CatalogProductOverridesById = {};

  for (const row of rows) {
    if (!isCatalogProductId(row.id)) continue;

    const title = normalizeText(row.title);
    const slug = normalizeText(row.slug);
    const kind = normalizeKind(row.kind);

    overrides[row.id] = {
      ...(title ? { title } : {}),
      ...(slug ? { slug } : {}),
      ...(kind ? { kind } : {}),
      active: row.active,
    };
  }

  return overrides;
}
