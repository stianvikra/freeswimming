import { describe, expect, it } from "vitest";
import type { CourseModule } from "@/app/course/courseData";
import {
  buildMyLibraryCourseSignal,
  buildMyLibrarySeenState,
  buildMyLibrarySeenStorageKey,
  parseMyLibrarySeenState,
  resolveNewContentDecision,
  resolveMyLibraryViewerSince,
} from "@/lib/my-library/new-content-notice";

function buildModules(lessonIds: string[]): CourseModule[] {
  return [
    {
      id: "mod1",
      title: "Intro",
      lessons: lessonIds.map((lessonId, index) => ({
        id: lessonId,
        title: `Lesson ${index + 1}`,
        publishedAt: `2026-04-0${index + 1}T08:00:00.000Z`,
        youtubeId: "abc123",
        goal: "Goal",
        cues: ["Cue"],
        drill: {
          title: "Drill",
          steps: ["Step"],
        },
        nextStep: "Next",
      })),
    },
  ];
}

describe("my-library new content notice helpers", () => {
  it("builds deterministic published-lesson signal", () => {
    const signal = buildMyLibraryCourseSignal(buildModules(["mod1-l2", "mod1-l1", "mod1-l2"]));

    expect(signal.lessonCount).toBe(2);
    expect(signal.firstLessonId).toBe("mod1-l2");
    expect(signal.signature.startsWith("v1:")).toBe(true);
    expect(signal.lessonTokens).toHaveLength(2);
    expect(signal.lessons.map((lesson) => lesson.lessonId)).toEqual(["mod1-l2", "mod1-l1"]);
    expect(signal.lessonTokens[0]).not.toBe("mod1-l2");
    expect(signal.lessons[0]?.publishedAt).toBe("2026-04-01T08:00:00.000Z");
  });

  it("filters out lessons that predate the viewer baseline", () => {
    const signal = buildMyLibraryCourseSignal(buildModules(["mod1-l1", "mod1-l2", "mod1-l3"]), {
      viewerSince: "2026-04-02T12:00:00.000Z",
    });

    expect(signal.lessonCount).toBe(1);
    expect(signal.lessons.map((lesson) => lesson.lessonId)).toEqual(["mod1-l3"]);
  });

  it("falls back to auth-user creation when profile creation is unavailable", () => {
    expect(
      resolveMyLibraryViewerSince({
        userCreatedAt: "2026-03-10T08:00:00.000Z",
      })
    ).toBe("2026-03-10T08:00:00.000Z");
  });

  it("prefers athlete-profile creation when both baselines exist", () => {
    expect(
      resolveMyLibraryViewerSince({
        profileCreatedAt: "2026-03-12T08:00:00.000Z",
        userCreatedAt: "2026-03-10T08:00:00.000Z",
      })
    ).toBe("2026-03-12T08:00:00.000Z");
  });

  it("creates a user-scoped storage key", () => {
    expect(buildMyLibrarySeenStorageKey("user-123")).toBe("fs_library_new_content_seen:user-123");
  });

  it("shows notice on first load when no seen state exists", () => {
    const signal = buildMyLibraryCourseSignal(buildModules(["mod1-l1", "mod1-l2"]));

    expect(resolveNewContentDecision(signal, null)).toEqual({
      state: "show",
      newLessonCount: 2,
      newLessons: signal.lessons,
      shouldPersistCurrent: false,
    });
  });

  it("hides notice when signature is unchanged", () => {
    const signal = buildMyLibraryCourseSignal(buildModules(["mod1-l1", "mod1-l2"]));
    const seen = buildMyLibrarySeenState(signal);

    expect(resolveNewContentDecision(signal, seen)).toEqual({
      state: "hidden",
      newLessonCount: 0,
      newLessons: [],
      shouldPersistCurrent: false,
    });
  });

  it("shows only added lesson delta when signature changes", () => {
    const previousSignal = buildMyLibraryCourseSignal(buildModules(["mod1-l1"]));
    const seen = buildMyLibrarySeenState(previousSignal);
    const nextSignal = buildMyLibraryCourseSignal(buildModules(["mod1-l1", "mod1-l2", "mod1-l3"]));

    const decision = resolveNewContentDecision(nextSignal, seen);

    expect(decision).toEqual({
      state: "show",
      newLessonCount: 2,
      newLessons: nextSignal.lessons.slice(1),
      shouldPersistCurrent: false,
    });
    expect(decision.newLessons.map((lesson) => lesson.lessonId)).toEqual(["mod1-l2", "mod1-l3"]);
  });

  it("reconciles silently when signature changes without newly added lessons", () => {
    const previousSignal = buildMyLibraryCourseSignal(buildModules(["mod1-l1", "mod1-l2"]));
    const seen = buildMyLibrarySeenState(previousSignal);
    const nextSignal = buildMyLibraryCourseSignal(buildModules(["mod1-l1"]));

    expect(resolveNewContentDecision(nextSignal, seen)).toEqual({
      state: "hidden",
      newLessonCount: 0,
      newLessons: [],
      shouldPersistCurrent: true,
    });
  });

  it("parses valid seen state and rejects invalid payload", () => {
    const signal = buildMyLibraryCourseSignal(buildModules(["mod1-l1"]));
    const seen = buildMyLibrarySeenState(signal);

    expect(parseMyLibrarySeenState(JSON.stringify(seen))).toMatchObject({
      signature: signal.signature,
      lessonCount: 1,
    });
    expect(parseMyLibrarySeenState("{")).toBeNull();
    expect(parseMyLibrarySeenState(JSON.stringify({ lessonCount: 1 }))).toBeNull();
  });
});
