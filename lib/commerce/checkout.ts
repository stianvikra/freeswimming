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

export const CHECKOUT_ATTRIBUTION_METADATA_KEYS = {
  source: "fs_attribution_source",
  placementId: "fs_attribution_placement_id",
  productId: "fs_attribution_product_id",
} as const;

export const CHECKOUT_CANCEL_REASON = "checkout_cancelled" as const;
export const WORKOUT_CONTEXT_CHECKOUT_CANCEL_SURFACE = "plans_checkout_return" as const;

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

export type MappedCheckoutAttribution = typeof WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION;

export type WorkoutContextCheckoutCancelAttribution = MappedCheckoutAttribution & {
  surface: typeof WORKOUT_CONTEXT_CHECKOUT_CANCEL_SURFACE;
  reason: typeof CHECKOUT_CANCEL_REASON;
};

export type CheckoutAttributionAnalyticsPayload = {
  productId: CatalogProductId;
  source: MappedCheckoutAttribution["source"];
  placementId: MappedCheckoutAttribution["placementId"];
};

type CheckoutUser = {
  id?: string | null;
  email?: string | null;
};

type BuildCheckoutSessionPayloadInput = {
  appUrl: string;
  cancelPath?: string;
  product: CatalogProduct;
  checkoutAttribution?: MappedCheckoutAttribution | null;
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

export function buildMappedCheckoutAttribution(input: {
  productId: CatalogProductId;
  source?: unknown;
  placementId?: unknown;
}): MappedCheckoutAttribution | null {
  const source = normalizeCheckoutAttributionSource(input.source);
  const placementId = normalizeCheckoutAttributionPlacementId(input.placementId);

  if (
    source === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source &&
    placementId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId &&
    input.productId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId
  ) {
    return WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION;
  }

  return null;
}

export function buildWorkoutContextCheckoutCancelAttribution(input: {
  productId: unknown;
  source?: unknown;
  placementId?: unknown;
}): WorkoutContextCheckoutCancelAttribution | null {
  const productId = normalizeCatalogProductId(input.productId);
  if (!productId) return null;

  const attribution = buildMappedCheckoutAttribution({
    productId,
    source: input.source,
    placementId: input.placementId,
  });

  if (!attribution) return null;

  return {
    ...attribution,
    surface: WORKOUT_CONTEXT_CHECKOUT_CANCEL_SURFACE,
    reason: CHECKOUT_CANCEL_REASON,
  };
}

export function parseWorkoutContextCheckoutCancelAttribution(input: {
  productId: unknown;
  source?: unknown;
  placementId?: unknown;
  surface?: unknown;
  reason?: unknown;
}): WorkoutContextCheckoutCancelAttribution | null {
  if (input.surface !== WORKOUT_CONTEXT_CHECKOUT_CANCEL_SURFACE) return null;
  if (input.reason !== CHECKOUT_CANCEL_REASON) return null;

  return buildWorkoutContextCheckoutCancelAttribution({
    productId: input.productId,
    source: input.source,
    placementId: input.placementId,
  });
}

export function buildCheckoutAttributionMetadata(
  attribution?: MappedCheckoutAttribution | null
): Stripe.MetadataParam {
  if (!attribution) return {};

  return {
    [CHECKOUT_ATTRIBUTION_METADATA_KEYS.source]: attribution.source,
    [CHECKOUT_ATTRIBUTION_METADATA_KEYS.placementId]: attribution.placementId,
    [CHECKOUT_ATTRIBUTION_METADATA_KEYS.productId]: attribution.productId,
  };
}

export function getMappedCheckoutAttributionFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
  actualProductId: CatalogProductId | null | undefined
): MappedCheckoutAttribution | null {
  if (!actualProductId) return null;

  const metadataProductId = normalizeCatalogProductId(
    metadata?.[CHECKOUT_ATTRIBUTION_METADATA_KEYS.productId]
  );

  if (metadataProductId !== actualProductId) return null;

  return buildMappedCheckoutAttribution({
    productId: actualProductId,
    source: metadata?.[CHECKOUT_ATTRIBUTION_METADATA_KEYS.source],
    placementId: metadata?.[CHECKOUT_ATTRIBUTION_METADATA_KEYS.placementId],
  });
}

export function buildCheckoutAttributionAnalyticsPayload(
  attribution?: MappedCheckoutAttribution | null
): CheckoutAttributionAnalyticsPayload | Record<string, never> {
  if (!attribution) return {};

  return {
    productId: attribution.productId,
    source: attribution.source,
    placementId: attribution.placementId,
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
  user?: CheckoutUser | null,
  checkoutAttribution?: MappedCheckoutAttribution | null
): Stripe.MetadataParam {
  return {
    fs_product_id: product.id,
    fs_product_slug: product.slug,
    fs_product_kind: product.kind,
    ...buildCheckoutAttributionMetadata(checkoutAttribution),
    ...(user?.id ? { fs_user_id: user.id } : {}),
  };
}

export function buildCheckoutSessionPayload({
  appUrl,
  cancelPath,
  product,
  checkoutAttribution,
  user,
}: BuildCheckoutSessionPayloadInput): Stripe.Checkout.SessionCreateParams {
  const metadata = buildCheckoutMetadata(product, user, checkoutAttribution);

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
