import { describe, expect, it } from "vitest";

import type { CourseLesson } from "@/app/course/courseData";
import {
  buildCourseLessonExperienceViewModel,
  normalizeCourseLessonExperienceInput,
} from "@/lib/course/lesson-experience";

function makeLesson(overrides: Partial<CourseLesson> = {}): CourseLesson {
  return {
    id: "lesson-1",
    title: "Lesson",
    youtubeId: "abc123",
    lessonType: "drill",
    goal: "Hold a calm body line.",
    cues: ["Head quiet", "Easy bubbles"],
    commonMistakes: ["Looking forward", "Holding breath"],
    drill: {
      title: "Front glide",
      steps: ["Push off gently", "Exhale bubbles"],
    },
    nextStep: "Move to side balance.",
    ...overrides,
  };
}

describe("course lesson experience view model", () => {
  it("uses rich V1 lessonExperience fields when present", () => {
    const viewModel = buildCourseLessonExperienceViewModel(
      makeLesson({
        lessonExperience: {
          goal: "Feel a longer line.",
          quickExplanation: "Keep the head quiet before adding distance.",
          whyThisMatters: "A quiet head helps the body float longer before breathing gets harder.",
          landPractice: {
            title: "Wall line",
            steps: ["Stand tall", "Breathe calmly"],
            image: {
              src: "/course/lesson-media/wall-line.webp",
              alt: "Swimmer rehearsing a straight body line against a wall.",
              caption: "Use the wall to feel the line before water.",
            },
          },
          waterPractice: {
            title: "6 short glides",
            steps: ["Push off", "Stop before tension"],
            safetyNote: "Use shallow water.",
          },
          commonMistakes: [{ mistake: "Lifting head", fix: "Look down." }],
          feelCues: ["Long neck", "Quiet head"],
          nextStep: "Try side balance.",
          support: {
            body: "Free lesson first, support after.",
          },
        },
      })
    );

    expect(viewModel).toMatchObject({
      goal: "Feel a longer line.",
      primaryCue: "Head quiet",
      quickExplanation: "Keep the head quiet before adding distance.",
      whyThisMatters: "A quiet head helps the body float longer before breathing gets harder.",
      landPractice: {
        title: "Wall line",
        steps: ["Stand tall", "Breathe calmly"],
        image: {
          src: "/course/lesson-media/wall-line.webp",
          alt: "Swimmer rehearsing a straight body line against a wall.",
          caption: "Use the wall to feel the line before water.",
        },
      },
      waterPractice: {
        title: "6 short glides",
        steps: ["Push off", "Stop before tension"],
        safetyNote: "Use shallow water.",
      },
      commonMistakes: [{ mistake: "Lifting head", fix: "Look down." }],
      feelCues: ["Long neck", "Quiet head"],
      nextStep: "Try side balance.",
      support: {
        title: "Need extra help?",
        body: "Free lesson first, support after.",
      },
    });
  });

  it("maps current course fields into a complete fallback skeleton", () => {
    const viewModel = buildCourseLessonExperienceViewModel(makeLesson());

    expect(viewModel.goal).toBe("Hold a calm body line.");
    expect(viewModel.primaryCue).toBe("Head quiet");
    expect(viewModel.quickExplanation).toContain("Hold a calm body line.");
    expect(viewModel.whyThisMatters).toBeUndefined();
    expect(viewModel.landPractice.title).toBe("Dryland cue rehearsal");
    expect(viewModel.landPractice.steps[0]).toContain("Head quiet");
    expect(viewModel.landPractice.image).toBeUndefined();
    expect(viewModel.waterPractice).toMatchObject({
      title: "Front glide",
      steps: ["Push off gently", "Exhale bubbles"],
    });
    expect(viewModel.commonMistakes).toEqual([
      { mistake: "Looking forward" },
      { mistake: "Holding breath" },
    ]);
    expect(viewModel.feelCues).toEqual(["Head quiet", "Easy bubbles"]);
    expect(viewModel.nextStep).toBe("Move to side balance.");
  });

  it("does not special-case today's representative lesson id", () => {
    const viewModel = buildCourseLessonExperienceViewModel(
      makeLesson({
        id: "future-module--future-lesson",
        goal: "Future lessons still render.",
        cues: ["Future cue"],
        commonMistakes: [],
        drill: {
          title: "Future water practice",
          steps: ["Try the future cue"],
        },
      })
    );

    expect(viewModel.primaryCue).toBe("Future cue");
    expect(viewModel.waterPractice.title).toBe("Future water practice");
    expect(viewModel.nextStep).toBe("Move to side balance.");
  });

  it("drops malformed optional fields instead of rendering empty sections", () => {
    expect(
      normalizeCourseLessonExperienceInput({
        quickExplanation: "  ",
        whyThisMatters: " ",
        landPractice: { steps: ["  "], image: { src: "https://example.com/unsafe.jpg" } },
        waterPractice: null,
        commonMistakes: [{ wrong: "shape" }],
        feelCues: [""],
        support: { title: "" },
      })
    ).toBeUndefined();
  });

  it("keeps practice image metadata optional and local-path only", () => {
    const normalized = normalizeCourseLessonExperienceInput({
      landPractice: {
        title: "Wall line",
        image: {
          src: "/course/lesson-media/wall-line.webp",
          alt: "Wall-line rehearsal",
        },
      },
      waterPractice: {
        title: "Front glide",
        image: {
          src: "https://example.com/front-glide.jpg",
          alt: "External image is not trusted in V1",
        },
      },
    });

    expect(normalized?.landPractice?.image).toEqual({
      src: "/course/lesson-media/wall-line.webp",
      alt: "Wall-line rehearsal",
    });
    expect(normalized?.waterPractice?.image).toEqual({
      alt: "External image is not trusted in V1",
    });
  });
});
