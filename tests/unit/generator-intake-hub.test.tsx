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
    swimCapabilityLimitsSchemaReady: true,
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
      personal_records: {
        key: "personal_records",
        label: "Best times",
        description: "Records description",
        state: "empty",
        available: false,
        includedByDefault: false,
        summary: "No best times saved yet.",
        missingReason: "Add best times if later generation should see benchmark events.",
        sourceIds: [],
        lastUpdatedAt: null,
        manageHref: "/my-library/profile",
        manageLabel: "Edit best times",
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
      capability_limits: {
        key: "capability_limits",
        label: "Stroke and skill limits",
        description: "Limits description",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "1 saved swim capability limit.",
        missingReason: null,
        sourceIds: ["limit-drill-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit limits",
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

  it("keeps the page focused on saved My Library info and session settings", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    expect(screen.getByRole("heading", { name: "Use Swim Profile data" })).toBeInTheDocument();
    expect(screen.getByTestId("generator-intake-source-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("generator-intake-source-toggle")).toHaveClass("fs-cta-secondary");
    expect(screen.getByTestId("session-generator-swim-profile-context")).toBeInTheDocument();
    expect(screen.getByTestId("generator-intake-profile-summary")).toHaveTextContent(
      "Training preferences"
    );
    expect(screen.getByTestId("generator-intake-profile-summary")).toHaveTextContent("CSS pace");
    expect(screen.getByTestId("generator-intake-profile-summary")).toHaveTextContent(
      "Not in Swim Profile"
    );
    expect(screen.getByRole("heading", { name: "Session setup" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Before you generate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "This run only" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-session-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-target-program")).not.toBeInTheDocument();
  });

  it("updates the saved-information summary when included blocks change", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("generator-intake-source-toggle"));
    fireEvent.click(screen.getByTestId("generator-intake-include-goals"));

    expect(screen.getByText("3/4 included")).toBeInTheDocument();
    expect(screen.getByTestId("generator-intake-include-goals")).toHaveClass(
      "border-[color:var(--fs-border-soft)]",
      "text-[color:var(--fs-color-brand-700)]"
    );
    expect(screen.getByTestId("generator-intake-source-actions-goals")).toHaveClass("justify-end");
    expect(screen.getAllByText("Included")[0]).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-emerald-200",
      "bg-emerald-50"
    );
    expect(screen.getByRole("link", { name: "Edit Goals" })).toHaveClass("fs-cta-secondary");
  });

  it("keeps the AI generator on the single-session path only", () => {
    render(
      <GeneratorIntakeHub
        initialSnapshot={buildSnapshot()}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    expect(screen.queryByTestId("generator-intake-session-count")).not.toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-target-program")).not.toBeInTheDocument();
    expect(screen.queryByTestId("generator-intake-target-session")).not.toBeInTheDocument();
  });

  it("marks recovered, stale-source, and load feedback with accessible semantics", async () => {
    localStorage.setItem(
      "my-library-generator-intake-draft:user-1",
      JSON.stringify({
        sourceFingerprint: "older-fingerprint",
        selection: {
          preferences: true,
          css: true,
          personal_records: false,
          goals: false,
          capability_limits: true,
        },
        overrides: {
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "Keep the head still.",
          constraintText: "",
        },
      })
    );

    render(
      <GeneratorIntakeHub
        initialSnapshot={{
          ...buildSnapshot(),
          loadError: "Could not load all generator source data.",
        }}
        userId="user-1"
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    const recoveredFeedback = await screen.findByTestId("generator-intake-draft-recovered");
    expect(recoveredFeedback).toHaveAttribute("data-feedback-tone", "success");
    expect(recoveredFeedback).toHaveAttribute("role", "status");
    expect(recoveredFeedback).toHaveAttribute("aria-live", "polite");

    const staleWarning = screen.getByTestId("generator-intake-stale-source-warning");
    expect(staleWarning).toHaveAttribute("data-feedback-tone", "warning");
    expect(staleWarning).toHaveAttribute("role", "status");
    expect(staleWarning).toHaveAttribute("aria-live", "polite");

    const loadError = screen.getByTestId("generator-intake-load-error");
    expect(loadError).toHaveAttribute("data-feedback-tone", "error");
    expect(loadError).toHaveAttribute("role", "alert");
    expect(loadError).toHaveAttribute("aria-live", "assertive");
  });
});
