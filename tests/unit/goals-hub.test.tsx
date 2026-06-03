import type React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoalsHub from "@/components/my-library/goals/GoalsHub";
import type { GoalView } from "@/lib/goals/mvp";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function buildGoal(overrides: Partial<GoalView> = {}): GoalView {
  return {
    id: "goal-1",
    title: "Swim 400m calmly",
    summary: "Hold smoother breathing over 400m.",
    status: "active",
    statusLabel: "Active",
    statusTone: "slate",
    goalType: "distance_time",
    source: "custom",
    progressPercent: 25,
    progressLabel: "Best result so far: 11:10.",
    progressValue: 670,
    targetValue: 600,
    targetDate: "2026-04-15",
    targetDistanceM: 400,
    targetTimeSeconds: 600,
    targetCount: null,
    targetRef: null,
    celebratedAt: null,
    showCelebration: false,
    primaryAction: {
      kind: "log_result",
      label: "Log result",
      inputKind: "time_seconds",
    },
    ...overrides,
  };
}

describe("GoalsHub", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows explicit bridge actions into My Training for active goals", () => {
    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    expect(screen.getByRole("heading", { name: "Your goals" })).toBeInTheDocument();
    expect(screen.getByTestId("goals-overview-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("goals-add-toggle")).toHaveClass("fs-cta-primary");
    expect(screen.getByTestId("goals-filter-active")).toHaveClass(
      "bg-[color:var(--fs-color-brand-700)]"
    );
    expect(screen.getByTestId("goal-card-goal-1")).toHaveClass("fs-library-card");
    expect(screen.getByLabelText("Result (seconds or mm:ss)")).toHaveClass("ui-field");
    expect(screen.getByRole("button", { name: "Log result" })).toHaveClass("fs-cta-primary");
    expect(screen.getByTestId("goal-details-toggle-goal-1")).toHaveClass("fs-cta-secondary");
    expect(screen.queryByTestId("goal-use-focus-goal-1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("goal-details-toggle-goal-1"));
    expect(screen.getByTestId("goal-details-goal-1")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByTestId("goal-use-focus-goal-1")).toHaveAttribute(
      "href",
      "/my-library/training?goalId=goal-1&intent=focus"
    );
    expect(screen.getByTestId("goal-use-focus-goal-1")).toHaveClass("fs-cta-secondary");
    expect(screen.getByTestId("goal-use-note-goal-1")).toHaveAttribute(
      "href",
      "/my-library/training?goalId=goal-1&intent=note"
    );
    expect(screen.getByTestId("goal-use-note-goal-1")).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Archive" })).toHaveClass("fs-cta-secondary");
  });

  it("does not offer bridge actions for archived goals", () => {
    render(
      <GoalsHub
        initialGoals={[
          buildGoal({
            id: "goal-archived",
            title: "Old goal",
            status: "archived",
            statusLabel: "Archived",
            statusTone: "slate",
          }),
        ]}
        templates={[]}
        activeLimit={3}
      />
    );

    expect(screen.queryByTestId("goal-use-focus-goal-archived")).not.toBeInTheDocument();
    expect(screen.queryByTestId("goal-use-note-goal-archived")).not.toBeInTheDocument();
  });

  it("keeps templates hidden until the user opens them", () => {
    render(
      <GoalsHub
        initialGoals={[buildGoal()]}
        templates={[
          {
            id: "template-1",
            title: "1000m template",
            summary: "A calm starting point.",
            goalType: "distance_time",
            targetDistanceM: 1000,
            targetTimeSeconds: 600,
            targetCount: null,
            targetRef: null,
          },
        ]}
        activeLimit={3}
      />
    );

    expect(screen.queryByText("A calm starting point.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add goal" }));
    expect(screen.getByTestId("goals-add-panel")).toHaveClass("fs-library-card");
    expect(screen.getByTestId("goal-template-card-template-1")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByRole("button", { name: "Use template" })).toHaveClass("fs-cta-primary");
    expect(screen.getByText("A calm starting point.")).toBeInTheDocument();
  });

  it("collapses the add goal surface when the user already has goals", () => {
    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    expect(screen.queryByLabelText("Goal title")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add goal" }));
    fireEvent.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByLabelText("Goal title")).toBeInTheDocument();
    expect(screen.getByLabelText("Goal title")).toHaveClass("ui-field");
    expect(screen.getByLabelText("Target type")).toHaveClass("ui-field");
    expect(screen.getByRole("button", { name: "Create custom goal" })).toHaveClass(
      "fs-cta-primary"
    );
  });

  it("filters the goals list from one filter control", () => {
    render(
      <GoalsHub
        initialGoals={[
          buildGoal(),
          buildGoal({
            id: "goal-achieved",
            title: "Achieved goal",
            status: "achieved",
            statusLabel: "Achieved",
            statusTone: "emerald",
            progressPercent: 100,
            progressLabel: "Best: 9:45 (400m under 10:00)",
            progressValue: 585,
          }),
        ]}
        templates={[]}
        activeLimit={3}
      />
    );

    expect(screen.getByTestId("goals-filter-control")).toBeInTheDocument();
    expect(screen.getAllByTestId(/goals-filter-/)).toHaveLength(5);
    fireEvent.click(screen.getByTestId("goals-filter-achieved"));

    expect(screen.getByTestId("goal-card-goal-achieved")).toBeInTheDocument();
    expect(screen.queryByTestId("goal-card-goal-1")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Achieved goals" })).toBeInTheDocument();
  });

  it("renders offline feedback as a polite status", async () => {
    vi.stubGlobal("navigator", { onLine: false });

    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    const feedback = await screen.findByTestId("goals-offline-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "warning");
    expect(feedback).toHaveTextContent(
      "You are offline. You can still browse goals, but create/update actions are paused."
    );
  });

  it("keeps first-run and filtered empty states static for screen readers", () => {
    const archivedGoal = buildGoal({
      id: "goal-archived",
      title: "Archived goal",
      status: "archived",
      statusLabel: "Archived",
      statusTone: "slate",
    });

    const { unmount } = render(<GoalsHub initialGoals={[]} templates={[]} activeLimit={3} />);

    const emptyState = screen.getByTestId("goals-empty-state");
    expect(emptyState).toHaveAttribute("data-feedback-tone", "empty");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(emptyState).toHaveTextContent(
      "No goals yet. Add a template goal or create a custom one above."
    );

    unmount();
    render(<GoalsHub initialGoals={[archivedGoal]} templates={[]} activeLimit={3} />);
    fireEvent.click(screen.getByTestId("goals-filter-active"));

    const noResults = screen.getByTestId("goals-no-results-state");
    expect(noResults).toHaveAttribute("data-feedback-tone", "empty");
    expect(noResults).not.toHaveAttribute("role");
    expect(noResults).not.toHaveAttribute("aria-live");
    expect(noResults).toHaveTextContent(
      "No active goals right now. View achieved goals, restore an archived goal, or add a new one."
    );
  });

  it("renders recoverable action errors as assertive alerts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "Could not clear this best result." }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    fireEvent.click(screen.getByTestId("goal-details-toggle-goal-1"));
    fireEvent.click(screen.getByRole("button", { name: "Clear best result" }));

    const feedback = await screen.findByTestId("goals-action-error");
    expect(feedback).toHaveAttribute("role", "alert");
    expect(feedback).toHaveAttribute("aria-live", "assertive");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Could not clear this best result.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("clears a mistaken best result and updates the card from the server response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          goal: buildGoal({
            progressPercent: 0,
            progressLabel: "No result logged yet. Target: 400m under 10:00.",
            progressValue: 0,
            status: "active",
            statusLabel: "Active",
            statusTone: "slate",
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

    render(
      <GoalsHub
        initialGoals={[
          buildGoal({
            progressPercent: 100,
            progressLabel: "Best: 9:45 (400m under 10:00)",
            progressValue: 585,
            status: "achieved",
            statusLabel: "Achieved",
            statusTone: "emerald",
          }),
        ]}
        templates={[]}
        activeLimit={3}
      />
    );

    fireEvent.click(screen.getByTestId("goal-details-toggle-goal-1"));
    fireEvent.click(screen.getByRole("button", { name: "Clear best result" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/goals/goal-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      action: "reset_result",
    });

    await waitFor(() => {
      const feedback = screen.getByTestId("goals-action-success");
      expect(feedback).toHaveAttribute("role", "status");
      expect(feedback).toHaveAttribute("aria-live", "polite");
      expect(feedback).toHaveAttribute("data-feedback-tone", "success");
      expect(feedback).toHaveTextContent("Best result cleared.");
      expect(
        screen.getByText("No result logged yet. Target: 400m under 10:00.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Clear best result" })).not.toBeInTheDocument();
    });
  });

  it("uses tokenized coaching schedule actions without changing the destination", () => {
    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    const coachingLink = screen.getByRole("link", { name: "Request coaching schedule" });
    expect(coachingLink).toHaveAttribute("href", "/contact?source=goals_coaching");
    expect(coachingLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");
  });
});
