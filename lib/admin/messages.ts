import type { AdminRole } from "@/lib/admin/access";
import type { Database, Json } from "@/types/database";

export type AdminMessageRow = Database["public"]["Tables"]["admin_messages"]["Row"];
export type AdminMessageUpdate = Database["public"]["Tables"]["admin_messages"]["Update"];
export type AdminMessageDeliveryAttemptRow =
  Database["public"]["Tables"]["admin_message_delivery_attempts"]["Row"];
export type AdminMessageSource = Database["public"]["Enums"]["admin_message_source"];
export type AdminMessageStatus = Database["public"]["Enums"]["admin_message_status"];
export type AdminMessageDeliveryStatus =
  Database["public"]["Enums"]["admin_message_delivery_status"];

export const ADMIN_MESSAGE_SOURCE_VALUES = [
  "contact",
  "preview_access_notify",
  "analysis",
  "goals_coaching",
] as const satisfies readonly AdminMessageSource[];

export const ADMIN_MESSAGE_STATUS_VALUES = [
  "new",
  "read",
  "needs_reply",
  "replied",
  "triaged",
  "archived",
  "deleted",
] as const satisfies readonly AdminMessageStatus[];

export const ADMIN_MESSAGE_STATUS_FILTER_VALUES = [
  "all",
  "new",
  "read",
  "needs_reply",
  "replied",
  "archived",
  "deleted",
] as const;

export const ADMIN_MESSAGE_SOURCE_FILTER_VALUES = ["all", ...ADMIN_MESSAGE_SOURCE_VALUES] as const;

export const ADMIN_MESSAGE_STATUS_ACTION_VALUES = [
  "mark_read",
  "mark_unread",
  "needs_reply",
  "mark_replied",
  "archive",
  "delete",
  "restore",
] as const;

export type AdminMessageStatusFilter = (typeof ADMIN_MESSAGE_STATUS_FILTER_VALUES)[number];
export type AdminMessageSourceFilter = (typeof ADMIN_MESSAGE_SOURCE_FILTER_VALUES)[number];
export type AdminMessageStatusAction = (typeof ADMIN_MESSAGE_STATUS_ACTION_VALUES)[number];

export type AdminMessageStructuredEntry = {
  key: string;
  label: string;
  value: string;
};

export type AdminMessageDiagnosticEntry = {
  label: string;
  value: string;
};

export type AdminMessageDeliveryAttemptView = {
  id: string;
  target: AdminMessageDeliveryAttemptRow["target"];
  targetLabel: string;
  providerKey: AdminMessageDeliveryAttemptRow["provider_key"];
  providerLabel: string;
  status: AdminMessageDeliveryStatus;
  statusLabel: string;
  providerMessageId: string | null;
  errorCode: AdminMessageDeliveryAttemptRow["error_code"];
  redactedErrorMessage: string | null;
  retryAfterSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMessageItem = {
  id: string;
  sourceVariant: AdminMessageSource;
  sourceLabel: string;
  submitterName: string;
  submitterEmail: string;
  messageBody: string;
  messageExcerpt: string;
  structuredIntake: AdminMessageStructuredEntry[];
  requestDiagnostics: AdminMessageDiagnosticEntry[];
  status: AdminMessageStatus;
  statusBucket: Exclude<AdminMessageStatusFilter, "all">;
  statusLabel: string;
  notificationStatus: AdminMessageDeliveryStatus;
  notificationStatusLabel: string;
  notificationErrorCode: AdminMessageRow["notification_error_code"];
  createdAt: string;
  updatedAt: string;
  deliveryAttempts: AdminMessageDeliveryAttemptView[];
};

export type AdminMessagesResponse =
  | {
      ok: true;
      role: AdminRole;
      items: AdminMessageItem[];
      schemaReady: boolean;
      warning: string | null;
      pageSize: number;
      nextCursor: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export type AdminMessagesSummaryResponse =
  | {
      ok: true;
      role: AdminRole;
      schemaReady: boolean;
      warning: string | null;
      needsReplyCount: number;
    }
  | {
      ok: false;
      error: string;
    };

export type AdminMessageResponse =
  | {
      ok: true;
      role: AdminRole;
      item: AdminMessageItem;
    }
  | {
      ok: false;
      error: string;
    };

type ParseResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;
const ADMIN_MESSAGES_NEEDS_REPLY_BADGE_MAX = 9;

export function selectAdminMessageFields(): string {
  return `
    id,
    source_variant,
    submitter_name,
    submitter_email,
    message_body,
    structured_intake,
    request_metadata,
    status,
    notification_status,
    notification_error_code,
    created_at,
    updated_at
  `;
}

export function selectAdminMessageDeliveryAttemptFields(): string {
  return `
    id,
    target,
    message_id,
    reply_id,
    provider_key,
    status,
    provider_message_id,
    error_code,
    retry_after_seconds,
    redacted_error_message,
    attempt_metadata,
    created_at,
    updated_at
  `;
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isAdminMessageStatus(
  value: string | null | undefined
): value is AdminMessageStatus {
  return Boolean(value && ADMIN_MESSAGE_STATUS_VALUES.includes(value as AdminMessageStatus));
}

export function isAdminMessageStatusAction(
  value: string | null | undefined
): value is AdminMessageStatusAction {
  return Boolean(
    value && ADMIN_MESSAGE_STATUS_ACTION_VALUES.includes(value as AdminMessageStatusAction)
  );
}

export function parseAdminMessageStatusFilter(
  value: string | null | undefined
): AdminMessageStatusFilter {
  if (!value) return "all";
  return ADMIN_MESSAGE_STATUS_FILTER_VALUES.includes(value as AdminMessageStatusFilter)
    ? (value as AdminMessageStatusFilter)
    : "all";
}

export function parseAdminMessageSourceFilter(
  value: string | null | undefined
): AdminMessageSourceFilter {
  if (!value) return "all";
  return ADMIN_MESSAGE_SOURCE_FILTER_VALUES.includes(value as AdminMessageSourceFilter)
    ? (value as AdminMessageSourceFilter)
    : "all";
}

export function parseAdminMessagePageSize(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

export function parseAdminMessageCursor(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function normalizeAdminMessageSearchQuery(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function buildAdminMessageSearchOrFilter(query: string): string | null {
  const normalized = normalizeAdminMessageSearchQuery(query)
    .replace(/[%_,()"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length < 2) return null;

  const pattern = `%${normalized}%`;
  return [
    `submitter_email.ilike.${pattern}`,
    `submitter_name.ilike.${pattern}`,
    `message_body.ilike.${pattern}`,
  ].join(",");
}

export function parseAdminMessageStatusActionPayload(
  payload: Record<string, unknown>
): ParseResult<{
  action: AdminMessageStatusAction;
}> {
  const action = typeof payload.action === "string" ? payload.action.trim() : "";
  if (!isAdminMessageStatusAction(action)) {
    return { ok: false, error: "Unsupported message action." };
  }
  return { ok: true, value: { action } };
}

export function canMutateAdminMessages(role: AdminRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

export function resolveAdminMessageStatusAction(
  currentStatus: AdminMessageStatus,
  action: AdminMessageStatusAction
): ParseResult<{
  nextStatus: AdminMessageStatus;
}> {
  if (action === "restore") {
    if (currentStatus !== "archived" && currentStatus !== "deleted") {
      return { ok: false, error: "Only archived or deleted messages can be restored." };
    }
    return { ok: true, value: { nextStatus: "new" } };
  }

  if (currentStatus === "deleted") {
    return { ok: false, error: "Restore deleted messages before changing their status." };
  }

  if (action === "delete") return { ok: true, value: { nextStatus: "deleted" } };

  if (currentStatus === "archived") {
    return { ok: false, error: "Restore archived messages before changing their status." };
  }

  switch (action) {
    case "mark_read":
      return { ok: true, value: { nextStatus: "read" } };
    case "mark_unread":
      return { ok: true, value: { nextStatus: "new" } };
    case "needs_reply":
      return { ok: true, value: { nextStatus: "needs_reply" } };
    case "mark_replied":
      return { ok: true, value: { nextStatus: "replied" } };
    case "archive":
      return { ok: true, value: { nextStatus: "archived" } };
    default:
      return { ok: false, error: "Unsupported message action." };
  }
}

export function getAdminMessageSourceLabel(source: AdminMessageSource): string {
  switch (source) {
    case "preview_access_notify":
      return "Early access";
    case "analysis":
      return "Video analysis";
    case "goals_coaching":
      return "Goals coaching";
    case "contact":
    default:
      return "Contact";
  }
}

export function getAdminMessageStatusBucket(
  status: AdminMessageStatus
): Exclude<AdminMessageStatusFilter, "all"> {
  return status === "triaged" ? "read" : status;
}

export function getAdminMessageStatusLabel(status: AdminMessageStatus): string {
  switch (getAdminMessageStatusBucket(status)) {
    case "new":
      return "New";
    case "read":
      return "Read";
    case "needs_reply":
      return "Needs reply";
    case "replied":
      return "Replied";
    case "archived":
      return "Archived";
    case "deleted":
      return "Deleted";
  }
}

export function formatAdminMessagesNeedsReplyBadgeCount(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  const wholeCount = Math.floor(count);
  return wholeCount > ADMIN_MESSAGES_NEEDS_REPLY_BADGE_MAX
    ? `${ADMIN_MESSAGES_NEEDS_REPLY_BADGE_MAX}+`
    : String(wholeCount);
}

export function buildAdminMessagesTabAriaLabel(count: number | null): string {
  if (!count || !Number.isFinite(count) || count <= 0) return "Messages";
  const wholeCount = Math.floor(count);
  if (wholeCount > ADMIN_MESSAGES_NEEDS_REPLY_BADGE_MAX) {
    return `Messages, ${ADMIN_MESSAGES_NEEDS_REPLY_BADGE_MAX} or more need reply`;
  }
  return wholeCount === 1 ? "Messages, 1 needs reply" : `Messages, ${wholeCount} need reply`;
}

export function getAdminMessageDeliveryStatusLabel(status: AdminMessageDeliveryStatus): string {
  switch (status) {
    case "accepted_by_provider":
      return "Accepted";
    case "failed_retryable":
      return "Retryable failure";
    case "failed_final":
      return "Failed";
    case "disabled":
      return "Disabled";
    case "queued":
    default:
      return "Queued";
  }
}

export function getAdminMessageDeliveryTargetLabel(
  target: AdminMessageDeliveryAttemptRow["target"]
): string {
  switch (target) {
    case "admin_reply":
      return "Admin reply";
    case "system_notice":
      return "System notice";
    case "inbound_notification":
    default:
      return "Inbound notification";
  }
}

export function getAdminMessageProviderLabel(
  provider: AdminMessageDeliveryAttemptRow["provider_key"]
): string {
  switch (provider) {
    case "smtp_one_com_compatible":
      return "SMTP";
    case "resend_api":
      return "Resend API";
    case "resend_smtp":
      return "Resend SMTP";
    case "disabled":
    default:
      return "Disabled";
  }
}

function normalizeStructuredLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function stringifyJsonValue(value: Json): string {
  if (value === null) return "Not provided";
  if (typeof value === "string") return value.trim() || "Not provided";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((entry) => stringifyJsonValue(entry)).join(", ") || "Not provided";
  }
  return JSON.stringify(value);
}

function toJsonRecord(value: Json): Record<string, Json> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, Json>;
}

export function buildAdminMessageStructuredEntries(value: Json): AdminMessageStructuredEntry[] {
  return Object.entries(toJsonRecord(value))
    .map(([key, entry]) => ({
      key,
      label: normalizeStructuredLabel(key),
      value: stringifyJsonValue(entry),
    }))
    .filter((entry) => entry.value !== "Not provided");
}

export function buildAdminMessageRequestDiagnostics(value: Json): AdminMessageDiagnosticEntry[] {
  const metadata = toJsonRecord(value);
  const diagnostics: AdminMessageDiagnosticEntry[] = [];

  const originHost = stringifyJsonValue(metadata.originHost ?? null);
  if (originHost !== "Not provided") {
    diagnostics.push({ label: "Origin host", value: originHost });
  }

  const forwardedHost = stringifyJsonValue(metadata.forwardedHost ?? null);
  if (forwardedHost !== "Not provided") {
    diagnostics.push({ label: "Forwarded host", value: forwardedHost });
  }

  const contentLength = stringifyJsonValue(metadata.contentLength ?? null);
  if (contentLength !== "Not provided") {
    diagnostics.push({ label: "Content length", value: `${contentLength} bytes` });
  }

  if (metadata.ipHash) {
    diagnostics.push({ label: "IP evidence", value: "Hashed" });
  }

  if (metadata.userAgentHash) {
    diagnostics.push({ label: "User agent evidence", value: "Hashed" });
  }

  return diagnostics;
}

export function buildAdminMessageExcerpt(body: string): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) return "No message body.";
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

export function toAdminMessageDeliveryAttemptView(
  row: AdminMessageDeliveryAttemptRow
): AdminMessageDeliveryAttemptView {
  return {
    id: row.id,
    target: row.target,
    targetLabel: getAdminMessageDeliveryTargetLabel(row.target),
    providerKey: row.provider_key,
    providerLabel: getAdminMessageProviderLabel(row.provider_key),
    status: row.status,
    statusLabel: getAdminMessageDeliveryStatusLabel(row.status),
    providerMessageId: row.provider_message_id,
    errorCode: row.error_code,
    redactedErrorMessage: row.redacted_error_message,
    retryAfterSeconds: row.retry_after_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toAdminMessageItem(params: {
  row: AdminMessageRow;
  deliveryAttempts?: AdminMessageDeliveryAttemptRow[];
}): AdminMessageItem {
  const deliveryAttempts = (params.deliveryAttempts ?? [])
    .slice()
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .map(toAdminMessageDeliveryAttemptView);

  return {
    id: params.row.id,
    sourceVariant: params.row.source_variant,
    sourceLabel: getAdminMessageSourceLabel(params.row.source_variant),
    submitterName: params.row.submitter_name,
    submitterEmail: params.row.submitter_email,
    messageBody: params.row.message_body,
    messageExcerpt: buildAdminMessageExcerpt(params.row.message_body),
    structuredIntake: buildAdminMessageStructuredEntries(params.row.structured_intake),
    requestDiagnostics: buildAdminMessageRequestDiagnostics(params.row.request_metadata),
    status: params.row.status,
    statusBucket: getAdminMessageStatusBucket(params.row.status),
    statusLabel: getAdminMessageStatusLabel(params.row.status),
    notificationStatus: params.row.notification_status,
    notificationStatusLabel: getAdminMessageDeliveryStatusLabel(params.row.notification_status),
    notificationErrorCode: params.row.notification_error_code,
    createdAt: params.row.created_at,
    updatedAt: params.row.updated_at,
    deliveryAttempts,
  };
}
