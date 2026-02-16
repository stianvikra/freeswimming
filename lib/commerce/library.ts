import type { CatalogProduct } from "@/lib/commerce/catalog";

export type LibrarySections = {
  owned: CatalogProduct[];
  explore: CatalogProduct[];
  unknownOwnedProductIds: string[];
};

export function buildLibrarySections(
  catalogProducts: CatalogProduct[],
  entitlementProductIds: string[]
): LibrarySections {
  const ownedIdSet = new Set(entitlementProductIds);

  const owned: CatalogProduct[] = [];
  const explore: CatalogProduct[] = [];

  for (const product of catalogProducts) {
    if (ownedIdSet.has(product.id)) {
      owned.push(product);
    } else {
      explore.push(product);
    }
  }

  const catalogIds = new Set<string>(catalogProducts.map((product) => product.id));
  const unknownOwnedProductIds = [...ownedIdSet].filter((productId) => !catalogIds.has(productId));

  return {
    owned,
    explore,
    unknownOwnedProductIds,
  };
}
