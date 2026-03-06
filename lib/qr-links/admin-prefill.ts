import { isUuid } from "@/lib/admin/content";
import { parseQrSlug } from "@/lib/qr-links/slug";

export type AdminQrPrefill = {
  slug: string;
  destinationPath: string;
  contentItemId: string;
  contentLabel: string;
  placementKey: string;
};

export type BuildAdminQrPrefillHrefInput = {
  slugHint?: string | null;
  destinationPath?: string | null;
  contentItemId?: string | null;
  contentLabel?: string | null;
  placementKey?: string | null;
};

const PLACEMENT_KEY_PATTERN = /^[a-z0-9._:-]+$/;

function normalizeSingleLine(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeDestinationPath(value: string | null | undefined): string {
  const normalized = normalizeSingleLine(value);
  return normalized.startsWith("/") ? normalized : "";
}

function normalizePlacementKey(value: string | null | undefined): string {
  const normalized = normalizeSingleLine(value).toLowerCase();
  if (!normalized) return "";
  if (normalized.length > 80) return "";
  if (!PLACEMENT_KEY_PATTERN.test(normalized)) return "";
  return normalized;
}

function normalizeContentLabel(value: string | null | undefined): string {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  return normalized.slice(0, 120);
}

function normalizeOptionalUuid(value: string | null | undefined): string {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  return isUuid(normalized) ? normalized : "";
}

export function buildAdminQrPrefillHref(input: BuildAdminQrPrefillHrefInput): string {
  const params = new URLSearchParams();
  params.set("tab", "qr-links");

  const slug = parseQrSlug(normalizeSingleLine(input.slugHint));
  const destinationPath = normalizeDestinationPath(input.destinationPath);
  const contentItemId = normalizeOptionalUuid(input.contentItemId);
  const contentLabel = normalizeContentLabel(input.contentLabel);
  const placementKey = normalizePlacementKey(input.placementKey);

  if (slug) params.set("qrSlug", slug);
  if (destinationPath) params.set("qrDestinationPath", destinationPath);
  if (contentItemId) params.set("qrContentItemId", contentItemId);
  if (contentLabel) params.set("qrContentLabel", contentLabel);
  if (placementKey) params.set("qrPlacementKey", placementKey);

  return `/admin?${params.toString()}`;
}

export function parseAdminQrPrefillFromSearch(search: string): AdminQrPrefill | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  const prefill: AdminQrPrefill = {
    slug: parseQrSlug(normalizeSingleLine(params.get("qrSlug"))) ?? "",
    destinationPath: normalizeDestinationPath(params.get("qrDestinationPath")),
    contentItemId: normalizeOptionalUuid(params.get("qrContentItemId")),
    contentLabel: normalizeContentLabel(params.get("qrContentLabel")),
    placementKey: normalizePlacementKey(params.get("qrPlacementKey")),
  };

  if (
    !prefill.slug &&
    !prefill.destinationPath &&
    !prefill.contentItemId &&
    !prefill.contentLabel &&
    !prefill.placementKey
  ) {
    return null;
  }

  return prefill;
}
