import { describe, expect, it, vi } from "vitest";
import { loadMyLibraryCalendarPlan } from "@/lib/my-library/calendar-plan";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import type { Database } from "@/types/database";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

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

function buildSupabaseMock(input: {
  programs?: ProgramRow[];
  instances?: PlannedWorkoutInstanceRow[];
  workouts?: WorkoutRow[];
  instancesError?: { code?: string; message?: string };
}) {
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

    throw new Error(`Unexpected table ${table}`);
  });

  return { from, instancesGte, instancesLte, workoutsIn };
}

describe("my library calendar plan loader", () => {
  it("hydrates planned workout instances for the selected week and month grid", async () => {
    const { from, instancesGte, instancesLte, workoutsIn } = buildSupabaseMock({});

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
    expect(model.sessionCount).toBe(1);
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
    expect(workoutsIn).toHaveBeenCalledWith("id", ["22222222-2222-4222-8222-222222222222"]);
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
