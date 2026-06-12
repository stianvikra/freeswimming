import type { Database } from "@/types/database";
import {
  buildAnalyticsLifecycleStatus,
  type AnalyticsDailyRollupStatusRow,
  type AnalyticsLifecycleStatus,
} from "@/lib/analytics/lifecycle";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import { WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION } from "@/lib/commerce/checkout";
import {
  WORKOUT_BUILDER_TEMPLATE_ANALYTICS_SOURCE,
  WORKOUT_CONTEXT_CTA_ANALYTICS_SOURCE,
  WORKOUT_CONTEXT_CTA_PLACEMENT_ID,
  WORKOUT_CONTEXT_CTA_PRODUCT_ID,
  WORKOUT_CONTEXT_CTA_SURFACE,
} from "@/lib/analytics/workout-builder";
import type { WorkoutSourceKind } from "@/lib/workouts/shared";
import {
  getWorkoutTemplateByKey,
  parseWorkoutTemplateKey,
  type WorkoutTemplateLifecycleStatus,
} from "@/lib/workouts/templates";

export type AnalyticsEventInsightRow = Pick<
  Database["public"]["Tables"]["analytics_events"]["Row"],
  | "channel"
  | "event_name"
  | "occurred_at"
  | "payload"
  | "product_id"
  | "product_type"
  | "public_aggregate"
  | "route_category"
  | "route_template"
  | "source"
  | "user_id"
>;

export type AnalyticsInsightCount = {
  key: string;
  count: number;
};

export type WorkoutBuilderTemplateUsageCount = {
  key: string;
  label: string;
  status: WorkoutTemplateLifecycleStatus;
  count: number;
};

export type ExistingUpsellSourceCount = {
  key: string;
  presented: number;
  accepted: number;
  declined: number;
  total: number;
  acceptedRate: number | null;
  declineRate: number | null;
};

export type AnalyticsInsightsResponse = {
  ok: true;
  schemaReady: true;
  generatedAt: string;
  rangeDays: number;
  since: string;
  until: string;
  rowCap: number;
  capped: boolean;
  totalEvents: number;
  lastEventAt: string | null;
  uniqueKnownUsers: number;
  publicAggregateEvents: number;
  clientEvents: number;
  serverEvents: number;
  eventCounts: AnalyticsInsightCount[];
  routeCounts: Array<AnalyticsInsightCount & { category: string | null }>;
  productCounts: Array<AnalyticsInsightCount & { productType: string | null }>;
  lifecycle: AnalyticsLifecycleStatus;
  funnel: {
    publicPageViewed: number;
    plansViewed: number;
    productViewed: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    entitlementGranted: number;
    checkoutCompletionRate: number | null;
    entitlementGrantRate: number | null;
  };
  existingUpsellBaseline: {
    presented: number;
    accepted: number;
    declined: number;
    acceptedRate: number | null;
    declineRate: number | null;
    unknownSourceEvents: number;
    sourceCounts: ExistingUpsellSourceCount[];
  };
  workoutContextCta: {
    placementId: string;
    productId: string;
    source: string;
    presented: number;
    accepted: number;
    acceptedRate: number | null;
    unknownEvents: number;
  };
  workoutContextCheckoutStarted: {
    placementId: string;
    productId: string;
    source: string;
    started: number;
    unknownEvents: number;
  };
  workoutContextCheckoutOutcome: {
    placementId: string;
    productId: string;
    source: string;
    completed: number;
    entitlementGranted: number;
    entitlementGrantRate: number | null;
    unknownEvents: number;
  };
  workoutBuilderFunnel: {
    started: number;
    saved: number;
    saveRate: number | null;
  };
  workoutBuilderSourceBreakdown: {
    manualStarts: number;
    generatedDrafts: number;
    manualSaves: number;
    generatedSaves: number;
    unknownSaves: number;
    manualSaveRate: number | null;
    generatedSaveRate: number | null;
  };
  workoutBuilderTemplateGeneratedCompletion: {
    generatedDrafts: number;
    generatedSaves: number;
    generatedCompletionRate: number | null;
    templateUsageCount: number | null;
    templateUsageStatus: "mapped";
  };
  workoutBuilderTemplateUsage: {
    templateSelections: number;
    knownTemplateSelections: number;
    unknownTemplateSelections: number;
    templatesSelected: number;
    templateCounts: WorkoutBuilderTemplateUsageCount[];
  };
};

export const ANALYTICS_INSIGHTS_DEFAULT_RANGE_DAYS = 30;
export const ANALYTICS_INSIGHTS_MAX_RANGE_DAYS = 90;
export const ANALYTICS_INSIGHTS_ROW_CAP = 5000;
const WORKOUT_BUILDER_STARTED_EVENT = "workout_builder_started" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_SAVED_EVENT = "workout_builder_saved" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT =
  "workout_builder_template_selected" satisfies AnalyticsEventName;
const SESSION_DRAFT_GENERATED_EVENT = "session_draft_generated" satisfies AnalyticsEventName;
const UPSELL_PRESENTED_EVENT = "upsell_presented" satisfies AnalyticsEventName;
const UPSELL_ACCEPTED_EVENT = "upsell_accepted" satisfies AnalyticsEventName;
const UPSELL_DECLINED_EVENT = "upsell_declined" satisfies AnalyticsEventName;
const CHECKOUT_STARTED_EVENT = "checkout_started" satisfies AnalyticsEventName;
const CHECKOUT_COMPLETED_EVENT = "checkout_completed" satisfies AnalyticsEventName;
const ENTITLEMENT_GRANTED_EVENT = "entitlement_granted" satisfies AnalyticsEventName;
const MANUAL_WORKOUT_SOURCE_KIND = "manual" satisfies WorkoutSourceKind;
const AI_SESSION_WORKOUT_SOURCE_KIND = "ai_session_v1" satisfies WorkoutSourceKind;
const EXISTING_UPSELL_SOURCE_VALUES = new Set(["plans", "library_explore"]);

export function selectAnalyticsInsightFields() {
  return `
    event_name,
    channel,
    user_id,
    public_aggregate,
    source,
    route_template,
    route_category,
    product_id,
    product_type,
    payload,
    occurred_at
  `;
}

export function parseAnalyticsInsightsRangeDays(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return ANALYTICS_INSIGHTS_DEFAULT_RANGE_DAYS;
  if (parsed <= 0) return ANALYTICS_INSIGHTS_DEFAULT_RANGE_DAYS;
  return Math.min(parsed, ANALYTICS_INSIGHTS_MAX_RANGE_DAYS);
}

function increment(map: Map<string, number>, key: string | null | undefined) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sortedCounts(map: Map<string, number>): AnalyticsInsightCount[] {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

function getSafePayloadSourceKind(payload: AnalyticsEventInsightRow["payload"]): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const sourceKind = (payload as { sourceKind?: unknown }).sourceKind;
  if (typeof sourceKind !== "string") return null;
  if (!/^[a-z][a-z0-9_:-]{0,80}$/.test(sourceKind)) return null;
  return sourceKind;
}

function getSafeTemplateSelectionKey(payload: AnalyticsEventInsightRow["payload"]): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const candidate = payload as { templateKey?: unknown; templateSource?: unknown };
  if (candidate.templateSource !== WORKOUT_BUILDER_TEMPLATE_ANALYTICS_SOURCE) return null;
  const parsedKey = parseWorkoutTemplateKey(candidate.templateKey);
  if (!parsedKey || parsedKey !== candidate.templateKey) return null;
  return parsedKey;
}

function getSafePayloadDimension(
  payload: AnalyticsEventInsightRow["payload"],
  key: "placementId" | "productId" | "source" | "surface"
): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = (payload as Record<string, unknown>)[key];
  if (typeof value !== "string") return null;
  if (!/^[a-z][a-z0-9_:-]{0,80}$/.test(value)) return null;
  return value;
}

function getSafeRowOrPayloadDimension(
  rowValue: string | null | undefined,
  payload: AnalyticsEventInsightRow["payload"],
  payloadKey: "placementId" | "productId" | "source" | "surface"
): string | null {
  if (rowValue && /^[a-z][a-z0-9_:-]{0,80}$/.test(rowValue)) return rowValue;
  return getSafePayloadDimension(payload, payloadKey);
}

function isWorkoutContextUpsellRow(row: AnalyticsEventInsightRow): boolean {
  const source = getSafeRowOrPayloadDimension(row.source, row.payload, "source");
  const surface = getSafePayloadDimension(row.payload, "surface");
  const placementId = getSafePayloadDimension(row.payload, "placementId");
  return (
    source === WORKOUT_CONTEXT_CTA_ANALYTICS_SOURCE ||
    surface === WORKOUT_CONTEXT_CTA_SURFACE ||
    placementId === WORKOUT_CONTEXT_CTA_PLACEMENT_ID
  );
}

function isMappedWorkoutContextCtaRow(row: AnalyticsEventInsightRow): boolean {
  const source = getSafeRowOrPayloadDimension(row.source, row.payload, "source");
  const placementId = getSafePayloadDimension(row.payload, "placementId");
  const productId = getSafeRowOrPayloadDimension(row.product_id, row.payload, "productId");
  return (
    source === WORKOUT_CONTEXT_CTA_ANALYTICS_SOURCE &&
    placementId === WORKOUT_CONTEXT_CTA_PLACEMENT_ID &&
    productId === WORKOUT_CONTEXT_CTA_PRODUCT_ID
  );
}

function isWorkoutContextCheckoutAttributionRow(row: AnalyticsEventInsightRow): boolean {
  const source = getSafeRowOrPayloadDimension(row.source, row.payload, "source");
  const placementId = getSafePayloadDimension(row.payload, "placementId");
  return (
    source === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source ||
    placementId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId
  );
}

function isMappedWorkoutContextCheckoutAttributionRow(row: AnalyticsEventInsightRow): boolean {
  const source = getSafeRowOrPayloadDimension(row.source, row.payload, "source");
  const placementId = getSafePayloadDimension(row.payload, "placementId");
  const productId = getSafeRowOrPayloadDimension(row.product_id, row.payload, "productId");
  return (
    source === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source &&
    placementId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId &&
    productId === WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId
  );
}

function isWorkoutContextCheckoutStartedRow(row: AnalyticsEventInsightRow): boolean {
  return isWorkoutContextCheckoutAttributionRow(row);
}

function isMappedWorkoutContextCheckoutStartedRow(row: AnalyticsEventInsightRow): boolean {
  return isMappedWorkoutContextCheckoutAttributionRow(row);
}

function normalizeExistingUpsellSource(row: AnalyticsEventInsightRow): string {
  const candidates = [
    row.source,
    getSafePayloadDimension(row.payload, "source"),
    getSafePayloadDimension(row.payload, "surface"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === "my_library") return "library_explore";
    if (EXISTING_UPSELL_SOURCE_VALUES.has(candidate)) return candidate;
  }

  return "unknown";
}

function buildEmptyUpsellSourceCount(key: string): ExistingUpsellSourceCount {
  return {
    key,
    presented: 0,
    accepted: 0,
    declined: 0,
    total: 0,
    acceptedRate: null,
    declineRate: null,
  };
}

function getUpsellSourceCount(
  map: Map<string, ExistingUpsellSourceCount>,
  key: string
): ExistingUpsellSourceCount {
  const existing = map.get(key);
  if (existing) return existing;
  const next = buildEmptyUpsellSourceCount(key);
  map.set(key, next);
  return next;
}

export function buildAnalyticsInsights(input: {
  rows: AnalyticsEventInsightRow[];
  generatedAt: Date;
  rangeDays: number;
  rollupRows?: AnalyticsDailyRollupStatusRow[];
  rollupSchemaReady?: boolean;
  rollupQueryOk?: boolean;
  rowCap?: number;
  capped?: boolean;
}): AnalyticsInsightsResponse {
  const rowCap = input.rowCap ?? ANALYTICS_INSIGHTS_ROW_CAP;
  const until = input.generatedAt.toISOString();
  const since = new Date(input.generatedAt.getTime() - input.rangeDays * 24 * 60 * 60 * 1000);

  const eventCounts = new Map<string, number>();
  const routeCounts = new Map<string, number>();
  const routeCategories = new Map<string, string | null>();
  const productCounts = new Map<string, number>();
  const productTypes = new Map<string, string | null>();
  const knownUsers = new Set<string>();

  let publicAggregateEvents = 0;
  let clientEvents = 0;
  let serverEvents = 0;
  let lastEventAt: string | null = null;

  for (const row of input.rows) {
    increment(eventCounts, row.event_name);

    if (row.public_aggregate) publicAggregateEvents += 1;
    if (row.channel === "client") clientEvents += 1;
    if (row.channel === "server") serverEvents += 1;
    if (row.user_id) knownUsers.add(row.user_id);
    if (!lastEventAt || row.occurred_at > lastEventAt) lastEventAt = row.occurred_at;

    if (row.route_template) {
      increment(routeCounts, row.route_template);
      routeCategories.set(row.route_template, row.route_category ?? null);
    }

    if (row.product_id) {
      increment(productCounts, row.product_id);
      productTypes.set(row.product_id, row.product_type ?? null);
    }
  }

  const checkoutStarted = eventCounts.get(CHECKOUT_STARTED_EVENT) ?? 0;
  const checkoutCompleted = eventCounts.get("checkout_completed") ?? 0;
  const workoutBuilderStarted = eventCounts.get(WORKOUT_BUILDER_STARTED_EVENT) ?? 0;
  const workoutBuilderSaved = eventCounts.get(WORKOUT_BUILDER_SAVED_EVENT) ?? 0;
  const generatedDrafts = eventCounts.get(SESSION_DRAFT_GENERATED_EVENT) ?? 0;
  let manualSaves = 0;
  let generatedSaves = 0;
  let unknownSaves = 0;
  let knownTemplateSelections = 0;
  let unknownTemplateSelections = 0;
  let upsellPresented = 0;
  let upsellAccepted = 0;
  let upsellDeclined = 0;
  let unknownUpsellSourceEvents = 0;
  let workoutContextCtaPresented = 0;
  let workoutContextCtaAccepted = 0;
  let workoutContextCtaUnknownEvents = 0;
  let workoutContextCheckoutStarted = 0;
  let workoutContextCheckoutStartedUnknownEvents = 0;
  let workoutContextCheckoutCompleted = 0;
  let workoutContextEntitlementGranted = 0;
  let workoutContextCheckoutOutcomeUnknownEvents = 0;
  const templateSelectionCounts = new Map<string, number>();
  const upsellSourceCounts = new Map<string, ExistingUpsellSourceCount>();

  for (const row of input.rows) {
    if (row.event_name === CHECKOUT_STARTED_EVENT) {
      if (isMappedWorkoutContextCheckoutStartedRow(row)) {
        workoutContextCheckoutStarted += 1;
      } else if (isWorkoutContextCheckoutStartedRow(row)) {
        workoutContextCheckoutStartedUnknownEvents += 1;
      }
    }

    if (
      row.event_name === CHECKOUT_COMPLETED_EVENT ||
      row.event_name === ENTITLEMENT_GRANTED_EVENT
    ) {
      if (isMappedWorkoutContextCheckoutAttributionRow(row)) {
        if (row.event_name === CHECKOUT_COMPLETED_EVENT) {
          workoutContextCheckoutCompleted += 1;
        } else {
          workoutContextEntitlementGranted += 1;
        }
      } else if (isWorkoutContextCheckoutAttributionRow(row)) {
        workoutContextCheckoutOutcomeUnknownEvents += 1;
      }
    }

    if (
      row.event_name === UPSELL_PRESENTED_EVENT ||
      row.event_name === UPSELL_ACCEPTED_EVENT ||
      row.event_name === UPSELL_DECLINED_EVENT
    ) {
      const isWorkoutContextRow = isWorkoutContextUpsellRow(row);
      if (isWorkoutContextRow) {
        const isMapped = isMappedWorkoutContextCtaRow(row);
        if (isMapped && row.event_name === UPSELL_PRESENTED_EVENT) {
          workoutContextCtaPresented += 1;
        } else if (isMapped && row.event_name === UPSELL_ACCEPTED_EVENT) {
          workoutContextCtaAccepted += 1;
        } else {
          workoutContextCtaUnknownEvents += 1;
        }
      }

      if (isWorkoutContextRow) continue;

      const source = normalizeExistingUpsellSource(row);
      const sourceCount = getUpsellSourceCount(upsellSourceCounts, source);
      const isExistingSource = EXISTING_UPSELL_SOURCE_VALUES.has(source);
      sourceCount.total += 1;
      if (source === "unknown") unknownUpsellSourceEvents += 1;
      if (row.event_name === UPSELL_PRESENTED_EVENT) {
        sourceCount.presented += 1;
        if (isExistingSource) upsellPresented += 1;
      }
      if (row.event_name === UPSELL_ACCEPTED_EVENT) {
        sourceCount.accepted += 1;
        if (isExistingSource) upsellAccepted += 1;
      }
      if (row.event_name === UPSELL_DECLINED_EVENT) {
        sourceCount.declined += 1;
        if (isExistingSource) upsellDeclined += 1;
      }
    }

    if (row.event_name === WORKOUT_BUILDER_SAVED_EVENT) {
      const sourceKind = getSafePayloadSourceKind(row.payload);
      if (sourceKind === MANUAL_WORKOUT_SOURCE_KIND) {
        manualSaves += 1;
      } else if (sourceKind === AI_SESSION_WORKOUT_SOURCE_KIND) {
        generatedSaves += 1;
      } else {
        unknownSaves += 1;
      }
      continue;
    }

    if (row.event_name === WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT) {
      const templateKey = getSafeTemplateSelectionKey(row.payload);
      const template = getWorkoutTemplateByKey(templateKey);
      if (templateKey && template) {
        knownTemplateSelections += 1;
        increment(templateSelectionCounts, templateKey);
      } else {
        unknownTemplateSelections += 1;
      }
    }
  }

  const templateCounts = sortedCounts(templateSelectionCounts).map((item) => {
    const template = getWorkoutTemplateByKey(item.key);
    return {
      key: item.key,
      label: template?.title ?? "Unknown template",
      status: template?.status ?? "deprecated",
      count: item.count,
    };
  });
  const templateSelections = eventCounts.get(WORKOUT_BUILDER_TEMPLATE_SELECTED_EVENT) ?? 0;
  const upsellSourceCountItems = [...upsellSourceCounts.values()]
    .map((item) => ({
      ...item,
      acceptedRate: ratio(item.accepted, item.presented),
      declineRate: ratio(item.declined, item.presented),
    }))
    .sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));

  return {
    ok: true,
    schemaReady: true,
    generatedAt: until,
    rangeDays: input.rangeDays,
    since: since.toISOString(),
    until,
    rowCap,
    capped: input.capped ?? input.rows.length >= rowCap,
    totalEvents: input.rows.length,
    lastEventAt,
    uniqueKnownUsers: knownUsers.size,
    publicAggregateEvents,
    clientEvents,
    serverEvents,
    eventCounts: sortedCounts(eventCounts),
    routeCounts: sortedCounts(routeCounts).map((item) => ({
      ...item,
      category: routeCategories.get(item.key) ?? null,
    })),
    productCounts: sortedCounts(productCounts).map((item) => ({
      ...item,
      productType: productTypes.get(item.key) ?? null,
    })),
    lifecycle: buildAnalyticsLifecycleStatus({
      generatedAt: input.generatedAt,
      rollupRows: input.rollupRows,
      rollupSchemaReady: input.rollupSchemaReady,
      rollupQueryOk: input.rollupQueryOk,
    }),
    funnel: {
      publicPageViewed: eventCounts.get("public_page_viewed") ?? 0,
      plansViewed: eventCounts.get("plans_viewed") ?? 0,
      productViewed: eventCounts.get("product_viewed") ?? 0,
      checkoutStarted,
      checkoutCompleted,
      entitlementGranted: eventCounts.get("entitlement_granted") ?? 0,
      checkoutCompletionRate: ratio(checkoutCompleted, checkoutStarted),
      entitlementGrantRate: ratio(eventCounts.get("entitlement_granted") ?? 0, checkoutCompleted),
    },
    existingUpsellBaseline: {
      presented: upsellPresented,
      accepted: upsellAccepted,
      declined: upsellDeclined,
      acceptedRate: ratio(upsellAccepted, upsellPresented),
      declineRate: ratio(upsellDeclined, upsellPresented),
      unknownSourceEvents: unknownUpsellSourceEvents,
      sourceCounts: upsellSourceCountItems,
    },
    workoutContextCta: {
      placementId: WORKOUT_CONTEXT_CTA_PLACEMENT_ID,
      productId: WORKOUT_CONTEXT_CTA_PRODUCT_ID,
      source: WORKOUT_CONTEXT_CTA_ANALYTICS_SOURCE,
      presented: workoutContextCtaPresented,
      accepted: workoutContextCtaAccepted,
      acceptedRate: ratio(workoutContextCtaAccepted, workoutContextCtaPresented),
      unknownEvents: workoutContextCtaUnknownEvents,
    },
    workoutContextCheckoutStarted: {
      placementId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId,
      productId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId,
      source: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source,
      started: workoutContextCheckoutStarted,
      unknownEvents: workoutContextCheckoutStartedUnknownEvents,
    },
    workoutContextCheckoutOutcome: {
      placementId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.placementId,
      productId: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.productId,
      source: WORKOUT_CONTEXT_PLANS_CHECKOUT_ATTRIBUTION.source,
      completed: workoutContextCheckoutCompleted,
      entitlementGranted: workoutContextEntitlementGranted,
      entitlementGrantRate: ratio(
        workoutContextEntitlementGranted,
        workoutContextCheckoutCompleted
      ),
      unknownEvents: workoutContextCheckoutOutcomeUnknownEvents,
    },
    workoutBuilderFunnel: {
      started: workoutBuilderStarted,
      saved: workoutBuilderSaved,
      saveRate: ratio(workoutBuilderSaved, workoutBuilderStarted),
    },
    workoutBuilderSourceBreakdown: {
      manualStarts: workoutBuilderStarted,
      generatedDrafts,
      manualSaves,
      generatedSaves,
      unknownSaves,
      manualSaveRate: ratio(manualSaves, workoutBuilderStarted),
      generatedSaveRate: ratio(generatedSaves, generatedDrafts),
    },
    workoutBuilderTemplateGeneratedCompletion: {
      generatedDrafts,
      generatedSaves,
      generatedCompletionRate: ratio(generatedSaves, generatedDrafts),
      templateUsageCount: templateSelections,
      templateUsageStatus: "mapped",
    },
    workoutBuilderTemplateUsage: {
      templateSelections,
      knownTemplateSelections,
      unknownTemplateSelections,
      templatesSelected: templateCounts.length,
      templateCounts,
    },
  };
}

export function isAnalyticsEventsSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string; hint?: string };
  if (candidate.code === "42P01" || candidate.code === "42703" || candidate.code === "PGRST204") {
    return true;
  }

  const combined =
    `${candidate.message ?? ""} ${candidate.details ?? ""} ${candidate.hint ?? ""}`.toLowerCase();
  return combined.includes("analytics_events") && combined.includes("does not exist");
}

export function getAnalyticsSchemaSetupMessage(): string {
  return "Analytics persistence is not ready yet. Apply the analytics_events migration before using admin insights.";
}
