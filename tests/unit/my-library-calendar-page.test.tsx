import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryCalendarPage from "@/app/my-library/calendar/page";
import type { MyLibraryCalendarComparisonModel } from "@/lib/my-library/calendar-comparison";
import type { MyLibraryCalendarPlanModel } from "@/lib/my-library/calendar-plan";
import {
  buildMyLibraryCalendarComparisonWindow,
  buildMyLibraryCalendarMonthWindow,
} from "@/lib/my-library/calendar";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadMyLibraryCalendarComparisonMock,
  loadMyLibraryCalendarPlanMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadMyLibraryCalendarComparisonMock: vi.fn(),
  loadMyLibraryCalendarPlanMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/my-library/CalendarPeriodComparisonHub", () => ({
  default: ({ model }: { model: MyLibraryCalendarComparisonModel }) => (
    <div
      data-testid="calendar-period-comparison-hub"
      data-selected-source={model.selectedSource}
      data-selected-period={model.selectedPeriod}
    />
  ),
}));

vi.mock("@/components/my-library/CalendarPlanWeekHub", () => ({
  default: ({ model }: { model: MyLibraryCalendarPlanModel }) => (
    <div
      data-testid="calendar-plan-week-hub"
      data-selected-date={model.selectedDate}
      data-selected-program-id={model.selectedProgramId ?? ""}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/my-library/calendar-comparison", () => ({
  loadMyLibraryCalendarComparison: loadMyLibraryCalendarComparisonMock,
}));

vi.mock("@/lib/my-library/calendar-plan", () => ({
  loadMyLibraryCalendarPlan: loadMyLibraryCalendarPlanMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildModel(): MyLibraryCalendarComparisonModel {
  return {
    selectedSource: "habits",
    selectedPeriod: "month",
    problemLabel: null,
    window: buildMyLibraryCalendarComparisonWindow({
      selectedDate: "2026-05-20",
      todayDate: "2026-06-05",
      period: "month",
    }),
    sourceComparisons: [],
  };
}

function buildPlanModel(): MyLibraryCalendarPlanModel {
  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-06-22",
    todayDate: "2026-06-20",
    window: {
      selectedDate: "2026-06-22",
      startDate: "2026-06-22",
      endDate: "2026-06-28",
      weekNumber: 26,
      weekYear: 2026,
      weekLabel: "Week 26, 2026",
      previousWindowDate: "2026-06-15",
      nextWindowDate: "2026-06-29",
    },
    month: buildMyLibraryCalendarMonthWindow({
      selectedDate: "2026-06-22",
      todayDate: "2026-06-20",
    }),
    selectedProgramId: "program-1",
    selectedProgramMissing: false,
    completionSchemaReady: true,
    programs: [],
    unanchoredPrograms: [],
    missingWorkoutIds: [],
    days: [],
    monthDays: [],
    selectedDay: {
      date: "2026-06-22",
      dayIndex: 0,
      dayLabel: "Monday",
      sessions: [],
    },
    sessionCount: 0,
  };
}

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("MyLibraryCalendarPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadMyLibraryCalendarComparisonMock.mockResolvedValue(buildModel());
    loadMyLibraryCalendarPlanMock.mockResolvedValue(buildPlanModel());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell and passes route params to the comparison loader", async () => {
    render(
      await MyLibraryCalendarPage({
        searchParams: Promise.resolve({
          source: "habits",
          period: "month",
          date: "2026-05-20",
          compareTo: "2026-04-20",
        }),
      })
    );

    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-workspace")).toHaveClass(
      "max-w-[1080px]",
      "pt-16",
      "sm:pt-24"
    );
    expect(screen.getByRole("heading", { name: "Calendar", level: 1 })).toBeVisible();
    expect(screen.getByTestId("calendar-mode-switch")).toBeVisible();
    expect(
      within(screen.getByTestId("calendar-mode-switch")).getByRole("link", { name: "Plan" })
    ).toHaveAttribute("href", "/my-library/calendar?view=plan&date=2026-05-20");
    expect(
      within(screen.getByTestId("calendar-mode-switch")).getByRole("link", { name: "Stats" })
    ).toHaveAttribute(
      "href",
      "/my-library/calendar?view=compare&source=habits&period=month&date=2026-05-20&compareTo=2026-04-20"
    );
    expect(screen.queryByRole("link", { name: "Back to My Library" })).not.toBeInTheDocument();
    expect(screen.getByTestId("calendar-period-comparison-hub")).toHaveAttribute(
      "data-selected-source",
      "habits"
    );

    expect(loadMyLibraryCalendarComparisonMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      expect.objectContaining({
        selectedDate: "2026-05-20",
        selectedSource: "habits",
        selectedPeriod: "month",
        compareToDate: "2026-04-20",
      })
    );
  });

  it("fails closed for unsupported source and period params", async () => {
    render(
      await MyLibraryCalendarPage({
        searchParams: Promise.resolve({
          source: "cycling",
          period: "quarter",
          date: "2026-05-20",
        }),
      })
    );

    expect(loadMyLibraryCalendarComparisonMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      expect.objectContaining({
        selectedSource: "unmapped",
        selectedPeriod: "unmapped",
      })
    );
  });

  it("routes plan mode through the planned-instance loader with future dates", async () => {
    render(
      await MyLibraryCalendarPage({
        searchParams: Promise.resolve({
          view: "plan",
          date: "2026-06-22",
          programId: "program-1",
        }),
      })
    );

    expect(screen.getByRole("heading", { name: "Calendar", level: 1 })).toBeVisible();
    expect(screen.getByTestId("calendar-workspace")).toHaveClass("max-w-[1680px]");
    expect(screen.getByTestId("calendar-plan-week-hub")).toHaveAttribute(
      "data-selected-date",
      "2026-06-22"
    );
    expect(screen.getByTestId("calendar-plan-week-hub")).toHaveAttribute(
      "data-selected-program-id",
      "program-1"
    );
    expect(loadMyLibraryCalendarPlanMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      {
        selectedDate: "2026-06-22",
        todayDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        selectedProgramId: "program-1",
      }
    );
    expect(loadMyLibraryCalendarComparisonMock).not.toHaveBeenCalled();
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryCalendarPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fcalendar"
    );
  });
});
