import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarPlanWeekHub from "@/components/my-library/CalendarPlanWeekHub";
import {
  addCalendarDays,
  buildMyLibraryCalendarMonthWindow,
  buildMyLibraryCalendarWindow,
} from "@/lib/my-library/calendar";
import type { MyLibraryCalendarDailyLayer } from "@/lib/my-library/calendar-daily-layers";
import type {
  MyLibraryCalendarPlanDay,
  MyLibraryCalendarPlanModel,
  MyLibraryCalendarPlanMonthDay,
  MyLibraryCalendarPlanSession,
} from "@/lib/my-library/calendar-plan";
import type { ProgramSummary } from "@/lib/programs/shared";
import type { WorkoutSummary } from "@/lib/workouts/shared";

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
    refresh: vi.fn(),
  }),
}));

const weekdayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const program: ProgramSummary = {
  id: "program-1",
  title: "Swim comeback plan",
  startsOn: "2026-06-22",
  weekCount: 4,
  assignmentCount: 8,
  updatedAt: "2026-06-20T09:05:00.000Z",
  sourceKind: "manual",
  status: "draft",
};

const workout: WorkoutSummary = {
  id: "workout-1",
  title: "Comeback threshold swim",
  environment: "pool",
  poolLengthUnit: "m",
  poolLengthM: 25,
  sessionType: "threshold_css",
  effort: "moderate",
  totalDistanceM: 1800,
  estimatedDurationMin: 38,
  updatedAt: "2026-06-20T08:02:00.000Z",
  acceptedAt: "2026-06-20T08:01:00.000Z",
  sourceKind: "manual",
  status: "accepted",
};

function getDayIndex(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return (date.getUTCDay() + 6) % 7;
}

function buildDay(
  date: string,
  sessions: MyLibraryCalendarPlanSession[],
  dailyLayers: MyLibraryCalendarDailyLayer[] = []
): MyLibraryCalendarPlanDay {
  const dayIndex = getDayIndex(date);
  return {
    date,
    dayIndex,
    dayLabel: weekdayLabels[dayIndex],
    sessions,
    dailyLayers,
  };
}

function buildSession(
  overrides: Partial<MyLibraryCalendarPlanSession> &
    Pick<MyLibraryCalendarPlanSession, "id" | "date">
): MyLibraryCalendarPlanSession {
  const { id, date, ...rest } = overrides;

  return {
    id,
    date,
    status: rest.status ?? "planned",
    statusSelection:
      rest.status === "skipped" || rest.status === "cancelled"
        ? rest.status
        : rest.status && rest.status !== "planned"
          ? "unmapped"
          : "planned",
    dateOverrideKind: rest.dateOverrideKind ?? "program_assignment",
    updatedAt: rest.updatedAt ?? "2026-06-20T09:10:00.000Z",
    program,
    weekId: "week-1",
    weekLabel: "Week 1",
    weekIndex: 0,
    assignmentId: `assignment-${id}`,
    workoutId: workout.id,
    dayIndex: getDayIndex(date),
    position: 0,
    workout,
    completion: { selection: "none" },
    ...rest,
  };
}

function buildMonthDays({
  selectedDate,
  todayDate,
  sessions,
}: {
  selectedDate: string;
  todayDate: string;
  sessions: MyLibraryCalendarPlanSession[];
}): MyLibraryCalendarPlanMonthDay[] {
  const month = buildMyLibraryCalendarMonthWindow({ selectedDate, todayDate });
  const days: MyLibraryCalendarPlanMonthDay[] = [];
  let date = month.gridStartDate;

  while (date <= month.gridEndDate) {
    days.push({
      ...buildDay(
        date,
        sessions.filter((session) => session.date === date)
      ),
      isCurrentMonth: date >= month.startDate && date <= month.endDate,
      isSelected: date === selectedDate,
      isToday: date === todayDate,
    });
    date = addCalendarDays(date, 1);
  }

  return days;
}

function buildModel(input?: {
  sessions?: MyLibraryCalendarPlanSession[];
  dailyLayersByDate?: Record<string, MyLibraryCalendarDailyLayer[]>;
}): MyLibraryCalendarPlanModel {
  const selectedDate = "2026-06-22";
  const todayDate = "2026-06-20";
  const sessions = input?.sessions ?? [
    buildSession({ id: "session-1", date: selectedDate }),
    buildSession({
      id: "session-2",
      date: selectedDate,
      status: "provider_pending",
      workout: { ...workout, id: "workout-2", title: "Technique review swim" },
      workoutId: "workout-2",
      position: 1,
    }),
  ];
  const window = buildMyLibraryCalendarWindow(selectedDate);

  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    todayDate,
    window,
    month: buildMyLibraryCalendarMonthWindow({ selectedDate, todayDate }),
    selectedProgramId: program.id,
    selectedProgramMissing: false,
    completionSchemaReady: true,
    programs: [program],
    unanchoredPrograms: [],
    missingWorkoutIds: [],
    days: Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addCalendarDays(window.startDate, dayIndex);
      return buildDay(
        date,
        sessions.filter((session) => session.date === date),
        input?.dailyLayersByDate?.[date] ?? []
      );
    }),
    monthDays: buildMonthDays({ selectedDate, todayDate, sessions }).map((day) => ({
      ...day,
      dailyLayers: input?.dailyLayersByDate?.[day.date] ?? [],
    })),
    selectedDay: buildDay(selectedDate, sessions, input?.dailyLayersByDate?.[selectedDate] ?? []),
    sessionCount: sessions.length,
  };
}

function buildDailyLayer(
  overrides: Partial<MyLibraryCalendarDailyLayer> &
    Pick<MyLibraryCalendarDailyLayer, "source" | "label" | "compactLabel">
): MyLibraryCalendarDailyLayer {
  return {
    status: "mapped",
    tone: "neutral",
    summary: `${overrides.label} summary`,
    supportLabel: `${overrides.label} support`,
    href: "/my-library/habits?date=2026-06-22",
    metrics: [],
    ...overrides,
  };
}

describe("CalendarPlanWeekHub", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders desktop month overview with today marker and selected-day detail", () => {
    render(<CalendarPlanWeekHub model={buildModel()} />);

    const monthOverview = screen.getByTestId("calendar-plan-month-overview");
    expect(within(monthOverview).getByRole("heading", { name: "June 2026" })).toBeVisible();
    expect(within(monthOverview).queryByText("Today")).not.toBeInTheDocument();

    const selectedCell = screen.getByTestId("calendar-plan-month-day-2026-06-22");
    expect(selectedCell).toHaveAttribute("aria-current", "page");
    expect(selectedCell).toHaveAttribute(
      "href",
      "/my-library/calendar?view=plan&date=2026-06-22&programId=program-1"
    );
    expect(within(selectedCell).getByText("Comeback threshold swim")).toBeVisible();
    expect(within(selectedCell).queryByRole("link", { name: "Edit Plan" })).not.toBeInTheDocument();
    expect(screen.getByTestId("calendar-plan-month-day-number-2026-06-22")).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );
    expect(screen.getByTestId("calendar-plan-month-day-number-2026-06-19")).toHaveClass(
      "text-[color:var(--fs-color-muted)]"
    );

    const todayLinks = screen.getAllByRole("link", { name: "Today" });
    expect(todayLinks[0]).toHaveAttribute(
      "href",
      "/my-library/calendar?view=plan&date=2026-06-20&programId=program-1"
    );
    expect(screen.getByTestId("calendar-plan-month-day-2026-06-20")).toHaveAttribute(
      "data-today",
      "true"
    );
    expect(screen.getByTestId("calendar-plan-month-day-number-2026-06-20")).toHaveClass(
      "bg-[color:var(--fs-color-brand-700)]",
      "text-white"
    );
    expect(screen.getByTestId("calendar-plan-month-day-2026-06-20")).not.toHaveAttribute(
      "data-selected"
    );

    expect(within(monthOverview).getByRole("columnheader", { name: "Week total" })).toBeVisible();
    expect(screen.getAllByTestId(/^calendar-plan-month-week-total-/)).toHaveLength(5);

    const selectedWeekTotal = screen.getByTestId("calendar-plan-month-week-total-2026-06-22");
    expect(within(selectedWeekTotal).getByText("Week total")).toBeVisible();
    expect(within(selectedWeekTotal).getByText("22 Jun-28 Jun")).toBeVisible();
    expect(within(selectedWeekTotal).getByText("2 sessions")).toBeVisible();
    expect(within(selectedWeekTotal).getByText("3600m")).toBeVisible();
    expect(within(selectedWeekTotal).getByText("~76 min")).toBeVisible();
    expect(within(selectedWeekTotal).getByText("1 review item needs review.")).toBeVisible();

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    expect(within(selectedDay).getByRole("heading", { name: "Mon 22 Jun" })).toBeVisible();
    expect(within(selectedDay).getByText("2 sessions")).toBeVisible();
    expect(within(selectedDay).getByText("Review status")).toBeVisible();
    expect(within(selectedDay).getAllByRole("link", { name: "Edit Plan" })[0]).toHaveAttribute(
      "href",
      "/my-library/programs/program-1"
    );
    expect(within(selectedDay).getAllByRole("link", { name: "Open workout" })[0]).toHaveAttribute(
      "href",
      "/my-library/workouts/workout-1"
    );
    expect(within(selectedDay).getByLabelText("Reschedule to")).toHaveValue("2026-06-22");
    expect(
      within(selectedDay).getByRole("button", { name: "Reschedule planned session" })
    ).toBeVisible();
    expect(within(selectedDay).getByRole("button", { name: "Mark done" })).toBeVisible();
    expect(within(selectedDay).getByRole("button", { name: "Skip" })).toBeVisible();
    expect(within(selectedDay).getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(
      within(selectedDay).getByText("This plan item needs review before it can be changed.")
    ).toBeVisible();
    expect(within(selectedDay).queryByText("Whole-day signals")).not.toBeInTheDocument();
  });

  it("renders daily source layers in month cells and selected-day detail", () => {
    render(
      <CalendarPlanWeekHub
        model={buildModel({
          dailyLayersByDate: {
            "2026-06-22": [
              buildDailyLayer({
                source: "habits",
                label: "Habits",
                compactLabel: "3/4 habits",
                summary: "3/4 daily habits on track for this day.",
                metrics: [
                  { id: "habit_daily", label: "Daily habits", value: "3/4" },
                  { id: "due", label: "Due", value: "1 habit" },
                  { id: "habit_weekly_total", label: "Weekly total", value: "1/2" },
                ],
                stats: {
                  dailyHabitCompletedCount: 3,
                  dailyHabitTotalCount: 4,
                  weeklyHabitCompletedCount: 1,
                  weeklyHabitTotalCount: 2,
                },
              }),
              buildDailyLayer({
                source: "micro_sessions",
                label: "Micro Sessions",
                compactLabel: "2 micro units",
                href: "/my-library/dryland",
                summary: "2 completed micro units · 1 exercise · 24 reps · 480 kg lifted",
                metrics: [
                  { id: "micro_completed", label: "Completed", value: "2 units" },
                  { id: "micro_exercises", label: "Exercises", value: "1" },
                  { id: "micro_reps", label: "Reps", value: "24" },
                  { id: "micro_load", label: "Load", value: "480 kg" },
                ],
                stats: {
                  microCompletedUnitCount: 2,
                  microSkippedUnitCount: 0,
                  microExerciseKeys: ["split-squat"],
                  microRepsTotal: 24,
                  microLoadKgTotal: 480,
                },
              }),
            ],
          },
        })}
      />
    );

    const selectedCell = screen.getByTestId("calendar-plan-month-day-2026-06-22");
    expect(within(selectedCell).getByText("3/4 habits")).toBeVisible();
    expect(within(selectedCell).getByText("2 micro units")).toBeVisible();
    expect(selectedCell).toHaveAccessibleName(/3\/4 habits/);

    const weekTotal = screen.getByTestId("calendar-plan-month-week-total-2026-06-22");
    expect(within(weekTotal).getByText("Daily habits")).toBeVisible();
    expect(within(weekTotal).getByText("Weekly habits")).toBeVisible();
    expect(within(weekTotal).getByText("Micro units")).toBeVisible();
    expect(within(weekTotal).getByText("Exercises")).toBeVisible();
    expect(within(weekTotal).getByText("Reps")).toBeVisible();
    expect(within(weekTotal).getByText("Load")).toBeVisible();

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    expect(within(selectedDay).getByText("Whole-day signals")).toBeVisible();
    expect(within(selectedDay).getByTestId("calendar-daily-layer-habits")).toBeVisible();
    expect(within(selectedDay).getByText("3/4 daily habits on track for this day.")).toBeVisible();
    expect(within(selectedDay).getByText("Daily habits")).toBeVisible();
    expect(within(selectedDay).getByText("Weekly total")).toBeVisible();
    expect(within(selectedDay).getByText("Due")).toBeVisible();
    expect(within(selectedDay).getByText("1 habit")).toBeVisible();
    expect(within(selectedDay).getAllByRole("link", { name: "Open source" })[0]).toHaveAttribute(
      "href",
      "/my-library/habits?date=2026-06-22"
    );
    expect(
      within(selectedDay).queryByTestId("calendar-daily-layer-perfect_day")
    ).not.toBeInTheDocument();
    expect(within(selectedDay).getAllByRole("link", { name: "Open source" })[1]).toHaveAttribute(
      "href",
      "/my-library/dryland"
    );
  });

  it("renders recover actions for skipped selected-day items", () => {
    render(
      <CalendarPlanWeekHub
        model={buildModel({
          sessions: [
            buildSession({ id: "session-skipped", date: "2026-06-22", status: "skipped" }),
          ],
        })}
      />
    );

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    expect(within(selectedDay).getByText("Skipped")).toBeVisible();
    expect(
      within(selectedDay).getByText("Skipped in the plan. This is not completion history.")
    ).toBeVisible();
    expect(within(selectedDay).getByRole("button", { name: "Recover" })).toBeVisible();
    expect(within(selectedDay).queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
  });

  it("surfaces rescheduled plan items in month scan targets", () => {
    render(
      <CalendarPlanWeekHub
        model={buildModel({
          sessions: [
            buildSession({
              id: "session-rescheduled",
              date: "2026-06-22",
              dateOverrideKind: "manual",
            }),
          ],
        })}
      />
    );

    const selectedCell = screen.getByTestId("calendar-plan-month-day-2026-06-22");
    expect(within(selectedCell).getByText("Rescheduled")).toBeVisible();
  });

  it("renders manual actual events as read-only overview without exposing plan mutations", () => {
    render(
      <CalendarPlanWeekHub
        model={buildModel({
          sessions: [
            buildSession({
              id: "session-completed",
              date: "2026-06-22",
              completion: {
                selection: "manual_actual",
                eventId: "event-1",
                completedOn: "2026-06-22",
                actualStartedAt: null,
                actualDurationSeconds: 2280,
                actualDistanceM: 1800,
                actualEnvironment: "pool",
                actualPoolLengthM: 25,
                actualPoolLengthUnit: "m",
                correctionNote: null,
                sourceKind: "manual",
                outcome: "completed_as_planned",
                isDoneOutcome: true,
                createdAt: "2026-06-22T17:30:00.000Z",
                updatedAt: "2026-06-22T17:30:00.000Z",
              },
            }),
          ],
        })}
      />
    );

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    expect(within(selectedDay).getAllByText("As planned")[0]).toBeVisible();
    expect(
      within(selectedDay).getByText(
        "Manual actual recorded on Mon 22 Jun. Planned identity stays linked for future reconciliation."
      )
    ).toBeVisible();
    expect(
      within(selectedDay).getByTestId("calendar-plan-session-actual-session-completed")
    ).toBeVisible();
    expect(within(selectedDay).getByText("1800m · 38 min")).toBeVisible();
    expect(within(selectedDay).getByText("Pool 25m")).toBeVisible();
    expect(within(selectedDay).queryByLabelText("Completion status")).not.toBeInTheDocument();
    expect(within(selectedDay).queryByLabelText("Completion date")).not.toBeInTheDocument();
    expect(
      within(selectedDay).queryByRole("button", { name: "Save completion" })
    ).not.toBeInTheDocument();
    expect(
      within(selectedDay).queryByRole("button", { name: "Mark done" })
    ).not.toBeInTheDocument();
    expect(within(selectedDay).queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();
    expect(within(selectedDay).getByRole("link", { name: "Edit Plan" })).toBeVisible();
    expect(within(selectedDay).getByRole("link", { name: "Review actual" })).toHaveAttribute(
      "href",
      "/my-library/calendar/actuals/session-completed?date=2026-06-22&programId=program-1"
    );
    expect(
      within(selectedDay).queryByRole("link", { name: "Open workout" })
    ).not.toBeInTheDocument();

    const selectedCell = screen.getByTestId("calendar-plan-month-day-2026-06-22");
    expect(within(selectedCell).getByText("As planned")).toBeVisible();

    const selectedWeekTotal = screen.getByTestId("calendar-plan-month-week-total-2026-06-22");
    expect(within(selectedWeekTotal).getByText("1 recorded")).toBeVisible();
  });

  it("keeps manual actual rows read-only in Calendar", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, status: "corrected" }),
      })
    );

    render(
      <CalendarPlanWeekHub
        model={buildModel({
          sessions: [
            buildSession({
              id: "session-correct",
              date: "2026-06-22",
              completion: {
                selection: "manual_actual",
                eventId: "event-1",
                completedOn: "2026-06-22",
                actualStartedAt: null,
                actualDurationSeconds: 2280,
                actualDistanceM: 1800,
                actualEnvironment: "pool",
                actualPoolLengthM: 25,
                actualPoolLengthUnit: "m",
                correctionNote: null,
                sourceKind: "manual",
                outcome: "completed_as_planned",
                isDoneOutcome: true,
                createdAt: "2026-06-22T17:30:00.000Z",
                updatedAt: "2026-06-22T17:30:00.000Z",
              },
            }),
          ],
        })}
      />
    );

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    expect(
      within(selectedDay).getByTestId("calendar-plan-session-actual-session-correct")
    ).toBeVisible();
    expect(within(selectedDay).getByRole("link", { name: "Review actual" })).toHaveAttribute(
      "href",
      "/my-library/calendar/actuals/session-correct?date=2026-06-22&programId=program-1"
    );
    expect(
      within(selectedDay).queryByRole("button", { name: "Save completion" })
    ).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts manual completion with the current planned-instance timestamp", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, status: "completed" }),
      })
    );

    render(
      <CalendarPlanWeekHub
        model={buildModel({
          sessions: [buildSession({ id: "session-complete", date: "2026-06-22" })],
        })}
      />
    );

    const selectedDay = screen.getByTestId("calendar-plan-selected-day-2026-06-22");
    fireEvent.click(within(selectedDay).getByRole("button", { name: "Mark done" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/calendar/planned-instances/session-complete/completion",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
          }),
        })
      );
    });
    expect(await screen.findByText("Session marked done.")).toBeVisible();
  });
});
