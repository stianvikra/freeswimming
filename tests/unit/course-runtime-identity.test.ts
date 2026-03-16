import { describe, expect, it } from "vitest";
import {
  buildCourseLessonModuleIdMap,
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
  inferCourseLessonRuntimeIdFromSlug,
  inferCourseModuleRuntimeIdFromLessonRuntimeId,
  inferCourseModuleRuntimeIdFromSlug,
  resolveCourseLessonRuntimeAliases,
  resolveCourseLessonModuleRuntimeId,
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeAliases,
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
    expect(inferCourseModuleRuntimeIdFromSlug("course-module-kick-drills")).toBe("kick-drills");
    expect(
      inferCourseLessonRuntimeIdFromSlug("course-lesson-kick-drills-kick-basics-support-not-speed")
    ).toBe("kick-drills--kick-basics-support-not-speed");
  });

  it("reads legacy alias arrays without duplicating canonical runtime ids", () => {
    expect(
      resolveCourseModuleRuntimeAliases(
        {
          moduleId: "intro-course",
          legacyModuleIds: ["mod1", "intro-course", "mod1"],
        },
        "course-module-introduction-to-the-course"
      )
    ).toEqual(["mod1"]);
    expect(
      resolveCourseLessonRuntimeAliases(
        {
          lessonId: "intro-course--welcome-course-structure",
          legacyLessonIds: ["mod1-l1", "intro-course--welcome-course-structure", "mod1-l1"],
        },
        "course-lesson-welcome-course-structure"
      )
    ).toEqual(["mod1-l1"]);
  });

  it("derives module runtime ids from both legacy and semantic lesson ids for compatibility", () => {
    expect(inferCourseModuleRuntimeIdFromLessonRuntimeId("mod3-l1")).toBe("kick-drills");
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
            legacyIds: ["mod1-l1"],
          },
        ],
      },
    ]);

    expect(lessonToModuleId.get("intro-course--welcome-course-structure")).toBe("intro-course");
    expect(lessonToModuleId.get("mod1-l1")).toBe("intro-course");
  });

  it("canonicalizes legacy lesson ids to the published semantic lesson id", () => {
    const canonicalLessonIdByAlias = buildCanonicalCourseLessonIdMap([
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
            legacyIds: ["mod1-l1"],
          },
        ],
      },
    ]);

    expect(canonicalizeCourseLessonRuntimeId("mod1-l1", canonicalLessonIdByAlias)).toBe(
      "intro-course--welcome-course-structure"
    );
    expect(
      canonicalizeCourseLessonRuntimeId(
        "intro-course--welcome-course-structure",
        canonicalLessonIdByAlias
      )
    ).toBe("intro-course--welcome-course-structure");
  });
});
