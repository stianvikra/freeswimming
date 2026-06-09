import { describe, expect, it } from "vitest";
import {
  buildPublicProductPayload,
  buildPublicRoutePayload,
  DISALLOWED_PUBLIC_ANALYTICS_VENDORS,
  getAllowlistedPublicQueryParams,
  getApprovedPublicAnalyticsScript,
  getPublicProductAnalytics,
  getPublicRouteAnalytics,
  PUBLIC_ANALYTICS_VENDOR_DECISION,
} from "@/lib/analytics/public";

describe("public analytics foundation", () => {
  it("classifies current public routes and future shop routes by safe templates", () => {
    expect(getPublicRouteAnalytics("/plans?utm_source=Newsletter")).toMatchObject({
      template: "/plans",
      category: "pricing",
      countable: true,
    });
    expect(
      getPublicRouteAnalytics("https://freeswimming.org/shop/swim-mug?email=a@b.test")
    ).toMatchObject({
      template: "/shop/[productSlug]",
      category: "shop",
      status: "future",
      countable: true,
    });
    expect(getPublicRouteAnalytics("/unmapped/private-ish/path")).toMatchObject({
      template: "unknown_public_surface",
      label: "Unknown public surface / not counted",
      countable: false,
    });
  });

  it("keeps only allowlisted public source fields and drops unsafe values", () => {
    expect(
      getAllowlistedPublicQueryParams({
        utm_source: "newsletter",
        utm_campaign: "spring launch",
        ref: "https://tracker.example/?email=swimmer@example.com",
        ignored: "raw",
      })
    ).toMatchObject({
      utm_source: "newsletter",
      utm_campaign: "spring launch",
      ref: undefined,
    });
  });

  it("builds public route payloads without raw URLs or arbitrary params", () => {
    expect(
      buildPublicRoutePayload("/shop/swim-mug", "?utm_source=mail&token=secret")
    ).toMatchObject({
      routeTemplate: "/shop/[productSlug]",
      routeCategory: "shop",
      routeStatus: "future",
      routeCountable: true,
      utm_source: "mail",
    });
  });

  it("counts future products only through canonical safe dimensions", () => {
    expect(
      getPublicProductAnalytics({
        productId: "swim_mug",
        productType: "merchandise",
        sku: "mug-blue",
        priceId: "price_swim_mug",
      })
    ).toMatchObject({
      productId: "swim_mug",
      productType: "merchandise",
      sku: "mug-blue",
      priceId: "price_swim_mug",
      countable: true,
    });

    expect(
      buildPublicProductPayload({
        productId: "Email: swimmer@example.com",
        productType: "merchandise",
      })
    ).toMatchObject({
      productId: "unknown_product_not_counted",
      productType: "unknown",
      productCountable: false,
    });
  });

  it("keeps public vendor activation off while documenting Plausible-first evaluation", () => {
    expect(PUBLIC_ANALYTICS_VENDOR_DECISION).toMatchObject({
      status: "not_activated",
      preferredVendor: "plausible",
      fallbackVendor: "simple_analytics",
      checkedAt: "2026-06-09",
    });
    expect(DISALLOWED_PUBLIC_ANALYTICS_VENDORS).toEqual(
      expect.arrayContaining(["meta_pixel", "ga4", "google_tag_manager", "hotjar", "clarity"])
    );
    expect(getApprovedPublicAnalyticsScript()).toBeNull();
  });
});
