import type { Database } from "@/types/database";

export const ADMIN_EMAIL_TEMPLATE_STATUS_VALUES = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export type AdminEmailTemplateStatus = (typeof ADMIN_EMAIL_TEMPLATE_STATUS_VALUES)[number];

export type AdminEmailTemplateLifecycleEventName =
  | "email_template_saved"
  | "email_template_published"
  | "email_template_reverted";

export type AdminEmailTemplateLifecycleEvent = {
  eventName: AdminEmailTemplateLifecycleEventName;
  previousStatus: AdminEmailTemplateStatus | null;
  nextStatus: AdminEmailTemplateStatus;
};

export type CreateAdminEmailTemplatePayload = {
  templateKey?: unknown;
  locale?: unknown;
  subject?: unknown;
  body?: unknown;
  status?: unknown;
  requiredPlaceholders?: unknown;
  optionalPlaceholders?: unknown;
};

export type UpdateAdminEmailTemplatePayload = {
  templateKey?: unknown;
  locale?: unknown;
  subject?: unknown;
  body?: unknown;
  status?: unknown;
  requiredPlaceholders?: unknown;
  optionalPlaceholders?: unknown;
  expectedUpdatedAt?: unknown;
};

export type AdminEmailTemplateRow = Database["public"]["Tables"]["admin_email_templates"]["Row"];

export type PlaceholderValidationResult =
  | {
      ok: true;
      placeholders: string[];
    }
  | {
      ok: false;
      error: string;
      details: string[];
      placeholders: string[];
    };

export const ADMIN_EMAIL_TEMPLATE_PREVIEW_FALLBACK_VALUES: Readonly<Record<string, string>> = {
  code: "123456",
  expires_minutes: "10",
  magic_link: "https://example.com/auth/magic-link",
  support_email: "support@freeswimming.no",
  user_name: "Svommer",
  course_name: "Freestyle Foundations",
  app_name: "Freeswimming",
};

export type AdminEmailTemplatePreviewPlaceholderValue = {
  key: string;
  value: string;
  source: "sample" | "fallback" | "missing";
};

export type AdminEmailTemplatePreviewRenderResult = {
  subject: string;
  body: string;
  placeholderValues: AdminEmailTemplatePreviewPlaceholderValue[];
  usedFallbackKeys: string[];
  missingKeys: string[];
};

type ParsedCreateAdminEmailTemplatePayload = {
  templateKey: string;
  locale: string;
  subject: string;
  body: string;
  status: AdminEmailTemplateStatus;
  requiredPlaceholders: string[];
  optionalPlaceholders: string[];
};

type ParseCreateAdminEmailTemplateResult =
  | {
      ok: true;
      value: ParsedCreateAdminEmailTemplatePayload;
    }
  | {
      ok: false;
      error: string;
    };

type ParsedUpdateAdminEmailTemplatePayload = {
  patch: {
    templateKey?: string;
    locale?: string;
    subject?: string;
    body?: string;
    status?: AdminEmailTemplateStatus;
    requiredPlaceholders?: string[];
    optionalPlaceholders?: string[];
  };
  expectedUpdatedAt?: string;
};

type ParseUpdateAdminEmailTemplateResult =
  | {
      ok: true;
      value: ParsedUpdateAdminEmailTemplatePayload;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function parseTemplateKey(value: unknown): string | null {
  const templateKey = normalizeString(value).toLowerCase();
  if (templateKey.length < 3 || templateKey.length > 120) return null;
  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(templateKey)) return null;
  return templateKey;
}

function parseLocale(value: unknown): string | null {
  const locale = normalizeString(value);
  if (locale.length < 2 || locale.length > 16) return null;
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) return null;
  return locale;
}

function parseSubject(value: unknown): string | null {
  const subject = normalizeString(value);
  if (subject.length < 1 || subject.length > 240) return null;
  return subject;
}

function parseBody(value: unknown): string | null {
  const body = normalizeString(value);
  if (body.length < 1 || body.length > 20000) return null;
  return body;
}

function normalizePlaceholderName(value: unknown): string | null {
  const token = normalizeString(value).toLowerCase();
  if (token.length < 2 || token.length > 64) return null;
  if (!/^[a-z0-9_]+$/.test(token)) return null;
  return token;
}

function parsePlaceholderList(
  value: unknown,
  fieldName: "requiredPlaceholders" | "optionalPlaceholders"
): { ok: true; value: string[] } | { ok: false; error: string } {
  if (value === undefined) return { ok: true, value: [] };
  if (!Array.isArray(value)) {
    return { ok: false, error: `${fieldName} must be an array of placeholder keys.` };
  }

  const unique = new Set<string>();
  for (const entry of value) {
    const token = normalizePlaceholderName(entry);
    if (!token) {
      return {
        ok: false,
        error: `${fieldName} entries must use lowercase letters, numbers, or underscores (2-64 chars).`,
      };
    }
    unique.add(token);
  }

  if (unique.size > 50) {
    return { ok: false, error: `${fieldName} supports max 50 placeholders.` };
  }

  return { ok: true, value: [...unique].sort() };
}

function parseStatus(value: unknown): AdminEmailTemplateStatus | null {
  const status = normalizeString(value);
  if (!ADMIN_EMAIL_TEMPLATE_STATUS_VALUES.includes(status as AdminEmailTemplateStatus)) {
    return null;
  }
  return status as AdminEmailTemplateStatus;
}

function normalizePreviewSampleValues(
  sampleValues: Record<string, unknown> | undefined
): Record<string, string> {
  if (!sampleValues) return {};

  const normalized: Record<string, string> = {};
  for (const [rawKey, value] of Object.entries(sampleValues)) {
    const key = normalizePlaceholderName(rawKey);
    if (!key) continue;

    if (typeof value === "string") {
      normalized[key] = value;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[key] = String(value);
      continue;
    }

    if (typeof value === "boolean") {
      normalized[key] = value ? "true" : "false";
    }
  }

  return normalized;
}

export function renderAdminEmailTemplatePreview(input: {
  subject: string;
  body: string;
  sampleValues?: Record<string, unknown>;
}): AdminEmailTemplatePreviewRenderResult {
  const normalizedSampleValues = normalizePreviewSampleValues(input.sampleValues);
  const placeholders = extractAdminEmailTemplatePlaceholders(`${input.subject}\n${input.body}`);
  const resolvedValues = new Map<string, AdminEmailTemplatePreviewPlaceholderValue>();

  for (const placeholderKey of placeholders) {
    if (Object.prototype.hasOwnProperty.call(normalizedSampleValues, placeholderKey)) {
      resolvedValues.set(placeholderKey, {
        key: placeholderKey,
        value: normalizedSampleValues[placeholderKey] ?? "",
        source: "sample",
      });
      continue;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        ADMIN_EMAIL_TEMPLATE_PREVIEW_FALLBACK_VALUES,
        placeholderKey
      )
    ) {
      resolvedValues.set(placeholderKey, {
        key: placeholderKey,
        value: ADMIN_EMAIL_TEMPLATE_PREVIEW_FALLBACK_VALUES[placeholderKey] ?? "",
        source: "fallback",
      });
      continue;
    }

    resolvedValues.set(placeholderKey, {
      key: placeholderKey,
      value: `{{${placeholderKey}}}`,
      source: "missing",
    });
  }

  function renderText(text: string): string {
    return text.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (fullMatch, rawToken: string) => {
      const token = normalizePlaceholderName(rawToken);
      if (!token) return fullMatch;
      const resolved = resolvedValues.get(token);
      return resolved ? resolved.value : fullMatch;
    });
  }

  const placeholderValues = [...resolvedValues.values()].sort((left, right) =>
    left.key.localeCompare(right.key)
  );

  return {
    subject: renderText(input.subject),
    body: renderText(input.body),
    placeholderValues,
    usedFallbackKeys: placeholderValues
      .filter((entry) => entry.source === "fallback")
      .map((entry) => entry.key),
    missingKeys: placeholderValues
      .filter((entry) => entry.source === "missing")
      .map((entry) => entry.key),
  };
}

export function extractAdminEmailTemplatePlaceholders(input: string): string[] {
  const found = new Set<string>();
  const pattern = /{{\s*([a-z0-9_]+)\s*}}/gi;
  for (const match of input.matchAll(pattern)) {
    const raw = match[1];
    if (!raw) continue;
    const token = normalizePlaceholderName(raw);
    if (token) found.add(token);
  }
  return [...found].sort();
}

export function validateAdminEmailTemplatePlaceholders(input: {
  subject: string;
  body: string;
  requiredPlaceholders: readonly string[];
  optionalPlaceholders: readonly string[];
}): PlaceholderValidationResult {
  const contentPlaceholders = new Set<string>([
    ...extractAdminEmailTemplatePlaceholders(input.subject),
    ...extractAdminEmailTemplatePlaceholders(input.body),
  ]);
  const required = new Set(input.requiredPlaceholders);
  const optional = new Set(input.optionalPlaceholders);
  const declared = new Set<string>([...required, ...optional]);
  const details: string[] = [];

  for (const token of required) {
    if (optional.has(token)) {
      details.push(`Placeholder "${token}" cannot be both required and optional.`);
    }
  }

  const usedPlaceholders = [...contentPlaceholders].sort();
  if (usedPlaceholders.length > 0 && declared.size === 0) {
    details.push("Template uses placeholders but required/optional placeholder lists are empty.");
  }

  for (const token of required) {
    if (!contentPlaceholders.has(token)) {
      details.push(`Required placeholder "{{${token}}}" is missing from subject/body.`);
    }
  }

  if (declared.size > 0) {
    for (const token of contentPlaceholders) {
      if (!declared.has(token)) {
        details.push(`Placeholder "{{${token}}}" is not declared as required/optional.`);
      }
    }
  }

  if (details.length > 0) {
    return {
      ok: false,
      error: "Invalid template placeholders.",
      details,
      placeholders: usedPlaceholders,
    };
  }

  return {
    ok: true,
    placeholders: usedPlaceholders,
  };
}

export function canTransitionAdminEmailTemplateStatus(
  from: AdminEmailTemplateStatus,
  to: AdminEmailTemplateStatus
): boolean {
  const allowed: Record<AdminEmailTemplateStatus, readonly AdminEmailTemplateStatus[]> = {
    draft: ["draft", "review", "archived"],
    review: ["draft", "review", "published", "archived"],
    published: ["review", "published", "archived"],
    archived: ["draft", "archived"],
  };
  return allowed[from].includes(to);
}

export function resolveAdminEmailTemplateMutationMinimumRole(input: {
  previousStatus: AdminEmailTemplateStatus;
  nextStatus: AdminEmailTemplateStatus;
}): "admin" | "editor" {
  if (input.previousStatus === "published" || input.nextStatus === "published") {
    return "admin";
  }

  return "editor";
}

export function resolveAdminEmailTemplateLifecycleEvents(input: {
  previousStatus: AdminEmailTemplateStatus | null;
  nextStatus: AdminEmailTemplateStatus;
}): AdminEmailTemplateLifecycleEvent[] {
  const events: AdminEmailTemplateLifecycleEvent[] = [
    {
      eventName: "email_template_saved",
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
    },
  ];

  if (input.previousStatus !== "published" && input.nextStatus === "published") {
    events.push({
      eventName: "email_template_published",
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
    });
  }

  if (input.previousStatus === "published" && input.nextStatus !== "published") {
    events.push({
      eventName: "email_template_reverted",
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
    });
  }

  return events;
}

export function parseCreateAdminEmailTemplatePayload(
  payload: CreateAdminEmailTemplatePayload
): ParseCreateAdminEmailTemplateResult {
  const templateKey = parseTemplateKey(payload.templateKey);
  if (!templateKey) {
    return { ok: false, error: "templateKey must use snake_case (3-120 chars)." };
  }

  const locale = parseLocale(payload.locale ?? "nb-NO");
  if (!locale) {
    return { ok: false, error: "locale must be `xx` or `xx-YY` format." };
  }

  const subject = parseSubject(payload.subject);
  if (!subject) {
    return { ok: false, error: "subject must be between 1 and 240 characters." };
  }

  const body = parseBody(payload.body);
  if (!body) {
    return { ok: false, error: "body must be between 1 and 20000 characters." };
  }

  const parsedRequired = parsePlaceholderList(payload.requiredPlaceholders, "requiredPlaceholders");
  if (!parsedRequired.ok) return parsedRequired;

  const parsedOptional = parsePlaceholderList(payload.optionalPlaceholders, "optionalPlaceholders");
  if (!parsedOptional.ok) return parsedOptional;

  const status = payload.status === undefined ? "draft" : parseStatus(payload.status);
  if (!status) {
    return { ok: false, error: "Invalid lifecycle status." };
  }

  return {
    ok: true,
    value: {
      templateKey,
      locale,
      subject,
      body,
      status,
      requiredPlaceholders: parsedRequired.value,
      optionalPlaceholders: parsedOptional.value,
    },
  };
}

function parseExpectedUpdatedAt(value: unknown): string | null {
  if (value === undefined) return null;
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return Number.isNaN(Date.parse(normalized)) ? null : normalized;
}

export function parseUpdateAdminEmailTemplatePayload(
  payload: UpdateAdminEmailTemplatePayload
): ParseUpdateAdminEmailTemplateResult {
  const source = payload as Record<string, unknown>;
  const patch: ParsedUpdateAdminEmailTemplatePayload["patch"] = {};
  let changes = 0;

  if (hasOwn(source, "templateKey")) {
    const templateKey = parseTemplateKey(payload.templateKey);
    if (!templateKey) {
      return { ok: false, error: "templateKey must use snake_case (3-120 chars)." };
    }
    patch.templateKey = templateKey;
    changes += 1;
  }

  if (hasOwn(source, "locale")) {
    const locale = parseLocale(payload.locale);
    if (!locale) {
      return { ok: false, error: "locale must be `xx` or `xx-YY` format." };
    }
    patch.locale = locale;
    changes += 1;
  }

  if (hasOwn(source, "subject")) {
    const subject = parseSubject(payload.subject);
    if (!subject) {
      return { ok: false, error: "subject must be between 1 and 240 characters." };
    }
    patch.subject = subject;
    changes += 1;
  }

  if (hasOwn(source, "body")) {
    const body = parseBody(payload.body);
    if (!body) {
      return { ok: false, error: "body must be between 1 and 20000 characters." };
    }
    patch.body = body;
    changes += 1;
  }

  if (hasOwn(source, "status")) {
    const status = parseStatus(payload.status);
    if (!status) {
      return { ok: false, error: "Invalid lifecycle status." };
    }
    patch.status = status;
    changes += 1;
  }

  if (hasOwn(source, "requiredPlaceholders")) {
    const parsedRequired = parsePlaceholderList(
      payload.requiredPlaceholders,
      "requiredPlaceholders"
    );
    if (!parsedRequired.ok) return parsedRequired;
    patch.requiredPlaceholders = parsedRequired.value;
    changes += 1;
  }

  if (hasOwn(source, "optionalPlaceholders")) {
    const parsedOptional = parsePlaceholderList(
      payload.optionalPlaceholders,
      "optionalPlaceholders"
    );
    if (!parsedOptional.ok) return parsedOptional;
    patch.optionalPlaceholders = parsedOptional.value;
    changes += 1;
  }

  if (changes === 0) {
    return { ok: false, error: "No updatable fields were provided." };
  }

  const expectedUpdatedAt = parseExpectedUpdatedAt(payload.expectedUpdatedAt);
  if (hasOwn(source, "expectedUpdatedAt") && !expectedUpdatedAt) {
    return { ok: false, error: "expectedUpdatedAt must be a valid ISO date string." };
  }

  return {
    ok: true,
    value: {
      patch,
      expectedUpdatedAt: expectedUpdatedAt ?? undefined,
    },
  };
}
