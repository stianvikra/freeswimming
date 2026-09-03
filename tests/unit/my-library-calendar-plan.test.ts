import { describe, expect, it, vi } from "vitest";
import { loadMyLibraryCalendarPlan } from "@/lib/my-library/calendar-plan";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import type { Database } from "@/types/database";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type CompletedActivityEventRow = Database["public"]["Tables"]["completed_activity_events"]["Row"];
type HabitCheckInRow = Database["public"]["Tables"]["habit_check_ins"]["Row"];
type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];
type HabitMotivationResetRow = Database["public"]["Tables"]["habit_motivation_resets"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type HabitDayStatusRow = {
  review_date: string;
  day_status: string | null;
  status: string;
};

function buildProgramRow(overrides?: Partial<ProgramRow>): ProgramRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    starts_on: "2026-06-22",
    title: "Swim comeback plan",
    weeks: [
      {
        id: "week-1",
        label: "Week 1",
        assignments: [
          {
            id: "assignment-1",
            workoutId: "22222222-2222-4222-8222-222222222222",
            dayIndex: 0,
            position: 0,
          },
        ],
      },
    ],
    created_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-20T09:05:00.000Z",
    ...overrides,
  };
}

function buildPlannedInstance(
  overrides?: Partial<PlannedWorkoutInstanceRow>
): PlannedWorkoutInstanceRow {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    user_id: "user-1",
    program_id: "11111111-1111-4111-8111-111111111111",
    program_week_id: "week-1",
    program_week_index: 0,
    program_assignment_id: "assignment-1",
    workout_id: "22222222-2222-4222-8222-222222222222",
    planned_on: "2026-06-22",
    day_index: 0,
    position: 0,
    status: "planned",
    date_override_kind: "program_assignment",
    source_kind: "program_assignment",
    created_at: "2026-06-20T09:10:00.000Z",
    updated_at: "2026-06-20T09:10:00.000Z",
    ...overrides,
  };
}

function buildWorkoutRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  const draft = buildManualWorkoutEmptyDraft(new Date("2026-06-20T08:00:00.000Z"));

  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    source_kind: "manual",
    status: "accepted",
    generator_kind: draft.generatorKind,
    source_fingerprint: draft.sourceFingerprint,
    title: "Comeback threshold swim",
    title_suggestions: ["Comeback threshold swim"],
    description: draft.description,
    environment: draft.environment,
    pool_length_m: draft.poolLengthM,
    pool_length_unit: draft.poolLengthUnit ?? "m",
    session_type: draft.sessionType,
    effort: draft.effort,
    size_mode: draft.sizeMode,
    target_distance_m: draft.targetDistanceM,
    target_time_min: draft.targetTimeMin,
    total_distance_m: 1800,
    estimated_duration_min: 38,
    base_pace_seconds_per_100: draft.basePaceSecondsPer100m,
    used_css_pace_label: draft.usedCssPaceLabel,
    allowed_strokes: draft.allowedStrokes,
    equipment_allowlist: draft.equipmentAllowlist,
    focus_text: draft.focusText,
    goal_title: draft.goalTitle,
    constraint_text: draft.constraintText,
    warnings: draft.warnings,
    steps: draft.steps,
    generated_at: draft.createdAt,
    accepted_at: "2026-06-20T08:01:00.000Z",
    created_at: "2026-06-20T08:01:00.000Z",
    updated_at: "2026-06-20T08:02:00.000Z",
    ...overrides,
  };
}

function buildCompletedActivityEvent(
  overrides?: Partial<CompletedActivityEventRow>
): CompletedActivityEventRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    user_id: "user-1",
    planned_workout_instance_id: "33333333-3333-4333-8333-333333333333",
    workout_id: "22222222-2222-4222-8222-222222222222",
    program_id: "11111111-1111-4111-8111-111111111111",
    outcome: "completed_as_planned",
    source_kind: "manual",
    completed_on: "2026-06-22",
    actual_started_at: null,
    actual_duration_seconds: 2280,
    actual_distance_m: 1800,
    actual_environment: "pool",
    actual_pool_length_m: 25,
    actual_pool_length_unit: "m",
    actual_session_snapshot: null,
    correction_note: null,
    planned_snapshot: {},
    created_at: "2026-06-22T17:30:00.000Z",
    updated_at: "2026-06-22T17:30:00.000Z",
    ...overrides,
  };
}

function buildHabitDefinitionRow(overrides?: Partial<HabitDefinitionRow>): HabitDefinitionRow {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    user_id: "user-1",
    title: "Morning mobility",
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
    created_at: "2026-06-01T06:00:00.000Z",
    updated_at: "2026-06-01T06:00:00.000Z",
    ...overrides,
  };
}

function buildHabitCheckInRow(overrides?: Partial<HabitCheckInRow>): HabitCheckInRow {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    user_id: "user-1",
    habit_id: "55555555-5555-4555-8555-555555555555",
    check_in_date: "2026-06-22",
    timezone: "Europe/Oslo",
    value_numeric: null,
    value_boolean: true,
    value_time: null,
    timer_seconds: 0,
    manual_minutes: 0,
    note: null,
    source_kind: "manual",
    source_dryland_micro_plan_id: null,
    source_micro_block_id: null,
    source_completed_at: null,
    status: "logged",
    completed_at: "2026-06-22T08:00:00.000Z",
    created_at: "2026-06-22T08:00:00.000Z",
    updated_at: "2026-06-22T08:00:00.000Z",
    ...overrides,
  };
}

function buildHabitResetRow(overrides?: Partial<HabitMotivationResetRow>): HabitMotivationResetRow {
  return {
    id: "77777777-7777-4777-8777-777777777777",
    user_id: "user-1",
    habit_id: "55555555-5555-4555-8555-555555555555",
    reset_type: "reset_stats",
    status: "active",
    effective_date: "2026-06-22",
    created_by: "user-1",
    created_at: "2026-06-22T09:00:00.000Z",
    ...overrides,
  };
}

function buildMicroPlanRow(overrides?: Partial<DrylandMicroPlanRow>): DrylandMicroPlanRow {
  return {
    id: "88888888-8888-4888-8888-888888888888",
    user_id: "user-1",
    source_dryland_session_id: null,
    source_session_title: "Shoulder prep",
    title: "Shoulder prep micro",
    session_kind: "strength",
    status: "active",
    timezone: "Europe/Oslo",
    week_starts_at: "2026-06-15T00:00:00.000Z",
    week_ends_at: "2026-06-22T00:00:00.000Z",
    blocks: [
      {
        id: "micro-block-1",
        status: "completed",
        completedAt: "2026-06-20T07:00:00.000Z",
        skippedAt: null,
      },
    ],
    created_at: "2026-06-22T06:00:00.000Z",
    updated_at: "2026-06-22T07:00:00.000Z",
    ...overrides,
  };
}

function buildSupabaseMock(input: {
  programs?: ProgramRow[];
  instances?: PlannedWorkoutInstanceRow[];
  workouts?: WorkoutRow[];
  instancesError?: { code?: string; message?: string };
  completedActivityEvents?: CompletedActivityEventRow[];
  completedActivityError?: { code?: string; message?: string };
  habitDefinitions?: HabitDefinitionRow[];
  habitCheckIns?: HabitCheckInRow[];
  habitResets?: HabitMotivationResetRow[];
  habitDayStatuses?: HabitDayStatusRow[];
  habitDayStatusError?: { code?: string; message?: string };
  microPlans?: DrylandMicroPlanRow[];
}) {
  const habitDefinitionsOrderUpdated = vi.fn().mockResolvedValue({
    data: input.habitDefinitions ?? [],
    error: null,
  });
  const habitDefinitionsOrderSort = vi.fn(() => ({ order: habitDefinitionsOrderUpdated }));
  const habitDefinitionsEq = vi.fn(() => ({ order: habitDefinitionsOrderSort }));

  const habitCheckInsLte = vi.fn().mockResolvedValue({
    data: input.habitCheckIns ?? [],
    error: null,
  });
  const habitCheckInsGte = vi.fn(() => ({ lte: habitCheckInsLte }));
  const habitCheckInsEq = vi.fn(() => ({ gte: habitCheckInsGte }));

  const habitResetsLte = vi.fn().mockResolvedValue({
    data: input.habitResets ?? [],
    error: null,
  });
  const habitResetsGte = vi.fn(() => ({ lte: habitResetsLte }));
  const habitResetsEq = vi.fn(() => ({ gte: habitResetsGte }));

  const habitDayStatusesLte = vi.fn().mockResolvedValue({
    data: input.habitDayStatuses ?? [],
    error: input.habitDayStatusError ?? null,
  });
  const habitDayStatusesGte = vi.fn(() => ({ lte: habitDayStatusesLte }));
  const habitDayStatusesScopeEq = vi.fn(() => ({ gte: habitDayStatusesGte }));
  const habitDayStatusesUserEq = vi.fn(() => ({ eq: habitDayStatusesScopeEq }));

  const microPlansGte = vi.fn().mockResolvedValue({
    data: input.microPlans ?? [],
    error: null,
  });
  const microPlansLte = vi.fn(() => ({ gte: microPlansGte }));
  const microPlansEq = vi.fn(() => ({ lte: microPlansLte }));

  const programsLimit = vi.fn().mockResolvedValue({
    data: input.programs ?? [buildProgramRow()],
    error: null,
  });
  const programsOrder = vi.fn(() => ({ limit: programsLimit }));
  const programsEq = vi.fn(() => ({ order: programsOrder }));

  const instancesOrderPosition = vi.fn().mockResolvedValue({
    data: input.instances ?? [buildPlannedInstance()],
    error: input.instancesError ?? null,
  });
  const instancesOrderDate = vi.fn(() => ({ order: instancesOrderPosition }));
  const instancesLte = vi.fn(() => ({ order: instancesOrderDate }));
  const instancesGte = vi.fn(() => ({ lte: instancesLte }));
  const instancesEq = vi.fn(() => ({ gte: instancesGte }));

  const workoutsIn = vi.fn().mockResolvedValue({
    data: input.workouts ?? [buildWorkoutRow()],
    error: null,
  });
  const workoutsEq = vi.fn(() => ({ in: workoutsIn }));

  const completedActivityIn = vi.fn().mockResolvedValue({
    data: input.completedActivityEvents ?? [],
    error: input.completedActivityError ?? null,
  });
  const completedActivityEq = vi.fn(() => ({ in: completedActivityIn }));

  const from = vi.fn((table: string) => {
    if (table === "programs") {
      return {
        select: vi.fn(() => ({ eq: programsEq })),
      };
    }

    if (table === "planned_workout_instances") {
      return {
        select: vi.fn(() => ({ eq: instancesEq })),
      };
    }

    if (table === "workouts") {
      return {
        select: vi.fn(() => ({ eq: workoutsEq })),
      };
    }

    if (table === "completed_activity_events") {
      return {
        select: vi.fn(() => ({ eq: completedActivityEq })),
      };
    }

    if (table === "habit_definitions") {
      return {
        select: vi.fn(() => ({ eq: habitDefinitionsEq })),
      };
    }

    if (table === "habit_check_ins") {
      return {
        select: vi.fn(() => ({ eq: habitCheckInsEq })),
      };
    }

    if (table === "habit_motivation_resets") {
      return {
        select: vi.fn(() => ({ eq: habitResetsEq })),
      };
    }

    if (table === "habit_absence_review_acknowledgements") {
      return {
        select: vi.fn(() => ({ eq: habitDayStatusesUserEq })),
      };
    }

    if (table === "dryland_micro_plans") {
      return {
        select: vi.fn(() => ({ eq: microPlansEq })),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  return {
    from,
    instancesGte,
    instancesLte,
    workoutsIn,
    completedActivityIn,
    habitCheckInsGte,
    habitCheckInsLte,
    habitDayStatusesGte,
    habitDayStatusesLte,
    microPlansLte,
    microPlansGte,
  };
}

describe("my library calendar plan loader", () => {
  it("hydrates planned workout instances for the selected week and month grid", async () => {
    const {
      from,
      instancesGte,
      instancesLte,
      workoutsIn,
      completedActivityIn,
      habitCheckInsGte,
      habitCheckInsLte,
      habitDayStatusesGte,
      habitDayStatusesLte,
      microPlansLte,
      microPlansGte,
    } = buildSupabaseMock({
      habitDefinitions: [buildHabitDefinitionRow()],
      habitCheckIns: [buildHabitCheckInRow()],
      habitResets: [buildHabitResetRow()],
      microPlans: [buildMicroPlanRow()],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.schemaReady).toBe(true);
    expect(model.window.startDate).toBe("2026-06-22");
    expect(model.window.endDate).toBe("2026-06-28");
    expect(model.todayDate).toBe("2026-06-20");
    expect(model.month).toMatchObject({
      label: "June 2026",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      gridStartDate: "2026-06-01",
      gridEndDate: "2026-07-05",
      containsToday: true,
    });
    expect(instancesGte).toHaveBeenCalledWith("planned_on", "2026-06-01");
    expect(instancesLte).toHaveBeenCalledWith("planned_on", "2026-07-05");
    expect(habitCheckInsGte).toHaveBeenCalledWith("check_in_date", "2026-06-01");
    expect(habitCheckInsLte).toHaveBeenCalledWith("check_in_date", "2026-06-20");
    expect(habitDayStatusesGte).toHaveBeenCalledWith("review_date", "2026-06-01");
    expect(habitDayStatusesLte).toHaveBeenCalledWith("review_date", "2026-06-20");
    expect(microPlansLte).toHaveBeenCalledWith("week_starts_at", "2026-07-05T23:59:59.999Z");
    expect(microPlansGte).toHaveBeenCalledWith("week_ends_at", "2026-06-01T00:00:00.000Z");
    expect(model.sessionCount).toBe(1);
    expect(model.completionSchemaReady).toBe(true);
    expect(model.days[0]?.sessions[0]).toMatchObject({
      id: "33333333-3333-4333-8333-333333333333",
      date: "2026-06-22",
      status: "planned",
      statusSelection: "planned",
      dateOverrideKind: "program_assignment",
      updatedAt: "2026-06-20T09:10:00.000Z",
      weekLabel: "Week 1",
      assignmentId: "assignment-1",
      workoutId: "22222222-2222-4222-8222-222222222222",
      workout: {
        title: "Comeback threshold swim",
        totalDistanceM: 1000,
        estimatedDurationMin: 25,
      },
      completion: {
        selection: "none",
      },
    });
    expect(model.monthDays).toHaveLength(35);
    expect(model.monthDays.find((day) => day.date === "2026-06-20")).toMatchObject({
      isToday: true,
      isSelected: false,
      isCurrentMonth: true,
    });
    expect(model.monthDays.find((day) => day.date === "2026-06-22")?.sessions[0]?.id).toBe(
      "33333333-3333-4333-8333-333333333333"
    );
    expect(model.selectedDay.sessions[0]?.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(model.selectedDay.dailyLayers.map((layer) => layer.source)).toEqual([
      "habits",
      "micro_sessions",
    ]);
    expect(model.selectedDay.dailyLayers.find((layer) => layer.source === "habits")).toMatchObject({
      status: "future",
    });
    expect(
      model.monthDays
        .find((day) => day.date === "2026-06-20")
        ?.dailyLayers.find((layer) => layer.source === "micro_sessions")
    ).toMatchObject({
      status: "mapped",
      compactLabel: "1 micro unit",
    });
    expect(workoutsIn).toHaveBeenCalledWith("id", ["22222222-2222-4222-8222-222222222222"]);
    expect(completedActivityIn).toHaveBeenCalledWith("planned_workout_instance_id", [
      "33333333-3333-4333-8333-333333333333",
    ]);
  });

  it("loads monthly any-day evidence from the month start before the earliest grid date", async () => {
    const { from, habitCheckInsGte, habitCheckInsLte, habitDayStatusesGte, habitDayStatusesLte } =
      buildSupabaseMock({
        programs: [],
        instances: [],
        habitDefinitions: [
          buildHabitDefinitionRow({
            start_date: "2026-03-01",
            cadence_period: "monthly",
            cadence_target_count: 1,
            cadence_day_policy: "any",
          }),
        ],
        habitCheckIns: [
          buildHabitCheckInRow({
            check_in_date: "2026-03-10",
            completed_at: "2026-03-10T08:00:00.000Z",
          }),
        ],
        habitDayStatuses: [
          { review_date: "2026-03-11", day_status: "not_tracked", status: "reviewed" },
        ],
      });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-04-15",
      todayDate: "2026-04-15",
      selectedProgramId: null,
    });

    expect(model.month.gridStartDate).toBe("2026-03-30");
    expect(habitCheckInsGte).toHaveBeenCalledWith("check_in_date", "2026-03-01");
    expect(habitCheckInsLte).toHaveBeenCalledWith("check_in_date", "2026-04-15");
    expect(habitDayStatusesGte).toHaveBeenCalledWith("review_date", "2026-03-01");
    expect(habitDayStatusesLte).toHaveBeenCalledWith("review_date", "2026-04-15");
    expect(
      model.monthDays
        .find((day) => day.date === "2026-03-31")
        ?.dailyLayers.find((layer) => layer.source === "habits")?.stats
    ).toMatchObject({ habitPotentialDayCount: 0 });
  });

  it("reviews unsupported Habit definitions and excludes their check-ins and resets", async () => {
    const legacyHabitId = "88888888-8888-4888-8888-888888888888";
    const unsupportedHabitId = "99999999-9999-4999-8999-999999999999";
    const { from } = buildSupabaseMock({
      habitDefinitions: [
        buildHabitDefinitionRow(),
        buildHabitDefinitionRow({
          id: legacyHabitId,
          title: "Legacy daily Habit",
          cadence_period: null,
          cadence_target_count: null,
          cadence_day_policy: null,
          sort_order: 1,
        } as unknown as Partial<HabitDefinitionRow>),
        buildHabitDefinitionRow({
          id: unsupportedHabitId,
          title: "Future Habit",
          category: "future_category",
          sort_order: 2,
        }),
      ],
      habitCheckIns: [
        buildHabitCheckInRow({ check_in_date: "2026-06-19" }),
        buildHabitCheckInRow({
          id: "88888888-8888-4888-8888-888888888887",
          habit_id: legacyHabitId,
          check_in_date: "2026-06-19",
        }),
        buildHabitCheckInRow({
          id: "99999999-9999-4999-8999-999999999998",
          habit_id: unsupportedHabitId,
          check_in_date: "2026-06-20",
        }),
      ],
      habitResets: [
        buildHabitResetRow({ effective_date: "2026-06-20" }),
        buildHabitResetRow({
          id: "88888888-8888-4888-8888-888888888886",
          habit_id: legacyHabitId,
          effective_date: "2026-06-20",
        }),
        buildHabitResetRow({
          id: "99999999-9999-4999-8999-999999999997",
          habit_id: unsupportedHabitId,
          effective_date: "2026-06-20",
        }),
      ],
      habitDayStatuses: [
        { review_date: "2026-06-20", day_status: "not_tracked", status: "reviewed" },
      ],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-20",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });
    const habitLayer = model.selectedDay.dailyLayers.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({
      status: "review",
      tone: "warning",
      compactLabel: "0/2 habits · review",
    });
    expect(habitLayer?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "habit_daily", value: "0/2" }),
        expect.objectContaining({ id: "habit_resets", value: "2 markers" }),
        expect.objectContaining({ id: "habit_review", value: "1 habit" }),
      ])
    );
    expect(habitLayer?.metrics.find((metric) => metric.id === "habit_not_tracked")).toBeUndefined();
    expect(JSON.stringify(habitLayer)).not.toContain("future_category");
  });

  it("loads a bounded not-tracked day as a neutral Calendar layer", async () => {
    const { from } = buildSupabaseMock({
      habitDefinitions: [buildHabitDefinitionRow()],
      habitDayStatuses: [
        { review_date: "2026-06-20", day_status: "not_tracked", status: "reviewed" },
      ],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-20",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });
    const habitLayer = model.selectedDay.dailyLayers.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({
      status: "mapped",
      tone: "muted",
      compactLabel: "Not tracked",
      metrics: [{ id: "habit_not_tracked", label: "Status", value: "Not tracked" }],
      stats: {
        dailyHabitCompletedCount: 0,
        dailyHabitTotalCount: 0,
        habitPotentialDayCount: 1,
        habitIncludedDayCount: 0,
        habitNotTrackedDayCount: 1,
      },
    });
    expect(JSON.stringify(habitLayer)).not.toMatch(/Done|Missed|Rest|Slip|Perfect/);
  });

  it("lets a supported check-in override a stale not-tracked Calendar marker", async () => {
    const { from } = buildSupabaseMock({
      habitDefinitions: [buildHabitDefinitionRow()],
      habitCheckIns: [buildHabitCheckInRow({ check_in_date: "2026-06-20" })],
      habitDayStatuses: [
        { review_date: "2026-06-20", day_status: "not_tracked", status: "reviewed" },
      ],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-20",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });
    const habitLayer = model.selectedDay.dailyLayers.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({ compactLabel: "1/1 habits" });
    expect(habitLayer?.metrics.find((metric) => metric.id === "habit_not_tracked")).toBeUndefined();
  });

  it("keeps Calendar unavailable when day-status loading fails", async () => {
    const { from } = buildSupabaseMock({
      habitDefinitions: [buildHabitDefinitionRow()],
      habitDayStatusError: { code: "PGRST500", message: "temporary read failure" },
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-20",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });
    const habitLayer = model.selectedDay.dailyLayers.find((layer) => layer.source === "habits");

    expect(habitLayer).toMatchObject({
      status: "error",
      compactLabel: "Habits error",
      metrics: [],
    });
    expect(habitLayer?.summary).toContain("Could not load Habit day status");
  });

  it("hydrates manual completed activity events as actual outcome truth", async () => {
    const { from } = buildSupabaseMock({
      completedActivityEvents: [buildCompletedActivityEvent()],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.selectedDay.sessions[0]?.completion).toMatchObject({
      selection: "manual_actual",
      eventId: "44444444-4444-4444-8444-444444444444",
      completedOn: "2026-06-22",
      sourceKind: "manual",
      outcome: "completed_as_planned",
      isDoneOutcome: true,
      actualDistanceM: 1800,
      actualDurationSeconds: 2280,
    });
  });

  it("treats legacy completed rows as completed-as-planned actuals", async () => {
    const { from } = buildSupabaseMock({
      completedActivityEvents: [buildCompletedActivityEvent({ outcome: "completed" })],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.selectedDay.sessions[0]?.completion).toMatchObject({
      selection: "manual_actual",
      outcome: "completed_as_planned",
      isDoneOutcome: true,
    });
  });

  it("treats unknown completed activity event source or outcome as review state", async () => {
    const { from } = buildSupabaseMock({
      completedActivityEvents: [
        buildCompletedActivityEvent({
          outcome: "provider_pending",
          source_kind: "garmin_activity_api",
        }),
      ],
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.selectedDay.sessions[0]?.completion).toMatchObject({
      selection: "review",
      sourceKind: "garmin_activity_api",
      outcome: "provider_pending",
    });
  });

  it("keeps planned sessions visible when completed-activity schema is still syncing", async () => {
    const { from } = buildSupabaseMock({
      completedActivityError: {
        code: "42P01",
        message: "relation completed_activity_events missing",
      },
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.completionSchemaReady).toBe(false);
    expect(model.selectedDay.sessions[0]?.completion).toEqual({ selection: "schema_missing" });
  });

  it("treats missing planned-instance schema as recoverable sync state", async () => {
    const { from } = buildSupabaseMock({
      instancesError: { code: "42P01", message: "relation planned_workout_instances missing" },
    });

    const model = await loadMyLibraryCalendarPlan({ from } as never, "user-1", {
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
      selectedProgramId: null,
    });

    expect(model.schemaReady).toBe(false);
    expect(model.sessionCount).toBe(0);
    expect(model.loadError).toBeNull();
  });
});
