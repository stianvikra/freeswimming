import type { Metadata } from "next";
import type { ReactNode } from "react";

import { COURSE_DEFAULT_LOCALE } from "@/lib/course/canonical-routes";

import { buildCoursePageMetadata, buildCourseStructuredData } from "./metadata";

export const metadata: Metadata = buildCoursePageMetadata({ locale: COURSE_DEFAULT_LOCALE });

function CourseStructuredData({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function CourseLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CourseStructuredData
        data={buildCourseStructuredData({
          locale: COURSE_DEFAULT_LOCALE,
        })}
      />
      {children}
    </>
  );
}
