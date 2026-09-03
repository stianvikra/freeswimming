import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import MyLibraryRoutinesPage from "@/app/my-library/routines/page";

const ROUTINES_TODAY = "2026-05-14";
const ROUTINES_NOW_ISO = "2026-05-13T10:30:00.000Z";
const ROUTINES_LOCAL_DAY = { selectedDate: ROUTINES_TODAY, todayDate: ROUTINES_TODAY };

type RoutinesWorkspaceProps = { habitSnapshot: { selectedDate: string }; nowIso: string };

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  getRequestReadLocalDayContextMock,
  loadDrylandLibrarySnapshotMock,
  loadHabitSnapshotMock,
  resolveAdminRoleFromSupabaseMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  getRequestReadLocalDayContextMock: vi.fn(),
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

vi.mock("@/lib/my-library/local-day-server", () => ({
  getRequestReadLocalDayContext: getRequestReadLocalDayContextMock,
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

vi.mock("@/components/my-library/LocalDayTimezoneSynchronizer", () => ({
  default: () => <span data-testid="local-day-timezone-synchronizer" />,
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
    getRequestReadLocalDayContextMock.mockResolvedValue({
      todayDate: ROUTINES_TODAY,
      now: new Date(ROUTINES_NOW_ISO),
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
    expect(actionHrefs()).toEqual(["/en/course", "/programs", "/analysis", "/contact"]);
    expect(screen.getByRole("link", { name: /Free course/i })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("link", { name: /Swim programs/i })).toHaveClass("fs-library-card");
    expect(screen.getByRole("link", { name: /Video analysis/i })).toHaveClass("fs-library-card");
    expect(screen.getByRole("link", { name: /Contact/i })).toHaveClass("fs-library-card");
    expect(screen.getByTestId("home-auth-link")).toHaveClass("fs-cta-secondary");
    expect(resolveAdminRoleFromSupabaseMock).not.toHaveBeenCalled();
    expect(getRequestReadLocalDayContextMock).not.toHaveBeenCalled();
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
    expect(microSessionsLink).toHaveClass("fs-library-card", "fs-library-card-muted");
    expect(habitsLink).toHaveClass("fs-library-card", "fs-library-card-muted");
    expect(screen.getByTestId("home-auth-link")).toHaveClass("fs-cta-secondary");
    expect(screen.getByTestId("local-day-timezone-synchronizer")).toBeInTheDocument();
    expect(actionHrefs()).toEqual([
      "/en/course",
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
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(supabase, user.id, ROUTINES_LOCAL_DAY);
  });

  it("shows a generic review action for an H-081 unsupported Habit without leaking its title", async () => {
    const supabase = {};
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: { id: "user-1", email: "learner@example.com" },
    });
    loadHabitSnapshotMock.mockResolvedValue({
      schemaReady: true,
      loadError: null,
      selectedDate: ROUTINES_TODAY,
      activeHabits: [],
      archivedHabits: [],
      unsupportedHabits: [
        {
          id: "unsupported-h081",
          title: "Private future target",
          unsupportedFields: ["invalid_target_shape", "invalid_schedule_days"],
        },
      ],
      daySummary: {
        date: ROUTINES_TODAY,
        scheduledHabitCount: 0,
        perfectDayItemCount: 0,
        satisfiedPerfectDayItemCount: 0,
        completionPercent: 0,
        isPerfectDay: false,
        completedDurationMinutes: 0,
        completedCountTotal: 0,
        items: [],
      },
      weekSummary: { days: [] },
    });

    render(await HomePage());

    const habitsLink = screen.getByTestId("home-routine-action-habits");
    expect(habitsLink).toHaveAttribute("aria-label", "Habits: 1 habit needs review");
    expect(habitsLink).toHaveAttribute("href", "/my-library/habits?view=active#today-habits");
    expect(document.body).not.toHaveTextContent("Private future target");
    expect(document.body).not.toHaveTextContent("invalid_target_shape");
  });

  it("keeps the dashboard exit admin-gated while using token actions", async () => {
    const supabase = {};
    const user = {
      id: "admin-1",
      email: "admin@example.com",
    };
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user,
    });
    resolveAdminRoleFromSupabaseMock.mockResolvedValue("admin");

    render(await HomePage());

    const dashboardLink = screen.getByTestId("home-admin-link");
    expect(dashboardLink).toHaveAttribute("href", "/admin");
    expect(dashboardLink).toHaveClass("fs-cta-secondary");
    expect(dashboardLink.getAttribute("class")).toContain("fs-color-brand-50");
  });

  it("uses the shared local-day context for My Routines snapshot and clock", async () => {
    const user = { id: "user-1" };
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: {},
      user,
    });
    loadHabitSnapshotMock.mockResolvedValue({ selectedDate: ROUTINES_TODAY });
    const page = await MyLibraryRoutinesPage();

    const workspace = (page.props.children as React.ReactElement<RoutinesWorkspaceProps>[])[1];
    expect(workspace.props.habitSnapshot.selectedDate).toBe(ROUTINES_TODAY);
    expect(workspace.props.nowIso).toBe(ROUTINES_NOW_ISO);
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      user.id,
      ROUTINES_LOCAL_DAY
    );
  });

  it("redirects anonymous My Routines visitors before local-day resolution", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({ supabase: null, user: null });

    await expect(MyLibraryRoutinesPage()).rejects.toMatchObject({
      digest: expect.stringContaining("/auth/sign-in?next=%2Fmy-library%2Froutines"),
    });
    expect(getRequestReadLocalDayContextMock).not.toHaveBeenCalled();
  });
});
