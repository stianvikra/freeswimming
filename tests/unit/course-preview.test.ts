import { describe, expect, it } from "vitest";
import {
  LEARNER_COURSE_PROGRESS_STORAGE_KEYS,
  buildCoursePreviewHref,
  getCourseProgressStorageKeys,
  resolveCourseContentStatusesForPreviewMode,
  resolveCoursePreviewModeFromStatus,
  resolveCoursePreviewRequest,
} from "@/lib/course/preview";

describe("course preview helpers", () => {
  it("keeps learner defaults when preview is disabled", () => {
    expect(
      getCourseProgressStorageKeys({
        previewEnabled: false,
        previewMode: "published",
      })
    ).toEqual(LEARNER_COURSE_PROGRESS_STORAGE_KEYS);
  });

  it("uses isolated storage keys when preview is enabled", () => {
    expect(
      getCourseProgressStorageKeys({
        previewEnabled: true,
        previewMode: "draft",
      })
    ).toEqual({
      lastLesson: "fs_course_preview_draft_last_lesson",
      doneLessons: "fs_course_preview_draft_done_lessons",
      doneConfirmations: "fs_course_preview_draft_done_confirmations",
      videoProgress: "fs_course_preview_draft_video_progress",
    });
  });

  it("rejects previewMode without explicit preview flag", () => {
    expect(
      resolveCoursePreviewRequest({
        previewParam: null,
        previewModeParam: "draft",
      })
    ).toEqual({
      ok: false,
      error: "previewMode requires preview=1.",
    });
  });

  it("normalizes preview request to published mode by default", () => {
    expect(
      resolveCoursePreviewRequest({
        previewParam: "1",
        previewModeParam: null,
      })
    ).toEqual({
      ok: true,
      enabled: true,
      mode: "published",
    });
  });

  it("maps preview modes to deterministic status filters", () => {
    expect(resolveCourseContentStatusesForPreviewMode("draft")).toEqual(["draft"]);
    expect(resolveCourseContentStatusesForPreviewMode("review")).toEqual(["review"]);
    expect(resolveCourseContentStatusesForPreviewMode("published")).toEqual(["published"]);
    expect(resolveCourseContentStatusesForPreviewMode("all")).toEqual([
      "draft",
      "review",
      "published",
      "archived",
    ]);
  });

  it("maps content status to preview mode for admin links", () => {
    expect(resolveCoursePreviewModeFromStatus("draft")).toBe("draft");
    expect(resolveCoursePreviewModeFromStatus("review")).toBe("review");
    expect(resolveCoursePreviewModeFromStatus("published")).toBe("published");
    expect(resolveCoursePreviewModeFromStatus("archived")).toBe("all");
  });

  it("builds explicit preview links with context", () => {
    expect(
      buildCoursePreviewHref({
        lessonId: "mod1-l1",
        mode: "review",
        previewType: "lesson",
        previewRef: "course-lesson-mod1-l1",
      })
    ).toBe(
      "/course?lesson=mod1-l1&preview=1&previewMode=review&previewType=lesson&previewRef=course-lesson-mod1-l1"
    );
  });
});
