import { describe, expect, it } from "vitest";
import type { AdminContentItemRow } from "@/lib/admin/content";
import {
  buildAdminNoteContextCatalog,
  resolveAdminNoteContextLabel,
} from "@/lib/admin/note-context-catalog";

function row(overrides: Partial<AdminContentItemRow>): AdminContentItemRow {
  return {
    id: "row-id",
    content_type: "course_module",
    parent_id: null,
    slug: "row-slug",
    title: "Row title",
    summary: "",
    category: "General",
    body: {},
    sort_order: 0,
    status: "published",
    published_at: null,
    created_by: null,
    updated_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildAdminNoteContextCatalog", () => {
  it("builds module and lesson picker options with module->lesson mapping", () => {
    const moduleRow = row({
      id: "module-row",
      content_type: "course_module",
      slug: "course-module-mod3",
      title: "Module 3",
      body: { moduleId: "mod3" },
      sort_order: 2,
    });
    const lessonRow = row({
      id: "lesson-row",
      content_type: "course_lesson",
      parent_id: "module-row",
      slug: "course-lesson-mod3-l1",
      title: "Lesson 1",
      body: { lessonId: "mod3-l1" },
    });
    const sessionRow = row({
      content_type: "guide_session",
      slug: "guide-0-1000m-session-s03",
      title: "Session 3",
      body: {},
      sort_order: 2,
    });
    const drillRow = row({
      content_type: "guide_drill",
      slug: "guide-poolside-drill-d02",
      title: "Drill 2",
      body: {},
      sort_order: 1,
    });

    const catalog = buildAdminNoteContextCatalog({
      contentItems: [moduleRow, lessonRow, sessionRow, drillRow],
      products: [
        { slug: "analysis-video", title: "Video analysis", active: true },
        { slug: "legacy-plan", title: "Legacy plan", active: false },
      ],
    });

    expect(catalog.modules).toEqual([{ ref: "mod3", label: "M3 · Module 3" }]);
    expect(catalog.lessons).toEqual([
      { ref: "mod3-l1", label: "M3 · L1 · Lesson 1", moduleRef: "mod3" },
    ]);
    expect(catalog.lessonModuleByRef["mod3-l1"]).toBe("mod3");
    expect(catalog.sessions).toEqual([{ ref: "s03", label: "S3 · Session 3" }]);
    expect(catalog.drills).toEqual([{ ref: "d02", label: "D2 · Drill 2" }]);
    expect(catalog.products).toEqual([
      { ref: "legacy-plan", label: "Legacy plan (inactive)" },
      { ref: "analysis-video", label: "Video analysis" },
    ]);
  });

  it("resolves friendly labels and falls back for unknown refs", () => {
    const catalog = buildAdminNoteContextCatalog({
      contentItems: [
        row({
          content_type: "course_module",
          slug: "course-module-mod1",
          title: "Module 1 Foundations",
          body: { moduleId: "mod1" },
        }),
      ],
      products: [],
    });

    expect(
      resolveAdminNoteContextLabel({
        catalog,
        contextType: "course_module",
        contextRef: "mod1",
      })
    ).toBe("Course Module: M1 · Module 1 Foundations");

    expect(
      resolveAdminNoteContextLabel({
        catalog,
        contextType: "course_lesson",
        contextRef: "mod9-l9",
      })
    ).toBe("Course Lesson: mod9-l9");
  });
});
