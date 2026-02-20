import type { Database } from "@/types/database";

export const ADMIN_CATEGORY_SCOPE_VALUES = ["notes", "content"] as const;

export type AdminCategoryScope = (typeof ADMIN_CATEGORY_SCOPE_VALUES)[number];
export type AdminCategoryRow = Database["public"]["Tables"]["admin_categories"]["Row"];

export type CreateAdminCategoryPayload = {
  title?: unknown;
  slug?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

export type UpdateAdminCategoryPayload = {
  title?: unknown;
  slug?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

type CreateAdminCategoryNormalized = {
  title: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

type UpdateAdminCategoryNormalized = {
  title?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
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

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

  return chars.join("").slice(0, 80);
}

function parseSortOrder(value: unknown): number | null {
  const sortOrderRaw =
    typeof value === "number" ? value : Number.parseInt(String(value ?? "0"), 10);
  if (!Number.isFinite(sortOrderRaw) || sortOrderRaw < -10000 || sortOrderRaw > 10000) {
    return null;
  }
  return Math.trunc(sortOrderRaw);
}

export function isAdminCategoryScope(value: string): value is AdminCategoryScope {
  return ADMIN_CATEGORY_SCOPE_VALUES.includes(value as AdminCategoryScope);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parseCreateAdminCategoryPayload(
  payload: CreateAdminCategoryPayload
): ParseResult<CreateAdminCategoryNormalized> {
  const title = normalizeString(payload.title);
  if (title.length < 2 || title.length > 80) {
    return { ok: false, error: "Category title must be between 2 and 80 characters." };
  }

  const slugInput = normalizeString(payload.slug) || title;
  const slug = sanitizeSlug(slugInput);
  if (slug.length < 2) {
    return { ok: false, error: "Category slug is too short after normalization." };
  }

  const sortOrder = parseSortOrder(payload.sortOrder);
  if (sortOrder === null) {
    return { ok: false, error: "Sort order must be between -10000 and 10000." };
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      sortOrder,
      isActive: payload.isActive !== false,
    },
  };
}

export function parseUpdateAdminCategoryPayload(
  payload: UpdateAdminCategoryPayload
): ParseResult<UpdateAdminCategoryNormalized> {
  const source = payload as Record<string, unknown>;
  const value: UpdateAdminCategoryNormalized = {};
  let changed = 0;

  if (hasOwn(source, "title")) {
    const title = normalizeString(payload.title);
    if (title.length < 2 || title.length > 80) {
      return { ok: false, error: "Category title must be between 2 and 80 characters." };
    }
    value.title = title;
    changed += 1;
  }

  if (hasOwn(source, "slug")) {
    const slug = sanitizeSlug(normalizeString(payload.slug));
    if (slug.length < 2) {
      return { ok: false, error: "Category slug is too short after normalization." };
    }
    value.slug = slug;
    changed += 1;
  }

  if (hasOwn(source, "sortOrder")) {
    const sortOrder = parseSortOrder(payload.sortOrder);
    if (sortOrder === null) {
      return { ok: false, error: "Sort order must be between -10000 and 10000." };
    }
    value.sortOrder = sortOrder;
    changed += 1;
  }

  if (hasOwn(source, "isActive")) {
    if (typeof payload.isActive !== "boolean") {
      return { ok: false, error: "isActive must be true or false." };
    }
    value.isActive = payload.isActive;
    changed += 1;
  }

  if (changed === 0) {
    return { ok: false, error: "No updatable category fields were provided." };
  }

  return {
    ok: true,
    value,
  };
}
