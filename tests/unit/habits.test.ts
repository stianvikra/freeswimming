import { describe, expect, it } from "vitest";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionInsert,
  buildHabitDefinitionView,
  buildHabitWeekSummary,
  type HabitCheckInRow,
  type HabitDefinitionRow,
} from "@/lib/habits/shared";

function buildHabitRow(overrides: Partial<HabitDefinitionRow>): HabitDefinitionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    title: "Read",
    notes: null,
    habit_type: "binary",
    category: "learning",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
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
});
