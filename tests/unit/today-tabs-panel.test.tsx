import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import TodayTabsPanel from "@/components/my-library/TodayTabsPanel";
import type { DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import type { HabitSnapshot } from "@/lib/habits/shared";

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
    daySummary: {
      date: "2026-05-10",
      scheduledHabitCount: 2,
      perfectDayItemCount: 2,
      satisfiedPerfectDayItemCount: 1,
      completionPercent: 50,
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
});
