import { randomUUID, createHash } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import {
  resolveMessageDeliveryAddressConfig,
  resolveMessageDeliveryProviderConfig,
  type MessageDeliveryErrorCode,
  type MessageDeliveryPayload,
  type MessageDeliveryResult,
} from "@/lib/admin/message-delivery";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const CONTACT_INTAKE_SOURCE_VARIANTS = [
  "contact",
  "analysis",
  "goals_coaching",
  "preview_access_notify",
] as const;

export type ContactIntakeSourceVariant = (typeof CONTACT_INTAKE_SOURCE_VARIANTS)[number];

export type ContactIntakeStorageMode = "supabase" | "local_verify";

export type ContactIntakeStructuredFields = Record<string, Json>;
export type ContactIntakeRequestMetadata = Record<string, Json>;

export type ContactIntakeMessageInput = {
  sourceVariant: ContactIntakeSourceVariant;
  submitterName: string;
  submitterEmail: string;
  messageBody: string;
  structuredIntake: ContactIntakeStructuredFields;
  requestMetadata: ContactIntakeRequestMetadata;
};

export type ContactIntakeStoreResult =
  | {
      ok: true;
      messageId: string;
      storageMode: ContactIntakeStorageMode;
    }
  | {
      ok: false;
      errorCode: "storage_unavailable" | "storage_insert_failed";
      redactedErrorMessage: string;
    };

export type ContactNotificationAttemptResult =
  | {
      ok: true;
      attemptId: string;
    }
  | {
      ok: false;
      errorCode: "attempt_insert_failed";
      redactedErrorMessage: string;
    };

type AdminSupabaseClient = SupabaseClient<Database>;
type AdminMessageInsert = Database["public"]["Tables"]["admin_messages"]["Insert"];
type AdminMessageDeliveryAttemptInsert =
  Database["public"]["Tables"]["admin_message_delivery_attempts"]["Insert"];
type AdminMessageDeliveryAttemptUpdate =
  Database["public"]["Tables"]["admin_message_delivery_attempts"]["Update"];
type AdminMessageUpdate = Database["public"]["Tables"]["admin_messages"]["Update"];

type ContactIntakeStorageOptions = {
  env?: NodeJS.ProcessEnv;
  supabase?: AdminSupabaseClient;
  localFilePath?: string;
};

type ContactNotificationPayloadResult =
  | {
      ok: true;
      payload: MessageDeliveryPayload;
    }
  | {
      ok: false;
      result: MessageDeliveryResult;
    };

const LOCAL_VERIFY_STORAGE_FILE = "freeswimming-contact-intake-local-verify.jsonl";
const MAX_LOCAL_RECORD_BYTES = 32_000;

function readEnv(env: NodeJS.ProcessEnv, key: string): string {
  return (env[key] ?? "").trim();
}

function extractMailboxAddress(value: string): string {
  const angleMatch = value.match(/<([^<>]+)>/);
  return (angleMatch?.[1] ?? value).trim();
}

function isValidEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(extractMailboxAddress(value));
}

function canUseLocalVerifyStorage(env: NodeJS.ProcessEnv): boolean {
  const supabaseEnv = readEnv(env, "FS_SUPABASE_ENV").toLowerCase();
  const vercelEnv = readEnv(env, "VERCEL_ENV").toLowerCase();
  const nodeEnv = readEnv(env, "NODE_ENV").toLowerCase();

  if (supabaseEnv === "production" || vercelEnv === "production") return false;
  if (supabaseEnv === "preview" || vercelEnv === "preview") return false;
  if (nodeEnv === "production" && !["local", "test", "ci"].includes(supabaseEnv)) return false;

  return true;
}

export function resolveContactIntakeStorageMode(
  env: NodeJS.ProcessEnv = process.env
): ContactIntakeStorageMode {
  if (readEnv(env, "CONTACT_INTAKE_STORAGE") === "local_verify" && canUseLocalVerifyStorage(env)) {
    return "local_verify";
  }

  return "supabase";
}

export function getLocalVerifyContactIntakeStorePath(env: NodeJS.ProcessEnv = process.env): string {
  return readEnv(env, "CONTACT_INTAKE_LOCAL_FILE") || join(tmpdir(), LOCAL_VERIFY_STORAGE_FILE);
}

function toJsonObject(value: ContactIntakeStructuredFields): ContactIntakeStructuredFields {
  return value;
}

function hashDiagnosticValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function safeUrlHost(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase().slice(0, 160);
  } catch {
    return null;
  }
}

function safeContentLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.min(Math.round(parsed), 1_000_000);
}

export function buildPrivacySafeRequestMetadata(
  req: Request,
  ip: string
): ContactIntakeRequestMetadata {
  const userAgent = req.headers.get("user-agent") ?? "";
  return {
    ipHash: hashDiagnosticValue(ip),
    userAgentHash: userAgent ? hashDiagnosticValue(userAgent) : null,
    originHost: safeUrlHost(req.headers.get("origin")),
    forwardedHost: (req.headers.get("x-forwarded-host") ?? "").split(",")[0]?.trim() || null,
    contentLength: safeContentLength(req.headers.get("content-length")),
  };
}

function toRedactedStorageError(error: unknown): string {
  const raw =
    error instanceof Error
      ? `${error.name || "Error"}: ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  return raw
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

async function appendLocalVerifyRecord(
  value: Record<string, unknown>,
  options: ContactIntakeStorageOptions
) {
  const filePath = options.localFilePath ?? getLocalVerifyContactIntakeStorePath(options.env);
  const jsonLine = `${JSON.stringify(value).slice(0, MAX_LOCAL_RECORD_BYTES)}\n`;
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, jsonLine, "utf8");
}

export async function storeContactIntakeMessage(
  input: ContactIntakeMessageInput,
  options: ContactIntakeStorageOptions = {}
): Promise<ContactIntakeStoreResult> {
  const env = options.env ?? process.env;
  const storageMode = resolveContactIntakeStorageMode(env);
  const now = new Date().toISOString();

  if (storageMode === "local_verify") {
    const messageId = randomUUID();
    try {
      await appendLocalVerifyRecord(
        {
          type: "admin_message",
          id: messageId,
          sourceVariant: input.sourceVariant,
          submitterName: input.submitterName,
          submitterEmail: input.submitterEmail,
          messageBody: input.messageBody,
          structuredIntake: input.structuredIntake,
          requestMetadata: input.requestMetadata,
          status: "new",
          notificationStatus: "queued",
          createdAt: now,
          updatedAt: now,
        },
        { ...options, env }
      );
      return { ok: true, messageId, storageMode };
    } catch (error) {
      return {
        ok: false,
        errorCode: "storage_insert_failed",
        redactedErrorMessage: toRedactedStorageError(error),
      };
    }
  }

  try {
    const supabase = options.supabase ?? createAdminSupabaseClient();
    const insertPayload: AdminMessageInsert = {
      source_variant: input.sourceVariant,
      submitter_name: input.submitterName,
      submitter_email: input.submitterEmail,
      message_body: input.messageBody,
      structured_intake: toJsonObject(input.structuredIntake),
      request_metadata: toJsonObject(input.requestMetadata),
      status: "new",
      notification_status: "queued",
    };

    const { data, error } = await supabase
      .from("admin_messages")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data?.id) {
      return {
        ok: false,
        errorCode: "storage_insert_failed",
        redactedErrorMessage: toRedactedStorageError(error ?? "Missing inserted message id."),
      };
    }

    return { ok: true, messageId: data.id, storageMode };
  } catch (error) {
    return {
      ok: false,
      errorCode: "storage_unavailable",
      redactedErrorMessage: toRedactedStorageError(error),
    };
  }
}

export async function createContactNotificationAttempt(
  input: {
    messageId: string;
    requestMetadata: ContactIntakeRequestMetadata;
  },
  options: ContactIntakeStorageOptions = {}
): Promise<ContactNotificationAttemptResult> {
  const env = options.env ?? process.env;
  const storageMode = resolveContactIntakeStorageMode(env);
  const attemptId = randomUUID();
  const attempt: AdminMessageDeliveryAttemptInsert = {
    id: attemptId,
    target: "inbound_notification",
    message_id: input.messageId,
    reply_id: null,
    provider_key: resolveMessageDeliveryProviderConfig(env).providerKey,
    status: "queued",
    attempt_metadata: input.requestMetadata,
  };

  if (storageMode === "local_verify") {
    try {
      await appendLocalVerifyRecord(
        {
          type: "admin_message_delivery_attempt",
          ...attempt,
          createdAt: new Date().toISOString(),
        },
        { ...options, env }
      );
      return { ok: true, attemptId };
    } catch (error) {
      return {
        ok: false,
        errorCode: "attempt_insert_failed",
        redactedErrorMessage: toRedactedStorageError(error),
      };
    }
  }

  try {
    const supabase = options.supabase ?? createAdminSupabaseClient();
    const { error } = await supabase.from("admin_message_delivery_attempts").insert(attempt);
    if (error) {
      return {
        ok: false,
        errorCode: "attempt_insert_failed",
        redactedErrorMessage: toRedactedStorageError(error),
      };
    }
    return { ok: true, attemptId };
  } catch (error) {
    return {
      ok: false,
      errorCode: "attempt_insert_failed",
      redactedErrorMessage: toRedactedStorageError(error),
    };
  }
}

export async function updateContactNotificationAttempt(
  input: {
    messageId: string;
    attemptId: string;
    result: MessageDeliveryResult;
  },
  options: ContactIntakeStorageOptions = {}
): Promise<{ ok: true } | { ok: false; redactedErrorMessage: string }> {
  const env = options.env ?? process.env;
  const storageMode = resolveContactIntakeStorageMode(env);
  const attemptUpdate: AdminMessageDeliveryAttemptUpdate = {
    provider_key: input.result.providerKey,
    status: input.result.status,
    provider_message_id: input.result.providerMessageId ?? null,
    error_code: input.result.errorCode ?? null,
    retry_after_seconds: input.result.retryAfterSeconds ?? null,
    redacted_error_message: input.result.redactedErrorMessage ?? null,
  };
  const messageUpdate: AdminMessageUpdate = {
    notification_status: input.result.status,
    notification_error_code: input.result.errorCode ?? null,
  };

  if (storageMode === "local_verify") {
    try {
      await appendLocalVerifyRecord(
        {
          type: "admin_message_delivery_attempt_update",
          messageId: input.messageId,
          attemptId: input.attemptId,
          attemptUpdate,
          messageUpdate,
          updatedAt: new Date().toISOString(),
        },
        { ...options, env }
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, redactedErrorMessage: toRedactedStorageError(error) };
    }
  }

  try {
    const supabase = options.supabase ?? createAdminSupabaseClient();
    const attemptResult = await supabase
      .from("admin_message_delivery_attempts")
      .update(attemptUpdate)
      .eq("id", input.attemptId);
    if (attemptResult.error) {
      return { ok: false, redactedErrorMessage: toRedactedStorageError(attemptResult.error) };
    }

    const messageResult = await supabase
      .from("admin_messages")
      .update(messageUpdate)
      .eq("id", input.messageId);
    if (messageResult.error) {
      return { ok: false, redactedErrorMessage: toRedactedStorageError(messageResult.error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, redactedErrorMessage: toRedactedStorageError(error) };
  }
}

function failedNotificationConfig(
  errorCode: Extract<MessageDeliveryErrorCode, "provider_config_missing" | "payload_invalid">,
  redactedErrorMessage: string
): ContactNotificationPayloadResult {
  return {
    ok: false,
    result: {
      providerKey: "disabled",
      status: errorCode === "provider_config_missing" ? "disabled" : "failed_final",
      errorCode,
      redactedErrorMessage,
    },
  };
}

export function buildContactNotificationContent(input: {
  sourceVariant: ContactIntakeSourceVariant;
  submitterName: string;
  submitterEmail: string;
  messageBody: string;
  structuredIntake: ContactIntakeStructuredFields;
  requestMetadata: ContactIntakeRequestMetadata;
}): { subject: string; text: string } {
  const subject =
    input.sourceVariant === "analysis"
      ? `Freeswimming - Video analysis request (${input.submitterName})`
      : input.sourceVariant === "goals_coaching"
        ? `Freeswimming - Goals coaching intake (${input.submitterName})`
        : input.sourceVariant === "preview_access_notify"
          ? `Freeswimming - Preview notify request (${input.submitterName})`
          : `Freeswimming - New contact message (${input.submitterName})`;

  const structuredLines = Object.entries(input.structuredIntake)
    .map(([key, value]) => `${key}: ${value ?? "Not provided"}`)
    .join("\n");

  const text =
    `Variant: ${input.sourceVariant}\n` +
    `Name: ${input.submitterName}\n` +
    `Email: ${input.submitterEmail}\n` +
    `IP hash: ${input.requestMetadata.ipHash ?? "not_recorded"}\n` +
    (structuredLines ? `\nStructured intake:\n${structuredLines}\n` : "") +
    `\nMessage:\n${input.messageBody || "(No additional message)"}\n`;

  return { subject, text };
}

export function buildContactNotificationPayload(input: {
  messageId: string;
  attemptId: string;
  sourceVariant: ContactIntakeSourceVariant;
  submitterName: string;
  submitterEmail: string;
  messageBody: string;
  structuredIntake: ContactIntakeStructuredFields;
  requestMetadata: ContactIntakeRequestMetadata;
  env?: NodeJS.ProcessEnv;
}): ContactNotificationPayloadResult {
  const env = input.env ?? process.env;
  const to = readEnv(env, "CONTACT_TO_EMAIL");
  if (!to) {
    return failedNotificationConfig(
      "provider_config_missing",
      "Contact notification recipient is missing."
    );
  }
  if (!isValidEmailAddress(to)) {
    return failedNotificationConfig(
      "payload_invalid",
      "Contact notification recipient is invalid."
    );
  }

  const addressConfig = resolveMessageDeliveryAddressConfig(env);
  if (addressConfig.missingFields.length > 0) {
    return failedNotificationConfig(
      "provider_config_missing",
      "Contact notification sender is missing."
    );
  }
  if (!addressConfig.from || addressConfig.invalidFields.length > 0) {
    return failedNotificationConfig("payload_invalid", "Contact notification sender is invalid.");
  }

  const content = buildContactNotificationContent(input);
  return {
    ok: true,
    payload: {
      attemptId: input.attemptId,
      target: "inbound_notification",
      messageId: input.messageId,
      to,
      from: addressConfig.from,
      replyTo: input.submitterEmail,
      subject: content.subject,
      text: content.text,
    },
  };
}
