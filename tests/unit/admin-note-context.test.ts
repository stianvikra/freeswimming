import { describe, expect, it } from "vitest";
import {
  canonicalizeAdminNoteContext,
  deriveCourseModuleRefFromLessonRef,
  formatAdminNoteContextLabel,
  isAdminNoteContextType,
  parseAdminNoteContextInput,
  resolveAdminNoteContextLookupRefs,
} from "@/lib/admin/note-context";

describe("isAdminNoteContextType", () => {
  it("accepts known values", () => {
    expect(isAdminNoteContextType("course_lesson")).toBe(true);
    expect(isAdminNoteContextType("guide_drill")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isAdminNoteContextType("lesson")).toBe(false);
    expect(isAdminNoteContextType("")).toBe(false);
  });
});

describe("parseAdminNoteContextInput", () => {
  it("parses valid context", () => {
    const parsed = parseAdminNoteContextInput({
      contextType: "course_lesson",
      contextRef: "  mod3-l1 ",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toEqual({
      contextType: "course_lesson",
      contextRef: "mod3-l1",
    });
  });

  it("accepts the home page root path as a valid page context", () => {
    const parsed = parseAdminNoteContextInput({
      contextType: "page",
      contextRef: " / ",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toEqual({
      contextType: "page",
      contextRef: "/",
    });
  });

  it("accepts empty context", () => {
    const parsed = parseAdminNoteContextInput({
      contextType: "",
      contextRef: "",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value).toBeNull();
  });

  it("rejects partial context", () => {
    const parsed = parseAdminNoteContextInput({
      contextType: "product",
    });
    expect(parsed.ok).toBe(false);
  });
});

describe("formatAdminNoteContextLabel", () => {
  it("formats context for display", () => {
    expect(
      formatAdminNoteContextLabel({
        contextType: "course_lesson",
        contextRef: "mod3-l1",
      })
    ).toBe("Course Lesson: mod3-l1");
  });

  it("returns null for missing context", () => {
    expect(
      formatAdminNoteContextLabel({
        contextType: null,
        contextRef: "mod3-l1",
      })
    ).toBeNull();
  });
});

describe("deriveCourseModuleRefFromLessonRef", () => {
  it("extracts module ref from lesson ref", () => {
    expect(deriveCourseModuleRefFromLessonRef("mod3-l1")).toBe("kick-drills");
  });

  it("supports semantic lesson refs", () => {
    expect(deriveCourseModuleRefFromLessonRef("intro-course--welcome-course-structure")).toBe(
      "intro-course"
    );
  });

  it("normalizes whitespace and casing before extracting", () => {
    expect(deriveCourseModuleRefFromLessonRef(" MOD10-L2 ")).toBe("open-water");
  });

  it("returns normalized original when lesson suffix is missing", () => {
    expect(deriveCourseModuleRefFromLessonRef("mod7")).toBe("freestyle-build");
  });
});

describe("canonicalizeAdminNoteContext", () => {
  it("stores course refs under canonical runtime ids", () => {
    expect(
      canonicalizeAdminNoteContext({
        contextType: "course_lesson",
        contextRef: "mod3-l1",
      })
    ).toEqual({
      contextType: "course_lesson",
      contextRef: "kick-drills--kick-basics-support-not-speed",
    });
  });

  it("stores guide refs under canonical runtime ids", () => {
    expect(
      canonicalizeAdminNoteContext({
        contextType: "guide_session",
        contextRef: "guide-0-1000m-session-s03",
      })
    ).toEqual({
      contextType: "guide_session",
      contextRef: "s03",
    });
  });
});

describe("resolveAdminNoteContextLookupRefs", () => {
  it("includes canonical and legacy lesson refs during compatibility window", () => {
    expect(
      resolveAdminNoteContextLookupRefs({
        contextType: "course_lesson",
        contextRef: "kick-drills--kick-basics-support-not-speed",
      })
    ).toEqual(["kick-drills--kick-basics-support-not-speed", "mod3-l1"]);
  });

  it("includes canonical and legacy guide refs during compatibility window", () => {
    expect(
      resolveAdminNoteContextLookupRefs({
        contextType: "guide_drill",
        contextRef: "guide-poolside-drill-d05",
      })
    ).toEqual(["d05", "guide-poolside-drill-d05"]);
  });
});
