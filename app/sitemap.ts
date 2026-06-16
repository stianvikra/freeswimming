import type { MetadataRoute } from "next";
import { COURSE_MODULES } from "@/app/course/courseData";
import {
  COURSE_DEFAULT_LOCALE,
  buildCourseOverviewUrl,
  getIndexableCourseLessonRoutes,
} from "@/lib/course/canonical-routes";
import { isSiteLockEnabled } from "@/lib/site-lock/config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isSiteLockEnabled()) {
    return [];
  }

  const baseUrl = "https://freeswimming.org";
  const courseLessonRoutes = getIndexableCourseLessonRoutes(COURSE_MODULES, COURSE_DEFAULT_LOCALE);

  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: buildCourseOverviewUrl(COURSE_DEFAULT_LOCALE),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...courseLessonRoutes.map((route) => ({
      url: route.url,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    })),
    { url: `${baseUrl}/programs`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/analysis`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/our-method`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/cookies`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
