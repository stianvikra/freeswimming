import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  COURSE_INDEXABLE_LOCALES,
  getIndexableCourseLessonRoutes,
  resolveCourseLessonRouteBySlugs,
  type CourseRouteLesson,
} from "@/lib/course/canonical-routes";

import CoursePage from "../../../../course/page";
import { COURSE_MODULES } from "../../../../course/courseData";
import { buildCoursePageMetadata, buildCourseStructuredData } from "../../../../course/metadata";

type Params = Promise<{
  locale: string;
  moduleSlug: string;
  lessonSlug: string;
}>;

type Props = {
  params: Params;
};

export function generateStaticParams() {
  return COURSE_INDEXABLE_LOCALES.flatMap((locale) =>
    getIndexableCourseLessonRoutes(COURSE_MODULES, locale).map((route) => ({
      locale,
      moduleSlug: route.moduleSlug,
      lessonSlug: route.lessonSlug,
    }))
  );
}

async function resolveRoute(params: Params): Promise<CourseRouteLesson> {
  const { locale, moduleSlug, lessonSlug } = await params;
  const resolution = resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
    locale,
    moduleSlug,
    lessonSlug,
  });

  if (resolution.status === "not-found") notFound();
  if (resolution.status === "redirect") permanentRedirect(resolution.route.path);

  return resolution.route;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await resolveRoute(params);
  return buildCoursePageMetadata({
    lessonParam: route.lesson.id,
    locale: route.locale,
  });
}

function CourseStructuredData({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default async function LocalizedCourseLessonPage({ params }: Props) {
  const route = await resolveRoute(params);

  return (
    <>
      <CourseStructuredData
        data={buildCourseStructuredData({
          lessonParam: route.lesson.id,
          locale: route.locale,
        })}
      />
      <CoursePage />
    </>
  );
}
