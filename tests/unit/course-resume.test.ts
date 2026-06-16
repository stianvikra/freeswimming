import { describe, expect, it } from "vitest";
import { buildCourseContinueHref } from "@/lib/course/resume";

describe("buildCourseContinueHref", () => {
  it("falls back to the canonical course overview when no last lesson exists", () => {
    expect(buildCourseContinueHref(null)).toBe("/en/course");
    expect(buildCourseContinueHref(undefined)).toBe("/en/course");
    expect(buildCourseContinueHref("")).toBe("/en/course");
    expect(buildCourseContinueHref("   ")).toBe("/en/course");
  });

  it("builds a canonical lesson path when progress points at a known lesson", () => {
    expect(buildCourseContinueHref("mod3-l1")).toBe(
      "/en/course/course-module-kick-drills/course-lesson-kick-drills-kick-basics-support-not-speed"
    );
  });

  it("keeps a safe legacy query fallback for unknown lesson values", () => {
    expect(buildCourseContinueHref(" mod 3 / l1 ")).toBe("/course?lesson=mod%203%20%2F%20l1");
  });
});
