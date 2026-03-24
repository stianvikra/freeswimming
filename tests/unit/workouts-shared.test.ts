import { describe, expect, it } from "vitest";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import { buildWorkoutGarminReadinessReport } from "@/lib/workouts/shared";

function buildDraft(): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-24T12:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Garmin readiness draft",
    titleSuggestions: ["Garmin readiness draft"],
    description: "Readiness coverage for workout builder handoff.",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 1200,
    targetTimeMin: null,
    totalDistanceM: 1200,
    estimatedDurationMin: 25,
    basePaceSecondsPer100m: 128,
    usedCssPaceLabel: "2:08",
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: [],
    focusText: "Builder readiness",
    goalTitle: "Ship truthful handoff guidance",
    constraintText: "",
    warnings: [],
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
        notes: "Start smooth.",
      },
    ],
  };
}

describe("workouts shared readiness", () => {
  it("reports ready when the draft stays inside the current builder contract", () => {
    const report = buildWorkoutGarminReadinessReport(buildDraft());

    expect(report.status).toBe("ready");
    expect(report.summary).toBe("Ready for the planned Garmin/export handoff.");
    expect(report.issues).toEqual([]);
  });

  it("reports review issues for convenience strokes, drill metadata, and equipment metadata", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Main set review step",
          stroke: "reverse_im_order",
          drillType: "pull",
          equipment: "fins",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Truthful mapping check.",
          notes: "",
        },
      ],
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 3 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(3);
    expect(report.issues[0]?.detail).toContain("Reverse IM order (RIMO)");
    expect(report.issues[1]?.detail).toContain("Pull");
    expect(report.issues[2]?.detail).toContain("Fins");
  });
});
