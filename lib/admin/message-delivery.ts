import nodemailer from "nodemailer";

export const MESSAGE_DELIVERY_PROVIDER_KEYS = [
  "smtp_one_com_compatible",
  "resend_api",
  "resend_smtp",
  "disabled",
] as const;

export type MessageDeliveryProviderKey = (typeof MESSAGE_DELIVERY_PROVIDER_KEYS)[number];

export const MESSAGE_DELIVERY_TARGETS = [
  "inbound_notification",
  "admin_reply",
  "system_notice",
] as const;

export type MessageDeliveryTarget = (typeof MESSAGE_DELIVERY_TARGETS)[number];

export const MESSAGE_DELIVERY_STATUSES = [
  "queued",
  "accepted_by_provider",
  "failed_retryable",
  "failed_final",
  "disabled",
] as const;

export type MessageDeliveryStatus = (typeof MESSAGE_DELIVERY_STATUSES)[number];

export type MessageDeliveryErrorCode =
  | "provider_disabled"
  | "provider_invalid"
  | "provider_config_missing"
  | "payload_invalid"
  | "provider_timeout"
  | "provider_auth_failed"
  | "provider_rejected"
  | "provider_rate_limited"
  | "provider_request_failed"
  | "provider_response_invalid";

export type MessageDeliveryPayload = {
  attemptId: string;
  target: MessageDeliveryTarget;
  messageId: string;
  replyId?: string;
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
};

export type MessageDeliveryResult = {
  providerKey: MessageDeliveryProviderKey;
  status: MessageDeliveryStatus;
  providerMessageId?: string;
  errorCode?: MessageDeliveryErrorCode;
  retryAfterSeconds?: number;
  redactedErrorMessage?: string;
};

export type MessageDeliveryAttemptRecord = {
  attemptId: string;
  target: MessageDeliveryTarget;
  messageId: string;
  replyId: string | null;
  providerKey: MessageDeliveryProviderKey;
  status: MessageDeliveryStatus;
  providerMessageId: string | null;
  errorCode: MessageDeliveryErrorCode | null;
  retryAfterSeconds: number | null;
  redactedErrorMessage: string | null;
  updatedAt: string;
};

export type MessageDeliveryEnv = Readonly<Record<string, string | undefined>>;

export type MessageDeliveryAddressConfig = {
  from: string | null;
  replyTo: string | null;
  missingFields: string[];
  invalidFields: string[];
};

type DisabledProviderConfig = {
  providerKey: "disabled";
  timeoutMs: number;
  errorCode: Extract<
    MessageDeliveryErrorCode,
    "provider_disabled" | "provider_invalid" | "provider_config_missing"
  >;
  redactedErrorMessage: string;
  missingFields: string[];
};

type ResendApiProviderConfig = {
  providerKey: "resend_api";
  timeoutMs: number;
  apiKey: string;
  endpoint: string;
};

type SmtpProviderConfig = {
  providerKey: "smtp_one_com_compatible" | "resend_smtp";
  timeoutMs: number;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  messageIdDomain: string;
};

export type MessageDeliveryProviderConfig =
  | DisabledProviderConfig
  | ResendApiProviderConfig
  | SmtpProviderConfig;

export type MessageDeliveryProvider = {
  providerKey: MessageDeliveryProviderKey;
  send(payload: MessageDeliveryPayload): Promise<MessageDeliveryResult>;
};

type ResendApiResponse = {
  id?: unknown;
};

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

type SmtpMailInput = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  messageId: string;
};

type SmtpSendResult = {
  messageId?: string | false;
};

type SmtpTransport = {
  sendMail(input: SmtpMailInput): Promise<SmtpSendResult>;
};

type MessageDeliveryProviderDeps = {
  fetchImpl?: FetchLike;
  smtpTransportFactory?: (config: SmtpProviderConfig) => SmtpTransport;
};

type DeliverMessageOptions = MessageDeliveryProviderDeps & {
  env?: MessageDeliveryEnv;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const HARD_TIMEOUT_MS = 15_000;
const MIN_TIMEOUT_MS = 1_000;
const DEFAULT_RESEND_API_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_MESSAGE_ID_DOMAIN = "freeswimming.app";
const MAX_REDACTED_MESSAGE_LENGTH = 240;

const SENSITIVE_KEY_PATTERN =
  /(api[-_ ]?key|authorization|bearer|body|content|cookie|html|message|password|secret|subject|text|token)/i;

function readEnv(env: MessageDeliveryEnv, name: string): string {
  return (env[name] ?? "").trim();
}

function isMessageDeliveryProviderKey(value: string): value is MessageDeliveryProviderKey {
  return MESSAGE_DELIVERY_PROVIDER_KEYS.includes(value as MessageDeliveryProviderKey);
}

function resolveProviderKey(value: string): MessageDeliveryProviderKey | "invalid" {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "disabled";
  if (normalized === "smtp" || normalized === "one_com" || normalized === "one.com") {
    return "smtp_one_com_compatible";
  }
  if (normalized === "resend") return "resend_api";
  if (isMessageDeliveryProviderKey(normalized)) return normalized;
  return "invalid";
}

function parseTimeoutMs(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS;
  return Math.min(HARD_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Math.round(parsed)));
}

function parsePort(raw: string, fallback: number): number | null {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) return null;
  return parsed;
}

function parseBoolean(raw: string, fallback: boolean): boolean {
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function disabledConfig(input: {
  timeoutMs: number;
  errorCode: DisabledProviderConfig["errorCode"];
  redactedErrorMessage: string;
  missingFields?: string[];
}): DisabledProviderConfig {
  return {
    providerKey: "disabled",
    timeoutMs: input.timeoutMs,
    errorCode: input.errorCode,
    redactedErrorMessage: input.redactedErrorMessage,
    missingFields: input.missingFields ?? [],
  };
}

export function resolveMessageDeliveryProviderConfig(
  env: MessageDeliveryEnv = process.env
): MessageDeliveryProviderConfig {
  const timeoutMs = parseTimeoutMs(readEnv(env, "MESSAGE_DELIVERY_TIMEOUT_MS"));
  const providerKey = resolveProviderKey(readEnv(env, "MESSAGE_DELIVERY_PROVIDER"));

  if (providerKey === "invalid") {
    return disabledConfig({
      timeoutMs,
      errorCode: "provider_invalid",
      redactedErrorMessage: "Unsupported MESSAGE_DELIVERY_PROVIDER value.",
    });
  }

  if (providerKey === "disabled") {
    return disabledConfig({
      timeoutMs,
      errorCode: "provider_disabled",
      redactedErrorMessage: "Message delivery provider is disabled.",
    });
  }

  if (providerKey === "resend_api") {
    const apiKey =
      readEnv(env, "MESSAGE_DELIVERY_RESEND_API_KEY") || readEnv(env, "RESEND_API_KEY");
    if (!apiKey) {
      return disabledConfig({
        timeoutMs,
        errorCode: "provider_config_missing",
        redactedErrorMessage: "Resend API provider is missing API key configuration.",
        missingFields: ["MESSAGE_DELIVERY_RESEND_API_KEY"],
      });
    }

    return {
      providerKey,
      timeoutMs,
      apiKey,
      endpoint: readEnv(env, "MESSAGE_DELIVERY_RESEND_API_URL") || DEFAULT_RESEND_API_ENDPOINT,
    };
  }

  const host = readEnv(env, "MESSAGE_DELIVERY_SMTP_HOST");
  const user = readEnv(env, "MESSAGE_DELIVERY_SMTP_USER");
  const password = readEnv(env, "MESSAGE_DELIVERY_SMTP_PASSWORD");
  const defaultPort = providerKey === "smtp_one_com_compatible" ? 465 : 587;
  const port = parsePort(readEnv(env, "MESSAGE_DELIVERY_SMTP_PORT"), defaultPort);
  const missingFields = [
    ["MESSAGE_DELIVERY_SMTP_HOST", host],
    ["MESSAGE_DELIVERY_SMTP_USER", user],
    ["MESSAGE_DELIVERY_SMTP_PASSWORD", password],
    ["MESSAGE_DELIVERY_SMTP_PORT", port === null ? "" : String(port)],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingFields.length > 0 || port === null) {
    return disabledConfig({
      timeoutMs,
      errorCode: "provider_config_missing",
      redactedErrorMessage: "SMTP provider is missing required server-only configuration.",
      missingFields,
    });
  }

  return {
    providerKey,
    timeoutMs,
    host,
    port,
    secure: parseBoolean(readEnv(env, "MESSAGE_DELIVERY_SMTP_SECURE"), port === 465),
    user,
    password,
    messageIdDomain:
      readEnv(env, "MESSAGE_DELIVERY_MESSAGE_ID_DOMAIN") || DEFAULT_MESSAGE_ID_DOMAIN,
  };
}

function extractMailboxAddress(value: string): string {
  const angleMatch = value.match(/<([^<>]+)>/);
  return (angleMatch?.[1] ?? value).trim();
}

function isValidEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(extractMailboxAddress(value));
}

export function resolveMessageDeliveryAddressConfig(
  env: MessageDeliveryEnv = process.env
): MessageDeliveryAddressConfig {
  const from = readEnv(env, "MESSAGE_DELIVERY_FROM_EMAIL") || readEnv(env, "CONTACT_FROM_EMAIL");
  const replyTo = readEnv(env, "MESSAGE_DELIVERY_REPLY_TO_EMAIL");
  const invalidFields: string[] = [];

  if (from && !isValidEmailAddress(from)) {
    invalidFields.push(
      readEnv(env, "MESSAGE_DELIVERY_FROM_EMAIL")
        ? "MESSAGE_DELIVERY_FROM_EMAIL"
        : "CONTACT_FROM_EMAIL"
    );
  }

  if (replyTo && !isValidEmailAddress(replyTo)) {
    invalidFields.push("MESSAGE_DELIVERY_REPLY_TO_EMAIL");
  }

  return {
    from: from || null,
    replyTo: replyTo || null,
    missingFields: from ? [] : ["MESSAGE_DELIVERY_FROM_EMAIL"],
    invalidFields,
  };
}

function validateMessageDeliveryPayload(
  payload: MessageDeliveryPayload
): MessageDeliveryResult | null {
  if (
    !payload ||
    !MESSAGE_DELIVERY_TARGETS.includes(payload.target) ||
    !payload.attemptId.trim() ||
    !payload.messageId.trim() ||
    !payload.to.trim() ||
    !payload.from.trim() ||
    !payload.subject.trim() ||
    !payload.text.trim()
  ) {
    return {
      providerKey: "disabled",
      status: "failed_final",
      errorCode: "payload_invalid",
      redactedErrorMessage: "Message delivery payload is missing required fields.",
    };
  }

  if (!isValidEmailAddress(payload.to) || !isValidEmailAddress(payload.from)) {
    return {
      providerKey: "disabled",
      status: "failed_final",
      errorCode: "payload_invalid",
      redactedErrorMessage: "Message delivery payload has invalid recipient or sender address.",
    };
  }

  if (payload.replyTo && !isValidEmailAddress(payload.replyTo)) {
    return {
      providerKey: "disabled",
      status: "failed_final",
      errorCode: "payload_invalid",
      redactedErrorMessage: "Message delivery payload has invalid reply-to address.",
    };
  }

  if (payload.target === "admin_reply" && !payload.replyId?.trim()) {
    return {
      providerKey: "disabled",
      status: "failed_final",
      errorCode: "payload_invalid",
      redactedErrorMessage: "Admin reply delivery requires a reply ID.",
    };
  }

  return null;
}

export function redactMessageDeliveryDiagnostic(
  value: unknown,
  secrets: readonly string[] = []
): string {
  let redacted =
    value instanceof Error
      ? `${value.name || "Error"}: ${value.message}`
      : typeof value === "string"
        ? value
        : JSON.stringify(value);

  for (const secret of secrets) {
    if (secret.length >= 4) {
      redacted = redacted.split(secret).join("[redacted-secret]");
    }
  }

  redacted = redacted
    .replace(
      /"([^"]*(?:apiKey|authorization|body|content|html|message|password|secret|subject|text|token)[^"]*)"\s*:\s*"[^"]*"/gi,
      '"$1":"[redacted]"'
    )
    .replace(
      /'([^']*(?:apiKey|authorization|body|content|html|message|password|secret|subject|text|token)[^']*)'\s*:\s*'[^']*'/gi,
      "'$1':'[redacted]'"
    )
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [redacted]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(
      /\b(api[-_ ]?key|authorization|password|secret|token)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[redacted]"
    );

  const compacted = redacted.replace(/\s+/g, " ").trim();
  if (compacted.length <= MAX_REDACTED_MESSAGE_LENGTH) return compacted;
  return `${compacted.slice(0, MAX_REDACTED_MESSAGE_LENGTH)}...`;
}

function getProviderSecrets(config: MessageDeliveryProviderConfig): string[] {
  if (config.providerKey === "resend_api") return [config.apiKey];
  if (config.providerKey === "smtp_one_com_compatible" || config.providerKey === "resend_smtp") {
    return [config.user, config.password];
  }
  return [];
}

function resultFromDisabledConfig(config: DisabledProviderConfig): MessageDeliveryResult {
  return {
    providerKey: "disabled",
    status: "disabled",
    errorCode: config.errorCode,
    redactedErrorMessage: config.redactedErrorMessage,
  };
}

function getRetryAfterSeconds(response: Response): number | undefined {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) return undefined;
  const numeric = Number(retryAfter);
  if (Number.isFinite(numeric) && numeric > 0) return Math.ceil(numeric);
  const retryDate = Date.parse(retryAfter);
  if (Number.isFinite(retryDate)) {
    return Math.max(1, Math.ceil((retryDate - Date.now()) / 1000));
  }
  return undefined;
}

function classifyHttpFailure(status: number): {
  status: MessageDeliveryStatus;
  errorCode: MessageDeliveryErrorCode;
} {
  if (status === 401 || status === 403) {
    return { status: "failed_final", errorCode: "provider_auth_failed" };
  }
  if (status === 429) {
    return { status: "failed_retryable", errorCode: "provider_rate_limited" };
  }
  if (status >= 500) {
    return { status: "failed_retryable", errorCode: "provider_request_failed" };
  }
  return { status: "failed_final", errorCode: "provider_rejected" };
}

function classifyProviderException(
  providerKey: MessageDeliveryProviderKey,
  error: unknown,
  secrets: readonly string[]
): MessageDeliveryResult {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const name = error instanceof Error ? error.name : "";
  const lower = `${code} ${name} ${String(error)}`.toLowerCase();

  if (lower.includes("abort") || lower.includes("timeout") || lower.includes("etimedout")) {
    return {
      providerKey,
      status: "failed_retryable",
      errorCode: "provider_timeout",
      retryAfterSeconds: 60,
      redactedErrorMessage: redactMessageDeliveryDiagnostic(error, secrets),
    };
  }

  if (lower.includes("eauth") || lower.includes("auth") || lower.includes("credential")) {
    return {
      providerKey,
      status: "failed_final",
      errorCode: "provider_auth_failed",
      redactedErrorMessage: redactMessageDeliveryDiagnostic(error, secrets),
    };
  }

  return {
    providerKey,
    status: "failed_retryable",
    errorCode: "provider_request_failed",
    retryAfterSeconds: 60,
    redactedErrorMessage: redactMessageDeliveryDiagnostic(error, secrets),
  };
}

async function sendWithResendApi(
  payload: MessageDeliveryPayload,
  config: ResendApiProviderConfig,
  deps: MessageDeliveryProviderDeps
): Promise<MessageDeliveryResult> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetchImpl(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": payload.attemptId,
      },
      body: JSON.stringify({
        from: payload.from,
        to: [payload.to],
        reply_to: payload.replyTo,
        subject: payload.subject,
        text: payload.text,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const failure = classifyHttpFailure(response.status);
      const providerText = await response.text().catch(() => "");
      return {
        providerKey: config.providerKey,
        status: failure.status,
        errorCode: failure.errorCode,
        retryAfterSeconds: getRetryAfterSeconds(response),
        redactedErrorMessage: redactMessageDeliveryDiagnostic(
          `Resend API ${response.status}: ${providerText}`,
          [
            config.apiKey,
            payload.to,
            payload.from,
            payload.replyTo ?? "",
            payload.subject,
            payload.text,
          ]
        ),
      };
    }

    const json = (await response.json().catch(() => null)) as ResendApiResponse | null;
    const providerMessageId = typeof json?.id === "string" ? json.id : undefined;

    return {
      providerKey: config.providerKey,
      status: "accepted_by_provider",
      providerMessageId,
    };
  } catch (error) {
    return classifyProviderException(config.providerKey, error, [
      config.apiKey,
      payload.to,
      payload.from,
      payload.replyTo ?? "",
      payload.subject,
      payload.text,
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function defaultSmtpTransportFactory(config: SmtpProviderConfig): SmtpTransport {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    connectionTimeout: config.timeoutMs,
    greetingTimeout: config.timeoutMs,
    socketTimeout: config.timeoutMs,
  }) as SmtpTransport;
}

function toMessageIdAtom(value: string): string {
  const atom = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return atom || "attempt";
}

function toMessageIdDomain(value: string): string {
  const domain = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "")
    .replace(/^\.+|\.+$/g, "");
  return domain || DEFAULT_MESSAGE_ID_DOMAIN;
}

function buildSmtpMessageId(payload: MessageDeliveryPayload, config: SmtpProviderConfig): string {
  return `<${toMessageIdAtom(payload.attemptId)}@${toMessageIdDomain(config.messageIdDomain)}>`;
}

async function sendWithSmtp(
  payload: MessageDeliveryPayload,
  config: SmtpProviderConfig,
  deps: MessageDeliveryProviderDeps
): Promise<MessageDeliveryResult> {
  const transportFactory = deps.smtpTransportFactory ?? defaultSmtpTransportFactory;
  const secrets = [...getProviderSecrets(config), payload.to, payload.from, payload.replyTo ?? ""];

  try {
    const result = await transportFactory(config).sendMail({
      to: payload.to,
      from: payload.from,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      messageId: buildSmtpMessageId(payload, config),
    });

    return {
      providerKey: config.providerKey,
      status: "accepted_by_provider",
      providerMessageId: typeof result.messageId === "string" ? result.messageId : undefined,
    };
  } catch (error) {
    return classifyProviderException(config.providerKey, error, [
      ...secrets,
      payload.subject,
      payload.text,
    ]);
  }
}

export function createMessageDeliveryProvider(
  config: MessageDeliveryProviderConfig,
  deps: MessageDeliveryProviderDeps = {}
): MessageDeliveryProvider {
  return {
    providerKey: config.providerKey,
    async send(payload) {
      const invalidPayload = validateMessageDeliveryPayload(payload);
      if (invalidPayload) return invalidPayload;

      if (config.providerKey === "disabled") return resultFromDisabledConfig(config);
      if (config.providerKey === "resend_api") return sendWithResendApi(payload, config, deps);
      return sendWithSmtp(payload, config, deps);
    },
  };
}

export async function deliverMessage(
  payload: MessageDeliveryPayload,
  options: DeliverMessageOptions = {}
): Promise<MessageDeliveryResult> {
  const config = resolveMessageDeliveryProviderConfig(options.env ?? process.env);
  return createMessageDeliveryProvider(config, options).send(payload);
}

export function buildMessageDeliveryAttemptRecord(
  payload: MessageDeliveryPayload,
  result: MessageDeliveryResult,
  updatedAt: Date = new Date()
): MessageDeliveryAttemptRecord {
  return {
    attemptId: payload.attemptId,
    target: payload.target,
    messageId: payload.messageId,
    replyId: payload.replyId ?? null,
    providerKey: result.providerKey,
    status: result.status,
    providerMessageId: result.providerMessageId ?? null,
    errorCode: result.errorCode ?? null,
    retryAfterSeconds: result.retryAfterSeconds ?? null,
    redactedErrorMessage: result.redactedErrorMessage ?? null,
    updatedAt: updatedAt.toISOString(),
  };
}

export function getMessageDeliveryStatusLabel(status: MessageDeliveryStatus): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "accepted_by_provider":
      return "Accepted by provider";
    case "failed_retryable":
      return "Failed, retryable";
    case "failed_final":
      return "Failed";
    case "disabled":
      return "Disabled";
  }
}

export function isSensitiveMessageDeliveryField(key: string): boolean {
  if (/^(messageid|providermessageid)$/i.test(key)) return false;
  return SENSITIVE_KEY_PATTERN.test(key);
}
