import { describe, expect, it } from "vitest";
import {
  buildSessionDraft,
  validateGeneratedSessionDraftOutput,
} from "@/lib/session-generator-v1/server";
import {
  getDefaultSessionGeneratorFormState,
  validateSessionGeneratorFormState,
} from "@/lib/session-generator-v1/shared";
import { normalizeSessionDraftForWorkoutPersistence } from "@/lib/workouts/shared";
import type { GeneratorIntakeHandoffPayload } from "@/lib/generator-intake/shared";

function buildHandoff(): GeneratorIntakeHandoffPayload {
  return {
    version: 1,
    createdAt: "2026-03-20T12:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    notesIncluded: false,
    includedBlocks: ["preferences", "css", "goals", "capability_limits"],
    omittedBlocks: ["personal_records"],
    source: {
      profile: null,
      cssMetric: {
        id: "metric-1",
        metricKey: "css",
        unit: "seconds_per_100m",
        valueSeconds: 118,
        paceLabel: "1:58",
        recordedOn: "2026-03-20",
        sourceNote: null,
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
      },
      preferences: {
        id: "pref-1",
        poolLengthM: 25,
        poolLengthLabel: "25m pool",
        availableDays: ["monday", "wednesday"],
        availableDayLabels: ["Monday", "Wednesday"],
        preferredWeeklySessionCount: 3,
        preferredSessionMinutes: 45,
        preferredSessionMinutesLabel: "45 min",
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
      },
      personalRecords: [],
      openGoals: [
        {
          id: "goal-1",
          title: "Swim 1500m stronger",
          summary: "Build toward a stronger 1500m freestyle.",
          status: "on_track",
          statusLabel: "On track",
          statusTone: "blue",
          goalType: "custom",
          source: "custom",
          progressPercent: 35,
          progressLabel: "35%",
          progressValue: 35,
          targetValue: null,
          targetDate: "2026-05-01",
          targetDistanceM: null,
          targetTimeSeconds: null,
          targetCount: null,
          targetRef: null,
          celebratedAt: null,
          showCelebration: false,
          primaryAction: {
            kind: "link",
            label: "Open goals",
            href: "/my-library/goals",
          },
        },
      ],
      swimCapabilityLimits: [
        {
          id: "limit-drill-1",
          kind: "drill",
          stroke: null,
          strokeLabel: null,
          maxRepeatDistanceM: 25,
          maxRepeatDistanceLabel: "25m",
          maxTotalDistanceM: null,
          maxTotalDistanceLabel: null,
          targetTotalDistanceM: 300,
          targetTotalDistanceLabel: "300m",
          createdAt: "2026-03-20T10:00:00.000Z",
          updatedAt: "2026-03-20T10:00:00.000Z",
        },
        {
          id: "limit-backstroke-1",
          kind: "stroke",
          stroke: "backstroke",
          strokeLabel: "Backstroke",
          maxRepeatDistanceM: 25,
          maxRepeatDistanceLabel: "25m",
          maxTotalDistanceM: 200,
          maxTotalDistanceLabel: "200m",
          targetTotalDistanceM: null,
          targetTotalDistanceLabel: null,
          createdAt: "2026-03-20T10:00:00.000Z",
          updatedAt: "2026-03-20T10:00:00.000Z",
        },
      ],
      activeFocus: null,
    },
    overrides: {
      targetType: "session",
      desiredSessionCount: null,
      desiredSessionMinutes: 45,
      focusText: null,
      constraintText: "Keep the first half controlled.",
    },
    effectiveDefaults: {
      targetType: "session",
      sessionCount: 3,
      sessionMinutes: 45,
      focusText: null,
    },
  };
}

function sumCategoryDistance(
  draft: ReturnType<typeof buildSessionDraft>,
  category: "drill" | "kick"
) {
  return draft.steps
    .filter((step) => step.category === category && step.durationMode === "distance")
    .reduce((total, step) => total + (step.distanceM ?? 0) * (step.repeatCount ?? 1), 0);
}

describe("session generator server", () => {
  it("builds a pool threshold draft with CSS-aware main-set guidance", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "threshold_css",
      effort: "moderate",
      sizeMode: "distance",
      targetDistanceM: "2400",
      targetTimeMin: "45",
      includeDrills: false,
      drillVolumeMode: "coach_decides",
      drillTargetMeters: "300",
      includeKick: true,
      kickVolumeMode: "coach_decides",
      kickTargetMeters: "200",
      kickIntervalMeters: "50",
      restMode: "coach_decides",
      restSeconds: "20",
      allowedStrokes: ["freestyle", "backstroke"],
      equipmentAllowlist: ["kickboard", "fins"],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value, {
      createdAt: "2026-03-20T12:05:00.000Z",
    });

    expect(draft.status).toBe("draft");
    expect(draft.titleSuggestions[0]).toContain("Threshold / CSS");
    expect(draft.usedCssPaceLabel).toBe("1:58");
    expect(draft.steps[0]?.category).toBe("warmup");
    expect(draft.steps.some((step) => step.category === "rest")).toBe(true);
    expect(draft.steps.find((step) => step.id === "kick-repeat-1-step-1")?.repeatCount).toBe(5);
    expect(
      draft.steps.find((step) => step.postSetRestForRepeatGroupId === "kick-repeat-1")?.timeMin
    ).toBeGreaterThan(0);
    expect(draft.steps.find((step) => step.category === "main")?.notes).toContain("CSS");
    expect(draft.totalDistanceM).toBe(2400);
    expect(draft.estimatedDurationMin).toBeGreaterThan(0);
  });

  it("guards open-water drafts away from dedicated drill and kick blocks", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "open_water",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "endurance",
      effort: "moderate",
      sizeMode: "estimated_time",
      targetDistanceM: "2000",
      targetTimeMin: "50",
      includeDrills: true,
      drillVolumeMode: "coach_decides",
      drillTargetMeters: "300",
      includeKick: true,
      kickVolumeMode: "coach_decides",
      kickTargetMeters: "200",
      kickIntervalMeters: "50",
      restMode: "coach_decides",
      restSeconds: "20",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["snorkel"],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);

    expect(draft.environment).toBe("open_water");
    expect(draft.steps.map((step) => step.category)).toEqual(["warmup", "main", "cooldown"]);
    expect(draft.warnings).toContain(
      "Open-water draft review skips dedicated drill blocks in this first slice."
    );
    expect(draft.warnings).toContain(
      "Open-water draft review skips dedicated kick blocks in this first slice."
    );
  });

  it("allows broad estimated durations but blocks sessions over ten hours", () => {
    const handoff = buildHandoff();
    const validLongSession = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      sizeMode: "estimated_time",
      targetTimeMin: "600",
    });
    const tooLongSession = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      sizeMode: "estimated_time",
      targetTimeMin: "601",
    });

    expect(validLongSession.ok).toBe(true);
    expect(tooLongSession).toEqual({
      ok: false,
      error: "Session time limit exceeded. Use 600 min or less.",
    });
  });

  it("builds technical fault correction with explicit drill, kick, and rest choices", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "technical_fault_correction",
      effort: "easy",
      sizeMode: "distance",
      targetDistanceM: "1800",
      targetTimeMin: "45",
      includeDrills: true,
      drillVolumeMode: "explicit",
      drillTargetMeters: "400",
      drillMaxRepeatDistance: "50",
      drillApproxTotalDistance: "400",
      includeKick: true,
      kickVolumeMode: "explicit",
      kickTargetMeters: "200",
      kickIntervalMeters: "50",
      restMode: "explicit",
      restSeconds: "30",
      skillLimitMode: "override",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["kickboard"],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);

    expect(draft.sessionType).toBe("technical_fault_correction");
    expect(draft.steps.find((step) => step.id === "warmup-rest-1")?.timeMin).toBe(0.5);
    expect(draft.steps.find((step) => step.id === "drill-repeat-1-step-1")).toMatchObject({
      category: "drill",
      distanceM: 50,
      repeatCount: 8,
      repeatGroupId: "drill-repeat-1",
    });
    expect(draft.steps.find((step) => step.id === "drill-repeat-1-step-2")?.timeMin).toBe(0.5);
    expect(
      draft.steps.find((step) => step.postSetRestForRepeatGroupId === "drill-repeat-1")?.timeMin
    ).toBe(0.5);
    expect(draft.steps.find((step) => step.id === "kick-repeat-1-step-1")).toMatchObject({
      category: "kick",
      distanceM: 50,
      repeatCount: 4,
      repeatGroupId: "kick-repeat-1",
    });
    expect(draft.steps.find((step) => step.id === "kick-repeat-1-step-1")?.notes).toContain(
      "200m total in 50m max repeats"
    );
    expect(draft.steps.find((step) => step.id === "main-rest-1")?.timeMin).toBe(0.5);
    expect(draft.steps.find((step) => step.id === "cooldown-rest-1")?.timeMin).toBe(0.5);
    expect(draft.totalDistanceM).toBe(1800);
    expect(draft.description).toContain("Rest: 30s requested.");
  });

  it("fails safe when one selected stroke exceeds its max total distance", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "endurance",
      sizeMode: "distance",
      targetDistanceM: "400",
      includeDrills: false,
      includeKick: false,
      allowedStrokes: ["backstroke"],
    });

    expect(validation).toEqual({
      ok: false,
      error:
        "Selected stroke limits are lower than the target distance. Add another stroke or lower the session size.",
    });
  });

  it("keeps yard pool rules canonical while preserving selected unit intent", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "yd",
      sessionType: "endurance",
      sizeMode: "distance",
      targetDistanceM: "1000",
      includeDrills: false,
      includeKick: false,
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);
    const outputValidation = validateGeneratedSessionDraftOutput(validation.value, draft);

    expect(outputValidation).toEqual({ ok: true });
    expect(draft.poolLengthUnit).toBe("yd");
    expect(draft.poolLengthM).toBeCloseTo(22.86, 2);
    expect(draft.targetDistanceM).toBeCloseTo(914.4, 4);
    expect(draft.totalDistanceM).toBeCloseTo(914.4, 4);
    for (const step of draft.steps.filter((step) => step.durationMode === "distance")) {
      expect(((step.distanceM ?? 0) / (draft.poolLengthM ?? 1)) % 1).toBeCloseTo(0, 4);
    }

    const persistenceResult = normalizeSessionDraftForWorkoutPersistence(draft);

    expect(persistenceResult.ok).toBe(true);
    if (!persistenceResult.ok) return;
    expect(persistenceResult.value.poolLengthUnit).toBe("yd");
    expect(persistenceResult.value.poolLengthM).toBeCloseTo(22.86, 2);
    expect(persistenceResult.value.targetDistanceM).toBeCloseTo(914.4, 4);
    expect(persistenceResult.value.totalDistanceM).toBeCloseTo(914.4, 4);
  });

  it("keeps generated pool time targets within the requested duration", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "endurance",
      sizeMode: "estimated_time",
      targetTimeMin: "45",
      includeDrills: false,
      includeKick: false,
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);

    expect(validateGeneratedSessionDraftOutput(validation.value, draft)).toEqual({ ok: true });
    expect(draft.estimatedDurationMin).toBeGreaterThanOrEqual(44);
    expect(draft.estimatedDurationMin).toBeLessThanOrEqual(46);
  });

  it("uses drill and kick approx-per-session limits as output volume targets", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "endurance",
      sizeMode: "distance",
      targetDistanceM: "1600",
      includeDrills: true,
      drillVolumeMode: "coach_decides",
      drillMaxRepeatDistance: "25",
      drillApproxTotalDistance: "300",
      includeKick: true,
      kickVolumeMode: "coach_decides",
      kickIntervalMeters: "50",
      kickApproxTotalDistance: "200",
      skillLimitMode: "override",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["kickboard"],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);

    expect(validateGeneratedSessionDraftOutput(validation.value, draft)).toEqual({ ok: true });
    expect(sumCategoryDistance(draft, "drill")).toBe(300);
    expect(sumCategoryDistance(draft, "kick")).toBe(200);
    expect(
      draft.steps
        .filter((step) => step.category === "drill" && step.durationMode === "distance")
        .every((step) => (step.distanceM ?? 0) <= 25)
    ).toBe(true);
    expect(
      draft.steps
        .filter((step) => step.category === "kick" && step.durationMode === "distance")
        .every((step) => (step.distanceM ?? 0) <= 50)
    ).toBe(true);
    expect(draft.steps.some((step) => step.equipment === "kickboard")).toBe(true);
  });

  it("fails fast when drill and kick rules leave no room for core swimming", () => {
    const handoff = buildHandoff();
    const validation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "endurance",
      sizeMode: "distance",
      targetDistanceM: "400",
      includeDrills: true,
      drillVolumeMode: "explicit",
      drillTargetMeters: "300",
      drillMaxRepeatDistance: "50",
      drillApproxTotalDistance: "300",
      includeKick: true,
      kickVolumeMode: "explicit",
      kickTargetMeters: "200",
      kickIntervalMeters: "50",
      kickApproxTotalDistance: "200",
      skillLimitMode: "override",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["kickboard"],
    });

    expect(validation).toEqual({
      ok: false,
      error:
        "Session Rules leave no room for warmup, main work, and cooldown. Lower drill/kick distance or raise the target distance.",
    });
  });

  it("fails fast when approximate drill or kick volume is shorter than one pool length", () => {
    const handoff = buildHandoff();
    const drillValidation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "50",
      poolLengthUnit: "m",
      includeDrills: true,
      drillVolumeMode: "coach_decides",
      drillMaxRepeatDistance: "50",
      drillApproxTotalDistance: "25",
      includeKick: false,
      skillLimitMode: "override",
    });
    const kickValidation = validateSessionGeneratorFormState({
      ...getDefaultSessionGeneratorFormState(handoff),
      environment: "pool",
      poolLengthM: "50",
      poolLengthUnit: "m",
      includeDrills: false,
      includeKick: true,
      kickVolumeMode: "coach_decides",
      kickIntervalMeters: "50",
      kickApproxTotalDistance: "25",
      skillLimitMode: "override",
    });

    expect(drillValidation).toEqual({
      ok: false,
      error: "Drill approx per session must be at least one pool length.",
    });
    expect(kickValidation).toEqual({
      ok: false,
      error: "Kick approx per session must be at least one pool length.",
    });
  });

  it("structures generated stroke work so max length limits are real workout steps", () => {
    const handoff = buildHandoff();
    const defaults = getDefaultSessionGeneratorFormState(handoff);
    const validation = validateSessionGeneratorFormState({
      ...defaults,
      environment: "pool",
      poolLengthM: "25",
      poolLengthUnit: "m",
      sessionType: "threshold_css",
      sizeMode: "distance",
      targetDistanceM: "1200",
      includeDrills: false,
      includeKick: false,
      skillLimitMode: "override",
      strokeLimits: {
        ...defaults.strokeLimits,
        freestyle: {
          maxRepeatDistance: "100",
          maxTotalDistance: "1200",
        },
      },
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(handoff, validation.value);
    const freestyleDistanceSteps = draft.steps.filter(
      (step) => step.stroke === "freestyle" && step.durationMode === "distance"
    );

    expect(validateGeneratedSessionDraftOutput(validation.value, draft)).toEqual({ ok: true });
    expect(freestyleDistanceSteps.length).toBeGreaterThan(1);
    expect(freestyleDistanceSteps.every((step) => (step.distanceM ?? 0) <= 100)).toBe(true);
    expect(draft.totalDistanceM).toBe(1200);
  });
});
