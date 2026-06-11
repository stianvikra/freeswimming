import { WORKOUT_CONTEXT_CTA_PRODUCT_ID } from "@/lib/analytics/workout-builder";
import {
  getCatalogProductsWithAvailability,
  type CatalogProductOverridesById,
} from "@/lib/commerce/catalog";

export function isWorkoutContextCtaProductAvailable(
  env: NodeJS.ProcessEnv = process.env,
  overrides?: CatalogProductOverridesById
) {
  return Boolean(
    getCatalogProductsWithAvailability(env, overrides).find(
      (product) => product.id === WORKOUT_CONTEXT_CTA_PRODUCT_ID && product.available
    )
  );
}
