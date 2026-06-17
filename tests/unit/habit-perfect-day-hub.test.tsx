import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
}));
const analyticsState = vi.hoisted(() => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));
vi.mock("@/lib/analytics/client", () => analyticsState);

import HabitPerfectDayHub from "@/components/my-library/habits/HabitPerfectDayHub";
import { APP_SOUND_ASSETS } from "@/lib/audio/client-sound";
import {
  buildHabitCheckInView,
  buildHabitDaySummary,
  buildHabitDefinitionView,
  buildHabitMotivationSummary,
  buildHabitWeekSummary,
  getHabitMotivationRangeStartDate,
  HABIT_MOTIVATION_RANGE_VALUES,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitMotivationRangeSummaries,
  type HabitMotivationResetView,
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
    source_kind: "manual",
    source_dryland_micro_plan_id: null,
    source_micro_block_id: null,
    source_completed_at: null,
    completed_at: "2026-05-10T09:00:00.000Z",
    created_at: "2026-05-10T09:00:00.000Z",
    updated_at: "2026-05-10T09:00:00.000Z",
    timer_seconds: 0,
    manual_minutes: 0,
    ...overrides,
  };
}

function buildMotivationRangeSummaries(
  habits: ReturnType<typeof buildHabitDefinitionView>[],
  checkIns: ReturnType<typeof buildHabitCheckInView>[],
  selectedDate: string,
  resetEvents: HabitMotivationResetView[] = []
): HabitMotivationRangeSummaries {
  return HABIT_MOTIVATION_RANGE_VALUES.reduce<HabitMotivationRangeSummaries>((summaries, range) => {
    summaries[range] = buildHabitMotivationSummary(habits, checkIns, selectedDate, {
      historyStartDate: getHabitMotivationRangeStartDate(range, selectedDate),
      resetEvents,
    });
    return summaries;
  }, {});
}

function buildSnapshot(options?: {
  withHabit?: boolean;
  completed?: boolean;
  selectedDate?: string;
}): HabitSnapshot {
  const selectedDate = options?.selectedDate ?? "2026-05-10";
  const habit = options?.withHabit ? buildHabitDefinitionView(buildHabitRow()) : null;
  const checkIns =
    habit && options?.completed
      ? [
          buildHabitCheckInView(
            buildCheckInRow({ habit_id: habit.id, check_in_date: selectedDate })
          ),
        ]
      : [];
  const activeHabits = habit ? [habit] : [];
  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, selectedDate),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, selectedDate),
  };
}

function buildMicroSessionHabitSnapshot(): HabitSnapshot {
  const selectedDate = "2026-05-10";
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Weekly Micro Sessions",
      cadence_period: "weekly",
      cadence_day_policy: "any",
      cadence_target_count: 1,
    }),
    {
      microSessionLink: {
        planId: "22222222-2222-4222-8222-222222222222",
        status: "active",
        progress: {
          totalBlockCount: 4,
          completedBlockCount: 2,
          skippedBlockCount: 0,
          remainingBlockCount: 2,
          progressPercent: 50,
        },
      },
    }
  );
  const activeHabits = [habit];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, [], selectedDate),
    weekSummary: buildHabitWeekSummary(activeHabits, [], selectedDate),
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

function buildCatchUpRecoverySnapshot(options?: { secondHabit?: boolean }): HabitSnapshot {
  const primaryHabit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Read 10 pages",
      start_date: "2026-05-04",
    })
  );
  const secondaryHabit = options?.secondHabit
    ? buildHabitDefinitionView(
        buildHabitRow({
          id: "99999999-9999-4999-8999-999999999999",
          title: "Mobility",
          start_date: "2026-05-04",
          sort_order: 2,
        })
      )
    : null;
  const activeHabits = secondaryHabit ? [primaryHabit, secondaryHabit] : [primaryHabit];
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: primaryHabit.id,
        check_in_date: "2026-05-04",
      })
    ),
  ];

  return {
    schemaReady: true,
    resetEventsReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-10"),
    motivationSummary: buildHabitMotivationSummary(activeHabits, checkIns, "2026-05-10"),
    motivationSummaries: buildMotivationRangeSummaries(activeHabits, checkIns, "2026-05-10"),
  };
}

function buildSchemaPendingSnapshot(): HabitSnapshot {
  return {
    ...buildSnapshot(),
    schemaReady: false,
  };
}

function buildTimedSnapshot(options?: {
  savedMinutes?: number;
  manualMinutes?: number;
  legacyTotalMinutes?: number;
  includeSecondHabit?: boolean;
  selectedDate?: string;
}): HabitSnapshot {
  const selectedDate = options?.selectedDate ?? "2026-05-10";
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
  const secondHabit = options?.includeSecondHabit
    ? buildHabitDefinitionView(
        buildHabitRow({
          id: "99999999-9999-4999-8999-999999999999",
          title: "Breathing timer",
          habit_mode: "timed",
          habit_type: "duration",
          category: "breathing",
          target_operator: "at_least",
          target_value_numeric: 5,
          target_unit: "minutes",
          timer_enabled: true,
          timer_target_seconds: 300,
          sort_order: 2,
        })
      )
    : null;
  const activeHabits = secondHabit ? [habit, secondHabit] : [habit];
  const timerSeconds =
    typeof options?.savedMinutes === "number" ? Math.round(options.savedMinutes * 60) : 0;
  const manualMinutes = options?.manualMinutes ?? 0;
  const sourceTotalMinutes = Math.round(((timerSeconds + manualMinutes * 60) / 60) * 100) / 100;
  const valueNumeric =
    typeof options?.legacyTotalMinutes === "number"
      ? options.legacyTotalMinutes
      : timerSeconds > 0 || manualMinutes > 0
        ? sourceTotalMinutes
        : null;
  const checkIns =
    typeof valueNumeric === "number"
      ? [
          buildHabitCheckInView(
            buildCheckInRow({
              habit_id: habit.id,
              check_in_date: selectedDate,
              value_boolean: null,
              value_numeric: valueNumeric,
              timer_seconds: typeof options?.legacyTotalMinutes === "number" ? 0 : timerSeconds,
              manual_minutes: typeof options?.legacyTotalMinutes === "number" ? 0 : manualMinutes,
            })
          ),
        ]
      : [];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, selectedDate),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, selectedDate),
  };
}

function buildCompletedTimedSnapshot(): HabitSnapshot {
  return buildTimedSnapshot({ savedMinutes: 8 });
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

function buildOpenCountSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      id: "44444444-4444-4444-8444-444444444444",
      title: "Wall Slides",
      habit_mode: "build",
      habit_type: "count",
      category: "movement",
      target_operator: "at_least",
      target_value_numeric: 10,
      target_unit: "times",
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

function buildPeriodStatusSnapshot(): HabitSnapshot {
  const daily = buildHabitDefinitionView(
    buildHabitRow({
      id: "11111111-1111-4111-8111-111111111111",
      title: "Daily mobility",
    })
  );
  const weekly = buildHabitDefinitionView(
    buildHabitRow({
      id: "77777777-7777-4777-8777-777777777777",
      title: "Weekly mobility",
      cadence_period: "weekly",
      cadence_target_count: 2,
      cadence_day_policy: "any",
    })
  );
  const monthly = buildHabitDefinitionView(
    buildHabitRow({
      id: "88888888-8888-4888-8888-888888888888",
      title: "Monthly review",
      cadence_period: "monthly",
      cadence_target_count: 2,
      cadence_day_policy: "any",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: daily.id,
        check_in_date: "2026-05-10",
        value_boolean: true,
      })
    ),
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: weekly.id,
        check_in_date: "2026-05-05",
        value_boolean: true,
      })
    ),
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: weekly.id,
        check_in_date: "2026-05-07",
        value_boolean: true,
      })
    ),
    buildHabitCheckInView(
      buildCheckInRow({
        habit_id: monthly.id,
        check_in_date: "2026-05-02",
        value_boolean: true,
      })
    ),
  ];
  const activeHabits = [daily, weekly, monthly];

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

function buildQuitOpenSnapshot(): HabitSnapshot {
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

function buildMotivationHistorySnapshot(): HabitSnapshot {
  const activeHabit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Read 10 pages",
      start_date: "2026-05-01",
    })
  );
  const archivedHabit = buildHabitDefinitionView(
    buildHabitRow({
      id: "99999999-9999-4999-8999-999999999999",
      title: "Old mobility",
      start_date: "2026-05-01",
      status: "archived",
    })
  );
  const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
    (date, index) =>
      buildHabitCheckInView(
        buildCheckInRow({
          id: `motivation-done-${index}`,
          habit_id: activeHabit.id,
          check_in_date: date,
        })
      )
  );
  checkIns.push(
    buildHabitCheckInView(
      buildCheckInRow({
        id: "motivation-rest",
        habit_id: activeHabit.id,
        check_in_date: "2026-05-04",
        value_boolean: null,
        status: "skipped",
        completed_at: null,
      })
    ),
    buildHabitCheckInView(
      buildCheckInRow({
        id: "motivation-archived",
        habit_id: archivedHabit.id,
        check_in_date: "2026-05-02",
      })
    )
  );
  const activeHabits = [activeHabit];
  const archivedHabits = [archivedHabit];
  const allHabits = [...activeHabits, ...archivedHabits];
  const motivationSummary = buildHabitMotivationSummary(allHabits, checkIns, "2026-05-07");

  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-07",
    activeHabits,
    archivedHabits,
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-07"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-07"),
    motivationSummary,
    motivationSummaries: buildMotivationRangeSummaries(allHabits, checkIns, "2026-05-07"),
  };
}

function buildPastHabitsOverflowSnapshot(): HabitSnapshot {
  const archivedHabits = [
    ["aaaaaaaa-1111-4111-8111-111111111111", "Newest archived", "2026-05-12T08:00:00.000Z"],
    ["bbbbbbbb-1111-4111-8111-111111111111", "Second newest archived", "2026-05-11T08:00:00.000Z"],
    ["cccccccc-1111-4111-8111-111111111111", "Third newest archived", "2026-05-10T08:00:00.000Z"],
    ["dddddddd-1111-4111-8111-111111111111", "Fourth oldest archived", "2026-05-09T08:00:00.000Z"],
    ["eeeeeeee-1111-4111-8111-111111111111", "Oldest archived", "2026-05-08T08:00:00.000Z"],
  ].map(([id, title, updatedAt], index) =>
    buildHabitDefinitionView(
      buildHabitRow({
        id,
        title,
        start_date: "2026-05-01",
        status: "archived",
        sort_order: index + 1,
        created_at: "2026-05-01T08:00:00.000Z",
        updated_at: updatedAt,
      })
    )
  );
  const checkIns: ReturnType<typeof buildHabitCheckInView>[] = [];
  const selectedDate = "2026-05-12";

  return {
    schemaReady: true,
    loadError: null,
    selectedDate,
    activeHabits: [],
    archivedHabits,
    daySummary: buildHabitDaySummary([], checkIns, selectedDate),
    weekSummary: buildHabitWeekSummary([], checkIns, selectedDate),
    motivationSummary: buildHabitMotivationSummary(archivedHabits, checkIns, selectedDate),
    motivationSummaries: buildMotivationRangeSummaries(archivedHabits, checkIns, selectedDate),
  };
}

function buildResetStatsMotivationSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      title: "Read 10 pages",
      start_date: "2026-05-01",
    })
  );
  const checkIns = ["2026-05-01", "2026-05-02", "2026-05-05", "2026-05-06"].map((date, index) =>
    buildHabitCheckInView(
      buildCheckInRow({
        id: `reset-stats-history-${index}`,
        habit_id: habit.id,
        check_in_date: date,
      })
    )
  );
  const resetEvents: HabitMotivationResetView[] = [
    {
      id: "99999999-9999-4999-8999-999999999999",
      habitId: habit.id,
      resetType: "reset_stats",
      status: "active",
      effectiveDate: "2026-05-05",
      createdAt: "2026-05-05T08:00:00.000Z",
      createdBy: "user-1",
    },
  ];
  const activeHabits = [habit];
  const motivationSummary = buildHabitMotivationSummary(activeHabits, checkIns, "2026-05-10", {
    resetEvents,
  });

  return {
    schemaReady: true,
    resetEventsReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-10"),
    motivationSummary,
    motivationSummaries: buildMotivationRangeSummaries(
      activeHabits,
      checkIns,
      "2026-05-10",
      resetEvents
    ),
  };
}

function buildEarlyMotivationSnapshot(): HabitSnapshot {
  const habit = buildHabitDefinitionView(
    buildHabitRow({
      start_date: "2026-05-08",
    })
  );
  const activeHabits = [habit];
  const checkIns: ReturnType<typeof buildHabitCheckInView>[] = [];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits,
    archivedHabits: [],
    daySummary: buildHabitDaySummary(activeHabits, checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary(activeHabits, checkIns, "2026-05-10"),
    motivationSummary: buildHabitMotivationSummary(activeHabits, checkIns, "2026-05-10"),
    motivationSummaries: buildMotivationRangeSummaries(activeHabits, checkIns, "2026-05-10"),
  };
}

function buildArchivedOnlyMotivationSnapshot(): HabitSnapshot {
  const archivedHabit = buildHabitDefinitionView(
    buildHabitRow({
      id: "99999999-9999-4999-8999-999999999999",
      title: "Old mobility",
      start_date: "2026-05-01",
      status: "archived",
    })
  );
  const checkIns = [
    buildHabitCheckInView(
      buildCheckInRow({
        id: "archived-history-check-in",
        habit_id: archivedHabit.id,
        check_in_date: "2026-05-02",
      })
    ),
  ];

  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits: [],
    archivedHabits: [archivedHabit],
    daySummary: buildHabitDaySummary([], checkIns, "2026-05-10"),
    weekSummary: buildHabitWeekSummary([], checkIns, "2026-05-10"),
    motivationSummary: buildHabitMotivationSummary([archivedHabit], checkIns, "2026-05-10"),
    motivationSummaries: buildMotivationRangeSummaries([archivedHabit], checkIns, "2026-05-10"),
  };
}

function openAddHabitForm() {
  const addToggle = screen.getByRole("button", { name: "Add habit" });
  expect(addToggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(addToggle);
  expect(screen.queryByRole("button", { name: "Add habit" })).toBeNull();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
}

type MockAudioElement = {
  src?: string;
  preload: string;
  currentTime: number;
  play: () => Promise<void>;
};

function installAudioElementMock(options?: { playRejects?: boolean }) {
  const audio = {
    instances: [] as MockAudioElement[],
    play: vi.fn<() => Promise<void>>(() =>
      options?.playRejects ? Promise.reject(new Error("blocked")) : Promise.resolve()
    ),
  };

  class MockAudio implements MockAudioElement {
    src?: string;
    preload = "";
    currentTime = -1;
    play = audio.play;

    constructor(src?: string) {
      this.src = src;
      audio.instances.push(this);
    }
  }

  vi.stubGlobal("Audio", MockAudio);
  return audio;
}

describe("HabitPerfectDayHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    navigationState.push.mockClear();
    analyticsState.sendClientAnalyticsEvent.mockClear();
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
    expect(screen.getByRole("button", { name: "Mark done" })).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("button", { name: "Mark done" })).toHaveClass("h-11");
    expect(screen.getByRole("button", { name: "Mark done" })).toHaveClass("min-w-36");
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("w-full");
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("h-11");
    const headingRow = screen.getByTestId("habit-heading-row-11111111-1111-4111-8111-111111111111");
    expect(headingRow).toHaveClass("justify-start");
    expect(headingRow).toHaveClass("flex-wrap");
    expect(headingRow).not.toHaveClass("justify-between");
    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    expect(within(card).getByText("Manual")).toBeVisible();
    expect(within(card).getByText("Use Mark done or Save when this is completed.")).toBeVisible();
  });

  it("routes micro-backed Habits to Micro Sessions instead of manual completion", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildMicroSessionHabitSnapshot()} />);

    expect(screen.queryByRole("button", { name: "Mark done" })).toBeNull();
    expect(screen.getByText("Source-backed")).toBeVisible();
    expect(screen.getByText("Auto-completes when every Micro Session unit is done.")).toBeVisible();
    expect(
      screen.getByText("Completed by Micro Sessions when every linked unit is done.")
    ).toBeVisible();

    const progress = screen.getByTestId(
      "habit-micro-session-progress-11111111-1111-4111-8111-111111111111"
    );
    expect(within(progress).getByText("2/4 units · 50%")).toBeVisible();
    expect(
      screen.getByRole("progressbar", {
        name: "Weekly Micro Sessions Micro Sessions progress",
      })
    ).toHaveAttribute("aria-valuenow", "50");

    expect(screen.getByRole("link", { name: "Go to Micro Sessions" })).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=active&view=auto#micro-sessions"
    );
    expect(screen.getByRole("button", { name: "Details" })).toBeVisible();
  });

  it("keeps Habits completion sound off by default and stores the compact opt-in locally", async () => {
    const audio = installAudioElementMock();
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    const controls = screen.getByTestId("habits-sound-controls");
    expect(within(controls).getByRole("button", { name: "Sound off" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(within(controls).queryByRole("button", { name: "Test sound" })).toBeNull();
    expect(window.localStorage.getItem("freeswimming:habits:v1:sound")).toBeNull();

    fireEvent.click(within(controls).getByRole("button", { name: "Sound off" }));

    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    expect(within(controls).getByRole("button", { name: "Sound on" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(JSON.parse(window.localStorage.getItem("freeswimming:habits:v1:sound") ?? "{}")).toEqual(
      {
        version: 1,
        enabled: true,
      }
    );
  });

  it("previews the positive Habits ding when the user enables sound", async () => {
    const audio = installAudioElementMock();
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));

    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    expect(audio.instances[0]).toMatchObject({
      src: APP_SOUND_ASSETS.positiveDing,
      preload: "auto",
      currentTime: 0,
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Sound on.")).toBeNull();
    expect(screen.queryByText("Sound off.")).toBeNull();
  });

  it("plays completion sound only after an enabled successful completion transition", async () => {
    const audio = installAudioElementMock();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(2));
  });

  it("does not play completion sound while the preference is off", async () => {
    const audio = installAudioElementMock();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("does not play completion sound for rest day, reset, or failed check-in actions", async () => {
    const audio = installAudioElementMock();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildRestDaySnapshot(),
      }),
    } as Response);

    const { rerender } = render(
      <HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1));
    audio.play.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    fireEvent.click(await screen.findByRole("button", { name: "Rest day" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(audio.play).not.toHaveBeenCalled();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true }),
      }),
    } as Response);
    rerender(
      <HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true, completed: true })} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo complete" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(audio.play).not.toHaveBeenCalled();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not save that check-in right now.",
      }),
    } as Response);
    rerender(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("keeps completion saves non-blocking when browser audio is rejected", async () => {
    const audio = installAudioElementMock({ playRejects: true });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(audio.play).toHaveBeenCalled());
    expect(await screen.findByText("Completion saved.")).toBeVisible();
    expect(
      await screen.findByText("Sound was blocked. Your habit was still saved.")
    ).toHaveAttribute("role", "status");
  });

  it("keeps the session sound toggle usable if localStorage cannot persist", () => {
    installAudioElementMock();
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (key === "freeswimming:habits:v1:sound") {
        throw new Error("blocked storage");
      }
      return originalSetItem.call(this, key, value);
    });

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));

    expect(screen.getByRole("button", { name: "Sound on" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Sound preference cannot be saved in this browser.")).toHaveAttribute(
      "role",
      "status"
    );
  });

  it("shows selected-date calendar controls and selected day state", () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true })}
        todayDate="2026-05-10"
      />
    );

    const controls = screen.getByTestId("habits-calendar-controls-summary");
    expect(within(controls).getByRole("link", { name: "Today" })).toBeVisible();
    expect(screen.getAllByText("Weekly Overview").length).toBeGreaterThan(0);
    expect(screen.getByTestId("habits-week-overview-summary")).toHaveAttribute(
      "aria-label",
      "Habits calendar Week 19, 2026 May 4 - May 10"
    );
    expect(screen.getByTestId("habits-selected-date-context")).toHaveTextContent("Today · May 10");
    expect(within(controls).getByRole("link", { name: "Previous week" })).toHaveAttribute(
      "href",
      "/my-library/habits?date=2026-05-03"
    );
    expect(screen.getByRole("link", { name: /May 10 .*selected.*today/i })).toHaveAttribute(
      "aria-current",
      "date"
    );

    fireEvent.click(within(controls).getByRole("link", { name: "Previous week" }));
    expect(navigationState.push).toHaveBeenCalledWith("/my-library/habits?date=2026-05-03");
    expect(within(controls).getByRole("link", { name: "Previous week" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    fireEvent.click(screen.getByRole("link", { name: /Sat May 9/i }));
    expect(navigationState.push).toHaveBeenCalledWith("/my-library/habits?date=2026-05-09");
    expect(screen.getByRole("link", { name: /Sat May 9 .*loading/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("keeps stale habit data unconfirmed when a requested date load fails", async () => {
    const { rerender } = render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-10" })}
        todayDate="2026-05-10"
      />
    );

    fireEvent.click(screen.getByRole("link", { name: /Sat May 9/i }));
    expect(screen.getByRole("link", { name: /Sat May 9 .*loading/i })).toHaveAttribute(
      "aria-busy",
      "true"
    );

    rerender(
      <HabitPerfectDayHub
        initialSnapshot={{
          ...buildSnapshot({ withHabit: true, selectedDate: "2026-05-09" }),
          loadError: "Could not load your habits right now.",
        }}
        todayDate="2026-05-10"
      />
    );

    expect(await screen.findByTestId("habits-action-error")).toHaveTextContent(
      "Could not load your habits right now. Showing 2026-05-10."
    );
    expect(screen.getByRole("link", { name: /Sun May 10 .*selected.*today/i })).toHaveAttribute(
      "aria-current",
      "date"
    );
    expect(screen.getByRole("link", { name: /Sat May 9 .*could not load/i })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("exposes the mobile Habits analysis shortcut with canonical calendar params", () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-10" })}
        todayDate="2026-05-10"
        preferMobileActiveFocus
      />
    );

    const analysisLink = screen.getByRole("link", { name: "View Habits analysis" });
    expect(analysisLink).toHaveAttribute(
      "href",
      "/my-library/calendar?source=habits&period=week&date=2026-05-10"
    );
    expect(analysisLink).toHaveClass("h-11", "w-11");
    expect(screen.getByRole("button", { name: "Show Weekly Overview" })).toHaveClass(
      "h-11",
      "w-11"
    );
    expect(screen.getByRole("button", { name: "Add habit" })).toHaveClass("w-full");
  });

  it("keeps the current Habits week Monday-start without clickable future days", () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-06-05" })}
        todayDate="2026-06-05"
      />
    );

    const controls = screen.getByTestId("habits-calendar-controls-summary");
    expect(screen.getByText("Week 23, 2026 · 0/7 perfect days")).toBeVisible();
    expect(within(controls).getByRole("link", { name: "Previous week" })).toHaveAttribute(
      "href",
      "/my-library/habits?date=2026-05-29"
    );
    expect(within(controls).queryByRole("link", { name: "Next week" })).toBeNull();
    expect(within(controls).getByRole("button", { name: "Next week unavailable" })).toBeDisabled();

    const weekOverview = screen.getByTestId("habits-week-overview-summary");
    expect(within(weekOverview).getByText("Mon")).toBeVisible();
    expect(within(weekOverview).getByText("Jun 1")).toBeVisible();
    expect(within(weekOverview).getByRole("link", { name: /Mon Jun 1/i })).toHaveAttribute(
      "href",
      "/my-library/habits?date=2026-06-01"
    );
    expect(
      within(weekOverview).getByRole("link", { name: /Fri Jun 5 .*selected.*today/i })
    ).toHaveAttribute("aria-current", "date");
    expect(within(weekOverview).queryByRole("link", { name: /Sat Jun 6/i })).toBeNull();
    expect(within(weekOverview).getByText("Jun 6").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("syncs the visible habit week when router history provides a new snapshot", async () => {
    const { rerender } = render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-10" })}
        todayDate="2026-05-10"
      />
    );

    expect(screen.getByTestId("habits-week-overview-summary")).toHaveAttribute(
      "aria-label",
      "Habits calendar Week 19, 2026 May 4 - May 10"
    );

    rerender(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-03" })}
        todayDate="2026-05-10"
      />
    );

    await waitFor(() => {
      const controls = screen.getByTestId("habits-calendar-controls-summary");
      expect(screen.getByText("May 3, 2026")).toBeVisible();
      expect(screen.getByText("History")).toBeVisible();
      expect(screen.getByTestId("habits-selected-date-context")).toHaveTextContent("Sun · May 3");
      expect(screen.getByTestId("habits-week-overview-summary")).toHaveAttribute(
        "aria-label",
        "Habits calendar Week 18, 2026 Apr 27 - May 3"
      );
      expect(within(controls).getByRole("link", { name: "Previous week" })).toHaveAttribute(
        "href",
        "/my-library/habits?date=2026-04-26"
      );
      expect(within(controls).getByRole("link", { name: "Next week" })).toHaveAttribute(
        "href",
        "/my-library/habits?date=2026-05-10"
      );
    });
  });

  it("swipes the blue week bar container to nearby habit weeks", () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-03" })}
        todayDate="2026-05-10"
      />
    );

    const weekOverview = screen.getByTestId("habits-week-overview-summary");
    fireEvent.touchStart(weekOverview, {
      touches: [{ clientX: 24, clientY: 80 }],
    });
    fireEvent.touchEnd(weekOverview, {
      changedTouches: [{ clientX: 150, clientY: 84 }],
    });
    expect(navigationState.push).toHaveBeenCalledWith("/my-library/habits?date=2026-04-26");

    fireEvent.touchStart(weekOverview, {
      touches: [{ clientX: 150, clientY: 80 }],
    });
    fireEvent.touchEnd(weekOverview, {
      changedTouches: [{ clientX: 24, clientY: 84 }],
    });
    expect(navigationState.push).toHaveBeenCalledWith("/my-library/habits?date=2026-05-10");
  });

  it("allows past check-in correction while keeping habit setup on Today", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({
          withHabit: true,
          completed: true,
          selectedDate: "2026-05-09",
        }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildSnapshot({ withHabit: true, selectedDate: "2026-05-09" })}
        todayDate="2026-05-10"
      />
    );

    expect(screen.getByText("History")).toBeVisible();
    expect(screen.getByTestId("habits-selected-date-context")).toHaveTextContent("Sat · May 9");
    expect(screen.queryByRole("button", { name: "Add habit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Mark done" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.queryByRole("button", { name: "Edit this habit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "End habit and move to Past habits" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"checkInDate":"2026-05-09"'),
        })
      );
    });
  });

  it("shows catch-up recovery only for stale tracked days and can leave missed without writes", async () => {
    render(<HabitPerfectDayHub initialSnapshot={buildCatchUpRecoverySnapshot()} />);

    const assistant = screen.getByTestId("habits-catch-up-assistant");
    expect(within(assistant).getByRole("heading", { name: "5 missed days" })).toBeVisible();
    expect(
      within(assistant).getByText(
        "Nothing was marked failed automatically. Clean up past days or leave them missed."
      )
    ).toBeVisible();
    expect(within(assistant).getByText("5 days")).toBeVisible();
    expect(
      within(assistant).getByText("1 habit needs cleanup. One past day at a time.")
    ).toBeVisible();
    expect(within(assistant).queryByRole("button", { name: "Done" })).toBeNull();

    const habitPanel = screen.getByTestId("habit-catch-up-11111111-1111-4111-8111-111111111111");
    const habitCard = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    expect(habitCard.contains(habitPanel)).toBe(true);
    expect(within(habitCard).getByRole("button", { name: "Done today" })).toBeVisible();
    expect(within(habitPanel).getByText("5 missed days")).toBeVisible();
    expect(within(habitPanel).getByText("Next: May 5")).toBeVisible();
    expect(within(habitPanel).queryByText("May 6")).toBeNull();
    expect(within(habitPanel).queryByRole("button", { name: "Done" })).toBeNull();
    expect(within(habitPanel).queryByRole("button", { name: "Rest day" })).toBeNull();

    fireEvent.click(within(assistant).getByRole("button", { name: "Clean up missed days" }));

    const reviewPanel = await screen.findByTestId(
      "habit-catch-up-review-11111111-1111-4111-8111-111111111111"
    );
    expect(within(reviewPanel).getByText("5 left")).toBeVisible();
    expect(within(reviewPanel).getByRole("link", { name: "Open day" })).toHaveAttribute(
      "href",
      "/my-library/habits?date=2026-05-05"
    );
    await waitFor(() => {
      expect(analyticsState.sendClientAnalyticsEvent).toHaveBeenCalledWith(
        "habit_catch_up_assistant_shown",
        expect.objectContaining({
          selectedDate: "2026-05-10",
          catchUpDayCount: 5,
          catchUpEntryCount: 5,
          catchUpHabitCount: 1,
          oldestCatchUpDate: "2026-05-05",
          newestCatchUpDate: "2026-05-09",
          markDoneEntryCount: 5,
        })
      );
    });

    fireEvent.click(within(reviewPanel).getByRole("button", { name: "Leave missed" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(analyticsState.sendClientAnalyticsEvent).toHaveBeenCalledWith(
      "habit_catch_up_day_left_missed",
      expect.objectContaining({
        selectedDate: "2026-05-10",
        catchUpDate: "2026-05-05",
        habitMode: "build",
        habitType: "binary",
        canMarkDone: true,
      })
    );
    expect(await screen.findByTestId("habits-action-success")).toHaveTextContent(
      "Left Read 10 pages missed for May 5. No history was changed."
    );
    expect(within(habitPanel).queryByText("May 5")).toBeNull();
    expect(within(habitPanel).getByText("Next: May 6")).toBeVisible();
    expect(within(habitPanel).getByText("May 6")).toBeVisible();
    expect(within(habitPanel).getByText("4 left")).toBeVisible();
  });

  it("saves catch-up Done against the missed day while keeping Today selected", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildCatchUpRecoverySnapshot()} />);

    const habitPanel = screen.getByTestId("habit-catch-up-11111111-1111-4111-8111-111111111111");
    fireEvent.click(within(habitPanel).getByRole("button", { name: "Clean up" }));
    fireEvent.click(within(habitPanel).getByRole("button", { name: "Done" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/my-library/habits/check-ins",
      expect.objectContaining({
        method: "POST",
      })
    );
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      habitId: string;
      checkInDate: string;
      selectedDate: string;
      actionSource: string;
      valueBoolean: boolean;
    };
    expect(body).toMatchObject({
      habitId: "11111111-1111-4111-8111-111111111111",
      checkInDate: "2026-05-05",
      selectedDate: "2026-05-10",
      actionSource: "catch_up",
      valueBoolean: true,
    });
  });

  it("keeps the active catch-up date in review when saving fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not save catch-up completion right now.",
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildCatchUpRecoverySnapshot()} />);

    const habitPanel = screen.getByTestId("habit-catch-up-11111111-1111-4111-8111-111111111111");
    fireEvent.click(within(habitPanel).getByRole("button", { name: "Clean up" }));
    fireEvent.click(within(habitPanel).getByRole("button", { name: "Done" }));

    expect(await screen.findByTestId("habits-action-error")).toHaveTextContent(
      "Could not save catch-up completion right now."
    );
    expect(within(habitPanel).getByText("May 5")).toBeVisible();
    expect(within(habitPanel).queryByText("May 6")).toBeNull();
  });

  it("restarts catch-up Motivation stats with one server reset per active habit", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildCatchUpRecoverySnapshot({ secondHabit: true }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub initialSnapshot={buildCatchUpRecoverySnapshot({ secondHabit: true })} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Restart stats" }));
    expect(screen.getByTestId("habits-catch-up-reset-confirm")).toHaveTextContent(
      "Earlier check-ins stay saved"
    );
    expect(analyticsState.sendClientAnalyticsEvent).toHaveBeenCalledWith(
      "habit_catch_up_reset_started",
      expect.objectContaining({
        selectedDate: "2026-05-10",
        catchUpDayCount: 6,
        catchUpEntryCount: 11,
        catchUpHabitCount: 2,
        activeHabitCount: 2,
      })
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(analyticsState.sendClientAnalyticsEvent).toHaveBeenCalledWith(
      "habit_catch_up_reset_cancelled",
      expect.objectContaining({
        selectedDate: "2026-05-10",
        catchUpDayCount: 6,
        catchUpEntryCount: 11,
        catchUpHabitCount: 2,
        activeHabitCount: 2,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Restart stats" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart stats" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual([
      "/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
      "/api/my-library/habits/99999999-9999-4999-8999-999999999999/reset-stats",
    ]);
    for (const [, init] of vi.mocked(fetch).mock.calls) {
      expect(JSON.parse(init?.body as string)).toMatchObject({
        effectiveDate: "2026-05-10",
        selectedDate: "2026-05-10",
        actionSource: "catch_up",
      });
    }
  });

  it("uses My Library token fields and choices in the Add habit form", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();

    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByLabelText("Name")).toHaveClass("ui-field");
    expect(screen.getByLabelText("Category")).toHaveClass("ui-field");
    expect(screen.getByRole("button", { name: "Do" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByRole("button", { name: "Done only: Any amount" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Specific count: Fixed amount" })).toHaveClass(
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
    expect(screen.getByRole("button", { name: "Do" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Done only: Any amount" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
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

  it("creates count targets with a full-row stepper instead of native number arrows", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildOpenCountSnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Wall Slides" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Specific count: Fixed amount" }));
    expect(screen.getByRole("button", { name: "Decrease Target" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Increase Target" })).toBeVisible();
    fireEvent.change(screen.getByLabelText("Target"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"habitType":"count"'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      habitType: string;
      targetValueNumeric: string;
      targetUnit: string;
    };
    expect(body.habitType).toBe("count");
    expect(body.targetValueNumeric).toBe("10");
    expect(body.targetUnit).toBe("times");
  });

  it("offers litres for specific count targets and sends the selected unit", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildCountSnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot()} />);

    openAddHabitForm();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Drink water" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Specific count: Fixed amount" }));
    const unitSelect = screen.getByLabelText("Unit") as HTMLSelectElement;
    expect(within(unitSelect).getByRole("option", { name: "Litres" })).toBeInTheDocument();
    fireEvent.change(unitSelect, { target: { value: "litres" } });
    fireEvent.change(screen.getByLabelText("Target"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"targetUnit":"litres"'),
        })
      );
    });
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
    const card = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    expect(within(card).getByText("Daily")).toBeVisible();
    expect(within(card).queryByText("Timed")).toBeNull();
    expect(within(card).queryByText("Logged")).toBeNull();
    expect(within(card).getByText("0:00")).toBeVisible();
    expect(within(card).getByText("/ 8:00 today")).toBeVisible();
    expect(within(card).queryByText("Timer 0:00")).toBeNull();
    expect(within(card).queryByText("Manual time 0 min")).toBeNull();
    expect(
      within(card).getByRole("progressbar", { name: "Mobility timer timed progress" })
    ).toHaveAttribute("aria-valuenow", "0");
    expect(within(card).queryByText("Total 0:00 / 8:00 today")).toBeNull();
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    const detailsActions = screen.getByTestId(
      "habit-details-actions-33333333-3333-4333-8333-333333333333"
    );
    expect(within(detailsActions).queryByRole("button", { name: "Finish" })).toBeNull();
    expect(within(detailsActions).queryByRole("button", { name: "Reset timer" })).toBeNull();
    const details = document.getElementById("habit-details-33333333-3333-4333-8333-333333333333");
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).getByText("Daily · Started May 4, 2026")).toBeVisible();
    expect(within(details as HTMLElement).queryByText("Daily target 8:00")).toBeNull();
    expect(await screen.findByText("Manual time")).toBeVisible();
    expect(await screen.findByRole("button", { name: "Save manual time" })).toBeEnabled();
    expect(within(card).queryByText("Time sources")).toBeNull();
    expect(within(card).queryByText("Timer 0:00")).toBeNull();
    expect(within(card).queryByText("Manual time 0 min")).toBeNull();
    expect(screen.queryByText("Manual min")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save manual" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add manual time" })).toBeNull();
    expect(screen.queryByText("No check-in")).toBeNull();
  });

  it("keeps historical timed corrections manual instead of starting a past timer", async () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ selectedDate: "2026-05-09" })}
        todayDate="2026-05-10"
      />
    );

    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.queryByRole("button", { name: "Finish" })).toBeNull();
    expect(await screen.findByText("Manual time")).toBeVisible();
    expect(await screen.findByRole("button", { name: "Save manual time" })).toBeEnabled();
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

    const card = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    expect(await within(card).findByText("2:05")).toBeVisible();
    expect(within(card).getByText("/ 8:00 today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Resume" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Finish" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(await screen.findByRole("button", { name: "Reset timer" })).toBeEnabled();
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

    const card = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    expect(await within(card).findByText("1:05")).toBeVisible();
    expect(within(card).getByText("/ 8:00 today")).toBeVisible();
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  it("adds saved timed minutes to the visible local timer total without a duplicate timer readout", async () => {
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

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ savedMinutes: 2 })}
        userId="user-1"
      />
    );

    const card = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    expect(await within(card).findByText("3:05")).toBeVisible();
    expect(within(card).getByText("/ 8:00 today")).toBeVisible();
    expect(within(card).queryByText("Timer 2:00")).toBeNull();
    expect(within(card).queryByText("Active timer +1:05")).toBeNull();
    expect(within(card).queryByText("Timed")).toBeNull();
    expect(within(card).queryByText("Logged")).toBeNull();
    expect(within(card).queryByText("Done today")).toBeNull();
    expect(
      within(card).getByRole("progressbar", { name: "Mobility timer timed progress" })
    ).toHaveAttribute("aria-valuenow", "185");
    expect(screen.queryByText("1:05")).toBeNull();
    expect(within(card).queryByText("Total 3:05 / 8:00 today")).toBeNull();
  });

  it("pauses and signals without auto-saving when a same-day running timer crosses target", async () => {
    vi.useFakeTimers();
    const nowMs = Date.parse("2026-05-10T12:00:00.000Z");
    vi.setSystemTime(nowMs);
    const audio = installAudioElementMock();

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot()}
        todayDate="2026-05-10"
        userId="user-1"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Sound off" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(audio.play).toHaveBeenCalledTimes(1);
    audio.play.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(audio.play).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(480_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Target reached. Timer paused.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Resume" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Finish" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Undo complete" })).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it("pauses the current timed habit when another timer starts", async () => {
    const nowMs = Date.parse("2026-05-10T12:00:00.000Z");
    const dateNow = vi.spyOn(Date, "now").mockReturnValue(nowMs);
    render(
      <HabitPerfectDayHub initialSnapshot={buildTimedSnapshot({ includeSecondHabit: true })} />
    );

    const mobilityCard = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    const breathingCard = screen.getByTestId("habit-card-99999999-9999-4999-8999-999999999999");

    fireEvent.click(within(mobilityCard).getByRole("button", { name: "Start" }));
    dateNow.mockReturnValue(nowMs + 10_000);
    fireEvent.click(within(breathingCard).getByRole("button", { name: "Start" }));

    expect(within(mobilityCard).getByText("0:10")).toBeVisible();
    expect(within(mobilityCard).getByText("/ 8:00 today")).toBeVisible();
    expect(within(mobilityCard).getByRole("button", { name: "Resume" })).toBeVisible();
    expect(within(breathingCard).getByRole("button", { name: "Pause" })).toBeVisible();
  });

  it("saves manual time as an absolute whole-minute source", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v3:timers:user-1:2026-05-10",
      JSON.stringify({
        "33333333-3333-4333-8333-333333333333": {
          version: 1,
          elapsedSeconds: 30,
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
        snapshot: buildTimedSnapshot({ savedMinutes: 2, manualMinutes: 5 }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ savedMinutes: 2, manualMinutes: 2 })}
        userId="user-1"
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Details" }));
    fireEvent.change(await screen.findByLabelText("Mobility timer manual time"), {
      target: { value: "5" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Save manual time" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"timerSeconds":120'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      timerSeconds: number;
      manualMinutes: number;
    };
    expect(body).toMatchObject({
      timerSeconds: 120,
      manualMinutes: 5,
    });
    expect(
      window.localStorage.getItem("freeswimming:habits:v3:timers:user-1:2026-05-10")
    ).not.toBeNull();
  });

  it("allows zero manual minutes and rejects decimal manual input", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildTimedSnapshot({ savedMinutes: 2, manualMinutes: 0 }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ savedMinutes: 2, manualMinutes: 5 })}
        userId="user-1"
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Details" }));
    const manualInput = await screen.findByLabelText("Mobility timer manual time");
    fireEvent.change(manualInput, { target: { value: "0" } });
    fireEvent.click(await screen.findByRole("button", { name: "Save manual time" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      timerSeconds: 120,
      manualMinutes: 0,
    });

    vi.mocked(fetch).mockClear();
    fireEvent.click(await screen.findByRole("button", { name: "Details" }));
    fireEvent.change(await screen.findByLabelText("Mobility timer manual time"), {
      target: { value: "1.5" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Save manual time" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(await screen.findByTestId("habits-action-error")).toHaveTextContent(
      "Manual time must be whole minutes between 0 and 1440."
    );
  });

  it("saves timer finishes on top of existing saved timed minutes", async () => {
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
        snapshot: buildTimedSnapshot({ savedMinutes: 4.08 }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ savedMinutes: 2 })}
        userId="user-1"
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"timerSeconds":245'),
        })
      );
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      timerSeconds: 245,
      manualMinutes: 0,
    });
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

    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"timerSeconds":125'),
        })
      );
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      timerSeconds: 125,
      manualMinutes: 0,
    });
    await waitFor(() => {
      expect(
        window.localStorage.getItem("freeswimming:habits:v3:timers:user-1:2026-05-10")
      ).toBeNull();
    });
  });

  it("undoes only the latest timed completion source while preserving manual time", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildTimedSnapshot({ manualMinutes: 5 }),
      }),
    } as Response);

    render(
      <HabitPerfectDayHub
        initialSnapshot={buildTimedSnapshot({ savedMinutes: 8, manualMinutes: 5 })}
        userId="user-1"
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Undo complete" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"clearTimedCompletion":true'),
        })
      );
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as {
      clear?: boolean;
      clearTimedCompletion?: boolean;
    };
    expect(body).toMatchObject({
      clearTimedCompletion: true,
    });
    expect(body.clear).toBeUndefined();
    expect(await screen.findByText("Completion undone.")).toBeVisible();
  });

  it("collapses rows by default and keeps details available", async () => {
    window.localStorage.setItem(
      "freeswimming:habits:v2:seen-row-ids",
      JSON.stringify(["11111111-1111-4111-8111-111111111111"])
    );

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "End habit and move to Past habits" })
      ).toBeNull();
    });
    expect(screen.getByRole("button", { name: "Mark done" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Edit this habit" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByRole("button", { name: "Edit this habit" })).toBeVisible();
    expect(screen.getByRole("button", { name: "End habit and move to Past habits" })).toBeVisible();
  });

  it("keeps setup labels out of open details while showing dated metadata", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    expect(screen.getByText("Manual")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    const details = document.getElementById("habit-details-11111111-1111-4111-8111-111111111111");
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).getByText("Daily · Started May 4, 2026")).toBeVisible();
    expect(within(details as HTMLElement).getByText("Manual tracking")).toBeVisible();
    expect(within(details as HTMLElement).queryByText("Do")).toBeNull();
    expect(within(details as HTMLElement).queryByText("Open")).toBeNull();
    expect(within(details as HTMLElement).queryByText("Other")).toBeNull();
    expect(within(details as HTMLElement).queryByText("Done only")).toBeNull();
  });

  it("renders saved litres count targets with readable unit labels", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        id: "77777777-7777-4777-8777-777777777777",
        title: "Drink water",
        habit_mode: "build",
        habit_type: "count",
        category: "nutrition",
        target_operator: "at_least",
        target_value_numeric: 2,
        target_unit: "litres",
      })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: null,
        value_numeric: 2,
      })
    );
    const activeHabits = [habit];
    const snapshot: HabitSnapshot = {
      schemaReady: true,
      loadError: null,
      selectedDate: "2026-05-10",
      activeHabits,
      archivedHabits: [],
      daySummary: buildHabitDaySummary(activeHabits, [checkIn], "2026-05-10"),
      weekSummary: buildHabitWeekSummary(activeHabits, [checkIn], "2026-05-10"),
    };

    render(<HabitPerfectDayHub initialSnapshot={snapshot} />);

    expect(screen.getByText("Today: 2 litres · Goal: 2 litres")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    const details = document.getElementById("habit-details-77777777-7777-4777-8777-777777777777");
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).getByText("Daily · Started May 4, 2026")).toBeVisible();
    expect(within(details as HTMLElement).queryByText("At least 2 litres")).toBeNull();
  });

  it("marks a binary habit done through the check-in API", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildSnapshot({ withHabit: true, completed: true }),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildSnapshot({ withHabit: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/my-library/habits/check-ins",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"valueBoolean":true'),
      })
    );
    const success = screen.getByTestId("habit-action-success-11111111-1111-4111-8111-111111111111");
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveTextContent("Completion saved.");
    expect(screen.getByRole("progressbar", { name: "My Perfect Day completion" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(
      screen.queryByTestId("habit-action-success-11111111-1111-4111-8111-111111111111")
    ).toBeNull();
  });

  it("keeps the slip logged success message inside the habit card", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildQuitSlipSnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildQuitOpenSnapshot()} />);

    const card = screen.getByTestId("habit-card-88888888-8888-4888-8888-888888888888");
    fireEvent.click(within(card).getByRole("button", { name: "Log slip" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const updatedCard = screen.getByTestId("habit-card-88888888-8888-4888-8888-888888888888");
    const success = await within(updatedCard).findByTestId(
      "habit-action-success-88888888-8888-4888-8888-888888888888"
    );
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveTextContent("Slip logged.");
    expect(screen.queryByTestId("habits-action-success")).toBeNull();
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

    fireEvent.click(screen.getByRole("button", { name: "Undo complete" }));

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

    expect(screen.getByText("Today: 1 glass · Goal: 1 glass")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    const details = document.getElementById("habit-details-44444444-4444-4444-8444-444444444444");
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).getByText("Daily · Started May 4, 2026")).toBeVisible();
    expect(within(details as HTMLElement).queryByText("At least 1 glass")).toBeNull();
  });

  it("keeps open count habit input bounded and avoids duplicate Details save controls", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot: buildOpenCountSnapshot(),
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={buildOpenCountSnapshot()} />);

    const card = screen.getByTestId("habit-card-44444444-4444-4444-8444-444444444444");
    const valueInput = within(card).getByLabelText("Wall Slides value");
    expect(valueInput).toHaveAttribute("type", "text");
    expect(valueInput).toHaveAttribute("inputmode", "decimal");
    expect(valueInput).toHaveClass("h-full");
    expect(valueInput).toHaveClass("border-0");
    expect(valueInput.parentElement).toHaveClass("h-11");
    expect(valueInput.parentElement).toHaveClass("overflow-hidden");
    expect(valueInput.parentElement).toHaveClass("rounded-[var(--fs-radius-control)]");

    fireEvent.click(within(card).getByRole("button", { name: "Increase Wall Slides value" }));
    expect(valueInput).toHaveValue("1");
    fireEvent.change(valueInput, { target: { value: "100" } });
    fireEvent.click(within(card).getByRole("button", { name: "Increase Wall Slides value" }));
    expect(valueInput).toHaveValue("100");
    fireEvent.click(within(card).getByRole("button", { name: "Decrease Wall Slides value" }));
    expect(valueInput).toHaveValue("99");
    fireEvent.change(valueInput, { target: { value: "0" } });
    expect(valueInput).toHaveValue("0");
    fireEvent.click(within(card).getByRole("button", { name: "Decrease Wall Slides value" }));
    expect(valueInput).toHaveValue("0");
    expect(within(card).getByRole("button", { name: "Decrease Wall Slides value" })).toHaveClass(
      "h-full"
    );
    expect(within(card).getByRole("button", { name: "Decrease Wall Slides value" })).toHaveClass(
      "border-r"
    );
    expect(within(card).getByRole("button", { name: "Increase Wall Slides value" })).toHaveClass(
      "h-full"
    );
    expect(within(card).getByRole("button", { name: "Increase Wall Slides value" })).toHaveClass(
      "border-l"
    );
    expect(within(card).getByRole("button", { name: "Save" })).toHaveClass("min-w-36");
    expect(within(card).getByRole("button", { name: "Save" })).toHaveClass("sm:!w-36");
    expect(within(card).getByRole("button", { name: "Save" })).toHaveClass("h-11");
    expect(within(card).getByRole("button", { name: "Save" })).toHaveClass("whitespace-nowrap");
    expect(within(card).getByRole("button", { name: "Save" }).parentElement).toHaveClass(
      "sm:grid-cols-[12rem_9rem]"
    );
    expect(within(card).getByRole("button", { name: "Details" })).toHaveClass("min-w-36");
    expect(within(card).getByRole("button", { name: "Details" })).toHaveClass("sm:!w-36");
    expect(within(card).getByRole("button", { name: "Details" })).toHaveClass("h-11");

    fireEvent.click(within(card).getByRole("button", { name: "Details" }));
    expect(within(card).getAllByRole("button", { name: "Save" })).toHaveLength(1);
    expect(within(card).queryByText("Value")).toBeNull();

    fireEvent.click(within(card).getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/check-ins",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"valueNumeric":"0"'),
        })
      );
    });
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
    expect(screen.queryByRole("button", { name: "Edit this habit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Details" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByRole("button", { name: "Edit this habit" })).toBeVisible();
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
    expect(screen.getByRole("button", { name: "Undo rest day" })).toBeVisible();
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

  it("summarizes Today, Week, and Month status without implying every habit is daily", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildPeriodStatusSnapshot()} />);

    expect(screen.getAllByText("Today: 1/1 · Week: 1/1 · Month: 0/1").length).toBeGreaterThan(0);
    expect(screen.queryByText("1/1 on target")).toBeNull();
  });

  it("keeps weekly timed done status in the pill instead of inline progress text", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Run",
        habit_mode: "timed",
        habit_type: "duration",
        category: "movement",
        target_operator: "at_least",
        target_value_numeric: 30,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 1800,
        cadence_period: "weekly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: habit.id,
          check_in_date: "2026-05-07",
          value_boolean: null,
          value_numeric: 30,
          timer_seconds: 0,
          manual_minutes: 30,
        })
      ),
    ];
    const snapshot: HabitSnapshot = {
      schemaReady: true,
      loadError: null,
      selectedDate: "2026-05-10",
      activeHabits: [habit],
      archivedHabits: [],
      daySummary: buildHabitDaySummary([habit], checkIns, "2026-05-10"),
      weekSummary: buildHabitWeekSummary([habit], checkIns, "2026-05-10"),
    };

    render(<HabitPerfectDayHub initialSnapshot={snapshot} />);

    const card = screen.getByTestId("habit-card-33333333-3333-4333-8333-333333333333");
    expect(within(card).getByText("Done this week")).toBeVisible();
    expect(within(card).queryByText("Total 0:00 / 30:00 today · Done this week")).toBeNull();
  });

  it("shows quit-slip consistency plus current streak instead of only zero days", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildQuitSlipSnapshot()} />);

    expect(screen.getByText("9/10 days clear")).toBeVisible();
    expect(screen.getByText("Slip logged today")).toBeVisible();
    expect(screen.queryByText("Current streak 0 days")).toBeNull();
  });

  it("shows build streak motivation on collapsed open rows", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    expect(screen.getByText("Streak: 6 days.")).toBeVisible();
    expect(screen.queryByText("6/7 days on track")).toBeNull();
    expect(screen.queryByText("No check-in")).toBeNull();
  });

  it("uses consistency instead of streak before five-day build streaks", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildShortStreakSnapshot()} />);

    expect(screen.getByText("4/5 days completed")).toBeVisible();
    expect(screen.queryByText("4-day streak")).toBeNull();
    expect(screen.queryByText("Streak: 4 days.")).toBeNull();
  });

  it("shows read-only motivation history with best streak and archived habits", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildMotivationHistorySnapshot()} />);

    const summary = screen.getByTestId("habit-perfect-day-summary");
    const history = screen.getByTestId("habits-motivation-history");
    const activeList = screen.getByTestId("habit-active-list");
    expect(summary.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(history.compareDocumentPosition(activeList) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(history).toHaveClass("order-3", "sm:order-2");
    expect(activeList).toHaveClass("order-2", "sm:order-3");
    expect(within(history).getByText("Habit stats")).toBeVisible();
    expect(within(history).getByText("Motivation")).toBeVisible();
    expect(within(history).getByText("This month · May 1, 2026 - May 7, 2026")).toBeVisible();
    const rangeControls = within(history).getByRole("group", { name: "Motivation range" });
    expect(within(rangeControls).getByRole("button", { name: "Month" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(rangeControls).getByRole("button", { name: "Quarter" })).toBeVisible();
    expect(within(rangeControls).getByRole("button", { name: "Half-year" })).toBeVisible();
    expect(within(rangeControls).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(within(history).queryByText("Perfect-day streak 5 days · Consistency 83%")).toBeNull();
    expect(within(history).queryByRole("button", { name: "Stats" })).toBeNull();
    expect(within(history).queryByTestId("habits-motivation-toggle")).toBeNull();
    expect(within(history).getAllByText("Best perfect-day streak").length).toBeGreaterThan(0);
    expect(within(history).getAllByText("Perfect days").length).toBeGreaterThan(0);
    expect(within(history).getAllByText("5 days").length).toBeGreaterThan(0);
    expect(within(history).queryByText("On track")).toBeNull();
    expect(within(history).queryByText("Habit score")).toBeNull();
    expect(within(history).getByText("1 past habits")).toBeVisible();
    expect(within(history).queryByText("More history")).toBeNull();
    expect(within(history).queryByText("6/13 on track")).toBeNull();
    expect(within(history).queryByText("6/13 days hit")).toBeNull();
    expect(within(history).queryByText("6/13 days completed")).toBeNull();
    expect(within(history).queryByText("Active history")).toBeNull();
    expect(within(history).queryByText("Archived history")).toBeNull();
    expect(within(history).getByText("Rest days")).toBeVisible();
    expect(within(history).getByText("Slips")).toBeVisible();
    expect(within(history).queryByText("Timed minutes")).toBeNull();
    expect(within(history).queryByText("Count total")).toBeNull();
    expect(within(history).getByText("Past habits")).toBeVisible();
    expect(within(history).getByText("Old mobility")).toBeVisible();
    expect(within(history).getByText("Past habit")).toBeVisible();
    expect(within(history).getByText(/1\/7 completed/)).toBeVisible();
    expect(within(history).getByText(/Best streak: 1 day/)).toBeVisible();
    expect(within(history).getByText(/Final streak: 0 days/)).toBeVisible();
    expect(within(history).getByText("Consistency: 14%")).toBeVisible();

    const definitionsButton = within(history).getByTestId("habits-motivation-definitions");
    expect(definitionsButton).toHaveAttribute("aria-expanded", "false");
    expect(definitionsButton).toHaveClass("fs-cta-secondary", "w-full", "h-11");

    fireEvent.click(definitionsButton);
    expect(definitionsButton).toHaveAttribute("aria-expanded", "true");
    expect(within(history).getByText("What counts?")).toBeVisible();
    expect(within(history).getAllByText(/every habit scheduled/i).length).toBeGreaterThan(0);
    expect(
      within(history).getByText("Reset habit stats", { selector: "strong" }).closest("p")
    ).toHaveTextContent(
      "Reset habit stats restarts motivation stats from the selected reset date. Earlier check-ins stay saved and can be reviewed in Calendar Comparison."
    );
    expect(
      within(history).getByText("Rest days", { selector: "strong" }).closest("p")
    ).toHaveTextContent("Rest days are intentional skips.");
    expect(
      within(history).getByText("Slips", { selector: "strong" }).closest("p")
    ).toHaveTextContent("Slips are logged misses for Quit habits.");
    expect(within(history).getByText("0/0").closest("p")).toHaveTextContent(
      "0/0 means there were no scheduled Perfect Day habits in the selected period."
    );
    expect(within(history).queryByText("Early data")).toBeNull();
    expect(within(history).queryByText("Micro Sessions")).toBeNull();
    expect(within(history).queryByText(/Habit score/i)).toBeNull();
    expect(within(history).queryByText(/On track/i)).toBeNull();

    fireEvent.click(within(rangeControls).getByRole("button", { name: "All" }));
    expect(within(rangeControls).getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(history).getByText("All time · May 1, 2026 - May 7, 2026")).toBeVisible();

    expect(within(history).queryByText("On track")).toBeNull();
    expect(within(history).queryByText("6 of 13")).toBeNull();
    expect(within(history).queryByText("Saved history")).toBeNull();
  });

  it("shows week number and the full week range in Motivation Stats week view", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildMotivationHistorySnapshot()} />);

    const history = screen.getByTestId("habits-motivation-history");
    const rangeControls = within(history).getByRole("group", { name: "Motivation range" });

    fireEvent.click(within(rangeControls).getByRole("button", { name: "Week" }));

    expect(within(history).getByText("This week · Week 19 · May 4-10, 2026")).toBeVisible();
    expect(within(history).queryByText("This week · May 7, 2026")).toBeNull();
  });

  it("shows the three newest past habits before expanding the scrollable list", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildPastHabitsOverflowSnapshot()} />);

    const history = screen.getByTestId("habits-motivation-history");
    const list = within(history).getByTestId("habits-past-habits-list");
    const newest = within(list).getByText("Newest archived").closest("li");
    const secondNewest = within(list).getByText("Second newest archived").closest("li");
    const thirdNewest = within(list).getByText("Third newest archived").closest("li");

    expect(within(history).getByText("5 past habits")).toBeVisible();
    expect(newest).not.toBeNull();
    expect(secondNewest).not.toBeNull();
    expect(thirdNewest).not.toBeNull();
    expect(newest!.compareDocumentPosition(secondNewest!) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(
      secondNewest!.compareDocumentPosition(thirdNewest!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(list).queryByText("Fourth oldest archived")).toBeNull();
    expect(within(list).queryByText("Oldest archived")).toBeNull();
    expect(list).not.toHaveClass("overflow-y-auto");

    const seeAll = within(history).getByRole("button", { name: "See all" });
    expect(seeAll).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(seeAll);

    expect(list).toHaveClass("max-h-[28rem]", "overflow-y-auto");
    expect(within(list).getByText("Fourth oldest archived")).toBeVisible();
    expect(within(list).getByText("Oldest archived")).toBeVisible();
    const showLess = within(history).getByRole("button", { name: "Show less" });
    expect(showLess).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(showLess);
    expect(list).not.toHaveClass("overflow-y-auto");
    expect(within(list).queryByText("Fourth oldest archived")).toBeNull();
    expect(within(list).queryByText("Oldest archived")).toBeNull();
  });

  it("confirms ending a habit before moving it to Past habits", async () => {
    const snapshot = buildMotivationHistorySnapshot();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot,
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={snapshot} />);

    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    fireEvent.click(within(card).getByRole("button", { name: "Details" }));
    fireEvent.click(
      within(card).getByRole("button", { name: "End habit and move to Past habits" })
    );

    expect(fetch).not.toHaveBeenCalled();
    const confirm = within(card).getByTestId(
      "habit-end-confirm-11111111-1111-4111-8111-111111111111"
    );
    expect(confirm).toHaveAttribute("role", "alertdialog");
    expect(within(confirm).getByText("End this habit?")).toBeVisible();
    expect(within(confirm).getByText(/Check-ins, reset boundaries/)).toBeVisible();

    fireEvent.click(within(confirm).getByRole("button", { name: "End habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        expect.objectContaining({ method: "PATCH" })
      );
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      status: "archived",
      selectedDate: "2026-05-07",
    });
    expect(
      await screen.findByText("Habit ended. Check-ins and reset history stayed saved.")
    ).toBeVisible();
  });

  it("restores a past habit with explicit same-history confirmation", async () => {
    const snapshot = buildMotivationHistorySnapshot();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot,
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={snapshot} />);

    const history = screen.getByTestId("habits-motivation-history");
    fireEvent.click(within(history).getByRole("button", { name: "Restore habit" }));

    expect(fetch).not.toHaveBeenCalled();
    const confirm = within(history).getByTestId(
      "habit-restore-confirm-99999999-9999-4999-8999-999999999999"
    );
    expect(confirm).toHaveAttribute("role", "alertdialog");
    expect(within(confirm).getByText("Restore this habit?")).toBeVisible();
    expect(within(confirm).getByText(/same history, reset boundaries/)).toBeVisible();
    expect(within(history).queryByRole("button", { name: /delete/i })).toBeNull();

    fireEvent.click(within(confirm).getByRole("button", { name: "Restore habit" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/99999999-9999-4999-8999-999999999999",
        expect.objectContaining({ method: "PATCH" })
      );
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      status: "active",
      selectedDate: "2026-05-07",
    });
    expect(
      await screen.findByText("Habit restored. Check-ins and reset history were kept.")
    ).toBeVisible();
  });

  it("confirms habit stat reset and links complete history after a stats restart", async () => {
    const snapshot = buildResetStatsMotivationSnapshot();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        snapshot,
      }),
    } as Response);

    render(<HabitPerfectDayHub initialSnapshot={snapshot} />);

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    expect(within(card).getByText("Since May 5")).toBeVisible();
    expect(within(card).getByText(/Last stats restart May 5/)).toBeVisible();
    expect(within(card).queryByText("Before reset")).toBeNull();
    expect(within(card).getByRole("link", { name: "Calendar Comparison" })).toHaveAttribute(
      "href",
      "/my-library/calendar?source=habits&period=week&date=2026-05-10"
    );

    const detailsActions = screen.getByTestId(
      "habit-details-actions-11111111-1111-4111-8111-111111111111"
    );
    fireEvent.click(within(detailsActions).getByRole("button", { name: "Reset habit stats" }));

    const confirm = screen.getByTestId(
      "habit-reset-stats-confirm-11111111-1111-4111-8111-111111111111"
    );
    expect(confirm).toHaveAttribute("role", "alertdialog");
    expect(within(confirm).getByText("Confirm reset stats?")).toBeVisible();
    expect(within(confirm).getByText(/Motivation stats restart from May 10/)).toBeVisible();
    expect(within(confirm).getByRole("link", { name: "Calendar Comparison" })).toHaveAttribute(
      "href",
      "/my-library/calendar?source=habits&period=week&date=2026-05-10"
    );

    fireEvent.click(within(confirm).getByRole("button", { name: "Reset stats" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toMatchObject({
      effectiveDate: "2026-05-10",
      selectedDate: "2026-05-10",
    });
    expect(screen.getByText("Habit stats reset. Earlier check-ins stayed saved.")).toBeVisible();
  });

  it("keeps Motivation metrics numeric while explaining empty data", () => {
    const { rerender } = render(
      <HabitPerfectDayHub initialSnapshot={buildEarlyMotivationSnapshot()} />
    );

    const earlyHistory = screen.getByTestId("habits-motivation-history");
    expect(within(earlyHistory).getByText("0/3")).toBeVisible();
    expect(within(earlyHistory).getByText("0%")).toBeVisible();
    expect(within(earlyHistory).queryByTestId("habits-motivation-data-quality")).toBeNull();
    expect(within(earlyHistory).queryByText("Not enough history")).toBeNull();
    expect(within(earlyHistory).queryByText("Early data")).toBeNull();

    rerender(<HabitPerfectDayHub initialSnapshot={buildArchivedOnlyMotivationSnapshot()} />);

    const emptyHistory = screen.getByTestId("habits-motivation-history");
    expect(within(emptyHistory).getByText("0/0")).toBeVisible();
    expect(within(emptyHistory).getByText("0%")).toBeVisible();
    expect(within(emptyHistory).getByTestId("habits-motivation-data-quality")).toHaveTextContent(
      "No scheduled Perfect Day days in this period."
    );
    expect(within(emptyHistory).queryByText("Not enough history")).toBeNull();
  });

  it("opens motivation from the Habits action row while mobile logging stays visually first", () => {
    render(
      <HabitPerfectDayHub
        initialSnapshot={buildMotivationHistorySnapshot()}
        preferMobileActiveFocus
      />
    );

    const activeList = screen.getByTestId("habit-active-list");
    const history = screen.getByTestId("habits-motivation-history");
    expect(activeList).toHaveClass("order-2", "sm:order-3");
    expect(history).toHaveClass("order-3", "sm:order-2");
    expect(within(history).getAllByText("Best perfect-day streak").length).toBeGreaterThan(0);
    expect(within(history).queryByRole("button", { name: "Stats" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Motivation" }));

    expect(within(history).getAllByText("Best perfect-day streak").length).toBeGreaterThan(0);
  });

  it("shows per-habit progress inside habit details", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildMotivationHistorySnapshot()} />);

    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    fireEvent.click(within(card).getByRole("button", { name: "Details" }));

    const progress = within(card).getByTestId(
      "habit-progress-details-11111111-1111-4111-8111-111111111111"
    );
    expect(within(progress).getByText("Habit stats")).toBeVisible();
    expect(within(progress).getByText("Current streak")).toBeVisible();
    expect(within(progress).getByText("Best streak")).toBeVisible();
    expect(within(progress).getByText("Consistency")).toBeVisible();
    expect(within(progress).getByText("Days completed")).toBeVisible();
    expect(within(progress).getByText("5/6")).toBeVisible();
    expect(within(progress).queryByText("5/6 days hit")).toBeNull();
  });

  it("keeps collapsed mobile chips focused on cadence and meaningful day state", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    const card = screen.getByTestId("habit-card-11111111-1111-4111-8111-111111111111");
    expect(within(card).getByText("Manual")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Daily")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Open")).toHaveClass("max-sm:hidden");
  });

  it("keeps quit mode and slip state visible on mobile", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildQuitSlipSnapshot()} />);

    const card = screen.getByTestId("habit-card-88888888-8888-4888-8888-888888888888");
    expect(within(card).getByText("Quit")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Counts clear days until you log a slip.")).toBeVisible();
    expect(within(card).getByText("Daily")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Slip logged today")).not.toHaveClass("max-sm:hidden");
    expect(within(card).getByText("Slip logged today")).toHaveClass("bg-amber-50/90");
  });

  it("does not repeat collapsed build motivation inside details", () => {
    render(<HabitPerfectDayHub initialSnapshot={buildOpenBuildStreakSnapshot()} />);

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getAllByText("Streak: 6 days.")).toHaveLength(1);
    const details = document.getElementById("habit-details-11111111-1111-4111-8111-111111111111");
    expect(details).not.toBeNull();
    expect(within(details as HTMLElement).queryByText("Open")).toBeNull();
    expect(within(details as HTMLElement).getByText("Manual tracking")).toBeVisible();
    expect(
      within(details as HTMLElement).getByText(/There is no automatic daily increment/i)
    ).toBeVisible();
  });

  it("keeps Home mobile habit entry focused on collapsed active habits", async () => {
    render(<HabitPerfectDayHub initialSnapshot={buildCountSnapshot()} preferMobileActiveFocus />);

    expect(screen.getByTestId("habit-perfect-day-summary")).toHaveClass("hidden");
    expect(screen.getByTestId("habit-active-list")).toBeVisible();
    expect(screen.getByTestId("habits-selected-date-context")).toHaveTextContent("Today · May 10");
    expect(screen.getByText("Today: 1/1")).toBeVisible();
    expect(screen.getByText("Today: 1 glass · Goal: 1 glass")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add habit" })).toHaveClass("w-full");
    expect(screen.queryByTestId("habits-week-overview-mobile")).toBeNull();
    const showWeekButton = screen.getByRole("button", { name: "Show Weekly Overview" });
    expect(showWeekButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(showWeekButton);
    const mobileWeek = screen.getByTestId("habits-week-overview-mobile");
    expect(mobileWeek).toBeVisible();
    expect(mobileWeek).toHaveAttribute(
      "aria-label",
      "Habits calendar Week 19, 2026 May 4 - May 10"
    );
    expect(screen.queryByText("Week 19, 2026 · May 4 - May 10 · 1/7 perfect days")).toBeNull();
    expect(screen.getByRole("button", { name: "Hide Weekly Overview" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.queryByLabelText("Water value")).toBeNull();
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "End habit and move to Past habits" })
      ).toBeNull();
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
    fireEvent.click(screen.getByRole("button", { name: "Edit this habit" }));
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
