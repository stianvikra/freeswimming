import { describe, expect, it } from "vitest";
import {
  areCourseProgressRowsEqual,
  buildCourseProgressRowsFromLocal,
  buildLocalCourseProgressFromRows,
  mergeCourseProgressRows,
  normalizeCourseProgressRows,
  normalizeDoneLessonIds,
  normalizeVideoProgressRecord,
  resolveCourseDirtyLessonIdsAfterHydrate,
} from "@/lib/course/progress";

const canonicalizeLessonId = (lessonId: string) =>
  lessonId === "mod1-l1" ? "intro-course--welcome-course-structure" : lessonId;

describe("course progress helpers", () => {
  it("normalizes local done lesson ids", () => {
    expect(normalizeDoneLessonIds([" mod1-l1 ", "", null, "mod1-l1", "mod1-l2"])).toEqual([
      "mod1-l1",
      "mod1-l2",
    ]);
  });

  it("canonicalizes legacy lesson ids when a resolver is provided", () => {
    expect(
      normalizeDoneLessonIds(["mod1-l1", " intro-course--welcome-course-structure "], {
        resolveLessonId: canonicalizeLessonId,
      })
    ).toEqual(["intro-course--welcome-course-structure"]);
  });

  it("normalizes local video progress map", () => {
    expect(
      normalizeVideoProgressRecord({
        " mod1-l1 ": 14.8,
        "mod1-l2": -2,
        "mod1-l3": "9",
        "": 22,
      })
    ).toEqual({
      "mod1-l1": 14,
      "mod1-l3": 9,
    });
  });

  it("merges alias + canonical rows onto one canonical lesson id", () => {
    const rows = normalizeCourseProgressRows(
      [
        {
          lessonId: "mod1-l1",
          done: true,
          videoSeconds: 8,
          updatedAt: "2026-02-16T10:00:00.000Z",
        },
        {
          lessonId: "intro-course--welcome-course-structure",
          done: false,
          videoSeconds: 22,
          updatedAt: "2026-02-16T10:05:00.000Z",
        },
      ],
      {
        resolveLessonId: canonicalizeLessonId,
      }
    );

    expect(rows).toEqual([
      {
        lessonId: "intro-course--welcome-course-structure",
        done: true,
        doneConfirmedAt: null,
        videoSeconds: 22,
        updatedAt: "2026-02-16T10:05:00.000Z",
      },
    ]);
  });

  it("merges duplicate rows by lesson id using done=OR and max video seconds", () => {
    const rows = normalizeCourseProgressRows([
      {
        lessonId: "mod1-l1",
        done: false,
        videoSeconds: 20,
        updatedAt: "2026-02-16T10:00:00.000Z",
      },
      {
        lesson_id: "mod1-l1",
        done: true,
        video_seconds: 12,
        updated_at: "2026-02-16T10:05:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: null,
        videoSeconds: 20,
        updatedAt: "2026-02-16T10:05:00.000Z",
      },
    ]);
  });

  it("includes known lesson ids when building local rows so reset values can sync", () => {
    const rows = buildCourseProgressRowsFromLocal(
      {
        doneLessonIds: [],
        doneConfirmationByLessonId: {},
        videoProgressByLessonId: {},
      },
      {
        knownLessonIds: ["mod1-l1"],
        updatedAt: "2026-02-16T10:10:00.000Z",
      }
    );

    expect(rows).toEqual([
      {
        lessonId: "mod1-l1",
        done: false,
        doneConfirmedAt: null,
        videoSeconds: 0,
        updatedAt: "2026-02-16T10:10:00.000Z",
      },
    ]);
  });

  it("merges local + remote rows and keeps strongest progress", () => {
    const merged = mergeCourseProgressRows(
      [
        {
          lessonId: "mod1-l1",
          done: true,
          doneConfirmedAt: null,
          videoSeconds: 30,
          updatedAt: "2026-02-16T10:00:00.000Z",
        },
      ],
      [
        {
          lessonId: "mod1-l1",
          done: false,
          doneConfirmedAt: null,
          videoSeconds: 35,
          updatedAt: "2026-02-16T09:00:00.000Z",
        },
        {
          lessonId: "mod1-l2",
          done: true,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-16T11:00:00.000Z",
        },
      ]
    );

    expect(merged).toEqual([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: null,
        videoSeconds: 35,
        updatedAt: "2026-02-16T10:00:00.000Z",
      },
      {
        lessonId: "mod1-l2",
        done: true,
        doneConfirmedAt: null,
        videoSeconds: 0,
        updatedAt: "2026-02-16T11:00:00.000Z",
      },
    ]);
  });

  it("compares rows by effective progress fields, not timestamp noise", () => {
    expect(
      areCourseProgressRowsEqual(
        [
          {
            lessonId: "mod1-l1",
            done: true,
            doneConfirmedAt: null,
            videoSeconds: 35,
            updatedAt: "2026-02-16T10:00:00.000Z",
          },
        ],
        [
          {
            lessonId: "mod1-l1",
            done: true,
            doneConfirmedAt: null,
            videoSeconds: 35,
            updatedAt: "2026-02-16T11:00:00.000Z",
          },
        ]
      )
    ).toBe(true);
  });

  it("builds local state from normalized rows", () => {
    const local = buildLocalCourseProgressFromRows([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: "2026-02-16T10:05:00.000Z",
        videoSeconds: 42,
        updatedAt: "2026-02-16T10:00:00.000Z",
      },
      {
        lessonId: "mod1-l2",
        done: false,
        doneConfirmedAt: null,
        videoSeconds: 0,
        updatedAt: "2026-02-16T10:00:00.000Z",
      },
    ]);

    expect(local).toEqual({
      doneLessonIds: ["mod1-l1"],
      doneConfirmationByLessonId: {
        "mod1-l1": "2026-02-16T10:05:00.000Z",
      },
      videoProgressByLessonId: {
        "mod1-l1": 42,
      },
    });
  });

  it("builds canonical local state when legacy lesson ids are still stored", () => {
    const local = buildLocalCourseProgressFromRows(
      [
        {
          lessonId: "mod1-l1",
          done: true,
          doneConfirmedAt: "2026-02-16T10:05:00.000Z",
          videoSeconds: 42,
          updatedAt: "2026-02-16T10:00:00.000Z",
        },
      ],
      {
        resolveLessonId: canonicalizeLessonId,
      }
    );

    expect(local).toEqual({
      doneLessonIds: ["intro-course--welcome-course-structure"],
      doneConfirmationByLessonId: {
        "intro-course--welcome-course-structure": "2026-02-16T10:05:00.000Z",
      },
      videoProgressByLessonId: {
        "intro-course--welcome-course-structure": 42,
      },
    });
  });

  it("keeps existing dirty lessons after hydrate even when merged equals remote", () => {
    const dirty = resolveCourseDirtyLessonIdsAfterHydrate({
      existingDirtyLessonIds: ["mod1-l1"],
      mergedRows: [
        {
          lessonId: "mod1-l1",
          done: false,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-17T10:00:00.000Z",
        },
      ],
      remoteRows: [
        {
          lessonId: "mod1-l1",
          done: false,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-17T10:01:00.000Z",
        },
      ],
    });

    expect(dirty).toEqual(["mod1-l1"]);
  });

  it("marks merged lesson ids dirty when hydrate reveals local/remote mismatch", () => {
    const dirty = resolveCourseDirtyLessonIdsAfterHydrate({
      existingDirtyLessonIds: [],
      mergedRows: [
        {
          lessonId: "mod1-l1",
          done: true,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-17T10:00:00.000Z",
        },
        {
          lessonId: "mod1-l2",
          done: false,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-17T10:00:00.000Z",
        },
      ],
      remoteRows: [
        {
          lessonId: "mod1-l1",
          done: false,
          doneConfirmedAt: null,
          videoSeconds: 0,
          updatedAt: "2026-02-17T10:01:00.000Z",
        },
      ],
    });

    expect(dirty).toEqual(["mod1-l1", "mod1-l2"]);
  });

  it("keeps done confirmation timestamps only for done lessons", () => {
    const rows = normalizeCourseProgressRows([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: "2026-02-17T11:00:00.000Z",
        videoSeconds: 0,
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
      {
        lessonId: "mod1-l2",
        done: false,
        doneConfirmedAt: "2026-02-17T11:00:00.000Z",
        videoSeconds: 0,
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: "2026-02-17T11:00:00.000Z",
        videoSeconds: 0,
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
      {
        lessonId: "mod1-l2",
        done: false,
        doneConfirmedAt: null,
        videoSeconds: 0,
        updatedAt: "2026-02-17T11:00:00.000Z",
      },
    ]);
  });

  it("builds sync rows with done confirmation for completed lessons", () => {
    const rows = buildCourseProgressRowsFromLocal(
      {
        doneLessonIds: ["mod1-l1"],
        doneConfirmationByLessonId: {
          "mod1-l1": "2026-02-18T09:00:00.000Z",
          "mod1-l2": "2026-02-18T09:00:00.000Z",
        },
        videoProgressByLessonId: {},
      },
      {
        knownLessonIds: ["mod1-l1", "mod1-l2"],
        updatedAt: "2026-02-18T10:00:00.000Z",
      }
    );

    expect(rows).toEqual([
      {
        lessonId: "mod1-l1",
        done: true,
        doneConfirmedAt: "2026-02-18T09:00:00.000Z",
        videoSeconds: 0,
        updatedAt: "2026-02-18T10:00:00.000Z",
      },
      {
        lessonId: "mod1-l2",
        done: false,
        doneConfirmedAt: null,
        videoSeconds: 0,
        updatedAt: "2026-02-18T10:00:00.000Z",
      },
    ]);
  });
});
