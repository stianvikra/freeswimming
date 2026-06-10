import type { AnalyticsInsightsResponse } from "@/lib/analytics/admin-insights";
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
  workoutBuilderFunnel: AnalyticsDashboardWorkoutBuilderFunnel;
  workoutBuilderSourceBreakdown: AnalyticsDashboardWorkoutBuilderSourceBreakdown;
  workoutBuilderTemplateGeneratedCompletion: AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion;
  eventItems: AnalyticsDashboardListItem[];
  routeItems: AnalyticsDashboardListItem[];
  productItems: AnalyticsDashboardListItem[];
  caveats: string[];
};

const countFormatter = new Intl.NumberFormat("en-US");
const WORKOUT_BUILDER_STARTED_EVENT = "workout_builder_started" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_SAVED_EVENT = "workout_builder_saved" satisfies AnalyticsEventName;
const SESSION_DRAFT_GENERATED_EVENT = "session_draft_generated" satisfies AnalyticsEventName;

const EVENT_LABELS: Record<string, string> = {
  checkout_completed: "Checkout completed",
  checkout_started: "Checkout started",
  entitlement_granted: "Entitlement granted",
  plans_viewed: "Plans viewed",
  product_viewed: "Product viewed",
  public_cta_clicked: "Public CTA clicked",
  public_page_viewed: "Public page viewed",
  session_draft_generated: "Session draft generated",
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
        detail: "Manual builder starts",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: formatAnalyticsCount(saved),
        detail: "Successful creates or updates",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: formatAnalyticsPercent(saveRate),
        detail: "Saved / started",
      },
    ],
    detail: "Read-only product telemetry for the selected range.",
    caveat:
      started === 0
        ? "Save rate is not counted until a builder start exists in this range."
        : "Duplicate starts and saves can exist; this is not unique-user, checkout, or finance conversion.",
  };
}

function buildSchemaMissingWorkoutBuilderFunnel(): AnalyticsDashboardWorkoutBuilderFunnel {
  return {
    metrics: [
      {
        id: "builder-started",
        label: "Started",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "builder-saved",
        label: "Saved",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "builder-save-rate",
        label: "Save rate",
        value: "Not counted",
        detail: "Saved / started",
      },
    ],
    detail: "Workout builder funnel is hidden from inference until analytics schema is ready.",
    caveat: "Apply the analytics_events migration before reading builder funnel counts.",
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
        detail: "Manual builder entries",
      },
      {
        id: "source-generated-drafts",
        label: "Generated drafts",
        value: formatAnalyticsCount(generatedDrafts),
        detail: "AI session drafts",
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
        detail: "Saved generated sessions",
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
        label: "Unknown saves",
        value: formatAnalyticsCount(unknownSaves),
        detail: "Missing or unmapped source",
      },
    ],
    detail: "Read-only source split for builder and generated-session workflow signals.",
    caveat:
      unknownSaves > 0
        ? "Unknown saves are excluded from manual/generated rates until their source is explicitly mapped."
        : "Duplicate drafts and saves can exist; this is not unique-user, checkout, export, or finance conversion.",
  };
}

function buildSchemaMissingWorkoutBuilderSourceBreakdown(): AnalyticsDashboardWorkoutBuilderSourceBreakdown {
  return {
    metrics: [
      {
        id: "source-manual-starts",
        label: "Manual starts",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "source-generated-drafts",
        label: "Generated drafts",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "source-manual-saves",
        label: "Manual saves",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "source-generated-saves",
        label: "Generated saves",
        value: "Not counted",
        detail: "Schema missing",
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
        label: "Unknown saves",
        value: "Not counted",
        detail: "Schema missing",
      },
    ],
    detail: "Source breakdown is hidden from inference until analytics schema is ready.",
    caveat: "Apply the analytics_events migration before reading source breakdown counts.",
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
    payload.workoutBuilderTemplateGeneratedCompletion?.templateUsageStatus ?? "not_instrumented";
  const templateUsageValue =
    templateUsageStatus === "not_instrumented"
      ? "Not instrumented"
      : formatAnalyticsCount(payload.workoutBuilderTemplateGeneratedCompletion?.templateUsageCount);

  return {
    metrics: [
      {
        id: "generated-completion-drafts",
        label: "Generated drafts",
        value: formatAnalyticsCount(generatedDrafts),
        detail: "AI session drafts",
      },
      {
        id: "generated-completion-saves",
        label: "Generated saves",
        value: formatAnalyticsCount(generatedSaves),
        detail: "Saved generated sessions",
      },
      {
        id: "generated-completion-rate",
        label: "Completion rate",
        value: formatAnalyticsPercent(generatedCompletionRate),
        detail: "Generated saves / drafts",
      },
      {
        id: "template-usage",
        label: "Template usage",
        value: templateUsageValue,
        detail: "No dashboard mapping",
      },
    ],
    detail:
      "Read-only generated-session completion signal with template usage kept separate from unsupported inference.",
    caveat:
      generatedDrafts === 0
        ? "Completion rate is not counted until a generated draft exists in this range; template usage is not dashboard-mapped yet."
        : "Template usage is not counted yet because the template-selection event is not mapped into this dashboard module.",
  };
}

function buildSchemaMissingWorkoutBuilderTemplateGeneratedCompletion(): AnalyticsDashboardWorkoutBuilderTemplateGeneratedCompletion {
  return {
    metrics: [
      {
        id: "generated-completion-drafts",
        label: "Generated drafts",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "generated-completion-saves",
        label: "Generated saves",
        value: "Not counted",
        detail: "Schema missing",
      },
      {
        id: "generated-completion-rate",
        label: "Completion rate",
        value: "Not counted",
        detail: "Generated saves / drafts",
      },
      {
        id: "template-usage",
        label: "Template usage",
        value: "Not instrumented",
        detail: "No dashboard mapping",
      },
    ],
    detail:
      "Generated completion and template usage are hidden from inference until analytics schema is ready.",
    caveat: "Apply the analytics_events migration before reading generated-completion counts.",
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
      workoutBuilderFunnel: buildSchemaMissingWorkoutBuilderFunnel(),
      workoutBuilderSourceBreakdown: buildSchemaMissingWorkoutBuilderSourceBreakdown(),
      workoutBuilderTemplateGeneratedCompletion:
        buildSchemaMissingWorkoutBuilderTemplateGeneratedCompletion(),
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
    workoutBuilderFunnel: buildWorkoutBuilderFunnel(payload),
    workoutBuilderSourceBreakdown: buildWorkoutBuilderSourceBreakdown(payload),
    workoutBuilderTemplateGeneratedCompletion:
      buildWorkoutBuilderTemplateGeneratedCompletion(payload),
    eventItems: buildListItems(payload.eventCounts, "event"),
    routeItems: buildListItems(payload.routeCounts, "route"),
    productItems: buildListItems(payload.productCounts, "product"),
    caveats: [
      payload.capped
        ? `This range hit the ${formatAnalyticsCount(payload.rowCap)} row cap. Treat totals as bounded.`
        : `This range is below the ${formatAnalyticsCount(payload.rowCap)} row cap.`,
      "Revenue proxy counts are product signals only; they are not Stripe reconciliation, finance reporting, or revenue recognition.",
      "Workout builder save-rate is product telemetry only; it is not unique-user conversion, checkout performance, or finance truth.",
      "Workout builder source breakdown is product telemetry only; it is not export success, revenue attribution, Stripe reconciliation, or finance truth.",
      "Template usage is not dashboard-mapped yet; do not infer it from session type, generator block toggles, draft creation, visible Use template actions, or adjacent activity.",
      "Public aggregate events are intentionally not linked to user profiles.",
      "Raw URLs, emails, IPs, user agents, notes, cart details, and raw payload JSON are not shown.",
    ],
  };
}
