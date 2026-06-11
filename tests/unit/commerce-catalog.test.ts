import { describe, expect, it } from "vitest";
import {
  getCatalogProductById,
  getCatalogProductByStripePriceId,
  getCatalogProducts,
  getCatalogProductsWithAvailability,
} from "@/lib/commerce/catalog";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";
import { isWorkoutContextCtaProductAvailable } from "@/lib/commerce/workout-context-cta";

const ENV: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  STRIPE_PRICE_ID_0_1000M_GUIDE: "price_1000",
  STRIPE_PRICE_ID_POOLSIDE_GUIDE: "price_poolside",
  STRIPE_PRICE_ID_ANALYSIS: "price_analysis",
};

describe("commerce catalog", () => {
  it("builds products from environment price ids", () => {
    const products = getCatalogProducts(ENV);
    expect(products).toHaveLength(3);
    expect(products.map((product) => product.id)).toEqual([
      "guide_0_1000m",
      "guide_poolside",
      "analysis_video",
    ]);
    expect(products.every((product) => product.active)).toBe(true);
  });

  it("looks up products by id and by stripe price id", () => {
    expect(getCatalogProductById("guide_poolside", ENV)?.stripePriceId).toBe("price_poolside");
    expect(getCatalogProductByStripePriceId("price_analysis", ENV)?.id).toBe("analysis_video");
    expect(getCatalogProductById("unknown", ENV)).toBeNull();
    expect(getCatalogProductByStripePriceId("price_unknown", ENV)).toBeNull();
  });

  it("throws when required price ids are missing", () => {
    expect(() => getCatalogProducts({} as unknown as NodeJS.ProcessEnv)).toThrow(
      "Missing required environment variable: STRIPE_PRICE_ID_0_1000M_GUIDE"
    );
  });

  it("returns per-product availability without throwing", () => {
    const partialEnv: NodeJS.ProcessEnv = {
      NODE_ENV: "test",
      STRIPE_PRICE_ID_0_1000M_GUIDE: "price_1000",
      STRIPE_PRICE_ID_ANALYSIS: "price_analysis",
    };

    const availability = getCatalogProductsWithAvailability(partialEnv);
    expect(availability).toHaveLength(3);
    expect(availability.map((product) => product.id)).toEqual([
      "guide_0_1000m",
      "guide_poolside",
      "analysis_video",
    ]);
    expect(availability.find((product) => product.id === "guide_0_1000m")).toMatchObject({
      active: true,
      available: true,
      stripePriceId: "price_1000",
      missingEnvVar: null,
    });
    expect(availability.find((product) => product.id === "guide_poolside")).toMatchObject({
      active: true,
      available: false,
      stripePriceId: null,
      missingEnvVar: "STRIPE_PRICE_ID_POOLSIDE_GUIDE",
    });
    expect(availability.find((product) => product.id === "analysis_video")).toMatchObject({
      active: true,
      available: true,
      stripePriceId: "price_analysis",
      missingEnvVar: null,
    });
  });

  it("applies DB title/active overrides to availability output", () => {
    const overrides = buildCatalogOverridesFromRows([
      {
        id: "guide_poolside",
        slug: "poolside-guide",
        title: "Poolside Pro",
        kind: "course_addon",
        active: false,
      },
    ]);

    const availability = getCatalogProductsWithAvailability(ENV, overrides);
    expect(availability.find((product) => product.id === "guide_poolside")).toMatchObject({
      title: "Poolside Pro",
      active: false,
      available: false,
      missingEnvVar: null,
    });
  });

  it("fails the workout-context CTA closed when the mapped product is unavailable", () => {
    expect(isWorkoutContextCtaProductAvailable(ENV)).toBe(true);
    expect(
      isWorkoutContextCtaProductAvailable({
        NODE_ENV: "test",
        STRIPE_PRICE_ID_0_1000M_GUIDE: "price_1000",
        STRIPE_PRICE_ID_ANALYSIS: "price_analysis",
      })
    ).toBe(false);
    expect(
      isWorkoutContextCtaProductAvailable(
        ENV,
        buildCatalogOverridesFromRows([
          {
            id: "guide_poolside",
            slug: "poolside-guide",
            title: "Poolside guide",
            kind: "course_addon",
            active: false,
          },
        ])
      )
    ).toBe(false);
  });
});
