import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import { loadProgramLibrarySnapshot } from "@/lib/programs/server";
import { WORKOUT_SELECT } from "@/lib/workouts/server";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

function buildProgramRow(overrides?: Partial<ProgramRow>): ProgramRow {
  return {
    id: "program-1",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
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

describe("programs server", () => {
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
});
