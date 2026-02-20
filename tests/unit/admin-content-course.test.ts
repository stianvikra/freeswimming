import { describe, expect, it } from "vitest";
import { COURSE_MODULES } from "@/app/course/courseData";
import { toPublishedCourseModules } from "@/lib/admin/content-course";

describe("toPublishedCourseModules", () => {
  it("returns fallback modules when published rows are missing", () => {
    expect(toPublishedCourseModules([], [])).toEqual(COURSE_MODULES);
    expect(
      toPublishedCourseModules(
        [
          {
            id: "module-row-1",
            slug: "course-module-mod1",
            title: "Module row",
            summary: "Summary",
            sort_order: 0,
            body: {},
          },
        ],
        []
      )
    ).toEqual(COURSE_MODULES);
  });

  it("maps published modules and lessons by parent relation", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-1",
          slug: "course-module-modA",
          title: "DB Module A",
          summary: "Module summary",
          sort_order: 0,
          body: {
            moduleId: "modA",
            subtitle: "DB subtitle",
          },
        },
      ],
      [
        {
          id: "lesson-row-1",
          parent_id: "module-row-1",
          slug: "course-lesson-moda-l1",
          title: "DB Lesson A1",
          summary: "DB lesson summary",
          sort_order: 0,
          body: {
            lessonId: "modA-l1",
            youtubeId: "abc123",
            estMinutes: 7,
            lessonType: "drill",
            passCriteria: ["Keep body line long"],
            goal: "Practice drill timing",
            cues: ["Cue A"],
            commonMistakes: ["Mistake A"],
            drill: {
              title: "Drill block",
              steps: ["Step 1"],
            },
            nextStep: "Move to next lesson",
            tags: ["timing"],
          },
        },
      ]
    );

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      id: "modA",
      title: "DB Module A",
      subtitle: "DB subtitle",
    });
    expect(modules[0]?.lessons).toHaveLength(1);
    expect(modules[0]?.lessons[0]).toMatchObject({
      id: "modA-l1",
      title: "DB Lesson A1",
      youtubeId: "abc123",
      lessonType: "drill",
      goal: "Practice drill timing",
      cues: ["Cue A"],
      nextStep: "Move to next lesson",
      tags: ["timing"],
    });
  });

  it("falls back to hardcoded lesson details when published body omits fields", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-3",
          slug: "course-module-mod3",
          title: "Kick Drills",
          summary: "Keep kick stable",
          sort_order: 0,
          body: {
            moduleId: "mod3",
          },
        },
      ],
      [
        {
          id: "lesson-row-3",
          parent_id: "module-row-3",
          slug: "course-lesson-mod3-l1",
          title: "Kick Basics mapped",
          summary: "Mapped summary fallback",
          sort_order: 0,
          body: {
            lessonId: "mod3-l1",
          },
        },
      ]
    );

    const fallbackLesson = COURSE_MODULES.flatMap((module) => module.lessons).find(
      (lesson) => lesson.id === "mod3-l1"
    );
    expect(fallbackLesson).toBeTruthy();

    const mappedLesson = modules[0]?.lessons[0];
    expect(mappedLesson?.id).toBe("mod3-l1");
    expect(mappedLesson?.title).toBe("Kick Basics mapped");
    expect(mappedLesson?.youtubeId).toBe(fallbackLesson?.youtubeId);
    expect(mappedLesson?.cues).toEqual(fallbackLesson?.cues);
    expect(mappedLesson?.commonMistakes).toEqual(fallbackLesson?.commonMistakes);
    expect(mappedLesson?.drill).toEqual(fallbackLesson?.drill);
    expect(mappedLesson?.nextStep).toBe(fallbackLesson?.nextStep);
  });
});
