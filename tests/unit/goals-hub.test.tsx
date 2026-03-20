import type React from "react";
import { cleanup, render, screen } from "@testing-library/react";
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
});
