import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  COURSE_INDEXABLE_LOCALES,
  normalizeIndexableCourseLocale,
  type CourseIndexableLocale,
} from "@/lib/course/canonical-routes";

import CoursePage from "../../course/page";
import { buildCoursePageMetadata, buildCourseStructuredData } from "../../course/metadata";

type Params = Promise<{ locale: string }>;

type Props = {
  params: Params;
};

export function generateStaticParams() {
  return COURSE_INDEXABLE_LOCALES.map((locale) => ({ locale }));
}

async function resolveLocale(params: Params): Promise<CourseIndexableLocale> {
  const { locale: rawLocale } = await params;
  const locale = normalizeIndexableCourseLocale(rawLocale);
  if (!locale) notFound();
  return locale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return buildCoursePageMetadata({ locale });
}

function CourseStructuredData({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default async function LocalizedCourseOverviewPage({ params }: Props) {
  const locale = await resolveLocale(params);

  return (
    <>
      <CourseStructuredData data={buildCourseStructuredData({ locale })} />
      <CoursePage />
    </>
  );
}
