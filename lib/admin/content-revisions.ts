import type { Database } from "@/types/database";
import {
  ADMIN_CONTENT_STATUS_VALUES,
  ADMIN_CONTENT_TYPE_VALUES,
  isUuid,
} from "@/lib/admin/content";

type AdminContentItemUpdate = Database["public"]["Tables"]["admin_content_items"]["Update"];
type AdminContentBodyUpdate = Database["public"]["Tables"]["admin_content_items"]["Update"]["body"];

type ParseRestoreAdminContentRevisionPayloadResult =
  | {
      ok: true;
      value: {
        revisionId: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

type ParseRevisionSnapshotResult =
  | {
      ok: true;
      value: AdminContentItemUpdate;
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

function normalizeNullableString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizePublishedAt(value: unknown): string | null | undefined {
  if (value === null) return null;
  const normalized = normalizeString(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function parseRestoreAdminContentRevisionPayload(
  payload: Record<string, unknown>
): ParseRestoreAdminContentRevisionPayloadResult {
  const revisionId = normalizeString(payload.revisionId);
  if (!isUuid(revisionId)) {
    return { ok: false, error: "Invalid revision id." };
  }
  return { ok: true, value: { revisionId } };
}

export function parseAdminContentRevisionSnapshot(snapshot: unknown): ParseRevisionSnapshotResult {
  if (!isPlainObject(snapshot)) {
    return { ok: false, error: "Invalid revision snapshot." };
  }

  const contentType = normalizeString(snapshot.content_type);
  if (
    !ADMIN_CONTENT_TYPE_VALUES.includes(
      contentType as Database["public"]["Enums"]["admin_content_type"]
    )
  ) {
    return { ok: false, error: "Invalid revision content type." };
  }

  const status = normalizeString(snapshot.status);
  if (
    !ADMIN_CONTENT_STATUS_VALUES.includes(
      status as Database["public"]["Enums"]["admin_content_status"]
    )
  ) {
    return { ok: false, error: "Invalid revision status." };
  }

  const slug = normalizeString(snapshot.slug);
  const title = normalizeString(snapshot.title);
  if (slug.length < 2 || title.length < 2) {
    return { ok: false, error: "Invalid revision snapshot identifiers." };
  }

  const summary = normalizeString(snapshot.summary).slice(0, 500);
  const category = normalizeString(snapshot.category).slice(0, 80) || "General";

  const sortOrderRaw =
    typeof snapshot.sort_order === "number"
      ? snapshot.sort_order
      : Number.parseInt(String(snapshot.sort_order ?? "0"), 10);
  if (!Number.isFinite(sortOrderRaw) || sortOrderRaw < -10000 || sortOrderRaw > 10000) {
    return { ok: false, error: "Invalid revision sort order." };
  }
  const sortOrder = Math.trunc(sortOrderRaw);

  const parentId = normalizeNullableString(snapshot.parent_id);
  if (parentId && !isUuid(parentId)) {
    return { ok: false, error: "Invalid revision parent id." };
  }

  let body: Record<string, unknown> = {};
  if (snapshot.body !== undefined && snapshot.body !== null) {
    if (!isPlainObject(snapshot.body)) {
      return { ok: false, error: "Invalid revision body payload." };
    }
    body = snapshot.body;
  }

  const publishedAt = normalizePublishedAt(snapshot.published_at);
  if (publishedAt === undefined) {
    return { ok: false, error: "Invalid revision publish timestamp." };
  }

  return {
    ok: true,
    value: {
      content_type: contentType as Database["public"]["Enums"]["admin_content_type"],
      parent_id: parentId,
      slug,
      title,
      summary,
      category,
      body: body as AdminContentBodyUpdate,
      sort_order: sortOrder,
      status: status as Database["public"]["Enums"]["admin_content_status"],
      published_at: publishedAt,
    },
  };
}
