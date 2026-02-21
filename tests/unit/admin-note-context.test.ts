import { describe, expect, it } from "vitest";
import {
  formatAdminNoteContextLabel,
  isAdminNoteContextType,
  parseAdminNoteContextInput,
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
