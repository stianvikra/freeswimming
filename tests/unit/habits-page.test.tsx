import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryHabitsPage from "@/app/my-library/habits/page";
import type { HabitSnapshot } from "@/lib/habits/shared";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  getRequestReadLocalDayContextMock,
  loadHabitSnapshotMock,
  trackEventOnMountMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  getRequestReadLocalDayContextMock: vi.fn(),
  loadHabitSnapshotMock: vi.fn(),
  trackEventOnMountMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/analytics/TrackEventOnMount", () => ({
  default: (props: {
    eventName: string;
    localDayTimezone?: string;
    payload: Record<string, unknown>;
  }) => {
    if (props.localDayTimezone === undefined || props.localDayTimezone === "Europe/Oslo") {
      trackEventOnMountMock(props);
    }
    return (
      <div
        data-testid={`track-${props.eventName}`}
        data-local-day-timezone={props.localDayTimezone ?? ""}
      />
    );
  },
}));

vi.mock("@/components/my-library/habits/HabitPerfectDayHub", () => ({
  default: ({
    initialSnapshot,
    preferMobileActiveFocus,
    todayDate,
    localDayTimezone,
    userId,
  }: {
    initialSnapshot: HabitSnapshot;
    preferMobileActiveFocus?: boolean;
    todayDate?: string;
    localDayTimezone?: string;
    userId?: string;
  }) => (
    <div
      data-testid="habit-perfect-day-hub"
      data-active-count={initialSnapshot.activeHabits.length}
      data-mobile-focus={preferMobileActiveFocus ? "true" : "false"}
      data-today-date={todayDate ?? ""}
      data-local-day-timezone={localDayTimezone ?? ""}
      data-user-id={userId ?? ""}
    />
  ),
}));

vi.mock("@/components/my-library/LocalDayTimezoneSynchronizer", () => ({
  default: () => <div data-testid="local-day-timezone-synchronizer" />,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/habits/server", () => ({
  loadHabitSnapshot: loadHabitSnapshotMock,
}));

vi.mock("@/lib/my-library/local-day-server", () => ({
  getRequestReadLocalDayContext: getRequestReadLocalDayContextMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildSnapshot(
  input: { activeHabitCount?: number; completionPercent?: number } = {}
): HabitSnapshot {
  return {
    activeHabits: Array.from({ length: input.activeHabitCount ?? 1 }, (_, index) => ({
      id: `habit-${index + 1}`,
    })),
    daySummary: {
      completionPercent: input.completionPercent ?? 50,
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
    getRequestReadLocalDayContextMock.mockResolvedValue({
      status: "resolved",
      source: "cookie",
      timezone: "Europe/Oslo",
      todayDate: "2026-05-10",
      now: new Date("2026-05-10T22:30:00.000Z"),
    });
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
    expect(screen.getByTestId("local-day-timezone-synchronizer")).toBeInTheDocument();
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
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-local-day-timezone",
      "Europe/Oslo"
    );
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.any(Object), signedInUser.id, {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "habits_viewed",
      localDayTimezone: "Europe/Oslo",
      payload: {
        activeHabitCount: 1,
        perfectDayPercent: 50,
      },
    });
  });

  it("keeps the Home mobile focus query route-owned", async () => {
    render(await MyLibraryHabitsPage({ searchParams: Promise.resolve({ view: "active" }) }));

    const workspace = screen.getByTestId("habits-workspace");
    expect(workspace).toHaveClass("pt-[4.5rem]", "max-sm:max-w-[720px]", "sm:pt-28");
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-mobile-focus",
      "true"
    );
  });

  it("waits for cookie reconciliation and records only the corrected local-day payload", async () => {
    getRequestReadLocalDayContextMock
      .mockResolvedValueOnce({
        status: "resolved",
        source: "cookie",
        timezone: "UTC",
        todayDate: "2026-05-10",
        now: new Date("2026-05-10T22:30:00.000Z"),
      })
      .mockResolvedValueOnce({
        status: "resolved",
        source: "cookie",
        timezone: "Europe/Oslo",
        todayDate: "2026-05-11",
        now: new Date("2026-05-10T22:30:00.000Z"),
      });
    loadHabitSnapshotMock
      .mockResolvedValueOnce(buildSnapshot({ activeHabitCount: 1, completionPercent: 20 }))
      .mockResolvedValueOnce(buildSnapshot({ activeHabitCount: 2, completionPercent: 40 }));

    render(await MyLibraryHabitsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId("track-habits_viewed")).toHaveAttribute(
      "data-local-day-timezone",
      "UTC"
    );
    expect(trackEventOnMountMock).not.toHaveBeenCalled();

    cleanup();
    render(await MyLibraryHabitsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId("track-habits_viewed")).toHaveAttribute(
      "data-local-day-timezone",
      "Europe/Oslo"
    );
    expect(trackEventOnMountMock).toHaveBeenCalledTimes(1);
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "habits_viewed",
      localDayTimezone: "Europe/Oslo",
      payload: {
        activeHabitCount: 2,
        perfectDayPercent: 40,
      },
    });
  });

  it("loads a valid selected history date from the route query", async () => {
    render(
      await MyLibraryHabitsPage({
        searchParams: Promise.resolve({ view: "active", date: "2026-05-03" }),
      })
    );

    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.any(Object), signedInUser.id, {
      selectedDate: "2026-05-03",
      todayDate: "2026-05-10",
    });
    expect(screen.getByTestId("habit-perfect-day-hub")).toHaveAttribute(
      "data-mobile-focus",
      "true"
    );
  });

  it("falls back to local today for an impossible route date", async () => {
    render(
      await MyLibraryHabitsPage({
        searchParams: Promise.resolve({ date: "2026-02-31" }),
      })
    );

    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.any(Object), signedInUser.id, {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
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
