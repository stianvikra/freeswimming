import type { AdminEmailTemplateRow } from "@/lib/admin/email-templates";

type AdminEmailTemplateTestRecordCandidate = Pick<
  AdminEmailTemplateRow,
  "template_key" | "locale"
>;

export const ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIX = "e2e_admin_email_template_";
export const LEGACY_ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIXES = [
  "aw012_publish_fallback_",
] as const;

function normalizeComparableValue(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeKeyPart(value: string, fallback: string) {
  const normalized = normalizeComparableValue(value)
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

export function buildAdminEmailTemplateQaTestKey(params: {
  scope: string;
  unique: string;
}) {
  const scope = normalizeKeyPart(params.scope, "preview");
  const unique = normalizeKeyPart(params.unique, "artifact");
  return `${ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIX}${scope}_${unique}`;
}

export function isLegacyAdminEmailTemplateQaTestKey(templateKey: string) {
  const normalized = normalizeComparableValue(templateKey);
  return LEGACY_ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );
}

export function isAdminEmailTemplateQaTestKey(templateKey: string) {
  const normalized = normalizeComparableValue(templateKey);
  return normalized.startsWith(ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIX)
    ? true
    : isLegacyAdminEmailTemplateQaTestKey(normalized);
}

export function isAdminEmailTemplateQaTestRecord(
  item: AdminEmailTemplateTestRecordCandidate
) {
  return isAdminEmailTemplateQaTestKey(item.template_key);
}
