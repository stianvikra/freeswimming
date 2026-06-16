import { COURSE_MODULES } from "@/app/course/courseData";
import { buildCourseLessonHref, buildCourseOverviewPath } from "@/lib/course/canonical-routes";

export const COURSE_LAST_LESSON_STORAGE_KEY = "fs_course_last_lesson";

export function buildCourseContinueHref(lastLessonId: string | null | undefined): string {
  if (typeof lastLessonId !== "string") return buildCourseOverviewPath();
  const lessonId = lastLessonId.trim();
  if (!lessonId) return buildCourseOverviewPath();
  return buildCourseLessonHref(COURSE_MODULES, lessonId);
}
