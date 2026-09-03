import { describe, expect, it } from "vitest";
import {
  buildCalendarHabitDayStatusState,
  buildMyLibraryCalendarDailyLayers,
  partitionCalendarHabitRows,
} from "@/lib/my-library/calendar-daily-layers";
import { buildHabitDefinitionView } from "@/lib/habits/shared";
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
        resetEvents: [buildReset({ habitId: "daily" })],
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

  it("renders a neutral not-tracked day without Habit outcome metrics", () => {
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: buildCalendarHabitDayStatusState([
          { review_date: "2026-06-10", day_status: "not_tracked", status: "reviewed" },
        ]),
      },
      microSessions: { status: "ready", plans: [] },
    });
    const habitLayer = layers["2026-06-10"]?.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({
      status: "mapped",
      tone: "muted",
      compactLabel: "Not tracked",
      metrics: [{ id: "habit_not_tracked", label: "Status", value: "Not tracked" }],
      stats: {
        habitPotentialDayCount: 1,
        habitIncludedDayCount: 0,
        habitNotTrackedDayCount: 1,
      },
    });
    expect(habitLayer?.metrics.map((metric) => metric.id)).not.toEqual(
      expect.arrayContaining(["habit_daily", "habit_due", "habit_rest", "habit_slips"])
    );
  });

  it("lets definition review win over a not-tracked Calendar day", () => {
    const layer = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 1, labels: ["Future habit"] },
        dayStatuses: {
          status: "ready",
          entries: [{ reviewDate: "2026-06-10", dayStatus: "not_tracked" }],
        },
      },
      microSessions: { status: "ready", plans: [] },
    })["2026-06-10"]?.find((item) => item.source === "habits");

    expect(layer).toMatchObject({
      status: "review",
      tone: "warning",
      compactLabel: "Habits review needed",
    });
    expect(layer?.metrics.map((metric) => metric.id)).toEqual([
      "habit_not_tracked",
      "habit_review",
    ]);
  });

  it.each([
    { cadencePeriod: "weekly" as const, todayDate: "2026-06-14" },
    { cadencePeriod: "monthly" as const, todayDate: "2026-06-30" },
  ])(
    "keeps a mid-period $cadencePeriod-any not-tracked day in raw Calendar coverage",
    ({ cadencePeriod, todayDate }) => {
      const anyCadenceHabit = buildHabit({
        id: `${cadencePeriod}-any-mid-period-gap`,
        title: `${cadencePeriod} twice`,
        cadencePeriod,
        cadenceDayPolicy: "any",
        cadenceTargetCount: 2,
        cadenceLabel: `2x/${cadencePeriod === "weekly" ? "week" : "month"} - any days`,
      });
      const layers = buildMyLibraryCalendarDailyLayers({
        dateKeys: ["2026-06-10"],
        todayDate,
        habits: {
          status: "ready",
          habits: [anyCadenceHabit],
          checkIns: [buildCheckIn({ habitId: anyCadenceHabit.id, checkInDate: "2026-06-08" })],
          resetEvents: [],
          unsupported: { count: 0, labels: [] },
          dayStatuses: {
            status: "ready",
            entries: [{ reviewDate: "2026-06-10", dayStatus: "not_tracked" }],
          },
        },
        microSessions: { status: "ready", plans: [] },
      });

      const habitLayer = layers["2026-06-10"]?.find((layer) => layer.source === "habits");

      expect(habitLayer).toMatchObject({
        compactLabel: "Not tracked",
        stats: {
          habitPotentialDayCount: 0,
          habitIncludedDayCount: 0,
          habitNotTrackedDayCount: 1,
        },
      });
      expect(habitLayer?.metrics).toEqual([
        expect.objectContaining({ id: "habit_not_tracked", value: "Not tracked" }),
      ]);
    }
  );

  it("keeps an uncertain any-day period end outside Calendar performance", () => {
    const weeklyAny = buildHabit({
      id: "weekly-any-gap",
      title: "Weekly twice",
      cadencePeriod: "weekly",
      cadenceDayPolicy: "any",
      cadenceTargetCount: 2,
      cadenceLabel: "2x/week - any days",
    });
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-14"],
      todayDate: "2026-06-14",
      habits: {
        status: "ready",
        habits: [weeklyAny],
        checkIns: [buildCheckIn({ habitId: weeklyAny.id, checkInDate: "2026-06-08" })],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: {
          status: "ready",
          entries: [{ reviewDate: "2026-06-10", dayStatus: "not_tracked" }],
        },
      },
      microSessions: { status: "ready", plans: [] },
    });

    const layer = layers["2026-06-14"]?.find((candidate) => candidate.source === "habits");
    expect(layer).toMatchObject({
      status: "mapped",
      tone: "muted",
      compactLabel: "Tracking incomplete",
      stats: {
        habitPotentialDayCount: 1,
        habitIncludedDayCount: 0,
        habitNotTrackedDayCount: 0,
        weeklyHabitCompletedCount: 0,
        weeklyHabitTotalCount: 0,
      },
    });
    expect(layer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "habit_tracking_incomplete",
          value: "Tracking incomplete",
        }),
      ])
    );
    expect(layer?.metrics.find((metric) => metric.id === "habit_weekly_total")).toBeUndefined();
  });

  it("ignores any-day status evidence from before the Habit started", () => {
    const weeklyAny = buildHabit({
      id: "weekly-starts-friday",
      title: "Weekly twice from Friday",
      startDate: "2026-06-12",
      cadencePeriod: "weekly",
      cadenceDayPolicy: "any",
      cadenceTargetCount: 2,
      cadenceLabel: "2x/week - any days",
    });
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-14"],
      todayDate: "2026-06-14",
      habits: {
        status: "ready",
        habits: [weeklyAny],
        checkIns: [buildCheckIn({ habitId: weeklyAny.id, checkInDate: "2026-06-12" })],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: {
          status: "ready",
          entries: [{ reviewDate: "2026-06-09", dayStatus: "not_tracked" }],
        },
      },
      microSessions: { status: "ready", plans: [] },
    });

    const layer = layers["2026-06-14"]?.find((candidate) => candidate.source === "habits");

    expect(layer?.stats).toMatchObject({
      habitPotentialDayCount: 1,
      habitIncludedDayCount: 1,
      weeklyHabitCompletedCount: 1,
      weeklyHabitTotalCount: 2,
    });
    expect(layer?.metrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "habit_weekly_total", value: "1/2" })])
    );
    expect(
      layer?.metrics.find((metric) => metric.id === "habit_tracking_incomplete")
    ).toBeUndefined();
    expect(JSON.stringify(layer)).not.toContain("Tracking incomplete");
  });

  it("prefers a supported check-in and fails closed for unavailable or unknown day status", () => {
    const overridden = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [buildCheckIn()],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: buildCalendarHabitDayStatusState([
          { review_date: "2026-06-10", day_status: "not_tracked", status: "reviewed" },
        ]),
      },
      microSessions: { status: "ready", plans: [] },
    });
    expect(overridden["2026-06-10"]?.find((layer) => layer.source === "habits")).toMatchObject({
      compactLabel: "1/1 habits",
    });

    const unavailable = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: { status: "error" },
      },
      microSessions: { status: "ready", plans: [] },
    });
    expect(unavailable["2026-06-10"]?.find((layer) => layer.source === "habits")).toMatchObject({
      status: "error",
      metrics: [],
    });

    const unknown = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: buildCalendarHabitDayStatusState([
          { review_date: "2026-06-10", day_status: "future_status", status: "reviewed" },
        ]),
      },
      microSessions: { status: "ready", plans: [] },
    });
    const unknownLayer = unknown["2026-06-10"]?.find((layer) => layer.source === "habits");
    expect(unknownLayer).toMatchObject({ status: "review", metrics: [expect.any(Object)] });
    expect(JSON.stringify(unknownLayer)).not.toContain("future_status");

    const unknownWorkflow = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: buildCalendarHabitDayStatusState([
          {
            review_date: "2026-06-10",
            day_status: "not_tracked",
            status: "future_workflow_status",
          },
        ]),
      },
      microSessions: { status: "ready", plans: [] },
    });
    const unknownWorkflowLayer = unknownWorkflow["2026-06-10"]?.find(
      (layer) => layer.source === "habits"
    );
    expect(unknownWorkflowLayer).toMatchObject({
      status: "review",
      metrics: [expect.objectContaining({ value: "Needs review" })],
    });
    expect(JSON.stringify(unknownWorkflowLayer)).not.toContain("future_workflow_status");
  });

  it.each([
    { readerStatus: "error" as const, checkInStatus: "logged" as const },
    { readerStatus: "schema_missing" as const, checkInStatus: "skipped" as const },
  ])(
    "fails closed for a supported $checkInStatus check-in when the day-status reader is $readerStatus",
    ({ readerStatus, checkInStatus }) => {
      const layers = buildMyLibraryCalendarDailyLayers({
        dateKeys: ["2026-06-10"],
        todayDate: "2026-06-10",
        habits: {
          status: "ready",
          habits: [buildHabit()],
          checkIns: [
            buildCheckIn({
              status: checkInStatus,
              valueBoolean: checkInStatus === "logged" ? true : null,
              completedAt: checkInStatus === "logged" ? "2026-06-10T08:00:00.000Z" : null,
            }),
          ],
          resetEvents: [],
          unsupported: { count: 0, labels: [] },
          dayStatuses: { status: readerStatus },
        },
        microSessions: { status: "ready", plans: [] },
      });

      const habitLayer = layers["2026-06-10"]?.find((layer) => layer.source === "habits");

      expect(habitLayer).toMatchObject({ status: readerStatus, metrics: [] });
    }
  );

  it("does not let an unrelated same-day check-in mask missing any-day period evidence", () => {
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-14"],
      todayDate: "2026-06-14",
      habits: {
        status: "ready",
        habits: [
          buildHabit({ id: "daily" }),
          buildHabit({
            id: "weekly-any",
            cadencePeriod: "weekly",
            cadenceTargetCount: 2,
            cadenceDayPolicy: "any",
            cadenceLabel: "2 times per week",
          }),
        ],
        checkIns: [buildCheckIn({ habitId: "daily", checkInDate: "2026-06-14" })],
        resetEvents: [],
        unsupported: { count: 0, labels: [] },
        dayStatuses: { status: "error" },
      },
      microSessions: { status: "ready", plans: [] },
    });

    expect(layers["2026-06-14"]?.find((layer) => layer.source === "habits")).toMatchObject({
      status: "error",
      metrics: [],
    });
  });

  it("uses the shared definition boundary for legacy cadence and future Habit fields", () => {
    const partitioned = partitionCalendarHabitRows([
      buildHabitRow({ id: "supported", title: "Supported habit" }),
      buildHabitRow({
        id: "legacy-cadence",
        title: "Legacy cadence habit",
        cadence_period: null,
        cadence_target_count: null,
        cadence_day_policy: null,
        schedule_days: ["monday", "wednesday", "friday"],
      } as unknown as Partial<HabitDefinitionRow>),
      buildHabitRow({
        id: "unsupported",
        title: "Quarterly habit",
        cadence_period: "quarterly",
      }),
      buildHabitRow({
        id: "unknown-category",
        title: "Future category habit",
        category: "future_category",
      }),
      buildHabitRow({
        id: "invalid-schedule",
        title: "Duplicate schedule habit",
        schedule_days: ["monday", "monday"],
      }),
      buildHabitRow({
        id: "unknown-type",
        title: "Future type habit",
        habit_type: "future_type",
      }),
      buildHabitRow({
        id: "unknown-mode",
        title: "Future mode habit",
        habit_mode: "future_mode",
      }),
      buildHabitRow({
        id: "unknown-status",
        title: "Future status habit",
        status: "future_status",
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

    expect(partitioned.usableRows.map((row) => row.id)).toEqual(["supported", "legacy-cadence"]);
    expect(buildHabitDefinitionView(partitioned.usableRows[1])).toMatchObject({
      cadencePeriod: "weekly",
      cadenceTargetCount: 3,
      cadenceDayPolicy: "fixed",
      scheduleDays: ["monday", "wednesday", "friday"],
    });
    expect(partitioned.unsupported).toMatchObject({
      count: 6,
      labels: ["Quarterly habit", "Future category habit", "Duplicate schedule habit"],
    });
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
    expect(JSON.stringify(reviewLayers)).not.toContain("future_category");
  });

  it("keeps supported progress visible while making mixed Habit truth a review state", () => {
    const layers = buildMyLibraryCalendarDailyLayers({
      dateKeys: ["2026-06-10"],
      todayDate: "2026-06-10",
      habits: {
        status: "ready",
        habits: [buildHabit()],
        checkIns: [
          buildCheckIn(),
          buildCheckIn({
            id: "unsupported-rest",
            habitId: "unsupported-habit",
            status: "skipped",
            valueBoolean: null,
            completedAt: null,
          }),
        ],
        resetEvents: [buildReset({ id: "unsupported-reset", habitId: "unsupported-habit" })],
        unsupported: { count: 1, labels: ["Future habit"] },
      },
      microSessions: { status: "ready", plans: [] },
    });

    const habitLayer = layers["2026-06-10"]?.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({
      status: "review",
      tone: "warning",
      compactLabel: "1/1 habits · review",
    });
    expect(habitLayer?.summary).toContain("1/1 daily habits on track for this day.");
    expect(habitLayer?.summary).toContain(
      "Some Habits need review before Calendar can count them."
    );
    expect(habitLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "habit_daily", value: "1/1" }),
        expect.objectContaining({ id: "habit_review", label: "Needs review", value: "1 habit" }),
      ])
    );
    expect(habitLayer?.metrics.find((metric) => metric.id === "habit_rest")).toMatchObject({
      value: "0 days",
    });
    expect(habitLayer?.metrics.find((metric) => metric.id === "habit_resets")).toBeUndefined();
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
