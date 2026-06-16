import type { Metadata } from "next";

import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";

import { COURSE_LESSONS_FLAT, COURSE_MODULES, type CourseLesson } from "./courseData";

export type CoursePageMetadataSearchParams = Record<string, string | string[] | undefined>;

type CoursePageMetadataInput = {
  lessonParam?: string | string[] | null;
  previewParam?: string | string[] | null;
};

type ResolvedCoursePageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  lesson: CourseLesson | null;
  previewEnabled: boolean;
};

const COURSE_TITLE = "Freestyle Course";
const COURSE_DESCRIPTION = "Free, step-by-step freestyle swimming lessons for adult learners.";
const COURSE_CANONICAL_PATH = "/course";
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

function buildLessonDescription(lesson: CourseLesson): string {
  const goal = lesson.goal.trim();
  if (!goal) return COURSE_DESCRIPTION;
  return goal.endsWith(".") ? goal : `${goal}.`;
}

export function resolveCoursePageMetadata({
  lessonParam,
  previewParam,
}: CoursePageMetadataInput = {}): ResolvedCoursePageMetadata {
  const lesson = resolveCourseLessonForMetadata(lessonParam);
  const previewEnabled = readSingleParam(previewParam) === "1";

  if (!lesson) {
    return {
      title: COURSE_TITLE,
      description: COURSE_DESCRIPTION,
      canonicalPath: COURSE_CANONICAL_PATH,
      lesson: null,
      previewEnabled,
    };
  }

  return {
    title: `${lesson.title} - ${COURSE_TITLE}`,
    description: buildLessonDescription(lesson),
    canonicalPath: `${COURSE_CANONICAL_PATH}?lesson=${encodeURIComponent(lesson.id)}`,
    lesson,
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
