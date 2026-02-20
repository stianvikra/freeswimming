import { describe, expect, it } from "vitest";
import {
  parseCreateAdminContentPayload,
  parseUpdateAdminContentPayload,
} from "@/lib/admin/content";

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
      category: "Technique",
      sortOrder: 4,
      status: "published",
      body: { markdown: "## Hello" },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.contentType).toBe("guide_session");
    expect(parsed.value.category).toBe("Technique");
    expect(parsed.value.status).toBe("published");
    expect(parsed.value.sortOrder).toBe(4);
  });

  it("accepts review and archived as valid lifecycle statuses", () => {
    const reviewParsed = parseCreateAdminContentPayload({
      contentType: "course_module",
      title: "Lifecycle item",
      status: "review",
    });
    const archivedParsed = parseCreateAdminContentPayload({
      contentType: "course_module",
      title: "Lifecycle item",
      status: "archived",
    });

    expect(reviewParsed.ok).toBe(true);
    if (reviewParsed.ok) {
      expect(reviewParsed.value.status).toBe("review");
    }

    expect(archivedParsed.ok).toBe(true);
    if (archivedParsed.ok) {
      expect(archivedParsed.value.status).toBe("archived");
    }
  });

  it("collapses invalid slug separators and trims slug edges", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "guide_session",
      title: "Session 2",
      slug: "___Session---2+++",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.slug).toBe("session-2");
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

  it("rejects category values above max length", () => {
    const parsed = parseCreateAdminContentPayload({
      contentType: "course_lesson",
      title: "Lesson",
      category: "x".repeat(81),
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

describe("parseUpdateAdminContentPayload", () => {
  it("accepts status and slug updates", () => {
    const parsed = parseUpdateAdminContentPayload({
      status: "published",
      slug: "  Session___2  ",
      category: " Endurance ",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.status).toBe("published");
    expect(parsed.value.hasStatus).toBe(true);
    expect(parsed.value.slug).toBe("session-2");
    expect(parsed.value.category).toBe("Endurance");
  });

  it("accepts archived status update", () => {
    const parsed = parseUpdateAdminContentPayload({
      status: "archived",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.status).toBe("archived");
    expect(parsed.value.hasStatus).toBe(true);
  });

  it("rejects update payload with no known fields", () => {
    const parsed = parseUpdateAdminContentPayload({});
    expect(parsed.ok).toBe(false);
  });

  it("rejects same parent id as content item id", () => {
    const itemId = "0f50f0ea-8c32-4d6a-83a0-7e5eb4ecf26d";
    const parsed = parseUpdateAdminContentPayload(
      {
        parentId: itemId,
      },
      {
        itemId,
      }
    );

    expect(parsed.ok).toBe(false);
  });
});
