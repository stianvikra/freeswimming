import {
  buildCourseStructureIntegrity,
  computeNormalizedCourseStructureSortOrderUpdates,
  getAdjacentLessonId,
  getAdjacentModuleId,
  type CourseStructureLessonRow,
  type CourseStructureModuleRow,
} from "@/lib/admin/course-structure";
import { describe, expect, it } from "vitest";

const MODULES: CourseStructureModuleRow[] = [
  {
    id: "module-a",
    sortOrder: 0,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    title: "Module A",
  },
  {
    id: "module-b",
    sortOrder: 1,
    createdAt: "2026-03-01T10:05:00.000Z",
    updatedAt: "2026-03-01T10:05:00.000Z",
    title: "Module B",
  },
  {
    id: "module-c",
    sortOrder: 2,
    createdAt: "2026-03-01T10:10:00.000Z",
    updatedAt: "2026-03-01T10:10:00.000Z",
    title: "Module C",
  },
];

const LESSONS: CourseStructureLessonRow[] = [
  {
    id: "lesson-a1",
    parentId: "module-a",
    sortOrder: 0,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    title: "Lesson A1",
  },
  {
    id: "lesson-a2",
    parentId: "module-a",
    sortOrder: 1,
    createdAt: "2026-03-01T10:01:00.000Z",
    updatedAt: "2026-03-01T10:01:00.000Z",
    title: "Lesson A2",
  },
  {
    id: "lesson-b1",
    parentId: "module-b",
    sortOrder: 0,
    createdAt: "2026-03-01T10:02:00.000Z",
    updatedAt: "2026-03-01T10:02:00.000Z",
    title: "Lesson B1",
  },
];

describe("course structure helpers", () => {
  it("computes normalized sort-order updates for modules and lesson groups", () => {
    const modules: CourseStructureModuleRow[] = [
      { ...MODULES[0], sortOrder: 5 },
      { ...MODULES[1], sortOrder: 2 },
      { ...MODULES[2], sortOrder: 5 },
    ];
    const lessons: CourseStructureLessonRow[] = [
      { ...LESSONS[0], sortOrder: 3 },
      { ...LESSONS[1], sortOrder: 3 },
      { ...LESSONS[2], sortOrder: 8 },
      {
        id: "lesson-unlinked",
        parentId: null,
        sortOrder: 7,
        createdAt: "2026-03-01T10:03:00.000Z",
        updatedAt: "2026-03-01T10:03:00.000Z",
        title: "Lesson Unlinked",
      },
    ];

    const result = computeNormalizedCourseStructureSortOrderUpdates(modules, lessons);
    expect(result.moduleUpdates).toEqual(
      expect.arrayContaining([
        { id: "module-a", sortOrder: 2 },
        { id: "module-b", sortOrder: 0 },
        { id: "module-c", sortOrder: 1 },
      ])
    );
    expect(result.lessonUpdates).toEqual(
      expect.arrayContaining([
        { id: "lesson-a2", sortOrder: 0 },
        { id: "lesson-a1", sortOrder: 1 },
        { id: "lesson-b1", sortOrder: 0 },
        { id: "lesson-unlinked", sortOrder: 0 },
      ])
    );
  });

  it("reports unlinked lessons and duplicate sort-order drift", () => {
    const modules: CourseStructureModuleRow[] = [
      { ...MODULES[0], sortOrder: 1 },
      { ...MODULES[1], sortOrder: 1 },
    ];
    const lessons: CourseStructureLessonRow[] = [
      { ...LESSONS[0], sortOrder: 2 },
      { ...LESSONS[1], sortOrder: 2 },
      { ...LESSONS[2], parentId: "missing-module", sortOrder: 0 },
    ];

    const integrity = buildCourseStructureIntegrity(modules, lessons);
    expect(integrity.unlinkedLessonCount).toBe(1);
    expect(integrity.duplicateModuleSortOrderCount).toBe(1);
    expect(integrity.duplicateLessonSortGroupCount).toBe(1);
    expect(integrity.duplicateLessonSortEntryCount).toBe(1);
  });

  it("resolves adjacent module and lesson ids for directional moves", () => {
    expect(getAdjacentModuleId(MODULES, "module-b", "up")).toBe("module-a");
    expect(getAdjacentModuleId(MODULES, "module-b", "down")).toBe("module-c");
    expect(getAdjacentModuleId(MODULES, "module-a", "up")).toBeNull();

    expect(getAdjacentLessonId(LESSONS, "lesson-a2", "up")).toBe("lesson-a1");
    expect(getAdjacentLessonId(LESSONS, "lesson-a1", "up")).toBeNull();
    expect(getAdjacentLessonId(LESSONS, "lesson-a2", "down")).toBeNull();
  });

  it("prefers the most recently edited module when resolving duplicate occupied slots", () => {
    const modules: CourseStructureModuleRow[] = [
      { ...MODULES[0] },
      { ...MODULES[1] },
      {
        ...MODULES[2],
        sortOrder: 1,
        updatedAt: "2026-03-16T20:00:00.000Z",
      },
    ];

    const result = computeNormalizedCourseStructureSortOrderUpdates(modules, []);

    expect(result.moduleUpdates).toEqual(
      expect.arrayContaining([{ id: "module-b", sortOrder: 2 }])
    );
  });
});
