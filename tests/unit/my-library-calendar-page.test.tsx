import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryCalendarPage from "@/app/my-library/calendar/page";
import type { MyLibraryCalendarComparisonModel } from "@/lib/my-library/calendar-comparison";
import { buildMyLibraryCalendarComparisonWindow } from "@/lib/my-library/calendar";

const { getServerSupabaseUserIfAuthCookiePresentMock, loadMyLibraryCalendarComparisonMock } =
  vi.hoisted(() => ({
    getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
    loadMyLibraryCalendarComparisonMock: vi.fn(),
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

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/my-library/calendar-comparison", () => ({
  loadMyLibraryCalendarComparison: loadMyLibraryCalendarComparisonMock,
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
      "pt-24",
      "sm:pt-28"
    );
    expect(screen.getByRole("heading", { name: "Calendar", level: 1 })).toBeVisible();
    const actions = screen.getByTestId("calendar-route-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-1");
    expect(within(actions).getByRole("link", { name: "Back to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );
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
