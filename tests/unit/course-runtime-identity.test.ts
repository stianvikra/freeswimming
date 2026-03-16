import { describe, expect, it } from "vitest";
import {
  buildCourseLessonModuleIdMap,
  inferCourseLessonRuntimeIdFromSlug,
  inferCourseModuleRuntimeIdFromLessonRuntimeId,
  inferCourseModuleRuntimeIdFromSlug,
  resolveCourseLessonModuleRuntimeId,
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeId,
} from "@/lib/course/runtime-identity";

describe("course runtime identity helpers", () => {
  it("resolves explicit module and lesson runtime ids before slug fallback", () => {
    expect(
      resolveCourseModuleRuntimeId(
        { moduleId: "intro-course" },
        "course-module-introduction-to-the-course"
      )
    ).toBe("intro-course");
    expect(
      resolveCourseLessonRuntimeId(
        { lessonId: "intro-course--welcome-course-structure" },
        "course-lesson-welcome-course-structure"
      )
    ).toBe("intro-course--welcome-course-structure");
  });

  it("keeps slug fallback working for legacy rows", () => {
    expect(inferCourseModuleRuntimeIdFromSlug("course-module-mod3")).toBe("mod3");
    expect(inferCourseLessonRuntimeIdFromSlug("course-lesson-mod3-l1")).toBe("mod3-l1");
  });

  it("derives module runtime ids from both legacy and semantic lesson ids for compatibility", () => {
    expect(inferCourseModuleRuntimeIdFromLessonRuntimeId("mod3-l1")).toBe("mod3");
    expect(
      inferCourseModuleRuntimeIdFromLessonRuntimeId("intro-course--welcome-course-structure")
    ).toBe("intro-course");
  });

  it("prefers parent relation when resolving lesson->module membership", () => {
    const moduleIdByRowId = new Map([["module-row", "intro-course"]]);

    expect(
      resolveCourseLessonModuleRuntimeId({
        body: { moduleId: "wrong-module" },
        lessonId: "intro-course--welcome-course-structure",
        parentId: "module-row",
        moduleIdByRowId,
      })
    ).toBe("intro-course");
  });

  it("builds deterministic lesson->module maps from published modules", () => {
    const lessonToModuleId = buildCourseLessonModuleIdMap([
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
            drill: {
              title: "Drill",
              steps: ["Step"],
            },
            nextStep: "Next",
          },
        ],
      },
    ]);

    expect(lessonToModuleId.get("intro-course--welcome-course-structure")).toBe("intro-course");
  });
});
