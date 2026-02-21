import { ensurePlatformContentSeeded } from "@/lib/admin/content-import-apply";
import { isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { GUIDE_0_TO_1000M_SESSIONS, type Guide0To1000Session } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_DRILLS, type PoolsideDrill } from "@/lib/guides/guide-poolside";
import type { Database, Json } from "@/types/database";

type AdminContentType = Database["public"]["Enums"]["admin_content_type"];
type AdminContentRow = Database["public"]["Tables"]["admin_content_items"]["Row"];

type PublishedContentProjection = Pick<
  AdminContentRow,
  "id" | "slug" | "title" | "summary" | "sort_order" | "body"
>;

function isRecord(value: Json): value is Record<string, Json> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.map((entry) => getString(entry)).filter((entry): entry is string => Boolean(entry));
}

function inferGuideSessionId(row: PublishedContentProjection): string {
  const slugMatch = row.slug.match(/session-([a-z0-9-]+)$/i);
  const candidate = slugMatch?.[1] ?? row.slug;
  return candidate.toUpperCase();
}

function inferGuideSessionWeekNumber(id: string): number {
  const sessionNumber = Number.parseInt(id.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(sessionNumber) || sessionNumber <= 0) return 1;
  return Math.ceil(sessionNumber / 2);
}

function toGuide0To1000Session(row: PublishedContentProjection): Guide0To1000Session {
  const body = isRecord(row.body) ? row.body : {};
  const id = getString(body.sessionId) ?? inferGuideSessionId(row);
  const weekNumber = getNumber(body.weekNumber) ?? inferGuideSessionWeekNumber(id);

  return {
    id,
    weekNumber,
    title: row.title,
    focus: getString(body.focus) ?? row.summary,
    targetSet: getString(body.targetSet) ?? row.summary,
  };
}

function toPoolsideDrill(row: PublishedContentProjection): PoolsideDrill {
  const body = isRecord(row.body) ? row.body : {};
  const id = (getString(body.drillId) ?? row.slug).toUpperCase();

  return {
    id,
    title: row.title,
    summary: row.summary,
    setup: getString(body.setup) ?? row.summary,
    keyFocus: getStringArray(body.keyFocus).length ? getStringArray(body.keyFocus) : [row.summary],
    visualAssetPath: getString(body.visualAssetPath) ?? "/guides/poolside/drill-01.svg",
    visualAlt: getString(body.visualAlt) ?? row.title,
  };
}

async function loadPublishedContentRows(
  contentType: AdminContentType
): Promise<PublishedContentProjection[] | null> {
  const supabase = createAdminSupabaseClient();

  const queryRows = async () => {
    const result = await supabase
      .from("admin_content_items")
      .select("id, slug, title, summary, sort_order, body, created_at")
      .eq("content_type", contentType)
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (result.error) return { ok: false as const, error: result.error };
    return { ok: true as const, rows: result.data ?? [] };
  };

  try {
    let readResult = await queryRows();
    if (!readResult.ok) {
      if (isAdminContentSchemaMissing(readResult.error)) {
        return null;
      }
      console.error(`[PublishedContent] Could not load ${contentType} rows`, readResult.error);
      return null;
    }

    if (readResult.rows.length === 0) {
      const ensureResult = await ensurePlatformContentSeeded({ supabase });
      if (!ensureResult.ok) {
        if (ensureResult.schemaReady) {
          console.error(
            `[PublishedContent] Could not auto-seed baseline for ${contentType}`,
            ensureResult.error
          );
        }
        return null;
      }
      if (ensureResult.seeded) {
        readResult = await queryRows();
        if (!readResult.ok) {
          if (isAdminContentSchemaMissing(readResult.error)) {
            return null;
          }
          console.error(
            `[PublishedContent] Could not reload ${contentType} rows after seeding`,
            readResult.error
          );
          return null;
        }
      }
    }

    return readResult.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      sort_order: row.sort_order,
      body: row.body,
    }));
  } catch (error) {
    console.error(`[PublishedContent] Could not query ${contentType}`, error);
    return null;
  }
}

export function toPublishedGuide0To1000Sessions(
  rows: PublishedContentProjection[],
  fallback: Guide0To1000Session[] = GUIDE_0_TO_1000M_SESSIONS
): Guide0To1000Session[] {
  if (rows.length === 0) return fallback;

  const seen = new Set<string>();
  const normalized = rows.map(toGuide0To1000Session).filter((session) => {
    const key = session.id.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return normalized.length > 0 ? normalized : fallback;
}

export function toPublishedPoolsideDrills(
  rows: PublishedContentProjection[],
  fallback: PoolsideDrill[] = GUIDE_POOLSIDE_DRILLS
): PoolsideDrill[] {
  if (rows.length === 0) return fallback;

  const seen = new Set<string>();
  const normalized = rows.map(toPoolsideDrill).filter((drill) => {
    const key = drill.id.toUpperCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return normalized.length > 0 ? normalized : fallback;
}

export async function loadPublishedGuide0To1000Sessions(): Promise<Guide0To1000Session[]> {
  const rows = await loadPublishedContentRows("guide_session");
  if (!rows) return GUIDE_0_TO_1000M_SESSIONS;
  return toPublishedGuide0To1000Sessions(rows);
}

export async function loadPublishedPoolsideDrills(): Promise<PoolsideDrill[]> {
  const rows = await loadPublishedContentRows("guide_drill");
  if (!rows) return GUIDE_POOLSIDE_DRILLS;
  return toPublishedPoolsideDrills(rows);
}
