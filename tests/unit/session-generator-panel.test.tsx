import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SessionGeneratorPanel from "@/components/my-library/generator/SessionGeneratorPanel";
import type { GeneratorIntakeHandoffPayload } from "@/lib/generator-intake/shared";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSummary,
} from "@/lib/workouts/shared";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

async function openWorkoutEditorMetadata() {
  await waitFor(() => {
    const metadataToggle = screen.getByTestId("workout-editor-metadata-toggle");
    if (metadataToggle.getAttribute("aria-expanded") !== "true") {
      fireEvent.click(metadataToggle);
    }

    expect(metadataToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("session-draft-title")).toBeInTheDocument();
  });
}

function buildPayload(
  overrides?: Partial<GeneratorIntakeHandoffPayload["overrides"]>
): GeneratorIntakeHandoffPayload {
  return {
    version: 1,
    createdAt: "2026-03-20T12:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    notesIncluded: false,
    includedBlocks: ["preferences", "css", "personal_records", "goals", "capability_limits"],
    omittedBlocks: [],
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
      personalRecords: [
        {
          id: "record-400",
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
        {
          id: "record-1000",
          distanceM: 1000,
          stroke: "freestyle",
          strokeLabel: "Freestyle",
          course: "pool_25m",
          courseLabel: "25m pool",
          eventLabel: "1000m Freestyle · 25m pool",
          timeCentiseconds: 85000,
          timeLabel: "14:10.00",
          recordedOn: "2026-03-20",
          sourceNote: null,
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
          id: "limit-kick-1",
          kind: "kick",
          stroke: null,
          strokeLabel: null,
          maxRepeatDistanceM: 50,
          maxRepeatDistanceLabel: "50m",
          maxTotalDistanceM: null,
          maxTotalDistanceLabel: null,
          targetTotalDistanceM: 200,
          targetTotalDistanceLabel: "200m",
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
          maxTotalDistanceM: 300,
          maxTotalDistanceLabel: "300m",
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
      ...overrides,
    },
    effectiveDefaults: {
      targetType: "session",
      sessionCount: 3,
      sessionMinutes: 45,
      focusText: null,
    },
  };
}

function buildDraft(): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-20T12:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Threshold / CSS 25m Pool draft",
    titleSuggestions: ["Threshold / CSS 25m Pool draft", "Moderate Threshold / CSS session"],
    description: "Threshold session in pool mode.",
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
    basePaceSecondsPer100m: 128,
    usedCssPaceLabel: "1:58",
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: ["kickboard"],
    focusText: "Breathing timing",
    goalTitle: "Swim 1500m stronger",
    constraintText: "Keep the first half controlled.",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup",
        name: "Easy warmup swim",
        stroke: "freestyle",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swimming with relaxed breathing.",
        notes: "Start smooth.",
      },
      {
        id: "step-2",
        category: "main",
        name: "Threshold / CSS main set",
        stroke: "freestyle",
        intensity: "moderate",
        durationMode: "distance",
        distanceM: 1400,
        timeMin: null,
        targetSummary: "Swim around CSS-derived pacing.",
        notes: "Suggested structure: 14 x 100m around CSS pace.",
      },
      {
        id: "step-3",
        category: "cooldown",
        name: "Cooldown swim",
        stroke: "choice",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swim to bring the heart rate down.",
        notes: "Finish calmer than you started.",
      },
    ],
  };
}

function buildWorkoutSummary(overrides?: Partial<WorkoutSummary>): WorkoutSummary {
  return {
    id: "workout-1",
    title: "Threshold / CSS 25m Pool draft",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    updatedAt: "2026-03-20T12:20:00.000Z",
    acceptedAt: "2026-03-20T12:18:00.000Z",
    sourceKind: "ai_session_v1",
    status: "accepted",
    ...overrides,
  };
}

function buildWorkoutRecord(overrides?: Partial<WorkoutEditorRecord>): WorkoutEditorRecord {
  return {
    id: "workout-1",
    createdAt: "2026-03-20T12:18:00.000Z",
    updatedAt: "2026-03-20T12:20:00.000Z",
    acceptedAt: "2026-03-20T12:18:00.000Z",
    sourceKind: "ai_session_v1",
    status: "accepted",
    draft: buildDraft(),
    ...overrides,
  };
}

function buildWorkoutLibrary(overrides?: Partial<WorkoutLibrarySnapshot>): WorkoutLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedWorkout: null,
    selectedWorkoutMissing: false,
    recentWorkouts: [],
    ...overrides,
  };
}

describe("SessionGeneratorPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows session type first and keeps special instructions optional", () => {
    const onOverrideChange = vi.fn();
    const onResetOverrides = vi.fn();

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "Breathing timing under fatigue",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={onOverrideChange}
        onResetOverrides={onResetOverrides}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    expect(screen.getByRole("heading", { name: "Session setup" })).toBeInTheDocument();
    expect(screen.getByTestId("session-generator-setup-card")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.queryByTestId("session-generator-focus-text")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-generator-session-type")).toBeInTheDocument();
    expect(screen.getByTestId("session-generator-session-type")).toHaveClass(
      "ui-field",
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByText("Additional instructions (optional)")).toBeInTheDocument();
    expect(screen.getByTestId("session-generator-constraint-text")).toHaveClass(
      "ui-field",
      "rounded-[var(--fs-radius-control)]"
    );
    expect(
      screen.queryByText(
        "Leave blank and the coach will decide details from the profile inputs and session choices."
      )
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByTestId("session-generator-session-type"), {
      target: { value: "technical_fault_correction" },
    });
    fireEvent.change(screen.getByTestId("session-generator-constraint-text"), {
      target: { value: "Keep kick work short." },
    });
    expect(screen.getByTestId("session-generator-session-type")).toHaveValue(
      "technical_fault_correction"
    );
    expect(screen.getByTestId("session-generator-reset-overrides")).toHaveClass("fs-cta-secondary");
    fireEvent.click(screen.getByTestId("session-generator-reset-overrides"));

    expect(onOverrideChange).toHaveBeenCalledWith("constraintText", "Keep kick work short.");
    expect(onResetOverrides).toHaveBeenCalledTimes(1);
  });

  it("shows compact Session Rules with manual-builder pool controls and profile-limit overrides", () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: true,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    expect(screen.getByRole("heading", { name: "Session Rules" })).toBeInTheDocument();
    expect(screen.queryByTestId("session-generator-swim-profile-context")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fault correction" })).toBeInTheDocument();
    expect(screen.getByTestId("session-generator-profile-limits-card")).toHaveClass(
      "fs-library-card"
    );
    expect(screen.getByTestId("session-generator-profile-limits-card")).toHaveTextContent(
      "From Swim Profile"
    );
    expect(screen.getByTestId("session-generator-profile-limits-card")).toHaveTextContent(
      "max length 25m"
    );
    expect(screen.getByTestId("session-generator-pool-size-inline-row")).toHaveAttribute(
      "data-layout",
      "compact-inline"
    );
    expect(screen.getByRole("button", { name: "Meters" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Meters" })).toHaveClass(
      "border-[color:var(--fs-border-brand)]",
      "bg-[color:var(--fs-color-brand-50)]"
    );
    expect(screen.getByRole("button", { name: "Yards" })).toBeVisible();
    expect(screen.getByRole("button", { name: "25m" })).toBeVisible();
    expect(screen.getByRole("button", { name: "25m" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-[color:var(--fs-border-brand)]"
    );
    expect(screen.getByLabelText("Exact pool size (m)")).toHaveValue("25");
    expect(screen.getByLabelText("Exact pool size (m)")).toHaveClass("ui-field");
    expect(screen.getByTestId("session-generator-rules-card")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByTestId("session-generator-primary-action-panel")).toHaveClass(
      "fs-library-card"
    );
    expect(screen.getByTestId("session-generator-generate")).toHaveClass("fs-cta-primary");
    expect(screen.getByTestId("session-generator-skill-limits-override")).toHaveClass(
      "fs-cta-secondary"
    );

    fireEvent.click(screen.getByTestId("session-generator-skill-limits-override"));
    expect(screen.getByTestId("session-generator-profile-limits-card")).toHaveTextContent(
      "Session-specific"
    );
    expect(screen.getByTestId("session-generator-skill-limit-edit-actions")).toHaveClass(
      "grid-cols-1"
    );
    expect(screen.getByTestId("session-generator-drill-max-repeat")).toHaveClass("ui-field");
    expect(screen.getByTestId("session-generator-kick-interval")).toHaveValue("50");
    expect(screen.getByTestId("session-generator-kick-interval")).toHaveClass("ui-field");
    expect(screen.getByTestId("session-generator-kick-approx-total")).toHaveValue("200");
    fireEvent.click(screen.getByTestId("session-generator-include-drills"));
    fireEvent.click(screen.getByTestId("session-generator-drill-volume-explicit"));
    fireEvent.change(screen.getByTestId("session-generator-drill-meters"), {
      target: { value: "450" },
    });
    fireEvent.click(screen.getByTestId("session-generator-include-kick"));
    fireEvent.click(screen.getByTestId("session-generator-kick-volume-explicit"));
    fireEvent.change(screen.getByTestId("session-generator-kick-meters"), {
      target: { value: "250" },
    });
    fireEvent.change(screen.getByTestId("session-generator-kick-interval"), {
      target: { value: "25" },
    });
    fireEvent.click(screen.getByTestId("session-generator-rest-explicit"));
    fireEvent.change(screen.getByTestId("session-generator-rest-seconds"), {
      target: { value: "35" },
    });

    expect(screen.getByTestId("session-generator-drill-meters")).toHaveValue("450");
    expect(screen.getByTestId("session-generator-kick-meters")).toHaveValue("250");
    expect(screen.getByTestId("session-generator-kick-interval")).toHaveValue("25");
    expect(screen.getByTestId("session-generator-kick-approx-total")).toHaveValue("200");
    expect(screen.getByTestId("session-generator-rest-seconds")).toHaveValue("35");
  });

  it("marks generator load, missing-workout, and save-unavailable feedback with accessible semantics", () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary({
          schemaReady: false,
          loadError: "Could not load saved sessions right now.",
          selectedWorkoutMissing: true,
        })}
      />
    );

    const loadError = screen.getByTestId("session-generator-workout-load-error");
    expect(loadError).toHaveAttribute("data-feedback-tone", "error");
    expect(loadError).toHaveAttribute("role", "alert");
    expect(loadError).toHaveAttribute("aria-live", "assertive");

    const missingWorkout = screen.getByTestId("session-generator-selected-workout-missing");
    expect(missingWorkout).toHaveAttribute("data-feedback-tone", "warning");
    expect(missingWorkout).toHaveAttribute("role", "status");
    expect(missingWorkout).toHaveAttribute("aria-live", "polite");

    const saveUnavailable = screen.getByTestId("session-generator-save-unavailable");
    expect(saveUnavailable).toHaveAttribute("data-feedback-tone", "warning");
    expect(saveUnavailable).not.toHaveAttribute("role");
    expect(saveUnavailable).not.toHaveAttribute("aria-live");
  });

  it("announces generator action failures as recoverable errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () =>
        ({
          ok: false,
          error: "Could not generate a session draft right now.",
        }) satisfies { ok: false; error: string },
    } as Response);

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("session-generator-generate"));

    const actionError = await screen.findByTestId("session-generator-action-error");
    expect(actionError).toHaveAttribute("data-feedback-tone", "error");
    expect(actionError).toHaveAttribute("role", "alert");
    expect(actionError).toHaveAttribute("aria-live", "assertive");
    expect(actionError).toHaveTextContent("Could not generate a session draft right now.");
  });

  it("generates and allows local editing of a draft session", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () =>
        ({
          ok: true,
          handoff: buildPayload(),
          draft: buildDraft(),
        }) satisfies { ok: true; handoff: GeneratorIntakeHandoffPayload; draft: SessionDraft },
    } as Response);

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.change(screen.getByTestId("session-generator-session-type"), {
      target: { value: "threshold_css" },
    });
    fireEvent.click(screen.getByTestId("session-generator-size-distance"));
    fireEvent.change(screen.getByTestId("session-generator-target-distance"), {
      target: { value: "2200" },
    });
    fireEvent.click(screen.getByTestId("session-generator-generate"));

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
        "This generated session is not saved to My Swim Sessions yet."
      );
    });

    expect(screen.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await openWorkoutEditorMetadata();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Threshold / CSS 25m Pool draft");

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "My edited threshold draft" },
    });
    expect(screen.queryByTestId("session-draft-step-name-0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-name-0"), {
      target: { value: "Gentle warmup swim" },
    });

    expect(screen.getByTestId("session-draft-title")).toHaveValue("My edited threshold draft");
    expect(screen.getByTestId("session-draft-step-name-0")).toHaveValue("Gentle warmup swim");
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "This generated session is not saved to My Swim Sessions yet."
    );
    expect(screen.queryByTestId("session-generator-draft-preview")).not.toBeInTheDocument();
  });

  it("uses the shared session-step view contract for generated rests without coach-note noise", async () => {
    const baseDraft = buildDraft();
    const generatedDraftWithRest: SessionDraft = {
      ...baseDraft,
      steps: [
        baseDraft.steps[0]!,
        {
          id: "warmup-rest",
          category: "rest",
          name: "Reset rest",
          stroke: "choice",
          intensity: "recovery",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "Reset before the main set.",
          notes: "",
        },
        {
          ...baseDraft.steps[1]!,
          id: "main-repeat-step-1",
          distanceM: 100,
          repeatGroupId: "main-repeat",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "main-repeat-step-2",
          category: "rest",
          name: "Between-round rest",
          stroke: "choice",
          intensity: "recovery",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "Short recovery before the next round.",
          notes: "",
          repeatGroupId: "main-repeat",
          repeatCount: 4,
          repeatEndingRestMode: "skip_last_rest",
        },
        {
          id: "main-repeat-post-rest",
          category: "rest",
          name: "Post-set rest",
          stroke: "choice",
          intensity: "recovery",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "Reset after the main set.",
          notes: "",
          postSetRestForRepeatGroupId: "main-repeat",
        },
        baseDraft.steps[2]!,
        {
          id: "cooldown-rest",
          category: "rest",
          name: "Finish rest",
          stroke: "choice",
          intensity: "recovery",
          durationMode: "fixed_rest",
          distanceM: null,
          timeMin: 0.5,
          targetSummary: "Final reset after cooldown.",
          notes: "",
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () =>
        ({
          ok: true,
          handoff: buildPayload(),
          draft: generatedDraftWithRest,
        }) satisfies {
          ok: true;
          handoff: GeneratorIntakeHandoffPayload;
          draft: SessionDraft;
        },
    } as Response);

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("session-generator-generate"));

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
        "This generated session is not saved to My Swim Sessions yet."
      );
    });

    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-view"));

    expect(
      screen.getAllByText(/4 x 100m · Freestyle · Moderate · Interval rest 0:30/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Set rest 0:30").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Rest 0:30").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/Coach note:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Suggested structure:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Swim around CSS-derived pacing/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-rearrange"));

    expect(screen.queryByText(/Coach note:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Suggested structure:/i)).not.toBeInTheDocument();
  });

  it("accepts a generated draft into the canonical workout layer", async () => {
    const savedDraft = {
      ...buildDraft(),
      title: "Accepted threshold workout",
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          ({
            ok: true,
            handoff: buildPayload(),
            draft: buildDraft(),
          }) satisfies {
            ok: true;
            handoff: GeneratorIntakeHandoffPayload;
            draft: SessionDraft;
          },
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          ({
            ok: true,
            workout: buildWorkoutRecord({
              draft: savedDraft,
            }),
            summary: buildWorkoutSummary({
              title: "Accepted threshold workout",
            }),
          }) satisfies {
            ok: true;
            workout: WorkoutEditorRecord;
            summary: WorkoutSummary;
          },
      } as Response);

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary()}
      />
    );

    fireEvent.click(screen.getByTestId("session-generator-generate"));

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
        "This generated session is not saved to My Swim Sessions yet."
      );
    });

    await openWorkoutEditorMetadata();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Threshold / CSS 25m Pool draft");

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Accepted threshold workout" },
    });
    fireEvent.click(screen.getByTestId("session-generator-save"));

    await waitFor(() => {
      expect(screen.getByText("Session saved to My Swim Sessions.")).toBeVisible();
    });

    const successFeedback = screen.getByTestId("session-generator-action-success");
    expect(successFeedback).toHaveAttribute("data-feedback-tone", "success");
    expect(successFeedback).toHaveAttribute("role", "status");
    expect(successFeedback).toHaveAttribute("aria-live", "polite");

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/my-library/workouts",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(screen.getByText("Saved session loaded.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
        "All changes are saved to this session."
      );
    });
    await openWorkoutEditorMetadata();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Accepted threshold workout");
  }, 15_000);

  it("loads a previously accepted workout into the same editor", async () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            draft: {
              ...buildDraft(),
              title: "Previously accepted workout",
            },
          }),
          recentWorkouts: [buildWorkoutSummary({ title: "Previously accepted workout" })],
        })}
      />
    );

    expect(screen.getByText("Saved session loaded.")).toBeVisible();
    await openWorkoutEditorMetadata();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Previously accepted workout");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Discard changes" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-generator-prepare-needed")).not.toBeInTheDocument();
  });

  it("supports discard and undo in the shared saved-session editor", async () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            draft: {
              ...buildDraft(),
              title: "Previously accepted workout",
            },
          }),
          recentWorkouts: [buildWorkoutSummary({ title: "Previously accepted workout" })],
        })}
      />
    );

    await openWorkoutEditorMetadata();

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Temporary generator title" },
    });

    expect(screen.getByRole("button", { name: "Discard changes" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(screen.getByTestId("workout-editor-discard-undo")).toHaveTextContent(
      "Changes discarded."
    );
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Previously accepted workout");
    expect(screen.queryByRole("button", { name: "Discard changes" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workout-editor-discard-undo-button"));

    expect(screen.queryByTestId("workout-editor-discard-undo")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Temporary generator title");
    expect(screen.getByRole("button", { name: "Discard changes" })).toBeVisible();
  });

  it("applies the same pool-unit default reset behavior in the shared saved-session editor", async () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          preferences: true,
          css: true,
          personal_records: false,
          goals: true,
          capability_limits: true,
        }}
        overrides={{
          targetType: "session",
          desiredSessionCount: "",
          desiredSessionMinutes: "45",
          focusText: "",
          constraintText: "Keep the first half controlled.",
        }}
        onOverrideChange={vi.fn()}
        onResetOverrides={vi.fn()}
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord(),
          recentWorkouts: [buildWorkoutSummary()],
        })}
      />
    );

    await openWorkoutEditorMetadata();

    fireEvent.change(screen.getByLabelText("Exact pool length (m)"), {
      target: { value: "33.33" },
    });
    expect(screen.getByLabelText("Exact pool length (m)")).toHaveValue("33.33");

    fireEvent.click(screen.getByTestId("workout-editor-pool-length-unit-yd"));
    expect(screen.getByLabelText("Exact pool length (yd)")).toHaveValue("25");

    fireEvent.click(screen.getByTestId("workout-editor-pool-length-unit-m"));
    expect(screen.getByLabelText("Exact pool length (m)")).toHaveValue("25");
  });
});
