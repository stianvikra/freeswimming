export const COURSE_LAST_LESSON_STORAGE_KEY = "fs_course_last_lesson";

export function buildCourseContinueHref(lastLessonId: string | null | undefined): string {
  if (typeof lastLessonId !== "string") return "/course";
  const lessonId = lastLessonId.trim();
  if (!lessonId) return "/course";
  return `/course?lesson=${encodeURIComponent(lessonId)}`;
}
