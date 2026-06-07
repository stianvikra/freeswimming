import { describe, expect, it } from "vitest";
import {
  buildHabitCheckInInsert,
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionInsert,
  buildHabitDefinitionView,
  buildHabitMotivationResetInsert,
  buildHabitMotivationResetView,
  buildHabitMotivationSummary,
  buildHabitWeekSummary,
  getHabitMotivationRangeStartDate,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitMotivationResetRow,
} from "@/lib/habits/shared";

function buildHabitRow(overrides: Partial<HabitDefinitionRow>): HabitDefinitionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    title: "Read",
    notes: null,
    habit_mode: "build",
    habit_type: "binary",
    category: "learning",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
    start_date: "2026-05-04",
    last_lapse_date: null,
    timer_enabled: false,
    timer_target_seconds: null,
    cadence_period: "daily",
    cadence_target_count: 1,
    cadence_day_policy: "fixed",
    schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    is_perfect_day_item: true,
    status: "active",
    sort_order: 1,
    created_at: "2026-05-10T08:00:00.000Z",
    updated_at: "2026-05-10T08:00:00.000Z",
    ...overrides,
  };
}

function buildCheckInRow(overrides: Partial<HabitCheckInRow>): HabitCheckInRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    habit_id: "11111111-1111-4111-8111-111111111111",
    check_in_date: "2026-05-10",
    timezone: "Europe/Oslo",
    value_numeric: null,
    value_boolean: true,
    value_time: null,
    note: null,
    status: "logged",
    completed_at: "2026-05-10T09:00:00.000Z",
    created_at: "2026-05-10T09:00:00.000Z",
    updated_at: "2026-05-10T09:00:00.000Z",
    timer_seconds: 0,
    manual_minutes: 0,
    ...overrides,
  };
}

function buildResetRow(overrides: Partial<HabitMotivationResetRow>): HabitMotivationResetRow {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    user_id: "user-1",
    habit_id: "11111111-1111-4111-8111-111111111111",
    reset_type: "reset_stats",
    status: "active",
    effective_date: "2026-05-05",
    created_by: "user-1",
    created_at: "2026-05-05T08:00:00.000Z",
    ...overrides,
  };
}

describe("habits domain helpers", () => {
  it("builds avoidance habits as at-most raw targets", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "No sugar",
        habitType: "avoidance",
        category: "nutrition",
        targetValueNumeric: 0,
        targetUnit: "times",
      },
      2
    );

    expect(insert).toMatchObject({
      user_id: "user-1",
      title: "No sugar",
      habit_type: "avoidance",
      category: "nutrition",
      target_operator: "at_most",
      target_value_numeric: 0,
      target_unit: "times",
      is_perfect_day_item: true,
      sort_order: 2,
    });
  });

  it("builds quit habits with start dates and days-since evaluation", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Eating chips",
        habitMode: "quit",
        category: "nutrition",
        startDate: "2026-05-07",
        selectedDate: "2026-05-10",
      },
      3
    );
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: insert.habit_mode,
        habit_type: insert.habit_type,
        category: insert.category,
        target_operator: insert.target_operator,
        target_value_numeric: insert.target_value_numeric,
        target_unit: insert.target_unit,
        start_date: insert.start_date,
        last_lapse_date: null,
      })
    );

    const summary = buildHabitDaySummary([habit], [], "2026-05-10");

    expect(insert).toMatchObject({
      habit_mode: "quit",
      habit_type: "avoidance",
      target_operator: "at_most",
      target_value_numeric: 0,
      start_date: "2026-05-07",
      timer_enabled: false,
    });
    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.items[0]?.evaluation.valueLabel).toBe("3 days without");
  });

  it("treats a quit lapse as explicit same-day miss without rewriting the habit start", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-07",
        last_lapse_date: "2026-05-10",
      })
    );
    const lapse = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [lapse], "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(0);
    expect(summary.items[0]?.evaluation.stateLabel).toBe("Slip logged today");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("3/4 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBeNull();
  });

  it("keeps quit progress visible after an earlier slip while hiding short current streaks", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-06",
      })
    );
    const earlierSlip = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-06",
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [earlierSlip], "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.items[0]?.evaluation.stateLabel).toBe("Clear today");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("9/10 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBeNull();
  });

  it("shows quit current streak once it reaches five days", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-05",
      })
    );
    const earlierSlip = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-05",
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [earlierSlip], "2026-05-10");

    expect(summary.items[0]?.evaluation.valueLabel).toBe("9/10 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBe("Current streak 5 days");
  });

  it("shows build streak motivation for open daily habits with prior completions", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        habit_mode: "build",
        habit_type: "binary",
        start_date: "2026-05-04",
      })
    );
    const checkIns = [
      "2026-05-04",
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
      "2026-05-08",
      "2026-05-09",
    ].map((date, index) =>
      buildHabitCheckInView(
        buildCheckInRow({
          id: `build-streak-${index}`,
          habit_id: habit.id,
          check_in_date: date,
        })
      )
    );

    const summary = buildHabitDaySummary([habit], checkIns, "2026-05-10");

    expect(summary.items[0]?.evaluation.stateLabel).toBe("Open");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("6-day streak");
    expect(summary.items[0]?.evaluation.supportingLabel).toBe("6/7 days hit");
  });

  it("builds advanced motivation history with perfect-day streaks and rest days", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-05-01",
      })
    );
    const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
      (date, index) =>
        buildHabitCheckInView(
          buildCheckInRow({
            id: `history-done-${index}`,
            habit_id: habit.id,
            check_in_date: date,
          })
        )
    );
    checkIns.push(
      buildHabitCheckInView(
        buildCheckInRow({
          id: "history-rest",
          habit_id: habit.id,
          check_in_date: "2026-05-04",
          value_boolean: null,
          status: "skipped",
          completed_at: null,
        })
      )
    );

    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-07");

    expect(summary.bestStreakDays).toBe(5);
    expect(summary.currentStreakDays).toBe(5);
    expect(summary.restDayCount).toBe(1);
    expect(summary.consistencyPercent).toBe(83);
    expect(summary.habitScore).toBeNull();
    expect(summary.items[0]).toMatchObject({
      habitId: habit.id,
      eligibleDayCount: 6,
      onTrackDayCount: 5,
      restDayCount: 1,
      bestStreakDays: 5,
      currentStreakDays: 5,
    });
  });

  it("builds motivation history from an explicit period boundary", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-04-01",
      })
    );
    const checkIns = ["2026-04-01", "2026-04-02", "2026-05-06", "2026-05-07"].map((date, index) =>
      buildHabitCheckInView(
        buildCheckInRow({
          id: `period-done-${index}`,
          habit_id: habit.id,
          check_in_date: date,
        })
      )
    );

    const allTime = buildHabitMotivationSummary([habit], checkIns, "2026-05-07");
    const month = buildHabitMotivationSummary([habit], checkIns, "2026-05-07", {
      historyStartDate: getHabitMotivationRangeStartDate("month", "2026-05-07"),
    });

    expect(allTime.historyStartDate).toBe("2026-04-01");
    expect(allTime.eligibleDayCount).toBe(37);
    expect(allTime.onTrackDayCount).toBe(4);
    expect(month.historyStartDate).toBe("2026-04-08");
    expect(month.eligibleDayCount).toBe(30);
    expect(month.onTrackDayCount).toBe(2);
    expect(month.currentStreakDays).toBe(2);
  });

  it("restarts motivation stats from the latest active reset-stats boundary", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-05-01",
      })
    );
    const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
      (date, index) =>
        buildHabitCheckInView(
          buildCheckInRow({
            id: `reset-done-${index}`,
            habit_id: habit.id,
            check_in_date: date,
          })
        )
    );
    const resetEvents = [
      buildHabitMotivationResetView(
        buildResetRow({
          id: "88888888-8888-4888-8888-888888888888",
          effective_date: "2026-05-03",
          created_at: "2026-05-03T08:00:00.000Z",
        })
      ),
      buildHabitMotivationResetView(
        buildResetRow({
          effective_date: "2026-05-05",
          created_at: "2026-05-05T08:00:00.000Z",
        })
      ),
      buildHabitMotivationResetView(
        buildResetRow({
          id: "77777777-7777-4777-8777-777777777777",
          status: "voided",
          effective_date: "2026-05-06",
          created_at: "2026-05-06T08:00:00.000Z",
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-07", {
      resetEvents,
    });
    const item = summary.items[0];

    expect(summary.eligibleDayCount).toBe(3);
    expect(summary.onTrackDayCount).toBe(2);
    expect(summary.currentStreakDays).toBe(2);
    expect(summary.bestStreakDays).toBe(2);
    expect(item).toMatchObject({
      motivationStartDate: "2026-05-05",
      eligibleDayCount: 3,
      onTrackDayCount: 2,
      currentStreakDays: 2,
      bestStreakDays: 2,
    });
    expect(item?.resetBoundary).toMatchObject({
      effectiveDate: "2026-05-05",
    });
    expect(item?.beforeResetSummary).toMatchObject({
      historyStartDate: "2026-05-01",
      historyEndDate: "2026-05-04",
      savedCheckInCount: 3,
      lastTrackedDate: "2026-05-03",
    });
  });

  it("builds owner-bound reset-stats reset inserts with date guards", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        start_date: "2026-05-04",
      })
    );

    expect(
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-10" },
        "2026-05-10"
      )
    ).toMatchObject({
      user_id: "user-1",
      habit_id: habit.id,
      reset_type: "reset_stats",
      status: "active",
      effective_date: "2026-05-10",
      created_by: "user-1",
    });

    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        { ...habit, status: "archived" },
        { effectiveDate: "2026-05-10" },
        "2026-05-10"
      )
    ).toThrow("Reset stats is only available for active habits.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-11" },
        "2026-05-10"
      )
    ).toThrow("Choose today or an earlier reset date.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-03" },
        "2026-05-10"
      )
    ).toThrow("Choose a reset date on or after the habit start date.");
  });

  it("counts quit slips and archived habit history without active mutations", () => {
    const activeQuit = buildHabitDefinitionView(
      buildHabitRow({
        title: "No sweets",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-03",
      })
    );
    const archived = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Old mobility",
        start_date: "2026-05-01",
        status: "archived",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          id: "quit-slip",
          habit_id: activeQuit.id,
          check_in_date: "2026-05-03",
          value_boolean: false,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          id: "archived-done",
          habit_id: archived.id,
          check_in_date: "2026-05-02",
          value_boolean: true,
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([activeQuit, archived], checkIns, "2026-05-05");

    expect(summary.activeHabitCount).toBe(1);
    expect(summary.archivedHabitCount).toBe(1);
    expect(summary.slipCount).toBe(1);
    expect(summary.items.find((item) => item.habitId === archived.id)).toMatchObject({
      status: "archived",
      onTrackDayCount: 1,
      bestStreakDays: 1,
    });
  });

  it("totals timed and count history from canonical check-ins", () => {
    const timed = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Mobility",
        habit_mode: "timed",
        habit_type: "duration",
        target_value_numeric: 10,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 600,
      })
    );
    const count = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Water",
        habit_type: "count",
        target_value_numeric: 2,
        target_unit: "litres",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          id: "timed-source",
          habit_id: timed.id,
          value_boolean: null,
          value_numeric: 12,
          timer_seconds: 420,
          manual_minutes: 5,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          id: "count-source",
          habit_id: count.id,
          value_boolean: null,
          value_numeric: 2.5,
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([timed, count], checkIns, "2026-05-10");

    expect(summary.totalTimedMinutes).toBe(12);
    expect(summary.totalCount).toBe(2.5);
  });

  it("fails closed for unsupported future check-in statuses", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        status: "future-status" as unknown as HabitCheckInRow["status"],
        value_boolean: true,
      })
    );

    const daySummary = buildHabitDaySummary([habit], [checkIn], "2026-05-10");
    const motivationSummary = buildHabitMotivationSummary([habit], [checkIn], "2026-05-10");

    expect(checkIn.status).toBe("unsupported");
    expect(daySummary.items[0]?.evaluation).toMatchObject({
      isSatisfied: false,
      stateLabel: "Unsupported",
      valueLabel: "Unsupported check-in",
    });
    expect(motivationSummary.onTrackDayCount).toBe(0);
    expect(motivationSummary.habitScore).toBeNull();
  });

  it("builds timed habits with duration timer metadata", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Mobility",
        habitMode: "timed",
        category: "movement",
        targetValueNumeric: 8,
        targetUnit: "minutes",
        startDate: "2026-05-10",
        selectedDate: "2026-05-10",
      },
      4
    );

    expect(insert).toMatchObject({
      habit_mode: "timed",
      habit_type: "duration",
      target_operator: "at_least",
      target_value_numeric: 8,
      target_unit: "minutes",
      timer_enabled: true,
      timer_target_seconds: 480,
    });
  });

  it("builds timed check-ins from explicit timer and manual sources", () => {
    const insert = buildHabitCheckInInsert(
      "user-1",
      {
        habitId: "11111111-1111-4111-8111-111111111111",
        checkInDate: "2026-05-10",
        timerSeconds: 125,
        manualMinutes: 5,
      },
      new Date("2026-05-10T12:00:00.000Z")
    );

    expect(insert).toMatchObject({
      value_numeric: 7.08,
      timer_seconds: 125,
      manual_minutes: 5,
      status: "logged",
      completed_at: "2026-05-10T12:00:00.000Z",
    });
  });

  it("allows zero manual minutes and rejects unsupported manual minute values", () => {
    expect(
      buildHabitCheckInInsert("user-1", {
        habitId: "11111111-1111-4111-8111-111111111111",
        checkInDate: "2026-05-10",
        timerSeconds: 120,
        manualMinutes: 0,
      })
    ).toMatchObject({
      value_numeric: 2,
      timer_seconds: 120,
      manual_minutes: 0,
    });

    expect(() =>
      buildHabitCheckInInsert("user-1", {
        habitId: "11111111-1111-4111-8111-111111111111",
        checkInDate: "2026-05-10",
        timerSeconds: 120,
        manualMinutes: 1.5,
      })
    ).toThrow("Manual time must be whole minutes between 0 and 1440.");

    expect(() =>
      buildHabitCheckInInsert("user-1", {
        habitId: "11111111-1111-4111-8111-111111111111",
        checkInDate: "2026-05-10",
        timerSeconds: 120,
        manualMinutes: 1441,
      })
    ).toThrow("Manual time must be whole minutes between 0 and 1440.");
  });

  it("keeps legacy numeric timed rows readable without inventing a source split", () => {
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        value_boolean: null,
        value_numeric: 2.5,
        timer_seconds: 0,
        manual_minutes: 0,
      })
    );

    expect(checkIn).toMatchObject({
      valueNumeric: 2.5,
      timerSeconds: 0,
      manualMinutes: 0,
      legacyTimedSeconds: 150,
    });
  });

  it("normalizes weekly and monthly any-day cadence fields on create", () => {
    const weekly = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Mobility",
        cadencePeriod: "weekly",
        cadenceTargetCount: 3,
        cadenceDayPolicy: "any",
        scheduleDays: ["monday"],
      },
      1
    );
    const monthly = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Review technique",
        cadencePeriod: "monthly",
        cadenceTargetCount: 5,
        cadenceDayPolicy: "any",
      },
      2
    );

    expect(weekly).toMatchObject({
      cadence_period: "weekly",
      cadence_target_count: 3,
      cadence_day_policy: "any",
      schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    });
    expect(monthly).toMatchObject({
      cadence_period: "monthly",
      cadence_target_count: 5,
      cadence_day_policy: "any",
    });
  });

  it("rejects unsupported monthly fixed-date cadence", () => {
    expect(() =>
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Review technique",
          cadencePeriod: "monthly",
          cadenceTargetCount: 5,
          cadenceDayPolicy: "fixed",
        },
        1
      )
    ).toThrow("Monthly fixed dates are not available yet.");
  });

  it("keeps legacy schedule-day rows readable as weekly fixed days", () => {
    const habit = buildHabitDefinitionView({
      ...buildHabitRow({
        schedule_days: ["monday", "wednesday", "friday"],
      }),
      cadence_period: null as unknown as string,
      cadence_target_count: null as unknown as number,
      cadence_day_policy: null as unknown as string,
    });

    expect(habit.cadencePeriod).toBe("weekly");
    expect(habit.cadenceTargetCount).toBe(3);
    expect(habit.cadenceDayPolicy).toBe("fixed");
    expect(habit.cadenceLabel).toBe("Weekly - 3 fixed days");
  });

  it("evaluates mixed perfect-day target types deterministically", () => {
    const binary = buildHabitDefinitionView(buildHabitRow({ title: "Sit in deep squat" }));
    const duration = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Walk stairs",
        habit_type: "duration",
        category: "movement",
        target_operator: "at_least",
        target_value_numeric: 10,
        target_unit: "minutes",
      })
    );
    const wake = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Wake up",
        habit_type: "time_of_day",
        category: "recovery",
        target_operator: "before",
        target_time: "05:00:00",
      })
    );
    const noSugar = buildHabitDefinitionView(
      buildHabitRow({
        id: "55555555-5555-4555-8555-555555555555",
        title: "No sugar",
        habit_type: "avoidance",
        category: "nutrition",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
      })
    );
    const checkIns = [
      buildHabitCheckInView(buildCheckInRow({ habit_id: binary.id, value_boolean: true })),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: duration.id,
          value_boolean: null,
          value_numeric: 12,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: wake.id,
          value_boolean: null,
          value_time: "04:55:00",
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: noSugar.id,
          value_boolean: null,
          value_numeric: 0,
        })
      ),
    ];

    const summary = buildHabitDaySummary([binary, duration, wake, noSugar], checkIns, "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(4);
    expect(summary.perfectDayItemCount).toBe(4);
    expect(summary.completionPercent).toBe(100);
    expect(summary.isPerfectDay).toBe(true);
    expect(summary.completedDurationMinutes).toBe(12);
  });

  it("builds weekly summaries from raw check-ins without storing derived rows", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          check_in_date: "2026-05-09",
          value_boolean: true,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          check_in_date: "2026-05-10",
          value_boolean: true,
        })
      ),
    ];

    const summary = buildHabitWeekSummary([habit], checkIns, "2026-05-10");

    expect(summary.days).toHaveLength(7);
    expect(summary.perfectDayCount).toBe(2);
    expect(summary.averageCompletionPercent).toBe(29);
  });

  it("builds Habits week summaries as Monday-Sunday ISO weeks", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));

    const summary = buildHabitWeekSummary([habit], [], "2026-06-05");

    expect(summary.days.map((day) => day.date)).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
    ]);
  });

  it("treats skipped check-ins as rest days that do not count as done or missed", () => {
    const restHabit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const doneHabit = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Drink water",
      })
    );
    const restDay = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: restHabit.id,
        status: "skipped",
        value_boolean: null,
        completed_at: null,
      })
    );
    const done = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: doneHabit.id,
        value_boolean: true,
      })
    );

    const summary = buildHabitDaySummary([restHabit, doneHabit], [restDay, done], "2026-05-10");

    expect(summary.perfectDayItemCount).toBe(1);
    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.completionPercent).toBe(100);
    expect(summary.items.find((item) => item.habit.id === restHabit.id)?.priorityGroup).toBe(
      "rest_day"
    );
    expect(summary.items.find((item) => item.habit.id === restHabit.id)?.evaluation).toMatchObject({
      isSatisfied: false,
      valueLabel: "Rest day",
      stateLabel: "Rest day",
      supportingLabel: "Not counted as done or missed",
    });
  });

  it("keeps weekly and monthly target-met habits done for the rest of the period", () => {
    const weekly = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Weekly mobility",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
      })
    );
    const monthly = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Technique review",
        start_date: "2026-05-01",
        cadence_period: "monthly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: weekly.id,
          check_in_date: "2026-05-05",
          value_boolean: true,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: weekly.id,
          check_in_date: "2026-05-07",
          value_boolean: true,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: monthly.id,
          check_in_date: "2026-05-02",
          value_boolean: true,
        })
      ),
    ];

    const summary = buildHabitDaySummary([weekly, monthly], checkIns, "2026-05-10");

    expect(summary.items.map((item) => [item.habit.title, item.priorityGroup])).toEqual([
      ["Weekly mobility", "done_period"],
      ["Technique review", "done_period"],
    ]);
    expect(summary.items.map((item) => item.isScheduledForDate)).toEqual([false, false]);
    expect(summary.items.map((item) => item.cadenceProgress.isTargetMet)).toEqual([true, true]);
  });

  it("sorts active habits by nearest deadline before status and completion rows", () => {
    const dueBuild = buildHabitDefinitionView(
      buildHabitRow({
        id: "11111111-1111-4111-8111-111111111111",
        title: "Drink water",
        sort_order: 5,
      })
    );
    const dueTimed = buildHabitDefinitionView(
      buildHabitRow({
        id: "22222222-2222-4222-8222-222222222222",
        title: "Timer",
        habit_mode: "timed",
        habit_type: "duration",
        category: "movement",
        target_operator: "at_least",
        target_value_numeric: 8,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 480,
        sort_order: 1,
      })
    );
    const dueWeekly = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Weekly mobility",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
        schedule_days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        sort_order: 4,
      })
    );
    const dueMonthly = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Review technique",
        cadence_period: "monthly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
        sort_order: 2,
      })
    );
    const quit = buildHabitDefinitionView(
      buildHabitRow({
        id: "55555555-5555-4555-8555-555555555555",
        title: "No chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        sort_order: 0,
      })
    );
    const done = buildHabitDefinitionView(
      buildHabitRow({
        id: "66666666-6666-4666-8666-666666666666",
        title: "Read",
        sort_order: 0,
      })
    );
    const doneCheckIn = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: done.id,
        value_boolean: true,
      })
    );

    const summary = buildHabitDaySummary(
      [done, quit, dueMonthly, dueWeekly, dueTimed, dueBuild],
      [doneCheckIn],
      "2026-05-10"
    );

    expect(summary.items.map((item) => item.habit.title)).toEqual([
      "Drink water",
      "Timer",
      "Weekly mobility",
      "Review technique",
      "No chips",
      "Read",
    ]);
    expect(summary.items.map((item) => item.priorityGroup)).toEqual([
      "due_build",
      "due_timed",
      "due_weekly",
      "due_monthly",
      "quit_status",
      "done_today",
    ]);
  });

  it("formats singular count units without parenthetical copy", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        habit_type: "count",
        target_value_numeric: 1,
        target_unit: "glasses",
      })
    );
    const [item] = buildHabitDaySummary(
      [habit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            value_boolean: null,
            value_numeric: 1,
          })
        ),
      ],
      "2026-05-10"
    ).items;

    expect(habit.targetLabel).toBe("At least 1 glass");
    expect(item?.evaluation.valueLabel).toBe("1 glass");
  });

  it("accepts litres as a persisted count unit and formats singular/plural labels", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Drink water",
        habitType: "count",
        category: "nutrition",
        targetValueNumeric: 2,
        targetUnit: "litres",
      },
      2
    );
    const pluralHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Drink water",
        habit_type: "count",
        category: "nutrition",
        target_value_numeric: insert.target_value_numeric,
        target_unit: insert.target_unit,
      })
    );
    const singularHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Drink water",
        habit_type: "count",
        category: "nutrition",
        target_value_numeric: 1,
        target_unit: "litres",
      })
    );
    const [pluralItem] = buildHabitDaySummary(
      [pluralHabit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            habit_id: pluralHabit.id,
            value_boolean: null,
            value_numeric: 2,
          })
        ),
      ],
      "2026-05-10"
    ).items;
    const [singularItem] = buildHabitDaySummary(
      [singularHabit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            habit_id: singularHabit.id,
            value_boolean: null,
            value_numeric: 1,
          })
        ),
      ],
      "2026-05-10"
    ).items;

    expect(insert.target_unit).toBe("litres");
    expect(pluralHabit.targetLabel).toBe("At least 2 litres");
    expect(pluralItem?.evaluation.valueLabel).toBe("2 litres");
    expect(singularHabit.targetLabel).toBe("At least 1 litre");
    expect(singularItem?.evaluation.valueLabel).toBe("1 litre");
  });
});
