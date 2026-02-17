export type ProgressCompletionLike = {
  completed?: boolean;
};

export function splitItemsByCompletion<T extends { id: string }>(
  items: T[],
  progressById: Record<string, ProgressCompletionLike | undefined>
): { incomplete: T[]; completed: T[] } {
  const incomplete: T[] = [];
  const completed: T[] = [];

  for (const item of items) {
    if (progressById[item.id]?.completed) {
      completed.push(item);
    } else {
      incomplete.push(item);
    }
  }

  return { incomplete, completed };
}

export function getFirstIncompleteId<T extends { id: string }>(
  items: T[],
  progressById: Record<string, ProgressCompletionLike | undefined>
): string | null {
  if (items.length === 0) return null;
  const firstIncomplete = items.find((item) => !progressById[item.id]?.completed);
  return firstIncomplete?.id ?? items[0].id;
}
