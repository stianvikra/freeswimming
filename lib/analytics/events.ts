export const ANALYTICS_EVENT_NAMES = [
  "plans_viewed",
  "checkout_started",
  "checkout_completed",
  "entitlement_granted",
  "download_link_resent",
  "account_claim_started",
  "account_claim_completed",
  "library_viewed",
  "library_tab_switched",
  "library_new_content_notice_shown",
  "library_new_content_notice_opened",
  "library_new_content_notice_seen",
  "item_preview_opened",
  "item_download_started",
  "resume_clicked",
  "progress_synced",
  "sync_failed",
  "qr_redirect_hit",
  "support_clicked",
  "upsell_presented",
  "upsell_accepted",
  "upsell_declined",
  "discount_redeemed",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

type AnalyticsEventPayloadScalar = string | number | boolean | null;

export type AnalyticsEventRecord = {
  type: "analytics_event";
  eventName: AnalyticsEventName;
  occurredAt: string;
  channel: "server" | "client";
  userId: string | null;
  payload: Record<string, AnalyticsEventPayloadScalar>;
};

const EVENT_NAME_SET = new Set<string>(ANALYTICS_EVENT_NAMES);
const SENSITIVE_KEY_PATTERN = /(email|token|secret|password|cookie|authorization)/i;
const MAX_STRING_LENGTH = 200;

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}…`;
}

function toScalar(value: unknown): AnalyticsEventPayloadScalar | undefined {
  if (value === null) return null;
  if (typeof value === "string") return truncateString(value);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  return undefined;
}

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return EVENT_NAME_SET.has(value);
}

export function sanitizeAnalyticsPayload(
  payload: Record<string, unknown> | null | undefined
): Record<string, AnalyticsEventPayloadScalar> {
  if (!payload) return {};

  const sanitized: Record<string, AnalyticsEventPayloadScalar> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      sanitized[key] = "[redacted]";
      continue;
    }

    const scalarValue = toScalar(value);
    if (scalarValue !== undefined) {
      sanitized[key] = scalarValue;
    }
  }

  return sanitized;
}

type TrackAnalyticsEventInput = {
  eventName: AnalyticsEventName;
  channel: "server" | "client";
  userId?: string | null;
  payload?: Record<string, unknown> | null;
};

export function trackAnalyticsEvent(input: TrackAnalyticsEventInput): AnalyticsEventRecord {
  const record: AnalyticsEventRecord = {
    type: "analytics_event",
    eventName: input.eventName,
    occurredAt: new Date().toISOString(),
    channel: input.channel,
    userId: input.userId ?? null,
    payload: sanitizeAnalyticsPayload(input.payload),
  };

  console.info("[AnalyticsEvent]", JSON.stringify(record));
  return record;
}
