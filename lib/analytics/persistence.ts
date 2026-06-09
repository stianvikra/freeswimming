import type { SupabaseClient } from "@supabase/supabase-js";
import {
  trackAnalyticsEvent,
  type AnalyticsEventRecord,
  type TrackAnalyticsEventInput,
} from "@/lib/analytics/events";
import { shouldAttachUserIdToClientAnalyticsEvent } from "@/lib/analytics/public";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isExampleSupabaseUrl } from "@/lib/supabase/egress-guard";
import type { Database, Json } from "@/types/database";

type AnalyticsEventsInsert = Database["public"]["Tables"]["analytics_events"]["Insert"];
type AnalyticsEventsClient = Pick<SupabaseClient<Database>, "from">;

const DIMENSION_UNSAFE_PATTERN =
  /(@|https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b|bearer\s+|eyJ[a-zA-Z0-9_-]+\.|\[redacted\])/i;
const DIMENSION_ALLOWED_PATTERN = /^[/a-zA-Z0-9][a-zA-Z0-9_:/.[\],-]{0,159}$/;

function toSafeDimension(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || DIMENSION_UNSAFE_PATTERN.test(normalized)) return null;
  if (!DIMENSION_ALLOWED_PATTERN.test(normalized)) return null;
  return normalized.slice(0, 160);
}

export function isPublicAggregateAnalyticsRecord(record: AnalyticsEventRecord): boolean {
  if (record.channel !== "client") return false;
  return !shouldAttachUserIdToClientAnalyticsEvent(record.eventName, record.payload);
}

export function buildAnalyticsEventInsert(record: AnalyticsEventRecord): AnalyticsEventsInsert {
  const publicAggregate = isPublicAggregateAnalyticsRecord(record);

  return {
    event_name: record.eventName,
    channel: record.channel,
    user_id: publicAggregate ? null : record.userId,
    occurred_at: record.occurredAt,
    payload: record.payload as Json,
    public_aggregate: publicAggregate,
    source: toSafeDimension(record.payload.source),
    route_template: toSafeDimension(record.payload.routeTemplate),
    route_category: toSafeDimension(record.payload.routeCategory),
    product_id: toSafeDimension(record.payload.productId),
    product_type: toSafeDimension(record.payload.productType),
  };
}

export async function persistAnalyticsEvent(
  record: AnalyticsEventRecord,
  options?: {
    supabase?: AnalyticsEventsClient;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!options?.supabase && isExampleSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return { ok: false, error: "Analytics persistence skipped for example Supabase URL." };
  }

  try {
    const supabase = options?.supabase ?? createAdminSupabaseClient();
    const { error } = await supabase
      .from("analytics_events")
      .insert(buildAnalyticsEventInsert(record));

    if (error) {
      console.error("[AnalyticsPersistence] Could not persist analytics event", {
        eventName: record.eventName,
        message: error.message,
      });
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("[AnalyticsPersistence] Analytics persistence skipped", {
      eventName: record.eventName,
      error,
    });
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Analytics persistence failed.",
    };
  }
}

export async function trackAndPersistAnalyticsEvent(
  input: TrackAnalyticsEventInput,
  options?: {
    supabase?: AnalyticsEventsClient;
  }
): Promise<AnalyticsEventRecord> {
  const record = trackAnalyticsEvent(input);
  await persistAnalyticsEvent(record, options);
  return record;
}
