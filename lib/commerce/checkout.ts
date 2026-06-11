import type Stripe from "stripe";
import {
  isCatalogProductId,
  type CatalogProduct,
  type CatalogProductId,
} from "@/lib/commerce/catalog";

export const CHECKOUT_ATTRIBUTION_SOURCES = [
  "plans",
  "library_explore",
  "workout_context",
] as const;

export const CHECKOUT_ATTRIBUTION_PLACEMENT_IDS = ["workout_saved_post_success"] as const;

export const WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION = {
  source: "workout_context",
  placementId: "workout_saved_post_success",
  productId: "guide_poolside",
} as const satisfies {
  source: (typeof CHECKOUT_ATTRIBUTION_SOURCES)[number];
  placementId: (typeof CHECKOUT_ATTRIBUTION_PLACEMENT_IDS)[number];
  productId: CatalogProductId;
};

export type CheckoutAttributionSource = (typeof CHECKOUT_ATTRIBUTION_SOURCES)[number] | "unknown";
export type CheckoutAttributionPlacementId = (typeof CHECKOUT_ATTRIBUTION_PLACEMENT_IDS)[number];
export type CheckoutAttributionSearchParams =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined>>
  | null
  | undefined;

export type PlansCheckoutAttribution = {
  source: CheckoutAttributionSource;
  placementId?: CheckoutAttributionPlacementId;
};

export type CheckoutStartedAnalyticsPayload = {
  productId: CatalogProductId;
  source: CheckoutAttributionSource;
  placementId?: CheckoutAttributionPlacementId;
};

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

const CHECKOUT_ATTRIBUTION_SOURCE_SET = new Set<string>(CHECKOUT_ATTRIBUTION_SOURCES);
const CHECKOUT_ATTRIBUTION_PLACEMENT_ID_SET = new Set<string>(CHECKOUT_ATTRIBUTION_PLACEMENT_IDS);

function getSearchParamValue(input: CheckoutAttributionSearchParams, key: string): string | null {
  if (!input) return null;
  if (input instanceof URLSearchParams) return input.get(key);

  const value = input[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeCatalogProductId(value: unknown): CatalogProductId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return isCatalogProductId(normalized) ? normalized : null;
}

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

export function normalizeCheckoutAttributionSource(value: unknown): CheckoutAttributionSource {
  if (typeof value !== "string") return "unknown";
  const normalized = value.trim();
  return CHECKOUT_ATTRIBUTION_SOURCE_SET.has(normalized)
    ? (normalized as CheckoutAttributionSource)
    : "unknown";
}

export function normalizeCheckoutAttributionPlacementId(
  value: unknown
): CheckoutAttributionPlacementId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return CHECKOUT_ATTRIBUTION_PLACEMENT_ID_SET.has(normalized)
    ? (normalized as CheckoutAttributionPlacementId)
    : null;
}

export function buildCheckoutStartedAnalyticsPayload(input: {
  productId: CatalogProductId;
  source?: unknown;
  placementId?: unknown;
}): CheckoutStartedAnalyticsPayload {
  const source = normalizeCheckoutAttributionSource(input.source);
  const placementId = normalizeCheckoutAttributionPlacementId(input.placementId);

  return {
    productId: input.productId,
    source,
    ...(source === "workout_context" && placementId ? { placementId } : {}),
  };
}

export function buildWorkoutContextPlansHref() {
  const params = new URLSearchParams({
    source: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source,
    placementId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId,
    productId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId,
  });

  return `/plans?${params.toString()}#plans-comparison-heading`;
}

export function resolvePlansCheckoutAttributionForProduct(input: {
  productId: CatalogProductId;
  searchParams?: CheckoutAttributionSearchParams;
}): PlansCheckoutAttribution {
  const source = normalizeCheckoutAttributionSource(
    getSearchParamValue(input.searchParams, "source")
  );
  const placementId = normalizeCheckoutAttributionPlacementId(
    getSearchParamValue(input.searchParams, "placementId")
  );
  const requestedProductId = normalizeCatalogProductId(
    getSearchParamValue(input.searchParams, "productId")
  );

  if (
    source === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source &&
    placementId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId &&
    requestedProductId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId &&
    input.productId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId
  ) {
    return {
      source: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source,
      placementId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId,
    };
  }

  return { source: "plans" };
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
