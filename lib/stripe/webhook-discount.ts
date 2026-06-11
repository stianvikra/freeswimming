import type Stripe from "stripe";

export type DiscountRedeemedPayload = {
  productId: string | null;
  amountDiscount: number;
  currency: string | null;
};

export function getDiscountRedeemedPayload(
  session: Stripe.Checkout.Session,
  productId: string | null = null
): DiscountRedeemedPayload | null {
  const amountDiscount = session.total_details?.amount_discount ?? 0;
  if (amountDiscount <= 0) return null;

  return {
    productId,
    amountDiscount,
    currency: session.currency ?? null,
  };
}
