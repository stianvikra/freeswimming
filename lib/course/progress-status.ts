import type { CourseLesson } from "@/app/course/courseData";

export type CourseLessonProgressStatus = "not_started" | "in_progress" | "done";

const LEGACY_DEFAULT_PASS_CRITERIA = [
  "Complete 3 calm repetitions with the same cue.",
  "Breathing stays controlled without rushing.",
  "Body line stays stable from start to finish.",
] as const;

const DEFAULT_LEARN_PASS_CRITERIA = [
  "You can explain the main cue in one sentence.",
  "You know what to look for on the next rep.",
  "You are ready to test this calmly in the water.",
] as const;

const DEFAULT_DRILL_PASS_CRITERIA = [
  "You completed 3 calm repetitions without rushing.",
  "The main cue stayed consistent from start to finish.",
  "You could repeat the same effort again right away.",
] as const;

const DEFAULT_SWIM_PASS_CRITERIA = [
  "You finished the full repeat with calm control.",
  "The main cue stayed consistent from start to finish.",
  "Breathing and body line stayed settled enough to repeat again.",
] as const;

export function isCourseLessonCheckpointEnabled(
  lesson: Pick<CourseLesson, "display">
): boolean {
  return lesson.display?.checkpoint !== false;
}

export function getDefaultCoursePassCriteria(
  lessonType: CourseLesson["lessonType"] | undefined
): string[] {
  if (lessonType === "learn") return [...DEFAULT_LEARN_PASS_CRITERIA];
  if (lessonType === "swim") return [...DEFAULT_SWIM_PASS_CRITERIA];
  return [...DEFAULT_DRILL_PASS_CRITERIA];
}

export function getCourseLessonPassCriteria(
  lesson: Pick<CourseLesson, "lessonType" | "passCriteria">
): string[] {
  return lesson.passCriteria?.length
    ? [...lesson.passCriteria]
    : getDefaultCoursePassCriteria(lesson.lessonType);
}

export function normalizeCourseLessonCriteriaChecks(
  lesson: Pick<CourseLesson, "lessonType" | "passCriteria">,
  checks: string[]
): string[] {
  const passCriteria = getCourseLessonPassCriteria(lesson);
  const fallbackLegacyCriteria: string[] = lesson.passCriteria?.length
    ? []
    : [...LEGACY_DEFAULT_PASS_CRITERIA];
  const normalizedChecks = new Set<string>();

  for (const value of checks) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized) continue;

    if (passCriteria.includes(normalized)) {
      normalizedChecks.add(normalized);
      continue;
    }

    const legacyIndex = fallbackLegacyCriteria.indexOf(normalized);
    if (legacyIndex >= 0 && legacyIndex < passCriteria.length) {
      normalizedChecks.add(passCriteria[legacyIndex]);
    }
  }

  return passCriteria.filter((criterion) => normalizedChecks.has(criterion));
}

export function normalizeCourseLessonCriteriaCheckRecord(
  input: unknown,
  options: {
    getLessonById: (
      lessonId: string
    ) => Pick<CourseLesson, "id" | "lessonType" | "passCriteria" | "display"> | null;
    resolveLessonId?: (lessonId: string) => string | null;
  }
): Record<string, string[]> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const merged = new Map<string, Set<string>>();

  for (const [rawLessonId, rawChecks] of Object.entries(input)) {
    if (!Array.isArray(rawChecks)) continue;

    const lessonId = options.resolveLessonId?.(rawLessonId) ?? rawLessonId.trim();
    if (!lessonId) continue;

    const lesson = options.getLessonById(lessonId);
    if (!lesson) continue;

    const normalizedChecks = normalizeCourseLessonCriteriaChecks(
      lesson,
      rawChecks.filter((value): value is string => typeof value === "string")
    );
    if (normalizedChecks.length === 0) continue;

    const existing = merged.get(lessonId) ?? new Set<string>();
    for (const criterion of normalizedChecks) {
      existing.add(criterion);
    }
    merged.set(lessonId, existing);
  }

  const next: Record<string, string[]> = {};
  for (const [lessonId, criteriaSet] of merged.entries()) {
    const lesson = options.getLessonById(lessonId);
    if (!lesson) continue;
    const passCriteria = getCourseLessonPassCriteria(lesson);
    next[lessonId] = passCriteria.filter((criterion) => criteriaSet.has(criterion));
  }

  return next;
}

export function countSatisfiedCourseLessonCriteria(
  lesson: Pick<CourseLesson, "id" | "lessonType" | "passCriteria" | "display">,
  doneGateChecksByLessonId: Record<string, string[]>
): number {
  if (!isCourseLessonCheckpointEnabled(lesson)) return 0;

  const passCriteria = getCourseLessonPassCriteria(lesson);
  const checkedSet = new Set(
    normalizeCourseLessonCriteriaChecks(lesson, doneGateChecksByLessonId[lesson.id] ?? [])
  );

  return passCriteria.filter((criterion) => checkedSet.has(criterion)).length;
}

export function getCourseLessonProgressStatus(
  lesson: Pick<CourseLesson, "id" | "lessonType" | "passCriteria" | "display">,
  doneLessonIdSet: Set<string>,
  doneGateChecksByLessonId: Record<string, string[]>
): CourseLessonProgressStatus {
  if (doneLessonIdSet.has(lesson.id)) return "done";
  if (countSatisfiedCourseLessonCriteria(lesson, doneGateChecksByLessonId) > 0) {
    return "in_progress";
  }
  return "not_started";
}

export function buildCourseLessonProgressStatusMap(
  lessons: Array<Pick<CourseLesson, "id" | "lessonType" | "passCriteria" | "display">>,
  doneLessonIdSet: Set<string>,
  doneGateChecksByLessonId: Record<string, string[]>
): Record<string, CourseLessonProgressStatus> {
  const next: Record<string, CourseLessonProgressStatus> = {};

  for (const lesson of lessons) {
    next[lesson.id] = getCourseLessonProgressStatus(
      lesson,
      doneLessonIdSet,
      doneGateChecksByLessonId
    );
  }

  return next;
}
