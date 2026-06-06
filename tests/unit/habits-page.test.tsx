import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryHabitsPage from "@/app/my-library/habits/page";
import type { HabitSnapshot } from "@/lib/habits/shared";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadHabitSnapshotMock,
  trackEventOnMountMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadHabitSnapshotMock: vi.fn(),
  trackEventOnMountMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/analytics/TrackEventOnMount", () => ({
  default: (props: { eventName: string; payload: Record<string, unknown> }) => {
    trackEventOnMountMock(props);
    return <div data-testid={`track-${props.eventName}`} />;
  },
}));

vi.mock("@/components/my-library/habits/HabitPerfectDayHub", () => ({
  default: ({
    initialSnapshot,
    preferMobileActiveFocus,
    todayDate,
    userId,
  }: {
    initialSnapshot: HabitSnapshot;
    preferMobileActiveFocus?: boolean;
    todayDate?: string;
    userId?: string;
  }) => (
    <div
      data-testid="habit-perfect-day-hub"
      data-active-count={initialSnapshot.activeHabits.length}
      data-mobile-focus={preferMobileActiveFocus ? "true" : "false"}
      data-today-date={todayDate ?? ""}
      data-user-id={userId ?? ""}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/habits/server", () => ({
  loadHabitSnapshot: loadHabitSnapshotMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildSnapshot(): HabitSnapshot {
  return {
    activeHabits: [{ id: "habit-1" }],
    daySummary: {
      completionPercent: 50,
    },
  } as unknown as HabitSnapshot;
}

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("MyLibraryHabitsPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadHabitSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell while preserving route action and analytics", async () => {
    render(await MyLibraryHabitsPage({ searchParams: Promise.resolve({}) }));

    const workspace = screen.getByTestId("habits-workspace");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Habits", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("habits-route-actions");
    expect(actions).toHaveClass("hidden", "sm:block");
    const backLink = within(actions).getByRole("link", { name: "Back" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary");
    expect(screen.queryByRole("link", { name: "Back to My Library" })).not.toBeInTheDocument();

    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute("data-user-id", "user-123");
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-mobile-focus",
      "false"
    );
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
    );
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "habits_viewed",
      payload: {
        activeHabitCount: 1,
        perfectDayPercent: 50,
      },
    });
  });

  it("keeps the Home mobile focus query route-owned", async () => {
    render(await MyLibraryHabitsPage({ searchParams: Promise.resolve({ view: "active" }) }));

    const workspace = screen.getByTestId("habits-workspace");
    expect(workspace).toHaveClass("max-sm:max-w-[720px]");
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-mobile-focus",
      "true"
    );
  });

  it("loads a valid selected history date from the route query", async () => {
    render(
      await MyLibraryHabitsPage({
        searchParams: Promise.resolve({ view: "active", date: "2026-05-03" }),
      })
    );

    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      "2026-05-03"
    );
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-mobile-focus",
      "true"
    );
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryHabitsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fhabits"
    );
  });
});
