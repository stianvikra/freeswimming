import { describe, expect, it } from "vitest";
import {
  buildCourseWorkspaceLessonPreview,
  buildCourseWorkspaceLessonsByModuleId,
} from "@/lib/admin/course-workspace";

describe("course workspace hierarchy helpers", () => {
  it("groups linked lessons under known modules and keeps empty modules explicit", () => {
    const grouped = buildCourseWorkspaceLessonsByModuleId(
      [{ id: "module-a" }, { id: "module-b" }],
      [
        { parentId: "module-a", sortOrder: 1, title: "Second" },
        { parentId: "missing-module", sortOrder: 0, title: "Ignore me" },
        { parentId: null, sortOrder: 0, title: "Unlinked" },
      ]
    );

    expect(grouped.get("module-a")?.map((lesson) => lesson.title)).toEqual(["Second"]);
    expect(grouped.get("module-b")).toEqual([]);
  });

  it("sorts grouped lessons by canonical order before rendering", () => {
    const grouped = buildCourseWorkspaceLessonsByModuleId(
      [{ id: "module-a" }],
      [
        { parentId: "module-a", sortOrder: 2, title: "Later" },
        { parentId: "module-a", sortOrder: 0, title: "First" },
        { parentId: "module-a", sortOrder: 1, title: "Alpha" },
        { parentId: "module-a", sortOrder: 1, title: "Beta" },
      ]
    );

    expect(grouped.get("module-a")?.map((lesson) => lesson.title)).toEqual([
      "First",
      "Alpha",
      "Beta",
      "Later",
    ]);
  });

  it("builds a capped lesson preview without losing hidden-count information", () => {
    const preview = buildCourseWorkspaceLessonPreview(
      [{ title: "Lesson 1" }, { title: "Lesson 2" }, { title: "Lesson 3" }, { title: "Lesson 4" }],
      3
    );

    expect(preview.visibleLessons.map((lesson) => lesson.title)).toEqual([
      "Lesson 1",
      "Lesson 2",
      "Lesson 3",
    ]);
    expect(preview.hiddenCount).toBe(1);
  });

  it("allows focus mode to hide preview rows while keeping hidden-count information", () => {
    const preview = buildCourseWorkspaceLessonPreview(
      [{ title: "Lesson 1" }, { title: "Lesson 2" }],
      0
    );

    expect(preview.visibleLessons).toEqual([]);
    expect(preview.hiddenCount).toBe(2);
  });
});
