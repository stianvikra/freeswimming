import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TrainingContextHub from "@/components/my-library/training/TrainingContextHub";
import type { TrainingContextSnapshot } from "@/lib/training-context/server";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildSnapshot(): TrainingContextSnapshot {
  return {
    schemaReady: true,
    loadError: null,
    activeFocus: {
      id: "focus-1",
      title: "Longer exhale in the water",
      details: "Keep one goggle in while rotating to breathe.",
      status: "active",
      statusLabel: "Active",
      goalId: "goal-1",
      goalTitle: "Swim 400m calmly",
      contextType: null,
      contextRef: null,
      createdAt: "2026-03-19T10:00:00.000Z",
      updatedAt: "2026-03-19T10:00:00.000Z",
      completedAt: null,
      archivedAt: null,
    },
    focusHistory: [],
    recentNotes: [
      {
        id: "note-1",
        noteType: "question",
        noteTypeLabel: "Question",
        status: "unanswered",
        statusLabel: "Unanswered",
        body: "Am I lifting my head before the breath?",
        answer: null,
        goalId: "goal-1",
        goalTitle: "Swim 400m calmly",
        focusId: "focus-1",
        focusTitle: "Longer exhale in the water",
        contextType: null,
        contextRef: null,
        isResolved: false,
        createdAt: "2026-03-19T10:00:00.000Z",
        updatedAt: "2026-03-19T10:00:00.000Z",
        resolvedAt: null,
      },
    ],
    unresolvedObservationCount: 0,
    unansweredQuestionCount: 1,
    goalOptions: [
      {
        id: "goal-1",
        title: "Swim 400m calmly",
        status: "active",
        statusLabel: "Active",
      },
      {
        id: "goal-2",
        title: "Build smoother breathing",
        status: "on_track",
        statusLabel: "On track",
      },
    ],
  };
}

describe("TrainingContextHub", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders Focus and Notes as separate sections", () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    expect(screen.getByRole("heading", { name: "Current focus" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByText("Longer exhale in the water")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Keep one active training priority at a time, separate from longer-term goals."
      )
    ).toBeInTheDocument();
  });

  it("opens question editing with answer field", () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit note" }));

    expect(screen.getByLabelText("Answer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Unanswered")).toBeInTheDocument();
  });

  it("applies goal prefill while preserving existing local draft text", async () => {
    localStorage.setItem(
      "training-context-focus-draft",
      JSON.stringify({
        title: "Keep hips higher",
        details: "Stay long through the neck.",
        goalId: "",
        replaceExistingStatus: "completed",
      })
    );
    localStorage.setItem(
      "training-context-note-draft",
      JSON.stringify({
        noteType: "observation",
        body: "I still rush the second half of the breath.",
        goalId: "",
        focusId: "",
      })
    );

    render(
      <TrainingContextHub
        initialSnapshot={buildSnapshot()}
        initialGoalPrefill={{ goalId: "goal-1", intent: "focus" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("training-focus-goal-select")).toHaveValue("goal-1");
      expect(screen.getByTestId("training-note-goal-select")).toHaveValue("goal-1");
    });

    expect(screen.getByDisplayValue("Keep hips higher")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("I still rush the second half of the breath.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/was selected from Goals\. Existing draft text stayed in place\./i)
    ).toBeInTheDocument();
  });

  it("lets the user pick another goal for the note workflow from quick actions", async () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    fireEvent.click(screen.getByTestId("training-goal-context-use-note-goal-2"));

    await waitFor(() => {
      expect(screen.getByTestId("training-note-goal-select")).toHaveValue("goal-2");
    });

    expect(screen.getByTestId("training-context-selected-goal")).toHaveTextContent(
      "Build smoother breathing"
    );
  });
});
