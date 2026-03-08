import { describe, expect, it } from "vitest";
import {
  parseStoredAllContentScope,
  parseStoredContentPrimaryView,
} from "@/lib/admin/content-view-preferences";

describe("parseStoredAllContentScope", () => {
  it("accepts known scope values", () => {
    expect(parseStoredAllContentScope("all")).toBe("all");
    expect(parseStoredAllContentScope("course_module")).toBe("course_module");
    expect(parseStoredAllContentScope("course_lesson")).toBe("course_lesson");
    expect(parseStoredAllContentScope("guide_session")).toBe("guide_session");
    expect(parseStoredAllContentScope("guide_drill")).toBe("guide_drill");
    expect(parseStoredAllContentScope("page")).toBe("page");
    expect(parseStoredAllContentScope("product")).toBe("product");
  });

  it("rejects unknown values", () => {
    expect(parseStoredAllContentScope("invalid")).toBeNull();
    expect(parseStoredAllContentScope("")).toBeNull();
    expect(parseStoredAllContentScope(null)).toBeNull();
  });
});

describe("parseStoredContentPrimaryView", () => {
  it("accepts known primary view values", () => {
    expect(parseStoredContentPrimaryView("course_workspace")).toBe("course_workspace");
    expect(parseStoredContentPrimaryView("all_content")).toBe("all_content");
  });

  it("rejects unknown values", () => {
    expect(parseStoredContentPrimaryView("workspace")).toBeNull();
    expect(parseStoredContentPrimaryView("")).toBeNull();
    expect(parseStoredContentPrimaryView(null)).toBeNull();
  });
});
