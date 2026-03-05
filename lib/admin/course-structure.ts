export type CourseStructureModuleRow = {
  id: string;
  sortOrder: number;
  createdAt: string;
  title: string;
};

export type CourseStructureLessonRow = {
  id: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  title: string;
};

export type CourseStructureSortOrderUpdate = {
  id: string;
  sortOrder: number;
};

export type CourseStructureIntegrity = {
  unlinkedLessonCount: number;
  duplicateModuleSortOrderCount: number;
  duplicateLessonSortGroupCount: number;
  duplicateLessonSortEntryCount: number;
};

const UNLINKED_GROUP_KEY = "__unlinked__";

function normalizeIso(value: string): number {
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;
  return 0;
}

export function compareCourseStructureRows(
  left: Pick<CourseStructureModuleRow, "sortOrder" | "createdAt" | "title" | "id">,
  right: Pick<CourseStructureModuleRow, "sortOrder" | "createdAt" | "title" | "id">
): number {
  if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
  const timeDelta = normalizeIso(left.createdAt) - normalizeIso(right.createdAt);
  if (timeDelta !== 0) return timeDelta;
  const titleDelta = left.title.localeCompare(right.title);
  if (titleDelta !== 0) return titleDelta;
  return left.id.localeCompare(right.id);
}

function groupKeyFromParent(parentId: string | null): string {
  return parentId ?? UNLINKED_GROUP_KEY;
}

function countDuplicateSortOrders(rows: Array<{ sortOrder: number }>): number {
  const byOrder = new Map<number, number>();
  for (const row of rows) {
    byOrder.set(row.sortOrder, (byOrder.get(row.sortOrder) ?? 0) + 1);
  }

  let duplicates = 0;
  for (const count of byOrder.values()) {
    if (count > 1) duplicates += count - 1;
  }
  return duplicates;
}

export function buildCourseStructureIntegrity(
  modules: CourseStructureModuleRow[],
  lessons: CourseStructureLessonRow[],
  moduleIdSet?: ReadonlySet<string>
): CourseStructureIntegrity {
  const knownModuleIds = moduleIdSet ?? new Set(modules.map((row) => row.id));
  const unlinkedLessonCount = lessons.filter(
    (row) => !row.parentId || !knownModuleIds.has(row.parentId)
  ).length;

  const duplicateModuleSortOrderCount = countDuplicateSortOrders(modules);

  const lessonsByGroup = new Map<string, CourseStructureLessonRow[]>();
  for (const row of lessons) {
    const key = knownModuleIds.has(row.parentId ?? "")
      ? (row.parentId as string)
      : UNLINKED_GROUP_KEY;
    const bucket = lessonsByGroup.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      lessonsByGroup.set(key, [row]);
    }
  }

  let duplicateLessonSortGroupCount = 0;
  let duplicateLessonSortEntryCount = 0;
  for (const groupRows of lessonsByGroup.values()) {
    const duplicateCount = countDuplicateSortOrders(groupRows);
    if (duplicateCount > 0) {
      duplicateLessonSortGroupCount += 1;
      duplicateLessonSortEntryCount += duplicateCount;
    }
  }

  return {
    unlinkedLessonCount,
    duplicateModuleSortOrderCount,
    duplicateLessonSortGroupCount,
    duplicateLessonSortEntryCount,
  };
}

export function computeNormalizedCourseStructureSortOrderUpdates(
  modules: CourseStructureModuleRow[],
  lessons: CourseStructureLessonRow[]
): {
  moduleUpdates: CourseStructureSortOrderUpdate[];
  lessonUpdates: CourseStructureSortOrderUpdate[];
} {
  const moduleUpdates: CourseStructureSortOrderUpdate[] = [];
  const lessonUpdates: CourseStructureSortOrderUpdate[] = [];

  const sortedModules = [...modules].sort(compareCourseStructureRows);
  sortedModules.forEach((row, index) => {
    if (row.sortOrder !== index) {
      moduleUpdates.push({
        id: row.id,
        sortOrder: index,
      });
    }
  });

  const lessonsByGroup = new Map<string, CourseStructureLessonRow[]>();
  for (const row of lessons) {
    const key = groupKeyFromParent(row.parentId);
    const bucket = lessonsByGroup.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      lessonsByGroup.set(key, [row]);
    }
  }

  for (const groupRows of lessonsByGroup.values()) {
    const sortedLessons = [...groupRows].sort(compareCourseStructureRows);
    sortedLessons.forEach((row, index) => {
      if (row.sortOrder !== index) {
        lessonUpdates.push({
          id: row.id,
          sortOrder: index,
        });
      }
    });
  }

  return {
    moduleUpdates,
    lessonUpdates,
  };
}

export function getAdjacentModuleId(
  modules: CourseStructureModuleRow[],
  moduleId: string,
  direction: "up" | "down"
): string | null {
  const sortedModules = [...modules].sort(compareCourseStructureRows);
  const index = sortedModules.findIndex((row) => row.id === moduleId);
  if (index < 0) return null;
  if (direction === "up") return sortedModules[index - 1]?.id ?? null;
  return sortedModules[index + 1]?.id ?? null;
}

export function getAdjacentLessonId(
  lessons: CourseStructureLessonRow[],
  lessonId: string,
  direction: "up" | "down"
): string | null {
  const current = lessons.find((row) => row.id === lessonId);
  if (!current) return null;

  const siblings = lessons
    .filter((row) => {
      if (current.parentId === null) return row.parentId === null;
      return row.parentId === current.parentId;
    })
    .sort(compareCourseStructureRows);

  const index = siblings.findIndex((row) => row.id === lessonId);
  if (index < 0) return null;
  if (direction === "up") return siblings[index - 1]?.id ?? null;
  return siblings[index + 1]?.id ?? null;
}
