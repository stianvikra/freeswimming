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

function buildPayload(
  overrides?: Partial<GeneratorIntakeHandoffPayload["overrides"]>
): GeneratorIntakeHandoffPayload {
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
      ...overrides,
    },
    effectiveDefaults: {
      targetType: "session",
      sessionCount: 3,
      sessionMinutes: 45,
      focusText: "Breathing timing",
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

  it("shows session information controls and lets the user clear session notes", () => {
    const onOverrideChange = vi.fn();
    const onResetOverrides = vi.fn();

    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          profile: true,
          css: true,
          preferences: true,
          personal_records: false,
          goals: true,
          focus: true,
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

    expect(screen.getByRole("heading", { name: "Session notes and setup" })).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("session-generator-focus-text"), {
      target: { value: "Race-pace breathing control" },
    });
    fireEvent.change(screen.getByTestId("session-generator-constraint-text"), {
      target: { value: "Keep kick work short." },
    });
    fireEvent.click(screen.getByTestId("session-generator-reset-overrides"));

    expect(onOverrideChange).toHaveBeenNthCalledWith(1, "focusText", "Race-pace breathing control");
    expect(onOverrideChange).toHaveBeenNthCalledWith(2, "constraintText", "Keep kick work short.");
    expect(onResetOverrides).toHaveBeenCalledTimes(1);
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
          profile: true,
          css: true,
          preferences: true,
          personal_records: false,
          goals: true,
          focus: true,
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
      expect(screen.getByTestId("session-draft-title")).toHaveValue(
        "Threshold / CSS 25m Pool draft"
      );
    });

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
    expect(screen.getByTestId("session-generator-draft-preview").textContent ?? "").toContain(
      "My edited threshold draft"
    );
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
          profile: true,
          css: true,
          preferences: true,
          personal_records: false,
          goals: true,
          focus: true,
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
      expect(screen.getByTestId("session-draft-title")).toHaveValue(
        "Threshold / CSS 25m Pool draft"
      );
    });

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Accepted threshold workout" },
    });
    fireEvent.click(screen.getByTestId("session-generator-save"));

    await waitFor(() => {
      expect(screen.getByText("Session saved to My sessions.")).toBeVisible();
    });

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/my-library/workouts",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(screen.getByText("Saved session loaded.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Accepted threshold workout");
  });

  it("loads a previously accepted workout into the same editor", async () => {
    render(
      <SessionGeneratorPanel
        payload={buildPayload()}
        selection={{
          profile: true,
          css: true,
          preferences: true,
          personal_records: false,
          goals: true,
          focus: true,
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
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Previously accepted workout");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
    expect(screen.queryByTestId("session-generator-prepare-needed")).not.toBeInTheDocument();
  });
});
