import type {
  AnalyticsInsightsResponse,
  WorkoutContextCheckoutCancelDiagnosticKey,
  WorkoutContextCheckoutOutcomeDiagnosticKey,
} from "@/lib/analytics/admin-insights";
import type { AnalyticsEventName } from "@/lib/analytics/events";

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

export type AnalyticsDashboardWorkoutBuilderFunnel = {
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutBuilderSourceBreakdown = {
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion = {
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutBuilderTemplateUsage = {
  metrics: AnalyticsDashboardMetric[];
  items: AnalyticsDashboardListItem[];
  emptyLabel: string;
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardExistingUpsellBaseline = {
  metrics: AnalyticsDashboardMetric[];
  sourceItems: AnalyticsDashboardListItem[];
  emptyLabel: string;
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutContextCta = {
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutContextCheckoutStarted = {
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutContextCheckoutOutcome = {
  metrics: AnalyticsDashboardMetric[];
  reviewItems: AnalyticsDashboardListItem[];
  emptyReviewLabel: string;
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutContextCheckoutCancel = {
  metrics: AnalyticsDashboardMetric[];
  reviewItems: AnalyticsDashboardListItem[];
  emptyReviewLabel: string;
  detail: string;
  caveat: string;
};

export type AnalyticsDashboardWorkoutContextStageSummary = {
  stages: AnalyticsDashboardFunnelStep[];
  metrics: AnalyticsDashboardMetric[];
  detail: string;
  caveat: string;
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
  existingUpsellBaseline: AnalyticsDashboardExistingUpsellBaseline;
  workoutContextStageSummary: AnalyticsDashboardWorkoutContextStageSummary;
  workoutContextCta: AnalyticsDashboardWorkoutContextCta;
  workoutContextCheckoutStarted: AnalyticsDashboardWorkoutContextCheckoutStarted;
  workoutContextCheckoutOutcome: AnalyticsDashboardWorkoutContextCheckoutOutcome;
  workoutContextCheckoutCancel: AnalyticsDashboardWorkoutContextCheckoutCancel;
  workoutBuilderFunnel: AnalyticsDashboardWorkoutBuilderFunnel;
  workoutBuilderSourceBreakdown: AnalyticsDashboardWorkoutBuilderSourceBreakdown;
  workoutBuilderTemplateGeneratedCompletion: AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion;
  workoutBuilderTemplateUsage: AnalyticsDashboardWorkoutBuilderTemplateUsage;
  eventItems: AnalyticsDashboardListItem[];
  routeItems: AnalyticsDashboardListItem[];
  productItems: AnalyticsDashboardListItem[];
  caveats: string[];
};

const countFormatter = new Intl.NumberFormat("en-US");
const WORKOUT_BUILDER_STARTED_EVENT = "workout_builder_started" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_SAVED_EVENT = "workout_builder_saved" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT =
  "workout_builder_template_selected" satisfies AnalyticsEventName;
const SESSION_DRAFT_GENERATED_EVENT = "session_draft_generated" satisfies AnalyticsEventName;
const UPSELL_PRESENTED_EVENT = "upsell_presented" satisfies AnalyticsEventName;
const UPSELL_ACCEPTED_EVENT = "upsell_accepted" satisfies AnalyticsEventName;
const UPSELL_DECLINED_EVENT = "upsell_declined" satisfies AnalyticsEventName;

const WORKOUT_CONTEXT_CHECKOUT_OUTCOME_DIAGNOSTIC_LABELS: Record<
  WorkoutContextCheckoutOutcomeDiagnosticKey,
  { label: string; secondary: string }
> = {
  source_not_mapped: {
    label: "Source not mapped",
    secondary: "A workout-context-like access action used a source that is not approved yet.",
  },
  placement_not_mapped: {
    label: "Placement not mapped",
    secondary: "The saved-workout placement did not match the approved guide path.",
  },
  product_not_mapped: {
    label: "Product not mapped",
    secondary: "The product is outside the approved Poolside guide mapping.",
  },
  incomplete_attribution: {
    label: "Missing attribution",
    secondary: "Source, placement, or product was missing or unsafe, so it stayed out of totals.",
  },
  other_review_needed: {
    label: "Other review needed",
    secondary: "The row looked related but did not fit a mapped support bucket.",
  },
};

const WORKOUT_CONTEXT_CHECKOUT_CANCEL_DIAGNOSTIC_LABELS: Record<
  WorkoutContextCheckoutCancelDiagnosticKey,
  { label: string; secondary: string }
> = {
  source_not_mapped: {
    label: "Source not mapped",
    secondary: "A checkout-cancel return used a source that is not approved yet.",
  },
  placement_not_mapped: {
    label: "Placement not mapped",
    secondary: "The cancel return did not match the approved saved-workout placement.",
  },
  product_not_mapped: {
    label: "Product not mapped",
    secondary: "The product is outside the approved Poolside guide cancel mapping.",
  },
  surface_not_mapped: {
    label: "Surface not mapped",
    secondary: "The return surface is outside the approved plans checkout-cancel path.",
  },
  reason_not_mapped: {
    label: "Reason not mapped",
    secondary: "The decline reason is outside the approved checkout-cancel meaning.",
  },
  incomplete_attribution: {
    label: "Missing attribution",
    secondary:
      "Source, placement, product, surface, or reason was missing or unsafe, so it stayed out of totals.",
  },
  other_review_needed: {
    label: "Other review needed",
    secondary: "The row looked related but did not fit a mapped cancel bucket.",
  },
};

const EVENT_LABELS: Record<string, string> = {
  checkout_completed: "Checkout completed",
  checkout_started: "Checkout started",
  entitlement_granted: "Entitlement granted",
  plans_viewed: "Plans viewed",
  product_viewed: "Product viewed",
  public_cta_clicked: "Public CTA clicked",
  public_page_viewed: "Public page viewed",
  session_draft_generated: "Session draft generated",
  upsell_accepted: "Upsell accepted",
  upsell_declined: "Upsell declined",
  upsell_presented: "Upsell presented",
  workout_builder_saved: "Workout builder saved",
  workout_builder_started: "Workout builder started",
  workout_builder_template_selected: "Workout builder template selected",
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
  if (!isoValue) return "No activity yet";
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

function isSafeTemplateDisplayLabel(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.length > 80) return false;
  if (/[@<>{}[\]\\]/.test(value)) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9 .,&()/+-]*$/.test(value);
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
        ? "Unknown tracked action"
        : fallback === "route"
          ? "Unknown route"
          : "Unknown product";
    return { label, secondary: null, key: label };
  }

  if (fallback === "event") {
    return {
      label: EVENT_LABELS[value] ?? titleCaseWords(value).replace(/\bEvents?\b/g, "Action"),
      secondary: "Tracked action",
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

function formatExistingUpsellSourceLabel(key: string | null | undefined): string {
  if (key === "plans") return "Plans";
  if (key === "library_explore") return "My Library explore";
  return "Unknown source";
}

function findEventCount(
  items: AnalyticsInsightsResponse["eventCounts"],
  eventName: AnalyticsEventName
): number {
  return items.find((item) => item.key === eventName)?.count ?? 0;
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

function buildExistingUpsellBaseline(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardExistingUpsellBaseline {
  const baseline = payload.existingUpsellBaseline;
  const presented =
    baseline?.presented ?? findEventCount(payload.eventCounts, UPSELL_PRESENTED_EVENT);
  const accepted = baseline?.accepted ?? findEventCount(payload.eventCounts, UPSELL_ACCEPTED_EVENT);
  const declined = baseline?.declined ?? findEventCount(payload.eventCounts, UPSELL_DECLINED_EVENT);
  const acceptedRate = baseline?.acceptedRate ?? rate(accepted, presented);
  const declineRate = baseline?.declineRate ?? rate(declined, presented);
  const unknownSourceEvents = baseline?.unknownSourceEvents ?? 0;
  const sourceItems =
    baseline?.sourceCounts?.slice(0, 5).map((item): AnalyticsDashboardListItem => {
      const key = item.key === "plans" || item.key === "library_explore" ? item.key : "unknown";
      return {
        key,
        label: formatExistingUpsellSourceLabel(key),
        secondary: `${formatAnalyticsCount(item.presented)} shown / ${formatAnalyticsCount(
          item.accepted
        )} clicked / ${formatAnalyticsCount(item.declined)} checkout cancelled`,
        count: formatAnalyticsCount(item.total),
      };
    }) ?? [];

  return {
    metrics: [
      {
        id: "upsell-presented",
        label: "Shown",
        value: formatAnalyticsCount(presented),
        detail: "Sales prompt views",
      },
      {
        id: "upsell-accepted",
        label: "Clicked",
        value: formatAnalyticsCount(accepted),
        detail: "Clicked sales prompt",
      },
      {
        id: "upsell-accepted-rate",
        label: "Click rate",
        value: formatAnalyticsPercent(acceptedRate),
        detail: "Clicked / shown",
      },
      {
        id: "upsell-declined",
        label: "Checkout cancelled",
        value: formatAnalyticsCount(declined),
        detail: "Returned from checkout",
      },
      {
        id: "upsell-decline-rate",
        label: "Cancel rate",
        value: formatAnalyticsPercent(declineRate),
        detail: "Cancelled / shown",
      },
    ],
    sourceItems,
    emptyLabel: "No current sales prompt activity in this range.",
    detail:
      "Shows how often current sales prompts on Plans and My Library were shown, clicked, or returned from checkout.",
    caveat:
      presented === 0
        ? "Click and cancel rates are not counted until a current sales prompt has been shown in this range."
        : unknownSourceEvents > 0
          ? "Some sales prompt activity does not match an approved surface yet. It stays out of the main numbers until reviewed."
          : "Clicks are not purchases. Checkout cancelled only means a user returned from checkout, not that every non-buyer declined.",
  };
}

function buildSchemaMissingExistingUpsellBaseline(): AnalyticsDashboardExistingUpsellBaseline {
  return {
    metrics: [
      {
        id: "upsell-presented",
        label: "Shown",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "upsell-accepted",
        label: "Clicked",
        value: "Not counted",
        detail: "Clicked sales prompt",
      },
      {
        id: "upsell-accepted-rate",
        label: "Click rate",
        value: "Not counted",
        detail: "Clicked / shown",
      },
      {
        id: "upsell-declined",
        label: "Checkout cancelled",
        value: "Not counted",
        detail: "Returned from checkout",
      },
      {
        id: "upsell-decline-rate",
        label: "Cancel rate",
        value: "Not counted",
        detail: "Cancelled / shown",
      },
    ],
    sourceItems: [],
    emptyLabel: "Current sales prompt counts are hidden until analytics setup is ready.",
    detail: "Current sales prompt counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading current sales prompt counts.",
  };
}

function buildWorkoutContextCta(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutContextCta {
  const cta = payload.workoutContextCta;
  const presented = cta?.presented ?? 0;
  const accepted = cta?.accepted ?? 0;
  const acceptedRate = cta?.acceptedRate ?? rate(accepted, presented);
  const unknownEvents = cta?.unknownEvents ?? 0;

  return {
    metrics: [
      {
        id: "workout-context-cta-presented",
        label: "Shown",
        value: formatAnalyticsCount(presented),
        detail: "",
      },
      {
        id: "workout-context-cta-accepted",
        label: "Clicked",
        value: formatAnalyticsCount(accepted),
        detail: "",
      },
      {
        id: "workout-context-cta-accepted-rate",
        label: "Click rate",
        value: formatAnalyticsPercent(acceptedRate),
        detail: "",
      },
      {
        id: "workout-context-cta-unknown",
        label: "Needs review",
        value: formatAnalyticsCount(unknownEvents),
        detail: "Kept out of totals",
      },
    ],
    detail:
      "Shows how often the Poolside guide prompt was shown and clicked after a workout was saved.",
    caveat:
      presented === 0
        ? "Click rate is not counted until this prompt has been shown in the selected range."
        : unknownEvents > 0
          ? "Some logged actions do not match the approved prompt setup. They stay out of the main numbers until reviewed."
          : "Clicks are interest signals only. They are not purchases, access grants, revenue, or accounting records.",
  };
}

function buildSchemaMissingWorkoutContextCta(): AnalyticsDashboardWorkoutContextCta {
  return {
    metrics: [
      {
        id: "workout-context-cta-presented",
        label: "Shown",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-cta-accepted",
        label: "Clicked",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-cta-accepted-rate",
        label: "Click rate",
        value: "Not counted",
        detail: "Clicked / shown",
      },
      {
        id: "workout-context-cta-unknown",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    detail: "Saved-workout guide prompt counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading saved-workout guide prompt counts.",
  };
}

function buildWorkoutContextCheckoutStarted(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutContextCheckoutStarted {
  const checkoutStarted = payload.workoutContextCheckoutStarted;
  const started = checkoutStarted?.started ?? 0;
  const unknownEvents = checkoutStarted?.unknownEvents ?? 0;

  return {
    metrics: [
      {
        id: "workout-context-checkout-started",
        label: "Checkout handoffs",
        value: formatAnalyticsCount(started),
        detail: "",
      },
      {
        id: "workout-context-checkout-started-unknown",
        label: "Needs review",
        value: formatAnalyticsCount(unknownEvents),
        detail: "Kept out of totals",
      },
    ],
    detail: "Shows how often the saved-workout guide path reached checkout handoff.",
    caveat:
      started === 0
        ? "Checkout handoff is not counted until this path starts checkout in the selected range."
        : unknownEvents > 0
          ? "Some checkout-start actions do not match the approved saved-workout guide path. They stay out of the main number until reviewed."
          : "Checkout handoff is not a purchase, access grant, revenue, accounting record, or unique person.",
  };
}

function buildSchemaMissingWorkoutContextCheckoutStarted(): AnalyticsDashboardWorkoutContextCheckoutStarted {
  return {
    metrics: [
      {
        id: "workout-context-checkout-started",
        label: "Checkout handoffs",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-checkout-started-unknown",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    detail: "Saved-workout checkout handoff counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading saved-workout checkout handoff counts.",
  };
}

function buildWorkoutContextCheckoutOutcome(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutContextCheckoutOutcome {
  const outcome = payload.workoutContextCheckoutOutcome;
  const completed = outcome?.completed ?? 0;
  const entitlementGranted = outcome?.entitlementGranted ?? 0;
  const entitlementGrantRate = outcome?.entitlementGrantRate ?? rate(entitlementGranted, completed);
  const unknownEvents = outcome?.unknownEvents ?? 0;
  const completionWithoutAccess =
    outcome?.completionWithoutAccess ?? Math.max(completed - entitlementGranted, 0);
  const accessWithoutCompletion =
    outcome?.accessWithoutCompletion ?? Math.max(entitlementGranted - completed, 0);
  const diagnosticItems = (outcome?.reviewDiagnostics ?? [])
    .filter((item) => item.count > 0)
    .map((item) => {
      const labels = WORKOUT_CONTEXT_CHECKOUT_OUTCOME_DIAGNOSTIC_LABELS[item.key];
      return {
        key: item.key,
        label: labels.label,
        secondary: labels.secondary,
        count: formatAnalyticsCount(item.count),
      };
    });
  const reviewItems: AnalyticsDashboardListItem[] = [
    ...(diagnosticItems.length === 0 && unknownEvents > 0
      ? [
          {
            key: "review-details-unavailable",
            label: "Review details unavailable",
            secondary: "Reason buckets are missing, so these rows stay out of totals.",
            count: formatAnalyticsCount(unknownEvents),
          },
        ]
      : diagnosticItems),
    ...(completionWithoutAccess > 0
      ? [
          {
            key: "completion-without-access",
            label: "Access pending",
            secondary:
              "Completed checkout is ahead of access granted in this range; treat as timing or support review.",
            count: formatAnalyticsCount(completionWithoutAccess),
          },
        ]
      : []),
    ...(accessWithoutCompletion > 0
      ? [
          {
            key: "access-without-completion",
            label: "Access before checkout",
            secondary:
              "Access is ahead of completed checkout in this range; usually a range, retry, or mapping review signal.",
            count: formatAnalyticsCount(accessWithoutCompletion),
          },
        ]
      : []),
  ];

  return {
    metrics: [
      {
        id: "workout-context-checkout-completed",
        label: "Completed checkout",
        value: formatAnalyticsCount(completed),
        detail: "",
      },
      {
        id: "workout-context-entitlement-granted",
        label: "Access granted",
        value: formatAnalyticsCount(entitlementGranted),
        detail: "",
      },
      {
        id: "workout-context-entitlement-rate",
        label: "Access rate",
        value: formatAnalyticsPercent(entitlementGrantRate),
        detail: "Access / completed",
      },
      {
        id: "workout-context-checkout-outcome-unknown",
        label: "Needs review",
        value: formatAnalyticsCount(unknownEvents),
        detail: "Kept out of totals",
      },
    ],
    reviewItems,
    emptyReviewLabel: "No review diagnostics in this range.",
    detail: "Shows how often the saved-workout guide path completed checkout and got app access.",
    caveat:
      completed === 0
        ? "Completion and access are not counted until this path completes checkout in the selected range."
        : reviewItems.length > 0 || unknownEvents > 0
          ? "Review signals are aggregate support diagnostics only. They do not prove provider failure, entitlement failure, revenue, accounting, or unique people."
          : "Completion and access are product/support signals only. They are not revenue, accounting records, Stripe reconciliation, or unique people.",
  };
}

function buildSchemaMissingWorkoutContextCheckoutOutcome(): AnalyticsDashboardWorkoutContextCheckoutOutcome {
  return {
    metrics: [
      {
        id: "workout-context-checkout-completed",
        label: "Completed checkout",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-entitlement-granted",
        label: "Access granted",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-entitlement-rate",
        label: "Access rate",
        value: "Not counted",
        detail: "Access / completed",
      },
      {
        id: "workout-context-checkout-outcome-unknown",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    reviewItems: [],
    emptyReviewLabel: "Setup missing",
    detail: "Saved-workout completion and access counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading saved-workout completion and access counts.",
  };
}

function buildWorkoutContextCheckoutCancel(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutContextCheckoutCancel {
  const cancel = payload.workoutContextCheckoutCancel;
  const cancelled = cancel?.cancelled ?? 0;
  const unknownEvents = cancel?.unknownEvents ?? 0;
  const diagnosticItems = (cancel?.reviewDiagnostics ?? [])
    .filter((item) => item.count > 0)
    .map((item) => {
      const labels = WORKOUT_CONTEXT_CHECKOUT_CANCEL_DIAGNOSTIC_LABELS[item.key];
      return {
        key: item.key,
        label: labels.label,
        secondary: labels.secondary,
        count: formatAnalyticsCount(item.count),
      };
    });
  const reviewItems: AnalyticsDashboardListItem[] =
    diagnosticItems.length === 0 && unknownEvents > 0
      ? [
          {
            key: "review-details-unavailable",
            label: "Review details unavailable",
            secondary: "Reason buckets are missing, so these rows stay out of totals.",
            count: formatAnalyticsCount(unknownEvents),
          },
        ]
      : diagnosticItems;

  return {
    metrics: [
      {
        id: "workout-context-checkout-cancelled",
        label: "Checkout cancelled",
        value: formatAnalyticsCount(cancelled),
        detail: "Mapped returns",
      },
      {
        id: "workout-context-checkout-cancel-unknown",
        label: "Needs review",
        value: formatAnalyticsCount(unknownEvents),
        detail: "Kept out of totals",
      },
    ],
    reviewItems,
    emptyReviewLabel: "No review diagnostics in this range.",
    detail: "Shows mapped checkout-cancel returns for the saved-workout Poolside guide path.",
    caveat:
      cancelled === 0
        ? "Checkout cancel is not counted until the mapped guide checkout return is logged in this range."
        : reviewItems.length > 0 || unknownEvents > 0
          ? "Review signals stay out of totals until mapped. Cancel counts are return-from-checkout telemetry only, not payment failure, revenue, or unique people."
          : "Checkout cancel means the mapped return-from-checkout path only. It is not ignored CTA, payment failure, revenue, Stripe reconciliation, finance reporting, or unique people.",
  };
}

function buildSchemaMissingWorkoutContextCheckoutCancel(): AnalyticsDashboardWorkoutContextCheckoutCancel {
  return {
    metrics: [
      {
        id: "workout-context-checkout-cancelled",
        label: "Checkout cancelled",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "workout-context-checkout-cancel-unknown",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    reviewItems: [],
    emptyReviewLabel: "Setup missing",
    detail: "Saved-workout checkout-cancel counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading saved-workout checkout-cancel counts.",
  };
}

function buildWorkoutContextStageSummary(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutContextStageSummary {
  const shown = payload.workoutContextCta?.presented ?? 0;
  const clicked = payload.workoutContextCta?.accepted ?? 0;
  const handoff = payload.workoutContextCheckoutStarted?.started ?? 0;
  const cancelled = payload.workoutContextCheckoutCancel?.cancelled ?? 0;
  const completed = payload.workoutContextCheckoutOutcome?.completed ?? 0;
  const accessGranted = payload.workoutContextCheckoutOutcome?.entitlementGranted ?? 0;
  const steps = [
    {
      id: "poolside-stage-shown",
      label: "Shown",
      value: shown,
      detail: "Prompt views",
    },
    {
      id: "poolside-stage-clicked",
      label: "Clicked",
      value: clicked,
      detail: "Clicked prompt",
    },
    {
      id: "poolside-stage-checkout-handoff",
      label: "Checkout handoff",
      value: handoff,
      detail: "Reached checkout",
    },
    {
      id: "poolside-stage-checkout-cancelled",
      label: "Checkout cancelled",
      value: cancelled,
      detail: "Returned from checkout",
    },
    {
      id: "poolside-stage-completed-checkout",
      label: "Completed checkout",
      value: completed,
      detail: "Webhook completion",
    },
    {
      id: "poolside-stage-access-granted",
      label: "Access granted",
      value: accessGranted,
      detail: "App access",
    },
  ];
  const max = Math.max(1, ...steps.map((step) => step.value));

  return {
    stages: steps.map((step) => ({
      ...step,
      count: formatAnalyticsCount(step.value),
      percentOfMax: Math.max(4, Math.round((step.value / max) * 100)),
    })),
    metrics: [
      {
        id: "poolside-stage-click-rate",
        label: "Click rate",
        value: formatAnalyticsPercent(rate(clicked, shown)),
        detail: "Clicked / shown",
      },
      {
        id: "poolside-stage-handoff-rate",
        label: "Handoff rate",
        value: formatAnalyticsPercent(rate(handoff, clicked)),
        detail: "Checkout handoff / clicked",
      },
      {
        id: "poolside-stage-cancel-rate",
        label: "Cancel rate",
        value: formatAnalyticsPercent(rate(cancelled, shown)),
        detail: "Cancelled / shown",
      },
      {
        id: "poolside-stage-completion-rate",
        label: "Completion rate",
        value: formatAnalyticsPercent(rate(completed, handoff)),
        detail: "Completed / handoff",
      },
      {
        id: "poolside-stage-access-rate",
        label: "Access rate",
        value: formatAnalyticsPercent(rate(accessGranted, completed)),
        detail: "Access / completed",
      },
    ],
    detail: "Shows the approved saved-workout Poolside guide path from prompt view to app access.",
    caveat:
      shown === 0
        ? "Stage rates are not counted until the Poolside guide prompt has been shown in this range."
        : "Stage counts and cancel rate are selected-range logged actions, not unique people, revenue, Stripe reconciliation, or accounting records. Cancelled means mapped return-from-checkout only; use the detailed panels for review-needed rows.",
  };
}

function buildSchemaMissingWorkoutContextStageSummary(): AnalyticsDashboardWorkoutContextStageSummary {
  const stages = [
    "Shown",
    "Clicked",
    "Checkout handoff",
    "Checkout cancelled",
    "Completed checkout",
    "Access granted",
  ].map((label, index) => ({
    id: `poolside-stage-schema-missing-${index}`,
    label,
    count: "Not counted",
    value: 0,
    percentOfMax: 4,
    detail: "Setup missing",
  }));

  return {
    stages,
    metrics: [
      {
        id: "poolside-stage-click-rate",
        label: "Click rate",
        value: "Not counted",
        detail: "Clicked / shown",
      },
      {
        id: "poolside-stage-handoff-rate",
        label: "Handoff rate",
        value: "Not counted",
        detail: "Checkout handoff / clicked",
      },
      {
        id: "poolside-stage-cancel-rate",
        label: "Cancel rate",
        value: "Not counted",
        detail: "Cancelled / shown",
      },
      {
        id: "poolside-stage-completion-rate",
        label: "Completion rate",
        value: "Not counted",
        detail: "Completed / handoff",
      },
      {
        id: "poolside-stage-access-rate",
        label: "Access rate",
        value: "Not counted",
        detail: "Access / completed",
      },
    ],
    detail: "Saved-workout Poolside guide stage counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading saved-workout Poolside guide stage counts.",
  };
}

function buildWorkoutBuilderFunnel(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutBuilderFunnel {
  const started =
    payload.workoutBuilderFunnel?.started ??
    findEventCount(payload.eventCounts, WORKOUT_BUILDER_STARTED_EVENT);
  const saved =
    payload.workoutBuilderFunnel?.saved ??
    findEventCount(payload.eventCounts, WORKOUT_BUILDER_SAVED_EVENT);
  const saveRate = payload.workoutBuilderFunnel?.saveRate ?? rate(saved, started);

  return {
    metrics: [
      {
        id: "builder-started",
        label: "Started",
        value: formatAnalyticsCount(started),
        detail: "Builder starts",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: formatAnalyticsCount(saved),
        detail: "Workouts saved",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: formatAnalyticsPercent(saveRate),
        detail: "Saved / started",
      },
    ],
    detail: "Shows how many workouts were started and saved in this range.",
    caveat:
      started === 0
        ? "Save rate is not counted until a builder start exists in this range."
        : "A person may create more than one tracked action. These numbers describe product activity, not purchases or revenue.",
  };
}

function buildSchemaMissingWorkoutBuilderFunnel(): AnalyticsDashboardWorkoutBuilderFunnel {
  return {
    metrics: [
      {
        id: "builder-started",
        label: "Started",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: "Not counted",
        detail: "Saved / started",
      },
    ],
    detail: "Builder start and save counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading builder start and save counts.",
  };
}

function buildWorkoutBuilderSourceBreakdown(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutBuilderSourceBreakdown {
  const manualStarts =
    payload.workoutBuilderSourceBreakdown?.manualStarts ??
    payload.workoutBuilderFunnel?.started ??
    findEventCount(payload.eventCounts, WORKOUT_BUILDER_STARTED_EVENT);
  const generatedDrafts =
    payload.workoutBuilderSourceBreakdown?.generatedDrafts ??
    findEventCount(payload.eventCounts, SESSION_DRAFT_GENERATED_EVENT);
  const manualSaves = payload.workoutBuilderSourceBreakdown?.manualSaves ?? 0;
  const generatedSaves = payload.workoutBuilderSourceBreakdown?.generatedSaves ?? 0;
  const unknownSaves = payload.workoutBuilderSourceBreakdown?.unknownSaves ?? 0;
  const manualSaveRate =
    payload.workoutBuilderSourceBreakdown?.manualSaveRate ?? rate(manualSaves, manualStarts);
  const generatedSaveRate =
    payload.workoutBuilderSourceBreakdown?.generatedSaveRate ??
    rate(generatedSaves, generatedDrafts);

  return {
    metrics: [
      {
        id: "source-manual-starts",
        label: "Manual starts",
        value: formatAnalyticsCount(manualStarts),
        detail: "Manual builder starts",
      },
      {
        id: "source-generated-drafts",
        label: "Generated drafts",
        value: formatAnalyticsCount(generatedDrafts),
        detail: "Generated workout drafts",
      },
      {
        id: "source-manual-saves",
        label: "Manual saves",
        value: formatAnalyticsCount(manualSaves),
        detail: "Saved manual workouts",
      },
      {
        id: "source-generated-saves",
        label: "Generated saves",
        value: formatAnalyticsCount(generatedSaves),
        detail: "Saved generated workouts",
      },
      {
        id: "source-manual-save-rate",
        label: "Manual save rate",
        value: formatAnalyticsPercent(manualSaveRate),
        detail: "Manual saves / starts",
      },
      {
        id: "source-generated-save-rate",
        label: "Generated save rate",
        value: formatAnalyticsPercent(generatedSaveRate),
        detail: "Generated saves / drafts",
      },
      {
        id: "source-unknown-saves",
        label: "Needs review",
        value: formatAnalyticsCount(unknownSaves),
        detail: "Saved workouts missing a known type",
      },
    ],
    detail: "Shows manual and generated workout activity side by side.",
    caveat:
      unknownSaves > 0
        ? "Some saved workouts are not linked to a supported type yet. They stay out of manual/generated rates until reviewed."
        : "A person may create more than one tracked action. These numbers describe product activity, not exports, purchases, or revenue.",
  };
}

function buildSchemaMissingWorkoutBuilderSourceBreakdown(): AnalyticsDashboardWorkoutBuilderSourceBreakdown {
  return {
    metrics: [
      {
        id: "source-manual-starts",
        label: "Manual starts",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "source-generated-drafts",
        label: "Generated drafts",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "source-manual-saves",
        label: "Manual saves",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "source-generated-saves",
        label: "Generated saves",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "source-manual-save-rate",
        label: "Manual save rate",
        value: "Not counted",
        detail: "Manual saves / starts",
      },
      {
        id: "source-generated-save-rate",
        label: "Generated save rate",
        value: "Not counted",
        detail: "Generated saves / drafts",
      },
      {
        id: "source-unknown-saves",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    detail: "Manual/generated workout split is hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading manual/generated workout counts.",
  };
}

function buildWorkoutBuilderTemplateGeneratedCompletion(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion {
  const generatedDrafts =
    payload.workoutBuilderTemplateGeneratedCompletion?.generatedDrafts ??
    payload.workoutBuilderSourceBreakdown?.generatedDrafts ??
    findEventCount(payload.eventCounts, SESSION_DRAFT_GENERATED_EVENT);
  const generatedSaves =
    payload.workoutBuilderTemplateGeneratedCompletion?.generatedSaves ??
    payload.workoutBuilderSourceBreakdown?.generatedSaves ??
    0;
  const generatedCompletionRate =
    payload.workoutBuilderTemplateGeneratedCompletion?.generatedCompletionRate ??
    payload.workoutBuilderSourceBreakdown?.generatedSaveRate ??
    rate(generatedSaves, generatedDrafts);
  const templateUsageStatus =
    payload.workoutBuilderTemplateGeneratedCompletion?.templateUsageStatus ?? "mapped";
  const templateUsageCount =
    payload.workoutBuilderTemplateGeneratedCompletion?.templateUsageCount ??
    payload.workoutBuilderTemplateUsage?.templateSelections ??
    findEventCount(payload.eventCounts, WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT);
  const templateUsageValue =
    templateUsageStatus === "mapped" ? formatAnalyticsCount(templateUsageCount) : "Not counted";

  return {
    metrics: [
      {
        id: "generated-completion-drafts",
        label: "Generated drafts",
        value: formatAnalyticsCount(generatedDrafts),
        detail: "Generated workout drafts",
      },
      {
        id: "generated-completion-saves",
        label: "Generated saves",
        value: formatAnalyticsCount(generatedSaves),
        detail: "Saved generated workouts",
      },
      {
        id: "generated-completion-rate",
        label: "Completion rate",
        value: formatAnalyticsPercent(generatedCompletionRate),
        detail: "Generated saves / drafts",
      },
      {
        id: "template-usage",
        label: "Template starts",
        value: templateUsageValue,
        detail: "Use template clicks",
      },
    ],
    detail:
      "Shows how often generated drafts became saved sessions, with template starts kept separate.",
    caveat:
      generatedDrafts === 0
        ? "Completion rate is not counted until a generated draft exists in this range. Template starts count only the Use template action."
        : "Template starts count only the Use template action, not nearby labels, generated drafts, or saved workouts.",
  };
}

function buildSchemaMissingWorkoutBuilderTemplateGeneratedCompletion(): AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion {
  return {
    metrics: [
      {
        id: "generated-completion-drafts",
        label: "Generated drafts",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "generated-completion-saves",
        label: "Generated saves",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "generated-completion-rate",
        label: "Completion rate",
        value: "Not counted",
        detail: "Generated saves / drafts",
      },
      {
        id: "template-usage",
        label: "Template starts",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    detail:
      "Generated session and template start counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading generated session counts.",
  };
}

function buildWorkoutBuilderTemplateUsage(
  payload: AnalyticsInsightsResponse
): AnalyticsDashboardWorkoutBuilderTemplateUsage {
  const usage = payload.workoutBuilderTemplateUsage;
  const templateSelections =
    usage?.templateSelections ??
    findEventCount(payload.eventCounts, WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT);
  const knownTemplateSelections = usage?.knownTemplateSelections ?? 0;
  const unknownTemplateSelections = usage?.unknownTemplateSelections ?? 0;
  const templatesSelected = usage?.templatesSelected ?? usage?.templateCounts?.length ?? 0;
  const items =
    usage?.templateCounts?.slice(0, 5).map((item): AnalyticsDashboardListItem => {
      const safeKey = isSafeAnalyticsIdentifier(item.key) ? item.key : "unknown_template";
      const safeLabel = isSafeTemplateDisplayLabel(item.label) ? item.label : "Unknown template";
      const status = item.status === "deprecated" ? "Deprecated template" : "Active template";
      return {
        key: safeKey,
        label: safeLabel,
        secondary: status,
        count: formatAnalyticsCount(item.count),
      };
    }) ?? [];

  return {
    metrics: [
      {
        id: "template-selections",
        label: "Template starts",
        value: formatAnalyticsCount(templateSelections),
        detail: "Use template clicks",
      },
      {
        id: "templates-selected",
        label: "Templates used",
        value: formatAnalyticsCount(templatesSelected),
        detail: "Known templates",
      },
      {
        id: "unknown-template-selections",
        label: "Needs review",
        value: formatAnalyticsCount(unknownTemplateSelections),
        detail: "Missing approved template",
      },
    ],
    items,
    emptyLabel:
      templateSelections === 0
        ? "No template starts in this range."
        : "No approved templates in this range.",
    detail: "Shows which workout templates users started from.",
    caveat:
      unknownTemplateSelections > 0
        ? "Some template starts do not match an approved template yet. They stay out of template totals until reviewed."
        : knownTemplateSelections === 0
          ? "Template selection counts remain zero until users explicitly choose Use template."
          : "A person may start the same template more than once. These numbers are not purchases, exports, or revenue.",
  };
}

function buildSchemaMissingWorkoutBuilderTemplateUsage(): AnalyticsDashboardWorkoutBuilderTemplateUsage {
  return {
    metrics: [
      {
        id: "template-selections",
        label: "Template starts",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "templates-selected",
        label: "Templates used",
        value: "Not counted",
        detail: "Setup missing",
      },
      {
        id: "unknown-template-selections",
        label: "Needs review",
        value: "Not counted",
        detail: "Setup missing",
      },
    ],
    items: [],
    emptyLabel: "Template start counts are hidden until analytics setup is ready.",
    detail: "Template start counts are hidden until analytics setup is ready.",
    caveat: "Finish analytics setup before reading template start counts.",
  };
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
      stateLabel: "Setup missing",
      stateDetail:
        payload.warning ??
        "Analytics storage is not ready yet. Finish setup before reading these numbers.",
      rangeLabel,
      generatedAtLabel,
      lastEventLabel: "No activity yet",
      rowCapLabel: "Not counted",
      metrics: [
        {
          id: "schema",
          label: "Analytics setup",
          value: "Not ready",
          detail: "Setup is not ready yet.",
        },
      ],
      funnel: [],
      existingUpsellBaseline: buildSchemaMissingExistingUpsellBaseline(),
      workoutContextStageSummary: buildSchemaMissingWorkoutContextStageSummary(),
      workoutContextCta: buildSchemaMissingWorkoutContextCta(),
      workoutContextCheckoutStarted: buildSchemaMissingWorkoutContextCheckoutStarted(),
      workoutContextCheckoutOutcome: buildSchemaMissingWorkoutContextCheckoutOutcome(),
      workoutContextCheckoutCancel: buildSchemaMissingWorkoutContextCheckoutCancel(),
      workoutBuilderFunnel: buildSchemaMissingWorkoutBuilderFunnel(),
      workoutBuilderSourceBreakdown: buildSchemaMissingWorkoutBuilderSourceBreakdown(),
      workoutBuilderTemplateGeneratedCompletion:
        buildSchemaMissingWorkoutBuilderTemplateGeneratedCompletion(),
      workoutBuilderTemplateUsage: buildSchemaMissingWorkoutBuilderTemplateUsage(),
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
      ? "No matching tracked activity was found for this range."
      : state === "capped"
        ? "This range hit the read limit, so totals may be incomplete."
        : state === "fresh"
          ? "Analytics has recent safe tracked activity in this range."
          : "No recent tracked activity is visible in this range; traffic may be quiet or tracking may need review.";

  const clientServerDetail = `${formatAnalyticsCount(payload.clientEvents)} browser / ${formatAnalyticsCount(
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
        label: "Total tracked actions",
        value: formatAnalyticsCount(payload.totalEvents),
        detail: payload.capped ? "Bounded by read limit" : `In the last ${rangeLabel}`,
      },
      {
        id: "last-event",
        label: "Last activity",
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
        detail: "Distinct signed-in users in safe activity",
      },
      {
        id: "client-server",
        label: "Browser / server",
        value: clientServerDetail,
        detail: "Where it was counted",
      },
      {
        id: "checkout-rate",
        label: "Checkout rate",
        value: formatAnalyticsPercent(payload.funnel.checkoutCompletionRate),
        detail: "Checkout completed / started",
      },
    ],
    funnel: buildFunnel(payload),
    existingUpsellBaseline: buildExistingUpsellBaseline(payload),
    workoutContextStageSummary: buildWorkoutContextStageSummary(payload),
    workoutContextCta: buildWorkoutContextCta(payload),
    workoutContextCheckoutStarted: buildWorkoutContextCheckoutStarted(payload),
    workoutContextCheckoutOutcome: buildWorkoutContextCheckoutOutcome(payload),
    workoutContextCheckoutCancel: buildWorkoutContextCheckoutCancel(payload),
    workoutBuilderFunnel: buildWorkoutBuilderFunnel(payload),
    workoutBuilderSourceBreakdown: buildWorkoutBuilderSourceBreakdown(payload),
    workoutBuilderTemplateGeneratedCompletion:
      buildWorkoutBuilderTemplateGeneratedCompletion(payload),
    workoutBuilderTemplateUsage: buildWorkoutBuilderTemplateUsage(payload),
    eventItems: buildListItems(payload.eventCounts, "event"),
    routeItems: buildListItems(payload.routeCounts, "route"),
    productItems: buildListItems(payload.productCounts, "product"),
    caveats: [
      payload.capped
        ? `This range hit the ${formatAnalyticsCount(payload.rowCap)} read limit. Treat totals as bounded.`
        : `This range is below the ${formatAnalyticsCount(payload.rowCap)} read limit.`,
      "Sales funnel counts are product signals only. They are not purchase or accounting records; use Stripe and accounting reports for money.",
      "Current sales prompt counts show views, clicks, and checkout-cancel returns only. Clicks are not purchases, and checkout-cancel returns are not every non-buyer.",
      "Saved-workout guide stage summary uses selected-range event counts only; cancel rate is cancelled / shown for the mapped return-from-checkout signal. It is not unique-user conversion, revenue, Stripe reconciliation, or finance reporting.",
      "Saved-workout guide prompt counts show views and clicks only. Clicks are not purchases, access grants, revenue, accounting records, or unique people.",
      "Saved-workout checkout handoff counts show checkout starts for the approved guide path only. They are not purchases, access grants, revenue, accounting records, or unique people.",
      "Saved-workout completion and access counts show provider-backed completion and app-recognized access for the approved guide path only. They are not revenue, Stripe reconciliation, accounting records, or unique people.",
      "Saved-workout checkout-cancel counts show mapped return-from-checkout events only. They are not ignored CTAs, payment failures, revenue, Stripe reconciliation, finance reporting, or unique people.",
      "Builder save-rate shows product activity only. It is not unique people, checkout performance, purchases, or revenue.",
      "Manual/generated workout split shows product activity only. It is not export success, revenue attribution, or accounting evidence.",
      "Template starts count only the Use template action. Do not infer template use from nearby labels, saved workouts, or generated drafts.",
      "Public aggregate activity is intentionally not linked to user profiles.",
      "Sensitive details such as raw URLs, emails, IPs, user agents, notes, cart details, and raw payload JSON are not shown.",
    ],
  };
}
