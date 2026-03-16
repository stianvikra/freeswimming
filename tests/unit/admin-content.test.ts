import { describe, expect, it } from "vitest";
import {
  parseCreateAdminContentPayload,
  parseUpdateAdminContentPayload,
  preserveImmutableContentRuntimeIds,
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

  it("accepts page and product content types", () => {
    const pageParsed = parseCreateAdminContentPayload({
      contentType: "page",
      title: "Our Method page",
      slug: "our-method",
    });
    const productParsed = parseCreateAdminContentPayload({
      contentType: "product",
      title: "0-1000m product copy",
      slug: "guide-0-1000m-copy",
    });

    expect(pageParsed.ok).toBe(true);
    if (pageParsed.ok) {
      expect(pageParsed.value.contentType).toBe("page");
    }

    expect(productParsed.ok).toBe(true);
    if (productParsed.ok) {
      expect(productParsed.value.contentType).toBe("product");
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

describe("preserveImmutableContentRuntimeIds", () => {
  it("preserves existing lesson runtime ids when body patches omit them", () => {
    const result = preserveImmutableContentRuntimeIds({
      contentType: "course_lesson",
      existingBody: {
        moduleId: "intro-course",
        lessonId: "intro-course--welcome-course-structure",
        goal: "Old goal",
      },
      nextBody: {
        goal: "New goal",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.body).toMatchObject({
      moduleId: "intro-course",
      lessonId: "intro-course--welcome-course-structure",
      goal: "New goal",
    });
  });

  it("rejects lesson runtime id rewrites in normal content editing", () => {
    const result = preserveImmutableContentRuntimeIds({
      contentType: "course_lesson",
      existingBody: {
        moduleId: "intro-course",
        lessonId: "intro-course--welcome-course-structure",
      },
      nextBody: {
        moduleId: "intro-course",
        lessonId: "renamed-lesson-id",
      },
    });

    expect(result.ok).toBe(false);
  });

  it("rejects module runtime id rewrites in normal content editing", () => {
    const result = preserveImmutableContentRuntimeIds({
      contentType: "course_module",
      existingBody: {
        moduleId: "intro-course",
      },
      nextBody: {
        moduleId: "start-here",
      },
    });

    expect(result.ok).toBe(false);
  });

  it("preserves existing guide session runtime ids when body patches omit them", () => {
    const result = preserveImmutableContentRuntimeIds({
      contentType: "guide_session",
      existingBody: {
        guideSlug: "0-1000m",
        sessionId: "S07",
      },
      nextBody: {
        focus: "Steady aerobic work",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.body).toMatchObject({
      guideSlug: "0-1000m",
      sessionId: "S07",
      focus: "Steady aerobic work",
    });
  });

  it("rejects guide drill runtime id rewrites in normal content editing", () => {
    const result = preserveImmutableContentRuntimeIds({
      contentType: "guide_drill",
      existingBody: {
        guideSlug: "poolside",
        drillId: "D04",
      },
      nextBody: {
        drillId: "D09",
      },
    });

    expect(result.ok).toBe(false);
  });
});
