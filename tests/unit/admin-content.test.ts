import { describe, expect, it } from "vitest";
import { parseCreateAdminContentPayload } from "@/lib/admin/content";

describe("parseCreateAdminContentPayload", () => {
  it("normalizes slug from title when slug not provided", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "course_module",
      title: " Module 1 Foundations ",
      status: "draft",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.slug).toBe("module-1-foundations");
    expect(parsed.value.status).toBe("draft");
  });

  it("accepts valid payload with explicit slug and body object", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "guide_session",
      title: "Session 2",
      slug: "session-2",
      summary: "A short summary",
      sortOrder: 4,
      status: "published",
      body: { markdown: "## Hello" },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.contentType).toBe("guide_session");
    expect(parsed.value.status).toBe("published");
    expect(parsed.value.sortOrder).toBe(4);
  });

  it("rejects invalid content type", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "unknown",
      title: "Any title",
    });

    expect(parsed.ok).toBe(false);
  });

  it("rejects non-object body", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "course_lesson",
      title: "Lesson",
      body: ["invalid"],
    });

    expect(parsed.ok).toBe(false);
  });

  it("rejects invalid parent uuid", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "guide_drill",
      title: "Drill",
      parentId: "not-a-uuid",
    });

    expect(parsed.ok).toBe(false);
  });
});
