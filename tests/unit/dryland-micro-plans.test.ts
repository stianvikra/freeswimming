import { describe, expect, it, vi } from "vitest";
import {
  applyDrylandMicroBlockStatus,
  buildDrylandMicroBlocksFromDraft,
  buildDrylandMicroBlocksFromSources,
  buildDrylandMicroPlanProgress,
  buildDrylandMicroPlanWeekWindow,
  deriveDrylandMicroPlanStatus,
  getDrylandMicroWeeklyProgramCreditBlockId,
  getDrylandMicroBlockReleaseDate,
  isDrylandMicroWeeklyProgramComplete,
  isDrylandMicroBlockAvailable,
  mergeDrylandMicroBlocksForPlanEdit,
  type DrylandMicroHabitLinkRecord,
  type DrylandMicroBlockSnapshot,
} from "@/lib/dryland/micro-plans";
import {
  buildDrylandMicroHabitLinkRecord,
  loadDrylandMicroHabitLinkRecord,
  recordMicroSessionHabitCredit,
  removeMicroSessionHabitCredit,
} from "@/lib/dryland/micro-habit-linkage";
import type { DrylandSessionDraft } from "@/lib/dryland/shared";
import type { HabitDefinitionRow } from "@/lib/habits/shared";
import type { Database } from "@/types/database";

type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

function buildHabitLink(
  overrides?: Partial<DrylandMicroHabitLinkRecord>
): DrylandMicroHabitLinkRecord {
  return {
    id: "link-1",
    habitId: "11111111-1111-4111-8111-111111111111",
    status: "active",
    habitDefinitionSupport: "supported",
    startsOn: "2026-05-10",
    pausedAt: null,
    resumedAt: "2026-05-10T08:00:00.000Z",
    endedAt: null,
    habitTitle: "Mobility habit",
    habitStatus: "active",
    habitMode: "build",
    habitCadenceLabel: "Weekly - any day",
    canCount: true,
    ...overrides,
  };
}

function buildHabitDefinitionRow(overrides: Partial<HabitDefinitionRow> = {}): HabitDefinitionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    title: "Mobility habit",
    notes: null,
    habit_mode: "build",
    habit_type: "binary",
    category: "movement",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
    start_date: "2026-05-10",
    last_lapse_date: null,
    timer_enabled: false,
    timer_target_seconds: null,
    cadence_period: "weekly",
    cadence_target_count: 1,
    cadence_day_policy: "any",
    schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    is_perfect_day_item: false,
    status: "active",
    sort_order: 1,
    created_at: "2026-05-10T08:00:00.000Z",
    updated_at: "2026-05-10T08:00:00.000Z",
    ...overrides,
  };
}

function buildMicroHabitLinkRow(
  overrides: Partial<MicroSessionHabitLinkRow> = {}
): MicroSessionHabitLinkRow {
  return {
    id: "link-1",
    user_id: "user-1",
    dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
    habit_id: "11111111-1111-4111-8111-111111111111",
    status: "active",
    starts_on: "2026-05-10",
    paused_at: null,
    resumed_at: "2026-05-10T08:00:00.000Z",
    ended_at: null,
    created_at: "2026-05-10T08:00:00.000Z",
    updated_at: "2026-05-10T08:00:00.000Z",
    ...overrides,
  };
}

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
    expect(JSON.stringify(blocks)).not.toContain("Keep the line stable.");
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

  it("snapshots strength time targets as duration micro units", () => {
    const baseExercise = buildDraft().exercises[0]!;
    const blocks = buildDrylandMicroBlocksFromSources([
      {
        sourceDrylandSessionId: "strength-time-session",
        draft: {
          ...buildDraft(),
          title: "Core strength",
          exercises: [
            {
              ...baseExercise,
              id: "plank",
              title: "Plank",
              sets: [
                {
                  id: "hold-1",
                  reps: null,
                  holdSeconds: 45,
                  loadKg: null,
                  restSeconds: 60,
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
    expect(blocks.value).toHaveLength(1);
    expect(blocks.value[0]).toMatchObject({
      title: "Plank",
      targetType: "duration",
      targetValue: 45,
      targetUnit: "sec",
      targetLabel: "45 sec · 1 min rest",
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

  it("treats a weekly Micro Session program as complete only when every active block is completed", () => {
    const blocks = buildBlocks();
    const completed = blocks.map((block) => ({
      ...block,
      status: "completed" as const,
      completedAt: "2026-05-10T10:00:00.000Z",
    }));
    const skipped = completed.map((block, index) =>
      index === 1
        ? { ...block, status: "skipped" as const, skippedAt: "2026-05-10T10:05:00.000Z" }
        : block
    );

    expect(isDrylandMicroWeeklyProgramComplete(blocks)).toBe(false);
    expect(isDrylandMicroWeeklyProgramComplete(completed)).toBe(true);
    expect(isDrylandMicroWeeklyProgramComplete(skipped)).toBe(false);
    expect(getDrylandMicroWeeklyProgramCreditBlockId(completed)).toBe(completed.at(-1)?.id);
  });

  it.each([
    {
      label: "unknown type",
      rawValues: ["future_type"],
      overrides: { habit_type: "future_type" } as unknown as Partial<HabitDefinitionRow>,
    },
    {
      label: "unknown mode",
      rawValues: ["future_mode"],
      overrides: { habit_mode: "future_mode" } as unknown as Partial<HabitDefinitionRow>,
    },
    {
      label: "unknown status",
      rawValues: ["future_status"],
      overrides: { status: "future_status" } as unknown as Partial<HabitDefinitionRow>,
    },
    {
      label: "mixed unknown values",
      rawValues: ["future_type", "future_mode", "future_status"],
      overrides: {
        habit_type: "future_type",
        habit_mode: "future_mode",
        status: "future_status",
      } as unknown as Partial<HabitDefinitionRow>,
    },
  ])(
    "blocks new Habit credit for $label before any check-in query",
    async ({ rawValues, overrides }) => {
      const link = buildDrylandMicroHabitLinkRecord(
        buildMicroHabitLinkRow(),
        buildHabitDefinitionRow(overrides)
      );
      const from = vi.fn();

      const result = await recordMicroSessionHabitCredit({ from } as never, {
        userId: "user-1",
        planId: "22222222-2222-4222-8222-222222222222",
        blockId: "unit-1",
        link,
        selectedDate: "2026-05-10",
        todayDate: "2026-05-10",
        timezone: "Europe/Oslo",
        completedAt: "2026-05-10T10:00:00.000Z",
      });

      expect(link).toMatchObject({
        habitDefinitionSupport: "unsupported",
        habitStatus: "unsupported",
        habitMode: "unsupported",
        canCount: false,
      });
      expect(result).toEqual({
        status: "blocked",
        code: "UNSUPPORTED_HABIT_DEFINITION",
        message: "Micro Session saved, but the linked Habit needs review and did not count.",
      });
      expect(from).not.toHaveBeenCalled();
      for (const rawValue of rawValues) {
        expect(JSON.stringify({ link, result })).not.toContain(rawValue);
      }
    }
  );

  it("does not create Habit credit while the Micro Session Habit link is paused", async () => {
    const from = vi.fn();

    const result = await recordMicroSessionHabitCredit({ from } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      blockId: "unit-1",
      link: buildHabitLink({ status: "paused", pausedAt: "2026-05-10T09:00:00.000Z" }),
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
      timezone: "Europe/Oslo",
      completedAt: "2026-05-10T10:00:00.000Z",
    });

    expect(result).toEqual({
      status: "paused",
      message: "Habit paused - weekly program did not count.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("fails closed for an invalid persisted Micro Session Habit start date", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "link-1",
        user_id: "user-1",
        dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
        habit_id: "11111111-1111-4111-8111-111111111111",
        status: "active",
        starts_on: "not-a-date",
        paused_at: null,
        resumed_at: "2026-05-10T08:00:00.000Z",
        ended_at: null,
        created_at: "2026-05-10T08:00:00.000Z",
        updated_at: "2026-05-10T08:00:00.000Z",
      },
      error: null,
    });
    const limit = vi.fn(() => ({ maybeSingle }));
    const order = vi.fn(() => ({ limit }));
    const statusIn = vi.fn(() => ({ order }));
    const eqPlan = vi.fn(() => ({ in: statusIn }));
    const eqUser = vi.fn(() => ({ eq: eqPlan }));
    const select = vi.fn(() => ({ eq: eqUser }));
    const from = vi.fn(() => ({ select }));

    const link = await loadDrylandMicroHabitLinkRecord(
      { from } as never,
      "user-1",
      "22222222-2222-4222-8222-222222222222"
    );

    expect(link).toMatchObject({
      status: "unsupported",
      habitDefinitionSupport: "unavailable",
      startsOn: "",
      canCount: false,
    });
    expect(from).toHaveBeenCalledTimes(1);

    const writeFrom = vi.fn();
    const credit = await recordMicroSessionHabitCredit({ from: writeFrom } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      blockId: "unit-1",
      link,
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
      timezone: "Europe/Oslo",
      completedAt: "2026-05-10T10:00:00.000Z",
    });
    expect(credit).toEqual({
      status: "blocked",
      message: "Linked Habit is not active, so the weekly program did not count.",
    });
    expect(credit).not.toHaveProperty("code");
    expect(writeFrom).not.toHaveBeenCalled();

    const removal = await removeMicroSessionHabitCredit({ from: writeFrom } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      link,
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(removal).toEqual({
      status: "blocked",
      message: "Micro Session updated, but the linked Habit boundary was invalid.",
    });
    expect(writeFrom).not.toHaveBeenCalled();

    await expect(
      loadDrylandMicroHabitLinkRecord(
        { from } as never,
        "user-1",
        "22222222-2222-4222-8222-222222222222",
        { required: true }
      )
    ).rejects.toThrow("Linked Habit start date is invalid.");
    expect(consoleError).toHaveBeenCalledWith(
      "[DrylandMicroHabitLink] Invalid persisted link start date",
      {
        linkId: "link-1",
        planId: "22222222-2222-4222-8222-222222222222",
      }
    );
  });

  it("does not remove credit for a structurally unsupported persisted link", async () => {
    const from = vi.fn();

    const result = await removeMicroSessionHabitCredit({ from } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      link: buildHabitLink({ status: "unsupported", startsOn: "2026-05-10" }),
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });

    expect(result).toEqual({
      status: "blocked",
      message: "Micro Session updated, but the linked Habit boundary was invalid.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("creates one weekly Habit check-in with Micro Session provenance for an active link", async () => {
    const existingDateMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const existingDateEqDate = vi.fn(() => ({ maybeSingle: existingDateMaybeSingle }));
    const existingDateEqHabit = vi.fn(() => ({ eq: existingDateEqDate }));
    const existingDateEqUser = vi.fn(() => ({ eq: existingDateEqHabit }));
    const existingWeekMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const existingWeekLimit = vi.fn(() => ({ maybeSingle: existingWeekMaybeSingle }));
    const existingWeekLte = vi.fn(() => ({ limit: existingWeekLimit }));
    const existingWeekGte = vi.fn(() => ({ lte: existingWeekLte }));
    const existingWeekEqHabit = vi.fn(() => ({ gte: existingWeekGte }));
    const existingWeekEqUser = vi.fn(() => ({ eq: existingWeekEqHabit }));
    const select = vi
      .fn()
      .mockReturnValueOnce({ eq: existingDateEqUser })
      .mockReturnValueOnce({ eq: existingWeekEqUser });
    const insertSingle = vi.fn().mockResolvedValue({
      data: {
        id: "check-1",
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        timezone: "Europe/Oslo",
        value_numeric: null,
        value_boolean: true,
        value_time: null,
        timer_seconds: 0,
        manual_minutes: 0,
        note: null,
        status: "logged",
        source_kind: "micro_session",
        source_dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
        source_micro_block_id: "unit-1",
        source_completed_at: "2026-05-10T10:00:00.000Z",
        completed_at: "2026-05-10T10:00:00.000Z",
        created_at: "2026-05-10T10:00:00.000Z",
        updated_at: "2026-05-10T10:00:00.000Z",
      },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    const from = vi.fn(() => ({ select, insert }));

    const result = await recordMicroSessionHabitCredit({ from } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      blockId: "unit-1",
      link: buildHabitLink(),
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
      timezone: "Europe/Oslo",
      completedAt: "2026-05-10T10:00:00.000Z",
    });

    expect(result).toEqual({
      status: "counted",
      message: "Habit completed for this week: Mobility habit",
    });
    expect(existingWeekGte).toHaveBeenCalledWith("check_in_date", "2026-05-04");
    expect(existingWeekLte).toHaveBeenCalledWith("check_in_date", "2026-05-10");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        value_boolean: true,
        source_kind: "micro_session",
        source_dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
        source_micro_block_id: "unit-1",
        source_completed_at: "2026-05-10T10:00:00.000Z",
      })
    );
  });

  it("blocks future linked Habit credit before any database query", async () => {
    const from = vi.fn();

    const result = await recordMicroSessionHabitCredit({ from } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      blockId: "unit-1",
      link: buildHabitLink(),
      selectedDate: "2026-05-11",
      todayDate: "2026-05-10",
      timezone: "Europe/Oslo",
      completedAt: "2026-05-10T22:30:00.000Z",
    });

    expect(result).toEqual({
      status: "blocked",
      message: "Micro Session saved, but future Habit credit was not counted.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it.each([
    {
      habitDefinitionSupport: "supported" as const,
      expected: {
        status: "removed",
        message: "Habit credit removed for this week.",
      },
    },
    {
      habitDefinitionSupport: "unsupported" as const,
      expected: {
        status: "removed",
        code: "UNSUPPORTED_HABIT_DEFINITION",
        message: "Habit credit removed for this week. The linked Habit still needs review.",
      },
    },
  ])(
    "removes only the provenance-scoped weekly credit for a $habitDefinitionSupport definition",
    async ({ habitDefinitionSupport, expected }) => {
      const deleteSelect = vi.fn().mockResolvedValue({ data: [{ id: "credit-1" }], error: null });
      const deleteLte = vi.fn(() => ({ select: deleteSelect }));
      const deleteGte = vi.fn(() => ({ lte: deleteLte }));
      const deleteEqPlan = vi.fn(() => ({ gte: deleteGte }));
      const deleteEqSource = vi.fn(() => ({ eq: deleteEqPlan }));
      const deleteEqHabit = vi.fn(() => ({ eq: deleteEqSource }));
      const deleteEqUser = vi.fn(() => ({ eq: deleteEqHabit }));
      const deleteMock = vi.fn(() => ({ eq: deleteEqUser }));
      const from = vi.fn(() => ({ delete: deleteMock }));

      const result = await removeMicroSessionHabitCredit({ from } as never, {
        userId: "user-1",
        planId: "22222222-2222-4222-8222-222222222222",
        link: buildHabitLink({
          habitDefinitionSupport,
          ...(habitDefinitionSupport === "unsupported"
            ? {
                habitStatus: "unsupported" as const,
                habitMode: "unsupported" as const,
                canCount: false,
              }
            : {}),
        }),
        selectedDate: "2026-05-10",
        todayDate: "2026-05-10",
      });

      expect(result).toEqual(expected);
      expect(deleteEqUser).toHaveBeenCalledWith("user_id", "user-1");
      expect(deleteEqHabit).toHaveBeenCalledWith(
        "habit_id",
        "11111111-1111-4111-8111-111111111111"
      );
      expect(deleteEqSource).toHaveBeenCalledWith("source_kind", "micro_session");
      expect(deleteEqPlan).toHaveBeenCalledWith(
        "source_dryland_micro_plan_id",
        "22222222-2222-4222-8222-222222222222"
      );
      expect(deleteGte).toHaveBeenCalledWith("check_in_date", "2026-05-04");
      expect(deleteLte).toHaveBeenCalledWith("check_in_date", "2026-05-10");
      expect(deleteSelect).toHaveBeenCalledWith("id");
    }
  );

  it.each([
    {
      habitDefinitionSupport: "supported" as const,
      expected: {
        status: "blocked",
        message: "Micro Session updated, but no source-backed Habit credit was found.",
      },
    },
    {
      habitDefinitionSupport: "unsupported" as const,
      expected: {
        status: "blocked",
        code: "UNSUPPORTED_HABIT_DEFINITION",
        message: "Micro Session updated, but no source-backed Habit credit was found.",
      },
    },
  ])(
    "reports no matching provenance credit truthfully for a $habitDefinitionSupport definition",
    async ({ habitDefinitionSupport, expected }) => {
      const deleteSelect = vi.fn().mockResolvedValue({ data: [], error: null });
      const deleteLte = vi.fn(() => ({ select: deleteSelect }));
      const deleteGte = vi.fn(() => ({ lte: deleteLte }));
      const deleteEqPlan = vi.fn(() => ({ gte: deleteGte }));
      const deleteEqSource = vi.fn(() => ({ eq: deleteEqPlan }));
      const deleteEqHabit = vi.fn(() => ({ eq: deleteEqSource }));
      const deleteEqUser = vi.fn(() => ({ eq: deleteEqHabit }));
      const deleteMock = vi.fn(() => ({ eq: deleteEqUser }));
      const from = vi.fn(() => ({ delete: deleteMock }));

      const result = await removeMicroSessionHabitCredit({ from } as never, {
        userId: "user-1",
        planId: "22222222-2222-4222-8222-222222222222",
        link: buildHabitLink({
          habitDefinitionSupport,
          ...(habitDefinitionSupport === "unsupported"
            ? {
                habitStatus: "unsupported" as const,
                habitMode: "unsupported" as const,
                canCount: false,
              }
            : {}),
        }),
        selectedDate: "2026-05-10",
        todayDate: "2026-05-10",
      });

      expect(result).toEqual(expected);
      expect(deleteSelect).toHaveBeenCalledWith("id");
    }
  );

  it("blocks future linked Habit credit removal before any database query", async () => {
    const from = vi.fn();

    const result = await removeMicroSessionHabitCredit({ from } as never, {
      userId: "user-1",
      planId: "22222222-2222-4222-8222-222222222222",
      link: buildHabitLink(),
      selectedDate: "2026-05-11",
      todayDate: "2026-05-10",
    });

    expect(result).toEqual({
      status: "blocked",
      message: "Micro Session updated, but future Habit credit was not changed.",
    });
    expect(from).not.toHaveBeenCalled();
  });
});
