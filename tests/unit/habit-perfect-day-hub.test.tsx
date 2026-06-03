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
    cadence_period: "daily",
    cadence_target_count: 1,
    cadence_day_policy: "fixed",
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

function buildOpenBuildStreakSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Read 10 pages",
      start_date: "2026-05-04",
    })
  );
  const checkIns = [
    "2026-05-04",
    "2026-05-05",
    "2026-05-06",
    "2026-05-07",
    "2026-05-08",
    "2026-05-09",
  ].map((date, index) =>
    buildHabitCheckInView(
      buildCheckInRow({
        id: `build-streak-${index}`,
        habit_id: habit.id,
        check_in_date: date,
      })
    )
  );
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

function buildOpenBuildShortStreakSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Read 10 pages",
      start_date: "2026-05-06",
    })
  );
  const checkIns = ["2026-05-06", "2026-05-07", "2026-05-08", "2026-05-09"].map((date, index) =>
    buildHabitCheckInView(
      buildCheckInRow({
        id: `build-short-streak-${index}`,
        habit_id: habit.id,
        check_in_date: date,
      })
    )
  );
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

function buildSchemaPendingSnapshot(): HabitSnapshot {
  return {
    ...buildSnapshot(),
    schemaReady: false,
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

function buildCompletedTimedSnapshot(): HabitSnapshot {
  const base = buildTimedSnapshot();
  const habit = base.activeHabits[0]!;
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: null,
        value_numeric: 2.08,
      })
    ),
  ];

  return {
    ...base,
    daySummary: buildHabitDaySummary(base.activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(base.activeHabits, checkIns, "2026-05-10"),
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

function buildNotDueFixedDaySnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "55555555-5555-4555-8555-555555555555",
      title: "Long relaxed swim",
      cadence_period: "weekly",
      cadence_target_count: 1,
      cadence_day_policy: "fixed",
      schedule_days: ["monday"],
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

function buildRestDaySnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "66666666-6666-4666-8666-666666666666",
      title: "Mobility",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        status: "skipped",
        value_boolean: null,
        completed_at: null,
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

function buildWeeklyDonePeriodSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "77777777-7777-4777-8777-777777777777",
      title: "Spanish Verbs",
      cadence_period: "weekly",
      cadence_target_count: 2,
      cadence_day_policy: "any",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-05",
        value_boolean: true,
      })
    ),
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-07",
        value_boolean: true,
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

function buildQuitSlipSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "88888888-8888-4888-8888-888888888888",
      title: "No sweets",
      habit_mode: "quit",
      habit_type: "avoidance",
      target_operator: "at_most",
      target_value_numeric: 0,
      target_unit: "times",
      start_date: "2026-05-01",
      last_lapse_date: "2026-05-10",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: false,
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

function openAddHabitForm() {
  const addToggle = screen.getByRole("button", { name: "Add habit" });
  expect(addToggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(addToggle);
  expect(screen.queryByRole("button", { name: "Add habit" })).toBeNull();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
}

describe("HabitPerfectDayHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders schema sync feedback as a polite Habits status", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSchemaPendingSnapshot()} />);

    expect(screen.getByRole("heading", { name: "My Perfect Day" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "My Perfect Day" }).closest("section")).toHaveClass(
      "fs-library-card"
    );
    const warning = screen.getByTestId("habits-schema-warning");
    expect(warning).toHaveAttribute("role", "status");
    expect(warning).toHaveAttribute("aria-live", "polite");
    expect(warning).toHaveTextContent("Habits are still syncing in this environment.");
  });

  it("keeps the first-run empty state static with the existing Add habit path", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    expect(screen.getByTestId("habit-perfect-day-summary")).toHaveClass("fs-library-card-accent");
    expect(screen.getByTestId("habit-active-list")).toHaveClass("fs-library-card");
    expect(screen.getByRole("button", { name: "Add habit" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Add habit" })).toHaveClass("w-full");
    const emptyState = screen.getByTestId("habits-empty-state");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(emptyState).toHaveTextContent("No active habits");
    expect(emptyState).toHaveTextContent("Use Add habit to start tracking today.");
    expect(screen.getByRole("button", { name: "Add habit" })).toBeVisible();
  });

  it("uses My Library token actions on the active habit row", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    expect(screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111")).toHaveClass(
      "fs-library-card"
    );
    expect(screen.getByRole("button", { name: "Mark done" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Mark done" })).toHaveClass("w-full");
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("w-full");
  });

  it("uses My Library token fields and choices in the Add habit form", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();

    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByLabelText("Name")).toHaveClass("ui-field");
    expect(screen.getByLabelText("Category")).toHaveClass("ui-field");
    expect(screen.getByRole("button", { name: "Build" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByRole("button", { name: "Daily" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByRole("button", { name: "Create habit" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Create habit" })).toHaveClass("w-full");
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

    openAddHabitForm();
    expect(screen.getByRole("button", { name: "Build" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("option", { name: "Done only" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"title":"Read 10 pages"'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      habitMode: string;
    };
    expect(body.habitMode).toBe("build");
    const createdStatus = await screen.findByRole("status");
    expect(createdStatus).toHaveAttribute("aria-live", "polite");
    expect(createdStatus).toHaveTextContent("Habit added");
    expect(screen.getByText("Read")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add habit" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("keeps the add form collapsed until requested", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    expect(screen.getByRole("button", { name: "Add habit" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByLabelText("Name")).toBeNull();

    openAddHabitForm();
    expect(screen.getByLabelText("Name")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Add habit" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByLabelText("Name")).toBeNull();
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

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Eating chips" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    fireEvent.change(screen.getByLabelText("Quit date"), {
      target: { value: "2026-05-07" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

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

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Mobility" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Timed" }));
    fireEvent.change(screen.getByLabelText("Timer target"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

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

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(await screen.findByRole("button", { name: "Finish" })).toBeDisabled();
    expect(await screen.findByText("Daily target 8:00")).toBeVisible();
    expect(await screen.findByText("No check-in")).toBeVisible();
  });

  it("restores a paused timed habit timer from local user-date storage", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v3:timers:user-1:2026-05-10",
      JSON.stringify({
        "33333333-3333-4333-8333-333333333333": {
          version: 1,
          elapsedSeconds: 125,
          startedAtMs: null,
          targetSeconds: 480,
          updatedAtMs: Date.now(),
        },
      })
    );

    render(<HabitPerfectDayHub initialSnapshot={buildTimedSnapshot()} userId="user-1" />);

    expect(await screen.findByText("2:05 / 8:00 today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Resume" })).toBeVisible();
  });

  it("restores a running timed habit timer using wall-clock elapsed time", async () => {
    const nowMs = Date.parse("2026-05-10T12:00:00.000Z");
    vi.spyOn(Date, "now").mockReturnValue(nowMs);
    window.localStorage.setItem(
      "freeswimming:habits:v3:timers:user-1:2026-05-10",
      JSON.stringify({
        "33333333-3333-4333-8333-333333333333": {
          version: 1,
          elapsedSeconds: 20,
          startedAtMs: nowMs - 45_000,
          targetSeconds: 480,
          updatedAtMs: nowMs - 45_000,
        },
      })
    );

    render(<HabitPerfectDayHub initialSnapshot={buildTimedSnapshot()} userId="user-1" />);

    expect(await screen.findByText("1:05 / 8:00 today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  it("clears persisted timed habit state after a successful timer save", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v3:timers:user-1:2026-05-10",
      JSON.stringify({
        "33333333-3333-4333-8333-333333333333": {
          version: 1,
          elapsedSeconds: 125,
          startedAtMs: null,
          targetSeconds: 480,
          updatedAtMs: Date.now(),
        },
      })
    );
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildCompletedTimedSnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildTimedSnapshot()} userId="user-1" />);

    fireEvent.click(await screen.findByRole("button", { name: "Details" }));
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"valueNumeric":"2.08"'),
        })
      );
    });
    await waitFor(() => {
      expect(
        window.localStorage.getItem("freeswimming:habits:v3:timers:user-1:2026-05-10")
      ).toBeNull();
    });
  });

  it("collapses rows by default and keeps details available", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v2:seen-row-ids",
      JSON.stringify(["11111111-1111-4111-8111-111111111111"])
    );

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Archive" })).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Mark done" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Archive" })).toBeVisible();
  });

  it("shows a binary Build habit with only one Done only detail label", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    expect(screen.getByText("Build")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getAllByText("Done only")).toHaveLength(1);
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

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"valueBoolean":true'),
        })
      );
    });
    const success = await screen.findByTestId("habits-action-success");
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveTextContent("Check-in saved.");
    expect(screen.getByRole("progressbar", { name: "My Perfect Day completion" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("announces failed habit creation as an assertive action error", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not create that habit right now.",
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    const error = await screen.findByTestId("habits-action-error");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveAttribute("aria-live", "assertive");
    expect(error).toHaveTextContent("Could not create that habit right now.");
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

    expect(screen.getByText("1 glass today · Done today")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("At least 1 glass")).toBeVisible();
  });

  it("shows not-due fixed-day habits without a quick check-in action", () => {
    window.localStorage.setItem(
      "freeswimming:habits:v2:seen-row-ids",
      JSON.stringify(["55555555-5555-4555-8555-555555555555"])
    );
    render(<HabitPerfectDayHub initialSnapshot={buildNotDueFixedDaySnapshot()} />);

    expect(screen.getAllByText("Later").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Not due today")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Mark done" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Details" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("saves rest days as skipped check-ins from Details", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildRestDaySnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Rest day" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"status":"skipped"'),
        })
      );
    });
    expect(await screen.findByText("Rest day saved.")).toBeVisible();
    expect(screen.getByText("Rest day today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
  });

  it("keeps rest-day rows out of active timer and value controls", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildRestDaySnapshot()} />);

    expect(screen.getByText("Rest day today")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mark done" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByText("Not counted as done or missed")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Rest day" })).toBeNull();
  });

  it("shows weekly target-met habits as done for the rest of the week", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildWeeklyDonePeriodSnapshot()} />);

    expect(screen.getAllByText("Done this week").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Mark done" })).toBeNull();
  });

  it("shows quit-slip consistency plus current streak instead of only zero days", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildQuitSlipSnapshot()} />);

    expect(screen.getByText("9/10 days on track")).toBeVisible();
    expect(screen.getByText("Slip logged today")).toBeVisible();
    expect(screen.queryByText("Current streak 0 days")).toBeNull();
  });

  it("shows build streak motivation on collapsed open rows", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    expect(screen.getByText("6-day streak")).toBeVisible();
    expect(screen.queryByText("6/7 days on track")).toBeNull();
    expect(screen.queryByText("No check-in")).toBeNull();
  });

  it("uses consistency instead of streak before five-day build streaks", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildShortStreakSnapshot()} />);

    expect(screen.getByText("4/5 days on track")).toBeVisible();
    expect(screen.queryByText("4-day streak")).toBeNull();
  });

  it("keeps collapsed mobile chips focused on cadence and meaningful day state", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    expect(within(card).getByText("Build")).toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Daily")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Open")).toHaveClass("max-sm:hidden");
  });

  it("keeps slip state visible on mobile while moving quit mode to details", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildQuitSlipSnapshot()} />);

    const card = screen.getByTestId("habit-card-88888888-8888-4888-8888-888888888888");
    expect(within(card).getByText("Quit")).toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Daily")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Slip logged today")).not.toHaveClass("max-sm:hidden");
  });

  it("does not repeat collapsed build motivation inside details", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getAllByText("6-day streak")).toHaveLength(1);
    expect(
      screen.getAllByText("Open").some((element) => !element.className.includes("max-sm:hidden"))
    ).toBe(true);
  });

  it("keeps Home mobile habit entry focused on collapsed active habits", async () => {
    render(<HabitPerfectDayHub initialSnapshot={buildCountSnapshot()} preferMobileActiveFocus />);

    expect(screen.getByTestId("habit-perfect-day-summary")).toHaveClass("hidden");
    expect(screen.getByTestId("habit-active-list")).toBeVisible();
    expect(screen.getByText("1/1 on target today")).toBeVisible();
    expect(screen.getByText("1 glass today · Done today")).toBeVisible();
    expect(screen.queryByLabelText("Water value")).toBeNull();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Archive" })).toBeNull();
    });
  });

  it("creates weekly any-day habits with a frequency target", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Mobility" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Weekly target" }));
    fireEvent.change(screen.getByLabelText("Add habit times per week"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      cadencePeriod: string;
      cadenceTargetCount: number;
      cadenceDayPolicy: string;
      scheduleDays: string[];
    };
    expect(body.cadencePeriod).toBe("weekly");
    expect(body.cadenceTargetCount).toBe(3);
    expect(body.cadenceDayPolicy).toBe("any");
    expect(body.scheduleDays).toEqual([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]);
  });

  it("creates weekly fixed-day habits with selected weekdays", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "W: Fasting" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Quit" }));
    fireEvent.click(screen.getByRole("button", { name: "Weekly target" }));
    fireEvent.click(screen.getByRole("button", { name: "Fixed days" }));
    fireEvent.click(screen.getByLabelText("Wed"));
    fireEvent.click(screen.getByLabelText("Sun"));
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

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
      cadencePeriod: string;
      cadenceDayPolicy: string;
      cadenceTargetCount: number;
      scheduleDays: string[];
    };
    expect(body.title).toBe("W: Fasting");
    expect(body.habitMode).toBe("quit");
    expect(body.cadencePeriod).toBe("weekly");
    expect(body.cadenceDayPolicy).toBe("fixed");
    expect(body.cadenceTargetCount).toBe(1);
    expect(body.scheduleDays).toEqual(["wednesday"]);
  });

  it("creates monthly any-day habits with a frequency target", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Review technique" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Monthly target" }));
    fireEvent.change(screen.getByLabelText("Add habit times per month"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      cadencePeriod: string;
      cadenceTargetCount: number;
      cadenceDayPolicy: string;
    };
    expect(body.cadencePeriod).toBe("monthly");
    expect(body.cadenceTargetCount).toBe(5);
    expect(body.cadenceDayPolicy).toBe("any");
  });

  it("edits an active habit definition while keeping the returned history", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v2:seen-row-ids",
      JSON.stringify(["11111111-1111-4111-8111-111111111111"])
    );
    const completedSnapshot = buildSnapshot({ withHabit: true, completed: true });
    const updatedHabitRow = buildHabitRow({
      title: "Read deeply",
      cadence_period: "weekly",
      cadence_target_count: 3,
      cadence_day_policy: "fixed",
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

    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByText("Updates this habit definition. Check-ins and history stay attached.")
    ).toBeVisible();
    const editForm = screen.getByTestId("habit-edit-form-11111111-1111-4111-8111-111111111111");
    expect(within(editForm).getByDisplayValue("Read")).toHaveClass("ui-field");
    expect(within(editForm).getByRole("button", { name: "Cancel" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(editForm).getByRole("button", { name: "Save changes" })).toHaveClass(
      "fs-cta-primary"
    );
    fireEvent.change(screen.getByDisplayValue("Read"), {
      target: { value: "Read deeply" },
    });
    fireEvent.click(within(editForm).getByRole("button", { name: "Weekly target" }));
    fireEvent.click(within(editForm).getByRole("button", { name: "Fixed days" }));
    fireEvent.click(within(editForm).getByLabelText("Mon"));
    fireEvent.click(within(editForm).getByLabelText("Wed"));
    fireEvent.click(within(editForm).getByLabelText("Fri"));
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
      cadencePeriod: string;
      cadenceDayPolicy: string;
      cadenceTargetCount: number;
      scheduleDays: string[];
    };
    expect(body.title).toBe("Read deeply");
    expect(body.cadencePeriod).toBe("weekly");
    expect(body.cadenceDayPolicy).toBe("fixed");
    expect(body.cadenceTargetCount).toBe(3);
    expect(body.scheduleDays).toEqual(["monday", "wednesday", "friday"]);
    expect(
      await screen.findByText("Habit updated. Check-ins and history were kept.")
    ).toBeVisible();
  });
});
