import type { CourseModule } from "@/app/course/courseData";

const SEEN_STATE_VERSION = 1;

export type MyLibraryCourseSignal = {
  signature: string;
  lessonCount: number;
  lessonTokens: string[];
  firstLessonId: string | null;
  lessons: MyLibrarySignalLesson[];
};

export type MyLibrarySignalLesson = {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonToken: string;
};

export type MyLibrarySeenState = {
  version: number;
  signature: string;
  lessonCount: number;
  lessonTokens: string[];
  seenAt: string;
};

type NewContentDecision =
  | {
      state: "show";
      newLessonCount: number;
      newLessons: MyLibrarySignalLesson[];
      shouldPersistCurrent: false;
    }
  | {
      state: "hidden";
      newLessonCount: 0;
      newLessons: [];
      shouldPersistCurrent: boolean;
    };

function stableHash(value: string): string {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const left = (h2 >>> 0).toString(16).padStart(8, "0");
  const right = (h1 >>> 0).toString(16).padStart(8, "0");
  return `${left}${right}`;
}

function normalizeLessonId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function buildMyLibraryCourseSignal(modules: CourseModule[]): MyLibraryCourseSignal {
  const seenLessonIds = new Set<string>();
  const lessons: MyLibrarySignalLesson[] = [];

  for (const courseModule of modules) {
    const moduleId = normalizeLessonId(courseModule.id) ?? "module";
    const moduleTitle = courseModule.title.trim().length > 0 ? courseModule.title.trim() : moduleId;
    for (const lesson of courseModule.lessons) {
      const lessonId = normalizeLessonId(lesson.id);
      if (!lessonId || seenLessonIds.has(lessonId)) continue;
      seenLessonIds.add(lessonId);
      const lessonTitle = lesson.title.trim().length > 0 ? lesson.title.trim() : lessonId;
      const lessonToken = stableHash(`lesson:${lessonId}`);
      lessons.push({
        lessonId,
        lessonTitle,
        moduleId,
        moduleTitle,
        lessonToken,
      });
    }
  }

  const lessonTokens = lessons
    .map((lesson) => lesson.lessonToken)
    .sort((a, b) => a.localeCompare(b));
  const signatureBase = lessonTokens.join("|");
  const signature = stableHash(`v1:${signatureBase}`);

  return {
    signature: `v1:${signature}`,
    lessonCount: lessons.length,
    lessonTokens,
    firstLessonId: lessons[0]?.lessonId ?? null,
    lessons,
  };
}

export function buildMyLibrarySeenStorageKey(userId: string): string {
  const normalizedUserId = userId.trim();
  return `fs_library_new_content_seen:${normalizedUserId}`;
}

export function parseMyLibrarySeenState(raw: string | null): MyLibrarySeenState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MyLibrarySeenState>;
    if (typeof parsed !== "object" || !parsed) return null;
    if (typeof parsed.signature !== "string" || parsed.signature.trim().length === 0) return null;
    if (typeof parsed.lessonCount !== "number" || !Number.isFinite(parsed.lessonCount)) return null;
    if (!Array.isArray(parsed.lessonTokens)) return null;

    const lessonTokens = parsed.lessonTokens
      .map((token) => (typeof token === "string" ? token.trim() : ""))
      .filter((token) => token.length > 0);

    const seenAt =
      typeof parsed.seenAt === "string" && Number.isFinite(Date.parse(parsed.seenAt))
        ? new Date(parsed.seenAt).toISOString()
        : new Date().toISOString();

    return {
      version: typeof parsed.version === "number" ? parsed.version : SEEN_STATE_VERSION,
      signature: parsed.signature.trim(),
      lessonCount: Math.max(0, Math.floor(parsed.lessonCount)),
      lessonTokens,
      seenAt,
    };
  } catch {
    return null;
  }
}

export function buildMyLibrarySeenState(signal: MyLibraryCourseSignal): MyLibrarySeenState {
  return {
    version: SEEN_STATE_VERSION,
    signature: signal.signature,
    lessonCount: signal.lessonCount,
    lessonTokens: signal.lessonTokens,
    seenAt: new Date().toISOString(),
  };
}

export function resolveNewContentDecision(
  signal: MyLibraryCourseSignal,
  seen: MyLibrarySeenState | null
): NewContentDecision {
  if (signal.lessonCount === 0) {
    return {
      state: "hidden",
      newLessonCount: 0,
      newLessons: [],
      shouldPersistCurrent: Boolean(seen),
    };
  }

  if (!seen) {
    return {
      state: "show",
      newLessonCount: signal.lessonCount,
      newLessons: signal.lessons,
      shouldPersistCurrent: false,
    };
  }

  if (seen.signature === signal.signature) {
    return {
      state: "hidden",
      newLessonCount: 0,
      newLessons: [],
      shouldPersistCurrent: false,
    };
  }

  const seenTokens = new Set(seen.lessonTokens);
  const addedLessons = signal.lessons.filter((lesson) => !seenTokens.has(lesson.lessonToken));
  if (addedLessons.length <= 0) {
    return {
      state: "hidden",
      newLessonCount: 0,
      newLessons: [],
      shouldPersistCurrent: true,
    };
  }

  return {
    state: "show",
    newLessonCount: addedLessons.length,
    newLessons: addedLessons,
    shouldPersistCurrent: false,
  };
}
