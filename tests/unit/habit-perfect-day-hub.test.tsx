import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HabitPerfectDayHub from "@/components/my-library/habits/HabitPerfectDayHub";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  buildHabitWeekSummary,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitSnapshot,
} from "@/lib/habits/shared";

function buildHabitRow(overrides?: Partial<HabitDefinitionRow>): HabitDefinitionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    title: "Read",
    notes: null,
    habit_mode: "build",
    habit_type: "binary",
    category: "learning",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
    start_date: "2026-05-04",
    last_lapse_date: null,
    timer_enabled: false,
    timer_target_seconds: null,
    schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    is_perfect_day_item: true,
    status: "active",
    sort_order: 1,
    created_at: "2026-05-10T08:00:00.000Z",
    updated_at: "2026-05-10T08:00:00.000Z",
    ...overrides,
  };
}

function buildCheckInRow(overrides?: Partial<HabitCheckInRow>): HabitCheckInRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    habit_id: "11111111-1111-4111-8111-111111111111",
    check_in_date: "2026-05-10",
    timezone: "Europe/Oslo",
    value_numeric: null,
    value_boolean: true,
    value_time: null,
    note: null,
    status: "logged",
    completed_at: "2026-05-10T09:00:00.000Z",
    created_at: "2026-05-10T09:00:00.000Z",
    updated_at: "2026-05-10T09:00:00.000Z",
    ...overrides,
  };
}

function buildSnapshot(options?: { withHabit?: boolean; completed?: boolean }): HabitSnapshot {
  const habit = options?.withHabit ? buildHabitDefinitionView(buildHabitRow()) : null;
  const checkIns =
    habit && options?.completed
      ? [buildHabitCheckInView(buildCheckInRow({ habit_id: habit.id }))]
      : [];
  const activeHabits = habit ? [habit] : [];
  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-10"),
  };
}

function buildTimedSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "33333333-3333-4333-8333-333333333333",
      title: "Mobility timer",
      habit_mode: "timed",
      habit_type: "duration",
      category: "movement",
      target_operator: "at_least",
      target_value_numeric: 8,
      target_unit: "minutes",
      timer_enabled: true,
      timer_target_seconds: 480,
    })
  );
  const activeHabits = [habit];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, [], "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, [], "2026-05-10"),
  };
}

function buildCountSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Water",
      habit_mode: "build",
      habit_type: "count",
      category: "nutrition",
      target_operator: "at_least",
      target_value_numeric: 1,
      target_unit: "glasses",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: null,
        value_numeric: 1,
      })
    ),
  ];
  const activeHabits = [habit];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-10"),
  };
}

describe("HabitPerfectDayHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates a first habit for My Perfect Day", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"title":"Read 10 pages"'),
        })
      );
    });
    expect(await screen.findByText("Habit added.")).toBeVisible();
    expect(screen.getByText("Read")).toBeVisible();
  });

  it("creates quit habits with a quit date payload", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Eating chips" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    fireEvent.change(screen.getByLabelText("Quit date"), {
      target: { value: "2026-05-07" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"habitMode":"quit"'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      startDate: string;
      targetValueNumeric: string;
    };
    expect(body.startDate).toBe("2026-05-07");
    expect(body.targetValueNumeric).toBe("0");
  });

  it("creates timed habits with timer metadata", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Mobility" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Timed" }));
    fireEvent.change(screen.getByLabelText("Timer target"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"habitMode":"timed"'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      timerTargetSeconds: number;
    };
    expect(body.timerTargetSeconds).toBe(480);
  });

  it("shows timed habits as startable before the local timer has begun", async () => {
    render(<HabitPerfectDayHub initialSnapshot={buildTimedSnapshot()} />);

    expect(screen.getByText("7-day minutes")).toBeVisible();
    expect(screen.getAllByText("Daily").length).toBeGreaterThan(0);
    expect(screen.getByText("0:00 / 8:00 today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
    expect(await screen.findByRole("button", { name: "Finish" })).toBeDisabled();
    expect(await screen.findByText("Daily target 8:00")).toBeVisible();
    expect(await screen.findByText("No check-in")).toBeVisible();
  });

  it("collapses seen rows for returning visits and keeps details available", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v2:seen-row-ids",
      JSON.stringify(["11111111-1111-4111-8111-111111111111"])
    );

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Archive" })).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Done" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("button", { name: "Archive" })).toBeVisible();
  });

  it("marks a binary habit done through the check-in API", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"valueBoolean":true'),
        })
      );
    });
    expect(await screen.findByText("Check-in saved.")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "My Perfect Day completion" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("undoes a completed binary habit from the quick row", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true, completed: true })} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"clear":true'),
        })
      );
    });
    expect(await screen.findByText("Check-in reset.")).toBeVisible();
  });

  it("keeps count habit status compact with singular units and weekly adherence", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildCountSnapshot()} />);

    expect(screen.getByText("1 glass today · 1/7 days this week")).toBeVisible();
    expect(screen.getByText("At least 1 glass")).toBeVisible();
  });

  it("keeps Home mobile habit entry focused on collapsed active habits", async () => {
    render(<HabitPerfectDayHub initialSnapshot={buildCountSnapshot()} preferMobileActiveFocus />);

    expect(screen.getByTestId("habit-perfect-day-summary")).toHaveClass("hidden");
    expect(screen.getByTestId("habit-active-list")).toBeVisible();
    expect(screen.getByText("1/1 on target today")).toBeVisible();
    expect(screen.getByText("1 glass today · 1/7 days this week")).toBeVisible();
    expect(screen.getByLabelText("Water value")).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Archive" })).toBeNull();
    });
  });

  it("creates weekly habits with the selected schedule day", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "W: Fasting" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    fireEvent.click(screen.getByRole("button", { name: "1x/week" }));
    fireEvent.change(screen.getByLabelText("Add habit weekly weekday"), {
      target: { value: "wednesday" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      title: string;
      habitMode: string;
      scheduleDays: string[];
    };
    expect(body.title).toBe("W: Fasting");
    expect(body.habitMode).toBe("quit");
    expect(body.scheduleDays).toEqual(["wednesday"]);
  });

  it("edits an active habit definition while keeping the returned history", async () => {
    const completedSnapshot = buildSnapshot({ withHabit: true, completed: true });
    const updatedHabitRow = buildHabitRow({
      title: "Read deeply",
      schedule_days: ["monday", "wednesday", "friday"],
    });
    const updatedHabit = buildHabitDefinitionView(updatedHabitRow);
    const checkIn = buildHabitCheckInView(buildCheckInRow({ habit_id: updatedHabit.id }));
    const updatedSnapshot: HabitSnapshot = {
      ...completedSnapshot,
      activeHabits: [updatedHabit],
      daySummary: buildHabitDaySummary([updatedHabit], [checkIn], "2026-05-10"),
      weekSummary: buildHabitWeekSummary([updatedHabit], [checkIn], "2026-05-10"),
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: updatedSnapshot,
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={completedSnapshot} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByText("Updates this habit definition. Check-ins and history stay attached.")
    ).toBeVisible();
    const editForm = screen.getByTestId("habit-edit-form-11111111-1111-4111-8111-111111111111");
    fireEvent.change(screen.getByDisplayValue("Read"), {
      target: { value: "Read deeply" },
    });
    fireEvent.click(within(editForm).getByRole("button", { name: "Custom days" }));
    fireEvent.click(within(editForm).getByLabelText("Tue"));
    fireEvent.click(within(editForm).getByLabelText("Thu"));
    fireEvent.click(within(editForm).getByLabelText("Sat"));
    fireEvent.click(within(editForm).getByLabelText("Sun"));
    fireEvent.click(within(editForm).getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      title: string;
      scheduleDays: string[];
    };
    expect(body.title).toBe("Read deeply");
    expect(body.scheduleDays).toEqual(["monday", "wednesday", "friday"]);
    expect(
      await screen.findByText("Habit updated. Check-ins and history were kept.")
    ).toBeVisible();
  });
});
