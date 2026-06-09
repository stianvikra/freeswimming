import type { AnalyticsInsightsResponse } from "@/lib/analytics/admin-insights";

export const ANALYTICS_DASHBOARD_RANGE_OPTIONS = [7, 30, 90] as const;
export const ANALYTICS_DASHBOARD_DEFAULT_RANGE_DAYS = 30;
export const ANALYTICS_DASHBOARD_FRESH_WINDOW_HOURS = 48;

export type AnalyticsDashboardRangeDays = (typeof ANALYTICS_DASHBOARD_RANGE_OPTIONS)[number];

export type AnalyticsInsightsSchemaMissingResponse = {
  ok: true;
  schemaReady: false;
  warning?: string;
  generatedAt?: string;
  rangeDays: number;
  items?: unknown[];
};

export type AnalyticsInsightsErrorResponse = {
  ok: false;
  error?: string;
};

export type AnalyticsDashboardPayload =
  | AnalyticsInsightsResponse
  | AnalyticsInsightsSchemaMissingResponse;

export type AnalyticsDashboardApiResponse =
  | AnalyticsDashboardPayload
  | AnalyticsInsightsErrorResponse;

export type AnalyticsDashboardTrustState =
  | "fresh"
  | "quiet"
  | "capped"
  | "schema-missing"
  | "no-data";

export type AnalyticsDashboardMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type AnalyticsDashboardListItem = {
  key: string;
  label: string;
  secondary: string | null;
  count: string;
};

export type AnalyticsDashboardFunnelStep = {
  id: string;
  label: string;
  count: string;
  value: number;
  percentOfMax: number;
  detail: string;
};

export type AnalyticsDashboardViewModel = {
  state: AnalyticsDashboardTrustState;
  stateLabel: string;
  stateDetail: string;
  rangeLabel: string;
  generatedAtLabel: string;
  lastEventLabel: string;
  rowCapLabel: string;
  metrics: AnalyticsDashboardMetric[];
  funnel: AnalyticsDashboardFunnelStep[];
  eventItems: AnalyticsDashboardListItem[];
  routeItems: AnalyticsDashboardListItem[];
  productItems: AnalyticsDashboardListItem[];
  caveats: string[];
};

const countFormatter = new Intl.NumberFormat("en-US");

const EVENT_LABELS: Record<string, string> = {
  checkout_completed: "Checkout completed",
  checkout_started: "Checkout started",
  entitlement_granted: "Entitlement granted",
  plans_viewed: "Plans viewed",
  product_viewed: "Product viewed",
  public_cta_clicked: "Public CTA clicked",
  public_page_viewed: "Public page viewed",
};

export function normalizeAnalyticsDashboardRangeDays(value: number): AnalyticsDashboardRangeDays {
  return ANALYTICS_DASHBOARD_RANGE_OPTIONS.includes(value as AnalyticsDashboardRangeDays)
    ? (value as AnalyticsDashboardRangeDays)
    : ANALYTICS_DASHBOARD_DEFAULT_RANGE_DAYS;
}

function isSchemaMissingPayload(
  payload: AnalyticsDashboardPayload
): payload is AnalyticsInsightsSchemaMissingResponse {
  return payload.schemaReady === false;
}

export function formatAnalyticsCount(value: number | null | undefined): string {
  if (!Number.isFinite(value ?? Number.NaN) || (value ?? 0) < 0) return "0";
  return countFormatter.format(value ?? 0);
}

export function formatAnalyticsPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Not counted";
  return `${Math.round(value * 100)}%`;
}

function formatUtcTime(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(
    2,
    "0"
  )}`;
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function formatAnalyticsTimestamp(
  isoValue: string | null | undefined,
  now: Date = new Date()
): string {
  if (!isoValue) return "No event yet";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const dayDiff = Math.floor((startOfUtcDay(now) - startOfUtcDay(date)) / (24 * 60 * 60 * 1000));
  if (dayDiff === 0) return `Today ${formatUtcTime(date)}`;
  if (dayDiff === 1) return `Yesterday ${formatUtcTime(date)}`;
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  return `${date.toISOString().slice(0, 10)} ${formatUtcTime(date)}`;
}

function isSafeAnalyticsIdentifier(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.length > 120) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return false;
  return /^[a-zA-Z0-9_./:-]+$/.test(value);
}

function titleCaseWords(value: string): string {
  return value
    .replace(/^\/+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatAnalyticsIdentifierLabel(
  value: string | null | undefined,
  fallback: "event" | "route" | "product"
): { label: string; secondary: string | null; key: string } {
  if (!isSafeAnalyticsIdentifier(value)) {
    const label =
      fallback === "event"
        ? "Unknown event"
        : fallback === "route"
          ? "Unknown route"
          : "Unknown product";
    return { label, secondary: null, key: label };
  }

  if (fallback === "event") {
    return {
      label: EVENT_LABELS[value] ?? titleCaseWords(value),
      secondary: value,
      key: value,
    };
  }

  if (fallback === "route") {
    return {
      label: value,
      secondary: value.startsWith("/") ? "Route template" : "Route",
      key: value,
    };
  }

  return {
    label: titleCaseWords(value),
    secondary: value,
    key: value,
  };
}

function getFreshnessHours(lastEventAt: string | null, now: Date): number | null {
  if (!lastEventAt) return null;
  const date = new Date(lastEventAt);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, (now.getTime() - date.getTime()) / (60 * 60 * 1000));
}

function buildListItems(
  items: Array<{
    key: string;
    count: number;
    category?: string | null;
    productType?: string | null;
  }>,
  fallback: "event" | "route" | "product"
): AnalyticsDashboardListItem[] {
  return items.slice(0, 6).map((item) => {
    const identity = formatAnalyticsIdentifierLabel(item.key, fallback);
    const safeCategory = isSafeAnalyticsIdentifier(item.category) ? item.category : null;
    const safeProductType = isSafeAnalyticsIdentifier(item.productType) ? item.productType : null;
    const safeSecondary =
      fallback === "route"
        ? safeCategory || identity.secondary
        : fallback === "product"
          ? safeProductType || identity.secondary
          : identity.secondary;
    return {
      key: identity.key,
      label: identity.label,
      secondary: safeSecondary,
      count: formatAnalyticsCount(item.count),
    };
  });
}

function buildFunnel(payload: AnalyticsInsightsResponse): AnalyticsDashboardFunnelStep[] {
  const steps = [
    {
      id: "public-page-viewed",
      label: "Public page viewed",
      value: payload.funnel.publicPageViewed,
      detail: "Aggregate public traffic",
    },
    {
      id: "plans-viewed",
      label: "Plans viewed",
      value: payload.funnel.plansViewed,
      detail: "Pricing and offer view",
    },
    {
      id: "product-viewed",
      label: "Product viewed",
      value: payload.funnel.productViewed,
      detail: "Specific product interest",
    },
    {
      id: "checkout-started",
      label: "Checkout started",
      value: payload.funnel.checkoutStarted,
      detail: "Stripe handoff started",
    },
    {
      id: "checkout-completed",
      label: "Checkout completed",
      value: payload.funnel.checkoutCompleted,
      detail: `${formatAnalyticsPercent(payload.funnel.checkoutCompletionRate)} of started`,
    },
    {
      id: "entitlement-granted",
      label: "Entitlement granted",
      value: payload.funnel.entitlementGranted,
      detail: `${formatAnalyticsPercent(payload.funnel.entitlementGrantRate)} of completed`,
    },
  ];

  const max = Math.max(1, ...steps.map((step) => step.value));
  return steps.map((step) => ({
    ...step,
    count: formatAnalyticsCount(step.value),
    percentOfMax: Math.max(4, Math.round((step.value / max) * 100)),
  }));
}

export function buildAnalyticsDashboardViewModel(
  payload: AnalyticsDashboardPayload,
  options: { now?: Date } = {}
): AnalyticsDashboardViewModel {
  const now = options.now ?? new Date();
  const rangeDays = normalizeAnalyticsDashboardRangeDays(payload.rangeDays);
  const rangeLabel = `${rangeDays} days`;
  const generatedAtLabel = formatAnalyticsTimestamp(payload.generatedAt, now);

  if (isSchemaMissingPayload(payload)) {
    return {
      state: "schema-missing",
      stateLabel: "Schema missing",
      stateDetail:
        payload.warning ??
        "Analytics persistence is not ready. Apply the analytics_events migration first.",
      rangeLabel,
      generatedAtLabel,
      lastEventLabel: "No event yet",
      rowCapLabel: "Not counted",
      metrics: [
        {
          id: "schema",
          label: "Schema",
          value: "Not ready",
          detail: "analytics_events is not queryable yet.",
        },
      ],
      funnel: [],
      eventItems: [],
      routeItems: [],
      productItems: [],
      caveats: [
        "Setup is incomplete, so counts are hidden instead of inferred.",
        "This state does not expose raw payloads or database errors.",
      ],
    };
  }

  const freshnessHours = getFreshnessHours(payload.lastEventAt, now);
  const isNoData = payload.totalEvents === 0;
  const state: AnalyticsDashboardTrustState = isNoData
    ? "no-data"
    : payload.capped
      ? "capped"
      : freshnessHours !== null && freshnessHours <= ANALYTICS_DASHBOARD_FRESH_WINDOW_HOURS
        ? "fresh"
        : "quiet";
  const stateLabel =
    state === "no-data"
      ? "No data yet"
      : state === "capped"
        ? "Capped read"
        : state === "fresh"
          ? "Fresh"
          : "Quiet";
  const stateDetail =
    state === "no-data"
      ? "No matching analytics events were found for this range."
      : state === "capped"
        ? "This range hit the bounded row cap, so totals may be incomplete."
        : state === "fresh"
          ? "Analytics has recent safe events in this range."
          : "No recent event is visible in this range; traffic may be quiet or instrumentation may need review.";

  const clientServerDetail = `${formatAnalyticsCount(payload.clientEvents)} client / ${formatAnalyticsCount(
    payload.serverEvents
  )} server`;

  return {
    state,
    stateLabel,
    stateDetail,
    rangeLabel,
    generatedAtLabel,
    lastEventLabel: formatAnalyticsTimestamp(payload.lastEventAt, now),
    rowCapLabel: `${payload.capped ? "Reached" : "Below"} ${formatAnalyticsCount(payload.rowCap)}`,
    metrics: [
      {
        id: "total-events",
        label: "Total events",
        value: formatAnalyticsCount(payload.totalEvents),
        detail: payload.capped ? "Bounded by row cap" : `In the last ${rangeLabel}`,
      },
      {
        id: "last-event",
        label: "Last event",
        value: formatAnalyticsTimestamp(payload.lastEventAt, now),
        detail: state === "quiet" ? "Needs review if traffic is expected" : "Freshness signal",
      },
      {
        id: "public-aggregate",
        label: "Public aggregate",
        value: formatAnalyticsCount(payload.publicAggregateEvents),
        detail: "Not linked to user profiles",
      },
      {
        id: "known-users",
        label: "Known users",
        value: formatAnalyticsCount(payload.uniqueKnownUsers),
        detail: "Distinct signed-in users in safe events",
      },
      {
        id: "client-server",
        label: "Client / server",
        value: clientServerDetail,
        detail: "Source split",
      },
      {
        id: "checkout-rate",
        label: "Checkout rate",
        value: formatAnalyticsPercent(payload.funnel.checkoutCompletionRate),
        detail: "Checkout completed / started",
      },
    ],
    funnel: buildFunnel(payload),
    eventItems: buildListItems(payload.eventCounts, "event"),
    routeItems: buildListItems(payload.routeCounts, "route"),
    productItems: buildListItems(payload.productCounts, "product"),
    caveats: [
      payload.capped
        ? `This range hit the ${formatAnalyticsCount(payload.rowCap)} row cap. Treat totals as bounded.`
        : `This range is below the ${formatAnalyticsCount(payload.rowCap)} row cap.`,
      "Revenue proxy counts are product signals only; they are not Stripe reconciliation, finance reporting, or revenue recognition.",
      "Public aggregate events are intentionally not linked to user profiles.",
      "Raw URLs, emails, IPs, user agents, notes, cart details, and raw payload JSON are not shown.",
    ],
  };
}
