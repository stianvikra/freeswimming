import type { Database } from "@/types/database";

export const ANALYTICS_RAW_EVENT_RETENTION_DAYS = 180;
export const ANALYTICS_DAILY_ROLLUP_WINDOW_DAYS = 400;
export const ANALYTICS_ROLLUP_STALE_AFTER_DAYS = 2;

export type AnalyticsDailyRollupStatusRow = Pick<
  Database["public"]["Tables"]["analytics_event_daily_rollups"]["Row"],
  "event_count" | "refreshed_at" | "rollup_day"
>;

export type AnalyticsLifecycleStatus = {
  rawRetentionDays: number;
  rollupWindowDays: number;
  rawPruneBefore: string;
  rollup: {
    status: "ready" | "empty" | "stale" | "schema-missing" | "query-failed";
    schemaReady: boolean;
    queryOk: boolean;
    latestDay: string | null;
    oldestDay: string | null;
    latestRefreshAt: string | null;
    daysWithRollups: number;
    totalRolledUpEvents: number;
    staleAfterDays: number;
    message: string;
  };
};

export function selectAnalyticsLifecycleRollupFields() {
  return `
    rollup_day,
    event_count,
    refreshed_at
  `;
}

export function isAnalyticsRollupSchemaMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string; hint?: string };
  if (candidate.code === "42P01" || candidate.code === "42703" || candidate.code === "PGRST204") {
    return true;
  }

  const combined =
    `${candidate.message ?? ""} ${candidate.details ?? ""} ${candidate.hint ?? ""}`.toLowerCase();
  return combined.includes("analytics_event_daily_rollups") && combined.includes("does not exist");
}

function daysBetweenUtcDates(laterDay: string, earlierDay: string): number {
  const later = Date.parse(`${laterDay}T00:00:00.000Z`);
  const earlier = Date.parse(`${earlierDay}T00:00:00.000Z`);
  if (!Number.isFinite(later) || !Number.isFinite(earlier)) return Number.POSITIVE_INFINITY;
  return Math.floor((later - earlier) / (24 * 60 * 60 * 1000));
}

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildAnalyticsLifecycleStatus(input: {
  generatedAt: Date;
  rollupRows?: AnalyticsDailyRollupStatusRow[];
  rollupSchemaReady?: boolean;
  rollupQueryOk?: boolean;
  rawRetentionDays?: number;
  rollupWindowDays?: number;
  staleAfterDays?: number;
}): AnalyticsLifecycleStatus {
  const rawRetentionDays = input.rawRetentionDays ?? ANALYTICS_RAW_EVENT_RETENTION_DAYS;
  const rollupWindowDays = input.rollupWindowDays ?? ANALYTICS_DAILY_ROLLUP_WINDOW_DAYS;
  const staleAfterDays = input.staleAfterDays ?? ANALYTICS_ROLLUP_STALE_AFTER_DAYS;
  const rawPruneBefore = new Date(
    input.generatedAt.getTime() - rawRetentionDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const rollupSchemaReady = input.rollupSchemaReady ?? true;
  const rollupQueryOk = input.rollupQueryOk ?? true;

  if (!rollupSchemaReady) {
    return {
      rawRetentionDays,
      rollupWindowDays,
      rawPruneBefore,
      rollup: {
        status: "schema-missing",
        schemaReady: false,
        queryOk: rollupQueryOk,
        latestDay: null,
        oldestDay: null,
        latestRefreshAt: null,
        daysWithRollups: 0,
        totalRolledUpEvents: 0,
        staleAfterDays,
        message:
          "Analytics rollups are not ready yet. Apply the rollup migration before relying on retention pruning.",
      },
    };
  }

  if (!rollupQueryOk) {
    return {
      rawRetentionDays,
      rollupWindowDays,
      rawPruneBefore,
      rollup: {
        status: "query-failed",
        schemaReady: true,
        queryOk: false,
        latestDay: null,
        oldestDay: null,
        latestRefreshAt: null,
        daysWithRollups: 0,
        totalRolledUpEvents: 0,
        staleAfterDays,
        message: "Analytics rollup status could not be loaded right now.",
      },
    };
  }

  const rows = input.rollupRows ?? [];
  const validRows = rows.filter((row) => row.rollup_day && Number.isFinite(row.event_count));
  const rollupDays = [...new Set(validRows.map((row) => row.rollup_day))].sort();
  const oldestDay = rollupDays.at(0) ?? null;
  const latestDay = rollupDays.at(-1) ?? null;
  const latestRefreshAt =
    validRows
      .map((row) => row.refreshed_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
  const totalRolledUpEvents = validRows.reduce((sum, row) => sum + Math.max(0, row.event_count), 0);

  if (!latestDay) {
    return {
      rawRetentionDays,
      rollupWindowDays,
      rawPruneBefore,
      rollup: {
        status: "empty",
        schemaReady: true,
        queryOk: true,
        latestDay: null,
        oldestDay: null,
        latestRefreshAt,
        daysWithRollups: 0,
        totalRolledUpEvents: 0,
        staleAfterDays,
        message: "No analytics daily rollups have been refreshed yet.",
      },
    };
  }

  const generatedDay = toUtcDateString(input.generatedAt);
  const ageDays = daysBetweenUtcDates(generatedDay, latestDay);
  const stale = ageDays > staleAfterDays;

  return {
    rawRetentionDays,
    rollupWindowDays,
    rawPruneBefore,
    rollup: {
      status: stale ? "stale" : "ready",
      schemaReady: true,
      queryOk: true,
      latestDay,
      oldestDay,
      latestRefreshAt,
      daysWithRollups: rollupDays.length,
      totalRolledUpEvents,
      staleAfterDays,
      message: stale
        ? "Analytics daily rollups are stale; refresh rollups before pruning raw events."
        : "Analytics daily rollups are ready for the reported window.",
    },
  };
}
