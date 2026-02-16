import { describe, expect, it } from "vitest";
import { buildCourseContinueHref } from "@/lib/course/resume";

describe("buildCourseContinueHref", () => {
  it("falls back to /course when no last lesson exists", () => {
    expect(buildCourseContinueHref(null)).toBe("/course");
    expect(buildCourseContinueHref(undefined)).toBe("/course");
    expect(buildCourseContinueHref("")).toBe("/course");
    expect(buildCourseContinueHref("   ")).toBe("/course");
  });

  it("builds a safe lesson query path when progress exists", () => {
    expect(buildCourseContinueHref("mod3-l1")).toBe("/course?lesson=mod3-l1");
    expect(buildCourseContinueHref(" mod 3 / l1 ")).toBe("/course?lesson=mod%203%20%2F%20l1");
  });
});
