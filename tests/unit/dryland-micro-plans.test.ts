import { describe, expect, it } from "vitest";
import {
  applyDrylandMicroBlockStatus,
  buildDrylandMicroBlocksFromDraft,
  buildDrylandMicroBlocksFromSources,
  buildDrylandMicroPlanProgress,
  buildDrylandMicroPlanWeekWindow,
  deriveDrylandMicroPlanStatus,
  getDrylandMicroBlockReleaseDate,
  isDrylandMicroBlockAvailable,
  mergeDrylandMicroBlocksForPlanEdit,
  type DrylandMicroBlockSnapshot,
} from "@/lib/dryland/micro-plans";
import type { DrylandSessionDraft } from "@/lib/dryland/shared";

function buildDraft(): DrylandSessionDraft {
  return {
    version: 1,
    sessionKind: "strength",
    title: "Weekly strength",
    description: "Small dryland plan.",
    focusText: "Keep the line stable.",
    startedAt: null,
    completedAt: null,
    actualDurationSeconds: null,
    exercises: [
      {
        id: "exercise-1",
        source: "custom",
        bankExerciseId: null,
        title: "Single-leg squat",
        summary: "Controlled lower-body strength.",
        howTo: "Keep the knee tracking forward.",
        targetAreas: ["Quads", "Glutes"],
        accent: "amber",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "Slow down.",
        sets: [
          {
            id: "set-1",
            reps: 6,
            holdSeconds: null,
            loadKg: 12.5,
            restSeconds: 75,
            isCompleted: false,
            completedAt: null,
          },
          {
            id: "set-2",
            reps: 6,
            holdSeconds: null,
            loadKg: 12.5,
            restSeconds: 75,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
      {
        id: "exercise-2",
        source: "custom",
        bankExerciseId: null,
        title: "Dead bug",
        summary: "",
        howTo: "Brace first.",
        targetAreas: ["Core"],
        accent: "blue",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "",
        sets: [
          {
            id: "set-1",
            reps: 8,
            holdSeconds: null,
            loadKg: null,
            restSeconds: 45,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
  };
}

function buildBlocks(): DrylandMicroBlockSnapshot[] {
  return buildDrylandMicroBlocksFromDraft(buildDraft());
}

describe("dryland micro plans", () => {
  it("snapshots one micro unit per dryland set with rep targets", () => {
    const blocks = buildBlocks();

    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toMatchObject({
      sourceExerciseId: "exercise-1",
      sourceSetId: "set-1",
      setIndex: 0,
      title: "Single-leg squat",
      status: "queued",
      targetType: "reps",
      targetValue: 6,
      targetLabel: "6 reps · 12.5kg · 1 min 15 sec rest",
      coachCue: "Slow down.",
    });
    expect(blocks[1]).toMatchObject({
      sourceExerciseId: "exercise-1",
      sourceSetId: "set-2",
      setIndex: 1,
      targetLabel: "6 reps · 12.5kg · 1 min 15 sec rest",
    });
    expect(blocks[2]).toMatchObject({
      title: "Dead bug",
      summary: "Core",
      coachCue: "Brace first",
    });
  });

  it("keeps repeated exercise sets as separate micro units", () => {
    const pushUpSets = Array.from({ length: 3 }, (_, index) => ({
      id: `push-up-set-${index + 1}`,
      reps: 12,
      holdSeconds: null,
      loadKg: null,
      restSeconds: 30,
      isCompleted: false,
      completedAt: null,
    }));
    const baseExercise = buildDraft().exercises[0]!;
    const blocks = buildDrylandMicroBlocksFromSources([
      {
        sourceDrylandSessionId: "push-up-source",
        draft: {
          ...buildDraft(),
          title: "Push-up volume",
          exercises: [
            {
              ...baseExercise,
              id: "push-ups",
              title: "Push ups",
              summary: "",
              notes: "",
              howTo: "Keep a strong plank.",
              targetAreas: ["Chest", "Core"],
              sets: pushUpSets,
            },
          ],
        },
      },
    ]);

    expect(blocks.ok).toBe(true);
    if (!blocks.ok) return;
    expect(blocks.value).toHaveLength(3);
    expect(blocks.value.map((block) => block.title)).toEqual(["Push ups", "Push ups", "Push ups"]);
    expect(blocks.value.map((block) => block.sourceSetId)).toEqual([
      "push-up-set-1",
      "push-up-set-2",
      "push-up-set-3",
    ]);
    expect(blocks.value.map((block) => block.setIndex)).toEqual([0, 1, 2]);
    expect(blocks.value.map((block) => block.targetLabel)).toEqual([
      "12 reps · 30 sec rest",
      "12 reps · 30 sec rest",
      "12 reps · 30 sec rest",
    ]);
  });

  it("snapshots stretching set units with duration targets", () => {
    const blocks = buildDrylandMicroBlocksFromSources([
      {
        sourceDrylandSessionId: "stretching-session",
        draft: {
          ...buildDraft(),
          sessionKind: "stretching",
          title: "Core mobility",
          exercises: [
            {
              ...buildDraft().exercises[0]!,
              id: "plank",
              title: "Plank",
              sets: [
                {
                  id: "hold-1",
                  reps: null,
                  holdSeconds: 30,
                  loadKg: null,
                  restSeconds: 20,
                  isCompleted: false,
                  completedAt: null,
                },
                {
                  id: "hold-2",
                  reps: null,
                  holdSeconds: 30,
                  loadKg: null,
                  restSeconds: 20,
                  isCompleted: false,
                  completedAt: null,
                },
              ],
            },
          ],
        },
      },
    ]);

    expect(blocks.ok).toBe(true);
    if (!blocks.ok) return;
    expect(blocks.value).toHaveLength(2);
    expect(blocks.value[0]).toMatchObject({
      title: "Plank",
      targetType: "duration",
      targetValue: 30,
      targetUnit: "sec",
      targetLabel: "30 sec · 20 sec rest",
    });
  });

  it("calculates simple completed-block progress without counting skipped work as complete", () => {
    const blocks = buildBlocks();
    blocks[0] = {
      ...blocks[0],
      status: "completed",
      completedAt: "2026-05-08T08:00:00.000Z",
    };
    blocks[1] = {
      ...blocks[1],
      status: "skipped",
      skippedAt: "2026-05-08T08:10:00.000Z",
    };

    expect(buildDrylandMicroPlanProgress(blocks)).toEqual({
      totalBlockCount: 3,
      completedBlockCount: 1,
      skippedBlockCount: 1,
      remainingBlockCount: 1,
      progressPercent: 33,
    });
  });

  it("keeps completion updates idempotent and derives completed plan status", () => {
    const blocks = buildBlocks();
    const firstUpdate = applyDrylandMicroBlockStatus(
      blocks,
      blocks[0].id,
      "completed",
      new Date("2026-05-08T08:00:00.000Z")
    );
    expect(firstUpdate.ok).toBe(true);
    if (!firstUpdate.ok) return;

    const secondUpdate = applyDrylandMicroBlockStatus(
      firstUpdate.value,
      blocks[0].id,
      "completed",
      new Date("2026-05-08T09:00:00.000Z")
    );
    expect(secondUpdate.ok).toBe(true);
    if (!secondUpdate.ok) return;

    expect(secondUpdate.value[0].completedAt).toBe("2026-05-08T08:00:00.000Z");

    const completedAll = applyDrylandMicroBlockStatus(
      secondUpdate.value,
      blocks[1].id,
      "completed",
      new Date("2026-05-08T10:00:00.000Z")
    );
    expect(completedAll.ok).toBe(true);
    if (!completedAll.ok) return;

    const completedLast = applyDrylandMicroBlockStatus(
      completedAll.value,
      blocks[2].id,
      "completed",
      new Date("2026-05-08T11:00:00.000Z")
    );
    expect(completedLast.ok).toBe(true);
    if (!completedLast.ok) return;

    expect(deriveDrylandMicroPlanStatus(completedLast.value, "active")).toBe("completed");
  });

  it("uses the user's timezone for a Monday-based week window", () => {
    const weekWindow = buildDrylandMicroPlanWeekWindow(
      new Date("2026-05-08T12:00:00.000Z"),
      "Europe/Oslo"
    );

    expect(weekWindow).toEqual({
      timezone: "Europe/Oslo",
      weekStartsAt: "2026-05-03T22:00:00.000Z",
      weekEndsAt: "2026-05-10T22:00:00.000Z",
    });
  });

  it("distributes three source sessions across Monday, Wednesday, and Friday", () => {
    const blocks = buildDrylandMicroBlocksFromSources(
      [
        { sourceDrylandSessionId: "source-1", draft: buildDraft() },
        { sourceDrylandSessionId: "source-2", draft: { ...buildDraft(), title: "Pull" } },
        { sourceDrylandSessionId: "source-3", draft: { ...buildDraft(), title: "Core" } },
      ],
      { releaseMode: "weekday", releaseTime: "07:30" }
    );

    expect(blocks.ok).toBe(true);
    if (!blocks.ok) return;
    expect(
      blocks.value.filter((block) => block.sourceDrylandSessionId === "source-1")[0]
    ).toMatchObject({ releaseOffsetDays: 0, releaseTime: "07:30" });
    expect(
      blocks.value.filter((block) => block.sourceDrylandSessionId === "source-2")[0]
    ).toMatchObject({ releaseOffsetDays: 2, releaseTime: "07:30" });
    expect(
      blocks.value.filter((block) => block.sourceDrylandSessionId === "source-3")[0]
    ).toMatchObject({ releaseOffsetDays: 4, releaseTime: "07:30" });
  });

  it("keeps earlier unfinished weekday units available before newer releases", () => {
    const blocks = buildDrylandMicroBlocksFromSources(
      [{ sourceDrylandSessionId: "source-1", draft: buildDraft() }],
      { releaseMode: "weekday", releaseTime: "06:00" }
    );
    expect(blocks.ok).toBe(true);
    if (!blocks.ok) return;

    const plan = {
      timezone: "Europe/Oslo",
      weekStartsAt: "2026-05-03T22:00:00.000Z",
    };
    const releaseDate = getDrylandMicroBlockReleaseDate(plan, blocks.value[0]);

    expect(releaseDate?.toISOString()).toBe("2026-05-04T04:00:00.000Z");
    expect(
      isDrylandMicroBlockAvailable(plan, blocks.value[0], new Date("2026-05-06T12:00:00.000Z"))
    ).toBe(true);
  });

  it("preserves completed unit history when editing sources removes future units", () => {
    const currentBlocks = buildBlocks();
    const completed = applyDrylandMicroBlockStatus(
      currentBlocks,
      currentBlocks[0].id,
      "completed",
      new Date("2026-05-08T08:00:00.000Z")
    );
    expect(completed.ok).toBe(true);
    if (!completed.ok) return;

    const generated = buildDrylandMicroBlocksFromSources([
      {
        sourceDrylandSessionId: "another-source",
        draft: { ...buildDraft(), title: "Another source" },
      },
    ]);
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;

    const merged = mergeDrylandMicroBlocksForPlanEdit(completed.value, generated.value);

    expect(merged.some((block) => block.id === currentBlocks[0].id && block.isArchived)).toBe(true);
    expect(merged.some((block) => block.id === currentBlocks[1].id)).toBe(false);
  });

  it("preserves skipped history while rebuilding only queued units for a source edit", () => {
    const currentBlocks = buildBlocks();
    const skipped = applyDrylandMicroBlockStatus(
      currentBlocks,
      currentBlocks[1].id,
      "skipped",
      new Date("2026-05-08T08:10:00.000Z")
    );
    expect(skipped.ok).toBe(true);
    if (!skipped.ok) return;

    const editedDraft = buildDraft();
    editedDraft.exercises = [
      {
        ...editedDraft.exercises[0]!,
        sets: [editedDraft.exercises[0]!.sets[0]!],
      },
    ];
    const generated = buildDrylandMicroBlocksFromSources([
      {
        sourceDrylandSessionId: null,
        draft: editedDraft,
      },
    ]);
    expect(generated.ok).toBe(true);
    if (!generated.ok) return;

    const merged = mergeDrylandMicroBlocksForPlanEdit(skipped.value, generated.value);

    expect(merged.some((block) => block.id === currentBlocks[1].id && block.isArchived)).toBe(true);
    expect(merged.find((block) => block.id === currentBlocks[1].id)).toMatchObject({
      status: "skipped",
      skippedAt: "2026-05-08T08:10:00.000Z",
    });
    expect(merged.some((block) => block.id === currentBlocks[2].id)).toBe(false);
  });

  it("clears stale release overrides when edit changes release mode", () => {
    const current = buildDrylandMicroBlocksFromSources(
      [{ sourceDrylandSessionId: "source-1", draft: buildDraft() }],
      { releaseMode: "available_now" }
    );
    const generated = buildDrylandMicroBlocksFromSources(
      [{ sourceDrylandSessionId: "source-1", draft: buildDraft() }],
      { releaseMode: "weekday", releaseTime: "06:00" }
    );
    expect(current.ok).toBe(true);
    expect(generated.ok).toBe(true);
    if (!current.ok || !generated.ok) return;

    const merged = mergeDrylandMicroBlocksForPlanEdit(current.value, generated.value);

    expect(merged[0]).toMatchObject({
      releaseMode: "weekday",
      releaseOffsetDays: 0,
      releasedAt: null,
    });
  });
});
