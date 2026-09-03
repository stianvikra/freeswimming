import { describe, expect, it } from "vitest";
import {
  buildHabitCheckInInsert,
  buildHabitCheckInView,
  buildHabitDayStatusView,
  buildHabitDaySummary,
  buildHabitDefinitionInsert,
  buildHabitDefinitionUpdate,
  buildHabitDefinitionView,
  buildHabitMotivationResetInsert,
  buildHabitMotivationResetView,
  buildHabitMotivationSummary,
  buildHabitMetricCoverage,
  buildHabitWeekSummary,
  classifyHabitDefinition,
  classifyHabitDayStatus,
  getEffectiveHabitDayStatus,
  getHabitAbsenceReviewCandidateDates,
  getHabitDayStatusLabel,
  getHabitMotivationRangeStartDate,
  HABIT_WEEKDAY_VALUES,
  isUsableHabitDefinition,
  UNSUPPORTED_HABIT_DEFINITION_CODE,
  UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE,
  type HabitCheckInRow,
  type HabitDefinitionRow,
  type HabitMotivationResetRow,
  type HabitSnapshot,
  type SupportedHabitDefinitionRow,
} from "@/lib/habits/shared";

function buildHabitRow(overrides: Partial<HabitDefinitionRow>): SupportedHabitDefinitionRow {
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
  } as SupportedHabitDefinitionRow;
}

function buildFullEditorTargetBody(overrides: Record<string, unknown> = {}) {
  return {
    habitMode: "build",
    habitType: "binary",
    targetValueNumeric: "10",
    targetUnit: "minutes",
    targetTime: "05:00",
    timerEnabled: false,
    timerTargetSeconds: 600,
    ...overrides,
  };
}

const FULL_EDITOR_COMPATIBILITY_CASES = [
  { name: "build binary", row: buildHabitRow({}), body: buildFullEditorTargetBody() },
  {
    name: "build count",
    row: buildHabitRow({ habit_type: "count", target_value_numeric: 10, target_unit: "times" }),
    body: buildFullEditorTargetBody({ habitType: "count", targetUnit: "times" }),
  },
  {
    name: "build duration",
    row: buildHabitRow({
      habit_type: "duration",
      target_value_numeric: 10,
      target_unit: "minutes",
    }),
    body: buildFullEditorTargetBody({ habitType: "duration" }),
    updateRow: { target_value_numeric: 1.234 },
    updateBody: { targetValueNumeric: "1.234" },
  },
  {
    name: "build time of day",
    row: buildHabitRow({
      habit_type: "time_of_day",
      target_operator: "before",
      target_time: "05:00:00",
    }),
    body: buildFullEditorTargetBody({ habitType: "time_of_day", targetUnit: "times" }),
    updateRow: { target_time: "05:00:30" },
  },
  {
    name: "build avoidance",
    row: buildHabitRow({
      habit_type: "avoidance",
      target_operator: "at_most",
      target_value_numeric: 0,
      target_unit: "times",
    }),
    body: buildFullEditorTargetBody({
      habitType: "avoidance",
      targetValueNumeric: "0",
      targetUnit: "times",
      timerTargetSeconds: null,
    }),
  },
  {
    name: "quit avoidance",
    row: buildHabitRow({
      habit_mode: "quit",
      habit_type: "avoidance",
      target_operator: "at_most",
      target_value_numeric: 0,
      target_unit: "times",
    }),
    body: buildFullEditorTargetBody({
      habitMode: "quit",
      habitType: "avoidance",
      targetValueNumeric: "0",
      targetUnit: "times",
      timerTargetSeconds: null,
    }),
  },
  {
    name: "timed duration",
    row: buildHabitRow({
      habit_mode: "timed",
      habit_type: "duration",
      target_value_numeric: 10,
      target_unit: "minutes",
      timer_enabled: true,
      timer_target_seconds: 600,
    }),
    body: buildFullEditorTargetBody({
      habitMode: "timed",
      habitType: "duration",
      timerEnabled: true,
    }),
    updateRow: { target_value_numeric: 1.242, timer_target_seconds: 75 },
    updateBody: { targetValueNumeric: "1.242", timerTargetSeconds: 75 },
  },
] as const;

function getPersistedTargetShape(row: SupportedHabitDefinitionRow) {
  return {
    habit_mode: row.habit_mode,
    habit_type: row.habit_type,
    target_operator: row.target_operator,
    target_value_numeric: row.target_value_numeric,
    target_unit: row.target_unit,
    target_time: row.target_time,
    timer_enabled: row.timer_enabled,
    timer_target_seconds: row.timer_target_seconds,
  };
}

function buildCheckInRow(overrides: Partial<HabitCheckInRow>): HabitCheckInRow {
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

function buildResetRow(overrides: Partial<HabitMotivationResetRow>): HabitMotivationResetRow {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    user_id: "user-1",
    habit_id: "11111111-1111-4111-8111-111111111111",
    reset_type: "reset_stats",
    status: "active",
    effective_date: "2026-05-05",
    created_by: "user-1",
    created_at: "2026-05-05T08:00:00.000Z",
    ...overrides,
  };
}

function buildHabitWriteDateContext() {
  return {
    now: new Date("2026-05-10T12:00:00.000Z"),
    todayDate: "2026-05-10",
  };
}

describe("habits domain helpers", () => {
  it("classifies unknown definition type, mode, status, and mixed rows without coercion", () => {
    const cases = [
      {
        row: buildHabitRow({ habit_type: "future_type" }),
        unsupportedFields: ["unknown_habit_type"],
      },
      {
        row: buildHabitRow({ habit_mode: "future_mode" }),
        unsupportedFields: ["unknown_habit_mode"],
      },
      {
        row: buildHabitRow({ status: "future_status" }),
        unsupportedFields: ["unknown_definition_status"],
      },
      {
        row: buildHabitRow({
          habit_type: "future_type",
          habit_mode: "future_mode",
          status: "future_status",
        }),
        unsupportedFields: [
          "unknown_habit_type",
          "unknown_habit_mode",
          "unknown_definition_status",
        ],
      },
    ] as const;

    for (const testCase of cases) {
      const definition = classifyHabitDefinition(testCase.row);
      expect(definition).toEqual({
        kind: "unsupported",
        descriptor: {
          id: testCase.row.id,
          title: testCase.row.title,
          unsupportedFields: testCase.unsupportedFields,
        },
      });
      expect(JSON.stringify(definition)).not.toContain("future_");
      expect(() => buildHabitDefinitionView(testCase.row)).toThrow(
        UNSUPPORTED_HABIT_DEFINITION_CODE
      );
    }
  });

  it("classifies every canonical target, mode, timer, and cadence family as supported", () => {
    const rows = [
      buildHabitRow({}),
      buildHabitRow({
        habit_type: "count",
        target_operator: "at_most",
        target_value_numeric: 12.5,
        target_unit: "pages",
      }),
      buildHabitRow({
        habit_type: "duration",
        target_operator: "at_most",
        target_value_numeric: 30,
        target_unit: "seconds",
      }),
      buildHabitRow({
        habit_type: "time_of_day",
        target_operator: "after",
        target_time: "05:15:00",
      }),
      buildHabitRow({
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 2,
        target_unit: "glasses",
      }),
      buildHabitRow({
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
      }),
      buildHabitRow({
        habit_mode: "timed",
        habit_type: "duration",
        target_value_numeric: 8,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 480,
      }),
      buildHabitRow({
        habit_mode: "timed",
        habit_type: "duration",
        target_value_numeric: 1.5,
        target_unit: "seconds",
        timer_enabled: true,
        timer_target_seconds: 2,
      }),
      buildHabitRow({
        cadence_period: "weekly",
        cadence_target_count: 3,
        cadence_day_policy: "fixed",
        schedule_days: ["monday", "wednesday", "friday"],
      }),
      buildHabitRow({
        cadence_period: "weekly",
        cadence_target_count: 3,
        cadence_day_policy: "any",
        schedule_days: [...HABIT_WEEKDAY_VALUES],
      }),
      buildHabitRow({
        cadence_period: "monthly",
        cadence_target_count: 12,
        cadence_day_policy: "any",
        schedule_days: [...HABIT_WEEKDAY_VALUES],
      }),
    ];

    for (const row of rows) {
      expect(classifyHabitDefinition(row).kind).toBe("supported");
    }
  });

  it("derives only the exact all-null legacy cadence tuple and keeps its raw row untouched", () => {
    for (const scheduleDays of [
      ["monday"],
      ["monday", "wednesday", "friday"],
      ["sunday", "saturday", "friday", "thursday", "wednesday", "tuesday", "monday"],
    ]) {
      const row = {
        ...buildHabitRow({ schedule_days: scheduleDays }),
        cadence_period: null as unknown as string,
        cadence_target_count: null as unknown as number,
        cadence_day_policy: null as unknown as string,
      };
      const definition = classifyHabitDefinition(row);

      expect(definition.kind).toBe("legacy_cadence");
      expect(isUsableHabitDefinition(definition)).toBe(true);
      if (definition.kind !== "legacy_cadence") continue;
      expect(definition.row).toBe(row);
      expect(definition.resolvedCadence).toEqual({
        cadencePeriod: scheduleDays.length === 7 ? "daily" : "weekly",
        cadenceTargetCount: scheduleDays.length === 7 ? 1 : scheduleDays.length,
        cadenceDayPolicy: "fixed",
        scheduleDays,
      });
      expect(buildHabitDefinitionView(definition.row)).toMatchObject({
        cadencePeriod: scheduleDays.length === 7 ? "daily" : "weekly",
        cadenceTargetCount: scheduleDays.length === 7 ? 1 : scheduleDays.length,
        cadenceDayPolicy: "fixed",
        scheduleDays,
      });
    }
  });

  it("fails closed field-by-field without exposing unknown definition values", () => {
    const cases: Array<{
      row: SupportedHabitDefinitionRow;
      unsupportedFields: string[];
    }> = [
      {
        row: buildHabitRow({ category: "future_category" }),
        unsupportedFields: ["unknown_category"],
      },
      {
        row: buildHabitRow({ target_operator: "future_operator" }),
        unsupportedFields: ["unknown_target_operator"],
      },
      {
        row: buildHabitRow({ target_unit: "future_unit" }),
        unsupportedFields: ["unknown_target_unit"],
      },
      {
        row: buildHabitRow({ target_value_numeric: 1 }),
        unsupportedFields: ["invalid_target_shape"],
      },
      {
        row: buildHabitRow({ timer_enabled: true }),
        unsupportedFields: ["invalid_timer_shape"],
      },
      {
        row: buildHabitRow({ cadence_period: "future_period" }),
        unsupportedFields: ["unknown_cadence_period"],
      },
      {
        row: buildHabitRow({ cadence_day_policy: "future_policy" }),
        unsupportedFields: ["unknown_cadence_day_policy"],
      },
      {
        row: buildHabitRow({ cadence_target_count: 0 }),
        unsupportedFields: ["invalid_cadence_target_count"],
      },
      {
        row: buildHabitRow({ schedule_days: ["monday", "monday"] }),
        unsupportedFields: ["invalid_schedule_days"],
      },
      {
        row: buildHabitRow({
          cadence_period: "weekly",
          cadence_target_count: 2,
          cadence_day_policy: "fixed",
          schedule_days: ["monday"],
        }),
        unsupportedFields: ["invalid_cadence_shape"],
      },
    ];

    for (const { row, unsupportedFields } of cases) {
      const definition = classifyHabitDefinition(row);
      expect(definition).toEqual({
        kind: "unsupported",
        descriptor: { id: row.id, title: row.title, unsupportedFields },
      });
      expect(isUsableHabitDefinition(definition)).toBe(false);
      expect(
        definition.kind === "unsupported" ? definition.descriptor.unsupportedFields : []
      ).toHaveLength(unsupportedFields.length);
      expect(JSON.stringify(definition)).not.toMatch(
        /future_(category|operator|unit|period|policy)/
      );
    }
  });

  it("keeps mixed reason keys deterministic, deduplicated, bounded, and value-private", () => {
    const unknownDefinition = classifyHabitDefinition(
      buildHabitRow({
        habit_type: "future_type",
        habit_mode: "future_mode",
        status: "future_status",
        category: "future_category",
        target_operator: "future_operator",
        target_unit: "future_unit",
        cadence_period: "future_period",
        cadence_target_count: 0,
        cadence_day_policy: "future_policy",
        schedule_days: ["monday", "monday"],
      })
    );
    expect(unknownDefinition).toEqual({
      kind: "unsupported",
      descriptor: {
        id: "11111111-1111-4111-8111-111111111111",
        title: "Read",
        unsupportedFields: [
          "unknown_habit_type",
          "unknown_habit_mode",
          "unknown_definition_status",
          "unknown_category",
          "unknown_target_operator",
          "unknown_target_unit",
          "unknown_cadence_period",
          "unknown_cadence_day_policy",
          "invalid_cadence_target_count",
          "invalid_schedule_days",
        ],
      },
    });
    expect(JSON.stringify(unknownDefinition)).not.toContain("future_");
    if (unknownDefinition.kind === "unsupported") {
      expect(new Set(unknownDefinition.descriptor.unsupportedFields).size).toBe(
        unknownDefinition.descriptor.unsupportedFields.length
      );
      expect(unknownDefinition.descriptor.unsupportedFields.length).toBeLessThanOrEqual(13);
    }

    expect(
      classifyHabitDefinition(
        buildHabitRow({
          target_value_numeric: 1,
          timer_enabled: true,
          cadence_period: "weekly",
          cadence_target_count: 2,
          cadence_day_policy: "fixed",
          schedule_days: ["monday"],
        })
      )
    ).toMatchObject({
      kind: "unsupported",
      descriptor: {
        unsupportedFields: ["invalid_target_shape", "invalid_timer_shape", "invalid_cadence_shape"],
      },
    });
  });

  it("requires every non-cadence field to be canonical before using legacy cadence", () => {
    const definition = classifyHabitDefinition({
      ...buildHabitRow({ category: "future_category" }),
      cadence_period: null as unknown as string,
      cadence_target_count: null as unknown as number,
      cadence_day_policy: null as unknown as string,
    });

    expect(definition).toEqual({
      kind: "unsupported",
      descriptor: {
        id: "11111111-1111-4111-8111-111111111111",
        title: "Read",
        unsupportedFields: ["unknown_category"],
      },
    });
  });

  it("rejects partial-null cadence, type-specific unit drift, malformed times, and timer mismatch", () => {
    const cases = [
      buildHabitRow({ cadence_period: null as unknown as string }),
      buildHabitRow({
        habit_type: "count",
        target_value_numeric: 1,
        target_unit: "minutes",
      }),
      buildHabitRow({
        habit_type: "duration",
        target_value_numeric: 1,
        target_unit: "times",
      }),
      buildHabitRow({
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 1,
        target_unit: "steps",
      }),
      buildHabitRow({
        habit_type: "time_of_day",
        target_operator: "before",
        target_time: "25:61:00",
      }),
      buildHabitRow({
        habit_mode: "timed",
        habit_type: "duration",
        target_value_numeric: 8,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 479,
      }),
    ];

    for (const row of cases) {
      expect(classifyHabitDefinition(row).kind).toBe("unsupported");
      expect(() => buildHabitDefinitionView(row)).toThrow(UNSUPPORTED_HABIT_DEFINITION_CODE);
    }
  });

  it("keeps omitted create defaults but rejects explicit unknown or null type and mode", () => {
    expect(buildHabitDefinitionInsert("user-1", { title: "Read" }, 1, "2026-05-10")).toMatchObject({
      habit_type: "binary",
      habit_mode: "build",
    });

    for (const body of [
      { title: "Read", habitType: "future_type" },
      { title: "Read", habitType: null },
      { title: "Read", habitMode: "future_mode" },
      { title: "Read", habitMode: null },
    ]) {
      expect(() => buildHabitDefinitionInsert("user-1", body, 1, "2026-05-10")).toThrow(
        expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE })
      );
    }
  });

  it("projects all seven pre-boundary full-editor create payloads to canonical rows", () => {
    const common = {
      category: "movement",
      cadencePeriod: "daily",
      cadenceTargetCount: 1,
      cadenceDayPolicy: "fixed",
      scheduleDays: HABIT_WEEKDAY_VALUES,
      isPerfectDayItem: true,
    };

    for (const [index, testCase] of FULL_EDITOR_COMPATIBILITY_CASES.entries()) {
      const insert = buildHabitDefinitionInsert(
        "user-1",
        { title: `Habit ${index}`, ...common, ...testCase.body },
        index,
        "2026-05-10"
      );
      expect(insert).toMatchObject(getPersistedTargetShape(testCase.row));
      expect(
        classifyHabitDefinition({
          ...buildHabitRow({
            ...insert,
            id: `00000000-0000-4000-8000-00000000000${index}`,
          }),
        }).kind
      ).toBe("supported");
    }
  });

  it("rejects unknown or malformed supplied fields even when projection would discard them", () => {
    const invalidBodies = [
      { category: "future_category" },
      { category: null },
      { targetOperator: "at_least" },
      { targetUnit: "future_unit" },
      { targetValueNumeric: "not-a-number" },
      { targetTime: "25:00" },
      { timerEnabled: null },
      { timerTargetSeconds: 0 },
      { cadencePeriod: "future_period" },
      { cadencePeriod: null },
      { cadenceTargetCount: 1.5 },
      { cadenceDayPolicy: "future_policy" },
      { cadenceDayPolicy: null },
      { scheduleDays: ["monday", "monday"] },
      { scheduleDays: ["future_day"] },
      { scheduleDays: "monday" },
    ];

    for (const body of invalidBodies) {
      expect(() =>
        buildHabitDefinitionInsert("user-1", { title: "Read", ...body }, 1, "2026-05-10")
      ).toThrow(expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE }));
      expect(() => buildHabitDefinitionUpdate(body, "2026-05-10", buildHabitRow({}))).toThrow(
        expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE })
      );
    }
  });

  it("rejects projected null, unit, cadence, and timer contradictions with the typed value error", () => {
    const invalidBodies = [
      { habitType: "count", targetValueNumeric: 1, targetUnit: null },
      { habitType: "count", targetValueNumeric: 1, targetUnit: "minutes" },
      { habitType: "duration", targetValueNumeric: 1, targetUnit: "times" },
      { habitType: "time_of_day", targetTime: null },
      { habitMode: "quit", targetValueNumeric: 1, targetUnit: "times" },
      { habitMode: "quit", targetValueNumeric: 0, targetUnit: "minutes" },
      {
        habitMode: "timed",
        habitType: "duration",
        targetValueNumeric: 8,
        targetUnit: "minutes",
        timerEnabled: true,
        timerTargetSeconds: null,
      },
      {
        habitMode: "timed",
        habitType: "duration",
        targetValueNumeric: 8,
        targetUnit: "minutes",
        timerEnabled: true,
        timerTargetSeconds: 479,
      },
      {
        habitMode: "build",
        habitType: "duration",
        targetValueNumeric: 8,
        targetUnit: "minutes",
        timerEnabled: true,
      },
      {
        cadencePeriod: "weekly",
        cadenceTargetCount: 2,
        cadenceDayPolicy: "fixed",
        scheduleDays: ["monday"],
      },
      {
        cadencePeriod: "daily",
        cadenceTargetCount: 1,
        cadenceDayPolicy: "fixed",
        scheduleDays: ["monday"],
      },
      {
        cadencePeriod: "weekly",
        cadenceTargetCount: 2,
        cadenceDayPolicy: "any",
        scheduleDays: ["monday", "wednesday"],
      },
      {
        cadencePeriod: "monthly",
        cadenceTargetCount: 5,
        cadenceDayPolicy: "any",
        scheduleDays: ["monday"],
      },
    ];

    for (const body of invalidBodies) {
      expect(() =>
        buildHabitDefinitionInsert("user-1", { title: "Read", ...body }, 1, "2026-05-10")
      ).toThrow(expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE }));
      expect(() => buildHabitDefinitionUpdate(body, "2026-05-10", buildHabitRow({}))).toThrow(
        expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE })
      );
    }
  });

  it("inherits supported current type and mode when a shape update omits them", () => {
    const currentDefinition = classifyHabitDefinition(
      buildHabitRow({
        habit_type: "duration",
        habit_mode: "build",
        target_value_numeric: 10,
        target_unit: "minutes",
      })
    );
    expect(currentDefinition.kind).toBe("supported");
    if (currentDefinition.kind !== "supported") return;

    expect(
      buildHabitDefinitionUpdate({ targetValueNumeric: 20 }, "2026-05-10", currentDefinition.row)
    ).toEqual({
      target_value_numeric: 20,
    });

    for (const body of [
      { habitType: "future_type" },
      { habitType: null },
      { habitMode: "future_mode" },
      { habitMode: null },
    ]) {
      expect(() => buildHabitDefinitionUpdate(body, "2026-05-10", currentDefinition.row)).toThrow(
        expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE })
      );
    }
  });

  it("keeps full-editor title-only patches semantic-write free and preserves stored operators", () => {
    const currentRows = FULL_EDITOR_COMPATIBILITY_CASES.map(({ name, row, ...testCase }) =>
      buildHabitRow({
        ...row,
        ...("updateRow" in testCase ? testCase.updateRow : {}),
        title: name,
        target_operator:
          row.habit_type === "time_of_day"
            ? "after"
            : row.habit_mode === "build" &&
                (row.habit_type === "count" || row.habit_type === "duration")
              ? "at_most"
              : row.target_operator,
      })
    );

    for (const [index, testCase] of FULL_EDITOR_COMPATIBILITY_CASES.entries()) {
      const current = currentRows[index]!;
      const update = buildHabitDefinitionUpdate(
        {
          title: `${current.title} updated`,
          notes: current.notes,
          category: current.category,
          ...testCase.body,
          ...("updateBody" in testCase ? testCase.updateBody : {}),
          cadencePeriod: "daily",
          cadenceTargetCount: 1,
          cadenceDayPolicy: "fixed",
          scheduleDays: HABIT_WEEKDAY_VALUES,
          isPerfectDayItem: true,
        },
        "2026-05-10",
        current
      );

      expect(update).toEqual({ title: `${current.title} updated` });
    }

    expect(
      buildHabitDefinitionUpdate({ targetValueNumeric: 11 }, "2026-05-10", currentRows[1]!)
    ).toEqual({ target_value_numeric: 11 });
    expect(
      buildHabitDefinitionUpdate({ targetTime: "06:00" }, "2026-05-10", currentRows[3]!)
    ).toEqual({ target_time: "06:00:00" });
  });

  it("derives a new operator only for an actual type or mode transition", () => {
    const current = buildHabitRow({
      habit_type: "count",
      target_operator: "at_most",
      target_value_numeric: 10,
      target_unit: "times",
    });

    expect(
      buildHabitDefinitionUpdate(
        {
          habitType: "duration",
          targetValueNumeric: 5,
          targetUnit: "minutes",
        },
        "2026-05-10",
        current
      )
    ).toMatchObject({
      habit_type: "duration",
      target_operator: "at_least",
      target_value_numeric: 5,
      target_unit: "minutes",
    });
  });

  it("keeps legacy cadence raw for unrelated/full-editor no-op edits and canonicalizes only a real complete cadence edit", () => {
    const rawLegacyRow = {
      ...buildHabitRow({ schedule_days: ["monday", "wednesday", "friday"] }),
      cadence_period: null as unknown as string,
      cadence_target_count: null as unknown as number,
      cadence_day_policy: null as unknown as string,
    };
    const definition = classifyHabitDefinition(rawLegacyRow);
    expect(definition.kind).toBe("legacy_cadence");
    if (definition.kind !== "legacy_cadence") return;

    expect(
      buildHabitDefinitionUpdate({ title: "Read more" }, "2026-05-10", definition.row)
    ).toEqual({
      title: "Read more",
    });
    expect(
      buildHabitDefinitionUpdate(
        {
          title: "Read more",
          habitMode: "build",
          habitType: "binary",
          category: "learning",
          targetValueNumeric: "10",
          targetUnit: "minutes",
          targetTime: "05:00",
          timerEnabled: false,
          timerTargetSeconds: 600,
          cadencePeriod: "weekly",
          cadenceTargetCount: 3,
          cadenceDayPolicy: "fixed",
          scheduleDays: ["friday", "wednesday", "monday"],
          isPerfectDayItem: true,
        },
        "2026-05-10",
        definition.row
      )
    ).toEqual({ title: "Read more" });

    expect(() =>
      buildHabitDefinitionUpdate({ cadenceTargetCount: 2 }, "2026-05-10", definition.row)
    ).toThrow(expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE }));
    expect(
      buildHabitDefinitionUpdate(
        {
          cadencePeriod: "weekly",
          cadenceTargetCount: 2,
          cadenceDayPolicy: "any",
          scheduleDays: HABIT_WEEKDAY_VALUES,
        },
        "2026-05-10",
        definition.row
      )
    ).toEqual({
      cadence_period: "weekly",
      cadence_target_count: 2,
      cadence_day_policy: "any",
      schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    });
  });

  it("builds avoidance habits as at-most raw targets", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "No sugar",
        habitType: "avoidance",
        category: "nutrition",
        targetValueNumeric: 0,
        targetUnit: "times",
      },
      2,
      "2026-05-10"
    );

    expect(insert).toMatchObject({
      user_id: "user-1",
      title: "No sugar",
      habit_type: "avoidance",
      category: "nutrition",
      target_operator: "at_most",
      target_value_numeric: 0,
      target_unit: "times",
      is_perfect_day_item: true,
      sort_order: 2,
    });
  });

  it("fails closed for unsupported habit lifecycle statuses", () => {
    expect(buildHabitDefinitionUpdate({ status: "archived" }, "2026-05-10")).toMatchObject({
      status: "archived",
    });
    expect(buildHabitDefinitionUpdate({ status: "active" }, "2026-05-10")).toMatchObject({
      status: "active",
    });
    expect(() => buildHabitDefinitionUpdate({ status: "deleted" }, "2026-05-10")).toThrow(
      "Unsupported habit status."
    );
  });

  it("requires real explicit local-day context for definition write validators", () => {
    expect(() => buildHabitDefinitionInsert("user-1", { title: "Read" }, 1, "2026-02-31")).toThrow(
      "Habit write today date must be a real YYYY-MM-DD date."
    );
    expect(() => buildHabitDefinitionUpdate({ status: "active" }, "not-a-date")).toThrow(
      "Habit write today date must be a real YYYY-MM-DD date."
    );
  });

  it("guards definition start dates against server-local today, not selectedDate", () => {
    expect(() =>
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Invalid selected date",
          selectedDate: "2026-02-31",
        },
        1,
        "2026-05-10"
      )
    ).toThrow("Choose a valid start date.");

    expect(() =>
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Invalid-date habit",
          startDate: "2026-02-31",
        },
        1,
        "2026-05-10"
      )
    ).toThrow("Choose a valid start date.");

    expect(() =>
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Future habit",
          startDate: "2026-05-11",
          selectedDate: "2026-05-11",
        },
        1,
        "2026-05-10"
      )
    ).toThrow("Choose today or an earlier start date.");

    expect(() =>
      buildHabitDefinitionUpdate(
        {
          startDate: "2026-05-11",
          selectedDate: "2026-05-11",
        },
        "2026-05-10"
      )
    ).toThrow("Choose today or an earlier start date.");

    expect(
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Today habit",
          startDate: "2026-05-10",
          selectedDate: "2999-01-01",
        },
        1,
        "2026-05-10"
      )
    ).toMatchObject({ start_date: "2026-05-10" });
  });

  it("builds quit habits with start dates and days-since evaluation", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Eating chips",
        habitMode: "quit",
        category: "nutrition",
        startDate: "2026-05-07",
        selectedDate: "2026-05-10",
      },
      3,
      "2026-05-10"
    );
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: insert.habit_mode,
        habit_type: insert.habit_type,
        category: insert.category,
        target_operator: insert.target_operator,
        target_value_numeric: insert.target_value_numeric,
        target_unit: insert.target_unit,
        start_date: insert.start_date,
        last_lapse_date: null,
      })
    );

    const summary = buildHabitDaySummary([habit], [], "2026-05-10");

    expect(insert).toMatchObject({
      habit_mode: "quit",
      habit_type: "avoidance",
      target_operator: "at_most",
      target_value_numeric: 0,
      start_date: "2026-05-07",
      timer_enabled: false,
    });
    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.items[0]?.evaluation.valueLabel).toBe("3 days without");
  });

  it("treats a quit lapse as explicit same-day miss without rewriting the habit start", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-07",
        last_lapse_date: "2026-05-10",
      })
    );
    const lapse = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [lapse], "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(0);
    expect(summary.items[0]?.evaluation.stateLabel).toBe("Slip logged today");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("3/4 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBeNull();
  });

  it("keeps quit progress visible after an earlier slip while hiding short current streaks", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-06",
      })
    );
    const earlierSlip = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-06",
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [earlierSlip], "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.items[0]?.evaluation.stateLabel).toBe("Clear today");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("9/10 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBeNull();
  });

  it("shows quit current streak once it reaches five days", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Eating chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-05",
      })
    );
    const earlierSlip = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: habit.id,
        check_in_date: "2026-05-05",
        value_boolean: false,
      })
    );

    const summary = buildHabitDaySummary([habit], [earlierSlip], "2026-05-10");

    expect(summary.items[0]?.evaluation.valueLabel).toBe("9/10 days clear");
    expect(summary.items[0]?.evaluation.supportingLabel).toBe("Current streak 5 days");
  });

  it("shows build streak motivation for open daily habits with prior completions", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        habit_mode: "build",
        habit_type: "binary",
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

    const summary = buildHabitDaySummary([habit], checkIns, "2026-05-10");

    expect(summary.items[0]?.evaluation.stateLabel).toBe("Open");
    expect(summary.items[0]?.evaluation.valueLabel).toBe("Streak: 6 days.");
    expect(summary.items[0]?.evaluation.supportingLabel).toBe("6/7 days completed");
  });

  it("builds advanced motivation history with perfect-day streaks and rest days", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-05-01",
      })
    );
    const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
      (date, index) =>
        buildHabitCheckInView(
          buildCheckInRow({
            id: `history-done-${index}`,
            habit_id: habit.id,
            check_in_date: date,
          })
        )
    );
    checkIns.push(
      buildHabitCheckInView(
        buildCheckInRow({
          id: "history-rest",
          habit_id: habit.id,
          check_in_date: "2026-05-04",
          value_boolean: null,
          status: "skipped",
          completed_at: null,
        })
      )
    );

    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-07");

    expect(summary.bestStreakDays).toBe(5);
    expect(summary.currentStreakDays).toBe(5);
    expect(summary.restDayCount).toBe(1);
    expect(summary.consistencyPercent).toBe(83);
    expect(summary.habitScore).toBeNull();
    expect(summary.items[0]).toMatchObject({
      habitId: habit.id,
      eligibleDayCount: 6,
      onTrackDayCount: 5,
      restDayCount: 1,
      bestStreakDays: 5,
      currentStreakDays: 5,
    });
  });

  it("builds motivation history from an explicit period boundary", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-04-01",
      })
    );
    const checkIns = ["2026-04-01", "2026-04-02", "2026-05-06", "2026-05-07"].map((date, index) =>
      buildHabitCheckInView(
        buildCheckInRow({
          id: `period-done-${index}`,
          habit_id: habit.id,
          check_in_date: date,
        })
      )
    );

    const allTime = buildHabitMotivationSummary([habit], checkIns, "2026-05-07");
    const month = buildHabitMotivationSummary([habit], checkIns, "2026-05-07", {
      historyStartDate: getHabitMotivationRangeStartDate("month", "2026-05-07"),
    });

    expect(allTime.historyStartDate).toBe("2026-04-01");
    expect(allTime.eligibleDayCount).toBe(37);
    expect(allTime.onTrackDayCount).toBe(4);
    expect(month.historyStartDate).toBe("2026-05-01");
    expect(month.eligibleDayCount).toBe(7);
    expect(month.onTrackDayCount).toBe(2);
    expect(month.currentStreakDays).toBe(2);
  });

  it("uses fixed fresh-start boundaries for motivation ranges", () => {
    expect(getHabitMotivationRangeStartDate("week", "2026-05-07")).toBe("2026-05-04");
    expect(getHabitMotivationRangeStartDate("month", "2026-05-07")).toBe("2026-05-01");
    expect(getHabitMotivationRangeStartDate("three_months", "2026-05-07")).toBe("2026-04-01");
    expect(getHabitMotivationRangeStartDate("three_months", "2026-08-03")).toBe("2026-07-01");
    expect(getHabitMotivationRangeStartDate("six_months", "2026-05-07")).toBe("2026-01-01");
    expect(getHabitMotivationRangeStartDate("six_months", "2026-08-03")).toBe("2026-07-01");
    expect(getHabitMotivationRangeStartDate("year", "2026-08-03")).toBe("2026-01-01");
    expect(getHabitMotivationRangeStartDate("all", "2026-08-03")).toBeNull();
  });

  it("restarts motivation stats from the latest active reset-stats boundary", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Read",
        start_date: "2026-05-01",
      })
    );
    const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
      (date, index) =>
        buildHabitCheckInView(
          buildCheckInRow({
            id: `reset-done-${index}`,
            habit_id: habit.id,
            check_in_date: date,
          })
        )
    );
    const resetEvents = [
      buildHabitMotivationResetView(
        buildResetRow({
          id: "88888888-8888-4888-8888-888888888888",
          effective_date: "2026-05-03",
          created_at: "2026-05-03T08:00:00.000Z",
        })
      ),
      buildHabitMotivationResetView(
        buildResetRow({
          effective_date: "2026-05-05",
          created_at: "2026-05-05T08:00:00.000Z",
        })
      ),
      buildHabitMotivationResetView(
        buildResetRow({
          id: "77777777-7777-4777-8777-777777777777",
          status: "voided",
          effective_date: "2026-05-06",
          created_at: "2026-05-06T08:00:00.000Z",
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-07", {
      resetEvents,
    });
    const item = summary.items[0];

    expect(summary.eligibleDayCount).toBe(3);
    expect(summary.onTrackDayCount).toBe(2);
    expect(summary.currentStreakDays).toBe(2);
    expect(summary.bestStreakDays).toBe(2);
    expect(item).toMatchObject({
      motivationStartDate: "2026-05-05",
      eligibleDayCount: 3,
      onTrackDayCount: 2,
      currentStreakDays: 2,
      bestStreakDays: 2,
    });
    expect(item?.resetBoundary).toMatchObject({
      effectiveDate: "2026-05-05",
    });
    expect(item?.beforeResetSummary).toMatchObject({
      historyStartDate: "2026-05-01",
      historyEndDate: "2026-05-04",
      savedCheckInCount: 3,
      lastTrackedDate: "2026-05-03",
    });
  });

  it("builds owner-bound reset-stats reset inserts with date guards", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        start_date: "2026-05-04",
      })
    );

    expect(
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-10" },
        "2026-05-10"
      )
    ).toMatchObject({
      user_id: "user-1",
      habit_id: habit.id,
      reset_type: "reset_stats",
      status: "active",
      effective_date: "2026-05-10",
      created_by: "user-1",
    });

    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        { ...habit, status: "archived" },
        { effectiveDate: "2026-05-10" },
        "2026-05-10"
      )
    ).toThrow("Reset stats is only available for active habits.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-11" },
        "2026-05-10"
      )
    ).toThrow("Choose today or an earlier reset date.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-03" },
        "2026-05-10"
      )
    ).toThrow("Choose a reset date on or after the habit start date.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-02-31" },
        "2026-05-10"
      )
    ).toThrow("Choose a valid reset date.");
    expect(() =>
      buildHabitMotivationResetInsert(
        "user-1",
        habit,
        { effectiveDate: "2026-05-10" },
        "2026-02-31"
      )
    ).toThrow("Habit write today date must be a real YYYY-MM-DD date.");
  });

  it("counts quit slips and archived habit history without active mutations", () => {
    const activeQuit = buildHabitDefinitionView(
      buildHabitRow({
        title: "No sweets",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
        last_lapse_date: "2026-05-03",
      })
    );
    const archived = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Old mobility",
        start_date: "2026-05-01",
        status: "archived",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          id: "quit-slip",
          habit_id: activeQuit.id,
          check_in_date: "2026-05-03",
          value_boolean: false,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          id: "archived-done",
          habit_id: archived.id,
          check_in_date: "2026-05-02",
          value_boolean: true,
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([activeQuit, archived], checkIns, "2026-05-05");

    expect(summary.activeHabitCount).toBe(1);
    expect(summary.archivedHabitCount).toBe(1);
    expect(summary.slipCount).toBe(1);
    expect(summary.items.find((item) => item.habitId === archived.id)).toMatchObject({
      status: "archived",
      onTrackDayCount: 1,
      bestStreakDays: 1,
    });
  });

  it("counts quit slips only inside the selected fixed period through the selected date", () => {
    const quitHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "No sweets",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-04-01",
        last_lapse_date: "2026-05-20",
      })
    );
    const checkIns = ["2026-04-28", "2026-05-03", "2026-05-20"].map((date, index) =>
      buildHabitCheckInView(
        buildCheckInRow({
          id: `quit-period-slip-${index}`,
          habit_id: quitHabit.id,
          check_in_date: date,
          value_boolean: false,
        })
      )
    );

    const month = buildHabitMotivationSummary([quitHabit], checkIns, "2026-05-07", {
      historyStartDate: getHabitMotivationRangeStartDate("month", "2026-05-07"),
    });
    const quarter = buildHabitMotivationSummary([quitHabit], checkIns, "2026-05-07", {
      historyStartDate: getHabitMotivationRangeStartDate("three_months", "2026-05-07"),
    });

    expect(month.historyStartDate).toBe("2026-05-01");
    expect(month.historyEndDate).toBe("2026-05-07");
    expect(month.slipCount).toBe(1);
    expect(quarter.historyStartDate).toBe("2026-04-01");
    expect(quarter.slipCount).toBe(2);
  });

  it("totals timed and count history from canonical check-ins", () => {
    const timed = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Mobility",
        habit_mode: "timed",
        habit_type: "duration",
        target_value_numeric: 10,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 600,
      })
    );
    const count = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Water",
        habit_type: "count",
        target_value_numeric: 2,
        target_unit: "litres",
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          id: "timed-source",
          habit_id: timed.id,
          value_boolean: null,
          value_numeric: 12,
          timer_seconds: 420,
          manual_minutes: 5,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          id: "count-source",
          habit_id: count.id,
          value_boolean: null,
          value_numeric: 2.5,
        })
      ),
    ];

    const summary = buildHabitMotivationSummary([timed, count], checkIns, "2026-05-10");

    expect(summary.totalTimedMinutes).toBe(12);
    expect(summary.totalCount).toBe(2.5);
  });

  it("fails closed for unsupported future check-in statuses", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        status: "future-status" as unknown as HabitCheckInRow["status"],
        value_boolean: true,
      })
    );

    const daySummary = buildHabitDaySummary([habit], [checkIn], "2026-05-10");
    const motivationSummary = buildHabitMotivationSummary([habit], [checkIn], "2026-05-10");

    expect(checkIn.status).toBe("unsupported");
    expect(daySummary.items[0]?.evaluation).toMatchObject({
      isSatisfied: false,
      stateLabel: "Unsupported",
      valueLabel: "Unsupported check-in",
    });
    expect(motivationSummary.onTrackDayCount).toBe(0);
    expect(motivationSummary.habitScore).toBeNull();
  });

  it("builds timed habits with duration timer metadata", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Mobility",
        habitMode: "timed",
        category: "movement",
        targetValueNumeric: 8,
        targetUnit: "minutes",
        startDate: "2026-05-10",
        selectedDate: "2026-05-10",
      },
      4,
      "2026-05-10"
    );

    expect(insert).toMatchObject({
      habit_mode: "timed",
      habit_type: "duration",
      target_operator: "at_least",
      target_value_numeric: 8,
      target_unit: "minutes",
      timer_enabled: true,
      timer_target_seconds: 480,
    });
  });

  it("builds timed check-ins from explicit timer and manual sources", () => {
    const insert = buildHabitCheckInInsert(
      "user-1",
      {
        habitId: "11111111-1111-4111-8111-111111111111",
        checkInDate: "2026-05-10",
        timerSeconds: 125,
        manualMinutes: 5,
      },
      buildHabitWriteDateContext()
    );

    expect(insert).toMatchObject({
      value_numeric: 7.08,
      timer_seconds: 125,
      manual_minutes: 5,
      source_kind: "timer",
      status: "logged",
      completed_at: "2026-05-10T12:00:00.000Z",
    });
    expect(() =>
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-02-31",
          valueBoolean: true,
        },
        buildHabitWriteDateContext()
      )
    ).toThrow("Choose a valid check-in date.");
  });

  it("uses explicit local today for missing check-in dates and validates its write context", () => {
    const insert = buildHabitCheckInInsert(
      "user-1",
      {
        habitId: "11111111-1111-4111-8111-111111111111",
        valueBoolean: true,
        timezone: "Pacific/Kiritimati",
      },
      {
        now: new Date("2026-05-10T12:30:00.000Z"),
        todayDate: "2026-05-11",
      }
    );

    expect(insert).toMatchObject({
      check_in_date: "2026-05-11",
      completed_at: "2026-05-10T12:30:00.000Z",
    });
    expect(() =>
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          valueBoolean: true,
        },
        { now: new Date("invalid"), todayDate: "2026-05-10" }
      )
    ).toThrow("Habit write instant must be a valid Date.");
    expect(() =>
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          valueBoolean: true,
        },
        { now: new Date("2026-05-10T12:00:00.000Z"), todayDate: "2026-02-31" }
      )
    ).toThrow("Habit write today date must be a real YYYY-MM-DD date.");
  });

  it("allows zero manual minutes and rejects unsupported manual minute values", () => {
    expect(
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          timerSeconds: 120,
          manualMinutes: 0,
        },
        buildHabitWriteDateContext()
      )
    ).toMatchObject({
      value_numeric: 2,
      timer_seconds: 120,
      manual_minutes: 0,
      source_kind: "timer",
    });

    expect(() =>
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          timerSeconds: 120,
          manualMinutes: 1.5,
        },
        buildHabitWriteDateContext()
      )
    ).toThrow("Manual time must be whole minutes between 0 and 1440.");

    expect(() =>
      buildHabitCheckInInsert(
        "user-1",
        {
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          timerSeconds: 120,
          manualMinutes: 1441,
        },
        buildHabitWriteDateContext()
      )
    ).toThrow("Manual time must be whole minutes between 0 and 1440.");
  });

  it("keeps legacy numeric timed rows readable without inventing a source split", () => {
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        value_boolean: null,
        value_numeric: 2.5,
        timer_seconds: 0,
        manual_minutes: 0,
      })
    );

    expect(checkIn).toMatchObject({
      valueNumeric: 2.5,
      timerSeconds: 0,
      manualMinutes: 0,
      legacyTimedSeconds: 150,
    });
  });

  it("keeps micro-session check-in provenance readable", () => {
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        source_kind: "micro_session",
        source_dryland_micro_plan_id: "33333333-3333-4333-8333-333333333333",
        source_micro_block_id: "unit-1",
        source_completed_at: "2026-05-10T10:00:00.000Z",
      })
    );

    expect(checkIn).toMatchObject({
      sourceKind: "micro_session",
      sourceDrylandMicroPlanId: "33333333-3333-4333-8333-333333333333",
      sourceMicroBlockId: "unit-1",
      sourceCompletedAt: "2026-05-10T10:00:00.000Z",
    });
  });

  it("derives all-days schedules when weekly and monthly any-day cadence omits them", () => {
    const weekly = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Mobility",
        cadencePeriod: "weekly",
        cadenceTargetCount: 3,
        cadenceDayPolicy: "any",
      },
      1,
      "2026-05-10"
    );
    const monthly = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Review technique",
        cadencePeriod: "monthly",
        cadenceTargetCount: 5,
        cadenceDayPolicy: "any",
      },
      2,
      "2026-05-10"
    );

    expect(weekly).toMatchObject({
      cadence_period: "weekly",
      cadence_target_count: 3,
      cadence_day_policy: "any",
      schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    });
    expect(monthly).toMatchObject({
      cadence_period: "monthly",
      cadence_target_count: 5,
      cadence_day_policy: "any",
    });
  });

  it("rejects unsupported monthly fixed-date cadence", () => {
    expect(() =>
      buildHabitDefinitionInsert(
        "user-1",
        {
          title: "Review technique",
          cadencePeriod: "monthly",
          cadenceTargetCount: 5,
          cadenceDayPolicy: "fixed",
        },
        1,
        "2026-05-10"
      )
    ).toThrow(expect.objectContaining({ code: UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE }));
  });

  it("keeps legacy schedule-day rows readable as weekly fixed days", () => {
    const definition = classifyHabitDefinition({
      ...buildHabitRow({
        schedule_days: ["monday", "wednesday", "friday"],
      }),
      cadence_period: null as unknown as string,
      cadence_target_count: null as unknown as number,
      cadence_day_policy: null as unknown as string,
    });
    expect(definition.kind).toBe("legacy_cadence");
    if (definition.kind !== "legacy_cadence") return;
    const habit = buildHabitDefinitionView(definition.row);

    expect(habit.cadencePeriod).toBe("weekly");
    expect(habit.cadenceTargetCount).toBe(3);
    expect(habit.cadenceDayPolicy).toBe("fixed");
    expect(habit.cadenceLabel).toBe("Weekly - 3 fixed days");
  });

  it("evaluates mixed perfect-day target types deterministically", () => {
    const binary = buildHabitDefinitionView(buildHabitRow({ title: "Sit in deep squat" }));
    const duration = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Walk stairs",
        habit_type: "duration",
        category: "movement",
        target_operator: "at_least",
        target_value_numeric: 10,
        target_unit: "minutes",
      })
    );
    const wake = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Wake up",
        habit_type: "time_of_day",
        category: "recovery",
        target_operator: "before",
        target_time: "05:00:00",
      })
    );
    const noSugar = buildHabitDefinitionView(
      buildHabitRow({
        id: "55555555-5555-4555-8555-555555555555",
        title: "No sugar",
        habit_type: "avoidance",
        category: "nutrition",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
      })
    );
    const checkIns = [
      buildHabitCheckInView(buildCheckInRow({ habit_id: binary.id, value_boolean: true })),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: duration.id,
          value_boolean: null,
          value_numeric: 12,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: wake.id,
          value_boolean: null,
          value_time: "04:55:00",
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          habit_id: noSugar.id,
          value_boolean: null,
          value_numeric: 0,
        })
      ),
    ];

    const summary = buildHabitDaySummary([binary, duration, wake, noSugar], checkIns, "2026-05-10");

    expect(summary.satisfiedPerfectDayItemCount).toBe(4);
    expect(summary.perfectDayItemCount).toBe(4);
    expect(summary.completionPercent).toBe(100);
    expect(summary.isPerfectDay).toBe(true);
    expect(summary.completedDurationMinutes).toBe(12);
  });

  it("builds weekly summaries from raw check-ins without storing derived rows", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          check_in_date: "2026-05-09",
          value_boolean: true,
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          check_in_date: "2026-05-10",
          value_boolean: true,
        })
      ),
    ];

    const summary = buildHabitWeekSummary([habit], checkIns, "2026-05-10");

    expect(summary.days).toHaveLength(7);
    expect(summary.perfectDayCount).toBe(2);
    expect(summary.averageCompletionPercent).toBe(29);
  });

  it("builds Habits week summaries as Monday-Sunday ISO weeks", () => {
    const habit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));

    const summary = buildHabitWeekSummary([habit], [], "2026-06-05");

    expect(summary.days.map((day) => day.date)).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
    ]);
  });

  it("treats skipped check-ins as rest days that do not count as done or missed", () => {
    const restHabit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const doneHabit = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Drink water",
      })
    );
    const restDay = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: restHabit.id,
        status: "skipped",
        value_boolean: null,
        completed_at: null,
      })
    );
    const done = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: doneHabit.id,
        value_boolean: true,
      })
    );

    const summary = buildHabitDaySummary([restHabit, doneHabit], [restDay, done], "2026-05-10");

    expect(summary.perfectDayItemCount).toBe(1);
    expect(summary.satisfiedPerfectDayItemCount).toBe(1);
    expect(summary.completionPercent).toBe(100);
    expect(summary.items.find((item) => item.habit.id === restHabit.id)?.priorityGroup).toBe(
      "rest_day"
    );
    expect(summary.items.find((item) => item.habit.id === restHabit.id)?.evaluation).toMatchObject({
      isSatisfied: false,
      valueLabel: "Rest day",
      stateLabel: "Rest day",
      supportingLabel: "Not counted as done or missed",
    });
  });

  it("keeps weekly and monthly target-met habits done for the rest of the period", () => {
    const weekly = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Weekly mobility",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
      })
    );
    const monthly = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Technique review",
        start_date: "2026-05-01",
        cadence_period: "monthly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
      })
    );
    const checkIns = [
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

    const summary = buildHabitDaySummary([weekly, monthly], checkIns, "2026-05-10");

    expect(summary.items.map((item) => [item.habit.title, item.priorityGroup])).toEqual([
      ["Weekly mobility", "done_period"],
      ["Technique review", "done_period"],
    ]);
    expect(summary.items.map((item) => item.isScheduledForDate)).toEqual([false, false]);
    expect(summary.items.map((item) => item.cadenceProgress.isTargetMet)).toEqual([true, true]);
  });

  it("sorts active habits by nearest deadline before status and completion rows", () => {
    const dueBuild = buildHabitDefinitionView(
      buildHabitRow({
        id: "11111111-1111-4111-8111-111111111111",
        title: "Drink water",
        sort_order: 5,
      })
    );
    const dueTimed = buildHabitDefinitionView(
      buildHabitRow({
        id: "22222222-2222-4222-8222-222222222222",
        title: "Timer",
        habit_mode: "timed",
        habit_type: "duration",
        category: "movement",
        target_operator: "at_least",
        target_value_numeric: 8,
        target_unit: "minutes",
        timer_enabled: true,
        timer_target_seconds: 480,
        sort_order: 1,
      })
    );
    const dueWeekly = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "Weekly mobility",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
        schedule_days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        sort_order: 4,
      })
    );
    const dueMonthly = buildHabitDefinitionView(
      buildHabitRow({
        id: "44444444-4444-4444-8444-444444444444",
        title: "Review technique",
        cadence_period: "monthly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
        sort_order: 2,
      })
    );
    const quit = buildHabitDefinitionView(
      buildHabitRow({
        id: "55555555-5555-4555-8555-555555555555",
        title: "No chips",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        sort_order: 0,
      })
    );
    const done = buildHabitDefinitionView(
      buildHabitRow({
        id: "66666666-6666-4666-8666-666666666666",
        title: "Read",
        sort_order: 0,
      })
    );
    const doneCheckIn = buildHabitCheckInView(
      buildCheckInRow({
        habit_id: done.id,
        value_boolean: true,
      })
    );

    const summary = buildHabitDaySummary(
      [done, quit, dueMonthly, dueWeekly, dueTimed, dueBuild],
      [doneCheckIn],
      "2026-05-10"
    );

    expect(summary.items.map((item) => item.habit.title)).toEqual([
      "Drink water",
      "Timer",
      "Weekly mobility",
      "Review technique",
      "No chips",
      "Read",
    ]);
    expect(summary.items.map((item) => item.priorityGroup)).toEqual([
      "due_build",
      "due_timed",
      "due_weekly",
      "due_monthly",
      "quit_status",
      "done_today",
    ]);
  });

  it("formats singular count units without parenthetical copy", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        habit_type: "count",
        target_value_numeric: 1,
        target_unit: "glasses",
      })
    );
    const [item] = buildHabitDaySummary(
      [habit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            value_boolean: null,
            value_numeric: 1,
          })
        ),
      ],
      "2026-05-10"
    ).items;

    expect(habit.targetLabel).toBe("At least 1 glass");
    expect(item?.evaluation.valueLabel).toBe("1 glass");
  });

  it("accepts litres as a persisted count unit and formats singular/plural labels", () => {
    const insert = buildHabitDefinitionInsert(
      "user-1",
      {
        title: "Drink water",
        habitType: "count",
        category: "nutrition",
        targetValueNumeric: 2,
        targetUnit: "litres",
      },
      2,
      "2026-05-10"
    );
    const pluralHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Drink water",
        habit_type: "count",
        category: "nutrition",
        target_value_numeric: insert.target_value_numeric,
        target_unit: insert.target_unit,
      })
    );
    const singularHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Drink water",
        habit_type: "count",
        category: "nutrition",
        target_value_numeric: 1,
        target_unit: "litres",
      })
    );
    const [pluralItem] = buildHabitDaySummary(
      [pluralHabit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            habit_id: pluralHabit.id,
            value_boolean: null,
            value_numeric: 2,
          })
        ),
      ],
      "2026-05-10"
    ).items;
    const [singularItem] = buildHabitDaySummary(
      [singularHabit],
      [
        buildHabitCheckInView(
          buildCheckInRow({
            habit_id: singularHabit.id,
            value_boolean: null,
            value_numeric: 1,
          })
        ),
      ],
      "2026-05-10"
    ).items;

    expect(insert.target_unit).toBe("litres");
    expect(pluralHabit.targetLabel).toBe("At least 2 litres");
    expect(pluralItem?.evaluation.valueLabel).toBe("2 litres");
    expect(singularHabit.targetLabel).toBe("At least 1 litre");
    expect(singularItem?.evaluation.valueLabel).toBe("1 litre");
  });

  it("classifies and labels whole-day statuses without exposing unknown raw values", () => {
    expect(classifyHabitDayStatus(null)).toEqual({ kind: "none" });
    expect(classifyHabitDayStatus("not_tracked")).toEqual({
      kind: "supported",
      dayStatus: "not_tracked",
    });
    expect(classifyHabitDayStatus("future_private_status")).toEqual({ kind: "unsupported" });
    expect(
      buildHabitDayStatusView({
        reviewDate: "2026-05-06",
        dayStatus: "future_private_status",
      })
    ).toEqual({ reviewDate: "2026-05-06", dayStatus: "unsupported" });
    expect(
      JSON.stringify(
        buildHabitDayStatusView({
          reviewDate: "2026-05-06",
          dayStatus: "future_private_status",
        })
      )
    ).not.toContain("future_private_status");
    expect(
      buildHabitDayStatusView({
        reviewDate: "2026-05-06",
        dayStatus: "not_tracked",
        acknowledgementStatus: "future_workflow_status",
      })
    ).toEqual({ reviewDate: "2026-05-06", dayStatus: "unsupported" });
    expect(getHabitDayStatusLabel("not_tracked")).toBe("Not tracked");
    expect(getHabitDayStatusLabel("unsupported")).toBe("Needs review");
    expect(() =>
      buildHabitDayStatusView({ reviewDate: "2026-02-31", dayStatus: "not_tracked" })
    ).toThrow("Habit day status date must be a real YYYY-MM-DD date.");
  });

  it("projects metric performance and coverage from separate known and potential units", () => {
    expect(
      buildHabitMetricCoverage({
        potentialUnitCount: 7,
        knownUnitCount: 5,
        successfulUnitCount: 4,
        notTrackedDayCount: 2,
      })
    ).toEqual({
      potentialUnitCount: 7,
      knownUnitCount: 5,
      successfulUnitCount: 4,
      performancePercent: 80,
      coveragePercent: 71,
      notTrackedDayCount: 2,
      state: "available",
    });
    expect(
      buildHabitMetricCoverage({
        potentialUnitCount: 2,
        knownUnitCount: 0,
        successfulUnitCount: 0,
        notTrackedDayCount: 2,
      })
    ).toMatchObject({
      performancePercent: null,
      coveragePercent: 0,
      state: "no_tracked_data",
    });
    expect(
      buildHabitMetricCoverage({
        potentialUnitCount: 2,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        hasUnsupportedDayStatus: true,
      })
    ).toMatchObject({
      performancePercent: null,
      coveragePercent: null,
      state: "needs_review",
    });
  });

  it("keeps an effective not-tracked day neutral and creates no synthetic habit evidence", () => {
    const buildHabit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const quitHabit = buildHabitDefinitionView(
      buildHabitRow({
        id: "33333333-3333-4333-8333-333333333333",
        title: "No sweets",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
      })
    );
    const checkIns: ReturnType<typeof buildHabitCheckInView>[] = [];
    const dayStatuses = [{ reviewDate: "2026-05-10", dayStatus: "not_tracked" as const }];

    const summary = buildHabitDaySummary([buildHabit, quitHabit], checkIns, "2026-05-10", {
      dayStatuses,
    });

    expect(checkIns).toEqual([]);
    expect(summary).toMatchObject({
      dayStatus: "not_tracked",
      trackingState: "not_tracked",
      potentialPerfectDayItemCount: 2,
      perfectDayItemCount: 0,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: null,
      isPerfectDay: false,
      completedDurationMinutes: 0,
      completedCountTotal: 0,
      metricCoverage: {
        potentialUnitCount: 2,
        knownUnitCount: 0,
        successfulUnitCount: 0,
        performancePercent: null,
        coveragePercent: 0,
        notTrackedDayCount: 1,
        state: "no_tracked_data",
      },
    });
    expect(summary.items).toHaveLength(2);
    expect(summary.items.every((item) => item.checkIn === null)).toBe(true);
    expect(summary.items.every((item) => item.priorityGroup === "not_tracked")).toBe(true);
    expect(summary.items.map((item) => item.evaluation.stateLabel)).toEqual([
      "Not tracked",
      "Not tracked",
    ]);
  });

  it("gives any supported check-in precedence over a stale not-tracked marker", () => {
    const countHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Water",
        habit_type: "count",
        target_value_numeric: 2,
        target_unit: "litres",
      })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({ value_boolean: null, value_numeric: 2.5 })
    );
    const dayStatuses = [{ reviewDate: "2026-05-10", dayStatus: "not_tracked" as const }];

    expect(getEffectiveHabitDayStatus("2026-05-10", dayStatuses, [checkIn])).toBeNull();
    const summary = buildHabitDaySummary([countHabit], [checkIn], "2026-05-10", {
      dayStatuses,
    });

    expect(summary).toMatchObject({
      dayStatus: null,
      trackingState: "known",
      perfectDayItemCount: 1,
      satisfiedPerfectDayItemCount: 1,
      completionPercent: 100,
      completedCountTotal: 2.5,
      metricCoverage: {
        potentialUnitCount: 1,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        performancePercent: 100,
        coveragePercent: 100,
      },
    });
  });

  it("uses hidden-parent check-ins only for stale day-status precedence", () => {
    const visibleHabit = buildHabitDefinitionView(buildHabitRow({ title: "Read" }));
    const hiddenParentCheckIn = buildHabitCheckInView(
      buildCheckInRow({
        id: "99999999-9999-4999-8999-999999999999",
        habit_id: "88888888-8888-4888-8888-888888888888",
        check_in_date: "2026-05-10",
      })
    );
    const options = {
      dayStatuses: [{ reviewDate: "2026-05-10", dayStatus: "not_tracked" as const }],
      dayStatusPrecedenceCheckIns: [hiddenParentCheckIn],
    };

    expect(buildHabitDaySummary([visibleHabit], [], "2026-05-10", options)).toMatchObject({
      dayStatus: null,
      trackingState: "known",
    });
    expect(buildHabitMotivationSummary([visibleHabit], [], "2026-05-10", options)).toMatchObject({
      notTrackedDayCount: 0,
      metricCoverage: { notTrackedDayCount: 0 },
    });
  });

  it("excludes not-tracked dates from weekly performance while retaining coverage", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({ title: "Read", start_date: "2026-05-04" })
    );
    const checkIns = ["2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07"].map((date, index) =>
      buildHabitCheckInView(buildCheckInRow({ id: `week-known-${index}`, check_in_date: date }))
    );
    const summary = buildHabitWeekSummary([habit], checkIns, "2026-05-10", {
      dayStatuses: [
        { reviewDate: "2026-05-08", dayStatus: "not_tracked" },
        { reviewDate: "2026-05-09", dayStatus: "not_tracked" },
      ],
    });

    expect(summary.perfectDayCount).toBe(4);
    expect(summary.averageCompletionPercent).toBe(80);
    expect(summary.metricCoverage).toEqual({
      potentialUnitCount: 7,
      knownUnitCount: 5,
      successfulUnitCount: 4,
      performancePercent: 80,
      coveragePercent: 71,
      notTrackedDayCount: 2,
      state: "available",
    });
    expect(summary.days.find((day) => day.date === "2026-05-08")?.completionPercent).toBeNull();
  });

  it("treats not-tracked as a neutral hard streak boundary without changing tracked totals", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({ title: "Read", start_date: "2026-05-01" })
    );
    const checkIns = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-05", "2026-05-06"].map(
      (date, index) =>
        buildHabitCheckInView(buildCheckInRow({ id: `streak-known-${index}`, check_in_date: date }))
    );
    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-06", {
      dayStatuses: [{ reviewDate: "2026-05-04", dayStatus: "not_tracked" }],
    });

    expect(summary).toMatchObject({
      lastTrackedDate: "2026-05-06",
      potentialDayCount: 6,
      eligibleDayCount: 5,
      onTrackDayCount: 5,
      notTrackedDayCount: 1,
      currentStreakDays: 2,
      bestStreakDays: 3,
      consistencyPercent: 100,
      totalTimedMinutes: 0,
      totalCount: 0,
      metricCoverage: {
        potentialUnitCount: 6,
        knownUnitCount: 5,
        successfulUnitCount: 5,
        coveragePercent: 83,
      },
    });
    expect(summary.items[0]).toMatchObject({
      potentialDayCount: 6,
      eligibleDayCount: 5,
      onTrackDayCount: 5,
      notTrackedDayCount: 1,
      currentStreakDays: 2,
      bestStreakDays: 3,
    });
  });

  it("does not bridge a Perfect Day streak across a not-tracked weekly-any gap", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Weekly swim",
        start_date: "2026-04-27",
        cadence_period: "weekly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
      })
    );
    const checkIns = ["2026-05-03", "2026-05-05"].map((date, index) =>
      buildHabitCheckInView(buildCheckInRow({ id: `weekly-gap-${index}`, check_in_date: date }))
    );

    const summary = buildHabitMotivationSummary([habit], checkIns, "2026-05-05", {
      dayStatuses: [{ reviewDate: "2026-05-04", dayStatus: "not_tracked" }],
    });

    expect(summary).toMatchObject({
      potentialDayCount: 2,
      eligibleDayCount: 2,
      onTrackDayCount: 2,
      notTrackedDayCount: 1,
      currentStreakDays: 1,
      bestStreakDays: 1,
    });
  });

  it("excludes not-tracked from clear quit days and breaks the clear-day streak", () => {
    const quitHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "No sweets",
        habit_mode: "quit",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
        target_unit: "times",
        start_date: "2026-05-01",
      })
    );
    const summary = buildHabitMotivationSummary([quitHabit], [], "2026-05-05", {
      dayStatuses: [{ reviewDate: "2026-05-03", dayStatus: "not_tracked" }],
    });

    expect(summary.items[0]).toMatchObject({
      lastTrackedDate: null,
      potentialDayCount: 5,
      eligibleDayCount: 4,
      onTrackDayCount: 4,
      notTrackedDayCount: 1,
      slipCount: 0,
      currentStreakDays: 2,
      bestStreakDays: 2,
      consistencyPercent: 100,
      totalTimedMinutes: 0,
      totalCount: 0,
    });
  });

  it("distinguishes met, unknown, and mathematically unreachable any-day periods", () => {
    const buildWeeklyHabit = (targetCount: number) =>
      buildHabitDefinitionView(
        buildHabitRow({
          title: `Weekly ${targetCount}`,
          start_date: "2026-05-04",
          cadence_period: "weekly",
          cadence_target_count: targetCount,
          cadence_day_policy: "any",
        })
      );
    const dayStatuses = [{ reviewDate: "2026-05-06", dayStatus: "not_tracked" as const }];
    const metHabit = buildWeeklyHabit(2);
    const metCheckIns = ["2026-05-04", "2026-05-05"].map((date, index) =>
      buildHabitCheckInView(buildCheckInRow({ id: `weekly-met-${index}`, check_in_date: date }))
    );
    const met = buildHabitMotivationSummary([metHabit], metCheckIns, "2026-05-10", {
      dayStatuses,
    }).items[0];
    expect(met).toMatchObject({
      potentialDayCount: 1,
      eligibleDayCount: 1,
      onTrackDayCount: 1,
      notTrackedDayCount: 1,
      unknownPeriodCount: 0,
      consistencyPercent: 100,
      currentStreakDays: 0,
      bestStreakDays: 0,
    });

    const uncertainHabit = buildWeeklyHabit(2);
    const oneCompletion = [
      buildHabitCheckInView(buildCheckInRow({ id: "weekly-one", check_in_date: "2026-05-04" })),
    ];
    const uncertainSummary = buildHabitMotivationSummary(
      [uncertainHabit],
      oneCompletion,
      "2026-05-10",
      {
        dayStatuses,
      }
    );
    const uncertain = uncertainSummary.items[0];
    expect(uncertain).toMatchObject({
      potentialDayCount: 1,
      eligibleDayCount: 0,
      onTrackDayCount: 0,
      notTrackedDayCount: 1,
      unknownPeriodCount: 1,
      consistencyPercent: null,
      currentStreakDays: 0,
      metricCoverage: {
        performancePercent: null,
        coveragePercent: 0,
        state: "no_tracked_data",
      },
    });
    expect(uncertainSummary).toMatchObject({
      potentialDayCount: 2,
      eligibleDayCount: 1,
      onTrackDayCount: 1,
      notTrackedDayCount: 1,
      currentStreakDays: 0,
      bestStreakDays: 1,
      consistencyPercent: 100,
      metricCoverage: {
        potentialUnitCount: 2,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        coveragePercent: 50,
      },
    });
    expect(
      buildHabitDaySummary([uncertainHabit], oneCompletion, "2026-05-10", {
        dayStatuses,
      })
    ).toMatchObject({
      trackingState: "known",
      potentialPerfectDayItemCount: 1,
      perfectDayItemCount: 0,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: null,
      isPerfectDay: false,
      metricCoverage: {
        potentialUnitCount: 1,
        knownUnitCount: 0,
        successfulUnitCount: 0,
        state: "no_tracked_data",
      },
      items: [
        expect.objectContaining({
          trackingState: "incomplete",
          evaluation: expect.objectContaining({ stateLabel: "Tracking incomplete" }),
        }),
      ],
    });
    expect(
      buildHabitWeekSummary([uncertainHabit], oneCompletion, "2026-05-10", {
        dayStatuses,
      })
    ).toMatchObject({
      perfectDayCount: 1,
      averageCompletionPercent: 100,
      metricCoverage: {
        potentialUnitCount: 2,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        coveragePercent: 50,
        notTrackedDayCount: 1,
      },
    });

    const unreachableHabit = buildWeeklyHabit(3);
    const unreachable = buildHabitMotivationSummary(
      [unreachableHabit],
      oneCompletion,
      "2026-05-10",
      { dayStatuses }
    ).items[0];
    expect(unreachable).toMatchObject({
      potentialDayCount: 1,
      eligibleDayCount: 1,
      onTrackDayCount: 0,
      notTrackedDayCount: 1,
      unknownPeriodCount: 0,
      consistencyPercent: 0,
      metricCoverage: {
        performancePercent: 0,
        coveragePercent: 100,
        state: "available",
      },
    });
  });

  it.each([
    {
      cadencePeriod: "weekly" as const,
      historyStartDate: "2026-04-01",
      selectedDate: "2026-04-05",
      checkInDate: "2026-03-30",
      notTrackedDate: "2026-04-02",
    },
    {
      cadencePeriod: "monthly" as const,
      historyStartDate: "2026-03-30",
      selectedDate: "2026-04-05",
      checkInDate: "2026-03-15",
      notTrackedDate: "2026-03-30",
    },
  ])(
    "uses the full canonical $cadencePeriod any-day period when the Motivation range starts mid-period",
    ({ cadencePeriod, historyStartDate, selectedDate, checkInDate, notTrackedDate }) => {
      const habit = buildHabitDefinitionView(
        buildHabitRow({
          title: `${cadencePeriod} boundary habit`,
          start_date: "2026-01-01",
          cadence_period: cadencePeriod,
          cadence_target_count: 1,
          cadence_day_policy: "any",
        })
      );
      const checkIn = buildHabitCheckInView(
        buildCheckInRow({
          id: `${cadencePeriod}-before-range`,
          habit_id: habit.id,
          check_in_date: checkInDate,
        })
      );

      const item = buildHabitMotivationSummary([habit], [checkIn], selectedDate, {
        historyStartDate,
        dayStatuses: [{ reviewDate: notTrackedDate, dayStatus: "not_tracked" }],
      }).items[0];

      expect(item).toMatchObject({
        motivationStartDate: historyStartDate,
        potentialDayCount: 1,
        eligibleDayCount: 1,
        onTrackDayCount: 1,
        notTrackedDayCount: 1,
        unknownPeriodCount: 0,
        consistencyPercent: 100,
        currentStreakDays: 0,
        bestStreakDays: 0,
        metricCoverage: {
          potentialUnitCount: 1,
          knownUnitCount: 1,
          successfulUnitCount: 1,
          performancePercent: 100,
          coveragePercent: 100,
        },
      });
    }
  );

  it("does not pull pre-reset evidence into a cross-range any-day period", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Weekly reset boundary habit",
        start_date: "2026-01-01",
        cadence_period: "weekly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
      })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        id: "weekly-before-reset",
        habit_id: habit.id,
        check_in_date: "2026-03-30",
      })
    );
    const reset = buildHabitMotivationResetView(
      buildResetRow({
        habit_id: habit.id,
        effective_date: "2026-03-31",
      })
    );

    const item = buildHabitMotivationSummary([habit], [checkIn], "2026-04-05", {
      historyStartDate: "2026-04-01",
      resetEvents: [reset],
    }).items[0];

    expect(item).toMatchObject({
      motivationStartDate: "2026-04-01",
      potentialDayCount: 1,
      eligibleDayCount: 1,
      onTrackDayCount: 0,
      unknownPeriodCount: 0,
      consistencyPercent: 0,
      metricCoverage: {
        potentialUnitCount: 1,
        knownUnitCount: 1,
        successfulUnitCount: 0,
        performancePercent: 0,
        coveragePercent: 100,
      },
    });
  });

  it("keeps day-status evidence visible in an open any-day period without scoring it", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Weekly three",
        start_date: "2026-05-04",
        cadence_period: "weekly",
        cadence_target_count: 3,
        cadence_day_policy: "any",
      })
    );
    const summary = buildHabitMotivationSummary([habit], [], "2026-05-06", {
      dayStatuses: [{ reviewDate: "2026-05-05", dayStatus: "not_tracked" }],
    });

    expect(summary.items[0]).toMatchObject({
      potentialDayCount: 0,
      eligibleDayCount: 0,
      onTrackDayCount: 0,
      notTrackedDayCount: 1,
      unknownPeriodCount: 0,
      consistencyPercent: null,
      currentStreakDays: 0,
      bestStreakDays: 0,
    });

    const unsupportedSummary = buildHabitMotivationSummary([habit], [], "2026-05-06", {
      dayStatuses: [{ reviewDate: "2026-05-05", dayStatus: "unsupported" }],
    });
    expect(unsupportedSummary.items[0]?.metricCoverage.state).toBe("needs_review");

    const priorWeekHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Weekly three",
        start_date: "2026-04-27",
        cadence_period: "weekly",
        cadence_target_count: 3,
        cadence_day_policy: "any",
      })
    );
    const priorWeekCheckIns = ["2026-04-27", "2026-04-28", "2026-04-29"].map((checkInDate, index) =>
      buildHabitCheckInView(
        buildCheckInRow({ id: `prior-week-${index}`, check_in_date: checkInDate })
      )
    );
    const streakSummary = buildHabitMotivationSummary(
      [priorWeekHabit],
      priorWeekCheckIns,
      "2026-05-06",
      { dayStatuses: [{ reviewDate: "2026-05-05", dayStatus: "not_tracked" }] }
    );
    expect(streakSummary.items[0]).toMatchObject({
      potentialDayCount: 1,
      eligibleDayCount: 1,
      onTrackDayCount: 1,
      notTrackedDayCount: 1,
      currentStreakDays: 0,
      bestStreakDays: 1,
    });
  });

  it("does not call a mixed Perfect Day complete when an any-day item is unknown", () => {
    const weeklyHabit = buildHabitDefinitionView(
      buildHabitRow({
        id: "22222222-2222-4222-8222-222222222222",
        title: "Weekly twice",
        start_date: "2026-05-04",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
      })
    );
    const sundayHabit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Sunday reset",
        start_date: "2026-05-04",
        cadence_period: "weekly",
        cadence_target_count: 1,
        schedule_days: ["sunday"],
      })
    );
    const checkIns = [
      buildHabitCheckInView(
        buildCheckInRow({
          id: "weekly-monday",
          habit_id: weeklyHabit.id,
          check_in_date: "2026-05-04",
        })
      ),
      buildHabitCheckInView(
        buildCheckInRow({
          id: "daily-sunday",
          habit_id: sundayHabit.id,
          check_in_date: "2026-05-10",
        })
      ),
    ];
    const options = {
      dayStatuses: [{ reviewDate: "2026-05-06", dayStatus: "not_tracked" as const }],
    };

    const daySummary = buildHabitDaySummary(
      [weeklyHabit, sundayHabit],
      checkIns,
      "2026-05-10",
      options
    );
    expect(daySummary).toMatchObject({
      potentialPerfectDayItemCount: 2,
      perfectDayItemCount: 1,
      satisfiedPerfectDayItemCount: 1,
      completionPercent: 100,
      isPerfectDay: false,
      metricCoverage: {
        potentialUnitCount: 2,
        knownUnitCount: 1,
        successfulUnitCount: 1,
        coveragePercent: 50,
      },
    });
    expect(daySummary.items.find((item) => item.habit.id === weeklyHabit.id)).toMatchObject({
      trackingState: "incomplete",
    });

    const motivation = buildHabitMotivationSummary(
      [weeklyHabit, sundayHabit],
      checkIns,
      "2026-05-10",
      options
    );
    expect(motivation).toMatchObject({
      onTrackDayCount: 1,
      currentStreakDays: 0,
      bestStreakDays: 1,
    });
  });

  it("ignores day-status evidence from before an any-day Habit existed", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({
        title: "Weekend mobility",
        start_date: "2026-05-08",
        cadence_period: "weekly",
        cadence_target_count: 2,
        cadence_day_policy: "any",
      })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({
        id: "weekly-friday",
        habit_id: habit.id,
        check_in_date: "2026-05-08",
      })
    );
    const options = {
      dayStatuses: [{ reviewDate: "2026-05-05", dayStatus: "not_tracked" as const }],
    };

    const daySummary = buildHabitDaySummary([habit], [checkIn], "2026-05-10", options);
    expect(daySummary).toMatchObject({
      potentialPerfectDayItemCount: 1,
      perfectDayItemCount: 1,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: 0,
      isPerfectDay: false,
      metricCoverage: {
        potentialUnitCount: 1,
        knownUnitCount: 1,
        successfulUnitCount: 0,
        coveragePercent: 100,
      },
    });
    expect(daySummary.items[0]).toMatchObject({ trackingState: "known" });

    expect(
      buildHabitMotivationSummary([habit], [checkIn], "2026-05-10", options).items[0]
    ).toMatchObject({
      potentialDayCount: 1,
      eligibleDayCount: 1,
      onTrackDayCount: 0,
      notTrackedDayCount: 0,
      unknownPeriodCount: 0,
      consistencyPercent: 0,
    });
  });

  it("keeps supported not-tracked days out of absence-review candidates", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({ title: "Read", start_date: "2026-05-05" })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({ id: "recovery-history", check_in_date: "2026-05-05" })
    );
    const dayStatuses = [{ reviewDate: "2026-05-06", dayStatus: "not_tracked" as const }];
    const weekSummary = buildHabitWeekSummary([habit], [checkIn], "2026-05-10", {
      dayStatuses,
    });
    const motivationSummary = buildHabitMotivationSummary([habit], [checkIn], "2026-05-10", {
      dayStatuses,
    });
    const snapshot: HabitSnapshot = {
      schemaReady: true,
      loadError: null,
      selectedDate: "2026-05-10",
      activeHabits: [habit],
      archivedHabits: [],
      unsupportedHabits: [],
      daySummary: weekSummary.days.find((day) => day.date === "2026-05-10")!,
      weekSummary,
      dayStatuses,
      motivationSummary,
      motivationSummaries: { all: motivationSummary },
    };

    expect(getHabitAbsenceReviewCandidateDates(snapshot, "2026-05-10")).toEqual([
      "2026-05-07",
      "2026-05-08",
      "2026-05-09",
    ]);
  });

  it("keeps unknown future day statuses fail-closed in metrics and absence review", () => {
    const habit = buildHabitDefinitionView(
      buildHabitRow({ title: "Read", start_date: "2026-05-05" })
    );
    const checkIn = buildHabitCheckInView(
      buildCheckInRow({ id: "recovery-history", check_in_date: "2026-05-05" })
    );
    const unsupportedStatus = buildHabitDayStatusView({
      reviewDate: "2026-05-06",
      dayStatus: "future_private_status",
    });
    expect(unsupportedStatus).not.toBeNull();
    if (!unsupportedStatus) return;

    const weekSummary = buildHabitWeekSummary([habit], [checkIn], "2026-05-10", {
      dayStatuses: [unsupportedStatus],
    });
    const motivationSummary = buildHabitMotivationSummary([habit], [checkIn], "2026-05-10", {
      dayStatuses: [unsupportedStatus],
    });
    const snapshot: HabitSnapshot = {
      schemaReady: true,
      loadError: null,
      selectedDate: "2026-05-10",
      activeHabits: [habit],
      archivedHabits: [],
      unsupportedHabits: [],
      daySummary: weekSummary.days.find((day) => day.date === "2026-05-10")!,
      weekSummary,
      dayStatuses: [unsupportedStatus],
      motivationSummary,
      motivationSummaries: { all: motivationSummary },
    };

    expect(weekSummary.days.find((day) => day.date === "2026-05-06")).toMatchObject({
      trackingState: "needs_review",
      completionPercent: null,
      metricCoverage: { state: "needs_review" },
    });
    expect(weekSummary.averageCompletionPercent).toBeNull();
    expect(getHabitAbsenceReviewCandidateDates(snapshot, "2026-05-10")).toEqual([
      "2026-05-06",
      "2026-05-07",
      "2026-05-08",
      "2026-05-09",
    ]);
  });
});
