import { buildPublicRoutePayload } from "@/lib/analytics/public";

export const COURSE_ANALYTICS_SOURCE = "course";
export const COURSE_ANALYTICS_SURFACE = "course_lesson";
export const COURSE_ANALYTICS_ROUTE_TEMPLATE = "/course";

export const COURSE_LESSON_ANALYTICS_EVENTS = [
  "course_lesson_viewed",
  "course_lesson_completed",
  "course_lesson_continued",
  "course_lesson_support_clicked",
] as const;

export type CourseLessonAnalyticsEventName = (typeof COURSE_LESSON_ANALYTICS_EVENTS)[number];

export const COURSE_LESSON_SUPPORT_ACTION_IDS = [
  "video_analysis",
  "poolside_guide",
  "guide_0_to_1000",
  "contact",
] as const;

export type CourseLessonSupportActionId = (typeof COURSE_LESSON_SUPPORT_ACTION_IDS)[number];

export const COURSE_LESSON_STATUS_VALUES = ["ready", "in_progress", "done"] as const;
export type CourseLessonAnalyticsStatus = (typeof COURSE_LESSON_STATUS_VALUES)[number];

const SAFE_COURSE_DIMENSION_PATTERN = /^[a-z0-9][a-z0-9_:-]{0,120}$/;
const SUPPORT_ACTION_ID_SET = new Set<string>(COURSE_LESSON_SUPPORT_ACTION_IDS);
const STATUS_SET = new Set<string>(COURSE_LESSON_STATUS_VALUES);

function toSafeCourseDimension(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || !SAFE_COURSE_DIMENSION_PATTERN.test(normalized)) return undefined;
  return normalized;
}

export function normalizeCourseLessonSupportActionId(
  actionId: string | null | undefined
): CourseLessonSupportActionId | undefined {
  if (actionId === "videoAnalysis") return "video_analysis";
  if (actionId === "poolsideGuide") return "poolside_guide";
  if (actionId === "guide0To1000") return "guide_0_to_1000";
  if (actionId === "contact") return "contact";

  const normalized = toSafeCourseDimension(actionId);
  if (!normalized || !SUPPORT_ACTION_ID_SET.has(normalized)) return undefined;
  return normalized as CourseLessonSupportActionId;
}

export function buildCourseLessonAnalyticsPayload(input: {
  lessonId: string;
  moduleId: string | null | undefined;
  lessonVariant: string | null | undefined;
  lessonStatus?: CourseLessonAnalyticsStatus | string | null;
  actionId?: CourseLessonSupportActionId | string | null;
}) {
  const lessonStatus = input.lessonStatus?.trim().toLowerCase();
  const actionId = normalizeCourseLessonSupportActionId(input.actionId);

  return {
    source: COURSE_ANALYTICS_SOURCE,
    surface: COURSE_ANALYTICS_SURFACE,
    ...buildPublicRoutePayload(COURSE_ANALYTICS_ROUTE_TEMPLATE),
    lessonId: toSafeCourseDimension(input.lessonId),
    moduleId: toSafeCourseDimension(input.moduleId),
    lessonVariant: toSafeCourseDimension(input.lessonVariant),
    lessonStatus: lessonStatus && STATUS_SET.has(lessonStatus) ? lessonStatus : undefined,
    actionId,
  };
}
