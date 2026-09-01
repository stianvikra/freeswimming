import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarPeriodComparisonHub from "@/components/my-library/CalendarPeriodComparisonHub";
import type { MyLibraryCalendarComparisonModel } from "@/lib/my-library/calendar-comparison";
import { buildMyLibraryCalendarComparisonWindow } from "@/lib/my-library/calendar";

const routerPushMock = vi.hoisted(() => vi.fn());

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPushMock,
  }),
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
          "Swimming will be included after trusted swim activity history is mapped into Trends.",
        metrics: [],
      },
    ],
  };
}

function buildMappedSwimmingModel(): MyLibraryCalendarComparisonModel {
  return {
    selectedSource: "swimming",
    selectedPeriod: "week",
    problemLabel: null,
    window: buildMyLibraryCalendarComparisonWindow({
      selectedDate: "2026-06-05",
      todayDate: "2026-06-05",
      period: "week",
    }),
    sourceComparisons: [
      {
        source: "swimming",
        label: "Swimming",
        status: "mapped",
        summary: "2 completed swims in the selected range.",
        supportLabel:
          "Swimming counts manual swim actuals that are safe to include. Provider, non-swim, and needs-review entries stay out until explicitly mapped.",
        details: [
          {
            id: "trusted_swim_rows",
            label: "Counted swims",
            value: "2 completed swims",
          },
          {
            id: "swim_outcome_mix",
            label: "Session completion",
            value: "1 completed as planned / 1 partial",
          },
          {
            id: "excluded_swim_rows",
            label: "Excluded sessions",
            value: "1 provider/review item",
          },
        ],
        metrics: [
          {
            id: "swim_activities",
            label: "Completed swims",
            currentLabel: "2 completed swims",
            comparisonLabel: "1 completed swim",
            deltaLabel: "+1",
            tone: "positive",
          },
          {
            id: "swim_distance_m",
            label: "Distance",
            currentLabel: "2,200 m",
            comparisonLabel: "1,000 m",
            deltaLabel: "+1,200 m",
            tone: "positive",
          },
          {
            id: "swim_minutes",
            label: "Swimming minutes",
            currentLabel: "50 min",
            comparisonLabel: "30 min",
            deltaLabel: "+20 min",
            tone: "positive",
          },
        ],
      },
    ],
  };
}

describe("CalendarPeriodComparisonHub", () => {
  afterEach(() => {
    cleanup();
    routerPushMock.mockClear();
  });

  it("renders report controls before the insight with plain-language comparison details", () => {
    render(<CalendarPeriodComparisonHub model={buildModel()} />);

    const hub = screen.getByTestId("calendar-period-comparison-hub");
    expect(hub).toBeInTheDocument();
    const controls = screen.getByTestId("calendar-period-controls");
    const insight = screen.getByTestId("calendar-insight-summary");
    expect(hub.firstElementChild).toBe(controls);
    expect(controls.nextElementSibling).toBe(insight);
    expect(within(controls).getByText("Trend view")).toBeVisible();
    expect(within(controls).getByText("All / This week so far / 1 Jun - 5 Jun")).toBeVisible();

    const sourceSelect = within(controls).getByLabelText("Source");
    expect(sourceSelect).toHaveValue("all");
    fireEvent.change(sourceSelect, { target: { value: "swimming" } });
    expect(routerPushMock).toHaveBeenCalledWith(
      "/my-library/calendar?view=compare&source=swimming&period=week&date=2026-06-05"
    );

    expect(within(insight).getByText("Consistency improved")).toBeVisible();
    expect(within(insight).getByText("50% vs 25%")).toBeVisible();
    expect(
      within(insight).getByText("You hit 50% of habit targets, up from 25% last week.")
    ).toBeVisible();

    const bestSignal = screen.getByTestId("calendar-insight-card-best-signal");
    expect(within(bestSignal).getByText("Best signal")).toBeVisible();
    expect(within(bestSignal).getByText("50% vs 25%")).toBeVisible();

    const sourceCount = screen.getByTestId("calendar-insight-card-included-sources");
    expect(within(sourceCount).getByText("1 of 2")).toBeVisible();
    expect(
      within(sourceCount).getByText("1 of 2 selected sources have comparison data.")
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
    expect(within(habits).getByText("This week 50% vs 25% last week.")).toBeVisible();
    expect(within(habits).getByText("50% vs 25%")).toHaveClass("text-emerald-800");
    expect(within(habits).getByText("Included")).toBeVisible();
    expect(screen.getByTestId("calendar-source-comparison-grid")).toHaveClass("lg:grid-cols-2");

    const swimming = screen.getByTestId("calendar-source-swimming");
    expect(within(swimming).getByText("Not included yet")).toBeVisible();
    expect(within(swimming).getByText(/trusted swim activity history/i)).toBeVisible();

    expect(screen.getByText("All source comparison details")).toBeVisible();
  });

  it("renders mapped Swimming metrics and trusted-row details", () => {
    render(<CalendarPeriodComparisonHub model={buildMappedSwimmingModel()} />);

    const swimming = screen.getByTestId("calendar-source-swimming");
    expect(screen.getByText("Swim summary")).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Completed Swim Sessions" })).toBeNull();
    expect(within(swimming).queryByText("Swimming")).toBeNull();
    expect(within(swimming).queryByText("Included")).toBeNull();
    const insight = screen.getByTestId("calendar-insight-summary");
    expect(within(insight).getByText("+1")).toBeVisible();
    expect(within(insight).queryByText("Completed swims")).toBeNull();
    expect(within(insight).getByText("2 completed swims this week vs 1 last week.")).toBeVisible();
    expect(within(swimming).queryByText("2 completed swims in the selected range.")).toBeNull();
    expect(within(swimming).getByText("Completed swims")).toBeVisible();
    expect(within(swimming).getByText("2")).toBeVisible();
    expect(within(swimming).getByText("+1 vs last week")).toBeVisible();
    expect(within(swimming).queryByText("Session completion")).toBeNull();
    expect(within(swimming).queryByText("Excluded sessions")).toBeNull();
    expect(within(swimming).queryByText("2 completed swims this week vs 1 last week.")).toBeNull();
    expect(within(swimming).getByText("Distance")).toBeVisible();
    expect(within(swimming).getByText("2,200 m")).toBeVisible();
    expect(within(swimming).getByText("+1,200 m vs last week")).toBeVisible();
    expect(within(swimming).getByText("Swimming minutes")).toBeVisible();
    expect(within(swimming).getByText("50 min")).toBeVisible();
    expect(within(swimming).getByText("+20 min vs last week")).toBeVisible();
    expect(screen.queryByTestId("calendar-insight-card-best-signal")).toBeNull();
    expect(screen.queryByTestId("calendar-insight-card-watch-next")).toBeNull();
    expect(screen.queryByTestId("calendar-insight-card-included-sources")).toBeNull();
    expect(screen.getByTestId("calendar-source-comparison-grid")).not.toHaveClass("lg:grid-cols-2");

    const details = screen.getByTestId("calendar-period-details");
    fireEvent.click(within(details).getByText("Swim calculation details"));
    expect(within(details).queryByText("Swimming")).toBeNull();
    expect(within(details).queryByText("Included")).toBeNull();
    expect(within(details).getByText("Session completion")).toBeVisible();
    expect(within(details).getByText("1 completed as planned / 1 partial")).toBeVisible();
    expect(within(details).getByText("Excluded sessions")).toBeVisible();
    expect(within(details).getByText("1 provider/review item")).toBeVisible();
    expect(within(details).queryByText("Metric")).toBeNull();
    expect(within(details).queryByText("Distance")).toBeNull();
  });

  it("names single-source comparison details by source", () => {
    const model = buildModel();
    const habitsOnlyModel: MyLibraryCalendarComparisonModel = {
      ...model,
      selectedSource: "habits",
      sourceComparisons: [model.sourceComparisons[0]],
    };

    render(<CalendarPeriodComparisonHub model={habitsOnlyModel} />);

    expect(screen.getByText("Habits comparison details")).toBeVisible();
  });

  it("prioritizes a visible review state over a misleading complete Habit trend", () => {
    const model = buildModel();
    const habits = model.sourceComparisons[0];
    const reviewModel: MyLibraryCalendarComparisonModel = {
      ...model,
      selectedSource: "habits",
      sourceComparisons: [
        {
          ...habits,
          status: "review",
          summary: "Habits were on target 100% across 4 tracked days. 1 Habit needs review.",
        },
      ],
    };

    render(<CalendarPeriodComparisonHub model={reviewModel} />);

    const insight = screen.getByTestId("calendar-insight-summary");
    expect(within(insight).getByText("Needs review")).toBeVisible();
    expect(within(insight).getByText("Habits data needs review")).toBeVisible();
    expect(within(insight).queryByText("Consistency improved")).toBeNull();

    const source = screen.getByTestId("calendar-source-habits");
    expect(within(source).getByText("Needs review")).toBeVisible();

    const comparisonData = screen.getByTestId("calendar-insight-card-included-sources");
    expect(within(comparisonData).getByText("Needs review")).toBeVisible();
    expect(
      within(comparisonData).getByText(
        "Habits has saved data that needs review before the comparison is complete."
      )
    ).toBeVisible();
  });
});
