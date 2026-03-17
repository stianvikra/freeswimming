type CourseWorkspaceModuleRef = {
  id: string;
};

type CourseWorkspaceLessonRef = {
  parentId: string | null;
  sortOrder: number;
  title: string;
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
