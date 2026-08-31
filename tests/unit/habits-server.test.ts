import { afterEach, describe, expect, it, vi } from "vitest";
import { loadHabitSnapshot } from "@/lib/habits/server";
import type {
  HabitAbsenceReviewAcknowledgementRow,
  HabitCheckInRow,
  HabitDefinitionRow,
  HabitMotivationResetRow,
} from "@/lib/habits/shared";
import type { Database } from "@/types/database";

type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

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
    source_kind: "manual",
    source_dryland_micro_plan_id: null,
    source_micro_block_id: null,
    source_completed_at: null,
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
  resetEvents: HabitMotivationResetRow[] = [],
  microSessionLinks: Array<
    Pick<MicroSessionHabitLinkRow, "habit_id" | "dryland_micro_plan_id" | "status" | "updated_at">
  > = [],
  microPlans: Array<Pick<DrylandMicroPlanRow, "id" | "blocks">> = [],
  absenceReviewAcknowledgements: HabitAbsenceReviewAcknowledgementRow[] = []
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

  const absenceReviewQuery: {
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
  absenceReviewQuery.select.mockReturnValue(absenceReviewQuery);
  absenceReviewQuery.eq.mockReturnValue(absenceReviewQuery);
  absenceReviewQuery.gte.mockReturnValue(absenceReviewQuery);
  absenceReviewQuery.lte.mockResolvedValue({ data: absenceReviewAcknowledgements, error: null });

  const microLinkQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
  };
  microLinkQuery.select.mockReturnValue(microLinkQuery);
  microLinkQuery.eq.mockReturnValue(microLinkQuery);
  microLinkQuery.in.mockReturnValue(microLinkQuery);
  microLinkQuery.order.mockResolvedValue({ data: microSessionLinks, error: null });

  const microPlanQuery: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
  };
  microPlanQuery.select.mockReturnValue(microPlanQuery);
  microPlanQuery.eq.mockReturnValue(microPlanQuery);
  microPlanQuery.in.mockResolvedValue({ data: microPlans, error: null });

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "habit_definitions") return definitionQuery;
      if (table === "micro_session_habit_links") return microLinkQuery;
      if (table === "dryland_micro_plans") return microPlanQuery;
      if (table === "habit_check_ins") return checkInQuery;
      if (table === "habit_motivation_resets") return resetQuery;
      if (table === "habit_absence_review_acknowledgements") return absenceReviewQuery;
      throw new Error(`Unexpected table ${table}`);
    }),
  };

  return { supabase, checkInQuery, resetQuery, microLinkQuery, microPlanQuery, absenceReviewQuery };
}

describe("habits server loader", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("adds linked Micro Session progress to habit definitions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    const habit = buildHabitRow({
      cadence_period: "weekly",
      cadence_day_policy: "any",
    });
    const microBlocks = [
      {
        id: "unit-1",
        sourceDrylandSessionId: "dryland-1",
        sourceSessionTitle: "Weekly strength",
        sourceSessionKind: "strength",
        sourceSessionIndex: 0,
        sourceExerciseId: "exercise-1",
        sourceExerciseIndex: 0,
        sourceSetId: "set-1",
        setIndex: 0,
        title: "Push ups",
        summary: "Upper body",
        targetLabel: "12 reps",
        targetType: "reps",
        targetValue: 12,
        targetUnit: "reps",
        loadKg: null,
        restSeconds: null,
        coachCue: "",
        releaseMode: "available_now",
        releaseOffsetDays: null,
        releaseTime: "06:00",
        releasedAt: "1970-01-01T00:00:00.000Z",
        isArchived: false,
        status: "completed",
        completedAt: "2026-05-10T09:00:00.000Z",
        skippedAt: null,
      },
      {
        id: "unit-2",
        sourceDrylandSessionId: "dryland-1",
        sourceSessionTitle: "Weekly strength",
        sourceSessionKind: "strength",
        sourceSessionIndex: 0,
        sourceExerciseId: "exercise-1",
        sourceExerciseIndex: 0,
        sourceSetId: "set-2",
        setIndex: 1,
        title: "Push ups",
        summary: "Upper body",
        targetLabel: "12 reps",
        targetType: "reps",
        targetValue: 12,
        targetUnit: "reps",
        loadKg: null,
        restSeconds: null,
        coachCue: "",
        releaseMode: "available_now",
        releaseOffsetDays: null,
        releaseTime: "06:00",
        releasedAt: "1970-01-01T00:00:00.000Z",
        isArchived: false,
        status: "queued",
        completedAt: null,
        skippedAt: null,
      },
    ];
    const { supabase, microLinkQuery, microPlanQuery } = buildSupabaseMock(
      [habit],
      [],
      [],
      [
        {
          habit_id: habit.id,
          dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
          status: "active",
          updated_at: "2026-05-10T09:00:00.000Z",
        },
      ],
      [
        {
          id: "22222222-2222-4222-8222-222222222222",
          blocks: microBlocks,
        },
      ]
    );

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-06-05",
    });

    expect(microLinkQuery.in).toHaveBeenCalledWith("habit_id", [habit.id]);
    expect(microPlanQuery.in).toHaveBeenCalledWith("id", ["22222222-2222-4222-8222-222222222222"]);
    expect(snapshot.activeHabits[0]?.microSessionLink).toMatchObject({
      planId: "22222222-2222-4222-8222-222222222222",
      status: "active",
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        progressPercent: 50,
      },
    });
  });

  it("keeps habit snapshots available when linked Micro Session progress cannot load", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const habit = buildHabitRow({
      cadence_period: "weekly",
      cadence_day_policy: "any",
    });
    const { supabase, microPlanQuery } = buildSupabaseMock(
      [habit],
      [],
      [],
      [
        {
          habit_id: habit.id,
          dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
          status: "active",
          updated_at: "2026-05-10T09:00:00.000Z",
        },
      ]
    );
    microPlanQuery.in.mockResolvedValueOnce({
      data: null,
      error: { message: "Dryland progress unavailable" },
    });

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-06-05",
    });

    expect(snapshot.activeHabits[0]?.microSessionLink).toMatchObject({
      planId: "22222222-2222-4222-8222-222222222222",
      status: "active",
      progress: null,
    });
    expect(snapshot.daySummary.items).toHaveLength(1);
    expect(consoleError).toHaveBeenCalledWith(
      "[Habits] Could not load linked micro session progress",
      { message: "Dryland progress unavailable" }
    );
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

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-06-05",
    });

    expect(checkInQuery.gte).toHaveBeenCalledWith("check_in_date", "2026-04-28");
    expect(checkInQuery.lte).toHaveBeenCalledWith("check_in_date", "2026-05-10");
    expect(resetQuery.lte).toHaveBeenCalledWith("effective_date", "2026-05-10");
    expect(snapshot.daySummary.items[0]?.evaluation.valueLabel).toBe("Streak: 12 days.");
    expect(snapshot.daySummary.items[0]?.evaluation.supportingLabel).toBe("12/13 days completed");
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

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2026-05-29",
      todayDate: "2026-06-05",
    });

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

  it("clamps future snapshot dates to the request-local today boundary", async () => {
    const habit = buildHabitRow({ start_date: "2026-05-25" });
    const { supabase, checkInQuery, resetQuery, absenceReviewQuery } = buildSupabaseMock(
      [habit],
      []
    );

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2999-01-01",
      todayDate: "2026-06-05",
    });

    expect(snapshot.selectedDate).toBe("2026-06-05");
    expect(checkInQuery.lte).toHaveBeenCalledWith("check_in_date", "2026-06-05");
    expect(resetQuery.lte).toHaveBeenCalledWith("effective_date", "2026-06-05");
    expect(absenceReviewQuery.lte).toHaveBeenCalledWith("review_date", "2026-06-05");
  });

  it("loads server-canonical absence review acknowledgements for the visible week", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-05T12:00:00.000Z"));
    const habit = buildHabitRow({ start_date: "2026-05-04" });
    const { supabase, absenceReviewQuery } = buildSupabaseMock(
      [habit],
      [],
      [],
      [],
      [],
      [
        {
          id: "33333333-3333-4333-8333-333333333333",
          user_id: "user-1",
          review_scope: "weekly_absence_review",
          review_date: "2026-05-05",
          status: "reviewed",
          created_at: "2026-05-10T09:00:00.000Z",
          updated_at: "2026-05-10T09:00:00.000Z",
        },
      ]
    );

    const snapshot = await loadHabitSnapshot(supabase as never, "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-06-05",
    });

    expect(absenceReviewQuery.gte).toHaveBeenCalledWith("review_date", "2026-05-04");
    expect(absenceReviewQuery.lte).toHaveBeenCalledWith("review_date", "2026-05-10");
    expect(snapshot.absenceReviewAcknowledgementsReady).toBe(true);
    expect(snapshot.absenceReviewAcknowledgedDates).toEqual(["2026-05-05"]);
  });
});
