import type { CourseLesson, CourseModule } from "@/app/course/courseData";
import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";
import {
  resolveCanonicalCourseLessonRuntimeIdBySlug,
  resolveCanonicalCourseLessonSlug,
  resolveCanonicalCourseModuleSlug,
} from "@/lib/course/runtime-id-manifest";

export const COURSE_DEFAULT_LOCALE = "en" as const;
export const COURSE_SUPPORTED_LOCALES = ["en", "nb"] as const;
export const COURSE_INDEXABLE_LOCALES = ["en"] as const;
export const COURSE_SITE_ORIGIN = "https://freeswimming.org";

export type CourseLocale = (typeof COURSE_SUPPORTED_LOCALES)[number];
export type CourseIndexableLocale = (typeof COURSE_INDEXABLE_LOCALES)[number];

export type CourseRouteLesson = {
  locale: CourseIndexableLocale;
  module: CourseModule;
  lesson: CourseLesson;
  moduleSlug: string;
  lessonSlug: string;
  path: string;
  url: string;
};

export type CourseRouteResolution =
  | { status: "ok"; route: CourseRouteLesson }
  | { status: "redirect"; route: CourseRouteLesson }
  | { status: "not-found" };

export function normalizeCourseLocale(value: string | null | undefined): CourseLocale | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return COURSE_SUPPORTED_LOCALES.includes(normalized as CourseLocale)
    ? (normalized as CourseLocale)
    : null;
}

export function normalizeIndexableCourseLocale(
  value: string | null | undefined
): CourseIndexableLocale | null {
  const locale = normalizeCourseLocale(value);
  if (!locale) return null;
  return COURSE_INDEXABLE_LOCALES.includes(locale as CourseIndexableLocale)
    ? (locale as CourseIndexableLocale)
    : null;
}

export function buildCourseOverviewPath(locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE) {
  return `/${locale}/course`;
}

export function buildCourseOverviewUrl(locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE) {
  return `${COURSE_SITE_ORIGIN}${buildCourseOverviewPath(locale)}`;
}

function normalizeSlugPart(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function slugifyCourseRoutePart(value: string, fallback: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || fallback;
}

function buildCourseModuleSlug(courseModule: CourseModule): string {
  return (
    resolveCanonicalCourseModuleSlug(courseModule.id) ??
    `course-module-${slugifyCourseRoutePart(courseModule.title, courseModule.id)}`
  );
}

function buildCourseLessonSlug(courseModule: CourseModule, lesson: CourseLesson): string {
  return (
    resolveCanonicalCourseLessonSlug(lesson.id) ??
    `course-lesson-${slugifyCourseRoutePart(`${courseModule.title} ${lesson.title}`, lesson.id)}`
  );
}

function findLessonLocationById(
  modules: CourseModule[],
  lessonId: string | null | undefined
): { module: CourseModule; lesson: CourseLesson } | null {
  if (!lessonId) return null;
  const lessonIdMap = buildCanonicalCourseLessonIdMap(modules);
  const canonicalLessonId = canonicalizeCourseLessonRuntimeId(lessonId, lessonIdMap);
  if (!canonicalLessonId) return null;

  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find((candidate) => candidate.id === canonicalLessonId);
    if (lesson) {
      return { module: courseModule, lesson };
    }
  }

  return null;
}

export function buildCourseLessonRoute(
  modules: CourseModule[],
  lessonId: string | null | undefined,
  locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE
): CourseRouteLesson | null {
  const location = findLessonLocationById(modules, lessonId);
  if (!location) return null;

  const moduleSlug = buildCourseModuleSlug(location.module);
  const lessonSlug = buildCourseLessonSlug(location.module, location.lesson);
  const path = `${buildCourseOverviewPath(locale)}/${moduleSlug}/${lessonSlug}`;

  return {
    locale,
    module: location.module,
    lesson: location.lesson,
    moduleSlug,
    lessonSlug,
    path,
    url: `${COURSE_SITE_ORIGIN}${path}`,
  };
}

export function buildCourseLessonPath(
  modules: CourseModule[],
  lessonId: string | null | undefined,
  locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE
): string | null {
  return buildCourseLessonRoute(modules, lessonId, locale)?.path ?? null;
}

export function buildCourseLessonLegacyQueryPath(lessonId: string | null | undefined): string {
  const normalized = typeof lessonId === "string" ? lessonId.trim() : "";
  if (!normalized) return "/course";
  return `/course?lesson=${encodeURIComponent(normalized)}`;
}

export function buildCourseLessonHref(
  modules: CourseModule[],
  lessonId: string | null | undefined,
  locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE
): string {
  return (
    buildCourseLessonPath(modules, lessonId, locale) ?? buildCourseLessonLegacyQueryPath(lessonId)
  );
}

export function resolveCourseLessonRouteBySlugs(
  modules: CourseModule[],
  input: {
    locale: string | null | undefined;
    moduleSlug: string | null | undefined;
    lessonSlug: string | null | undefined;
  }
): CourseRouteResolution {
  const locale = normalizeIndexableCourseLocale(input.locale);
  if (!locale) return { status: "not-found" };

  const moduleSlug = normalizeSlugPart(input.moduleSlug);
  const lessonSlug = normalizeSlugPart(input.lessonSlug);
  if (!moduleSlug || !lessonSlug) return { status: "not-found" };

  for (const courseModule of modules) {
    for (const lesson of courseModule.lessons) {
      const route = buildCourseLessonRoute(modules, lesson.id, locale);
      if (!route) continue;

      if (route.moduleSlug === moduleSlug && route.lessonSlug === lessonSlug) {
        return { status: "ok", route };
      }
    }
  }

  const lessonIdFromSlug = resolveCanonicalCourseLessonRuntimeIdBySlug(lessonSlug);
  const routeFromLessonSlug = buildCourseLessonRoute(modules, lessonIdFromSlug, locale);
  if (routeFromLessonSlug) {
    return { status: "redirect", route: routeFromLessonSlug };
  }

  return { status: "not-found" };
}

export function getIndexableCourseLessonRoutes(
  modules: CourseModule[],
  locale: CourseIndexableLocale = COURSE_DEFAULT_LOCALE
): CourseRouteLesson[] {
  return modules.flatMap((courseModule) =>
    courseModule.lessons
      .map((lesson) => buildCourseLessonRoute(modules, lesson.id, locale))
      .filter((route): route is CourseRouteLesson => route !== null)
  );
}

export function getCourseAlternateLanguagePaths(path: string) {
  return {
    en: path,
    "x-default": path,
  };
}
