import { describe, expect, it } from "vitest";
import {
  buildDrylandCalendarComparisonSource,
  buildHabitsCalendarComparisonSource,
  buildMicroSessionsCalendarComparisonSource,
  buildSwimmingCalendarComparisonSource,
  loadMyLibraryCalendarComparison,
} from "@/lib/my-library/calendar-comparison";
import { buildMyLibraryCalendarComparisonWindow } from "@/lib/my-library/calendar";
import type {
  HabitCheckInView,
  HabitDefinitionView,
  HabitMotivationResetView,
} from "@/lib/habits/shared";
import type { CompletedActivityEventRow } from "@/lib/my-library/completed-activity-events";
import type {
  TrainingActivityEventRow,
  TrainingActivityHistoryView,
} from "@/lib/my-library/training-activity-events";

function buildHabit(overrides: Partial<HabitDefinitionView> = {}): HabitDefinitionView {
  return {
    id: "habit-1",
    title: "Morning mobility",
    notes: null,
    habitMode: "build",
    habitType: "binary",
    category: "movement",
    targetOperator: "at_least",
    targetValueNumeric: null,
    targetUnit: null,
    targetTime: null,
    targetLabel: "Done",
    startDate: "2026-05-01",
    lastLapseDate: null,
    timerEnabled: false,
    timerTargetSeconds: null,
    cadencePeriod: "daily",
    cadenceTargetCount: 1,
    cadenceDayPolicy: "fixed",
    cadenceLabel: "Daily",
    scheduleDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    isPerfectDayItem: true,
    status: "active",
    microSessionLink: null,
    sortOrder: 0,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildCheckIn(overrides: Partial<HabitCheckInView> = {}): HabitCheckInView {
  return {
    id: `check-${overrides.checkInDate ?? "2026-06-02"}`,
    habitId: "habit-1",
    checkInDate: "2026-06-02",
    timezone: "Europe/Oslo",
    valueNumeric: null,
    valueBoolean: true,
    valueTime: null,
    timerSeconds: 0,
    manualMinutes: 0,
    legacyTimedSeconds: 0,
    note: null,
    status: "logged",
    sourceKind: "manual",
    sourceDrylandMicroPlanId: null,
    sourceMicroBlockId: null,
    sourceCompletedAt: null,
    completedAt: "2026-06-02T08:00:00.000Z",
    createdAt: "2026-06-02T08:00:00.000Z",
    updatedAt: "2026-06-02T08:00:00.000Z",
    ...overrides,
  };
}

function buildReset(overrides: Partial<HabitMotivationResetView> = {}): HabitMotivationResetView {
  return {
    id: `reset-${overrides.effectiveDate ?? "2026-06-04"}`,
    habitId: "habit-1",
    resetType: "reset_stats",
    status: "active",
    effectiveDate: "2026-06-04",
    createdAt: "2026-06-04T08:00:00.000Z",
    createdBy: "user-1",
    ...overrides,
  };
}

function buildTrainingActivity(
  overrides: Partial<TrainingActivityHistoryView> = {}
): TrainingActivityHistoryView {
  return {
    id: `activity-${overrides.activityLocalDate ?? "2026-06-02"}`,
    compatibilitySource: "training_activity_events",
    sourceKind: "manual",
    activityCategory: "workout",
    canonicalSport: "swimming",
    canonicalSubSport: "pool_swim",
    mappingStatus: "trusted",
    outcome: "completed_as_planned",
    activityStartedAt: "2026-06-02T06:30:00.000Z",
    activityEndedAt: "2026-06-02T07:10:00.000Z",
    activityLocalDate: "2026-06-02",
    activityTimezone: "Europe/Oslo",
    timezoneSource: "manual",
    durationSeconds: 2400,
    distanceM: 1800,
    elevationM: null,
    energyKcal: null,
    averageHeartRateBpm: null,
    trainingLoad: null,
    plannedWorkoutInstanceId: "planned-instance-1",
    workoutId: "workout-1",
    programId: "program-1",
    completedActivityEventId: null,
    providerActivityEvidenceId: null,
    detailKind: "swim_session_snapshot",
    detailSnapshot: {},
    supportDiagnostics: {},
    createdAt: "2026-06-02T07:10:00.000Z",
    updatedAt: "2026-06-02T07:10:00.000Z",
    ...overrides,
  };
}

function buildTrainingActivityEventRow(
  overrides: Partial<TrainingActivityEventRow> = {}
): TrainingActivityEventRow {
  return {
    id: "training-activity-1",
    user_id: "user-1",
    source_kind: "manual",
    activity_category: "workout",
    canonical_sport: "swimming",
    canonical_sub_sport: "pool_swim",
    mapping_status: "trusted",
    outcome: "completed_as_planned",
    activity_started_at: "2026-06-02T06:30:00.000Z",
    activity_ended_at: "2026-06-02T07:00:00.000Z",
    activity_local_date: "2026-06-02",
    activity_timezone: "Europe/Oslo",
    timezone_source: "manual",
    duration_seconds: 1800,
    distance_m: 1000,
    elevation_m: null,
    energy_kcal: null,
    average_heart_rate_bpm: null,
    training_load: null,
    planned_workout_instance_id: "planned-instance-1",
    workout_id: "workout-1",
    program_id: "program-1",
    completed_activity_event_id: null,
    provider_activity_evidence_id: null,
    detail_kind: "none",
    detail_snapshot: {},
    support_diagnostics: {},
    created_at: "2026-06-02T07:00:00.000Z",
    updated_at: "2026-06-02T07:00:00.000Z",
    ...overrides,
  };
}

function buildCompletedActivityEventRow(
  overrides: Partial<CompletedActivityEventRow> = {}
): CompletedActivityEventRow {
  return {
    id: "completed-activity-1",
    user_id: "user-1",
    planned_workout_instance_id: "planned-instance-1",
    workout_id: "workout-1",
    program_id: "program-1",
    outcome: "completed_as_planned",
    source_kind: "manual",
    completed_on: "2026-06-02",
    actual_started_at: "2026-06-02T06:30:00.000Z",
    actual_duration_seconds: 1800,
    actual_distance_m: 1000,
    actual_environment: "pool",
    actual_pool_length_m: 25,
    actual_pool_length_unit: "m",
    actual_session_snapshot: {},
    correction_note: null,
    planned_snapshot: {},
    created_at: "2026-06-02T07:00:00.000Z",
    updated_at: "2026-06-02T07:00:00.000Z",
    ...overrides,
  };
}

type QueryCall = {
  table: string;
  method: "from" | "select" | "eq" | "gte" | "lte" | "order";
  column?: string;
  value?: unknown;
};

type QueryResult = {
  data: unknown[] | null;
  error: unknown | null;
};

interface QueryBuilderLike extends PromiseLike<QueryResult> {
  select(columns: string): QueryBuilderLike;
  eq(column: string, value: unknown): QueryBuilderLike;
  gte(column: string, value: unknown): QueryBuilderLike;
  lte(column: string, value: unknown): QueryBuilderLike;
  order(column: string, options?: unknown): QueryBuilderLike;
}

function createComparisonSupabaseClient(results: Record<string, QueryResult>) {
  const calls: QueryCall[] = [];

  function buildQuery(table: string): QueryBuilderLike {
    const result = results[table] ?? { data: [], error: null };
    const query: QueryBuilderLike = {
      select(columns) {
        calls.push({ table, method: "select", value: columns });
        return query;
      },
      eq(column, value) {
        calls.push({ table, method: "eq", column, value });
        return query;
      },
      gte(column, value) {
        calls.push({ table, method: "gte", column, value });
        return query;
      },
      lte(column, value) {
        calls.push({ table, method: "lte", column, value });
        return query;
      },
      order(column, options) {
        calls.push({ table, method: "order", column, value: options });
        return query;
      },
      then<TResult1 = QueryResult, TResult2 = never>(
        onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
      ) {
        return Promise.resolve(result).then(onfulfilled, onrejected);
      },
    };
    return query;
  }

  return {
    calls,
    client: {
      from(table: string) {
        calls.push({ table, method: "from" });
        return buildQuery(table);
      },
    },
  };
}

const window = buildMyLibraryCalendarComparisonWindow({
  selectedDate: "2026-06-05",
  todayDate: "2026-06-05",
  period: "week",
});

describe("my library calendar comparison", () => {
  it("builds Habits metrics from existing check-ins only", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [
        buildHabit(),
        buildHabit({
          id: "habit-2",
          title: "Water",
          isPerfectDayItem: false,
          sortOrder: 1,
        }),
      ],
      checkIns: [
        buildCheckIn({ checkInDate: "2026-06-02" }),
        buildCheckIn({
          id: "rest-1",
          checkInDate: "2026-06-03",
          valueBoolean: null,
          status: "skipped",
          completedAt: null,
        }),
        buildCheckIn({
          id: "previous-1",
          checkInDate: "2026-05-27",
          completedAt: "2026-05-27T08:00:00.000Z",
        }),
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(source.details).toEqual([
      {
        id: "active_habits",
        label: "Active habits",
        value: "2 habits",
      },
      {
        id: "included_habits",
        label: "Included habits",
        value: "Morning mobility",
        supportLabel: "Only active perfect-day habits are included in on-target comparison.",
      },
      {
        id: "tracked_days",
        label: "Tracked days",
        value: "4 days",
      },
      {
        id: "habit_reset_markers",
        label: "Habit resets",
        value: "0 markers",
        supportLabel:
          "Reset stats markers restart motivation stats but are not counted as completed habits, rest days, or slips.",
      },
    ]);
    expect(source.metrics.find((metric) => metric.id === "habit_perfect_days")).toMatchObject({
      currentLabel: "1 day",
      comparisonLabel: "1 day",
      deltaLabel: "No change",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_rest_slips")).toMatchObject({
      currentLabel: "1 rest / 0 slips",
      comparisonLabel: "0 rest / 0 slips",
    });
  });

  it("reports Habits reset-stats markers without counting them as completions", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [buildHabit()],
      checkIns: [buildCheckIn({ checkInDate: "2026-06-02" })],
      resetEvents: [
        buildReset({ effectiveDate: "2026-06-04" }),
        buildReset({
          id: "previous-reset",
          effectiveDate: "2026-05-27",
          createdAt: "2026-05-27T08:00:00.000Z",
        }),
      ],
      window,
    });

    expect(source.details?.find((detail) => detail.id === "habit_reset_markers")).toMatchObject({
      label: "Habit resets",
      value: "1 marker",
    });
    expect(
      source.metrics.find((metric) => metric.id === "habit_reset_markers_metric")
    ).toMatchObject({
      currentLabel: "1 marker",
      comparisonLabel: "1 marker",
      deltaLabel: "Markers only",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_on_target_slots")).toMatchObject({
      currentLabel: "1/5",
      comparisonLabel: "0/5",
    });
    expect(source.metrics.find((metric) => metric.id === "habit_rest_slips")).toMatchObject({
      currentLabel: "0 rest / 0 slips",
      comparisonLabel: "0 rest / 0 slips",
    });
  });

  it("formats Habits percent and timed-minute deltas without technical abbreviations or float noise", () => {
    const source = buildHabitsCalendarComparisonSource({
      habits: [
        buildHabit({
          habitMode: "timed",
          habitType: "duration",
          targetValueNumeric: 1,
          targetUnit: "minutes",
          targetLabel: "1 minute",
          timerEnabled: true,
          timerTargetSeconds: 60,
        }),
      ],
      checkIns: [
        buildCheckIn({
          checkInDate: "2026-06-02",
          valueBoolean: null,
          valueNumeric: 69.60000000000001,
        }),
        buildCheckIn({
          id: "previous-timed",
          checkInDate: "2026-05-27",
          completedAt: "2026-05-27T08:00:00.000Z",
          valueBoolean: null,
          valueNumeric: 83.39,
        }),
      ],
      window,
    });

    expect(source.metrics.find((metric) => metric.id === "habit_completion_average")).toMatchObject(
      {
        deltaLabel: "No change",
      }
    );
    expect(source.metrics.find((metric) => metric.id === "habit_timed_minutes")).toMatchObject({
      currentLabel: "69.6 minutes",
      comparisonLabel: "83.39 minutes",
      deltaLabel: "-13.79 minutes",
    });
  });

  it("builds Dryland metrics from completed session dates", () => {
    const source = buildDrylandCalendarComparisonSource({
      events: [
        {
          status: "completed",
          completedAt: "2026-06-02T10:00:00.000Z",
          actualDurationSeconds: 1800,
        },
        {
          status: "completed",
          completedAt: "2026-06-04T10:00:00.000Z",
          actualDurationSeconds: 1200,
        },
        {
          status: "completed",
          completedAt: "2026-05-27T10:00:00.000Z",
          actualDurationSeconds: 600,
        },
        {
          status: "draft",
          completedAt: null,
          actualDurationSeconds: null,
        },
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(
      source.metrics.find((metric) => metric.id === "dryland_completed_sessions")
    ).toMatchObject({
      currentLabel: "2 sessions",
      comparisonLabel: "1 session",
      deltaLabel: "+1 session",
    });
    expect(source.metrics.find((metric) => metric.id === "dryland_minutes")).toMatchObject({
      currentLabel: "50 minutes",
      comparisonLabel: "10 minutes",
      deltaLabel: "+40 minutes",
    });
    expect(source.supportLabel).toContain("Strength sets/reps/load");
  });

  it("builds Micro Sessions metrics from completed and skipped micro block dates", () => {
    const source = buildMicroSessionsCalendarComparisonSource({
      plans: [
        {
          blocks: [
            {
              status: "completed",
              completedAt: "2026-06-02T07:00:00.000Z",
              skippedAt: null,
            },
            {
              status: "skipped",
              completedAt: null,
              skippedAt: "2026-06-03T07:00:00.000Z",
            },
            {
              status: "completed",
              completedAt: "2026-05-27T07:00:00.000Z",
              skippedAt: null,
            },
          ],
        },
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(source.metrics.find((metric) => metric.id === "micro_completed_units")).toMatchObject({
      label: "Completed micro blocks",
      currentLabel: "1 micro block",
      comparisonLabel: "1 micro block",
      deltaLabel: "No change",
    });
    expect(source.metrics.find((metric) => metric.id === "micro_skipped_units")).toMatchObject({
      label: "Skipped micro blocks",
      currentLabel: "1 micro block",
      comparisonLabel: "0 micro blocks",
      deltaLabel: "+1 micro block",
      tone: "negative",
    });
    expect(source.supportLabel).toContain("Queued future blocks are not counted.");
  });

  it("maps trusted manual swim actuals into Swimming Trends without counting provider rows", () => {
    const source = buildSwimmingCalendarComparisonSource({
      activities: [
        buildTrainingActivity({
          id: "current-as-planned",
          activityLocalDate: "2026-06-02",
          outcome: "completed_as_planned",
          durationSeconds: 2400,
          distanceM: 1800,
        }),
        buildTrainingActivity({
          id: "current-partial",
          activityLocalDate: "2026-06-03",
          outcome: "partial",
          durationSeconds: 600,
          distanceM: 400,
        }),
        buildTrainingActivity({
          id: "previous-changed",
          activityLocalDate: "2026-05-27",
          outcome: "completed_different",
          durationSeconds: 1800,
          distanceM: 1000,
        }),
        buildTrainingActivity({
          id: "provider-swim",
          sourceKind: "provider_evidence",
          activityLocalDate: "2026-06-04",
          providerActivityEvidenceId: "provider-evidence-1",
        }),
      ],
      window,
    });

    expect(source.status).toBe("mapped");
    expect(source.summary).toBe("2 completed swims in the selected range.");
    expect(source.details?.find((detail) => detail.id === "trusted_swim_rows")).toMatchObject({
      label: "Counted swims",
      value: "2 completed swims",
    });
    expect(source.details?.find((detail) => detail.id === "swim_outcome_mix")).toMatchObject({
      label: "Session completion",
      value: "1 completed as planned / 1 partial",
    });
    expect(source.details?.find((detail) => detail.id === "excluded_swim_rows")).toMatchObject({
      label: "Excluded sessions",
      value: "1 provider/review item",
    });
    expect(source.metrics.find((metric) => metric.id === "swim_activities")).toMatchObject({
      label: "Completed swims",
      currentLabel: "2 completed swims",
      comparisonLabel: "1 completed swim",
      deltaLabel: "+1",
    });
    expect(source.metrics.find((metric) => metric.id === "swim_distance_m")).toMatchObject({
      currentLabel: "2,200 m",
      comparisonLabel: "1,000 m",
      deltaLabel: "+1,200 m",
    });
    expect(source.metrics.find((metric) => metric.id === "swim_minutes")).toMatchObject({
      label: "Swimming minutes",
      currentLabel: "50 min",
      comparisonLabel: "30 min",
      deltaLabel: "+20 min",
    });
  });

  it("keeps non-swim, needs-review, duplicate, and missing-date rows out of Swimming Trends", () => {
    const source = buildSwimmingCalendarComparisonSource({
      activities: [
        buildTrainingActivity({
          id: "running-row",
          canonicalSport: "running",
          canonicalSubSport: "outdoor_run",
          activityLocalDate: "2026-06-02",
        }),
        buildTrainingActivity({
          id: "needs-review-swim",
          mappingStatus: "needs_review",
          outcome: "needs_review",
          activityLocalDate: "2026-06-03",
        }),
        buildTrainingActivity({
          id: "duplicate-swim",
          mappingStatus: "duplicate",
          activityLocalDate: "2026-06-04",
        }),
        buildTrainingActivity({
          id: "missing-date-swim",
          activityLocalDate: null,
          durationSeconds: 3600,
          distanceM: 2500,
        }),
      ],
      window,
    });

    expect(source.status).toBe("no_data");
    expect(source.summary).toBe("No trusted manual swim actuals in either compared range.");
    expect(source.metrics).toEqual([]);
    expect(source.details?.find((detail) => detail.id === "trusted_swim_rows")).toMatchObject({
      value: "0 completed swims",
    });
    expect(source.details?.find((detail) => detail.id === "excluded_swim_rows")).toMatchObject({
      value: "1 provider/review item + 2 other items",
    });
  });

  it("loads Swimming through owner-scoped date-window history and avoids compatibility double counting", async () => {
    const { calls, client } = createComparisonSupabaseClient({
      training_activity_events: {
        data: [
          buildTrainingActivityEventRow({
            id: "canonical-completed-1",
            completed_activity_event_id: "completed-activity-1",
          }),
        ],
        error: null,
      },
      completed_activity_events: {
        data: [
          buildCompletedActivityEventRow({
            id: "completed-activity-1",
            actual_duration_seconds: 3600,
            actual_distance_m: 2400,
          }),
          buildCompletedActivityEventRow({
            id: "completed-activity-2",
            planned_workout_instance_id: "planned-instance-2",
            completed_on: "2026-06-03",
            actual_duration_seconds: 600,
            actual_distance_m: 400,
          }),
        ],
        error: null,
      },
    });

    const model = await loadMyLibraryCalendarComparison(client as never, "user-1", {
      selectedDate: "2026-06-05",
      todayDate: "2026-06-05",
      selectedSource: "swimming",
      selectedPeriod: "week",
    });

    expect(calls.filter((call) => call.method === "from").map((call) => call.table)).toEqual([
      "training_activity_events",
      "completed_activity_events",
    ]);
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: "training_activity_events", method: "eq", column: "user_id", value: "user-1" },
        {
          table: "training_activity_events",
          method: "gte",
          column: "activity_local_date",
          value: "2026-05-25",
        },
        {
          table: "training_activity_events",
          method: "lte",
          column: "activity_local_date",
          value: "2026-06-05",
        },
        { table: "completed_activity_events", method: "eq", column: "user_id", value: "user-1" },
        {
          table: "completed_activity_events",
          method: "gte",
          column: "completed_on",
          value: "2026-05-25",
        },
        {
          table: "completed_activity_events",
          method: "lte",
          column: "completed_on",
          value: "2026-06-05",
        },
      ])
    );

    const swimming = model.sourceComparisons[0];
    expect(swimming.source).toBe("swimming");
    expect(swimming.metrics.find((metric) => metric.id === "swim_activities")).toMatchObject({
      currentLabel: "2 completed swims",
    });
    expect(swimming.metrics.find((metric) => metric.id === "swim_distance_m")).toMatchObject({
      currentLabel: "1,400 m",
    });
    expect(swimming.metrics.find((metric) => metric.id === "swim_minutes")).toMatchObject({
      currentLabel: "40 min",
    });
  });
});
