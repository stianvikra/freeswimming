import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
});
