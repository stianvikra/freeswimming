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
        summary: "Habits were on target 50% across 4 tracked days.",
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
            label: "Targets hit",
            currentLabel: "50%",
            comparisonLabel: "25%",
            deltaLabel: "50% vs 25%",
            tone: "positive",
          },
        ],
      },
      {
        source: "swimming",
        label: "Swimming",
        status: "unmapped",
        summary: "This source needs better history before it can be compared.",
        supportLabel:
          "Swimming will be included after completed swim activity events are mapped into Stats.",
        metrics: [],
      },
    ],
  };
}

describe("CalendarPeriodComparisonHub", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders report controls before the insight with plain-language comparison details", () => {
    render(<CalendarPeriodComparisonHub model={buildModel()} />);

    const hub = screen.getByTestId("calendar-period-comparison-hub");
    expect(hub).toBeInTheDocument();
    const controls = screen.getByTestId("calendar-period-controls");
    const insight = screen.getByTestId("calendar-insight-summary");
    expect(hub.firstElementChild).toBe(controls);
    expect(controls.nextElementSibling).toBe(insight);
    expect(within(controls).getByText("Stats view")).toBeVisible();
    expect(within(controls).getByText("All / Week / 1 Jun - 5 Jun")).toBeVisible();

    expect(within(insight).getByText("Consistency improved")).toBeVisible();
    expect(within(insight).getByText("50% vs 25%")).toBeVisible();
    expect(
      within(insight).getByText("You hit 50% of habit targets, up from 25% last week.")
    ).toBeVisible();

    const bestSignal = screen.getByTestId("calendar-insight-card-best-signal");
    expect(within(bestSignal).getByText("Best signal")).toBeVisible();
    expect(within(bestSignal).getByText("50% vs 25%")).toBeVisible();

    const sourceCount = screen.getByTestId("calendar-insight-card-included-sources");
    expect(within(sourceCount).getByText("1/2")).toBeVisible();
    expect(
      within(sourceCount).getByText("Some sources need better history before they can be compared.")
    ).toBeVisible();

    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Month" })).toHaveAttribute(
      "href",
      "/my-library/calendar?view=compare&source=all&period=month&date=2026-06-05"
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/my-library/calendar?view=compare&source=all&period=week&date=2026-05-29"
    );

    const habits = screen.getByTestId("calendar-source-habits");
    expect(within(habits).getByText("Active habits")).toBeVisible();
    expect(within(habits).getByText("3 habits")).toBeVisible();
    expect(within(habits).getByText("Included habits")).toBeVisible();
    expect(within(habits).getByText("Morning mobility, Water, Read")).toBeVisible();
    expect(within(habits).getByText("Tracked days")).toBeVisible();
    expect(within(habits).getByText("4 days")).toBeVisible();
    expect(within(habits).getByText("Targets hit")).toBeVisible();
    expect(within(habits).getByText("Current: 50%. Compare: 25%.")).toBeVisible();
    expect(within(habits).getByText("50% vs 25%")).toHaveClass("text-emerald-800");
    expect(within(habits).getByText("Included")).toBeVisible();

    const swimming = screen.getByTestId("calendar-source-swimming");
    expect(within(swimming).getByText("Not included yet")).toBeVisible();
    expect(within(swimming).getByText(/completed swim activity events/i)).toBeVisible();

    expect(screen.getByText("Detailed numbers")).toBeVisible();
  });
});
