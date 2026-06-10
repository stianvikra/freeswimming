import type { Database } from "@/types/database";
import {
  buildAnalyticsLifecycleStatus,
  type AnalyticsDailyRollupStatusRow,
  type AnalyticsLifecycleStatus,
} from "@/lib/analytics/lifecycle";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import type { WorkoutSourceKind } from "@/lib/workouts/shared";

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
};

export const ANALYTICS_INSIGHTS_DEFAULT_RANGE_DAYS = 30;
export const ANALYTICS_INSIGHTS_MAX_RANGE_DAYS = 90;
export const ANALYTICS_INSIGHTS_ROW_CAP = 5000;
const WORKOUT_BUILDER_STARTED_EVENT = "workout_builder_started" satisfies AnalyticsEventName;
const WORKOUT_BUILDER_SAVED_EVENT = "workout_builder_saved" satisfies AnalyticsEventName;
const SESSION_DRAFT_GENERATED_EVENT = "session_draft_generated" satisfies AnalyticsEventName;
const MANUAL_WORKOUT_SOURCE_KIND = "manual" satisfies WorkoutSourceKind;
const AI_SESSION_WORKOUT_SOURCE_KIND = "ai_session_v1" satisfies WorkoutSourceKind;

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

  const checkoutStarted = eventCounts.get("checkout_started") ?? 0;
  const checkoutCompleted = eventCounts.get("checkout_completed") ?? 0;
  const workoutBuilderStarted = eventCounts.get(WORKOUT_BUILDER_STARTED_EVENT) ?? 0;
  const workoutBuilderSaved = eventCounts.get(WORKOUT_BUILDER_SAVED_EVENT) ?? 0;
  const generatedDrafts = eventCounts.get(SESSION_DRAFT_GENERATED_EVENT) ?? 0;
  let manualSaves = 0;
  let generatedSaves = 0;
  let unknownSaves = 0;

  for (const row of input.rows) {
    if (row.event_name !== WORKOUT_BUILDER_SAVED_EVENT) continue;
    const sourceKind = getSafePayloadSourceKind(row.payload);
    if (sourceKind === MANUAL_WORKOUT_SOURCE_KIND) {
      manualSaves += 1;
    } else if (sourceKind === AI_SESSION_WORKOUT_SOURCE_KIND) {
      generatedSaves += 1;
    } else {
      unknownSaves += 1;
    }
  }

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
