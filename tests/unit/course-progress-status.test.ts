import { describe, expect, it } from "vitest";

import type { CourseLesson } from "@/app/course/courseData";
import {
  buildCourseLessonProgressStatusMap,
  countSatisfiedCourseLessonCriteria,
  getCourseLessonPassCriteria,
  getCourseLessonProgressStatus,
  normalizeCourseLessonCriteriaChecks,
  normalizeCourseLessonCriteriaCheckRecord,
} from "@/lib/course/progress-status";

function makeLesson(overrides: Partial<CourseLesson> = {}): CourseLesson {
  return {
    id: "lesson-1",
    title: "Lesson",
    youtubeId: "abc123",
    lessonType: "learn",
    goal: "Goal",
    cues: ["Cue"],
    drill: {
      title: "Drill",
      steps: ["Step 1"],
    },
    nextStep: "Next step",
    ...overrides,
  };
}

describe("course progress status helpers", () => {
  it("uses clearer learn defaults when no pass criteria are authored", () => {
    expect(getCourseLessonPassCriteria(makeLesson())).toEqual([
      "You can explain the main cue in one sentence.",
      "You know what to look for on the next rep.",
      "You are ready to test this calmly in the water.",
    ]);
  });

  it("keeps authored pass criteria when present", () => {
    expect(
      getCourseLessonPassCriteria(
        makeLesson({
          passCriteria: ["Authored 1", "Authored 2"],
        })
      )
    ).toEqual(["Authored 1", "Authored 2"]);
  });

  it("treats checked criteria as in-progress before lesson is done", () => {
    const lesson = makeLesson();

    expect(
      getCourseLessonProgressStatus(lesson, new Set(), {
        "lesson-1": ["You can explain the main cue in one sentence."],
      })
    ).toBe("in_progress");
  });

  it("normalizes legacy default checklist strings onto the new fallback copy", () => {
    const lesson = makeLesson();

    expect(
      normalizeCourseLessonCriteriaChecks(lesson, [
        "Complete 3 calm repetitions with the same cue.",
        "Body line stays stable from start to finish.",
      ])
    ).toEqual([
      "You can explain the main cue in one sentence.",
      "You are ready to test this calmly in the water.",
    ]);
  });

  it("treats done lessons as done even when checklists are also populated", () => {
    const lesson = makeLesson();

    expect(
      getCourseLessonProgressStatus(lesson, new Set(["lesson-1"]), {
        "lesson-1": ["You can explain the main cue in one sentence."],
      })
    ).toBe("done");
  });

  it("does not invent partial progress for lessons with hidden checkpoints", () => {
    const lesson = makeLesson({
      display: {
        checkpoint: false,
      },
    });

    expect(countSatisfiedCourseLessonCriteria(lesson, { "lesson-1": ["Anything"] })).toBe(0);
    expect(getCourseLessonProgressStatus(lesson, new Set(), { "lesson-1": ["Anything"] })).toBe(
      "not_started"
    );
  });

  it("builds a stable status map across multiple lessons", () => {
    const lessons = [
      makeLesson({ id: "lesson-done" }),
      makeLesson({ id: "lesson-partial" }),
      makeLesson({ id: "lesson-fresh" }),
    ];

    expect(
      buildCourseLessonProgressStatusMap(lessons, new Set(["lesson-done"]), {
        "lesson-partial": ["You can explain the main cue in one sentence."],
      })
    ).toEqual({
      "lesson-done": "done",
      "lesson-partial": "in_progress",
      "lesson-fresh": "not_started",
    });
  });

  it("rekeys checklist records onto canonical lesson ids when runtime aliases hydrate", () => {
    const canonicalLesson = makeLesson({
      id: "intro-course--welcome-course-structure",
    });

    expect(
      normalizeCourseLessonCriteriaCheckRecord(
        {
          "mod1-l1": ["You can explain the main cue in one sentence."],
        },
        {
          resolveLessonId: (lessonId) =>
            lessonId === "mod1-l1" ? "intro-course--welcome-course-structure" : lessonId,
          getLessonById: (lessonId) => (lessonId === canonicalLesson.id ? canonicalLesson : null),
        }
      )
    ).toEqual({
      "intro-course--welcome-course-structure": [
        "You can explain the main cue in one sentence.",
      ],
    });
  });
});
