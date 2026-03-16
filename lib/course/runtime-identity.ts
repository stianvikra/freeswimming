import type { CourseModule } from "@/app/course/courseData";

function normalizeRuntimeId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getBodyRuntimeId(body: unknown, key: "moduleId" | "lessonId"): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return normalizeRuntimeId((body as Record<string, unknown>)[key]);
}

export function inferCourseModuleRuntimeIdFromSlug(slug: string): string | null {
  const match = slug.match(/^course-module-(.+)$/i);
  return normalizeRuntimeId(match?.[1] ?? slug);
}

export function inferCourseLessonRuntimeIdFromSlug(slug: string): string | null {
  const match = slug.match(/^course-lesson-(.+)$/i);
  return normalizeRuntimeId(match?.[1] ?? slug);
}

export function inferCourseModuleRuntimeIdFromLessonRuntimeId(lessonId: string): string | null {
  const normalized = normalizeRuntimeId(lessonId);
  if (!normalized) return null;

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
  return getBodyRuntimeId(body, "moduleId") ?? inferCourseModuleRuntimeIdFromSlug(slug);
}

export function resolveCourseLessonRuntimeId(body: unknown, slug: string): string | null {
  return getBodyRuntimeId(body, "lessonId") ?? inferCourseLessonRuntimeIdFromSlug(slug);
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
    }
  }

  return lessonToModuleId;
}
