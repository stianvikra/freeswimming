import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadDrylandLibrarySnapshotMock,
  loadHabitSnapshotMock,
  resolveAdminRoleFromSupabaseMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadDrylandLibrarySnapshotMock: vi.fn(),
  loadHabitSnapshotMock: vi.fn(),
  resolveAdminRoleFromSupabaseMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/admin/server", () => ({
  resolveAdminRoleFromSupabase: resolveAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/dryland/server", () => ({
  loadDrylandLibrarySnapshot: loadDrylandLibrarySnapshotMock,
}));

vi.mock("@/lib/habits/server", () => ({
  loadHabitSnapshot: loadHabitSnapshotMock,
}));

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

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/PageTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/brand/BrandImage", () => ({
  default: () => <span data-testid="brand-image" />,
}));

function actionHrefs() {
  return within(screen.getByTestId("home-primary-actions"))
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));
}

describe("HomePage routines entrypoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveAdminRoleFromSupabaseMock.mockResolvedValue(null);
    loadDrylandLibrarySnapshotMock.mockResolvedValue({
      microPlan: null,
      microPlanLoadError: null,
      microPlanSchemaReady: true,
      recentSessions: [],
    });
    loadHabitSnapshotMock.mockResolvedValue({
      schemaReady: true,
      loadError: null,
      selectedDate: "2026-05-13",
      activeHabits: [],
      archivedHabits: [],
      daySummary: {
        date: "2026-05-13",
        scheduledHabitCount: 0,
        perfectDayItemCount: 0,
        satisfiedPerfectDayItemCount: 0,
        completionPercent: 0,
        isPerfectDay: false,
        completedDurationMinutes: 0,
        completedCountTotal: 0,
        items: [],
      },
      weekSummary: {
        days: [],
        perfectDayCount: 0,
        averageCompletionPercent: 0,
        totalDurationMinutes: 0,
        totalCount: 0,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps routines hidden for anonymous visitors", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    render(await HomePage());

    expect(screen.queryByRole("link", { name: /My Routines/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Micro Sessions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Habits/i })).not.toBeInTheDocument();
    expect(actionHrefs()).toEqual(["/course", "/programs", "/analysis", "/contact"]);
    expect(resolveAdminRoleFromSupabaseMock).not.toHaveBeenCalled();
    expect(loadDrylandLibrarySnapshotMock).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("places signed-in routine quick actions directly below Free course", async () => {
    const supabase = {};
    const user = {
      id: "user-1",
      email: "learner@example.com",
    };
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user,
    });

    render(await HomePage());

    const microSessionsLink = screen.getByRole("link", {
      name: /Micro Sessions: Create dryland first/i,
    });
    const habitsLink = screen.getByRole("link", { name: /Habits: Add first habit/i });
    expect(microSessionsLink).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=setup#micro-sessions"
    );
    expect(habitsLink).toHaveAttribute("href", "/my-library/habits?view=active#add-habit");
    expect(actionHrefs()).toEqual([
      "/course",
      "/my-library/dryland?micro=setup#micro-sessions",
      "/my-library/habits?view=active#add-habit",
      "/programs",
      "/analysis",
      "/contact",
    ]);
    expect(resolveAdminRoleFromSupabaseMock).toHaveBeenCalledWith(supabase, user, {
      allowlistedEmailsRaw: undefined,
    });
    expect(loadDrylandLibrarySnapshotMock).toHaveBeenCalledWith(supabase, user.id, null);
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(supabase, user.id);
  });
});
