import { describe, expect, it } from "vitest";
import {
  buildMyLibraryCalendarDailyLayers,
  partitionCalendarHabitRows,
} from "@/lib/my-library/calendar-daily-layers";
import type {
  HabitCheckInView,
  HabitDefinitionRow,
  HabitDefinitionView,
  HabitMotivationResetView,
} from "@/lib/habits/shared";

function buildHabit(overrides: Partial<HabitDefinitionView> = {}): HabitDefinitionView {
  return {
    id: "habit-1",
    title: "Morning mobility",
    notes: null,
    habitMode: "build",
    habitType: "binary",
    category: "movement",
    targetOperator: "at_least",
    targetValueNumeric: null,
    targetUnit: null,
    targetTime: null,
    targetLabel: "Done",
    startDate: "2026-06-01",
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
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildCheckIn(overrides: Partial<HabitCheckInView> = {}): HabitCheckInView {
  return {
    id: `check-${overrides.habitId ?? "habit-1"}-${overrides.checkInDate ?? "2026-06-10"}`,
    habitId: "habit-1",
    checkInDate: "2026-06-10",
    timezone: "Europe/Oslo",
    valueNumeric: null,
    valueBoolean: true,
    valueTime: null,
    timerSeconds: 0,
    manualMinutes: 0,
    legacyTimedSeconds: 0,
    note: null,
    status: "logged",
    sourceKind: "manual",
    sourceDrylandMicroPlanId: null,
    sourceMicroBlockId: null,
    sourceCompletedAt: null,
    completedAt: "2026-06-10T08:00:00.000Z",
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-06-10T08:00:00.000Z",
    ...overrides,
  };
}

function buildReset(overrides: Partial<HabitMotivationResetView> = {}): HabitMotivationResetView {
  return {
    id: "reset-1",
    habitId: "habit-1",
    resetType: "reset_stats",
    status: "active",
    effectiveDate: "2026-06-10",
    createdAt: "2026-06-10T09:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
}

function buildHabitRow(overrides: Partial<HabitDefinitionRow> = {}): HabitDefinitionRow {
  return {
    id: "habit-row-1",
    user_id: "user-1",
    title: "Unsupported habit",
    notes: null,
    habit_mode: "build",
    habit_type: "binary",
    category: "movement",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
    start_date: "2026-06-01",
    last_lapse_date: null,
    timer_enabled: false,
    timer_target_seconds: null,
    cadence_period: "daily",
    cadence_target_count: 1,
    cadence_day_policy: "fixed",
    schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    is_perfect_day_item: true,
    status: "active",
    sort_order: 0,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("my library calendar daily layers", () => {
  it("preserves daily, weekly fixed-day, weekly any-day, and monthly any-day Habit cadence", () => {
    const daily = buildHabit({ id: "daily", title: "Daily mobility" });
    const weeklyFixed = buildHabit({
      id: "weekly-fixed",
      title: "Weekly fixed",
      cadencePeriod: "weekly",
      cadenceDayPolicy: "fixed",
      cadenceTargetCount: 1,
      cadenceLabel: "Weekly - 1 fixed day",
      scheduleDays: ["wednesday"],
      sortOrder: 1,
    });
    const weeklyAny = buildHabit({
      id: "weekly-any",
      title: "Weekly any",
      cadencePeriod: "weekly",
      cadenceDayPolicy: "any",
      cadenceTargetCount: 2,
      cadenceLabel: "2x/week - any days",
      sortOrder: 2,
    });
    const monthlyAny = buildHabit({
      id: "monthly-any",
      title: "Monthly review",
      cadencePeriod: "monthly",
      cadenceDayPolicy: "any",
      cadenceTargetCount: 1,
      cadenceLabel: "1x/month - any day",
      sortOrder: 3,
    });

    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-02", "2026-06-09", "2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [daily, weeklyFixed, weeklyAny, monthlyAny],
        checkIns: [
          buildCheckIn({ habitId: "daily" }),
          buildCheckIn({ habitId: "weekly-any", checkInDate: "2026-06-08" }),
          buildCheckIn({ habitId: "weekly-any", checkInDate: "2026-06-09" }),
          buildCheckIn({ habitId: "monthly-any", checkInDate: "2026-06-02" }),
        ],
        resetEvents: [buildReset()],
        unsupported: { count: 0, labels: [] },
      },
      microSessions: { status: "ready", plans: [] },
    });

    const monthlyAnyCompletionLayer = layers["2026-06-02"]?.find(
      (layer) => layer.source === "habits"
    );
    const weeklyAnyCompletionLayer = layers["2026-06-09"]?.find(
      (layer) => layer.source === "habits"
    );
    const habitLayer = layers["2026-06-10"]?.find((layer) => layer.source === "habits");
    const sources = layers["2026-06-10"]?.map((layer) => layer.source);

    expect(monthlyAnyCompletionLayer).toMatchObject({
      status: "mapped",
      compactLabel: "0/1 habits",
    });
    expect(monthlyAnyCompletionLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "habit_monthly_completed_today", value: "1 habit" }),
      ])
    );
    expect(weeklyAnyCompletionLayer).toMatchObject({
      status: "mapped",
      compactLabel: "0/1 habits",
    });
    expect(weeklyAnyCompletionLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "habit_weekly_completed_today", value: "1 habit" }),
      ])
    );
    expect(habitLayer).toMatchObject({
      status: "mapped",
      compactLabel: "1/1 habits",
      summary: "1/1 daily habits on track for this day.",
    });
    expect(habitLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "habit_daily", value: "1/1" }),
        expect.objectContaining({ id: "habit_due", value: "0 habits" }),
        expect.objectContaining({ id: "habit_weekly_total", value: "2/3" }),
        expect.objectContaining({ id: "habit_resets", value: "1 marker" }),
      ])
    );
    expect(habitLayer?.stats).toMatchObject({
      dailyHabitCompletedCount: 1,
      dailyHabitTotalCount: 1,
      weeklyHabitCompletedCount: 2,
      weeklyHabitTotalCount: 3,
    });
    expect(sources).toEqual(["habits", "micro_sessions"]);
  });

  it("does not count future Habits or unknown Habit cadence values", () => {
    const partitioned = partitionCalendarHabitRows([
      buildHabitRow({ id: "supported", title: "Supported habit" }),
      buildHabitRow({
        id: "unsupported",
        title: "Quarterly habit",
        cadence_period: "quarterly",
      }),
    ]);
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-12"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [],
        checkIns: [],
        resetEvents: [],
        unsupported: partitioned.unsupported,
      },
      microSessions: { status: "ready", plans: [] },
    });

    expect(partitioned.supportedRows.map((row) => row.id)).toEqual(["supported"]);
    expect(partitioned.unsupported).toMatchObject({ count: 1, labels: ["Quarterly habit"] });
    expect(layers["2026-06-12"]?.find((layer) => layer.source === "habits")).toMatchObject({
      status: "future",
      compactLabel: "Habits future",
    });
    expect(layers["2026-06-12"]?.map((layer) => layer.source)).toEqual([
      "habits",
      "micro_sessions",
    ]);

    const reviewLayers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [],
        checkIns: [],
        resetEvents: [],
        unsupported: partitioned.unsupported,
      },
      microSessions: { status: "ready", plans: [] },
    });
    expect(reviewLayers["2026-06-10"]?.find((layer) => layer.source === "habits")).toMatchObject({
      status: "review",
      compactLabel: "Habits review needed",
    });
  });

  it("counts completed and skipped Micro Session blocks by date and reviews unknown statuses", () => {
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
      },
      microSessions: {
        status: "ready",
        plans: [
          {
            id: "plan-1",
            blocks: [
              {
                id: "completed",
                status: "completed",
                completedAt: "2026-06-10T07:00:00.000Z",
                skippedAt: null,
                sourceExerciseId: "exercise-1",
                title: "Split squat",
                targetType: "reps",
                targetValue: 12,
                loadKg: 20,
              },
              {
                id: "skipped",
                status: "skipped",
                completedAt: null,
                skippedAt: "2026-06-10T08:00:00.000Z",
              },
              {
                id: "future",
                status: "queued",
                completedAt: null,
                skippedAt: null,
              },
              {
                id: "unknown",
                status: "paused",
                completedAt: null,
                skippedAt: null,
              },
            ],
          },
        ],
      },
    });

    const microLayer = layers["2026-06-10"]?.find((layer) => layer.source === "micro_sessions");

    expect(microLayer).toMatchObject({
      status: "mapped",
      compactLabel: "1 micro unit",
    });
    expect(microLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "micro_completed", value: "1 unit" }),
        expect.objectContaining({ id: "micro_exercises", value: "1" }),
        expect.objectContaining({ id: "micro_reps", value: "12" }),
        expect.objectContaining({ id: "micro_load", value: "240 kg" }),
        expect.objectContaining({ id: "micro_skipped", value: "1 unit" }),
        expect.objectContaining({ id: "micro_review", value: "1 unit" }),
      ])
    );
    expect(microLayer?.stats).toMatchObject({
      microCompletedUnitCount: 1,
      microExerciseKeys: ["exercise-1"],
      microRepsTotal: 12,
      microLoadKgTotal: 240,
    });

    const reviewOnlyLayers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
      },
      microSessions: {
        status: "ready",
        plans: [{ id: "plan-review", blocks: [{ id: "unknown", status: "paused" }] }],
      },
    });
    expect(
      reviewOnlyLayers["2026-06-10"]?.find((layer) => layer.source === "micro_sessions")
    ).toMatchObject({
      status: "review",
      compactLabel: "Micro review needed",
    });
  });
});
