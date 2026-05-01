import { describe, expect, it } from "vitest";
import { buildSessionDraft } from "@/lib/session-generator-v1/server";
import { validateSessionGeneratorFormState } from "@/lib/session-generator-v1/shared";
import type { GeneratorIntakeHandoffPayload } from "@/lib/generator-intake/shared";

function buildHandoff(): GeneratorIntakeHandoffPayload {
  return {
    version: 1,
    createdAt: "2026-03-20T12:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    notesIncluded: false,
    includedBlocks: ["profile", "css", "preferences", "goals", "focus"],
    omittedBlocks: ["personal_records"],
    source: {
      profile: {
        id: "profile-1",
        displayName: "Poolside Stian",
        firstName: "Stian",
        lastName: "Vikra",
        primaryName: "Poolside Stian",
        ageBand: "35_44",
        ageBandLabel: "35-44",
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
      },
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
      activeFocus: {
        id: "focus-1",
        title: "Breathing timing",
        details: "Keep the head quiet through the inhale.",
        status: "open",
        statusLabel: "Open",
        isPrimary: true,
        goalId: "goal-1",
        goalTitle: "Swim 1500m stronger",
        contextType: null,
        contextRef: null,
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
        completedAt: null,
        archivedAt: null,
      },
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
      focusText: "Breathing timing",
    },
  };
}

describe("session generator server", () => {
  it("builds a pool threshold draft with CSS-aware main-set guidance", () => {
    const validation = validateSessionGeneratorFormState({
      environment: "pool",
      poolLengthM: "25",
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

    const draft = buildSessionDraft(buildHandoff(), validation.value, {
      createdAt: "2026-03-20T12:05:00.000Z",
    });

    expect(draft.status).toBe("draft");
    expect(draft.titleSuggestions[0]).toContain("Threshold / CSS");
    expect(draft.usedCssPaceLabel).toBe("1:58");
    expect(draft.steps[0]?.category).toBe("warmup");
    expect(draft.steps.some((step) => step.category === "rest")).toBe(true);
    expect(draft.steps.find((step) => step.id === "kick-repeat-1-step-1")?.repeatCount).toBe(10);
    expect(
      draft.steps.find((step) => step.postSetRestForRepeatGroupId === "kick-repeat-1")?.timeMin
    ).toBeGreaterThan(0);
    expect(draft.steps.find((step) => step.id === "main-1")?.notes).toContain("CSS");
    expect(draft.totalDistanceM).toBe(2400);
    expect(draft.estimatedDurationMin).toBeGreaterThan(0);
  });

  it("guards open-water drafts away from dedicated drill and kick blocks", () => {
    const validation = validateSessionGeneratorFormState({
      environment: "open_water",
      poolLengthM: "25",
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

    const draft = buildSessionDraft(buildHandoff(), validation.value);

    expect(draft.environment).toBe("open_water");
    expect(draft.steps.map((step) => step.category)).toEqual(["warmup", "main", "cooldown"]);
    expect(draft.warnings).toContain(
      "Open-water draft review skips dedicated drill blocks in this first slice."
    );
    expect(draft.warnings).toContain(
      "Open-water draft review skips dedicated kick blocks in this first slice."
    );
  });

  it("builds technical fault correction with explicit drill, kick, and rest choices", () => {
    const validation = validateSessionGeneratorFormState({
      environment: "pool",
      poolLengthM: "25",
      sessionType: "technical_fault_correction",
      effort: "easy",
      sizeMode: "distance",
      targetDistanceM: "1800",
      targetTimeMin: "45",
      includeDrills: true,
      drillVolumeMode: "explicit",
      drillTargetMeters: "400",
      includeKick: true,
      kickVolumeMode: "explicit",
      kickTargetMeters: "200",
      kickIntervalMeters: "50",
      restMode: "explicit",
      restSeconds: "30",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["kickboard"],
    });

    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const draft = buildSessionDraft(buildHandoff(), validation.value);

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
      "200m total in 50m repeats"
    );
    expect(draft.steps.find((step) => step.id === "main-rest-1")?.timeMin).toBe(0.5);
    expect(draft.steps.find((step) => step.id === "cooldown-rest-1")?.timeMin).toBe(0.5);
    expect(draft.totalDistanceM).toBe(1800);
    expect(draft.description).toContain("Rest: 30s requested.");
  });
});
