import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryGoalsPage from "@/app/my-library/goals/page";
import type { GoalView } from "@/lib/goals/mvp";

const { getServerSupabaseUserIfAuthCookiePresentMock, loadGoalViewsMock } = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadGoalViewsMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/my-library/goals/GoalsHub", () => ({
  default: ({
    initialGoals,
    activeLimit,
  }: {
    initialGoals: GoalView[];
    templates: readonly unknown[];
    activeLimit: number;
  }) => (
    <div
      data-testid="goals-hub"
      data-goal-count={initialGoals.length}
      data-active-limit={activeLimit}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/goals/server", () => ({
  loadGoalViews: loadGoalViewsMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildGoal(): GoalView {
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
  };
}

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("MyLibraryGoalsPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadGoalViewsMock.mockResolvedValue([buildGoal()]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell while preserving route action and goal loading", async () => {
    render(await MyLibraryGoalsPage());

    const workspace = screen.getByTestId("goals-workspace");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Goals", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("goals-route-actions");
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary");

    expect(screen.getByTestId("goals-hub")).toHaveAttribute("data-goal-count", "1");
    expect(screen.getByTestId("goals-hub")).toHaveAttribute("data-active-limit", "3");
    expect(loadGoalViewsMock).toHaveBeenCalledWith(expect.any(Object), signedInUser.id);
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryGoalsPage()).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fgoals"
    );
  });
});
