import { describe, expect, it } from "vitest";
import { COURSE_MODULES } from "@/app/course/courseData";
import { toPublishedCourseModules } from "@/lib/admin/content-course";
import { buildCourseLessonExperienceViewModel } from "@/lib/course/lesson-experience";

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
            drillLabel: "Checkpoint",
            supportStartAtLessonInModule: "2",
            supportCard: {
              actions: {
                videoAnalysis: true,
                poolsideGuide: false,
                guide0To1000: true,
                contact: false,
              },
              primaryAction: "guide0To1000",
            },
            passCriteria: ["Keep body line long"],
            goal: "Practice drill timing",
            cues: ["Cue A"],
            commonMistakes: ["Mistake A"],
            drill: {
              title: "Drill block",
              steps: ["Step 1"],
            },
            display: {
              goal: true,
              cues: false,
              commonMistakes: true,
              drill: true,
              checkpoint: true,
              nextStep: false,
              support: false,
            },
            lessonExperience: {
              quickExplanation: "DB quick explanation",
              whyThisMatters: "DB why this matters",
              landPractice: {
                title: "DB land practice",
                steps: ["Land step"],
                image: {
                  src: "/course/lesson-media/db-land.webp",
                  alt: "DB land practice visual",
                },
              },
              waterPractice: {
                title: "DB water practice",
                steps: ["Water step"],
                safetyNote: "DB safety note",
                image: {
                  src: "https://example.com/not-allowed.jpg",
                  alt: "DB water practice visual",
                },
              },
              commonMistakes: [{ mistake: "DB mistake", fix: "DB fix" }],
              feelCues: ["DB feel cue"],
              nextStep: "DB experience next step",
              support: {
                body: "DB support body",
              },
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
      drillLabel: "Checkpoint",
      supportStartAtLessonInModule: 2,
      supportCard: {
        actions: {
          videoAnalysis: true,
          poolsideGuide: false,
          guide0To1000: true,
          contact: false,
        },
        primaryAction: "guide0To1000",
      },
      goal: "Practice drill timing",
      cues: ["Cue A"],
      display: {
        goal: true,
        cues: false,
        commonMistakes: true,
        drill: true,
        checkpoint: true,
        nextStep: false,
        support: false,
      },
      lessonExperience: {
        quickExplanation: "DB quick explanation",
        whyThisMatters: "DB why this matters",
        landPractice: {
          title: "DB land practice",
          steps: ["Land step"],
          image: {
            src: "/course/lesson-media/db-land.webp",
            alt: "DB land practice visual",
          },
        },
        waterPractice: {
          title: "DB water practice",
          steps: ["Water step"],
          safetyNote: "DB safety note",
          image: {
            alt: "DB water practice visual",
          },
        },
        commonMistakes: [{ mistake: "DB mistake", fix: "DB fix" }],
        feelCues: ["DB feel cue"],
        nextStep: "DB experience next step",
        support: {
          body: "DB support body",
        },
      },
      nextStep: "Move to next lesson",
      tags: ["timing"],
    });
  });

  it("infers module id from lesson id when parent relation is missing", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-4",
          slug: "course-module-mod4",
          title: "DB Module 4",
          summary: "Module summary",
          sort_order: 0,
          body: {
            moduleId: "mod4",
          },
        },
      ],
      [
        {
          id: "lesson-row-4",
          parent_id: null,
          slug: "course-lesson-mod4-l1",
          title: "DB Lesson 4-1",
          summary: "Lesson summary",
          sort_order: 0,
          body: {
            lessonId: "mod4-l1",
            goal: "Keep rhythm",
          },
        },
      ]
    );

    expect(modules).toHaveLength(1);
    expect(modules[0]?.id).toBe("body-position");
    expect(modules[0]?.lessons).toHaveLength(1);
    expect(modules[0]?.lessons[0]?.id).toBe("body-position--body-position-skill");
  });

  it("supports semantic runtime ids when lesson linkage comes from explicit body data", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-semantic",
          slug: "course-module-introduction-to-the-course",
          title: "Introduction to the Course",
          summary: "Module summary",
          sort_order: 0,
          body: {
            moduleId: "intro-course",
            legacyModuleIds: ["mod1"],
            subtitle: "Start here",
          },
        },
      ],
      [
        {
          id: "lesson-row-semantic",
          parent_id: null,
          slug: "course-lesson-welcome-course-structure",
          title: "Welcome & Course Structure",
          summary: "Welcome summary",
          sort_order: 0,
          body: {
            moduleId: "intro-course",
            lessonId: "intro-course--welcome-course-structure",
            legacyLessonIds: ["mod1-l1"],
            goal: "Understand the flow",
          },
        },
      ]
    );

    expect(modules).toHaveLength(1);
    expect(modules[0]?.id).toBe("intro-course");
    expect(modules[0]?.legacyIds).toEqual(["mod1"]);
    expect(modules[0]?.lessons).toHaveLength(1);
    expect(modules[0]?.lessons[0]?.id).toBe("intro-course--welcome-course-structure");
    expect(modules[0]?.lessons[0]?.legacyIds).toEqual(["mod1-l1"]);
  });

  it("uses deterministic defaults when published body omits fields", () => {
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

    const mappedLesson = modules[0]?.lessons[0];
    const fallbackLesson = COURSE_MODULES.flatMap((module) => module.lessons).find(
      (lesson) => lesson.id === "kick-drills--kick-basics-support-not-speed"
    );
    expect(mappedLesson?.id).toBe("kick-drills--kick-basics-support-not-speed");
    expect(mappedLesson?.title).toBe("Kick Basics mapped");
    expect(mappedLesson?.youtubeId).toBe("Xh6OblO06LY");
    expect(mappedLesson?.cues).toEqual(["Swim relaxed and controlled."]);
    expect(mappedLesson?.commonMistakes).toEqual(fallbackLesson?.commonMistakes);
    expect(mappedLesson?.drill).toEqual({
      title: "Technique drill",
      steps: ["Mapped summary fallback"],
    });
    expect(mappedLesson?.supportStartAtLessonInModule).toBeUndefined();
    expect(mappedLesson?.nextStep).toBe("Continue to the next lesson.");
  });

  it("normalizes legacy lesson body fields into lessonExperience without a database rewrite", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-legacy",
          slug: "course-module-legacy",
          title: "Legacy Module",
          summary: "Legacy module summary",
          sort_order: 0,
          body: {
            moduleId: "legacy-module",
          },
        },
      ],
      [
        {
          id: "lesson-row-legacy",
          parent_id: "module-row-legacy",
          slug: "course-lesson-legacy",
          title: "Legacy Lesson",
          summary: "Legacy summary",
          sort_order: 0,
          body: {
            moduleId: "legacy-module",
            lessonId: "legacy-module--legacy-lesson",
            goal: "Keep the line calm.",
            cues: ["Quiet head", "Easy bubbles"],
            commonMistakes: ["Looking forward"],
            drill: {
              title: "Legacy front glide",
              steps: ["Push off gently", "Stop before tension"],
            },
            display: {
              cues: false,
              commonMistakes: true,
              drill: false,
              nextStep: true,
              support: false,
            },
            nextStep: "Move to the next calm repeat.",
          },
        },
      ],
      []
    );

    const lesson = modules[0]?.lessons[0];

    expect(lesson?.lessonExperience).toMatchObject({
      display: {
        feelCues: false,
        commonMistakes: true,
        landPractice: false,
        waterPractice: false,
        nextStep: true,
        support: false,
      },
      goal: "Keep the line calm.",
      feelCues: ["Quiet head", "Easy bubbles"],
      commonMistakes: ["Looking forward"],
      waterPractice: {
        title: "Legacy front glide",
        steps: ["Push off gently", "Stop before tension"],
      },
      nextStep: "Move to the next calm repeat.",
    });
    expect(lesson?.display).toMatchObject({
      cues: false,
      commonMistakes: true,
      drill: false,
      nextStep: true,
      support: false,
    });
  });

  it("keeps structured lessonExperience authoritative while carrying legacy fallback branches", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-mixed",
          slug: "course-module-mixed",
          title: "Mixed Module",
          summary: "Mixed module summary",
          sort_order: 0,
          body: {
            moduleId: "mixed-module",
          },
        },
      ],
      [
        {
          id: "lesson-row-mixed",
          parent_id: "module-row-mixed",
          slug: "course-lesson-mixed",
          title: "Mixed Lesson",
          summary: "Mixed summary",
          sort_order: 0,
          body: {
            moduleId: "mixed-module",
            lessonId: "mixed-module--mixed-lesson",
            goal: "Hold rhythm.",
            cues: ["Soft kick"],
            commonMistakes: ["Kicking too hard"],
            drill: {
              title: "Legacy kick repeat",
              steps: ["Kick easy", "Reset early"],
            },
            lessonExperience: {
              quickExplanation: "Authored explanation wins.",
              waterPractice: {
                title: "Authored pool title",
              },
              commonMistakes: [{ mistake: "Authored miss", fix: "Use the authored fix." }],
            },
            nextStep: "Legacy next step.",
          },
        },
      ],
      []
    );

    const lesson = modules[0]?.lessons[0];
    const viewModel = lesson ? buildCourseLessonExperienceViewModel(lesson) : null;

    expect(lesson?.lessonExperience).toMatchObject({
      goal: "Hold rhythm.",
      quickExplanation: "Authored explanation wins.",
      feelCues: ["Soft kick"],
      waterPractice: {
        title: "Authored pool title",
        steps: ["Kick easy", "Reset early"],
      },
      commonMistakes: [{ mistake: "Authored miss", fix: "Use the authored fix." }],
      nextStep: "Legacy next step.",
    });
    expect(viewModel?.quickExplanation).toBe("Authored explanation wins.");
    expect(viewModel?.waterPractice).toMatchObject({
      title: "Authored pool title",
      steps: ["Kick easy", "Reset early"],
    });
    expect(viewModel?.commonMistakes).toEqual([
      { mistake: "Authored miss", fix: "Use the authored fix." },
    ]);
  });

  it("keeps static lesson experience fallback for the representative V1 lesson", () => {
    const modules = toPublishedCourseModules(
      [
        {
          id: "module-row-4",
          slug: "course-module-mod4",
          title: "Body Position",
          summary: "Hold the line",
          sort_order: 0,
          body: {
            moduleId: "mod4",
          },
        },
      ],
      [
        {
          id: "lesson-row-4",
          parent_id: "module-row-4",
          slug: "course-lesson-mod4-l3",
          title: "Body Position on the Front mapped",
          summary: "Mapped summary fallback",
          sort_order: 0,
          body: {
            lessonId: "mod4-l3",
          },
        },
      ]
    );

    const mappedLesson = modules[0]?.lessons[0];

    expect(mappedLesson?.id).toBe("body-position--body-position-front");
    expect(mappedLesson?.lessonExperience?.quickExplanation).toContain("Front body position");
    expect(mappedLesson?.lessonExperience?.whyThisMatters).toContain("A quiet head");
    expect(mappedLesson?.lessonExperience?.waterPractice?.title).toBe(
      "Front glide + exhale: 6 x 6-10s"
    );
    expect(mappedLesson?.lessonExperience?.landPractice?.image?.src).toBe(
      "/course/lesson-media/body-position-front-wall-line.jpg"
    );
    expect(mappedLesson?.lessonExperience?.waterPractice?.image?.src).toBe(
      "/course/lesson-media/body-position-front-glide.jpg"
    );
  });
});
