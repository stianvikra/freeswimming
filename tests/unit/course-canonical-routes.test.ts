import { describe, expect, it } from "vitest";

import { COURSE_MODULES } from "@/app/course/courseData";
import {
  buildCourseLessonHref,
  buildCourseLessonLegacyQueryPath,
  buildCourseLessonPath,
  buildCourseOverviewPath,
  getIndexableCourseLessonRoutes,
  normalizeCourseLocale,
  normalizeIndexableCourseLocale,
  resolveCourseLessonRouteBySlugs,
} from "@/lib/course/canonical-routes";

const WELCOME_PATH =
  "/en/course/course-module-introduction-to-the-course/course-lesson-introduction-to-the-course-welcome-course-structure";
const BODY_POSITION_BACK_PATH =
  "/en/course/course-module-body-position-drills/course-lesson-body-position-drills-body-position-back";

describe("course canonical routes", () => {
  it("builds canonical overview and lesson paths for active English content", () => {
    expect(buildCourseOverviewPath()).toBe("/en/course");
    expect(buildCourseLessonPath(COURSE_MODULES, "mod1-l1")).toBe(WELCOME_PATH);
    expect(buildCourseLessonHref(COURSE_MODULES, "intro-course--welcome-course-structure")).toBe(
      WELCOME_PATH
    );
  });

  it("keeps nb as supported but not indexable until translated content is ready", () => {
    expect(normalizeCourseLocale("nb")).toBe("nb");
    expect(normalizeIndexableCourseLocale("nb")).toBeNull();
    expect(
      getIndexableCourseLessonRoutes(COURSE_MODULES).every((route) => route.locale === "en")
    ).toBe(true);
  });

  it("resolves wrong module slugs for known lesson slugs as redirects", () => {
    const resolution = resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
      locale: "en",
      moduleSlug: "course-module-wrong",
      lessonSlug: "course-lesson-introduction-to-the-course-welcome-course-structure",
    });

    expect(resolution.status).toBe("redirect");
    if (resolution.status === "redirect") {
      expect(resolution.route.path).toBe(WELCOME_PATH);
    }
  });

  it("redirects known deprecated course slugs to the current canonical lesson", () => {
    const resolution = resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
      locale: "en",
      moduleSlug: "course-module-breathing-and-floating",
      lessonSlug: "course-lesson-breathing-and-floating-floating-back",
    });

    expect(resolution.status).toBe("redirect");
    if (resolution.status === "redirect") {
      expect(resolution.route.path).toBe(BODY_POSITION_BACK_PATH);
    }
    expect(buildCourseLessonHref(COURSE_MODULES, "breathing-and-floating--floating-back")).toBe(
      BODY_POSITION_BACK_PATH
    );
  });

  it("fails closed for unknown slugs and keeps legacy query fallback for unknown ids", () => {
    expect(
      resolveCourseLessonRouteBySlugs(COURSE_MODULES, {
        locale: "en",
        moduleSlug: "course-module-missing",
        lessonSlug: "course-lesson-missing",
      })
    ).toEqual({ status: "not-found" });
    expect(buildCourseLessonLegacyQueryPath("missing lesson")).toBe(
      "/course?lesson=missing%20lesson"
    );
    expect(buildCourseLessonHref(COURSE_MODULES, "missing lesson")).toBe(
      "/course?lesson=missing%20lesson"
    );
  });
});
