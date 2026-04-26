import type Stripe from "stripe";
import type { CatalogProduct } from "@/lib/commerce/catalog";

type CheckoutUser = {
  id?: string | null;
  email?: string | null;
};

type BuildCheckoutSessionPayloadInput = {
  appUrl: string;
  cancelPath?: string;
  product: CatalogProduct;
  user?: CheckoutUser | null;
};

export function getSafeCheckoutCancelPath(input: string | undefined, fallback = "/programs") {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}

export function getCheckoutSuccessUrl(origin: string) {
  const successUrl = new URL("/checkout/success", origin).toString();
  return `${successUrl}?session_id={CHECKOUT_SESSION_ID}`;
}

function buildCheckoutMetadata(
  product: CatalogProduct,
  user?: CheckoutUser | null
): Stripe.MetadataParam {
  return {
    fs_product_id: product.id,
    fs_product_slug: product.slug,
    fs_product_kind: product.kind,
    ...(user?.id ? { fs_user_id: user.id } : {}),
  };
}

export function buildCheckoutSessionPayload({
  appUrl,
  cancelPath,
  product,
  user,
}: BuildCheckoutSessionPayloadInput): Stripe.Checkout.SessionCreateParams {
  const metadata = buildCheckoutMetadata(product, user);

  return {
    mode: "payment",
    customer_creation: "always",
    allow_promotion_codes: true,
    success_url: getCheckoutSuccessUrl(appUrl),
    cancel_url: new URL(getSafeCheckoutCancelPath(cancelPath), appUrl).toString(),
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    metadata,
    invoice_creation: {
      enabled: true,
      invoice_data: {
        metadata,
      },
    },
    ...(user?.id ? { client_reference_id: user.id } : {}),
    ...(user?.email ? { customer_email: user.email } : {}),
  };
}
