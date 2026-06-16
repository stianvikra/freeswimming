import type { Metadata } from "next";

import {
  COURSE_DEFAULT_LOCALE,
  COURSE_SITE_ORIGIN,
  buildCourseLessonRoute,
  buildCourseOverviewPath,
  buildCourseOverviewUrl,
  getCourseAlternateLanguagePaths,
  normalizeIndexableCourseLocale,
  type CourseIndexableLocale,
  type CourseRouteLesson,
} from "@/lib/course/canonical-routes";
import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";

import {
  COURSE_LESSONS_FLAT,
  COURSE_MODULES,
  type CourseLesson,
  type CourseModule,
} from "./courseData";

export type CoursePageMetadataSearchParams = Record<string, string | string[] | undefined>;

type CoursePageMetadataInput = {
  lessonParam?: string | string[] | null;
  previewParam?: string | string[] | null;
  locale?: string | string[] | null;
};

type ResolvedCoursePageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  lesson: CourseLesson | null;
  module: CourseModule | null;
  lessonRoute: CourseRouteLesson | null;
  locale: CourseIndexableLocale;
  previewEnabled: boolean;
};

const COURSE_TITLE = "Freestyle Course";
const COURSE_DESCRIPTION = "Free, step-by-step freestyle swimming lessons for adult learners.";
const COURSE_LESSON_ID_BY_ALIAS = buildCanonicalCourseLessonIdMap(COURSE_MODULES);

function readSingleParam(value: string | string[] | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveCourseLessonForMetadata(lessonParam: string | string[] | null | undefined) {
  const rawLessonId = readSingleParam(lessonParam);
  if (!rawLessonId) return null;

  const canonicalLessonId = canonicalizeCourseLessonRuntimeId(
    rawLessonId,
    COURSE_LESSON_ID_BY_ALIAS
  );
  return COURSE_LESSONS_FLAT.find((lesson) => lesson.id === canonicalLessonId) ?? null;
}

function resolveMetadataLocale(localeParam: string | string[] | null | undefined) {
  return normalizeIndexableCourseLocale(readSingleParam(localeParam)) ?? COURSE_DEFAULT_LOCALE;
}

function buildLessonDescription(lesson: CourseLesson): string {
  const goal = lesson.goal.trim();
  if (!goal) return COURSE_DESCRIPTION;
  return goal.endsWith(".") ? goal : `${goal}.`;
}

export function resolveCoursePageMetadata({
  lessonParam,
  previewParam,
  locale: localeParam,
}: CoursePageMetadataInput = {}): ResolvedCoursePageMetadata {
  const locale = resolveMetadataLocale(localeParam);
  const lesson = resolveCourseLessonForMetadata(lessonParam);
  const previewEnabled = readSingleParam(previewParam) === "1";

  if (!lesson) {
    const canonicalPath = buildCourseOverviewPath(locale);
    return {
      title: COURSE_TITLE,
      description: COURSE_DESCRIPTION,
      canonicalPath,
      canonicalUrl: `${COURSE_SITE_ORIGIN}${canonicalPath}`,
      lesson: null,
      module: null,
      lessonRoute: null,
      locale,
      previewEnabled,
    };
  }

  const lessonRoute = buildCourseLessonRoute(COURSE_MODULES, lesson.id, locale);
  const canonicalPath = lessonRoute?.path ?? buildCourseOverviewPath(locale);

  return {
    title: `${lesson.title} - ${COURSE_TITLE}`,
    description: buildLessonDescription(lesson),
    canonicalPath,
    canonicalUrl: `${COURSE_SITE_ORIGIN}${canonicalPath}`,
    lesson,
    module: lessonRoute?.module ?? null,
    lessonRoute,
    locale,
    previewEnabled,
  };
}

export function buildCoursePageMetadata(input: CoursePageMetadataInput = {}): Metadata {
  const resolved = resolveCoursePageMetadata(input);

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalPath,
      languages: getCourseAlternateLanguagePaths(resolved.canonicalPath),
    },
    openGraph: {
      type: "website",
      title: resolved.title,
      description: resolved.description,
      url: resolved.canonicalPath,
    },
    twitter: {
      card: "summary",
      title: resolved.title,
      description: resolved.description,
    },
    ...(resolved.previewEnabled
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}

function buildOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${COURSE_SITE_ORIGIN}/#organization`,
    name: "freeswimming.org",
    url: COURSE_SITE_ORIGIN,
  };
}

function buildCourseJsonLd(locale: CourseIndexableLocale) {
  return {
    "@type": "Course",
    "@id": `${buildCourseOverviewUrl(locale)}#course`,
    name: COURSE_TITLE,
    description: COURSE_DESCRIPTION,
    url: buildCourseOverviewUrl(locale),
    inLanguage: locale,
    availableLanguage: ["en"],
    provider: {
      "@id": `${COURSE_SITE_ORIGIN}/#organization`,
    },
  };
}

function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildCourseStructuredData(input: CoursePageMetadataInput = {}) {
  const resolved = resolveCoursePageMetadata(input);
  const organization = buildOrganizationJsonLd();
  const course = buildCourseJsonLd(resolved.locale);

  if (!resolved.lesson || !resolved.lessonRoute) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        organization,
        course,
        {
          "@type": "WebPage",
          "@id": `${resolved.canonicalUrl}#webpage`,
          url: resolved.canonicalUrl,
          name: COURSE_TITLE,
          description: COURSE_DESCRIPTION,
          inLanguage: resolved.locale,
          about: {
            "@id": `${buildCourseOverviewUrl(resolved.locale)}#course`,
          },
        },
        buildBreadcrumbJsonLd([{ name: "Course", url: resolved.canonicalUrl }]),
      ],
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      course,
      {
        "@type": "LearningResource",
        "@id": `${resolved.canonicalUrl}#lesson`,
        name: resolved.lesson.title,
        description: resolved.description,
        url: resolved.canonicalUrl,
        inLanguage: resolved.locale,
        learningResourceType: resolved.lesson.lessonType ?? "lesson",
        teaches: resolved.lesson.goal,
        isPartOf: {
          "@id": `${buildCourseOverviewUrl(resolved.locale)}#course`,
        },
        provider: {
          "@id": `${COURSE_SITE_ORIGIN}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${resolved.canonicalUrl}#webpage`,
        url: resolved.canonicalUrl,
        name: resolved.title,
        description: resolved.description,
        inLanguage: resolved.locale,
        about: {
          "@id": `${resolved.canonicalUrl}#lesson`,
        },
      },
      buildBreadcrumbJsonLd([
        { name: "Course", url: buildCourseOverviewUrl(resolved.locale) },
        {
          name: resolved.module?.title ?? "Course module",
          url: `${buildCourseOverviewUrl(resolved.locale)}#${resolved.lessonRoute.moduleSlug}`,
        },
        { name: resolved.lesson.title, url: resolved.canonicalUrl },
      ]),
    ],
  };
}
