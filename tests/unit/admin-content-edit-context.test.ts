import { describe, expect, it } from "vitest";
import type { AdminContentItemRow } from "@/lib/admin/content";
import {
  pageRoutePathForAdminContentItem,
  resolveAdminContentEditNotesContext,
  resolveAdminContentEditQrContext,
} from "@/lib/admin/content-edit-context";

function buildItem(overrides: Partial<AdminContentItemRow>): AdminContentItemRow {
  return {
    id: "123e4567-e89b-42d3-a456-426614174000",
    content_type: "course_lesson",
    parent_id: null,
    slug: "first-breaths",
    title: "First breaths",
    summary: "Summary",
    category: "General",
    body: {},
    sort_order: 0,
    status: "draft",
    published_at: null,
    created_by: null,
    updated_by: null,
    created_at: "2026-03-17T10:00:00.000Z",
    updated_at: "2026-03-17T10:00:00.000Z",
    ...overrides,
  };
}

describe("admin content edit context", () => {
  it("maps course lesson edit context to canonical notes and qr defaults", () => {
    const item = buildItem({
      content_type: "course_lesson",
      slug: "first-breaths",
      body: {
        moduleId: "breathing-and-floating",
        lessonId: "breathing-and-floating--first-breaths",
      },
    });

    expect(resolveAdminContentEditNotesContext(item)).toEqual({
      contextType: "course_lesson",
      contextRef: "breathing-and-floating--first-breaths",
      contextLabel: "Lesson: First breaths (breathing-and-floating--first-breaths)",
      includeModuleContextForCourseLesson: true,
    });
    expect(resolveAdminContentEditQrContext(item)).toEqual({
      contentItemId: item.id,
      contentLabel: "First breaths",
      slugHint: "breathing-and-floating--first-breaths",
      destinationPath: "/course?lesson=breathing-and-floating--first-breaths",
      placementKey: "course.lesson.share",
    });
  });

  it("maps page edit context to normalized page route and qr share defaults", () => {
    const item = buildItem({
      content_type: "page",
      slug: "Plans",
      title: "Plans page",
    });

    expect(pageRoutePathForAdminContentItem(item)).toBe("/plans");
    expect(resolveAdminContentEditNotesContext(item)).toEqual({
      contextType: "page",
      contextRef: "/plans",
      contextLabel: "Plans page",
    });
    expect(resolveAdminContentEditQrContext(item)).toEqual({
      contentItemId: item.id,
      contentLabel: "Plans page",
      slugHint: "Plans",
      destinationPath: "/plans",
      placementKey: "page.share",
    });
  });

  it("maps product edit context to product notes and guarded qr guidance", () => {
    const item = buildItem({
      content_type: "product",
      slug: "guide-0-1000m",
      title: "0-1000m guide",
    });

    expect(resolveAdminContentEditNotesContext(item)).toEqual({
      contextType: "product",
      contextRef: "guide-0-1000m",
      contextLabel: "Product: 0-1000m guide (guide-0-1000m)",
    });
    expect(resolveAdminContentEditQrContext(item)).toEqual({
      contentItemId: item.id,
      contentLabel: "0-1000m guide",
      slugHint: "guide-0-1000m",
      placementKey: "product.share",
      destinationHelpText:
        "Set the intended landing page for this product QR before creating it. Use a stable Freeswimming page or another allowlisted HTTPS destination.",
    });
  });
});
