import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { getDiscountRedeemedPayload } from "@/lib/stripe/webhook-discount";

type CheckoutSessionTotalDetails = NonNullable<Stripe.Checkout.Session["total_details"]>;

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
      } as CheckoutSessionTotalDetails,
    });

    expect(getDiscountRedeemedPayload(session)).toBeNull();
  });

  it("returns payload when discount amount is present without raw provider ids", () => {
    const session = buildCheckoutSession({
      metadata: {
        fs_product_id: "guide_poolside",
      },
      currency: "usd",
      total_details: {
        amount_discount: 1200,
      } as CheckoutSessionTotalDetails,
    });

    expect(getDiscountRedeemedPayload(session, "guide_poolside")).toEqual({
      productId: "guide_poolside",
      amountDiscount: 1200,
      currency: "usd",
    });
    expect(JSON.stringify(getDiscountRedeemedPayload(session, "guide_poolside"))).not.toContain(
      "cs_test_123"
    );
    expect(getDiscountRedeemedPayload(session)).toEqual({
      productId: null,
      amountDiscount: 1200,
      currency: "usd",
    });
  });
});
