import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import {
  buildPlannedWorkoutInstanceInserts,
  loadProgramLibrarySnapshot,
  syncPlannedWorkoutInstancesForProgram,
} from "@/lib/programs/server";
import { WORKOUT_SELECT } from "@/lib/workouts/server";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

function buildProgramRow(overrides?: Partial<ProgramRow>): ProgramRow {
  return {
    id: "program-1",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    starts_on: "2026-06-22",
    title: "Week 1 base plan",
    weeks: [
      {
        id: "week-1",
        label: "Week 1",
        assignments: [],
      },
    ],
    created_at: "2026-04-06T08:00:00.000Z",
    updated_at: "2026-04-06T08:05:00.000Z",
    ...overrides,
  };
}

function buildWorkoutRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  const draft = buildManualWorkoutEmptyDraft(new Date("2026-04-06T08:00:00.000Z"));

  return {
    id: "workout-1",
    user_id: "user-1",
    source_kind: "manual",
    status: "accepted",
    generator_kind: draft.generatorKind,
    source_fingerprint: draft.sourceFingerprint,
    title: draft.title,
    title_suggestions: draft.titleSuggestions,
    description: draft.description,
    environment: draft.environment,
    pool_length_m: draft.poolLengthM,
    pool_length_unit: draft.poolLengthUnit ?? "m",
    session_type: draft.sessionType,
    effort: draft.effort,
    size_mode: draft.sizeMode,
    target_distance_m: draft.targetDistanceM,
    target_time_min: draft.targetTimeMin,
    total_distance_m: draft.totalDistanceM,
    estimated_duration_min: draft.estimatedDurationMin,
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
    accepted_at: "2026-04-06T08:01:00.000Z",
    created_at: "2026-04-06T08:01:00.000Z",
    updated_at: "2026-04-06T08:02:00.000Z",
    ...overrides,
  };
}

function buildPlannedInstanceRow(
  overrides?: Partial<PlannedWorkoutInstanceRow>
): PlannedWorkoutInstanceRow {
  return {
    id: "planned-1",
    user_id: "user-1",
    program_id: "program-1",
    program_week_id: "week-1",
    program_week_index: 0,
    program_assignment_id: "assignment-1",
    workout_id: "workout-1",
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

describe("programs server", () => {
  it("materializes planned workout instances from stable program assignment identity", () => {
    const instances = buildPlannedWorkoutInstanceInserts("user-1", {
      id: "11111111-1111-4111-8111-111111111111",
      createdAt: "2026-06-20T10:00:00.000Z",
      updatedAt: "2026-06-20T10:00:00.000Z",
      sourceKind: "manual",
      status: "draft",
      startsOn: "2026-06-22",
      title: "Swim comeback",
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
        {
          id: "week-2",
          label: "Week 2",
          assignments: [
            {
              id: "assignment-2",
              workoutId: "33333333-3333-4333-8333-333333333333",
              dayIndex: 3,
              position: 0,
            },
          ],
        },
      ],
    });

    expect(instances).toEqual([
      expect.objectContaining({
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
      }),
      expect.objectContaining({
        program_week_id: "week-2",
        program_week_index: 1,
        program_assignment_id: "assignment-2",
        planned_on: "2026-07-02",
        day_index: 3,
      }),
    ]);
  });

  it("preserves skipped status and manual date overrides during program sync", async () => {
    const existingEqProgram = vi.fn().mockResolvedValue({
      data: [
        buildPlannedInstanceRow({
          status: "skipped",
          date_override_kind: "manual",
          planned_on: "2026-06-24",
          day_index: 2,
          position: 9,
        }),
      ],
      error: null,
    });
    const existingEqUser = vi.fn(() => ({ eq: existingEqProgram }));
    const select = vi.fn(() => ({ eq: existingEqUser }));
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === "planned_workout_instances") {
        return { select, upsert };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const result = await syncPlannedWorkoutInstancesForProgram({ from } as never, "user-1", {
      id: "program-1",
      createdAt: "2026-06-20T10:00:00.000Z",
      updatedAt: "2026-06-20T10:00:00.000Z",
      sourceKind: "manual",
      status: "draft",
      startsOn: "2026-06-22",
      title: "Swim comeback",
      weeks: [
        {
          id: "week-1",
          label: "Week 1",
          assignments: [
            {
              id: "assignment-1",
              workoutId: "workout-1",
              dayIndex: 0,
              position: 0,
            },
          ],
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          program_assignment_id: "assignment-1",
          planned_on: "2026-06-24",
          day_index: 2,
          position: 0,
          status: "skipped",
          date_override_kind: "manual",
        }),
      ],
      { onConflict: "program_id,program_assignment_id" }
    );
  });

  it("loads recent workouts for program planning with the full workout select", async () => {
    const recentProgramsLimit = vi.fn().mockResolvedValue({
      data: [buildProgramRow()],
      error: null,
    });
    const recentProgramsOrder = vi.fn(() => ({ limit: recentProgramsLimit }));
    const recentProgramsEq = vi.fn(() => ({ order: recentProgramsOrder }));

    const recentWorkoutsLimit = vi.fn().mockResolvedValue({
      data: [buildWorkoutRow()],
      error: null,
    });
    const recentWorkoutsOrder = vi.fn(() => ({ limit: recentWorkoutsLimit }));
    const recentWorkoutsEq = vi.fn(() => ({ order: recentWorkoutsOrder }));
    const recentWorkoutsSelect = vi.fn(() => ({ eq: recentWorkoutsEq }));

    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() => ({ eq: recentProgramsEq })),
        })
        .mockReturnValueOnce({
          select: recentWorkoutsSelect,
        }),
    };

    const snapshot = await loadProgramLibrarySnapshot(supabase as never, "user-1", null);

    expect(recentWorkoutsSelect).toHaveBeenCalledWith(WORKOUT_SELECT);
    expect(snapshot.schemaReady).toBe(true);
    expect(snapshot.loadError).toBeNull();
    expect(snapshot.availableWorkouts).toHaveLength(1);
    expect(snapshot.availableWorkouts[0]?.title).toBe("Untitled pool session");
  });

  it("skips invalid available workouts instead of failing the entire program library snapshot", async () => {
    const recentProgramsLimit = vi.fn().mockResolvedValue({
      data: [buildProgramRow()],
      error: null,
    });
    const recentProgramsOrder = vi.fn(() => ({ limit: recentProgramsLimit }));
    const recentProgramsEq = vi.fn(() => ({ order: recentProgramsOrder }));

    const recentWorkoutsLimit = vi.fn().mockResolvedValue({
      data: [
        buildWorkoutRow(),
        buildWorkoutRow({
          id: "legacy-invalid-workout",
          description: undefined as unknown as WorkoutRow["description"],
          size_mode: undefined as unknown as WorkoutRow["size_mode"],
          allowed_strokes: undefined as unknown as WorkoutRow["allowed_strokes"],
          steps: null as unknown as WorkoutRow["steps"],
        }),
      ],
      error: null,
    });
    const recentWorkoutsOrder = vi.fn(() => ({ limit: recentWorkoutsLimit }));
    const recentWorkoutsEq = vi.fn(() => ({ order: recentWorkoutsOrder }));

    const from = vi.fn((table: string) => {
      if (table === "programs") {
        return {
          select: vi.fn(() => ({ eq: recentProgramsEq })),
        };
      }

      if (table === "workouts") {
        return {
          select: vi.fn(() => ({ eq: recentWorkoutsEq })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const snapshot = await loadProgramLibrarySnapshot(
      {
        from,
      } as never,
      "user-1",
      null
    );

    expect(snapshot.schemaReady).toBe(true);
    expect(snapshot.loadError).toBeNull();
    expect(snapshot.recentPrograms).toHaveLength(1);
    expect(snapshot.availableWorkouts).toHaveLength(1);
    expect(snapshot.availableWorkouts[0]?.id).toBe("workout-1");
  });
});
