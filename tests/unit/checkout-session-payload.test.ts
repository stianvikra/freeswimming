import { describe, expect, it } from "vitest";
import type { CatalogProduct } from "@/lib/commerce/catalog";
import {
  buildWorkoutContextPlansHref,
  buildCheckoutSessionPayload,
  buildCheckoutStartedAnalyticsPayload,
  resolvePlansCheckoutAttributionForProduct,
} from "@/lib/commerce/checkout";

const product: CatalogProduct = {
  id: "guide_poolside",
  slug: "poolside-guide",
  title: "Poolside guide",
  kind: "course_addon",
  stripePriceId: "price_test_poolside",
  active: true,
};

describe("buildCheckoutSessionPayload", () => {
  it("enables post-purchase invoice creation for one-time Checkout purchases", () => {
    const user = {
      id: "11111111-1111-4111-8111-111111111111",
      email: "swimmer@example.com",
    };
    const payload = buildCheckoutSessionPayload({
      appUrl: "https://freeswimming.example",
      cancelPath: "/my-library",
      product,
      user,
    });

    expect(payload).toMatchObject({
      mode: "payment",
      customer_creation: "always",
      allow_promotion_codes: true,
      success_url: "https://freeswimming.example/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://freeswimming.example/my-library",
      line_items: [{ price: "price_test_poolside", quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
    });
    expect(payload.metadata).toEqual({
      fs_product_id: "guide_poolside",
      fs_product_slug: "poolside-guide",
      fs_product_kind: "course_addon",
      fs_user_id: user.id,
    });
    expect(payload.invoice_creation).toEqual({
      enabled: true,
      invoice_data: {
        metadata: payload.metadata,
      },
    });
  });

  it("falls back to a local cancel path and omits absent user fields", () => {
    const payload = buildCheckoutSessionPayload({
      appUrl: "https://freeswimming.example",
      cancelPath: "https://evil.example/return",
      product,
      user: null,
    });

    expect(payload.cancel_url).toBe("https://freeswimming.example/programs");
    expect(payload).not.toHaveProperty("client_reference_id");
    expect(payload).not.toHaveProperty("customer_email");
    expect(payload.metadata).toEqual({
      fs_product_id: "guide_poolside",
      fs_product_slug: "poolside-guide",
      fs_product_kind: "course_addon",
    });
  });
});

describe("buildCheckoutStartedAnalyticsPayload", () => {
  it("keeps mapped low-cardinality checkout attribution", () => {
    expect(
      buildCheckoutStartedAnalyticsPayload({
        productId: "guide_poolside",
        source: "workout_context",
        placementId: "workout_saved_post_success",
      })
    ).toEqual({
      productId: "guide_poolside",
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });
  });

  it("falls back for unknown source and excludes unrelated placement values", () => {
    expect(
      buildCheckoutStartedAnalyticsPayload({
        productId: "guide_poolside",
        source: "https://evil.example/checkout?token=secret",
        placementId: "future_unmapped_placement",
      })
    ).toEqual({
      productId: "guide_poolside",
      source: "unknown",
    });
  });

  it("does not attach workout placement outside workout-context attribution", () => {
    expect(
      buildCheckoutStartedAnalyticsPayload({
        productId: "guide_poolside",
        source: "plans",
        placementId: "workout_saved_post_success",
      })
    ).toEqual({
      productId: "guide_poolside",
      source: "plans",
    });
  });
});

describe("workout-context plans checkout attribution bridge", () => {
  it("builds the mapped plans href without private workout data", () => {
    const href = buildWorkoutContextPlansHref();

    expect(href).toBe(
      "/plans?source=workout_context&placementId=workout_saved_post_success&productId=guide_poolside#plans-comparison-heading"
    );
    expect(href).not.toContain("workout-");
    expect(href).not.toContain("session");
    expect(href).not.toContain("email");
  });

  it("maps checkout attribution only for the approved plans source placement and product", () => {
    expect(
      resolvePlansCheckoutAttributionForProduct({
        productId: "guide_poolside",
        searchParams: {
          source: "workout_context",
          placementId: "workout_saved_post_success",
          productId: "guide_poolside",
        },
      })
    ).toEqual({
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });
  });

  it("falls back to generic plans attribution for unrelated products and future values", () => {
    expect(
      resolvePlansCheckoutAttributionForProduct({
        productId: "guide_0_1000m",
        searchParams: {
          source: "workout_context",
          placementId: "workout_saved_post_success",
          productId: "guide_poolside",
        },
      })
    ).toEqual({ source: "plans" });

    expect(
      resolvePlansCheckoutAttributionForProduct({
        productId: "guide_poolside",
        searchParams: {
          source: "future_shop",
          placementId: "future_placement",
          productId: "future_product",
        },
      })
    ).toEqual({ source: "plans" });
  });

  it("accepts URLSearchParams and ignores duplicated raw values beyond the first safe value", () => {
    const searchParams = new URLSearchParams();
    searchParams.append("source", "workout_context");
    searchParams.append("source", "https://evil.example/source");
    searchParams.append("placementId", "workout_saved_post_success");
    searchParams.append("productId", "guide_poolside");

    expect(
      resolvePlansCheckoutAttributionForProduct({
        productId: "guide_poolside",
        searchParams,
      })
    ).toEqual({
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });
  });
});
