import { isUuid } from "@/lib/admin/content";
import { parseQrSlug } from "@/lib/qr-links/slug";
import type { Database } from "@/types/database";

export const QR_LINK_STATUS_VALUES = ["draft", "active", "disabled", "archived"] as const;

export type QrLinkStatus = (typeof QR_LINK_STATUS_VALUES)[number];
export type QrRedirectLinkRow = Database["public"]["Tables"]["qr_redirect_links"]["Row"];

export type CreateQrRedirectLinkPayload = {
  slug?: unknown;
  destinationUrl?: unknown;
  status?: unknown;
  contentItemId?: unknown;
  contentLabel?: unknown;
  placementKey?: unknown;
  ownerUserId?: unknown;
};

export type UpdateQrRedirectLinkPayload = {
  slug?: unknown;
  destinationUrl?: unknown;
  status?: unknown;
  contentItemId?: unknown;
  contentLabel?: unknown;
  placementKey?: unknown;
  ownerUserId?: unknown;
};

type NormalizedCreatePayload = {
  slug: string;
  destinationUrl: string;
  status: QrLinkStatus;
  contentItemId: string | null;
  contentLabel: string;
  placementKey: string;
  ownerUserId: string | null;
};

type NormalizedUpdatePayload = {
  slug?: string;
  destinationUrl?: string;
  status?: QrLinkStatus;
  contentItemId?: string | null;
  contentLabel?: string;
  placementKey?: string;
  ownerUserId?: string | null;
  hasContentItemId: boolean;
  hasOwnerUserId: boolean;
};

type ParseCreateResult =
  | {
      ok: true;
      value: NormalizedCreatePayload;
    }
  | {
      ok: false;
      error: string;
    };

type ParseUpdateResult =
  | {
      ok: true;
      value: NormalizedUpdatePayload;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCompactText(value: unknown): string {
  return normalizeString(value).replace(/\s+/g, " ");
}

function isQrLinkStatus(value: string): value is QrLinkStatus {
  return QR_LINK_STATUS_VALUES.includes(value as QrLinkStatus);
}

function normalizeOptionalUuid(
  value: unknown,
  fieldName: "contentItemId" | "ownerUserId"
): { ok: true; value: string | null } | { ok: false; error: string } {
  const raw = normalizeString(value);
  if (!raw) return { ok: true, value: null };
  if (!isUuid(raw)) {
    return { ok: false, error: `${fieldName} must be a valid UUID.` };
  }
  return { ok: true, value: raw };
}

function normalizeContentLabel(
  value: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = normalizeCompactText(value);
  if (normalized.length > 120) {
    return { ok: false, error: "contentLabel must be 120 characters or less." };
  }
  return { ok: true, value: normalized };
}

function normalizePlacementKey(
  value: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = normalizeCompactText(value).toLowerCase();
  if (normalized.length > 80) {
    return { ok: false, error: "placementKey must be 80 characters or less." };
  }
  if (normalized && !/^[a-z0-9._:-]+$/.test(normalized)) {
    return {
      ok: false,
      error:
        "placementKey may only contain lowercase letters, numbers, dot, underscore, colon, or dash.",
    };
  }
  return { ok: true, value: normalized };
}

export function parseCreateQrRedirectLinkPayload(
  payload: CreateQrRedirectLinkPayload
): ParseCreateResult {
  const slug = parseQrSlug(normalizeString(payload.slug));
  if (!slug) {
    return {
      ok: false,
      error: "slug must use lowercase letters/numbers and optional internal dashes.",
    };
  }

  const destinationUrl = normalizeString(payload.destinationUrl);
  if (!destinationUrl) {
    return { ok: false, error: "destinationUrl is required." };
  }
  if (destinationUrl.length > 2048) {
    return { ok: false, error: "destinationUrl must be 2048 characters or less." };
  }

  const statusRaw = normalizeString(payload.status) || "draft";
  if (!isQrLinkStatus(statusRaw)) {
    return { ok: false, error: "Invalid QR link status." };
  }

  const contentItemIdResult = normalizeOptionalUuid(payload.contentItemId, "contentItemId");
  if (!contentItemIdResult.ok) return contentItemIdResult;

  const ownerUserIdResult = normalizeOptionalUuid(payload.ownerUserId, "ownerUserId");
  if (!ownerUserIdResult.ok) return ownerUserIdResult;

  const contentLabelResult = normalizeContentLabel(payload.contentLabel);
  if (!contentLabelResult.ok) return contentLabelResult;

  const placementKeyResult = normalizePlacementKey(payload.placementKey);
  if (!placementKeyResult.ok) return placementKeyResult;

  return {
    ok: true,
    value: {
      slug,
      destinationUrl,
      status: statusRaw,
      contentItemId: contentItemIdResult.value,
      contentLabel: contentLabelResult.value,
      placementKey: placementKeyResult.value,
      ownerUserId: ownerUserIdResult.value,
    },
  };
}

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

export function parseUpdateQrRedirectLinkPayload(
  payload: UpdateQrRedirectLinkPayload
): ParseUpdateResult {
  const source = payload as Record<string, unknown>;
  const value: NormalizedUpdatePayload = {
    hasContentItemId: false,
    hasOwnerUserId: false,
  };
  let changedFields = 0;

  if (hasOwn(source, "slug")) {
    const slug = parseQrSlug(normalizeString(payload.slug));
    if (!slug) {
      return {
        ok: false,
        error: "slug must use lowercase letters/numbers and optional internal dashes.",
      };
    }
    value.slug = slug;
    changedFields += 1;
  }

  if (hasOwn(source, "destinationUrl")) {
    const destinationUrl = normalizeString(payload.destinationUrl);
    if (!destinationUrl) {
      return { ok: false, error: "destinationUrl cannot be empty." };
    }
    if (destinationUrl.length > 2048) {
      return { ok: false, error: "destinationUrl must be 2048 characters or less." };
    }
    value.destinationUrl = destinationUrl;
    changedFields += 1;
  }

  if (hasOwn(source, "status")) {
    const statusRaw = normalizeString(payload.status);
    if (!isQrLinkStatus(statusRaw)) {
      return { ok: false, error: "Invalid QR link status." };
    }
    value.status = statusRaw;
    changedFields += 1;
  }

  if (hasOwn(source, "contentItemId")) {
    const contentItemIdResult = normalizeOptionalUuid(payload.contentItemId, "contentItemId");
    if (!contentItemIdResult.ok) return contentItemIdResult;
    value.contentItemId = contentItemIdResult.value;
    value.hasContentItemId = true;
    changedFields += 1;
  }

  if (hasOwn(source, "ownerUserId")) {
    const ownerUserIdResult = normalizeOptionalUuid(payload.ownerUserId, "ownerUserId");
    if (!ownerUserIdResult.ok) return ownerUserIdResult;
    value.ownerUserId = ownerUserIdResult.value;
    value.hasOwnerUserId = true;
    changedFields += 1;
  }

  if (hasOwn(source, "contentLabel")) {
    const contentLabelResult = normalizeContentLabel(payload.contentLabel);
    if (!contentLabelResult.ok) return contentLabelResult;
    value.contentLabel = contentLabelResult.value;
    changedFields += 1;
  }

  if (hasOwn(source, "placementKey")) {
    const placementKeyResult = normalizePlacementKey(payload.placementKey);
    if (!placementKeyResult.ok) return placementKeyResult;
    value.placementKey = placementKeyResult.value;
    changedFields += 1;
  }

  if (changedFields === 0) {
    return { ok: false, error: "No changes detected." };
  }

  return { ok: true, value };
}
