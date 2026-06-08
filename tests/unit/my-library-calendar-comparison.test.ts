import { describe, expect, it } from "vitest";
import {
  buildDrylandCalendarComparisonSource,
  buildHabitsCalendarComparisonSource,
  buildMicroSessionsCalendarComparisonSource,
} from "@/lib/my-library/calendar-comparison";
import { buildMyLibraryCalendarComparisonWindow } from "@/lib/my-library/calendar";
import type {
  HabitCheckInView,
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
    startDate: "2026-05-01",
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
    sortOrder: 0,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildCheckIn(overrides: Partial<HabitCheckInView> = {}): HabitCheckInView {
  return {
    id: `check-${overrides.checkInDate ?? "2026-06-02"}`,
    habitId: "habit-1",
    checkInDate: "2026-06-02",
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
    completedAt: "2026-06-02T08:00:00.000Z",
    createdAt: "2026-06-02T08:00:00.000Z",
    updatedAt: "2026-06-02T08:00:00.000Z",
    ...overrides,
  };
}

function buildReset(overrides: Partial<HabitMotivationResetView> = {}): HabitMotivationResetView {
  return {
    id: `reset-${overrides.effectiveDate ?? "2026-06-04"}`,
    habitId: "habit-1",
    resetType: "reset_stats",
    status: "active",
    effectiveDate: "2026-06-04",
    createdAt: "2026-06-04T08:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
}

const window = buildMyLibraryCalendarComparisonWindow({
  selectedDate: "2026-06-05",
  todayDate: "2026-06-05",
  period: "week",
});

describe("my library calendar comparison", () => {
  it("builds Habits metrics from existing check-ins only", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [
        buildHabit(),
        buildHabit({
          id: "habit-2",
          title: "Water",
          isPerfectDayItem: false,
          sortOrder: 1,
        }),
      ],
      checkIns: [
        buildCheckIn({ checkInDate: "2026-06-02" }),
        buildCheckIn({
          id: "rest-1",
          checkInDate: "2026-06-03",
          valueBoolean: null,
          status: "skipped",
          completedAt: null,
        }),
        buildCheckIn({
          id: "previous-1",
          checkInDate: "2026-05-27",
          completedAt: "2026-05-27T08:00:00.000Z",
        }),
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(source.details).toEqual([
      {
        id: "active_habits",
        label: "Active habits",
        value: "2 habits",
      },
      {
        id: "included_habits",
        label: "Included habits",
        value: "Morning mobility",
        supportLabel: "Only active perfect-day habits are included in on-target comparison.",
      },
      {
        id: "tracked_days",
        label: "Tracked days",
        value: "4 days",
      },
      {
        id: "habit_reset_markers",
        label: "Habit resets",
        value: "0 markers",
        supportLabel:
          "Reset stats markers restart motivation stats but are not counted as completed habits, rest days, or slips.",
      },
    ]);
    expect(source.metrics.find((metric) => metric.id === "habit_perfect_days")).toMatchObject({
      currentLabel: "1 day",
      comparisonLabel: "1 day",
      deltaLabel: "No change",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_rest_slips")).toMatchObject({
      currentLabel: "1 rest / 0 slips",
      comparisonLabel: "0 rest / 0 slips",
    });
  });

  it("reports Habits reset-stats markers without counting them as completions", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [buildHabit()],
      checkIns: [buildCheckIn({ checkInDate: "2026-06-02" })],
      resetEvents: [
        buildReset({ effectiveDate: "2026-06-04" }),
        buildReset({
          id: "previous-reset",
          effectiveDate: "2026-05-27",
          createdAt: "2026-05-27T08:00:00.000Z",
        }),
      ],
      window,
    });

    expect(source.details?.find((detail) => detail.id === "habit_reset_markers")).toMatchObject({
      label: "Habit resets",
      value: "1 marker",
    });
    expect(
      source.metrics.find((metric) => metric.id === "habit_reset_markers_metric")
    ).toMatchObject({
      currentLabel: "1 marker",
      comparisonLabel: "1 marker",
      deltaLabel: "Markers only",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_on_target_slots")).toMatchObject({
      currentLabel: "1/5",
      comparisonLabel: "0/5",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_rest_slips")).toMatchObject({
      currentLabel: "0 rest / 0 slips",
      comparisonLabel: "0 rest / 0 slips",
    });
  });

  it("formats Habits percent and timed-minute deltas without technical abbreviations or float noise", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [
        buildHabit({
          habitMode: "timed",
          habitType: "duration",
          targetValueNumeric: 1,
          targetUnit: "minutes",
          targetLabel: "1 minute",
          timerEnabled: true,
          timerTargetSeconds: 60,
        }),
      ],
      checkIns: [
        buildCheckIn({
          checkInDate: "2026-06-02",
          valueBoolean: null,
          valueNumeric: 69.60000000000001,
        }),
        buildCheckIn({
          id: "previous-timed",
          checkInDate: "2026-05-27",
          completedAt: "2026-05-27T08:00:00.000Z",
          valueBoolean: null,
          valueNumeric: 83.39,
        }),
      ],
      window,
    });

    expect(source.metrics.find((metric) => metric.id === "habit_completion_average")).toMatchObject(
      {
        deltaLabel: "No change",
      }
    );
    expect(source.metrics.find((metric) => metric.id === "habit_timed_minutes")).toMatchObject({
      currentLabel: "69.6 minutes",
      comparisonLabel: "83.39 minutes",
      deltaLabel: "-13.79 minutes",
    });
  });

  it("builds Dryland metrics from completed session dates", () => {
    const source = buildDrylandCalendarComparisonSource({
      events: [
        {
          status: "completed",
          completedAt: "2026-06-02T10:00:00.000Z",
          actualDurationSeconds: 1800,
        },
        {
          status: "completed",
          completedAt: "2026-06-04T10:00:00.000Z",
          actualDurationSeconds: 1200,
        },
        {
          status: "completed",
          completedAt: "2026-05-27T10:00:00.000Z",
          actualDurationSeconds: 600,
        },
        {
          status: "draft",
          completedAt: null,
          actualDurationSeconds: null,
        },
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(
      source.metrics.find((metric) => metric.id === "dryland_completed_sessions")
    ).toMatchObject({
      currentLabel: "2 sessions",
      comparisonLabel: "1 session",
      deltaLabel: "+1 session",
    });
    expect(source.metrics.find((metric) => metric.id === "dryland_minutes")).toMatchObject({
      currentLabel: "50 minutes",
      comparisonLabel: "10 minutes",
      deltaLabel: "+40 minutes",
    });
    expect(source.supportLabel).toContain("Strength sets/reps/load");
  });

  it("builds Micro Sessions metrics from completed and skipped micro block dates", () => {
    const source = buildMicroSessionsCalendarComparisonSource({
      plans: [
        {
          blocks: [
            {
              status: "completed",
              completedAt: "2026-06-02T07:00:00.000Z",
              skippedAt: null,
            },
            {
              status: "skipped",
              completedAt: null,
              skippedAt: "2026-06-03T07:00:00.000Z",
            },
            {
              status: "completed",
              completedAt: "2026-05-27T07:00:00.000Z",
              skippedAt: null,
            },
          ],
        },
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(source.metrics.find((metric) => metric.id === "micro_completed_units")).toMatchObject({
      label: "Completed micro blocks",
      currentLabel: "1 micro block",
      comparisonLabel: "1 micro block",
      deltaLabel: "No change",
    });
    expect(source.metrics.find((metric) => metric.id === "micro_skipped_units")).toMatchObject({
      label: "Skipped micro blocks",
      currentLabel: "1 micro block",
      comparisonLabel: "0 micro blocks",
      deltaLabel: "+1 micro block",
      tone: "negative",
    });
    expect(source.supportLabel).toContain("Queued future blocks are not counted.");
  });
});
