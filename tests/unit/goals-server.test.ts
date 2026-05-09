import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadPublishedCourseModulesCachedMock } = vi.hoisted(() => ({
  loadPublishedCourseModulesCachedMock: vi.fn(),
}));

vi.mock("@/lib/admin/content-course", () => ({
  loadPublishedCourseModulesCached: loadPublishedCourseModulesCachedMock,
}));

import { loadGoalProgressContext } from "@/lib/goals/server";

function createResolvedQuery<T>(result: T) {
  const promise = Promise.resolve(result);
  const query = {
    eq: vi.fn(() => query),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  return query;
}

function createSupabaseStub(params: {
  guideRows?: Array<{ section_id: string }>;
  courseRows?: Array<{ lesson_id: string }>;
}) {
  return {
    from(table: string) {
      if (table === "guide_progress") {
        return {
          select() {
            return createResolvedQuery({
              data: params.guideRows ?? [],
              error: null,
            });
          },
        };
      }

      if (table === "course_progress") {
        return {
          select() {
            return createResolvedQuery({
              data: params.courseRows ?? [],
              error: null,
            });
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

describe("loadGoalProgressContext", () => {
  beforeEach(() => {
    loadPublishedCourseModulesCachedMock.mockReset();
  });

  it("counts completed lessons by published module membership instead of hyphen parsing", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([
      {
        id: "intro-course",
        title: "Introduction to the Course",
        lessons: [
          {
            id: "intro-course--welcome-course-structure",
            title: "Welcome",
            youtubeId: "abc123",
            goal: "Goal",
            cues: ["Cue"],
            drill: { title: "Drill", steps: ["Step"] },
            nextStep: "Next",
          },
        ],
      },
    ]);

    const context = await loadGoalProgressContext(
      createSupabaseStub({
        courseRows: [{ lesson_id: "intro-course--welcome-course-structure" }],
      }) as never,
      "user-1"
    );

    expect(loadPublishedCourseModulesCachedMock).toHaveBeenCalledTimes(1);
    expect(context.completedModuleLessonCounts.get("intro-course")).toBe(1);
  });

  it("falls back to compatibility inference when published module lookup misses a legacy lesson id", async () => {
    loadPublishedCourseModulesCachedMock.mockResolvedValue([]);

    const context = await loadGoalProgressContext(
      createSupabaseStub({
        courseRows: [{ lesson_id: "mod4-l2" }],
      }) as never,
      "user-1"
    );

    expect(context.completedModuleLessonCounts.get("body-position")).toBe(1);
  });
});
