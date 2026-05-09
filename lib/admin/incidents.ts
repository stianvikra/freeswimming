import { createHash, randomUUID } from "node:crypto";
import {
  deliverMessage,
  resolveMessageDeliveryAddressConfig,
  type MessageDeliveryEnv,
  type MessageDeliveryPayload,
  type MessageDeliveryResult,
} from "@/lib/admin/message-delivery";

export const ADMIN_INCIDENT_CATEGORIES = [
  "auth_sign_in_service_restricted",
  "auth_sign_in_email_delivery_failed",
  "preview_access_unlock_failed",
  "checkout_unavailable",
  "save_export_failed",
] as const;

export type AdminIncidentCategory = (typeof ADMIN_INCIDENT_CATEGORIES)[number];
export type AdminIncidentSeverity = "P0" | "P1" | "P2";
export type AdminIncidentAffectedFlow =
  | "auth_sign_in"
  | "preview_access"
  | "checkout"
  | "save_export";

export type AdminIncidentInput = {
  category: AdminIncidentCategory;
  severity: AdminIncidentSeverity;
  affectedFlow: AdminIncidentAffectedFlow;
  context?: Record<string, unknown>;
};

export type AdminIncidentAlertResult =
  | {
      ok: true;
      status: "sent";
      category: AdminIncidentCategory;
      dedupeKey: string;
      count: number;
      resetAt: string;
      delivery: MessageDeliveryResult;
    }
  | {
      ok: true;
      status: "suppressed";
      category: AdminIncidentCategory;
      dedupeKey: string;
      count: number;
      resetAt: string;
    }
  | {
      ok: false;
      status: "disabled";
      category: AdminIncidentCategory;
      reason:
        | "alerts_disabled"
        | "recipient_missing"
        | "recipient_invalid"
        | "sender_missing"
        | "sender_invalid";
    }
  | {
      ok: false;
      status: "delivery_failed";
      category: AdminIncidentCategory;
      dedupeKey: string;
      count: number;
      resetAt: string;
      delivery?: MessageDeliveryResult;
    };

type SafeJsonValue =
  | string
  | number
  | boolean
  | null
  | SafeJsonValue[]
  | { [key: string]: SafeJsonValue };

type DedupeSlot = {
  count: number;
  resetAt: Date;
};

type ReportAdminIncidentOptions = {
  env?: MessageDeliveryEnv;
  now?: Date;
  deliverMessageImpl?: (payload: MessageDeliveryPayload) => Promise<MessageDeliveryResult>;
};

const DEFAULT_DEDUPE_WINDOW_SECONDS = 15 * 60;
const MIN_DEDUPE_WINDOW_SECONDS = 60;
const MAX_DEDUPE_WINDOW_SECONDS = 24 * 60 * 60;
const MAX_CONTEXT_DEPTH = 3;
const MAX_CONTEXT_KEYS = 20;
const MAX_CONTEXT_ARRAY_ITEMS = 10;
const MAX_CONTEXT_STRING_LENGTH = 320;

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const BEARER_PATTERN = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
const SECRET_ASSIGNMENT_PATTERN =
  /\b(api[-_ ]?key|authorization|cookie|password|secret|session|token)\s*[:=]\s*[^\s,;&]+/gi;
const SENSITIVE_CONTEXT_KEY_PATTERN =
  /(allowlist|api[-_]?key|authorization|bearer|body|content|cookie|customer|email|html|ip|jwt|message|password|secret|session|subject|text|token|user)/i;

const incidentDedupeHits = new Map<string, { count: number; resetAt: number }>();
let hasLoggedUpstashFallback = false;

function readEnv(env: MessageDeliveryEnv, key: string): string {
  return (env[key] ?? "").trim();
}

function isExplicitlyDisabled(value: string): boolean {
  return ["0", "false", "no", "off"].includes(value.trim().toLowerCase());
}

function isIncidentAlertsEnabled(env: MessageDeliveryEnv): boolean {
  return !isExplicitlyDisabled(readEnv(env, "INCIDENT_ALERTS_ENABLED"));
}

function resolveEnvironmentLabel(env: MessageDeliveryEnv): string {
  return (
    readEnv(env, "FS_SUPABASE_ENV") ||
    readEnv(env, "VERCEL_ENV") ||
    readEnv(env, "NODE_ENV") ||
    "unknown"
  );
}

function resolveIncidentRecipient(env: MessageDeliveryEnv): string {
  return readEnv(env, "INCIDENT_ALERT_TO_EMAIL") || readEnv(env, "CONTACT_TO_EMAIL");
}

function isValidEmailAddress(value: string): boolean {
  const angleMatch = value.match(/<([^<>]+)>/);
  const address = (angleMatch?.[1] ?? value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address);
}

function parseDedupeWindowMs(env: MessageDeliveryEnv): number {
  const raw = readEnv(env, "INCIDENT_ALERT_DEDUPE_WINDOW_SECONDS");
  const parsed = raw ? Number(raw) : NaN;
  const seconds = Number.isFinite(parsed) ? Math.round(parsed) : DEFAULT_DEDUPE_WINDOW_SECONDS;
  return Math.min(MAX_DEDUPE_WINDOW_SECONDS, Math.max(MIN_DEDUPE_WINDOW_SECONDS, seconds)) * 1000;
}

function shouldUseUpstash(env: MessageDeliveryEnv): boolean {
  return (
    Boolean(readEnv(env, "UPSTASH_REDIS_REST_URL")) &&
    Boolean(readEnv(env, "UPSTASH_REDIS_REST_TOKEN"))
  );
}

function logUpstashFallbackOnce(error: unknown) {
  if (hasLoggedUpstashFallback) return;
  hasLoggedUpstashFallback = true;
  console.error("[IncidentAlert] Upstash dedupe failed. Falling back to in-memory.", error);
}

async function upstashCommand(env: MessageDeliveryEnv, parts: string[]): Promise<unknown> {
  const url = readEnv(env, "UPSTASH_REDIS_REST_URL");
  const token = readEnv(env, "UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;

  const endpoint = `${url.replace(/\/+$/, "")}/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Upstash command failed (${response.status}) ${text}`);
  }

  const json = (await response.json().catch(() => null)) as { result?: unknown } | null;
  return json?.result ?? null;
}

function reserveInMemoryDedupeSlot(key: string, windowMs: number, now: Date): DedupeSlot {
  const nowMs = now.getTime();
  const existing = incidentDedupeHits.get(key);

  if (!existing || existing.resetAt <= nowMs) {
    const resetAt = nowMs + windowMs;
    incidentDedupeHits.set(key, { count: 1, resetAt });
    return { count: 1, resetAt: new Date(resetAt) };
  }

  existing.count += 1;
  incidentDedupeHits.set(key, existing);
  return { count: existing.count, resetAt: new Date(existing.resetAt) };
}

async function reserveDedupeSlot(
  env: MessageDeliveryEnv,
  key: string,
  windowMs: number,
  now: Date
): Promise<DedupeSlot> {
  if (!shouldUseUpstash(env)) {
    return reserveInMemoryDedupeSlot(key, windowMs, now);
  }

  try {
    const countRaw = await upstashCommand(env, ["INCR", key]);
    const count = Number(countRaw);
    if (!Number.isFinite(count)) {
      throw new Error("Invalid INCR response");
    }

    let ttlMs = Number(await upstashCommand(env, ["PTTL", key]));
    if (!Number.isFinite(ttlMs) || ttlMs < 0 || count === 1) {
      await upstashCommand(env, ["PEXPIRE", key, String(windowMs)]);
      ttlMs = windowMs;
    }

    return {
      count,
      resetAt: new Date(now.getTime() + Math.max(1, ttlMs)),
    };
  } catch (error) {
    logUpstashFallbackOnce(error);
    return reserveInMemoryDedupeSlot(key, windowMs, now);
  }
}

function truncateSafeString(value: string): string {
  if (value.length <= MAX_CONTEXT_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_CONTEXT_STRING_LENGTH)}...`;
}

function redactIncidentString(value: string): string {
  return truncateSafeString(
    value
      .replace(BEARER_PATTERN, "$1 [redacted]")
      .replace(SECRET_ASSIGNMENT_PATTERN, "$1=[redacted]")
      .replace(EMAIL_PATTERN, "[redacted-email]")
      .replace(IPV4_PATTERN, "[redacted-ip]")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function toSafeContextKey(key: string): string {
  const normalized = key
    .trim()
    .replace(/[^A-Za-z0-9_.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return normalized || "field";
}

function sanitizeValue(value: unknown, depth: number): SafeJsonValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return redactIncidentString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return sanitizeValue(
      {
        name: value.name,
        message: value.message,
      },
      depth + 1
    );
  }
  if (Array.isArray(value)) {
    if (depth >= MAX_CONTEXT_DEPTH) return "[redacted-depth-limit]";
    return value.slice(0, MAX_CONTEXT_ARRAY_ITEMS).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    if (depth >= MAX_CONTEXT_DEPTH) return "[redacted-depth-limit]";
    const safe: { [key: string]: SafeJsonValue } = {};
    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_CONTEXT_KEYS);
    for (const [rawKey, rawValue] of entries) {
      const key = toSafeContextKey(rawKey);
      safe[key] = SENSITIVE_CONTEXT_KEY_PATTERN.test(key)
        ? "[redacted]"
        : sanitizeValue(rawValue, depth + 1);
    }
    return safe;
  }
  return redactIncidentString(String(value));
}

export function sanitizeIncidentContext(context: Record<string, unknown> = {}): SafeJsonValue {
  return sanitizeValue(context, 0);
}

function toDedupePart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || "unknown";
}

function buildDedupeKey(input: AdminIncidentInput, environment: string): string {
  return [
    "incident",
    toDedupePart(environment),
    toDedupePart(input.affectedFlow),
    toDedupePart(input.category),
  ].join(":");
}

function buildSubject(input: AdminIncidentInput): string {
  return `[Freeswimming ${input.severity}] ${input.category}`;
}

function buildIncidentEmailText(input: {
  incident: AdminIncidentInput;
  environment: string;
  dedupeKey: string;
  dedupeWindowMs: number;
  count: number;
  resetAt: Date;
  now: Date;
  safeContext: SafeJsonValue;
}): string {
  const contextJson = JSON.stringify(input.safeContext, null, 2);
  const dedupeWindowMinutes = Math.round(input.dedupeWindowMs / 60_000);

  return [
    `Freeswimming incident alert (${input.incident.severity})`,
    "",
    `Category: ${input.incident.category}`,
    `Affected flow: ${input.incident.affectedFlow}`,
    `Environment: ${input.environment}`,
    `First alert in window: ${input.now.toISOString()}`,
    `Last seen in window: ${input.now.toISOString()}`,
    `Dedupe key: ${input.dedupeKey}`,
    `Dedupe count: ${input.count}`,
    `Dedupe window: ${dedupeWindowMinutes} minutes`,
    `Suppressed until: ${input.resetAt.toISOString()}`,
    "",
    "Safe diagnostic context:",
    contextJson,
    "",
    "Log query hint:",
    `[IncidentAlert] ${input.incident.category}`,
    "",
    "Runbook:",
    "docs/runbooks/core-flow-incident-response.md",
    "",
    "Codex-ready prompt:",
    `Investigate Freeswimming incident ${input.incident.category} in ${input.environment}. Start with docs/runbooks/core-flow-incident-response.md, inspect affected flow ${input.incident.affectedFlow}, keep diagnostics redacted, and propose the smallest safe fix with tests.`,
  ].join("\n");
}

export function hashIncidentDiagnosticValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function reportAdminIncident(
  input: AdminIncidentInput,
  options: ReportAdminIncidentOptions = {}
): Promise<AdminIncidentAlertResult> {
  const env = options.env ?? process.env;
  const now = options.now ?? new Date();

  if (!isIncidentAlertsEnabled(env)) {
    return {
      ok: false,
      status: "disabled",
      category: input.category,
      reason: "alerts_disabled",
    };
  }

  const to = resolveIncidentRecipient(env);
  if (!to) {
    return {
      ok: false,
      status: "disabled",
      category: input.category,
      reason: "recipient_missing",
    };
  }
  if (!isValidEmailAddress(to)) {
    return {
      ok: false,
      status: "disabled",
      category: input.category,
      reason: "recipient_invalid",
    };
  }

  const addressConfig = resolveMessageDeliveryAddressConfig(env);
  if (addressConfig.missingFields.length > 0 || !addressConfig.from) {
    return {
      ok: false,
      status: "disabled",
      category: input.category,
      reason: "sender_missing",
    };
  }
  if (addressConfig.invalidFields.length > 0) {
    return {
      ok: false,
      status: "disabled",
      category: input.category,
      reason: "sender_invalid",
    };
  }

  const environment = resolveEnvironmentLabel(env);
  const dedupeWindowMs = parseDedupeWindowMs(env);
  const dedupeKey = buildDedupeKey(input, environment);
  const slot = await reserveDedupeSlot(env, dedupeKey, dedupeWindowMs, now);
  const resetAt = slot.resetAt.toISOString();

  if (slot.count > 1) {
    return {
      ok: true,
      status: "suppressed",
      category: input.category,
      dedupeKey,
      count: slot.count,
      resetAt,
    };
  }

  const attemptId = `incident_${randomUUID()}`;
  const payload: MessageDeliveryPayload = {
    attemptId,
    messageId: attemptId,
    target: "system_notice",
    to,
    from: addressConfig.from,
    replyTo: addressConfig.replyTo ?? undefined,
    subject: buildSubject(input),
    text: buildIncidentEmailText({
      incident: input,
      environment,
      dedupeKey,
      dedupeWindowMs,
      count: slot.count,
      resetAt: slot.resetAt,
      now,
      safeContext: sanitizeIncidentContext(input.context),
    }),
  };

  let delivery: MessageDeliveryResult | undefined;
  try {
    delivery = options.deliverMessageImpl
      ? await options.deliverMessageImpl(payload)
      : await deliverMessage(payload, { env });
  } catch (error) {
    console.error("[IncidentAlert] Could not deliver admin incident alert.", {
      category: input.category,
      dedupeKey,
      error: error instanceof Error ? error.name : "unknown",
    });
    return {
      ok: false,
      status: "delivery_failed",
      category: input.category,
      dedupeKey,
      count: slot.count,
      resetAt,
    };
  }

  if (delivery.status !== "accepted_by_provider") {
    console.error("[IncidentAlert] Could not deliver admin incident alert.", {
      category: input.category,
      dedupeKey,
      providerKey: delivery.providerKey,
      status: delivery.status,
      errorCode: delivery.errorCode,
      redactedErrorMessage: delivery.redactedErrorMessage,
    });
    return {
      ok: false,
      status: "delivery_failed",
      category: input.category,
      dedupeKey,
      count: slot.count,
      resetAt,
      delivery,
    };
  }

  return {
    ok: true,
    status: "sent",
    category: input.category,
    dedupeKey,
    count: slot.count,
    resetAt,
    delivery,
  };
}

export function __resetAdminIncidentMemoryForTests(): void {
  incidentDedupeHits.clear();
  hasLoggedUpstashFallback = false;
}
