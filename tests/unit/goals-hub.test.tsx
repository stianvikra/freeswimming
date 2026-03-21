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

  it("shows explicit bridge actions into Focus & Notes for active goals", () => {
    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    expect(
      screen.getByRole("heading", { name: "Turn goals into next-session work" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open focus & notes" })).toHaveAttribute(
      "href",
      "/my-library/training"
    );
    expect(screen.getByTestId("goal-use-focus-goal-1")).toHaveAttribute(
      "href",
      "/my-library/training?goalId=goal-1&intent=focus"
    );
    expect(screen.getByTestId("goal-use-note-goal-1")).toHaveAttribute(
      "href",
      "/my-library/training?goalId=goal-1&intent=note"
    );
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
    fireEvent.click(screen.getByRole("button", { name: "Browse templates" }));
    expect(screen.getByText("A calm starting point.")).toBeInTheDocument();
  });

  it("collapses the custom goal creator when the user already has goals", () => {
    render(<GoalsHub initialGoals={[buildGoal()]} templates={[]} activeLimit={3} />);

    expect(screen.queryByLabelText("Goal title")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open creator" }));
    expect(screen.getByLabelText("Goal title")).toBeInTheDocument();
  });

  it("filters the goals list from the summary cards", () => {
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

    fireEvent.click(screen.getByTestId("goals-filter-achieved"));

    expect(screen.getByTestId("goal-card-goal-achieved")).toBeInTheDocument();
    expect(screen.queryByTestId("goal-card-goal-1")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Achieved goals" })).toBeInTheDocument();
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
      expect(screen.getByText("Best result cleared.")).toBeInTheDocument();
      expect(
        screen.getByText("No result logged yet. Target: 400m under 10:00.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Clear best result" })).not.toBeInTheDocument();
    });
  });
});
