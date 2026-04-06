import { describe, expect, it } from "vitest";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import {
  buildWorkoutPdfFileName,
  buildWorkoutPdfHtmlDocument,
  buildWorkoutPdfModel,
  getDefaultWorkoutPoolsideFocusIds,
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
  selectWorkoutPoolsideFocusTitles,
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
    expect(text).toContain("Session note: Readiness coverage for workout builder handoff.");
    expect(text).toContain("1. Warmup swim");
    expect(text).toContain("Warmup · 400m · Freestyle · Easy");
  });

  it("builds a canonical workout PDF model with deterministic metadata and step summaries", () => {
    const draft = buildDraft();
    const model = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
    });

    expect(buildWorkoutPdfFileName(draft, { draftState: "canonical" })).toBe(
      "freeswimming-garmin-readiness-draft.pdf"
    );
    expect(model).toMatchObject({
      fileName: "freeswimming-garmin-readiness-draft.pdf",
      draftState: "canonical",
      variant: "standard",
      sourceLabel: "Canonical workout",
      title: "Garmin readiness draft",
      sessionSummary: "400m · ~10 min · Moderate",
      environmentSummary: "Pool (25m)",
      sessionTypeLabel: "Threshold / CSS",
      effortLabel: "Moderate",
    });
    expect(model.blocks).toHaveLength(1);
    expect(model.blocks[0]).toMatchObject({
      kind: "single",
      label: "1.",
      title: "Warmup swim",
      summary: "Warmup · 400m · Freestyle · Easy",
    });
  });

  it("surfaces unspecified pool size clearly in shared workout summaries", () => {
    const model = buildWorkoutPdfModel(
      {
        ...buildDraft(),
        poolLengthM: null,
      },
      {
        draftState: "canonical",
      }
    );

    expect(model.environmentSummary).toBe("Pool (Unspecified)");
  });

  it("renders the session note label in printable workout PDF html", () => {
    const html = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "canonical",
      variant: "standard",
    });

    expect(html).toContain("<h2>Session note</h2>");
    expect(html).toContain("Readiness coverage for workout builder handoff.");
  });

  it("builds a canonical garmin-ready export payload with deterministic workout metadata", () => {
    const draft = buildDraft();
    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "canonical",
      workoutId: "workout-1",
    });

    expect(buildWorkoutGarminReadyExportFileName(draft, { draftState: "canonical" })).toBe(
      "freeswimming-garmin-readiness-draft-garmin-ready.json"
    );
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

    expect(buildWorkoutGarminReadyExportFileName(draft, { draftState: "local_draft" })).toBe(
      "freeswimming-review-export-draft-garmin-ready-draft.json"
    );
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

  it("surfaces skipped final rest semantics across handoff, pdf, and garmin-ready export output", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Skip final rest draft",
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat review swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Hold the line.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
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
          targetSummary: "Reset before the next round.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
      ],
    };

    const handoffText = buildWorkoutHandoffText(draft, {
      draftState: "canonical",
    });
    const pdfModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
    });
    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "canonical",
      workoutId: "workout-3",
    });

    expect(handoffText).toContain("4 rounds · 100m + 2:00 per round · Final rest skipped");
    expect(pdfModel.blocks[0]).toMatchObject({
      kind: "repeat",
      summary: "4 rounds · 100m + 2:00 per round · Final rest skipped",
    });
    expect(pdfModel.poolsideLines).toContain("P: 2:00 between rounds (final rest skipped)");

    if (exportPayload.blocks[0]?.kind !== "repeat") {
      throw new Error("Expected repeat block export.");
    }

    expect(exportPayload.blocks[0]).toMatchObject({
      repeatEndingRestMode: "skip_last_rest",
      roundSummary: "4 rounds · 100m + 2:00 per round · Final rest skipped",
    });
    expect(exportPayload.blocks[0].steps[0]?.repeatEndingRestMode).toBe("skip_last_rest");
    expect(exportPayload.blocks[0].steps[1]?.repeatEndingRestMode).toBe("skip_last_rest");
  });

  it("builds a printable workout PDF html document for local drafts with repeat review details", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Review print draft",
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat review swim",
          stroke: "reverse_im_order",
          drillType: "pull",
          equipment: "fins",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Truthful mapping check.",
          notes: "Keep the print view honest.",
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

    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "local_draft",
    });

    expect(buildWorkoutPdfFileName(draft, { draftState: "local_draft" })).toBe(
      "freeswimming-review-print-draft-draft.pdf"
    );
    expect(html).toContain("Workout PDF");
    expect(html).toContain("Source: Local draft");
    expect(html).toContain("Review print draft");
    expect(html).toContain(
      "Review 3 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    expect(html).toContain("Repeat block");
    expect(html).toContain("Repeat review swim");
    expect(html).toContain("Reverse IM order (RIMO)");
    expect(html).toContain("Print / Save PDF");
  });

  it("builds a compact poolside note html document with focus points and operational lines", () => {
    const html = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "canonical",
      variant: "poolside",
      focusPoints: ["High elbow catch", "Calm exhale"],
      poolsidePrintStyle: "ink_saver",
      logoUrl: "https://example.com/logos/brand/lockup-domain-ink.png",
    });

    expect(
      buildWorkoutPdfFileName(buildDraft(), { draftState: "canonical", variant: "poolside" })
    ).toBe("freeswimming-garmin-readiness-draft-poolside-note.pdf");
    expect(html).toContain('data-pdf-variant="poolside"');
    expect(html).toContain('data-poolside-print-style="ink_saver"');
    expect(html).toContain("Poolside Note");
    expect(html).toContain("High elbow catch");
    expect(html).toContain("Calm exhale");
    expect(html).toContain("400m");
    expect(html).toContain("Tot: 400m");
    expect(html).toContain("lockup-domain-ink.png");
    expect(html).toContain("Learn. Drill. Swim.");
    expect(html).not.toContain("Compact lane-side note");
  });

  it("prefers the primary poolside focus by default and resolves titles from explicit ids", () => {
    expect(
      getDefaultWorkoutPoolsideFocusIds([
        { id: "focus-1", title: "High elbow catch", isPrimary: true },
        { id: "focus-2", title: "Calm exhale", isPrimary: false },
      ])
    ).toEqual(["focus-1"]);

    expect(
      selectWorkoutPoolsideFocusTitles(
        [
          { id: "focus-1", title: "High elbow catch", isPrimary: true },
          { id: "focus-2", title: "Calm exhale", isPrimary: false },
        ],
        ["focus-2", "missing-focus", "focus-1"]
      )
    ).toEqual(["High elbow catch", "Calm exhale"]);
  });
});
