import { describe, expect, it } from "vitest";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import {
  buildWorkoutPdfFileName,
  buildWorkoutPdfHtmlDocument,
  buildWorkoutPdfModel,
  buildWorkoutSummaryPreviewSections,
  getDefaultWorkoutPoolsideFocusIds,
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
  haveWorkoutDraftChanges,
  normalizeSessionDraftForWorkoutPersistence,
  selectWorkoutPoolsideFocusPoints,
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

function readPoolsideDataAttribute(html: string, attribute: string) {
  const attributeMatch = html.match(new RegExp(`${attribute}="([^"]+)"`));

  expect(attributeMatch?.[1]).toBeTruthy();

  return attributeMatch?.[1] ?? "";
}

describe("workouts shared readiness", () => {
  it("reports ready when the draft stays inside the current builder contract", () => {
    const report = buildWorkoutGarminReadinessReport(buildDraft());

    expect(report.status).toBe("ready");
    expect(report.summary).toBe("Ready for the planned Garmin/export handoff.");
    expect(report.issues).toEqual([]);
  });

  it("keeps supported pool stroke and drill semantics ready while unresolved equipment stays in review", () => {
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
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("Fins");
    expect(report.issues[0]?.detail).toContain("handoff, PDF, and Garmin-ready export output");
    expect(report.issues[0]?.detail).toContain("Manual Garmin translation is still required");
  });

  it("keeps convenience stroke and drill review warnings outside the pool parity path", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      environment: "open_water",
      poolLengthM: null,
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Open water review step",
          stroke: "reverse_im_order",
          drillType: "pull",
          equipment: "none",
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
      "Review 2 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(2);
    expect(report.issues[0]?.detail).toContain("Reverse IM order (RIMO)");
    expect(report.issues[1]?.detail).toContain("Pull");
  });

  it("reports review when a pool workout exceeds Garmin's documented active-step cap", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      steps: Array.from({ length: 101 }, (_, index) => ({
        id: `step-${index + 1}`,
        category: "main" as const,
        name: `Main step ${index + 1}`,
        stroke: "freestyle" as const,
        intensity: "moderate" as const,
        durationMode: "distance" as const,
        distanceM: 25,
        timeMin: null,
        targetSummary: "",
        notes: "",
      })),
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("101 active workout steps");
    expect(report.issues[0]?.detail).toContain("100 workout steps");
  });

  it("reports review when a pool workout has no exact pool size set", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      poolLengthM: null,
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("no exact pool size set");
    expect(report.issues[0]?.detail).toContain("Choose a pool size before Garmin/export handoff");
    expect(report.issues[0]?.detail).toContain("distance labels, totals, and device translation");
  });

  it("reports review when a pool repeat block keeps the last rest interval", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Hold the line.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetSummary: "Reset before the next round.",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
      ],
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("last rest interval");
    expect(report.issues[0]?.detail).toContain("Step 1 (Repeat swim)");
    expect(report.issues[0]?.detail).toContain("older watches skip the final rest instead");
  });

  it("ignores manual-pool derived step labels when checking unsaved changes", () => {
    const savedDraft: SessionDraft = {
      version: 1,
      status: "draft",
      generatorKind: "rule_engine_v1",
      createdAt: "2026-04-08T12:00:00.000Z",
      sourceFingerprint: "manual-empty-pool-20260408120000",
      title: "Untitled pool session",
      titleSuggestions: ["Untitled pool session"],
      description: "",
      environment: "pool",
      poolLengthM: 25,
      sessionType: "endurance",
      effort: "moderate",
      sizeMode: "distance",
      targetDistanceM: null,
      targetTimeMin: null,
      totalDistanceM: 100,
      estimatedDurationMin: null,
      basePaceSecondsPer100m: 120,
      usedCssPaceLabel: null,
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
      focusText: null,
      goalTitle: null,
      constraintText: null,
      warnings: [],
      steps: [
        {
          id: "manual-step-1",
          category: "main",
          name: "First step",
          stroke: "freestyle",
          drillType: "none",
          equipment: "none",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetMode: "none",
          effortTarget: null,
          targetPaceSecondsPer100m: null,
          cssTargetOffsetSeconds: null,
          cssSendOffOffsetSeconds: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: null,
          repeatCount: null,
          repeatEndingRestMode: null,
        },
      ],
    };

    const editorSyncedDraft: SessionDraft = {
      ...savedDraft,
      steps: [
        {
          ...savedDraft.steps[0]!,
          name: "100m · Freestyle · Moderate",
          targetSummary: "legacy hidden summary should not keep the draft dirty",
        },
      ],
    };

    expect(haveWorkoutDraftChanges(editorSyncedDraft, savedDraft)).toBe(false);
  });

  it("reports review when send-off time is not authored as a rest after a distance-based swim step", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Time swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "time",
          distanceM: null,
          timeMin: 6,
          targetSummary: "Hold rhythm.",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Send-off rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetSummary: "Leave on the clock.",
          notes: "",
        },
      ],
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("Send-Off Time");
    expect(report.issues[0]?.detail).toContain("Lap Button Press instead");
    expect(report.issues[0]?.detail).toContain("is not a distance-based swim step");
  });

  it("reports review for CSS-relative pool timing even when the send-off placement itself is valid", () => {
    const report = buildWorkoutGarminReadinessReport({
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "CSS swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "Hold CSS shape.",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "CSS send-off rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "css_send_off",
          distanceM: null,
          timeMin: null,
          cssSendOffOffsetSeconds: 2,
          targetSummary: "Leave 2 seconds over CSS.",
          notes: "",
        },
      ],
    });

    expect(report.status).toBe("review");
    expect(report.summary).toBe(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]?.detail).toContain("CSS-relative pacing");
    expect(report.issues[0]?.detail).toContain(
      "Step 2 (CSS send-off rest) (CSS-Based Send-Off Time)"
    );
    expect(report.issues[0]?.detail).toContain("2:00/100m if no CSS is set");
    expect(report.issues[0]?.detail).toContain("2:08/100m as the workout CSS baseline");
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

  it("surfaces missing pool size clearly in shared workout summaries", () => {
    const model = buildWorkoutPdfModel(
      {
        ...buildDraft(),
        poolLengthM: null,
      },
      {
        draftState: "canonical",
      }
    );

    expect(model.environmentSummary).toBe("Pool (size not set)");
  });

  it("renders the session note label in printable workout PDF html", () => {
    const html = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "canonical",
      variant: "standard",
    });

    expect(html).toContain("<h2>Session note</h2>");
    expect(html).toContain("Readiness coverage for workout builder handoff.");
  });

  it("keeps pool execution wording aligned across handoff, pdf, export, and poolside outputs", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Pool execution wording draft",
      steps: [
        {
          id: "step-1",
          category: "swim",
          name: "Open swim step",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "lap_button",
          distanceM: null,
          timeMin: null,
          targetSummary: "Stay tall through the turn.",
          notes: "Count strokes off every wall.",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Open rest step",
          stroke: "choice",
          intensity: "easy",
          durationMode: "lap_button",
          distanceM: null,
          timeMin: null,
          targetSummary: "Reset before the next send-off.",
          notes: "Breathe before you leave.",
        },
        {
          id: "step-3",
          category: "rest",
          name: "Send-off rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "send_off",
          distanceM: null,
          timeMin: 2,
          targetSummary: "",
          notes: "",
        },
      ],
    };

    const handoffText = buildWorkoutHandoffText(draft, {
      draftState: "canonical",
    });
    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "standard",
    });
    const pdfModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
    });
    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "canonical",
      workoutId: "workout-output-1",
    });

    expect(handoffText).toContain("Swim · Lap Button Press · Freestyle · Moderate");
    expect(handoffText).toContain("Rest · Lap Button Press · Easy");
    expect(handoffText).toContain("Target summary: Stay tall through the turn.");
    expect(handoffText).toContain("Notes: Count strokes off every wall.");
    expect(html).toContain("Target summary: Stay tall through the turn.");
    expect(html).toContain("Notes: Count strokes off every wall.");
    expect(pdfModel.poolsideLines).toContain("Lap Button Press · Freestyle · Moderate");
    expect(pdfModel.poolsideLines).toContain("Lap Button Press");
    expect(pdfModel.poolsideLines).toContain("Send-Off 2:00");

    if (exportPayload.blocks[0]?.kind !== "single") {
      throw new Error("Expected first block to be a single-step export.");
    }

    if (exportPayload.blocks[1]?.kind !== "single") {
      throw new Error("Expected second block to be a single-step export.");
    }

    if (exportPayload.blocks[2]?.kind !== "single") {
      throw new Error("Expected third block to be a single-step export.");
    }

    expect(exportPayload.blocks[0].step.duration).toMatchObject({
      mode: "lap_button",
      label: "Lap Button Press",
      summary: "Lap Button Press",
    });
    expect(exportPayload.blocks[0].step.target).toMatchObject({
      mode: "none",
      label: "No target",
      draftSummary: "Stay tall through the turn.",
    });
    expect(exportPayload.blocks[1].step.duration).toMatchObject({
      mode: "lap_button",
      label: "Lap Button Press",
      summary: "Lap Button Press",
    });
    expect(exportPayload.blocks[2].step.duration).toMatchObject({
      mode: "send_off",
      label: "Send-Off Time",
      summary: "Send-Off Time 2:00",
    });
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

  it("normalizes legacy workout drafts that omit description instead of crashing", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      description: undefined,
    } as unknown as SessionDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toBe("");
    }
  });

  it("defaults legacy workout drafts without sizeMode to distance when distance data exists", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      sizeMode: undefined,
    } as unknown as SessionDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sizeMode).toBe("distance");
      expect(result.value.targetDistanceM).toBe(1200);
    }
  });

  it("infers estimated-time size mode when a legacy workout only carries target time", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      sizeMode: undefined,
      targetDistanceM: null,
      targetTimeMin: 30,
    } as unknown as SessionDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sizeMode).toBe("estimated_time");
      expect(result.value.targetTimeMin).toBe(30);
    }
  });

  it("infers the session stroke allowlist from workout steps when legacy drafts omit it", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      allowedStrokes: undefined,
    } as unknown as SessionDraft);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.allowedStrokes).toContain("freestyle");
    }
  });

  it("still rejects an explicitly empty stroke allowlist when no step strokes can recover it", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      allowedStrokes: [],
      steps: [
        {
          ...buildDraft().steps[0],
          stroke: "choice",
        },
      ],
    });

    expect(result).toEqual({
      ok: false,
      error: "Select at least one session stroke before saving.",
    });
  });

  it("rejects workout descriptions above the persistence limit", () => {
    const result = normalizeSessionDraftForWorkoutPersistence({
      ...buildDraft(),
      description: "a".repeat(601),
    });

    expect(result).toEqual({
      ok: false,
      error: "Workout description must stay under 600 characters.",
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
    expect(text).toContain("last rest interval");
    expect(text).toContain("older watches skip the final rest instead");
    expect(text).toContain("IM by round");
    expect(text).toContain("Pull");
    expect(text).toContain("Fins");
    expect(text).toContain("handoff, PDF, and Garmin-ready export output");
    expect(text).toContain("Manual Garmin translation is still required");
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
    expect(exportPayload.diagnostics.issueCount).toBe(2);
    expect(exportPayload.diagnostics.issues[0]?.detail).toContain("last rest interval");
    expect(exportPayload.diagnostics.issues[0]?.detail).toContain(
      "older watches skip the final rest instead"
    );
    expect(exportPayload.diagnostics.issues[1]?.detail).toContain(
      "Garmin's documented swim-workout builder does not list a matching equipment field"
    );
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

    expect(exportPayload.blocks[0].reviewIssueIds).toEqual(["step-1-equipment"]);
    expect(exportPayload.blocks[0].steps[0]).toMatchObject({
      id: "step-1",
      position: 1,
      mappingStatus: "review",
      reviewIssueIds: ["step-1-equipment"],
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
        summary: "Send-Off Time 2:00",
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
    const poolsideHtml = buildWorkoutPdfHtmlDocument(draft, {
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
    expect(pdfModel.poolsideLines).toContain("4 x 100m · Freestyle · Moderate");
    expect(poolsideHtml).toContain("Send-Off 2:00");
    expect(poolsideHtml).not.toContain("Final rest skipped");
    expect(poolsideHtml).not.toContain("P:");

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
      "Review 2 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    expect(html).toContain("last rest interval");
    expect(html).toContain("older watches skip the final rest instead");
    expect(html).toContain("Manual Garmin translation is still required.");
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
    expect(html).toContain('data-poolside-session-note-mode="off"');
    expect(html).toContain('data-poolside-step-notes-mode="off"');
    expect(html).toContain("High elbow catch");
    expect(html).toContain("Calm exhale");
    expect(html).toContain("400m");
    expect(html).toContain("Total");
    expect(html).toContain('data-testid="workout-pdf-total"');
    expect(html).toContain('hero-total-value">400m<');
    expect(html).toContain('class="brand-mark brand-mark-poolside"');
    expect(html).toContain('class="brand-logo brand-logo-poolside"');
    expect(html).toContain('src="https://example.com/logos/brand/lockup-domain-ink.png"');
    expect(html).toContain(">Print Preview<");
    expect(html).toContain("Learn.");
    expect(html).toContain("Swim.");
    expect(html).not.toContain(">Poolside Note<");
    expect(html).not.toContain("Pool session execution");
    expect(html).not.toContain("Source: Local draft");
    expect(html).not.toContain(">Color mode<");
    expect(html).not.toContain(">Ink saver<");
    expect(html).not.toContain(">Portrait<");
    expect(html).not.toContain(">Landscape<");
    expect(html).not.toContain("Compact lane-side note");
    expect(html).not.toContain("Start smooth.");
    expect(html).not.toContain("~10 min");
    expect(html).toContain("400m · Freestyle · Easy");
    expect(html).not.toContain("P:");
    expect(readPoolsideDataAttribute(html, "data-poolside-width-profile")).toBe("compact");
    expect(readPoolsideDataAttribute(html, "data-poolside-content-driver")).toBe("line");
    expect(readPoolsideDataAttribute(html, "data-poolside-page-width-mm")).toBe("90");
    expect(html).toContain("size: A4;");
    expect(html).not.toContain("size: A4 portrait");
    expect(html).not.toContain("size: A4 landscape");
    expect(html).toContain("width: min(100%, var(--poolside-page-width))");
    expect(html).toContain("--poolside-page-width: 90mm;");
    expect(html).toContain("--poolside-print-width: 86mm;");
    expect(html).toContain("width: fit-content;");
    expect(html).toContain("margin: 8mm;");
    expect(html).not.toContain("width: min(100%, 144mm)");
    expect(html).not.toContain("margin: 12mm;");
  });

  it("adds poolside session and selected step notes only when preview controls ask for them", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      description: "Bring the snorkel and keep the main set calm.",
      steps: [
        {
          ...buildDraft().steps[0],
          notes: "Settle into long strokes.",
        },
        {
          id: "step-2",
          category: "drill",
          name: "Catch drill",
          stroke: "freestyle",
          drillType: "drill",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 50,
          timeMin: null,
          targetSummary: "",
          notes: "Single-arm catch with the non-working arm forward.",
        },
      ],
    };
    const defaultHtml = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      focusPoints: ["High elbow catch"],
    });
    const drillNotesHtml = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      focusPoints: ["High elbow catch"],
      poolsideSessionNoteMode: "include",
      poolsideStepNotesMode: "drills_only",
    });
    const allNotesHtml = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideStepNotesMode: "all",
    });

    expect(defaultHtml).toContain('data-poolside-session-note-mode="off"');
    expect(defaultHtml).toContain('data-poolside-step-notes-mode="off"');
    expect(defaultHtml).not.toContain("Bring the snorkel");
    expect(defaultHtml).not.toContain("Single-arm catch");
    expect(drillNotesHtml).toContain('data-poolside-session-note-mode="include"');
    expect(drillNotesHtml).toContain('data-poolside-step-notes-mode="drills_only"');
    expect(drillNotesHtml).toContain("Session note");
    expect(drillNotesHtml).toContain("Bring the snorkel and keep the main set calm.");
    expect(drillNotesHtml).toContain("50m · Freestyle · Catch drill · Easy");
    expect(drillNotesHtml).not.toContain("50m · Freestyle · Drill · Catch drill · Easy");
    expect(drillNotesHtml).toContain("Single-arm catch with the non-working arm forward.");
    expect(drillNotesHtml).not.toContain("Settle into long strokes.");
    expect(allNotesHtml).toContain("Single-arm catch with the non-working arm forward.");
    expect(allNotesHtml).toContain("Settle into long strokes.");
  });

  it("falls back from generic poolside drill names without duplicating the drill label", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      steps: [
        {
          ...buildDraft().steps[0],
          category: "warmup",
          name: "Drill",
          stroke: "freestyle",
          drillType: "drill",
          durationMode: "distance",
          distanceM: 50,
        },
      ],
    };

    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
    });

    expect(html).toContain("50m · Freestyle · Drill · Easy");
    expect(html).not.toContain("50m · Freestyle · Drill · Drill · Easy");
  });

  it("uses concrete poolside drill names from manual-pool Drill Type steps", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      steps: [
        {
          ...buildDraft().steps[0],
          category: "warmup",
          name: "Catch drill",
          stroke: "freestyle",
          drillType: "drill",
          durationMode: "distance",
          distanceM: 50,
        },
      ],
    };

    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
    });

    expect(html).toContain("50m · Freestyle · Catch drill · Easy");
    expect(html).not.toContain("50m · Freestyle · Drill · Easy");
  });

  it("can render an embedded poolside preview without the standalone toolbar chrome", () => {
    const html = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "local_draft",
      variant: "poolside",
      previewChrome: "embedded",
    });

    expect(html).toContain('data-pdf-variant="poolside"');
    expect(html).not.toContain('<div class="toolbar">');
    expect(html).not.toContain(">Print / Save PDF<");
    expect(html).not.toContain(">Close<");
    expect(html).not.toContain("@media (max-width: 900px)");
  });

  it("keeps long poolside focus text inside the chosen compact width", () => {
    const compactHtml = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "canonical",
      variant: "poolside",
      focusPoints: ["High elbow catch"],
      poolsidePrintStyle: "ink_saver",
    });
    const longFocusHtml = buildWorkoutPdfHtmlDocument(buildDraft(), {
      draftState: "canonical",
      variant: "poolside",
      focusPoints: [
        "High elbow catch: Keep the forearm vertical, soften the breath timing, and let the note wrap down the page instead of widening the printable artifact.",
      ],
      poolsidePrintStyle: "ink_saver",
    });

    expect(readPoolsideDataAttribute(compactHtml, "data-poolside-width-profile")).toBe("compact");
    expect(readPoolsideDataAttribute(longFocusHtml, "data-poolside-width-profile")).toBe("compact");
    expect(readPoolsideDataAttribute(compactHtml, "data-poolside-page-width-mm")).toBe("90");
    expect(readPoolsideDataAttribute(longFocusHtml, "data-poolside-page-width-mm")).toBe("90");
    expect(readPoolsideDataAttribute(longFocusHtml, "data-poolside-content-driver")).toBe("line");
    expect(longFocusHtml).toContain("let the note wrap down the page");
  });

  it("uses Mod in abbreviated poolside notation when a poolside line includes moderate effort", () => {
    const draft = {
      ...buildDraft(),
      steps: [
        {
          ...buildDraft().steps[0],
          intensity: "moderate" as const,
        },
      ],
    };
    const pdfModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
    });
    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
    });

    expect(pdfModel.poolsideLines).toContain("400m · Free · Mod");
    expect(html).toContain("400m · Free · Mod");
    expect(html).not.toContain("400m · Freestyle · Moderate");
  });

  it("uses S in abbreviated poolside notation when a poolside line includes snorkel equipment", () => {
    const draft = {
      ...buildDraft(),
      equipmentAllowlist: ["snorkel" as const],
      steps: [
        {
          ...buildDraft().steps[0],
          equipment: "snorkel" as const,
        },
      ],
    };
    const pdfModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
    });
    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
    });

    expect(pdfModel.poolsideLines).toContain("400m · Free · S · Easy");
    expect(html).toContain("400m · Free · S · Easy");
    expect(html).not.toContain("400m · Free · Snorkel · Easy");
  });

  it("uses a dedicated landscape header composition without the old summary pill", () => {
    const html = buildWorkoutPdfHtmlDocument(
      {
        ...buildDraft(),
        focusText: "",
      },
      {
        draftState: "canonical",
        variant: "poolside",
        poolsidePrintLayout: "landscape",
        poolsidePrintStyle: "ink_saver",
        focusPoints: [],
      }
    );

    expect(html).toContain('<header class="hero hero-landscape">');
    expect(html).toContain('<div class="body body-landscape-columns">');
    expect(html).not.toContain('data-testid="workout-pdf-focus-points"');
    expect(html).toContain('data-poolside-print-layout="landscape"');
    expect(readPoolsideDataAttribute(html, "data-poolside-width-profile")).toBe("compact");
    expect(readPoolsideDataAttribute(html, "data-poolside-content-driver")).toBe("line");
    expect(readPoolsideDataAttribute(html, "data-poolside-page-width-mm")).toBe("142");
    expect(html).toContain("--poolside-page-width: 142mm;");
    expect(html).toContain("--poolside-print-width: 138mm;");
    expect(html).toContain("grid-template-columns: minmax(0, 1fr) auto;");
    expect(html).toContain('hero-total-value">400m<');
    expect(html).toContain('class="brand-mark brand-mark-poolside"');
    expect(html).not.toContain("~10 min");
  });

  it("balances landscape focus by continuing later workout lines below the focus rail", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      totalDistanceM: 700,
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
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Warmup rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-3",
          category: "main",
          name: "Repeat swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "step-4",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "step-5",
          category: "cooldown",
          name: "Cooldown swim",
          stroke: "choice",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 200,
          timeMin: null,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-6",
          category: "rest",
          name: "Cooldown rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
        },
      ],
    };

    const html = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
      poolsidePrintLayout: "landscape",
      poolsidePrintStyle: "ink_saver",
      focusPoints: ["High elbow catch", "Calm exhale before the breath starts"],
    });

    expect(html).toContain("body-landscape-columns");
    expect(html).toContain("poolside-steps-grid");
    expect(html).toContain("poolside-steps-column-primary");
    expect(html).toContain("poolside-steps-column-secondary");
    expect(html.indexOf('<div class="poolside-steps-grid">')).toBeLessThan(
      html.indexOf('<div class="poolside-meta poolside-meta-landscape">')
    );
    expect(html.indexOf("poolside-steps-column-primary")).toBeLessThan(
      html.indexOf("poolside-steps-column-secondary")
    );
    expect(html.indexOf("workout-pdf-focus-points")).toBeGreaterThan(
      html.indexOf("poolside-steps-column-secondary")
    );
  });

  it("expands landscape width from the longest rendered workout line while keeping focus below the step grid", () => {
    const longLineDraft: SessionDraft = {
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Long repeat swim",
          stroke: "freestyle",
          drillType: "kick",
          equipment: "kickboard",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 25,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.17,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-3",
          category: "rest",
          name: "Post set rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          postSetRestForRepeatGroupId: "repeat-1",
        },
      ],
    };

    const html = buildWorkoutPdfHtmlDocument(longLineDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsidePrintLayout: "landscape",
      poolsidePrintStyle: "ink_saver",
      poolsideNotationMode: "full",
      poolsideRestLayout: "below_step",
      focusPoints: ["Calm exhale before the breath starts"],
    });

    expect(readPoolsideDataAttribute(html, "data-poolside-width-profile")).toBe("expanded");
    expect(readPoolsideDataAttribute(html, "data-poolside-content-driver")).toBe("line");
    expect(readPoolsideDataAttribute(html, "data-poolside-page-width-mm")).toBe("160");
    expect(html).toContain("--poolside-page-width: 160mm;");
    expect(html).toContain("--poolside-print-width: 156mm;");
    expect(html).toContain("body-landscape-columns");
    expect(html).toContain("poolside-meta-landscape");
    expect(html).not.toContain("poolside-side-rail");
  });

  it("deduplicates effort labels and inlines ordinary recovery for poolside lines", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "swim",
          name: "Main swim",
          stroke: "freestyle",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 400,
          timeMin: null,
          targetMode: "effort",
          effortTarget: "easy",
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Main rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-3",
          category: "main",
          name: "Repeat swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "step-4",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "step-5",
          category: "rest",
          name: "Post set rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.67,
          targetSummary: "",
          notes: "",
          postSetRestForRepeatGroupId: "repeat-1",
        },
      ],
    };
    const poolsideModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
    });
    const poolsideHtml = buildWorkoutPdfHtmlDocument(draft, {
      draftState: "canonical",
      variant: "poolside",
    });

    expect(poolsideModel.poolsideLines).toContain("400m · Freestyle · Easy · Rest 0:30");
    expect(poolsideModel.poolsideLines).not.toContain("400m · Freestyle · Easy · Easy");
    expect(poolsideModel.poolsideLines).toContain(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30 · Set rest 0:40"
    );
    expect(poolsideModel.poolsideLines).not.toContain("Rest 0:40");
    expect(poolsideHtml).toContain("poolside-line-secondary-text");
    expect(poolsideHtml).toContain("Interval rest 0:30 · Set rest 0:40");
    expect(poolsideHtml).not.toContain(">Rest 0:40<");
  });

  it("ignores machine-formatted step names when building poolside descriptors", () => {
    const poolsideModel = buildWorkoutPdfModel(
      {
        ...buildDraft(),
        totalDistanceM: 200,
        steps: [
          {
            id: "step-1",
            category: "swim",
            name: "200m · Choice · Easy",
            stroke: "choice",
            intensity: "easy",
            durationMode: "distance",
            distanceM: 200,
            timeMin: null,
            targetSummary: "",
            notes: "",
          },
          {
            id: "step-2",
            category: "rest",
            name: "Recover",
            stroke: "choice",
            intensity: "easy",
            durationMode: "fixed_rest",
            distanceM: null,
            timeMin: 0.5,
            targetSummary: "",
            notes: "",
          },
        ],
      },
      {
        draftState: "canonical",
        variant: "poolside",
      }
    );

    expect(poolsideModel.poolsideLines).toEqual(["200m · Choice · Easy · Rest 0:30"]);
  });

  it("keeps both interval rest and set rest truthful when repeats include both", () => {
    const draft: SessionDraft = {
      ...buildDraft(),
      title: "Keep both repeat rests",
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Repeat work",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-3",
          category: "rest",
          name: "Post set rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.67,
          targetSummary: "",
          notes: "",
          postSetRestForRepeatGroupId: "repeat-1",
        },
      ],
    };

    const poolsideModel = buildWorkoutPdfModel(draft, {
      draftState: "canonical",
      variant: "poolside",
    });
    const exportPayload = buildWorkoutGarminReadyExport(draft, {
      draftState: "canonical",
      workoutId: "workout-keep-both",
    });

    expect(poolsideModel.poolsideLines).toContain(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30 · Set rest 0:40"
    );

    if (exportPayload.blocks[0]?.kind !== "repeat") {
      throw new Error("Expected first block to be a repeat export.");
    }

    if (exportPayload.blocks[1]?.kind !== "single") {
      throw new Error("Expected second block to be a single-step export.");
    }

    expect(exportPayload.blocks[0].roundSummary).toBe("4 rounds · 100m + 0:30 per round");
    expect(exportPayload.blocks[1].step.duration.summary).toBe("Fixed Rest Time 0:40");
  });

  it("builds ordered summary preview sections without merging non-contiguous section labels", () => {
    const sections = buildWorkoutSummaryPreviewSections({
      ...buildDraft(),
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
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Warmup rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-3",
          category: "main",
          name: "Main swim",
          stroke: "freestyle",
          intensity: "moderate",
          durationMode: "distance",
          distanceM: 100,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-4",
          category: "rest",
          name: "Main rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 4,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-5",
          category: "cooldown",
          name: "Cooldown swim",
          stroke: "choice",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 200,
          timeMin: null,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-6",
          category: "main",
          name: "Second main swim",
          stroke: "freestyle",
          drillType: "kick",
          equipment: "kickboard",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 25,
          timeMin: null,
          targetSummary: "",
          notes: "",
        },
      ],
    });

    expect(sections.map((section) => section.title)).toEqual([
      "Warmup",
      "Main",
      "Cooldown",
      "Main",
    ]);
    expect(sections[0]?.rows[0]).toMatchObject({
      text: "400m · Freestyle · Easy",
      secondaryText: "Rest 0:30",
    });
    expect(sections[1]?.rows[0]?.text).toContain("4 x 100m · Freestyle · Moderate");
    expect(sections[3]?.rows[0]?.text).toContain("25m · Freestyle · Kick · Kickboard · Easy");
  });

  it("keeps explicit inline rests accented without merging them into the primary line text", () => {
    const inlineDraft: SessionDraft = {
      ...buildDraft(),
      steps: [
        {
          id: "step-1",
          category: "main",
          name: "Long repeat swim",
          stroke: "freestyle",
          drillType: "kick",
          equipment: "kickboard",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 25,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.17,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-3",
          category: "rest",
          name: "Post set rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          postSetRestForRepeatGroupId: "repeat-1",
        },
      ],
    };

    const inlineModel = buildWorkoutPdfModel(inlineDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
      poolsideRestLayout: "inline",
    });
    const inlineHtml = buildWorkoutPdfHtmlDocument(inlineDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "abbreviated",
      poolsideRestLayout: "inline",
    });

    expect(inlineModel.poolsideResolvedRestLayout).toBe("inline");
    expect(inlineModel.poolsideLineItems[0]).toMatchObject({
      text: "16 x 25m · Free · K · KB · Easy",
      secondaryText: "IR 0:10 · SR 0:30",
      secondaryPlacement: "inline",
    });
    expect(readPoolsideDataAttribute(inlineHtml, "data-poolside-rest-layout")).toBe("inline");
    expect(readPoolsideDataAttribute(inlineHtml, "data-poolside-resolved-rest-layout")).toBe(
      "inline"
    );
    expect(inlineHtml).toContain("poolside-line-secondary-inline");
    expect(inlineHtml).toContain('data-secondary-placement="inline"');
    expect(inlineHtml).toContain("IR 0:10 · SR 0:30");
  });

  it("keeps auto rest placement adaptive per row while explicit modes stay global", () => {
    const mixedLengthDraft: SessionDraft = {
      ...buildDraft(),
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
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-2",
          category: "rest",
          name: "Warmup rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
        },
        {
          id: "step-3",
          category: "main",
          name: "Long repeat swim",
          stroke: "freestyle",
          drillType: "kick",
          equipment: "kickboard",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 25,
          timeMin: null,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-4",
          category: "rest",
          name: "Repeat rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.17,
          targetSummary: "",
          notes: "",
          repeatGroupId: "repeat-1",
          repeatCount: 16,
          repeatEndingRestMode: "use_last_rest",
        },
        {
          id: "step-5",
          category: "rest",
          name: "Post set rest",
          stroke: "choice",
          intensity: "easy",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "",
          notes: "",
          postSetRestForRepeatGroupId: "repeat-1",
        },
      ],
    };

    const autoModel = buildWorkoutPdfModel(mixedLengthDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "full",
      poolsideRestLayout: "auto",
    });
    const autoHtml = buildWorkoutPdfHtmlDocument(mixedLengthDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "full",
      poolsideRestLayout: "auto",
    });
    const fullBelowHtml = buildWorkoutPdfHtmlDocument(mixedLengthDraft, {
      draftState: "canonical",
      variant: "poolside",
      poolsideNotationMode: "full",
      poolsideRestLayout: "below_step",
    });

    expect(autoModel.poolsideResolvedRestLayout).toBe("auto");
    expect(autoModel.poolsideLineItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "400m · Freestyle · Easy",
          secondaryText: "Rest 0:30",
          secondaryPlacement: "inline",
        }),
        expect.objectContaining({
          text: "16 x 25m · Freestyle · Kick · Kickboard · Easy",
          secondaryText: "Interval rest 0:10 · Set rest 0:30",
          secondaryPlacement: "below_step",
        }),
      ])
    );
    expect(readPoolsideDataAttribute(autoHtml, "data-poolside-rest-layout")).toBe("auto");
    expect(readPoolsideDataAttribute(autoHtml, "data-poolside-resolved-rest-layout")).toBe("auto");
    expect(autoHtml).toContain('data-secondary-placement="below_step"');
    expect(autoHtml).toContain('data-secondary-placement="inline"');
    expect(autoHtml).toContain("400m · Freestyle · Easy");
    expect(autoHtml).toContain("Rest 0:30");
    expect(autoHtml).toContain("16 x 25m · Freestyle · Kick · Kickboard · Easy");
    expect(autoHtml).toContain("Interval rest 0:10 · Set rest 0:30");
    expect(fullBelowHtml).toContain("poolside-line-secondary-below_step");
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

    expect(
      selectWorkoutPoolsideFocusPoints(
        [
          {
            id: "focus-1",
            title: "High elbow catch",
            description: "Keep the forearm vertical before pressing back.",
            isPrimary: true,
          },
          { id: "focus-2", title: "Calm exhale", description: null, isPrimary: false },
        ],
        ["focus-2", "missing-focus", "focus-1"]
      )
    ).toEqual(["High elbow catch: Keep the forearm vertical before pressing back.", "Calm exhale"]);
  });
});
