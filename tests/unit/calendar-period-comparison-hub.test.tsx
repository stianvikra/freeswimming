import { cleanup, render, screen, within } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarPeriodComparisonHub from "@/components/my-library/CalendarPeriodComparisonHub";
import type { MyLibraryCalendarComparisonModel } from "@/lib/my-library/calendar-comparison";
import { buildMyLibraryCalendarComparisonWindow } from "@/lib/my-library/calendar";

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

function buildModel(): MyLibraryCalendarComparisonModel {
  return {
    selectedSource: "all",
    selectedPeriod: "week",
    problemLabel: null,
    window: buildMyLibraryCalendarComparisonWindow({
      selectedDate: "2026-06-05",
      todayDate: "2026-06-05",
      period: "week",
    }),
    sourceComparisons: [
      {
        source: "habits",
        label: "Habits",
        status: "mapped",
        summary: "50% average on target across 4 days with habits.",
        supportLabel: "Habits counts existing check-ins only.",
        details: [
          {
            id: "active_habits",
            label: "Active habits",
            value: "3 habits",
          },
          {
            id: "included_habits",
            label: "Included habits",
            value: "Morning mobility, Water, Read",
          },
          {
            id: "tracked_days",
            label: "Tracked days",
            value: "4 days",
          },
        ],
        metrics: [
          {
            id: "habit_completion_average",
            label: "Average on target",
            currentLabel: "50%",
            comparisonLabel: "25%",
            deltaLabel: "+25 pp",
            tone: "positive",
          },
        ],
      },
      {
        source: "swimming",
        label: "Swimming",
        status: "unmapped",
        summary: "This source is not counted in comparison yet.",
        supportLabel:
          "Saved swim sessions do not yet have a canonical completed-on date, so Swimming is not counted in period comparison yet.",
        metrics: [],
      },
    ],
  };
}

describe("CalendarPeriodComparisonHub", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders insight-first comparison with source controls and secondary details", () => {
    render(<CalendarPeriodComparisonHub model={buildModel()} />);

    expect(screen.getByTestId("calendar-period-comparison-hub")).toBeInTheDocument();
    const insight = screen.getByTestId("calendar-insight-summary");
    expect(within(insight).getByText("The strongest signal is improving")).toBeVisible();
    expect(within(insight).getByText("+25 pp")).toBeVisible();
    expect(
      within(insight).getByText("Habits: Average on target is 50%, compared with 25%.")
    ).toBeVisible();

    const bestSignal = screen.getByTestId("calendar-insight-card-best-signal");
    expect(within(bestSignal).getByText("Best signal")).toBeVisible();
    expect(within(bestSignal).getByText("+25 pp")).toBeVisible();

    const sourceCount = screen.getByTestId("calendar-insight-card-included-sources");
    expect(within(sourceCount).getByText("1/2")).toBeVisible();

    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Month" })).toHaveAttribute(
      "href",
      "/my-library/calendar?source=all&period=month&date=2026-06-05"
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/my-library/calendar?source=all&period=week&date=2026-05-29"
    );

    const habits = screen.getByTestId("calendar-source-habits");
    expect(within(habits).getByText("Active habits")).toBeVisible();
    expect(within(habits).getByText("3 habits")).toBeVisible();
    expect(within(habits).getByText("Included habits")).toBeVisible();
    expect(within(habits).getByText("Morning mobility, Water, Read")).toBeVisible();
    expect(within(habits).getByText("Tracked days")).toBeVisible();
    expect(within(habits).getByText("4 days")).toBeVisible();
    expect(within(habits).getByText("Average on target")).toBeVisible();
    expect(within(habits).getByText("50% now, 25% before")).toBeVisible();
    expect(within(habits).getByText("+25 pp")).toHaveClass("text-emerald-800");
    expect(within(habits).getByText("Included")).toBeVisible();

    const swimming = screen.getByTestId("calendar-source-swimming");
    expect(within(swimming).getByText("Not included")).toBeVisible();
    expect(within(swimming).getByText(/not counted in period comparison yet/i)).toBeVisible();

    expect(screen.getByText("Detailed numbers")).toBeVisible();
  });
});
