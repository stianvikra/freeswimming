import { afterEach, describe, expect, it, vi } from "vitest";
import { loadHabitSnapshot } from "@/lib/habits/server";
import type {
  HabitCheckInRow,
  HabitDefinitionRow,
  HabitMotivationResetRow,
} from "@/lib/habits/shared";

function buildHabitRow(overrides?: Partial<HabitDefinitionRow>): HabitDefinitionRow {
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
    created_at: "2026-05-04T08:00:00.000Z",
    updated_at: "2026-05-04T08:00:00.000Z",
    ...overrides,
  };
}

function buildCheckInRow(overrides?: Partial<HabitCheckInRow>): HabitCheckInRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    habit_id: "11111111-1111-4111-8111-111111111111",
    check_in_date: "2026-05-04",
    timezone: "Europe/Oslo",
    value_numeric: null,
    value_boolean: true,
    value_time: null,
    note: null,
    status: "logged",
    completed_at: "2026-05-04T09:00:00.000Z",
    created_at: "2026-05-04T09:00:00.000Z",
    updated_at: "2026-05-04T09:00:00.000Z",
    timer_seconds: 0,
    manual_minutes: 0,
    ...overrides,
  };
}

function buildSupabaseMock(
  definitions: HabitDefinitionRow[],
  checkIns: HabitCheckInRow[],
  resetEvents: HabitMotivationResetRow[] = []
) {
  const definitionQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };
  definitionQuery.select.mockReturnValue(definitionQuery);
  definitionQuery.eq.mockReturnValue(definitionQuery);
  definitionQuery.order
    .mockReturnValueOnce(definitionQuery)
    .mockResolvedValueOnce({ data: definitions, error: null });

  const checkInQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
  };
  checkInQuery.select.mockReturnValue(checkInQuery);
  checkInQuery.eq.mockReturnValue(checkInQuery);
  checkInQuery.gte.mockReturnValue(checkInQuery);
  checkInQuery.lte.mockResolvedValue({ data: checkIns, error: null });

  const resetQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    lte: vi.fn(),
  };
  resetQuery.select.mockReturnValue(resetQuery);
  resetQuery.eq.mockReturnValue(resetQuery);
  resetQuery.lte.mockResolvedValue({ data: resetEvents, error: null });

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "habit_definitions") return definitionQuery;
      if (table === "habit_check_ins") return checkInQuery;
      if (table === "habit_motivation_resets") return resetQuery;
      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return { supabase, checkInQuery, resetQuery };
}

describe("habits server loader", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps daily build history available for collapsed streak motivation", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    const habit = buildHabitRow({ start_date: "2026-04-28" });
    const checkIns = [
      "2026-04-28",
      "2026-04-29",
      "2026-04-30",
      "2026-05-01",
      "2026-05-02",
      "2026-05-03",
      "2026-05-04",
      "2026-05-05",
      "2026-05-06",
      "2026-05-07",
      "2026-05-08",
      "2026-05-09",
    ].map((date, index) =>
      buildCheckInRow({
        id: `build-streak-${index}`,
        check_in_date: date,
      })
    );
    const { supabase, checkInQuery, resetQuery } = buildSupabaseMock([habit], checkIns);

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", "2026-05-10");

    expect(checkInQuery.gte).toHaveBeenCalledWith("check_in_date", "2026-04-28");
    expect(checkInQuery.lte).toHaveBeenCalledWith("check_in_date", "2026-05-10");
    expect(resetQuery.lte).toHaveBeenCalledWith("effective_date", "2026-05-10");
    expect(snapshot.daySummary.items[0]?.evaluation.valueLabel).toBe("12-day streak");
    expect(snapshot.daySummary.items[0]?.evaluation.supportingLabel).toBe("12/13 days hit");
  });

  it("loads through the historical ISO week end for midweek selected dates", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    const habit = buildHabitRow({ start_date: "2026-05-25" });
    const { supabase, checkInQuery } = buildSupabaseMock(
      [habit],
      [
        buildCheckInRow({
          check_in_date: "2026-05-31",
        }),
      ]
    );

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", "2026-05-29");

    expect(checkInQuery.lte).toHaveBeenCalledWith("check_in_date", "2026-05-31");
    expect(snapshot.weekSummary.days.map((day) => day.date)).toEqual([
      "2026-05-25",
      "2026-05-26",
      "2026-05-27",
      "2026-05-28",
      "2026-05-29",
      "2026-05-30",
      "2026-05-31",
    ]);
    expect(snapshot.weekSummary.days.at(-1)?.completionPercent).toBe(100);
  });
});
