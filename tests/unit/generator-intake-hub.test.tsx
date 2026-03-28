import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GeneratorIntakeHub from "@/components/my-library/generator/GeneratorIntakeHub";
import type { GeneratorIntakeSnapshot } from "@/lib/generator-intake/server";
import type { WorkoutLibrarySnapshot } from "@/lib/workouts/shared";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildSnapshot(): GeneratorIntakeSnapshot {
  return {
    loadedAt: "2026-03-20T10:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    loadError: null,
    notesIncluded: false,
    profileSchemaReady: true,
    metricsSchemaReady: true,
    preferencesSchemaReady: true,
    personalRecordsSchemaReady: true,
    trainingContextSchemaReady: true,
    goalsLoadError: null,
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
    blocks: {
      profile: {
        key: "profile",
        label: "Athlete profile",
        description: "Profile description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "Poolside Stian · 35-44",
        missingReason: null,
        sourceIds: ["profile-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit athlete profile",
      },
      css: {
        key: "css",
        label: "CSS pace",
        description: "CSS description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "CSS 1:58/100m",
        missingReason: null,
        sourceIds: ["metric-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit CSS",
      },
      preferences: {
        key: "preferences",
        label: "Training preferences",
        description: "Preferences description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "25m pool · 3 sessions/week · 60 min",
        missingReason: null,
        sourceIds: ["pref-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit preferences",
      },
      personal_records: {
        key: "personal_records",
        label: "Personal records",
        description: "Records description",
        state: "empty",
        available: false,
        includedByDefault: false,
        summary: "No personal records saved yet.",
        missingReason: "Add personal records if later generation should see benchmark events.",
        sourceIds: [],
        lastUpdatedAt: null,
        manageHref: "/my-library/profile",
        manageLabel: "Edit personal records",
      },
      goals: {
        key: "goals",
        label: "Open goals",
        description: "Goals description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "1 open goal ready for intake.",
        missingReason: null,
        sourceIds: ["goal-1"],
        lastUpdatedAt: null,
        manageHref: "/my-library/goals",
        manageLabel: "Edit goals",
      },
      focus: {
        key: "focus",
        label: "Primary focus cue",
        description: "Focus description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "Breathing timing · linked to Swim 1500m stronger",
        missingReason: null,
        sourceIds: ["focus-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/training",
        manageLabel: "Edit focuses",
      },
    },
  };
}

function buildWorkoutLibrary(): WorkoutLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedWorkout: null,
    selectedWorkoutMissing: false,
    recentWorkouts: [],
  };
}

describe("GeneratorIntakeHub", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("explains the boundary between saved data and one-run overrides", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    expect(screen.getByRole("heading", { name: "Loaded from My Library" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Just this run" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prepare the generator" })).toBeInTheDocument();
    expect(
      screen.getByText("Notes stay out of default generator prefill in v1.", { exact: false })
    ).toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-session-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-handoff-preview")).not.toBeInTheDocument();
  });

  it("updates the handoff preview when blocks are excluded and overrides change", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("generator-intake-overrides-toggle"));
    fireEvent.click(screen.getByTestId("generator-intake-target-program"));
    fireEvent.change(screen.getByTestId("generator-intake-session-count"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId("generator-intake-focus-text"), {
      target: { value: "Race-pace breathing control" },
    });
    fireEvent.click(screen.getByTestId("generator-intake-source-toggle"));
    fireEvent.click(screen.getByTestId("generator-intake-include-goals"));
    fireEvent.click(screen.getByTestId("generator-intake-technical-toggle"));

    const preview = screen.getByTestId("generator-intake-handoff-preview").textContent ?? "";
    const parsed = JSON.parse(preview) as {
      includedBlocks: string[];
      source: { openGoals: unknown[] };
      overrides: {
        targetType: string;
        desiredSessionCount: number | null;
        focusText: string | null;
      };
    };

    expect(parsed.includedBlocks).not.toContain("goals");
    expect(parsed.source.openGoals).toEqual([]);
    expect(parsed.overrides.targetType).toBe("program");
    expect(parsed.overrides.desiredSessionCount).toBe(4);
    expect(parsed.overrides.focusText).toBe("Race-pace breathing control");
  });

  it("shows swim sessions per week only for the multi-session program path", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("generator-intake-overrides-toggle"));

    expect(screen.queryByTestId("generator-intake-session-count")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("generator-intake-target-program"));

    expect(screen.getByText("Swim sessions per week")).toBeInTheDocument();
    expect(screen.getByTestId("generator-intake-session-count")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("generator-intake-target-session"));

    expect(screen.queryByTestId("generator-intake-session-count")).not.toBeInTheDocument();
  });
});
