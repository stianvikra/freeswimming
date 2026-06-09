import type { AnalyticsEventName } from "@/lib/analytics/events";

export const PUBLIC_ROUTE_CATEGORIES = [
  "marketing",
  "pricing",
  "product_detail",
  "shop",
  "course_landing",
  "guide_landing",
  "support",
  "legal",
  "checkout",
  "auth",
  "unavailable_redirect",
] as const;

export type PublicRouteCategory = (typeof PUBLIC_ROUTE_CATEGORIES)[number];

type PublicRouteStatus = "active" | "future";

export type PublicRouteRegistration = {
  template: string;
  category: PublicRouteCategory;
  label: string;
  status: PublicRouteStatus;
};

export type PublicRouteAnalytics = PublicRouteRegistration & {
  countable: boolean;
};

export const UNKNOWN_PUBLIC_ROUTE: PublicRouteAnalytics = {
  template: "unknown_public_surface",
  category: "marketing",
  label: "Unknown public surface / not counted",
  status: "future",
  countable: false,
};

export const PUBLIC_ROUTE_ANALYTICS_REGISTRY: PublicRouteRegistration[] = [
  { template: "/", category: "marketing", label: "Home", status: "active" },
  { template: "/our-method", category: "marketing", label: "Our method", status: "active" },
  { template: "/programs", category: "marketing", label: "Programs", status: "active" },
  { template: "/analysis", category: "marketing", label: "Analysis", status: "active" },
  { template: "/course", category: "course_landing", label: "Free course", status: "active" },
  {
    template: "/guides/0-1000m",
    category: "guide_landing",
    label: "0-1000m guide",
    status: "active",
  },
  {
    template: "/guides/poolside",
    category: "guide_landing",
    label: "Poolside guide",
    status: "active",
  },
  { template: "/plans", category: "pricing", label: "Plans", status: "active" },
  {
    template: "/checkout/success",
    category: "checkout",
    label: "Checkout success",
    status: "active",
  },
  { template: "/contact", category: "support", label: "Contact", status: "active" },
  { template: "/privacy", category: "legal", label: "Privacy policy", status: "active" },
  { template: "/cookies", category: "legal", label: "Cookie policy", status: "active" },
  { template: "/claim", category: "support", label: "Claim purchase", status: "active" },
  { template: "/auth/sign-in", category: "auth", label: "Sign in", status: "active" },
  {
    template: "/go/unavailable",
    category: "unavailable_redirect",
    label: "Unavailable redirect",
    status: "active",
  },
  {
    template: "/shop/[productSlug]",
    category: "shop",
    label: "Shop product",
    status: "future",
  },
];

export const PUBLIC_ANALYTICS_VENDOR_DECISION = {
  status: "not_activated",
  preferredVendor: "plausible",
  fallbackVendor: "simple_analytics",
  rationale:
    "Plausible is the first candidate for privacy-first public analytics, but no third-party analytics script is activated until owner approval, processor/privacy review, and policy evidence are complete.",
  checkedAt: "2026-06-09",
  officialReferences: [
    "https://plausible.io/docs/",
    "https://plausible.io/data-policy",
    "https://plausible.io/docs/custom-locations",
    "https://plausible.io/docs/custom-props/introduction",
    "https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/",
    "https://nkom.no/internett/informasjonskapsler-cookies",
  ],
} as const;

export const DISALLOWED_PUBLIC_ANALYTICS_VENDORS = [
  "meta_pixel",
  "meta_conversions_api",
  "ga4",
  "google_tag_manager",
  "hotjar",
  "clarity",
  "session_replay",
  "heatmaps",
] as const;

const PUBLIC_CLIENT_AGGREGATE_EVENTS = new Set<AnalyticsEventName>([
  "public_page_viewed",
  "public_cta_clicked",
  "product_viewed",
  "plans_viewed",
]);

const PUBLIC_SOURCE_VALUES = new Set(["public", "landing", "plans", "checkout_success"]);
const ALLOWED_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;

const PRODUCT_ID_PATTERN = /^[a-z0-9][a-z0-9_:-]{1,80}$/;
const PRODUCT_TYPE_PATTERN = /^[a-z][a-z0-9_:-]{1,60}$/;
const UNSAFE_VALUE_PATTERN =
  /(@|https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b|bearer\s+|eyJ[a-zA-Z0-9_-]+\.)/i;

type PublicProductInput = {
  productId?: string | null;
  productType?: string | null;
  sku?: string | null;
  priceId?: string | null;
};

type PublicProductAnalytics = {
  productId: string;
  productType: string;
  sku: string | null;
  priceId: string | null;
  label: string;
  countable: boolean;
};

export const UNKNOWN_PRODUCT_ANALYTICS: PublicProductAnalytics = {
  productId: "unknown_product_not_counted",
  productType: "unknown",
  sku: null,
  priceId: null,
  label: "Unknown product / not counted",
  countable: false,
};

function toPathname(value: string): string {
  try {
    return new URL(value, "https://freeswimming.org").pathname || "/";
  } catch {
    return "/";
  }
}

function normalizePathname(value: string): string {
  const pathname = toPathname(value).replace(/\/+$/, "");
  return pathname === "" ? "/" : pathname;
}

function normalizeQueryValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || UNSAFE_VALUE_PATTERN.test(trimmed)) return undefined;
  return trimmed.slice(0, 120);
}

function normalizeProductDimension(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized || UNSAFE_VALUE_PATTERN.test(normalized)) return null;
  return normalized.slice(0, 120);
}

export function getPublicRouteAnalytics(pathnameOrUrl: string): PublicRouteAnalytics {
  const pathname = normalizePathname(pathnameOrUrl);
  const exactMatch = PUBLIC_ROUTE_ANALYTICS_REGISTRY.find(
    (registration) => registration.template === pathname
  );

  if (exactMatch) {
    return { ...exactMatch, countable: true };
  }

  if (/^\/shop\/[^/?#]+$/.test(pathname)) {
    const shopTemplate = PUBLIC_ROUTE_ANALYTICS_REGISTRY.find(
      (registration) => registration.template === "/shop/[productSlug]"
    );
    return shopTemplate ? { ...shopTemplate, countable: true } : UNKNOWN_PUBLIC_ROUTE;
  }

  return UNKNOWN_PUBLIC_ROUTE;
}

export function getAllowlistedPublicQueryParams(
  searchParams: URLSearchParams | string | Record<string, string | null | undefined>
): Record<(typeof ALLOWED_QUERY_KEYS)[number], string | undefined> {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams.startsWith("?") ? searchParams : `?${searchParams}`)
      : searchParams instanceof URLSearchParams
        ? searchParams
        : new URLSearchParams(
            Object.entries(searchParams).flatMap(([key, value]) => (value ? [[key, value]] : []))
          );

  return ALLOWED_QUERY_KEYS.reduce(
    (acc, key) => {
      acc[key] = normalizeQueryValue(params.get(key));
      return acc;
    },
    {} as Record<(typeof ALLOWED_QUERY_KEYS)[number], string | undefined>
  );
}

export function getPublicProductAnalytics(input: PublicProductInput | null | undefined) {
  const productId = normalizeProductDimension(input?.productId);
  const productType = normalizeProductDimension(input?.productType);

  if (
    !productId ||
    !productType ||
    !PRODUCT_ID_PATTERN.test(productId) ||
    !PRODUCT_TYPE_PATTERN.test(productType)
  ) {
    return UNKNOWN_PRODUCT_ANALYTICS;
  }

  return {
    productId,
    productType,
    sku: normalizeProductDimension(input?.sku),
    priceId: normalizeProductDimension(input?.priceId),
    label: productId,
    countable: true,
  };
}

export function buildPublicRoutePayload(pathnameOrUrl: string, searchParams: string = "") {
  const route = getPublicRouteAnalytics(pathnameOrUrl);
  return {
    routeTemplate: route.template,
    routeCategory: route.category,
    routeStatus: route.status,
    routeCountable: route.countable,
    ...getAllowlistedPublicQueryParams(searchParams),
  };
}

export function buildPublicProductPayload(input: PublicProductInput | null | undefined) {
  const product = getPublicProductAnalytics(input);
  return {
    productId: product.productId,
    productType: product.productType,
    sku: product.sku,
    priceId: product.priceId,
    productCountable: product.countable,
  };
}

export function shouldAttachUserIdToClientAnalyticsEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> | undefined
): boolean {
  if (PUBLIC_CLIENT_AGGREGATE_EVENTS.has(eventName)) {
    return false;
  }

  const source = typeof payload?.source === "string" ? payload.source : null;
  const surface = typeof payload?.surface === "string" ? payload.surface : null;

  if (
    (source && PUBLIC_SOURCE_VALUES.has(source)) ||
    (surface && PUBLIC_SOURCE_VALUES.has(surface))
  ) {
    return false;
  }

  if (typeof payload?.routeTemplate === "string" || typeof payload?.routeCategory === "string") {
    return false;
  }

  return true;
}

export function getApprovedPublicAnalyticsScript(): null {
  return null;
}
