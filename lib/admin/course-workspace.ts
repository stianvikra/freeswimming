type CourseWorkspaceModuleRef = {
  id: string;
};

type CourseWorkspaceLessonRef = {
  parentId: string | null;
  sortOrder: number;
  title: string;
};

type CourseWorkspaceLessonPreview<TLesson> = {
  visibleLessons: TLesson[];
  hiddenCount: number;
};

export function buildCourseWorkspaceLessonsByModuleId<
  TModule extends CourseWorkspaceModuleRef,
  TLesson extends CourseWorkspaceLessonRef,
>(modules: readonly TModule[], lessons: readonly TLesson[]): Map<string, TLesson[]> {
  const byModuleId = new Map<string, TLesson[]>();

  for (const moduleItem of modules) {
    byModuleId.set(moduleItem.id, []);
  }

  const sortedLessons = [...lessons].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title)
  );

  for (const lessonItem of sortedLessons) {
    if (!lessonItem.parentId) continue;
    const linkedLessons = byModuleId.get(lessonItem.parentId);
    if (!linkedLessons) continue;
    linkedLessons.push(lessonItem);
  }

  return byModuleId;
}

export function buildCourseWorkspaceLessonPreview<TLesson>(
  lessons: readonly TLesson[],
  maxVisible: number
): CourseWorkspaceLessonPreview<TLesson> {
  const safeLimit = Number.isFinite(maxVisible) ? Math.max(0, Math.floor(maxVisible)) : 0;
  const visibleLessons = lessons.slice(0, safeLimit);

  return {
    visibleLessons,
    hiddenCount: Math.max(0, lessons.length - visibleLessons.length),
  };
}
