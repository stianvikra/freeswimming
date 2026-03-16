import type { CourseModule } from "@/app/course/courseData";
import {
  resolveCanonicalCourseLessonRuntimeId,
  resolveCanonicalCourseModuleRuntimeId,
  resolveCanonicalCourseLessonRuntimeIdBySlug,
  resolveCanonicalCourseModuleRuntimeIdBySlug,
  resolveCanonicalCourseModuleRuntimeIdForLessonLookup,
  resolveCourseLessonLegacyRuntimeIds,
  resolveCourseModuleLegacyRuntimeIds,
} from "@/lib/course/runtime-id-manifest";

export function normalizeRuntimeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRuntimeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const unique = new Set<string>();
  for (const entry of value) {
    const normalized = normalizeRuntimeId(entry);
    if (normalized) unique.add(normalized);
  }

  return Array.from(unique);
}

function getBodyRuntimeId(body: unknown, key: "moduleId" | "lessonId"): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return normalizeRuntimeId((body as Record<string, unknown>)[key]);
}

function getBodyRuntimeIds(body: unknown, key: "legacyModuleIds" | "legacyLessonIds"): string[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return [];
  }

  return normalizeRuntimeIdList((body as Record<string, unknown>)[key]);
}

function filterCanonicalRuntimeIdAliases(
  aliases: string[],
  canonicalRuntimeId: string | null
): string[] {
  if (!canonicalRuntimeId) return aliases;
  return aliases.filter((alias) => alias !== canonicalRuntimeId);
}

function mergeRuntimeIdAliases(...values: string[][]): string[] {
  const unique = new Set<string>();
  for (const entries of values) {
    for (const entry of entries) {
      const normalized = normalizeRuntimeId(entry);
      if (normalized) unique.add(normalized);
    }
  }
  return Array.from(unique);
}

export function inferCourseModuleRuntimeIdFromSlug(slug: string): string | null {
  const canonicalRuntimeId = resolveCanonicalCourseModuleRuntimeIdBySlug(slug);
  if (canonicalRuntimeId) return canonicalRuntimeId;
  const match = slug.match(/^course-module-(.+)$/i);
  return normalizeRuntimeId(match?.[1] ?? slug);
}

export function inferCourseLessonRuntimeIdFromSlug(slug: string): string | null {
  const canonicalRuntimeId = resolveCanonicalCourseLessonRuntimeIdBySlug(slug);
  if (canonicalRuntimeId) return canonicalRuntimeId;
  const match = slug.match(/^course-lesson-(.+)$/i);
  return normalizeRuntimeId(match?.[1] ?? slug);
}

export function inferCourseModuleRuntimeIdFromLessonRuntimeId(lessonId: string): string | null {
  const normalized = normalizeRuntimeId(lessonId);
  if (!normalized) return null;

  const canonicalModuleId = resolveCanonicalCourseModuleRuntimeIdForLessonLookup(normalized);
  if (canonicalModuleId) return canonicalModuleId;

  const semanticSeparatorIndex = normalized.indexOf("--");
  if (semanticSeparatorIndex > 0) {
    return normalizeRuntimeId(normalized.slice(0, semanticSeparatorIndex));
  }

  const legacyMatch = /^(.*)-l\d+$/i.exec(normalized);
  if (legacyMatch?.[1]) {
    return normalizeRuntimeId(legacyMatch[1]);
  }

  return null;
}

export function resolveCourseModuleRuntimeId(body: unknown, slug: string): string | null {
  const runtimeId = getBodyRuntimeId(body, "moduleId") ?? inferCourseModuleRuntimeIdFromSlug(slug);
  return resolveCanonicalCourseModuleRuntimeId(runtimeId) ?? runtimeId;
}

export function resolveCourseLessonRuntimeId(body: unknown, slug: string): string | null {
  const runtimeId = getBodyRuntimeId(body, "lessonId") ?? inferCourseLessonRuntimeIdFromSlug(slug);
  return resolveCanonicalCourseLessonRuntimeId(runtimeId) ?? runtimeId;
}

export function resolveCourseModuleRuntimeAliases(body: unknown, slug: string): string[] {
  const rawRuntimeId =
    getBodyRuntimeId(body, "moduleId") ?? inferCourseModuleRuntimeIdFromSlug(slug);
  const canonicalRuntimeId = resolveCourseModuleRuntimeId(body, slug);
  return filterCanonicalRuntimeIdAliases(
    mergeRuntimeIdAliases(
      getBodyRuntimeIds(body, "legacyModuleIds"),
      resolveCourseModuleLegacyRuntimeIds(rawRuntimeId),
      rawRuntimeId ? [rawRuntimeId] : []
    ),
    canonicalRuntimeId
  );
}

export function resolveCourseLessonRuntimeAliases(body: unknown, slug: string): string[] {
  const rawRuntimeId =
    getBodyRuntimeId(body, "lessonId") ?? inferCourseLessonRuntimeIdFromSlug(slug);
  const canonicalRuntimeId = resolveCourseLessonRuntimeId(body, slug);
  return filterCanonicalRuntimeIdAliases(
    mergeRuntimeIdAliases(
      getBodyRuntimeIds(body, "legacyLessonIds"),
      resolveCourseLessonLegacyRuntimeIds(rawRuntimeId),
      rawRuntimeId ? [rawRuntimeId] : []
    ),
    canonicalRuntimeId
  );
}

export function resolveCourseLessonModuleRuntimeId(params: {
  body: unknown;
  lessonId: string | null;
  parentId: string | null;
  moduleIdByRowId: ReadonlyMap<string, string>;
}): string | null {
  const moduleIdFromParent = params.parentId ? params.moduleIdByRowId.get(params.parentId) : null;
  if (moduleIdFromParent) return moduleIdFromParent;

  return (
    getBodyRuntimeId(params.body, "moduleId") ??
    (params.lessonId ? inferCourseModuleRuntimeIdFromLessonRuntimeId(params.lessonId) : null)
  );
}

export function buildCourseLessonModuleIdMap(modules: CourseModule[]): Map<string, string> {
  const lessonToModuleId = new Map<string, string>();

  for (const courseModule of modules) {
    const moduleId = normalizeRuntimeId(courseModule.id);
    if (!moduleId) continue;

    for (const lesson of courseModule.lessons) {
      const lessonId = normalizeRuntimeId(lesson.id);
      if (!lessonId || lessonToModuleId.has(lessonId)) continue;
      lessonToModuleId.set(lessonId, moduleId);

      for (const legacyLessonId of normalizeRuntimeIdList(lesson.legacyIds)) {
        if (lessonToModuleId.has(legacyLessonId)) continue;
        lessonToModuleId.set(legacyLessonId, moduleId);
      }
    }
  }

  return lessonToModuleId;
}

export function buildCanonicalCourseLessonIdMap(modules: CourseModule[]): Map<string, string> {
  const canonicalLessonIdByAlias = new Map<string, string>();

  for (const courseModule of modules) {
    for (const lesson of courseModule.lessons) {
      const lessonId = normalizeRuntimeId(lesson.id);
      if (!lessonId) continue;

      if (!canonicalLessonIdByAlias.has(lessonId)) {
        canonicalLessonIdByAlias.set(lessonId, lessonId);
      }

      for (const legacyLessonId of normalizeRuntimeIdList(lesson.legacyIds)) {
        if (canonicalLessonIdByAlias.has(legacyLessonId)) continue;
        canonicalLessonIdByAlias.set(legacyLessonId, lessonId);
      }
    }
  }

  return canonicalLessonIdByAlias;
}

export function canonicalizeCourseLessonRuntimeId(
  lessonId: string,
  canonicalLessonIdByAlias: ReadonlyMap<string, string>
): string | null {
  const normalizedLessonId = normalizeRuntimeId(lessonId);
  if (!normalizedLessonId) return null;

  return canonicalLessonIdByAlias.get(normalizedLessonId) ?? normalizedLessonId;
}
