import type { Database } from "@/types/database";

export const ADMIN_CONTENT_TYPE_VALUES = [
  "course_module",
  "course_lesson",
  "guide_session",
  "guide_drill",
  "page",
  "product",
] as const;

export const ADMIN_CONTENT_STATUS_VALUES = ["draft", "review", "published", "archived"] as const;

export type AdminContentType = (typeof ADMIN_CONTENT_TYPE_VALUES)[number];
export type AdminContentStatus = (typeof ADMIN_CONTENT_STATUS_VALUES)[number];
export type AdminContentItemRow = Database["public"]["Tables"]["admin_content_items"]["Row"];

export type CreateAdminContentPayload = {
  contentType?: unknown;
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  category?: unknown;
  body?: unknown;
  sortOrder?: unknown;
  status?: unknown;
  parentId?: unknown;
};

export type UpdateAdminContentPayload = {
  contentType?: unknown;
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  category?: unknown;
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
  category: string;
  body: Record<string, unknown>;
  sortOrder: number;
  status: AdminContentStatus;
  parentId: string | null;
};

type UpdateAdminContentNormalized = {
  contentType?: AdminContentType;
  slug?: string;
  title?: string;
  summary?: string;
  category?: string;
  body?: Record<string, unknown>;
  sortOrder?: number;
  status?: AdminContentStatus;
  parentId?: string | null;
  hasParentId: boolean;
  hasStatus: boolean;
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

type ParseUpdateAdminContentResult =
  | {
      ok: true;
      value: UpdateAdminContentNormalized;
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

function normalizeCategory(value: unknown): string {
  const collapsed = normalizeString(value).replace(/\s+/g, " ");
  return collapsed.length > 0 ? collapsed : "General";
}

function sanitizeSlug(input: string): string {
  const lower = input.toLowerCase();
  const chars: string[] = [];
  let wroteSeparator = false;

  for (let index = 0; index < lower.length; index += 1) {
    const code = lower.charCodeAt(index);
    const isDigit = code >= 48 && code <= 57;
    const isLetter = code >= 97 && code <= 122;
    if (isDigit || isLetter) {
      chars.push(lower[index] ?? "");
      wroteSeparator = false;
      continue;
    }

    if (chars.length > 0 && !wroteSeparator) {
      chars.push("-");
      wroteSeparator = true;
    }
  }

  while (chars[chars.length - 1] === "-") {
    chars.pop();
  }

  return chars.join("").slice(0, 120);
}

export function isUuid(value: string): boolean {
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
  const category = normalizeCategory(payload.category);
  if (category.length > 80) {
    return { ok: false, error: "Category must be 80 characters or less." };
  }

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
      category,
      body: isPlainObject(body) ? body : {},
      sortOrder,
      status: statusRaw as AdminContentStatus,
      parentId: parentIdRaw || null,
    },
  };
}

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

export function parseUpdateAdminContentPayload(
  payload: UpdateAdminContentPayload,
  options?: {
    itemId?: string;
  }
): ParseUpdateAdminContentResult {
  const source = payload as Record<string, unknown>;
  const value: UpdateAdminContentNormalized = {
    hasParentId: false,
    hasStatus: false,
  };
  let changedFields = 0;

  if (hasOwn(source, "contentType")) {
    const contentTypeRaw = normalizeString(payload.contentType);
    if (!ADMIN_CONTENT_TYPE_VALUES.includes(contentTypeRaw as AdminContentType)) {
      return { ok: false, error: "Invalid content type." };
    }
    value.contentType = contentTypeRaw as AdminContentType;
    changedFields += 1;
  }

  if (hasOwn(source, "title")) {
    const title = normalizeString(payload.title);
    if (title.length < 2 || title.length > 120) {
      return { ok: false, error: "Title must be between 2 and 120 characters." };
    }
    value.title = title;
    changedFields += 1;
  }

  if (hasOwn(source, "slug")) {
    const slug = sanitizeSlug(normalizeString(payload.slug));
    if (slug.length < 2) {
      return { ok: false, error: "Slug is too short after normalization." };
    }
    value.slug = slug;
    changedFields += 1;
  }

  if (hasOwn(source, "summary")) {
    value.summary = normalizeString(payload.summary).slice(0, 500);
    changedFields += 1;
  }

  if (hasOwn(source, "category")) {
    const category = normalizeCategory(payload.category);
    if (category.length > 80) {
      return { ok: false, error: "Category must be 80 characters or less." };
    }
    value.category = category;
    changedFields += 1;
  }

  if (hasOwn(source, "body")) {
    if (!isPlainObject(payload.body)) {
      return { ok: false, error: "Body must be a JSON object." };
    }
    value.body = payload.body;
    changedFields += 1;
  }

  if (hasOwn(source, "sortOrder")) {
    const sortOrderRaw =
      typeof payload.sortOrder === "number"
        ? payload.sortOrder
        : Number.parseInt(String(payload.sortOrder ?? "0"), 10);
    if (!Number.isFinite(sortOrderRaw) || sortOrderRaw < -10000 || sortOrderRaw > 10000) {
      return { ok: false, error: "Sort order must be between -10000 and 10000." };
    }
    value.sortOrder = Math.trunc(sortOrderRaw);
    changedFields += 1;
  }

  if (hasOwn(source, "status")) {
    const statusRaw = normalizeString(payload.status);
    if (!ADMIN_CONTENT_STATUS_VALUES.includes(statusRaw as AdminContentStatus)) {
      return { ok: false, error: "Invalid publish status." };
    }
    value.status = statusRaw as AdminContentStatus;
    value.hasStatus = true;
    changedFields += 1;
  }

  if (hasOwn(source, "parentId")) {
    const parentIdRaw = payload.parentId === null ? "" : normalizeString(payload.parentId);
    if (parentIdRaw && !isUuid(parentIdRaw)) {
      return { ok: false, error: "parentId must be a valid UUID." };
    }
    if (parentIdRaw && options?.itemId && parentIdRaw === options.itemId) {
      return { ok: false, error: "parentId cannot reference the same content item." };
    }
    value.parentId = parentIdRaw || null;
    value.hasParentId = true;
    changedFields += 1;
  }

  if (changedFields === 0) {
    return { ok: false, error: "No updatable fields were provided." };
  }

  return {
    ok: true,
    value,
  };
}
