import { describe, expect, it } from "vitest";
import {
  applyDrylandMicroBlockStatus,
  buildDrylandMicroBlocksFromDraft,
  buildDrylandMicroPlanProgress,
  buildDrylandMicroPlanWeekWindow,
  deriveDrylandMicroPlanStatus,
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
  it("snapshots one micro block per dryland exercise", () => {
    const blocks = buildBlocks();

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      sourceExerciseId: "exercise-1",
      title: "Single-leg squat",
      status: "queued",
      targetLabel: "2 sets · 6 @ 12.5kg P: 1 min 15 sec",
      coachCue: "Slow down.",
    });
    expect(blocks[1]).toMatchObject({
      title: "Dead bug",
      summary: "Core",
      coachCue: "Brace first",
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
      totalBlockCount: 2,
      completedBlockCount: 1,
      skippedBlockCount: 1,
      remainingBlockCount: 0,
      progressPercent: 50,
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

    expect(deriveDrylandMicroPlanStatus(completedAll.value, "active")).toBe("completed");
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
});
