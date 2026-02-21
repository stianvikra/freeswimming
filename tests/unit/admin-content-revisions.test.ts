import { describe, expect, it } from "vitest";
import {
  parseAdminContentRevisionSnapshot,
  parseRestoreAdminContentRevisionPayload,
} from "@/lib/admin/content-revisions";

describe("parseRestoreAdminContentRevisionPayload", () => {
  it("accepts valid revision id", () => {
    const parsed = parseRestoreAdminContentRevisionPayload({
      revisionId: "1af02693-2cf3-4af8-a52a-4708996a5bee",
    });
    expect(parsed.ok).toBe(true);
  });

  it("rejects invalid revision id", () => {
    const parsed = parseRestoreAdminContentRevisionPayload({
      revisionId: "bad",
    });
    expect(parsed.ok).toBe(false);
  });
});

describe("parseAdminContentRevisionSnapshot", () => {
  it("parses valid revision snapshot into update payload", () => {
    const parsed = parseAdminContentRevisionSnapshot({
      content_type: "course_lesson",
      parent_id: "13d8549f-f406-4543-baf9-8ecf0df4ff11",
      slug: "lesson-1",
      title: "Lesson 1",
      summary: "Short summary",
      category: "Course lessons",
      body: { markdown: "Hello" },
      sort_order: 2,
      status: "review",
      published_at: null,
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.content_type).toBe("course_lesson");
    expect(parsed.value.status).toBe("review");
    expect(parsed.value.slug).toBe("lesson-1");
  });

  it("rejects invalid status values", () => {
    const parsed = parseAdminContentRevisionSnapshot({
      content_type: "course_lesson",
      slug: "lesson-1",
      title: "Lesson 1",
      status: "invalid-status",
    });
    expect(parsed.ok).toBe(false);
  });

  it("rejects invalid parent ids", () => {
    const parsed = parseAdminContentRevisionSnapshot({
      content_type: "guide_drill",
      parent_id: "bad-parent",
      slug: "drill-1",
      title: "Drill 1",
      status: "draft",
    });
    expect(parsed.ok).toBe(false);
  });
});
