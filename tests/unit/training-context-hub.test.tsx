import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TrainingContextHub from "@/components/my-library/training/TrainingContextHub";
import type {
  TrainingContextSnapshot,
  TrainingFocusView,
  TrainingNoteView,
} from "@/lib/training-context/server";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildFocus(overrides?: Partial<TrainingFocusView>): TrainingFocusView {
  return {
    id: "focus-1",
    title: "Longer exhale in the water",
    details: "Keep one goggle in while rotating to breathe.",
    status: "open",
    statusLabel: "Open",
    isPrimary: true,
    goalId: "goal-1",
    goalTitle: "Swim 400m calmly",
    contextType: null,
    contextRef: null,
    createdAt: "2026-03-19T10:00:00.000Z",
    updatedAt: "2026-03-19T10:00:00.000Z",
    completedAt: null,
    archivedAt: null,
    ...overrides,
  };
}

function buildNote(overrides?: Partial<TrainingNoteView>): TrainingNoteView {
  return {
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
    ...overrides,
  };
}

function buildSnapshot(overrides?: Partial<TrainingContextSnapshot>): TrainingContextSnapshot {
  const primaryFocus = buildFocus();

  return {
    schemaReady: true,
    loadError: null,
    activeFocus: primaryFocus,
    primaryFocus,
    openFocuses: [primaryFocus],
    focusHistory: [],
    focusNeedsPrimarySelection: false,
    recentNotes: [buildNote()],
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
    ...overrides,
  };
}

describe("TrainingContextHub", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders calmer focus and notes sections", () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    expect(screen.getByRole("heading", { name: "Focus" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByTestId("training-focus-card-focus-1")).toHaveTextContent("Primary");
    expect(screen.getByText(/Keep the main cue clear/i)).toBeInTheDocument();
    expect(screen.getAllByText("Primary focus").length).toBeGreaterThan(0);
  });

  it("opens question editing with answer field", () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit note" }));

    expect(screen.getByLabelText("Answer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Unanswered")).toBeInTheDocument();
  });

  it("shows note timestamps and lets the user filter the notes list", () => {
    render(
      <TrainingContextHub
        initialSnapshot={buildSnapshot({
          recentNotes: [
            buildNote(),
            buildNote({
              id: "note-2",
              noteType: "observation",
              noteTypeLabel: "Observation",
              status: "open",
              statusLabel: "Open",
              body: "Breathing stayed calmer after the second rep.",
              answer: null,
              createdAt: "2026-03-20T11:00:00.000Z",
              updatedAt: "2026-03-21T12:15:00.000Z",
            }),
          ],
          unresolvedObservationCount: 1,
          unansweredQuestionCount: 1,
        })}
      />
    );

    expect(screen.getByTestId("training-note-card-note-2")).toHaveTextContent(
      "Logged Mar 20, 2026, 11:00 AM UTC"
    );
    expect(screen.getByTestId("training-note-card-note-2")).toHaveTextContent(
      "Last edited Mar 21, 2026, 12:15 PM UTC"
    );

    fireEvent.change(screen.getByTestId("training-note-search-input"), {
      target: { value: "calmer" },
    });

    expect(screen.getByTestId("training-note-card-note-2")).toBeInTheDocument();
    expect(screen.queryByTestId("training-note-card-note-1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 notes.")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("training-note-search-input"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByTestId("training-note-type-filter"), {
      target: { value: "question" },
    });
    fireEvent.change(screen.getByTestId("training-note-from-date-filter"), {
      target: { value: "2026-03-20" },
    });

    expect(screen.queryByTestId("training-note-card-note-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("training-note-card-note-2")).not.toBeInTheDocument();
    expect(screen.getByText(/No notes match the current filters/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByTestId("training-note-card-note-1")).toBeInTheDocument();
    expect(screen.getByTestId("training-note-card-note-2")).toBeInTheDocument();
  });

  it("applies goal prefill while preserving existing local draft text", async () => {
    localStorage.setItem(
      "training-context-focus-draft",
      JSON.stringify({
        title: "Keep hips higher",
        details: "Stay long through the neck.",
        goalId: "",
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
      screen.getByText(
        /was selected from Goals for your next focus\. Existing draft text stayed in place\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("training-focus-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );
    expect(screen.getByTestId("training-focus-intent-badge")).toBeInTheDocument();
    expect(screen.getByTestId("training-note-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "false"
    );
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
    expect(screen.getByTestId("training-note-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );
    expect(screen.getByTestId("training-note-intent-badge")).toBeInTheDocument();
  });

  it("highlights the note workflow when the goal intent is note", async () => {
    render(
      <TrainingContextHub
        initialSnapshot={buildSnapshot()}
        initialGoalPrefill={{ goalId: "goal-1", intent: "note" }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("training-note-goal-select")).toHaveValue("goal-1");
    });

    expect(screen.getByText(/was selected from Goals for your next note\./i)).toBeInTheDocument();
    expect(screen.getByTestId("training-note-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );
    expect(screen.getByTestId("training-note-intent-badge")).toBeInTheDocument();
    expect(screen.queryByTestId("training-focus-form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("training-focus-form-toggle"));

    await waitFor(() => {
      expect(screen.getByTestId("training-focus-goal-select")).toHaveValue("goal-1");
    });
    expect(screen.getByTestId("training-focus-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "false"
    );
  });

  it("warns when multiple open focuses need a primary selection", () => {
    const firstOpenFocus = buildFocus({
      id: "focus-1",
      isPrimary: false,
      title: "Longer exhale in the water",
    });
    const secondOpenFocus = buildFocus({
      id: "focus-2",
      isPrimary: false,
      title: "Patient catch timing",
      goalId: null,
      goalTitle: null,
    });

    render(
      <TrainingContextHub
        initialSnapshot={buildSnapshot({
          activeFocus: null,
          primaryFocus: null,
          openFocuses: [firstOpenFocus, secondOpenFocus],
          focusNeedsPrimarySelection: true,
        })}
      />
    );

    expect(screen.getByRole("heading", { name: "Choose a primary focus" })).toBeInTheDocument();
    expect(
      screen.getByText(/You have 2 open focuses and no primary focus selected yet\./i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("training-focus-set-primary-focus-2")).toBeInTheDocument();
  });

  it("renders overview cards with jump links to goals, focus, and notes", () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    expect(screen.getByTestId("training-overview-card-goals")).toHaveAttribute(
      "href",
      "#training-goals-section"
    );
    expect(screen.getByTestId("training-overview-card-focus")).toHaveAttribute(
      "href",
      "#training-focus-section"
    );
    expect(screen.getByTestId("training-overview-card-notes")).toHaveAttribute(
      "href",
      "#training-notes-section"
    );
    expect(screen.getByTestId("training-overview-card-goals")).toHaveTextContent(
      "Swim 400m calmly"
    );
    expect(screen.getByTestId("training-overview-card-focus")).toHaveTextContent(
      "Longer exhale in the water"
    );
    expect(screen.getByTestId("training-overview-card-notes")).toHaveTextContent("Latest note");
  });

  it("collapses and reopens focus and note drafts without losing text", async () => {
    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    expect(screen.queryByTestId("training-focus-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("training-note-form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("training-focus-form-toggle"));
    fireEvent.change(screen.getByPlaceholderText("Exhale calmly before turning to breathe"), {
      target: { value: "Hold the line on every catch" },
    });
    fireEvent.click(screen.getByTestId("training-focus-form-toggle"));

    expect(screen.queryByTestId("training-focus-form")).not.toBeInTheDocument();
    expect(screen.getByText("Draft ready: Hold the line on every catch")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Resume draft",
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("training-focus-form-toggle"));
    expect(screen.getByDisplayValue("Hold the line on every catch")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("training-note-form-toggle"));
    fireEvent.change(screen.getByPlaceholderText("What did you notice in the pool?"), {
      target: { value: "Breathing felt calmer after the second 100." },
    });
    fireEvent.click(screen.getByTestId("training-note-form-toggle"));

    expect(screen.queryByTestId("training-note-form")).not.toBeInTheDocument();
    expect(
      screen.getByText("Draft ready: Breathing felt calmer after the second 100.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("training-note-form-toggle"));
    expect(
      screen.getByDisplayValue("Breathing felt calmer after the second 100.")
    ).toBeInTheDocument();
  });

  it("groups secondary focuses and keeps complete/archive behind edit for non-primary cards", () => {
    const primary = buildFocus({
      id: "focus-1",
      title: "Longer exhale in the water",
      isPrimary: true,
    });
    const secondary = buildFocus({
      id: "focus-2",
      title: "Patient catch timing",
      isPrimary: false,
      goalId: null,
      goalTitle: null,
    });

    render(
      <TrainingContextHub
        initialSnapshot={buildSnapshot({
          activeFocus: primary,
          primaryFocus: primary,
          openFocuses: [primary, secondary],
        })}
      />
    );

    expect(screen.getAllByText("Primary focus").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Other open focuses" })).toBeInTheDocument();
    expect(screen.getByTestId("training-focus-card-focus-2")).toHaveTextContent(
      "Patient catch timing"
    );
    expect(
      within(screen.getByTestId("training-focus-card-focus-2")).queryByRole("button", {
        name: "Mark completed",
      })
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("training-focus-card-focus-2")).queryByRole("button", {
        name: "Archive",
      })
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId("training-focus-card-focus-2")).getByRole("button", {
        name: "Edit focus",
      })
    );

    expect(
      within(screen.getByTestId("training-focus-card-focus-2")).getByRole("button", {
        name: "Mark completed",
      })
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("training-focus-card-focus-2")).getByRole("button", {
        name: "Archive",
      })
    ).toBeInTheDocument();
  });

  it("edits an open focus inline and saves the updated snapshot", async () => {
    const updatedFocus = buildFocus({
      title: "Patient catch timing",
      details: "Hold the line before pressing back.",
      isPrimary: false,
      goalId: "goal-2",
      goalTitle: "Build smoother breathing",
    });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          snapshot: buildSnapshot({
            activeFocus: updatedFocus,
            primaryFocus: null,
            openFocuses: [updatedFocus],
          }),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit focus" }));
    fireEvent.change(screen.getByDisplayValue("Longer exhale in the water"), {
      target: { value: "Patient catch timing" },
    });
    fireEvent.change(screen.getByDisplayValue("Keep one goggle in while rotating to breathe."), {
      target: { value: "Hold the line before pressing back." },
    });
    fireEvent.change(screen.getByTestId("training-focus-edit-goal-select-focus-1"), {
      target: { value: "goal-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save focus" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my-library/training-context/focus/focus-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            title: "Patient catch timing",
            details: "Hold the line before pressing back.",
            goalId: "goal-2",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Focus updated.")).toBeInTheDocument();
    });
    expect(screen.getByTestId("training-focus-card-focus-1")).toHaveTextContent(
      "Patient catch timing"
    );
  });

  it("removes primary focus explicitly without forcing another action", async () => {
    const clearedPrimaryFocus = buildFocus({ isPrimary: false });
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          snapshot: buildSnapshot({
            activeFocus: clearedPrimaryFocus,
            primaryFocus: null,
            openFocuses: [clearedPrimaryFocus],
          }),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<TrainingContextHub initialSnapshot={buildSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove primary" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/my-library/training-context/focus/focus-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ action: "clear_primary" }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Primary focus removed.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Primary focus")).not.toBeInTheDocument();
    expect(screen.getByText("Current focus cue")).toBeInTheDocument();
  });
});
