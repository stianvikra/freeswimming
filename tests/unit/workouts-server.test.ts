import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import {
  buildWorkoutEditorRecord,
  buildWorkoutInsert,
  buildWorkoutSummary,
  loadWorkoutLibrarySnapshot,
} from "@/lib/workouts/server";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";

type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

function buildDraft(): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-20T12:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Threshold / CSS 25m Pool draft",
    titleSuggestions: ["Threshold / CSS 25m Pool draft"],
    description: "Threshold session in pool mode.",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 2200,
    targetTimeMin: null,
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    basePaceSecondsPer100m: 128,
    usedCssPaceLabel: "1:58",
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: ["kickboard"],
    focusText: "Breathing timing",
    goalTitle: "Swim 1500m stronger",
    constraintText: "Keep the first half controlled.",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup",
        name: "Easy warmup swim",
        stroke: "freestyle",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swimming with relaxed breathing.",
        notes: "Start smooth.",
      },
      {
        id: "step-2",
        category: "main",
        name: "Threshold / CSS main set",
        stroke: "freestyle",
        intensity: "moderate",
        durationMode: "distance",
        distanceM: 1400,
        timeMin: null,
        targetSummary: "Swim around CSS-derived pacing.",
        notes: "Suggested structure: 14 x 100m around CSS pace.",
      },
      {
        id: "step-3",
        category: "cooldown",
        name: "Cooldown swim",
        stroke: "choice",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swim to bring the heart rate down.",
        notes: "Finish calmer than you started.",
      },
    ],
  };
}

function buildWorkoutRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  return {
    id: "workout-1",
    user_id: "user-1",
    source_kind: "ai_session_v1",
    status: "accepted",
    generator_kind: "rule_engine_v1",
    source_fingerprint: "fingerprint-1",
    title: "Threshold / CSS 25m Pool draft",
    title_suggestions: ["Threshold / CSS 25m Pool draft"],
    description: "Threshold session in pool mode.",
    environment: "pool",
    pool_length_m: 25,
    session_type: "threshold_css",
    effort: "moderate",
    size_mode: "distance",
    target_distance_m: 2200,
    target_time_min: null,
    total_distance_m: 2200,
    estimated_duration_min: 45,
    base_pace_seconds_per_100: 128,
    used_css_pace_label: "1:58",
    allowed_strokes: ["freestyle"],
    equipment_allowlist: ["kickboard"],
    focus_text: "Breathing timing",
    goal_title: "Swim 1500m stronger",
    constraint_text: "Keep the first half controlled.",
    warnings: [],
    steps: buildDraft().steps,
    generated_at: "2026-03-20T12:10:00.000Z",
    accepted_at: "2026-03-20T12:18:00.000Z",
    created_at: "2026-03-20T12:18:00.000Z",
    updated_at: "2026-03-20T12:20:00.000Z",
    ...overrides,
  };
}

describe("workouts server", () => {
  it("builds a canonical insert payload from a valid session draft", () => {
    const insert = buildWorkoutInsert("user-1", buildDraft());

    expect(insert.user_id).toBe("user-1");
    expect(insert.source_kind).toBe("ai_session_v1");
    expect(insert.status).toBe("accepted");
    expect(insert.total_distance_m).toBe(2200);
    expect(insert.estimated_duration_min).toBe(51);
    expect(insert.allowed_strokes).toEqual(["freestyle"]);
  });

  it("maps persisted workout rows back into editor and summary records", () => {
    const row = buildWorkoutRow();

    const editorRecord = buildWorkoutEditorRecord(row);
    const summary = buildWorkoutSummary(row);

    expect(editorRecord.id).toBe("workout-1");
    expect(editorRecord.draft.title).toBe("Threshold / CSS 25m Pool draft");
    expect(summary.title).toBe("Threshold / CSS 25m Pool draft");
    expect(summary.totalDistanceM).toBe(2200);
  });

  it("marks selected workouts as missing when the id is not found", async () => {
    const recentLimit = vi.fn().mockResolvedValue({
      data: [buildWorkoutRow()],
      error: null,
    });
    const recentOrder = vi.fn(() => ({ limit: recentLimit }));
    const recentEq = vi.fn(() => ({ order: recentOrder }));

    const selectedMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const selectedIdEq = vi.fn(() => ({ maybeSingle: selectedMaybeSingle }));
    const selectedUserEq = vi.fn(() => ({ eq: selectedIdEq }));

    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() => ({ eq: recentEq })),
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({ eq: selectedUserEq })),
        }),
    };

    const snapshot = await loadWorkoutLibrarySnapshot(
      supabase as never,
      "user-1",
      "11111111-1111-4111-8111-111111111111"
    );

    expect(snapshot.schemaReady).toBe(true);
    expect(snapshot.selectedWorkout).toBeNull();
    expect(snapshot.selectedWorkoutMissing).toBe(true);
    expect(snapshot.recentWorkouts).toHaveLength(1);
  });
});
