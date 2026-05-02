import { describe, expect, it } from "vitest";
import type { GoalView } from "@/lib/goals/mvp";
import type { TrainingContextSnapshot } from "@/lib/training-context/server";
import type { AthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import {
  buildGeneratorHandoffPayload,
  buildGeneratorIntakeSnapshot,
  normalizeGeneratorIntakeSelection,
} from "@/lib/generator-intake/server";

function buildAthleteProfileSnapshot(): AthleteProfileSnapshot {
  return {
    profileSchemaReady: true,
    metricsSchemaReady: true,
    preferencesSchemaReady: true,
    personalRecordsSchemaReady: true,
    swimCapabilityLimitsSchemaReady: true,
    loadError: null,
    metricsLoadError: null,
    preferencesLoadError: null,
    personalRecordsLoadError: null,
    swimCapabilityLimitsLoadError: null,
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
      preferredSessionMinutes: 60,
      preferredSessionMinutesLabel: "60 min",
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-20T10:00:00.000Z",
    },
    personalRecords: [
      {
        id: "record-1",
        distanceM: 400,
        stroke: "freestyle",
        strokeLabel: "Freestyle",
        course: "pool_25m",
        courseLabel: "25m pool",
        eventLabel: "400m Freestyle · 25m pool",
        timeCentiseconds: 32055,
        timeLabel: "5:20.55",
        recordedOn: "2026-03-20",
        sourceNote: null,
        createdAt: "2026-03-20T10:00:00.000Z",
        updatedAt: "2026-03-20T10:00:00.000Z",
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
    ],
  };
}

function buildTrainingContextSnapshot(): TrainingContextSnapshot {
  return {
    schemaReady: true,
    loadError: null,
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
    primaryFocus: {
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
    openFocuses: [
      {
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
    ],
    focusHistory: [],
    focusNeedsPrimarySelection: false,
    recentNotes: [],
    unresolvedObservationCount: 0,
    unansweredQuestionCount: 0,
    goalOptions: [],
  };
}

function buildOpenGoals(): GoalView[] {
  return [
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
  ];
}

describe("generator intake server helpers", () => {
  it("defaults available blocks to included and unavailable blocks to excluded", () => {
    const snapshot = buildGeneratorIntakeSnapshot({
      athleteProfileSnapshot: {
        ...buildAthleteProfileSnapshot(),
        cssMetric: null,
      },
      trainingContextSnapshot: buildTrainingContextSnapshot(),
      openGoals: [],
      goalsLoadError: null,
      loadedAt: "2026-03-20T10:00:00.000Z",
    });

    const selection = normalizeGeneratorIntakeSelection(snapshot, {
      css: true,
      preferences: true,
      personal_records: true,
      goals: true,
      capability_limits: true,
    });

    expect(selection.preferences).toBe(true);
    expect(selection.css).toBe(false);
    expect(selection.goals).toBe(false);
    expect(selection.capability_limits).toBe(true);
  });

  it("builds deterministic handoff payloads from included blocks and overrides", () => {
    const snapshot = buildGeneratorIntakeSnapshot({
      athleteProfileSnapshot: buildAthleteProfileSnapshot(),
      trainingContextSnapshot: buildTrainingContextSnapshot(),
      openGoals: buildOpenGoals(),
      goalsLoadError: null,
      loadedAt: "2026-03-20T10:00:00.000Z",
    });

    const payload = buildGeneratorHandoffPayload(
      snapshot,
      {
        preferences: true,
        css: true,
        personal_records: false,
        goals: false,
        capability_limits: true,
      },
      {
        targetType: "program",
        desiredSessionCount: "4",
        desiredSessionMinutes: "45",
        focusText: "Race-pace breathing control",
        constraintText: "Keep the first week moderate.",
      },
      {
        createdAt: "2026-03-20T10:05:00.000Z",
      }
    );

    expect(payload.createdAt).toBe("2026-03-20T10:05:00.000Z");
    expect(payload.includedBlocks).toEqual(["preferences", "css", "capability_limits"]);
    expect(payload.omittedBlocks).toContain("goals");
    expect(payload.source.profile).toBeNull();
    expect(payload.source.personalRecords).toEqual([]);
    expect(payload.source.swimCapabilityLimits).toHaveLength(1);
    expect(payload.source.openGoals).toEqual([]);
    expect(payload.overrides.targetType).toBe("program");
    expect(payload.overrides.desiredSessionCount).toBe(4);
    expect(payload.overrides.desiredSessionMinutes).toBe(45);
    expect(payload.effectiveDefaults.sessionCount).toBe(4);
    expect(payload.effectiveDefaults.sessionMinutes).toBe(45);
    expect(payload.effectiveDefaults.focusText).toBe("Race-pace breathing control");
    expect(payload.notesIncluded).toBe(false);
  });

  it("keeps active focus out of selectable V1 intake blocks", () => {
    const snapshot = buildGeneratorIntakeSnapshot({
      athleteProfileSnapshot: buildAthleteProfileSnapshot(),
      trainingContextSnapshot: {
        ...buildTrainingContextSnapshot(),
        activeFocus: null,
        primaryFocus: null,
        openFocuses: [
          {
            ...buildTrainingContextSnapshot().openFocuses[0],
            isPrimary: false,
          },
          {
            ...buildTrainingContextSnapshot().openFocuses[0],
            id: "focus-2",
            title: "Patient catch timing",
            goalId: null,
            goalTitle: null,
            isPrimary: false,
          },
        ],
        focusNeedsPrimarySelection: true,
      },
      openGoals: buildOpenGoals(),
      goalsLoadError: null,
      loadedAt: "2026-03-20T10:00:00.000Z",
    });

    expect(snapshot.activeFocus).toBeNull();
    expect(Object.keys(snapshot.blocks)).not.toContain("focus");
    expect(Object.keys(snapshot.blocks)).not.toContain("profile");
  });
});
