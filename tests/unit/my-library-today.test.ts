import { describe, expect, it } from "vitest";
import {
  buildTodayHabitsState,
  buildTodayMicroSessionsState,
  buildTodayRoutineQuickActions,
} from "@/lib/my-library/today";
import type { DrylandMicroBlockSnapshot, DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import { buildHabitMetricCoverage } from "@/lib/habits/shared";
import type {
  HabitDefinitionView,
  HabitSnapshot,
  HabitUnsupportedDefinitionView,
} from "@/lib/habits/shared";

function buildMicroBlock(
  overrides?: Partial<DrylandMicroBlockSnapshot>
): DrylandMicroBlockSnapshot {
  return {
    id: "unit-1",
    sourceDrylandSessionId: "dryland-1",
    sourceSessionTitle: "Weekly strength",
    sourceSessionKind: "strength",
    sourceSessionIndex: 0,
    sourceExerciseId: "exercise-1",
    sourceExerciseIndex: 0,
    sourceSetId: "set-1",
    setIndex: 0,
    title: "Single-leg squat",
    summary: "Controlled lower-body strength.",
    targetLabel: "6 reps",
    targetType: "reps",
    targetValue: 6,
    targetUnit: "reps",
    loadKg: null,
    restSeconds: null,
    coachCue: "Slow down.",
    releaseMode: "available_now",
    releaseOffsetDays: null,
    releaseTime: "06:00",
    releasedAt: "1970-01-01T00:00:00.000Z",
    isArchived: false,
    status: "queued",
    completedAt: null,
    skippedAt: null,
    ...overrides,
  };
}

function buildMicroPlan(overrides?: Partial<DrylandMicroPlanRecord>): DrylandMicroPlanRecord {
  const blocks = overrides?.blocks ?? [buildMicroBlock(), buildMicroBlock({ id: "unit-2" })];
  const completedBlockCount = blocks.filter((block) => block.status === "completed").length;
  const skippedBlockCount = blocks.filter((block) => block.status === "skipped").length;
  const totalBlockCount = blocks.length;

  return {
    id: "plan-1",
    sourceDrylandSessionId: "dryland-1",
    sourceSessionTitle: "Weekly strength",
    title: "Micro session: Weekly strength",
    sessionKind: "strength",
    sourceSessionSnapshots: [
      {
        sourceDrylandSessionId: "dryland-1",
        sourceSessionTitle: "Weekly strength",
        sourceSessionKind: "strength",
        sourceSessionIndex: 0,
        releaseOffsetDays: null,
        releaseTime: "06:00",
        unitCount: totalBlockCount,
        completedUnitCount: completedBlockCount,
        skippedUnitCount: skippedBlockCount,
      },
    ],
    releaseMode: "available_now",
    releaseTime: "06:00",
    status: "active",
    timezone: "UTC",
    weekStartsAt: "2026-05-04T00:00:00.000Z",
    weekEndsAt: "2026-05-11T00:00:00.000Z",
    blocks,
    createdAt: "2026-05-10T08:00:00.000Z",
    updatedAt: "2026-05-10T08:00:00.000Z",
    progress: {
      totalBlockCount,
      completedBlockCount,
      skippedBlockCount,
      remainingBlockCount: totalBlockCount - completedBlockCount - skippedBlockCount,
      progressPercent: Math.round((completedBlockCount / Math.max(1, totalBlockCount)) * 100),
    },
    ...overrides,
    habitLink: overrides?.habitLink ?? null,
  };
}

function buildHabit(id: string): HabitDefinitionView {
  return {
    id,
    title: `Habit ${id}`,
    notes: null,
    habitMode: "build",
    habitType: "binary",
    category: "movement",
    targetOperator: "at_least",
    targetValueNumeric: null,
    targetUnit: null,
    targetTime: null,
    targetLabel: "Done",
    startDate: "2026-05-04",
    lastLapseDate: null,
    timerEnabled: false,
    timerTargetSeconds: null,
    cadencePeriod: "daily",
    cadenceTargetCount: 1,
    cadenceDayPolicy: "fixed",
    cadenceLabel: "Daily",
    scheduleDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    isPerfectDayItem: true,
    status: "active",
    microSessionLink: null,
    sortOrder: 0,
    createdAt: "2026-05-10T08:00:00.000Z",
    updatedAt: "2026-05-10T08:00:00.000Z",
  };
}

function buildHabitSnapshot(options?: {
  activeCount?: number;
  perfectDayItemCount?: number;
  satisfiedCount?: number;
  schemaReady?: boolean;
  unsupportedHabits?: HabitUnsupportedDefinitionView[];
}): HabitSnapshot {
  const activeCount = options?.activeCount ?? 3;
  const perfectDayItemCount = options?.perfectDayItemCount ?? activeCount;
  const satisfiedCount = options?.satisfiedCount ?? 1;
  const activeHabits = Array.from({ length: activeCount }, (_, index) => buildHabit(String(index)));

  return {
    schemaReady: options?.schemaReady ?? true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    unsupportedHabits: options?.unsupportedHabits ?? [],
    daySummary: {
      date: "2026-05-10",
      dayStatus: null,
      trackingState: "known",
      scheduledHabitCount: activeCount,
      potentialPerfectDayItemCount: perfectDayItemCount,
      perfectDayItemCount,
      satisfiedPerfectDayItemCount: satisfiedCount,
      completionPercent:
        perfectDayItemCount === 0 ? 0 : Math.round((satisfiedCount / perfectDayItemCount) * 100),
      isPerfectDay: perfectDayItemCount > 0 && satisfiedCount === perfectDayItemCount,
      completedDurationMinutes: 0,
      completedCountTotal: 0,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: perfectDayItemCount,
        knownUnitCount: perfectDayItemCount,
        successfulUnitCount: satisfiedCount,
      }),
      items: [],
    },
    weekSummary: {
      days: [],
      perfectDayCount: 0,
      averageCompletionPercent: 0,
      totalDurationMinutes: 0,
      totalCount: 0,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 0,
        knownUnitCount: 0,
        successfulUnitCount: 0,
      }),
    },
  };
}

describe("my library today state", () => {
  it("summarizes an active micro sessions plan without persistence", () => {
    const state = buildTodayMicroSessionsState(
      {
        microPlanSchemaReady: true,
        microPlanLoadError: null,
        microPlan: buildMicroPlan({
          blocks: [
            buildMicroBlock({ status: "completed", completedAt: "2026-05-10T08:00:00.000Z" }),
            buildMicroBlock({ id: "unit-2" }),
          ],
        }),
        recentSessions: [],
      },
      new Date("2026-05-10T09:00:00.000Z")
    );

    expect(state.state).toBe("ready");
    expect(state.title).toBe("Micro Sessions");
    expect(state.progressLabel).toBe("1/2 units");
    expect(state.progressPercent).toBe(50);
    expect(state.actionLabel).toBe("Open");
    expect(state.detail).not.toMatch(/bubble/i);
  });

  it("falls back to setup when there is no active micro plan", () => {
    const state = buildTodayMicroSessionsState({
      microPlanSchemaReady: true,
      microPlanLoadError: null,
      microPlan: null,
      recentSessions: [],
    });

    expect(state.state).toBe("setup");
    expect(state.title).toBe("Micro Sessions");
    expect(state.detail).toBe("Create a dryland exercise before building micro sessions.");
    expect(state.href).toBe("/my-library/dryland?micro=setup#micro-sessions");
  });

  it("builds direct Home routine actions for active micro sessions and habits", () => {
    const actions = buildTodayRoutineQuickActions(
      {
        microPlanSchemaReady: true,
        microPlanLoadError: null,
        microPlan: buildMicroPlan({
          blocks: [
            buildMicroBlock({ status: "completed", completedAt: "2026-05-10T08:00:00.000Z" }),
            buildMicroBlock({ id: "unit-2" }),
          ],
        }),
        recentSessions: [],
      },
      buildHabitSnapshot({ activeCount: 3, satisfiedCount: 2 }),
      new Date("2026-05-10T09:00:00.000Z")
    );

    expect(actions).toEqual([
      {
        id: "micro-sessions",
        title: "Micro Sessions",
        subtitle: "1/2 units",
        href: "/my-library/dryland?micro=active&view=auto#micro-sessions",
        state: "ready",
      },
      {
        id: "habits",
        title: "Habits",
        subtitle: "2/3 done",
        href: "/my-library/habits?view=active#today-habits",
        state: "ready",
      },
    ]);
  });

  it("routes Home routine actions to creation states when nothing is active", () => {
    const actions = buildTodayRoutineQuickActions(
      {
        microPlanSchemaReady: true,
        microPlanLoadError: null,
        microPlan: null,
        recentSessions: [],
      },
      buildHabitSnapshot({ activeCount: 0, satisfiedCount: 0 }),
      new Date("2026-05-10T09:00:00.000Z")
    );

    expect(actions).toEqual([
      {
        id: "micro-sessions",
        title: "Micro Sessions",
        subtitle: "Create dryland first",
        href: "/my-library/dryland?micro=setup#micro-sessions",
        state: "setup",
      },
      {
        id: "habits",
        title: "Habits",
        subtitle: "Add first habit",
        href: "/my-library/habits?view=active#add-habit",
        state: "setup",
      },
    ]);
  });

  it("keeps Home routine actions on today when active habits are not due", () => {
    const actions = buildTodayRoutineQuickActions(
      {
        microPlanSchemaReady: true,
        microPlanLoadError: null,
        microPlan: null,
        recentSessions: [],
      },
      buildHabitSnapshot({ activeCount: 2, perfectDayItemCount: 0, satisfiedCount: 0 }),
      new Date("2026-05-10T09:00:00.000Z")
    );

    expect(actions[1]).toEqual({
      id: "habits",
      title: "Habits",
      subtitle: "No habits due",
      href: "/my-library/habits?view=active#today-habits",
      state: "ready",
    });
  });

  it("summarizes Perfect Day as progress instead of a streak", () => {
    const state = buildTodayHabitsState(buildHabitSnapshot({ activeCount: 3, satisfiedCount: 2 }));

    expect(state.state).toBe("ready");
    expect(state.title).toBe("Habits");
    expect(state.actionLabel).toBe("Open");
    expect(state.progressLabel).toBe("2/3 done");
    expect(state.detail).not.toMatch(/streak/i);
  });

  it("marks habits complete when every Perfect Day item is satisfied", () => {
    const state = buildTodayHabitsState(buildHabitSnapshot({ activeCount: 3, satisfiedCount: 3 }));

    expect(state.state).toBe("complete");
    expect(state.title).toBe("Habits");
    expect(state.actionLabel).toBe("Open");
    expect(state.progressPercent).toBe(100);
  });

  it("uses review instead of setup when only unsupported Habits exist", () => {
    const state = buildTodayHabitsState(
      buildHabitSnapshot({
        activeCount: 0,
        perfectDayItemCount: 0,
        satisfiedCount: 0,
        unsupportedHabits: [
          {
            id: "unsupported-1",
            title: "Future Habit",
            unsupportedFields: ["unknown_habit_type"],
          },
        ],
      })
    );

    expect(state).toMatchObject({
      state: "review",
      progressLabel: "1 habit needs review",
      progressPercent: null,
      href: "/my-library/habits",
      editHref: null,
    });
    expect(state.detail).toContain("history is preserved");
  });

  it("keeps supported progress visible without a complete tone for mixed Habits", () => {
    const snapshot = buildHabitSnapshot({
      activeCount: 2,
      perfectDayItemCount: 2,
      satisfiedCount: 2,
      unsupportedHabits: [
        {
          id: "unsupported-1",
          title: "Future Habit",
          unsupportedFields: ["unknown_definition_status"],
        },
      ],
    });
    const state = buildTodayHabitsState(snapshot);
    const actions = buildTodayRoutineQuickActions(
      {
        microPlanSchemaReady: true,
        microPlanLoadError: null,
        microPlan: null,
        recentSessions: [],
      },
      snapshot,
      new Date("2026-05-10T09:00:00.000Z")
    );

    expect(state).toMatchObject({
      state: "review",
      progressLabel: "1 habit needs review · 2/2 supported",
      progressPercent: null,
    });
    expect(actions[1]).toMatchObject({
      state: "review",
      subtitle: "1 habit needs review · 2/2 supported",
      href: "/my-library/habits?view=active#today-habits",
    });
    expect(actions[1]?.subtitle).not.toBe("Done today");
  });
});
