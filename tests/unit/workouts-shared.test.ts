import { describe, expect, it } from "vitest";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import {
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
} from "@/lib/workouts/shared";

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

  it("builds a canonical handoff text export with workout metadata and steps", () => {
    const draft = buildDraft();
    const text = buildWorkoutHandoffText(draft, {
      draftState: "canonical",
    });

    expect(buildWorkoutHandoffFileName(draft, { draftState: "canonical" })).toBe(
      "freeswimming-garmin-readiness-draft-handoff.txt"
    );
    expect(text).toContain("FreeSwimming workout handoff");
    expect(text).toContain("Source: Canonical workout");
    expect(text).toContain("Title: Garmin readiness draft");
    expect(text).toContain("Garmin/export readiness: Ready");
    expect(text).toContain("Session type: Threshold / CSS");
    expect(text).toContain("1. Warmup swim");
    expect(text).toContain("Warmup · 400m · Freestyle · Easy");
  });

  it("builds a canonical garmin-ready export payload with deterministic workout metadata", () => {
    const draft = buildDraft();
    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "canonical",
      workoutId: "workout-1",
    });

    expect(
      buildWorkoutGarminReadyExportFileName(draft, { draftState: "canonical" })
    ).toBe("freeswimming-garmin-readiness-draft-garmin-ready.json");
    expect(exportPayload).toMatchObject({
      version: 1,
      kind: "freeswimming_garmin_ready_workout_v1",
      draftState: "canonical",
      workoutId: "workout-1",
      diagnostics: {
        status: "ready",
        issueCount: 0,
      },
      workout: {
        title: "Garmin readiness draft",
        summary: "400m · ~10 min · Moderate",
        environment: {
          value: "pool",
          subSport: "lap_swimming",
          poolLengthM: 25,
        },
        sessionType: {
          value: "threshold_css",
          label: "Threshold / CSS",
        },
        effort: {
          value: "moderate",
          label: "Moderate",
        },
      },
    });
    expect(exportPayload.blocks).toHaveLength(1);
    expect(exportPayload.blocks[0]).toMatchObject({
      kind: "single",
      position: 1,
      mappingStatus: "ready",
      reviewIssueIds: [],
      step: {
        id: "step-1",
        position: 1,
        mappingStatus: "ready",
        category: {
          value: "warmup",
          label: "Warmup",
        },
        stroke: {
          value: "freestyle",
          label: "Freestyle",
        },
        duration: {
          mode: "distance",
          summary: "400m",
        },
        target: {
          mode: "none",
          label: "No target",
          draftSummary: "Easy settle-in.",
        },
      },
    });
  });

  it("builds a local-draft handoff text export with review issues", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Review handoff draft",
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat review swim",
          stroke: "im_by_round",
          drillType: "pull",
          equipment: "fins",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Truthful mapping check.",
          notes: "Keep the export honest.",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat review rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetSummary: "Leave room for setup.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
      ],
    };

    const text = buildWorkoutHandoffText(draft, {
      draftState: "local_draft",
    });

    expect(buildWorkoutHandoffFileName(draft, { draftState: "local_draft" })).toBe(
      "freeswimming-review-handoff-draft-handoff-draft.txt"
    );
    expect(text).toContain("Source: Local draft");
    expect(text).toContain("Garmin/export readiness: Review");
    expect(text).toContain("Review before export/send");
    expect(text).toContain("IM by round");
    expect(text).toContain("Pull");
    expect(text).toContain("Fins");
    expect(text).toContain("1. Repeat block · 4 rounds · 100m + 2:00 per round");
    expect(text).toContain("1.1 Repeat review swim");
    expect(text).toContain("1.2 Repeat review rest");
  });

  it("builds a local-draft garmin-ready export payload with repeat blocks and review issue linkage", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Review export draft",
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat review swim",
          stroke: "im_by_round",
          drillType: "pull",
          equipment: "fins",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Truthful mapping check.",
          notes: "Keep the export honest.",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat review rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetSummary: "Leave room for setup.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
        },
      ],
    };

    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "local_draft",
      workoutId: "workout-2",
    });

    expect(
      buildWorkoutGarminReadyExportFileName(draft, { draftState: "local_draft" })
    ).toBe("freeswimming-review-export-draft-garmin-ready-draft.json");
    expect(exportPayload.diagnostics.status).toBe("review");
    expect(exportPayload.diagnostics.issueCount).toBe(3);
    expect(exportPayload.blocks).toHaveLength(1);
    expect(exportPayload.blocks[0]).toMatchObject({
      kind: "repeat",
      position: 1,
      repeatGroupId: "repeat-1",
      repeatCount: 4,
      mappingStatus: "review",
      roundSummary: "4 rounds · 100m + 2:00 per round",
      roundDistanceM: 100,
      roundDurationSeconds: 120,
    });

    if (exportPayload.blocks[0]?.kind !== "repeat") {
      throw new Error("Expected repeat block export.");
    }

    expect(exportPayload.blocks[0].reviewIssueIds).toEqual([
      "step-1-im-by-round",
      "step-1-drill-focus",
      "step-1-equipment",
    ]);
    expect(exportPayload.blocks[0].steps[0]).toMatchObject({
      id: "step-1",
      position: 1,
      mappingStatus: "review",
      reviewIssueIds: ["step-1-im-by-round", "step-1-drill-focus", "step-1-equipment"],
      stroke: {
        value: "im_by_round",
        label: "IM by round",
      },
      drillType: {
        value: "pull",
        label: "Pull",
      },
      equipment: {
        value: "fins",
        label: "Fins",
      },
    });
    expect(exportPayload.blocks[0].steps[1]).toMatchObject({
      id: "step-2",
      position: 2,
      mappingStatus: "ready",
      reviewIssueIds: [],
      duration: {
        mode: "send_off",
        summary: "Send-off 2:00",
      },
    });
  });
});
