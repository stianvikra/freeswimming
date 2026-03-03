export const COURSE_PREVIEW_MODES = ["published", "review", "draft", "all"] as const;
export type CoursePreviewMode = (typeof COURSE_PREVIEW_MODES)[number];

export const COURSE_CONTENT_READ_STATUSES = ["draft", "review", "published", "archived"] as const;
export type CourseContentReadStatus = (typeof COURSE_CONTENT_READ_STATUSES)[number];

export type CoursePreviewType = "lesson" | "module";

export type CoursePreviewRequestResolution =
  | {
      ok: true;
      enabled: false;
      mode: "published";
    }
  | {
      ok: true;
      enabled: true;
      mode: CoursePreviewMode;
    }
  | {
      ok: false;
      error: string;
    };

export type CourseProgressStorageKeys = {
  lastLesson: string;
  doneLessons: string;
  doneConfirmations: string;
  videoProgress: string;
};

export const LEARNER_COURSE_PROGRESS_STORAGE_KEYS: CourseProgressStorageKeys = {
  lastLesson: "fs_course_last_lesson",
  doneLessons: "fs_course_done_lessons",
  doneConfirmations: "fs_course_done_confirmations",
  videoProgress: "fs_course_video_progress",
};

export function parseCoursePreviewMode(value: string | null | undefined): CoursePreviewMode | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return COURSE_PREVIEW_MODES.includes(normalized as CoursePreviewMode)
    ? (normalized as CoursePreviewMode)
    : null;
}

export function resolveCoursePreviewRequest(input: {
  previewParam?: string | null;
  previewModeParam?: string | null;
}): CoursePreviewRequestResolution {
  const previewEnabled = input.previewParam === "1";
  const hasPreviewModeParam = typeof input.previewModeParam === "string";

  if (!previewEnabled && hasPreviewModeParam) {
    return {
      ok: false,
      error: "previewMode requires preview=1.",
    };
  }

  if (!previewEnabled) {
    return {
      ok: true,
      enabled: false,
      mode: "published",
    };
  }

  const mode = parseCoursePreviewMode(input.previewModeParam ?? "published");
  if (!mode) {
    return {
      ok: false,
      error: "Invalid preview mode.",
    };
  }

  return {
    ok: true,
    enabled: true,
    mode,
  };
}

export function resolveCourseContentStatusesForPreviewMode(
  mode: CoursePreviewMode
): CourseContentReadStatus[] {
  if (mode === "draft") return ["draft"];
  if (mode === "review") return ["review"];
  if (mode === "all") return ["draft", "review", "published", "archived"];
  return ["published"];
}

export function resolveCoursePreviewModeFromStatus(
  status: CourseContentReadStatus
): CoursePreviewMode {
  if (status === "draft") return "draft";
  if (status === "review") return "review";
  if (status === "archived") return "all";
  return "published";
}

export function getCourseProgressStorageKeys(input: {
  previewEnabled: boolean;
  previewMode: CoursePreviewMode;
}): CourseProgressStorageKeys {
  if (!input.previewEnabled) {
    return LEARNER_COURSE_PROGRESS_STORAGE_KEYS;
  }

  const prefix = `fs_course_preview_${input.previewMode}`;
  return {
    lastLesson: `${prefix}_last_lesson`,
    doneLessons: `${prefix}_done_lessons`,
    doneConfirmations: `${prefix}_done_confirmations`,
    videoProgress: `${prefix}_video_progress`,
  };
}

export function buildCoursePreviewHref(input: {
  lessonId: string;
  mode: CoursePreviewMode;
  previewType: CoursePreviewType;
  previewRef: string;
}) {
  const params = new URLSearchParams();
  params.set("lesson", input.lessonId);
  params.set("preview", "1");
  params.set("previewMode", input.mode);
  params.set("previewType", input.previewType);
  params.set("previewRef", input.previewRef);
  return `/course?${params.toString()}`;
}
