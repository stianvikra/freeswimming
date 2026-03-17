import { describe, expect, it } from "vitest";
import { buildCourseWorkspaceLessonsByModuleId } from "@/lib/admin/course-workspace";

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
});
