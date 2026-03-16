import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM_CONTENT_MANIFEST_VERSION } from "@/lib/admin/content-import";
import {
  resolveCanonicalCourseLessonRuntimeId,
  resolveCanonicalCourseLessonSlug,
  resolveCanonicalCourseModuleRuntimeId,
  resolveCanonicalCourseModuleRuntimeIdFromLesson,
  resolveCanonicalCourseModuleSlug,
  resolveCourseLessonLegacyRuntimeIds,
  resolveCourseModuleLegacyRuntimeIds,
} from "@/lib/course/runtime-id-manifest";
import {
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeId,
} from "@/lib/course/runtime-identity";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
type AdminContentRepairRow = Pick<
  Database["public"]["Tables"]["admin_content_items"]["Row"],
  "id" | "content_type" | "slug" | "body"
>;

type RepairRowPatch = {
  id: string;
  slug: string;
  body: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function mergeAliasIds(
  existing: unknown,
  additions: Array<string | null | undefined>,
  canonicalId: string
): string[] {
  const unique = new Set<string>();

  if (Array.isArray(existing)) {
    for (const value of existing) {
      const normalized = normalizeString(value);
      if (normalized && normalized !== canonicalId) unique.add(normalized);
    }
  }

  for (const value of additions) {
    const normalized = normalizeString(value);
    if (normalized && normalized !== canonicalId) unique.add(normalized);
  }

  return Array.from(unique);
}

function updateManifestMeta(
  body: Record<string, unknown>,
  sourceCollection: "course_module" | "course_lesson",
  sourceId: string
): void {
  const meta = isRecord(body._meta) ? { ...body._meta } : null;
  if (!meta) return;

  const sourceCollectionValue = normalizeString(meta.sourceCollection);
  if (sourceCollectionValue && sourceCollectionValue !== sourceCollection) {
    return;
  }

  meta.manifestVersion = PLATFORM_CONTENT_MANIFEST_VERSION;
  meta.sourceCollection = sourceCollection;
  meta.sourceId = sourceId;
  delete meta.sourceChecksum;
  body._meta = meta;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function buildModuleRepairPatch(row: AdminContentRepairRow): RepairRowPatch | null {
  const body = isRecord(row.body) ? row.body : {};
  const currentModuleId = resolveCourseModuleRuntimeId(body, row.slug);
  const canonicalModuleId = resolveCanonicalCourseModuleRuntimeId(currentModuleId);
  const canonicalSlug = resolveCanonicalCourseModuleSlug(currentModuleId);
  if (!canonicalModuleId || !canonicalSlug) return null;

  const nextBody: Record<string, unknown> = { ...body };
  nextBody.moduleId = canonicalModuleId;

  const legacyModuleIds = mergeAliasIds(
    body.legacyModuleIds,
    [currentModuleId, ...resolveCourseModuleLegacyRuntimeIds(currentModuleId)],
    canonicalModuleId
  );
  nextBody.legacyModuleIds = legacyModuleIds;
  updateManifestMeta(nextBody, "course_module", canonicalModuleId);

  if (row.slug === canonicalSlug && stableJson(body) === stableJson(nextBody)) {
    return null;
  }

  return {
    id: row.id,
    slug: canonicalSlug,
    body: nextBody,
  };
}

function buildLessonRepairPatch(row: AdminContentRepairRow): RepairRowPatch | null {
  const body = isRecord(row.body) ? row.body : {};
  const currentLessonId = resolveCourseLessonRuntimeId(body, row.slug);
  const canonicalLessonId = resolveCanonicalCourseLessonRuntimeId(currentLessonId);
  const canonicalSlug = resolveCanonicalCourseLessonSlug(currentLessonId);
  if (!canonicalLessonId || !canonicalSlug) return null;

  const currentModuleId =
    normalizeString(body.moduleId) ??
    resolveCanonicalCourseModuleRuntimeIdFromLesson(currentLessonId);
  const canonicalModuleId =
    resolveCanonicalCourseModuleRuntimeId(currentModuleId) ??
    resolveCanonicalCourseModuleRuntimeIdFromLesson(currentLessonId);

  const nextBody: Record<string, unknown> = { ...body };
  nextBody.lessonId = canonicalLessonId;

  if (canonicalModuleId) {
    nextBody.moduleId = canonicalModuleId;
    nextBody.legacyModuleIds = mergeAliasIds(
      body.legacyModuleIds,
      [currentModuleId, ...resolveCourseModuleLegacyRuntimeIds(currentModuleId)],
      canonicalModuleId
    );
  }

  nextBody.legacyLessonIds = mergeAliasIds(
    body.legacyLessonIds,
    [currentLessonId, ...resolveCourseLessonLegacyRuntimeIds(currentLessonId)],
    canonicalLessonId
  );
  updateManifestMeta(nextBody, "course_lesson", canonicalLessonId);

  if (row.slug === canonicalSlug && stableJson(body) === stableJson(nextBody)) {
    return null;
  }

  return {
    id: row.id,
    slug: canonicalSlug,
    body: nextBody,
  };
}

function buildRepairPatch(row: AdminContentRepairRow): RepairRowPatch | null {
  if (row.content_type === "course_module") {
    return buildModuleRepairPatch(row);
  }

  if (row.content_type === "course_lesson") {
    return buildLessonRepairPatch(row);
  }

  return null;
}

export async function repairCourseRuntimeIdentityRows(params: {
  supabase: TypedSupabaseClient;
  actorUserId?: string | null;
}): Promise<
  | {
      ok: true;
      repairedRows: number;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const rowsResult = await params.supabase
    .from("admin_content_items")
    .select("id, content_type, slug, body")
    .in("content_type", ["course_module", "course_lesson"]);

  if (rowsResult.error) {
    console.error("[CourseRuntimeIdRepair] Could not load course content rows", rowsResult.error);
    return {
      ok: false,
      error: "Could not verify existing course runtime IDs.",
    };
  }

  const patches = (rowsResult.data ?? [])
    .map((row) => buildRepairPatch(row))
    .filter((patch): patch is RepairRowPatch => Boolean(patch));

  for (const patch of patches) {
    const updateResult = await params.supabase
      .from("admin_content_items")
      .update({
        slug: patch.slug,
        body: patch.body as Database["public"]["Tables"]["admin_content_items"]["Update"]["body"],
        ...(params.actorUserId ? { updated_by: params.actorUserId } : {}),
      })
      .eq("id", patch.id);

    if (updateResult.error) {
      console.error("[CourseRuntimeIdRepair] Could not update course content row", {
        id: patch.id,
        error: updateResult.error,
      });
      return {
        ok: false,
        error: "Could not repair course runtime IDs right now.",
      };
    }
  }

  return {
    ok: true,
    repairedRows: patches.length,
  };
}
