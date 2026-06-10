export const ANALYTICS_EVENT_NAMES = [
  "public_page_viewed",
  "public_cta_clicked",
  "product_viewed",
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
  "athlete_profile_viewed",
  "athlete_profile_refreshed",
  "athlete_profile_saved",
  "training_metric_saved",
  "training_preferences_saved",
  "personal_record_saved",
  "personal_record_deleted",
  "training_context_viewed",
  "training_context_refreshed",
  "training_focus_created",
  "training_focus_primary_set",
  "training_focus_primary_updated",
  "training_focus_resolved",
  "training_focus_updated",
  "training_note_created",
  "training_note_updated",
  "habits_viewed",
  "habit_created",
  "habit_updated",
  "habit_check_in_logged",
  "habit_check_in_reset",
  "habit_stats_reset_created",
  "habit_lapse_logged",
  "habit_rest_day_logged",
  "habit_timer_saved",
  "micro_session_habit_link_created",
  "micro_session_habit_link_status_updated",
  "workout_builder_started",
  "workout_builder_template_selected",
  "workout_builder_saved",
  "generator_intake_viewed",
  "generator_intake_refreshed",
  "generator_intake_block_toggled",
  "generator_intake_handoff_prepared",
  "session_draft_generated",
  "account_security_viewed",
  "passkey_registration_failed",
  "passkey_registered",
  "passkey_session_verification_failed",
  "passkey_session_verified",
  "passkey_remove_verification_failed",
  "passkey_remove_failed",
  "passkey_removed",
  "preview_admin_unlock_failed",
  "preview_admin_unlock_succeeded",
  "contact_intake_accepted",
  "contact_intake_failed",
  "contact_intake_rate_limited",
  "contact_intake_notification_failed",
  "admin_message_status_changed",
  "item_preview_opened",
  "item_download_started",
  "resume_clicked",
  "progress_synced",
  "sync_failed",
  "qr_redirect_hit",
  "qr_link_created",
  "qr_link_updated",
  "qr_link_status_changed",
  "email_template_saved",
  "email_template_published",
  "email_template_reverted",
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
const SENSITIVE_KEY_PATTERN =
  /(email|token|secret|password|cookie|authorization|session|customer|payment|card|phone|address|shipping)/i;
const DISALLOWED_KEY_PATTERN =
  /(free.?text|message|note|goal|raw.?url|full.?url|url.?with|raw.?referrer|\breferrer\b|query|user.?agent|ip.?address|\bip\b|fingerprint|clipboard|cart.?note|personalization)/i;
const SENSITIVE_VALUE_PATTERN =
  /(@|https?:\/\/.+\?|(?:^|\b)(?:\d{1,3}\.){3}\d{1,3}(?:\b|$)|bearer\s+|eyJ[a-zA-Z0-9_-]+\.)/i;
const MAX_STRING_LENGTH = 200;

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}…`;
}

function toScalar(value: unknown): AnalyticsEventPayloadScalar | undefined {
  if (value === null) return null;
  if (typeof value === "string") {
    if (SENSITIVE_VALUE_PATTERN.test(value)) return "[redacted]";
    return truncateString(value);
  }
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
    if (DISALLOWED_KEY_PATTERN.test(key)) {
      continue;
    }

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

export type TrackAnalyticsEventInput = {
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
