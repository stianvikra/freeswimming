import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TodayTabsPanel from "@/components/my-library/TodayTabsPanel";
import type { DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import { buildHabitMetricCoverage, type HabitSnapshot } from "@/lib/habits/shared";

function buildDrylandLibrary(): Pick<
  DrylandLibrarySnapshot,
  "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
> {
  return {
    microPlanSchemaReady: true,
    microPlanLoadError: null,
    recentSessions: [],
    microPlan: {
      id: "plan-1",
      title: "Micro session: Weekly strength",
      status: "active",
      releaseMode: "available_now",
      releaseTime: "06:00",
      timezone: "UTC",
      weekStartsAt: "2026-05-04T00:00:00.000Z",
      weekEndsAt: "2026-05-11T00:00:00.000Z",
      progress: {
        totalBlockCount: 3,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 2,
        progressPercent: 33,
      },
      blocks: [
        {
          id: "unit-1",
          status: "queued",
          isArchived: false,
          releaseMode: "available_now",
          releaseOffsetDays: null,
          releaseTime: "06:00",
          releasedAt: "1970-01-01T00:00:00.000Z",
        },
      ],
    } as DrylandMicroPlanRecord,
  };
}

function buildHabitSnapshot(): HabitSnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits: [
      {
        id: "habit-1",
      },
      {
        id: "habit-2",
      },
    ] as HabitSnapshot["activeHabits"],
    archivedHabits: [],
    unsupportedHabits: [],
    daySummary: {
      date: "2026-05-10",
      dayStatus: null,
      trackingState: "known",
      scheduledHabitCount: 2,
      potentialPerfectDayItemCount: 2,
      perfectDayItemCount: 2,
      satisfiedPerfectDayItemCount: 1,
      completionPercent: 50,
      isPerfectDay: false,
      completedDurationMinutes: 0,
      completedCountTotal: 0,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 2,
        knownUnitCount: 2,
        successfulUnitCount: 1,
      }),
      items: [],
    },
    weekSummary: {
      days: [],
      perfectDayCount: 0,
      averageCompletionPercent: 0,
      totalDurationMinutes: 0,
      totalCount: 0,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 0,
        knownUnitCount: 0,
        successfulUnitCount: 0,
      }),
    },
  };
}

describe("TodayTabsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps Micro Sessions and Habits as switchable views in one routines panel", () => {
    render(
      <TodayTabsPanel
        drylandLibrary={buildDrylandLibrary()}
        habitSnapshot={buildHabitSnapshot()}
        nowIso="2026-05-10T09:00:00.000Z"
      />
    );

    const panel = screen.getByTestId("my-library-today-tabs");
    expect(panel).toHaveClass("fs-library-card");
    expect(within(panel).getByText("Routines")).toBeVisible();
    expect(within(panel).getByRole("heading", { name: "My Routines" })).toBeVisible();
    expect(within(panel).queryByText(/Perfect Day/i)).toBeNull();

    const microSessionsTab = within(panel).getByRole("tab", { name: "Micro Sessions" });
    const habitsTab = within(panel).getByRole("tab", { name: "Habits" });
    expect(microSessionsTab).toHaveAttribute("aria-selected", "true");
    expect(within(panel).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=active&view=auto#micro-sessions"
    );
    expect(within(panel).getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=edit#micro-sessions"
    );
    expect(within(panel).getByRole("link", { name: "Open" })).toHaveClass("fs-cta-primary");
    expect(within(panel).getByRole("link", { name: "Edit" })).toHaveClass("fs-cta-secondary");
    expect(
      within(panel)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["Open", "Edit"]);
    expect(within(panel).getByRole("heading", { name: "Micro Sessions" })).toBeVisible();
    expect(within(panel).getByText("1/3 units · 33%")).toBeVisible();
    expect(within(panel).queryByText(/Bubbles/i)).toBeNull();
    expect(within(panel).queryByText("1 unit ready in Micro session: Weekly strength.")).toBeNull();

    fireEvent.click(habitsTab);
    expect(habitsTab).toHaveAttribute("aria-selected", "true");
    expect(within(panel).getByRole("heading", { name: "Habits" })).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/my-library/habits"
    );
    expect(within(panel).getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/my-library/habits"
    );
    expect(
      within(panel)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["Open", "Edit"]);

    fireEvent.click(microSessionsTab);
    expect(microSessionsTab).toHaveAttribute("aria-selected", "true");
    expect(within(panel).getByRole("link", { name: "Open" })).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Edit" })).toBeVisible();
  });

  it("keeps My Library Routines compact without secondary detail controls", () => {
    render(
      <TodayTabsPanel
        drylandLibrary={buildDrylandLibrary()}
        habitSnapshot={buildHabitSnapshot()}
        nowIso="2026-05-10T09:00:00.000Z"
      />
    );

    const panel = screen.getByTestId("my-library-today-tabs");

    expect(within(panel).getByRole("link", { name: "Open" })).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Open" })).toHaveClass("fs-cta-primary");
    expect(within(panel).getByRole("link", { name: "Edit" })).toHaveClass("fs-cta-secondary");
    expect(within(panel).queryByRole("button", { name: "Show details" })).toBeNull();
    expect(within(panel).queryByRole("button", { name: "Hide details" })).toBeNull();
    expect(
      within(panel).queryByRole("progressbar", { name: "Micro Sessions progress" })
    ).toBeNull();
    expect(
      within(panel).queryByRole("progressbar", { name: "My Perfect Day progress" })
    ).toBeNull();
  });

  it("can use an external page heading on the dedicated routines route", () => {
    render(
      <main>
        <h1 id="routines-page-heading">My Routines</h1>
        <TodayTabsPanel
          drylandLibrary={buildDrylandLibrary()}
          habitSnapshot={buildHabitSnapshot()}
          nowIso="2026-05-10T09:00:00.000Z"
          headingId="routines-page-heading"
          showHeader={false}
        />
      </main>
    );

    const panel = screen.getByTestId("my-library-today-tabs");
    expect(panel).toHaveAccessibleName("My Routines");
    expect(within(panel).queryByText("Routines")).toBeNull();
    expect(within(panel).getByRole("tab", { name: "Micro Sessions" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("renders a not-tracked Habit day as neutral without completion credit", () => {
    const habitSnapshot = buildHabitSnapshot();
    habitSnapshot.daySummary = {
      ...habitSnapshot.daySummary,
      dayStatus: "not_tracked",
      trackingState: "not_tracked",
      potentialPerfectDayItemCount: 2,
      perfectDayItemCount: 0,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: null,
      isPerfectDay: false,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 2,
        knownUnitCount: 0,
        successfulUnitCount: 0,
        notTrackedDayCount: 1,
      }),
    };

    render(
      <TodayTabsPanel
        drylandLibrary={buildDrylandLibrary()}
        habitSnapshot={habitSnapshot}
        nowIso="2026-05-10T09:00:00.000Z"
      />
    );

    const panel = screen.getByTestId("my-library-today-tabs");
    fireEvent.click(within(panel).getByRole("tab", { name: "Habits" }));

    expect(panel).toHaveAttribute("data-routine-state", "not_tracked");
    expect(within(panel).getByText("Not tracked")).toBeVisible();
    expect(
      within(panel).getByText(/excluded from Habit performance, totals, and streaks/i)
    ).toBeVisible();
    expect(within(panel).queryByText(/0%|100%|done|missed|rest day|slip|perfect day/i)).toBeNull();
  });

  it("renders incomplete cadence tracking without a success percentage", () => {
    const habitSnapshot = buildHabitSnapshot();
    habitSnapshot.daySummary = {
      ...habitSnapshot.daySummary,
      potentialPerfectDayItemCount: 2,
      perfectDayItemCount: 1,
      satisfiedPerfectDayItemCount: 1,
      completionPercent: 100,
      isPerfectDay: false,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 2,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        notTrackedDayCount: 1,
      }),
    };

    render(
      <TodayTabsPanel
        drylandLibrary={buildDrylandLibrary()}
        habitSnapshot={habitSnapshot}
        nowIso="2026-05-10T09:00:00.000Z"
      />
    );

    const panel = screen.getByTestId("my-library-today-tabs");
    fireEvent.click(within(panel).getByRole("tab", { name: "Habits" }));

    expect(panel).toHaveAttribute("data-routine-state", "tracking_incomplete");
    expect(within(panel).getByText("Tracking incomplete")).toBeVisible();
    expect(within(panel).getByText(/does not have enough tracked days/i)).toBeVisible();
    expect(within(panel).queryByText(/100%|done|perfect day/i)).toBeNull();
  });

  it("renders unsupported Habits as review without a percentage or edit action", () => {
    const habitSnapshot = buildHabitSnapshot();
    habitSnapshot.activeHabits = [];
    habitSnapshot.daySummary = {
      ...habitSnapshot.daySummary,
      scheduledHabitCount: 0,
      perfectDayItemCount: 0,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: 0,
      isPerfectDay: false,
    };
    habitSnapshot.unsupportedHabits = [
      {
        id: "unsupported-1",
        title: "Future Habit",
        unsupportedFields: ["unknown_habit_mode"],
      },
    ];

    render(
      <TodayTabsPanel
        drylandLibrary={buildDrylandLibrary()}
        habitSnapshot={habitSnapshot}
        nowIso="2026-05-10T09:00:00.000Z"
      />
    );

    const panel = screen.getByTestId("my-library-today-tabs");
    fireEvent.click(within(panel).getByRole("tab", { name: "Habits" }));

    expect(panel).toHaveAttribute("data-routine-state", "review");
    expect(within(panel).getByRole("status")).toHaveTextContent("1 habit needs review");
    expect(within(panel).getByText(/Saved Habit history is preserved/i)).toBeVisible();
    expect(within(panel).queryByText(/0%/)).toBeNull();
    expect(within(panel).getByRole("link", { name: "Open" })).toBeVisible();
    expect(within(panel).queryByRole("link", { name: "Edit" })).toBeNull();
  });
});
