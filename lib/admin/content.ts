import type { Database } from "@/types/database";

export const ADMIN_CONTENT_TYPE_VALUES = [
  "course_module",
  "course_lesson",
  "guide_session",
  "guide_drill",
] as const;

export const ADMIN_CONTENT_STATUS_VALUES = ["draft", "published"] as const;

export type AdminContentType = (typeof ADMIN_CONTENT_TYPE_VALUES)[number];
export type AdminContentStatus = (typeof ADMIN_CONTENT_STATUS_VALUES)[number];
export type AdminContentItemRow = Database["public"]["Tables"]["admin_content_items"]["Row"];

export type CreateAdminContentPayload = {
  contentType?: unknown;
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  body?: unknown;
  sortOrder?: unknown;
  status?: unknown;
  parentId?: unknown;
};

type CreateAdminContentNormalized = {
  contentType: AdminContentType;
  slug: string;
  title: string;
  summary: string;
  body: Record<string, unknown>;
  sortOrder: number;
  status: AdminContentStatus;
  parentId: string | null;
};

type ParseCreateAdminContentResult =
  | {
      ok: true;
      value: CreateAdminContentNormalized;
    }
  | {
      ok: false;
      error: string;
    };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parseCreateAdminContentPayload(
  payload: CreateAdminContentPayload
): ParseCreateAdminContentResult {
  const contentTypeRaw = normalizeString(payload.contentType);
  if (!ADMIN_CONTENT_TYPE_VALUES.includes(contentTypeRaw as AdminContentType)) {
    return { ok: false, error: "Invalid content type." };
  }

  const title = normalizeString(payload.title);
  if (title.length < 2 || title.length > 120) {
    return { ok: false, error: "Title must be between 2 and 120 characters." };
  }

  const slugInput = normalizeString(payload.slug) || title;
  const slug = sanitizeSlug(slugInput);
  if (slug.length < 2) {
    return { ok: false, error: "Slug is too short after normalization." };
  }

  const summary = normalizeString(payload.summary).slice(0, 500);
  const body = payload.body;
  if (body !== undefined && !isPlainObject(body)) {
    return { ok: false, error: "Body must be a JSON object." };
  }

  const sortOrderRaw =
    typeof payload.sortOrder === "number"
      ? payload.sortOrder
      : Number.parseInt(String(payload.sortOrder ?? "0"), 10);
  if (!Number.isFinite(sortOrderRaw) || sortOrderRaw < -10000 || sortOrderRaw > 10000) {
    return { ok: false, error: "Sort order must be between -10000 and 10000." };
  }
  const sortOrder = Math.trunc(sortOrderRaw);

  const statusRaw = normalizeString(payload.status) || "draft";
  if (!ADMIN_CONTENT_STATUS_VALUES.includes(statusRaw as AdminContentStatus)) {
    return { ok: false, error: "Invalid publish status." };
  }

  const parentIdRaw = normalizeString(payload.parentId);
  if (parentIdRaw && !isUuid(parentIdRaw)) {
    return { ok: false, error: "parentId must be a valid UUID." };
  }

  return {
    ok: true,
    value: {
      contentType: contentTypeRaw as AdminContentType,
      slug,
      title,
      summary,
      body: isPlainObject(body) ? body : {},
      sortOrder,
      status: statusRaw as AdminContentStatus,
      parentId: parentIdRaw || null,
    },
  };
}
