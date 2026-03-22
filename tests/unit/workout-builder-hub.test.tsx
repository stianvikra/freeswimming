import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSummary,
} from "@/lib/workouts/shared";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildDraft(): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-20T12:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Accepted threshold workout",
    titleSuggestions: ["Accepted threshold workout"],
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
    ],
  };
}

function buildWorkoutSummary(overrides?: Partial<WorkoutSummary>): WorkoutSummary {
  return {
    id: "workout-1",
    title: "Accepted threshold workout",
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
    selectedWorkout: buildWorkoutRecord(),
    selectedWorkoutMissing: false,
    recentWorkouts: [buildWorkoutSummary()],
    ...overrides,
  };
}

describe("WorkoutBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads an accepted workout and saves canonical edits back to the same workout", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        workout: buildWorkoutRecord({
          draft: {
            ...buildDraft(),
            title: "Builder edited workout",
            description: "Edited in the dedicated builder route.",
          },
        }),
        summary: buildWorkoutSummary({
          title: "Builder edited workout",
        }),
      }),
    } as Response);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Builder edited workout" },
    });
    fireEvent.change(screen.getByTestId("session-draft-description"), {
      target: { value: "Edited in the dedicated builder route." },
    });
    fireEvent.click(screen.getByTestId("workout-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts/workout-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Workout changes saved to the canonical workout.")).toBeVisible();
    });
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Builder edited workout");
  });

  it("shows recovery guidance when the requested workout is missing", () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
          selectedWorkoutMissing: true,
        })}
      />
    );

    expect(screen.getByText("That saved workout could not be found.")).toBeVisible();
    expect(screen.getByTestId("workout-builder-empty-create-manual")).toBeVisible();
    expect(screen.getByRole("link", { name: "Open generator" })).toHaveAttribute(
      "href",
      "/my-library/generator"
    );
    expect(screen.getByTestId("workout-builder-open-workout-workout-1")).toHaveAttribute(
      "href",
      "/my-library/workouts/workout-1"
    );
  });
});
