import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { getDiscountRedeemedPayload } from "@/lib/stripe/webhook-discount";

function buildCheckoutSession(input: Partial<Stripe.Checkout.Session>): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    object: "checkout.session",
    mode: "payment",
    ...input,
  } as Stripe.Checkout.Session;
}

describe("getDiscountRedeemedPayload", () => {
  it("returns null when session has no discount", () => {
    const session = buildCheckoutSession({
      total_details: {
        amount_discount: 0,
      } as Stripe.Checkout.Session.TotalDetails,
    });

    expect(getDiscountRedeemedPayload(session)).toBeNull();
  });

  it("returns payload when discount amount is present", () => {
    const session = buildCheckoutSession({
      metadata: {
        fs_product_id: "guide_poolside",
      },
      currency: "usd",
      total_details: {
        amount_discount: 1200,
      } as Stripe.Checkout.Session.TotalDetails,
    });

    expect(getDiscountRedeemedPayload(session)).toEqual({
      sessionId: "cs_test_123",
      productId: "guide_poolside",
      amountDiscount: 1200,
      currency: "usd",
    });
  });
});
