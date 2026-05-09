import { unstable_cache } from "next/cache";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";
import type { CatalogProductOverridesById } from "@/lib/commerce/catalog";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const PUBLIC_CATALOG_REVALIDATE_SECONDS = 60 * 60;

async function loadPublicCatalogOverrides(): Promise<CatalogProductOverridesById> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, kind, active")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[Catalog] Could not load public product catalog overrides", {
      message: error.message,
      code: error.code,
    });
    return {};
  }

  return buildCatalogOverridesFromRows(data ?? []);
}

export const loadPublicCatalogOverridesCached = unstable_cache(
  loadPublicCatalogOverrides,
  ["public-catalog-overrides-v1"],
  {
    revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
    tags: ["public-catalog"],
  }
);
