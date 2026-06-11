import type { CatalogProductOverridesById } from "@/lib/commerce/catalog";
import { loadPublicCatalogOverridesCached } from "@/lib/commerce/catalog-server";
import { isWorkoutContextCtaProductAvailable } from "@/lib/commerce/workout-context-cta";

export async function loadWorkoutContextCtaProductAvailable() {
  let catalogOverrides: CatalogProductOverridesById = {};

  try {
    catalogOverrides = await loadPublicCatalogOverridesCached();
  } catch (error) {
    console.error(
      "[WorkoutContextCta] Falling back to env catalog due override lookup failure",
      error
    );
  }

  return isWorkoutContextCtaProductAvailable(process.env, catalogOverrides);
}
