import { describe, expect, it } from "vitest";
import { buildLibrarySections } from "@/lib/commerce/library";
import type { CatalogProduct } from "@/lib/commerce/catalog";

const CATALOG: CatalogProduct[] = [
  {
    id: "guide_0_1000m",
    slug: "0-1000m-guide",
    title: "0-1000m guide",
    kind: "course_addon",
    stripePriceId: "price_1000",
    active: true,
  },
  {
    id: "guide_poolside",
    slug: "poolside-guide",
    title: "Poolside guide",
    kind: "course_addon",
    stripePriceId: "price_pool",
    active: true,
  },
  {
    id: "analysis_video",
    slug: "video-analysis",
    title: "Video analysis",
    kind: "analysis",
    stripePriceId: "price_analysis",
    active: true,
  },
];

describe("buildLibrarySections", () => {
  it("splits products into owned and explore lists", () => {
    const result = buildLibrarySections(CATALOG, ["guide_0_1000m", "analysis_video"]);
    expect(result.owned.map((product) => product.id)).toEqual(["guide_0_1000m", "analysis_video"]);
    expect(result.explore.map((product) => product.id)).toEqual(["guide_poolside"]);
    expect(result.unknownOwnedProductIds).toEqual([]);
  });

  it("tracks unknown owned ids that are not in catalog", () => {
    const result = buildLibrarySections(CATALOG, ["guide_0_1000m", "custom_product"]);
    expect(result.owned.map((product) => product.id)).toEqual(["guide_0_1000m"]);
    expect(result.unknownOwnedProductIds).toEqual(["custom_product"]);
  });

  it("hides inactive non-owned products from explore while still showing inactive owned", () => {
    const result = buildLibrarySections(
      CATALOG.map((product) =>
        product.id === "guide_poolside" ? { ...product, active: false } : product
      ),
      ["guide_poolside"]
    );

    expect(result.owned.map((product) => product.id)).toEqual(["guide_poolside"]);
    expect(result.explore.map((product) => product.id)).toEqual([
      "guide_0_1000m",
      "analysis_video",
    ]);
  });
});
