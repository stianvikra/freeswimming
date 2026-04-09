import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import {
  buildManualWorkoutEmptyDraft,
  buildManualWorkoutStarterDraft,
} from "@/lib/workouts/manual";
import {
  convertMetersToPoolUnitValue,
  convertPoolUnitValueToMeters,
} from "@/lib/session-generator-v1/shared";
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
    poolLengthUnit: "m",
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
    pool_length_unit: "m",
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

  it("supports manual source kind and starter scaffolds", () => {
    const starter = buildManualWorkoutStarterDraft(new Date("2026-03-22T12:00:00.000Z"));
    const insert = buildWorkoutInsert("user-1", starter, "manual");

    expect(insert.source_kind).toBe("manual");
    expect(insert.title).toBe("Manual pool workout");
    expect(Array.isArray(insert.steps)).toBe(true);
    expect(starter.steps.some((step) => step.category === "rest")).toBe(true);
    expect(starter.steps.some((step) => step.durationMode === "fixed_rest")).toBe(true);
  });

  it("supports manual source kind for clean scratch session scaffolds", () => {
    const emptyDraft = buildManualWorkoutEmptyDraft(new Date("2026-03-22T12:00:00.000Z"));
    const insert = buildWorkoutInsert("user-1", emptyDraft, "manual");

    expect(insert.source_kind).toBe("manual");
    expect(insert.title).toBe("Untitled pool session");
    expect(Array.isArray(insert.steps)).toBe(true);
    expect(insert.steps).toHaveLength(1);
    expect(insert.total_distance_m).toBe(100);
    expect(insert.estimated_duration_min).toBe(2);
  });

  it("persists and reloads custom pool lengths for manual builder workouts", () => {
    const customPoolDraft: SessionDraft = {
      ...buildDraft(),
      title: "Custom pool workout",
      titleSuggestions: ["Custom pool workout"],
      poolLengthUnit: "yd",
      poolLengthM: 33.33,
    };

    const insert = buildWorkoutInsert("user-1", customPoolDraft, "manual");
    const storedRow = buildWorkoutRow({
      source_kind: "manual",
      title: "Custom pool workout",
      title_suggestions: ["Custom pool workout"],
      pool_length_unit: "yd",
      pool_length_m: 33.33,
    });
    const editorRecord = buildWorkoutEditorRecord(storedRow);
    const summary = buildWorkoutSummary(storedRow);

    expect(insert.pool_length_unit).toBe("yd");
    expect(insert.pool_length_m).toBe(33.33);
    expect(editorRecord.draft.poolLengthUnit).toBe("yd");
    expect(editorRecord.draft.poolLengthM).toBe(33.33);
    expect(summary.poolLengthUnit).toBe("yd");
    expect(summary.poolLengthM).toBe(33.33);
  });

  it("preserves whole-yard custom distances through save and reload normalization", () => {
    const customDistanceMeters = convertPoolUnitValueToMeters(333, "yd");
    const yardDraft: SessionDraft = {
      ...buildDraft(),
      title: "Whole-yard roundtrip workout",
      titleSuggestions: ["Whole-yard roundtrip workout"],
      poolLengthUnit: "yd",
      poolLengthM: convertPoolUnitValueToMeters(25, "yd"),
      targetDistanceM: customDistanceMeters,
      totalDistanceM: customDistanceMeters,
      steps: [
        {
          ...buildDraft().steps[0],
          distanceM: customDistanceMeters,
        },
      ],
    };

    const insert = buildWorkoutInsert("user-1", yardDraft, "manual");
    const storedRow = buildWorkoutRow({
      source_kind: "manual",
      title: "Whole-yard roundtrip workout",
      title_suggestions: ["Whole-yard roundtrip workout"],
      pool_length_unit: "yd",
      pool_length_m: convertPoolUnitValueToMeters(25, "yd"),
      target_distance_m: insert.target_distance_m,
      total_distance_m: insert.total_distance_m,
      steps: insert.steps,
    });
    const editorRecord = buildWorkoutEditorRecord(storedRow);
    const firstStep = editorRecord.draft.steps[0];

    expect(insert.total_distance_m).toBeCloseTo(customDistanceMeters, 4);
    expect(convertMetersToPoolUnitValue(insert.total_distance_m ?? 0, "yd")).toBe(333);
    expect(firstStep?.distanceM).toBeCloseTo(customDistanceMeters, 4);
    expect(convertMetersToPoolUnitValue(firstStep?.distanceM ?? 0, "yd")).toBe(333);
  });

  it("requires an exact pool size before saving manual builder workouts", () => {
    const missingPoolDraft: SessionDraft = {
      ...buildDraft(),
      title: "Missing pool workout",
      titleSuggestions: ["Missing pool workout"],
      poolLengthM: null,
    };

    expect(() => buildWorkoutInsert("user-1", missingPoolDraft, "manual")).toThrow(
      "Choose an exact pool size before saving."
    );
  });

  it("persists repeat metadata and multiplies totals from grouped repeat steps", () => {
    const repeatDraft: SessionDraft = {
      ...buildDraft(),
      title: "Repeat block workout",
      titleSuggestions: ["Repeat block workout"],
      targetDistanceM: 1000,
      totalDistanceM: 1000,
      steps: [
        {
          id: "step-1",
          category: "warmup",
          name: "Warmup swim",
          stroke: "freestyle",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 400,
          timeMin: null,
          targetSummary: "Easy settle-in.",
          notes: "Relax.",
        },
        {
          id: "repeat-1-step-1",
          category: "main",
          name: "Repeat swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Hold steady pace.",
          notes: "Keep the stroke long.",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
        {
          id: "repeat-1-step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "time",
          distanceM: null,
          timeMin: 1,
          targetSummary: "Short reset.",
          notes: "Breathe before the next round.",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
        {
          id: "step-4",
          category: "cooldown",
          name: "Cooldown swim",
          stroke: "choice",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 200,
          timeMin: null,
          targetSummary: "Easy finish.",
          notes: "Calm breathing.",
        },
      ],
    };

    const insert = buildWorkoutInsert("user-1", repeatDraft, "manual");
    const repeatSteps = (insert.steps as unknown as SessionDraft["steps"]).filter(
      (step) => step.repeatGroupId === "repeat-1"
    );

    expect(insert.total_distance_m).toBe(1000);
    expect(insert.estimated_duration_min).toBeGreaterThan(0);
    expect(repeatSteps).toHaveLength(2);
    expect(repeatSteps.every((step) => step.repeatCount === 4)).toBe(true);
  });

  it("skips the final rest interval in repeat totals when the repeat block opts out", () => {
    const useLastRestDraft: SessionDraft = {
      ...buildDraft(),
      title: "Use last rest workout",
      titleSuggestions: ["Use last rest workout"],
      targetDistanceM: 400,
      totalDistanceM: 400,
      estimatedDurationMin: 12,
      steps: [
        {
          id: "repeat-1-step-1",
          category: "main",
          name: "Repeat swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Hold steady pace.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "repeat-1-step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "time",
          distanceM: null,
          timeMin: 1,
          targetSummary: "Short reset.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
      ],
    };
    const skipLastRestDraft: SessionDraft = {
      ...useLastRestDraft,
      title: "Skip last rest workout",
      titleSuggestions: ["Skip last rest workout"],
      steps: useLastRestDraft.steps.map((step) => ({
        ...step,
        repeatEndingRestMode: "skip_last_rest",
      })),
    };

    const useInsert = buildWorkoutInsert("user-1", useLastRestDraft, "manual");
    const skipInsert = buildWorkoutInsert("user-1", skipLastRestDraft, "manual");
    const skippedRepeatSteps = (skipInsert.steps as unknown as SessionDraft["steps"]).filter(
      (step) => step.repeatGroupId === "repeat-1"
    );

    expect(useInsert.total_distance_m).toBe(400);
    expect(skipInsert.total_distance_m).toBe(400);
    expect(useInsert.estimated_duration_min).toBe(13);
    expect(skipInsert.estimated_duration_min).toBe(12);
    expect(skippedRepeatSteps.every((step) => step.repeatEndingRestMode === "skip_last_rest")).toBe(
      true
    );
  });

  it("uses structured pace targets and fixed rest when computing workout totals", () => {
    const targetDraft: SessionDraft = {
      ...buildDraft(),
      title: "Pace-aware workout",
      titleSuggestions: ["Pace-aware workout"],
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Pace reps",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 400,
          timeMin: null,
          targetMode: "target_pace",
          targetPaceSecondsPer100m: 90,
          targetSummary: "Hold 1:30/100m pace.",
          notes: "Controlled but precise.",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Reset rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 1,
          targetMode: "none",
          targetSummary: "Fixed 1 minute rest.",
          notes: "Reset between rounds.",
        },
        {
          id: "step-3",
          category: "rest",
          name: "Send-off reset",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetMode: "none",
          targetSummary: "Leave every 2:00.",
          notes: "Hold the cycle time.",
        },
        {
          id: "step-4",
          category: "rest",
          name: "CSS send-off reset",
          stroke: "choice",
          intensity: "easy",
          durationMode: "css_send_off",
          distanceM: null,
          timeMin: null,
          cssSendOffOffsetSeconds: 2,
          targetMode: "none",
          targetSummary: "CSS +2 seconds send-off.",
          notes: "Use CSS to anchor the send-off.",
        },
        {
          id: "step-5",
          category: "rest",
          name: "Open reset",
          stroke: "choice",
          intensity: "easy",
          durationMode: "lap_button",
          distanceM: null,
          timeMin: null,
          targetMode: "none",
          targetSummary: "Open rest until ready.",
          notes: "Advance manually when ready.",
        },
      ],
    };

    const insert = buildWorkoutInsert("user-1", targetDraft, "manual");

    expect(insert.total_distance_m).toBe(400);
    expect(insert.estimated_duration_min).toBe(11);
  });

  it("keeps step-level stroke, drill, and equipment context canonical on save", () => {
    const contextDraft: SessionDraft = {
      ...buildDraft(),
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Pull focus backstroke",
          stroke: "backstroke",
          drillType: "pull",
          equipment: "fins",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 300,
          timeMin: null,
          targetMode: "effort",
          effortTarget: "moderate",
          targetSummary: "Backstroke pull focus with fins.",
          notes: "Hold posture and timing.",
        },
        {
          id: "step-2",
          category: "main",
          name: "RIMO pacing block",
          stroke: "reverse_im_order",
          drillType: "none",
          equipment: "none",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 200,
          timeMin: null,
          targetMode: "effort",
          effortTarget: "moderate",
          targetSummary: "Garmin-familiar IM convenience stroke should stay step-local.",
          notes: "Rotate the IM order in reverse without changing session stroke allowlist.",
        },
      ],
    };

    const insert = buildWorkoutInsert("user-1", contextDraft, "manual");
    const savedSteps = insert.steps as unknown as SessionDraft["steps"];

    expect(insert.allowed_strokes).toEqual(["freestyle", "backstroke"]);
    expect(insert.equipment_allowlist).toEqual(["fins"]);
    expect(savedSteps[0]).toMatchObject({
      stroke: "backstroke",
      drillType: "pull",
      equipment: "fins",
    });
    expect(savedSteps[1]).toMatchObject({
      stroke: "reverse_im_order",
      drillType: "none",
      equipment: "none",
    });
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

  it("tolerates legacy persisted workout rows without a description", () => {
    const row = buildWorkoutRow({
      description: undefined as unknown as WorkoutRow["description"],
    });

    const editorRecord = buildWorkoutEditorRecord(row);
    const summary = buildWorkoutSummary(row);

    expect(editorRecord.draft.description).toBe("");
    expect(summary.title).toBe("Threshold / CSS 25m Pool draft");
  });

  it("infers distance size mode for legacy persisted workout rows missing size_mode", () => {
    const row = buildWorkoutRow({
      size_mode: undefined as unknown as WorkoutRow["size_mode"],
      target_distance_m: 2200,
      target_time_min: null,
    });

    const editorRecord = buildWorkoutEditorRecord(row);
    const summary = buildWorkoutSummary(row);

    expect(editorRecord.draft.sizeMode).toBe("distance");
    expect(editorRecord.draft.targetDistanceM).toBe(2200);
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

  it("skips invalid legacy recent workouts instead of crashing the library snapshot", async () => {
    const recentLimit = vi.fn().mockResolvedValue({
      data: [
        buildWorkoutRow(),
        buildWorkoutRow({
          id: "legacy-invalid",
          size_mode: undefined as unknown as WorkoutRow["size_mode"],
          steps: null as unknown as WorkoutRow["steps"],
        }),
      ],
      error: null,
    });
    const recentOrder = vi.fn(() => ({ limit: recentLimit }));
    const recentEq = vi.fn(() => ({ order: recentOrder }));

    const supabase = {
      from: vi.fn().mockReturnValueOnce({
        select: vi.fn(() => ({ eq: recentEq })),
      }),
    };

    const snapshot = await loadWorkoutLibrarySnapshot(supabase as never, "user-1", null);

    expect(snapshot.schemaReady).toBe(true);
    expect(snapshot.loadError).toBeNull();
    expect(snapshot.recentWorkouts).toHaveLength(1);
    expect(snapshot.recentWorkouts[0]?.id).toBe("workout-1");
  });
});
