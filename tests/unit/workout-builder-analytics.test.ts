import { describe, expect, it } from "vitest";
import {
  buildWorkoutBuilderSavedPayload,
  buildWorkoutBuilderStartedPayload,
  getManualWorkoutBuilderEntry,
} from "@/lib/analytics/workout-builder";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";

function buildDraft(overrides?: Partial<SessionDraft>): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-06-09T12:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Private workout title that must not enter analytics",
    titleSuggestions: ["Private workout title that must not enter analytics"],
    description: "Private workout description that must not enter analytics.",
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
    basePaceSecondsPer100m: 118,
    usedCssPaceLabel: "1:58",
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: ["kickboard"],
    focusText: "Private focus text that must not enter analytics.",
    goalTitle: "Private goal title that must not enter analytics.",
    constraintText: "Private constraint that must not enter analytics.",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup",
        name: "Private step name",
        stroke: "freestyle",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Private target summary",
        notes: "Private notes",
      },
    ],
    ...overrides,
  };
}

describe("workout builder analytics", () => {
  it("builds stable manual builder start payloads without route or free-text data", () => {
    expect(getManualWorkoutBuilderEntry("pool")).toBe("manual-pool");
    expect(getManualWorkoutBuilderEntry("open_water")).toBe("manual-open-water");

    expect(
      buildWorkoutBuilderStartedPayload({
        builderMode: "pool",
        hasCssPaceDefault: true,
      })
    ).toEqual({
      source: "workout_builder",
      surface: "my_library_workouts",
      builderMode: "pool",
      builderEntry: "manual-pool",
      hasCssPaceDefault: true,
    });
  });

  it("keeps save payloads low-cardinality and excludes private workout text", () => {
    const payload = buildWorkoutBuilderSavedPayload({
      draft: buildDraft({
        environment: "open_water",
        totalDistanceM: Number.NaN,
        estimatedDurationMin: Number.POSITIVE_INFINITY,
      }),
      sourceKind: "manual",
      saveKind: "first_canonical_save",
    });

    expect(payload).toEqual({
      source: "workout_builder",
      surface: "my_library_workouts",
      sourceKind: "manual",
      saveKind: "first_canonical_save",
      builderMode: "open_water",
      environment: "open_water",
      sessionType: "threshold_css",
      sizeMode: "distance",
      stepCount: 1,
      totalDistanceM: null,
      estimatedDurationMin: null,
    });
    expect(JSON.stringify(payload)).not.toContain("Private");
  });
});
