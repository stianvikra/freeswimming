import type Stripe from "stripe";

export type DiscountRedeemedPayload = {
  sessionId: string;
  productId: string | null;
  amountDiscount: number;
  currency: string | null;
};

export function getDiscountRedeemedPayload(
  session: Stripe.Checkout.Session
): DiscountRedeemedPayload | null {
  const amountDiscount = session.total_details?.amount_discount ?? 0;
  if (amountDiscount <= 0) return null;

  return {
    sessionId: session.id,
    productId: session.metadata?.fs_product_id ?? null,
    amountDiscount,
    currency: session.currency ?? null,
  };
}
