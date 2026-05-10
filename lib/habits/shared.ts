import type { Database } from "@/types/database";

export const HABIT_TYPE_VALUES = [
  "binary",
  "count",
  "duration",
  "time_of_day",
  "avoidance",
] as const;
export const HABIT_CATEGORY_VALUES = [
  "movement",
  "nutrition",
  "recovery",
  "learning",
  "training",
  "other",
] as const;
export const HABIT_OPERATOR_VALUES = ["at_least", "at_most", "before", "after"] as const;
export const HABIT_UNIT_VALUES = [
  "times",
  "minutes",
  "seconds",
  "steps",
  "pages",
  "glasses",
  "custom",
] as const;
export const HABIT_WEEKDAY_VALUES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type HabitType = (typeof HABIT_TYPE_VALUES)[number];
export type HabitCategory = (typeof HABIT_CATEGORY_VALUES)[number];
export type HabitOperator = (typeof HABIT_OPERATOR_VALUES)[number];
export type HabitUnit = (typeof HABIT_UNIT_VALUES)[number];
export type HabitWeekday = (typeof HABIT_WEEKDAY_VALUES)[number];
export type HabitStatus = "active" | "archived";

export type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];
export type HabitDefinitionInsert = Database["public"]["Tables"]["habit_definitions"]["Insert"];
export type HabitDefinitionUpdate = Database["public"]["Tables"]["habit_definitions"]["Update"];
export type HabitCheckInRow = Database["public"]["Tables"]["habit_check_ins"]["Row"];
export type HabitCheckInInsert = Database["public"]["Tables"]["habit_check_ins"]["Insert"];

export type HabitDefinitionView = {
  id: string;
  title: string;
  notes: string | null;
  habitType: HabitType;
  category: HabitCategory;
  targetOperator: HabitOperator;
  targetValueNumeric: number | null;
  targetUnit: HabitUnit | null;
  targetTime: string | null;
  targetLabel: string;
  scheduleDays: HabitWeekday[];
  isPerfectDayItem: boolean;
  status: HabitStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HabitCheckInView = {
  id: string;
  habitId: string;
  checkInDate: string;
  timezone: string;
  valueNumeric: number | null;
  valueBoolean: boolean | null;
  valueTime: string | null;
  note: string | null;
  status: "logged" | "skipped";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HabitEvaluation = {
  isSatisfied: boolean;
  valueLabel: string;
  stateLabel: string;
  progressRatio: number;
};

export type HabitDayItem = {
  habit: HabitDefinitionView;
  checkIn: HabitCheckInView | null;
  evaluation: HabitEvaluation;
};

export type HabitDaySummary = {
  date: string;
  scheduledHabitCount: number;
  perfectDayItemCount: number;
  satisfiedPerfectDayItemCount: number;
  completionPercent: number;
  isPerfectDay: boolean;
  completedDurationMinutes: number;
  completedCountTotal: number;
  items: HabitDayItem[];
};

export type HabitWeekSummary = {
  days: HabitDaySummary[];
  perfectDayCount: number;
  averageCompletionPercent: number;
  totalDurationMinutes: number;
  totalCount: number;
};

export type HabitSnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  selectedDate: string;
  activeHabits: HabitDefinitionView[];
  archivedHabits: HabitDefinitionView[];
  daySummary: HabitDaySummary;
  weekSummary: HabitWeekSummary;
};

export type HabitCreateRequestBody = {
  title?: unknown;
  notes?: unknown;
  habitType?: unknown;
  category?: unknown;
  targetValueNumeric?: unknown;
  targetUnit?: unknown;
  targetTime?: unknown;
  scheduleDays?: unknown;
  isPerfectDayItem?: unknown;
  selectedDate?: unknown;
};

export type HabitUpdateRequestBody = Partial<HabitCreateRequestBody> & {
  status?: unknown;
};

export type HabitCheckInRequestBody = {
  habitId?: unknown;
  checkInDate?: unknown;
  timezone?: unknown;
  valueNumeric?: unknown;
  valueBoolean?: unknown;
  valueTime?: unknown;
  note?: unknown;
  status?: unknown;
  clear?: unknown;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(?::\d{2})?$/;
const DEFAULT_WEEKDAYS: HabitWeekday[] = [...HABIT_WEEKDAY_VALUES];

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeOptionalText(value: unknown, maxLength: number): string | null {
  const normalized = normalizeText(value, maxLength);
  return normalized;
}

export function normalizeHabitDate(value: unknown, fallback = new Date()): string {
  if (typeof value === "string" && DATE_PATTERN.test(value)) return value;
  return fallback.toISOString().slice(0, 10);
}

export function normalizeHabitTimezone(value: unknown): string {
  const normalized = normalizeText(value, 80);
  return normalized ?? "UTC";
}

export function normalizeHabitTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!TIME_PATTERN.test(trimmed)) return null;
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
}

function normalizePositiveNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  if (numeric < 0 || numeric > 10000) return null;
  return Math.round(numeric * 100) / 100;
}

function normalizeScheduleDays(value: unknown): HabitWeekday[] {
  if (!Array.isArray(value)) return DEFAULT_WEEKDAYS;
  const days = value.filter((day): day is HabitWeekday => isOneOf(HABIT_WEEKDAY_VALUES, day));
  return days.length > 0 ? Array.from(new Set(days)) : DEFAULT_WEEKDAYS;
}

function getHabitType(value: unknown): HabitType {
  return isOneOf(HABIT_TYPE_VALUES, value) ? value : "binary";
}

function getHabitCategory(value: unknown): HabitCategory {
  return isOneOf(HABIT_CATEGORY_VALUES, value) ? value : "other";
}

function getHabitShape(
  habitType: HabitType,
  targetValueNumeric: unknown,
  targetUnit: unknown,
  targetTime: unknown
) {
  if (habitType === "binary") {
    return {
      targetOperator: "at_least" as const,
      targetValueNumeric: null,
      targetUnit: null,
      targetTime: null,
    };
  }

  if (habitType === "time_of_day") {
    const time = normalizeHabitTime(targetTime);
    if (!time) throw new Error("Choose a target time.");
    return {
      targetOperator: "before" as const,
      targetValueNumeric: null,
      targetUnit: null,
      targetTime: time,
    };
  }

  const value = normalizePositiveNumber(targetValueNumeric);
  if (value === null) {
    throw new Error("Choose a numeric target.");
  }

  const unit = isOneOf(HABIT_UNIT_VALUES, targetUnit)
    ? targetUnit
    : habitType === "duration"
      ? "minutes"
      : "times";

  return {
    targetOperator: habitType === "avoidance" ? ("at_most" as const) : ("at_least" as const),
    targetValueNumeric: value,
    targetUnit: unit,
    targetTime: null,
  };
}

export function buildHabitDefinitionInsert(
  userId: string,
  body: HabitCreateRequestBody,
  sortOrder: number
): HabitDefinitionInsert {
  const title = normalizeText(body.title, 80);
  if (!title || title.length < 2) {
    throw new Error("Give the habit a short name.");
  }

  const habitType = getHabitType(body.habitType);
  const shape = getHabitShape(habitType, body.targetValueNumeric, body.targetUnit, body.targetTime);

  return {
    user_id: userId,
    title,
    notes: normalizeOptionalText(body.notes, 280),
    habit_type: habitType,
    category: getHabitCategory(body.category),
    target_operator: shape.targetOperator,
    target_value_numeric: shape.targetValueNumeric,
    target_unit: shape.targetUnit,
    target_time: shape.targetTime,
    schedule_days: normalizeScheduleDays(body.scheduleDays),
    is_perfect_day_item: body.isPerfectDayItem === false ? false : true,
    status: "active",
    sort_order: Math.max(0, Math.min(1000, sortOrder)),
  };
}

export function buildHabitDefinitionUpdate(body: HabitUpdateRequestBody): HabitDefinitionUpdate {
  const update: HabitDefinitionUpdate = {};

  if ("title" in body) {
    const title = normalizeText(body.title, 80);
    if (!title || title.length < 2) throw new Error("Give the habit a short name.");
    update.title = title;
  }

  if ("notes" in body) {
    update.notes = normalizeOptionalText(body.notes, 280);
  }

  if ("category" in body) {
    update.category = getHabitCategory(body.category);
  }

  if ("scheduleDays" in body) {
    update.schedule_days = normalizeScheduleDays(body.scheduleDays);
  }

  if ("isPerfectDayItem" in body) {
    update.is_perfect_day_item = body.isPerfectDayItem === false ? false : true;
  }

  if ("status" in body) {
    update.status = body.status === "archived" ? "archived" : "active";
  }

  if (
    "habitType" in body ||
    "targetValueNumeric" in body ||
    "targetUnit" in body ||
    "targetTime" in body
  ) {
    const habitType = getHabitType(body.habitType);
    const shape = getHabitShape(
      habitType,
      body.targetValueNumeric,
      body.targetUnit,
      body.targetTime
    );
    update.habit_type = habitType;
    update.target_operator = shape.targetOperator;
    update.target_value_numeric = shape.targetValueNumeric;
    update.target_unit = shape.targetUnit;
    update.target_time = shape.targetTime;
  }

  return update;
}

export function buildHabitCheckInInsert(
  userId: string,
  body: HabitCheckInRequestBody,
  now = new Date()
): HabitCheckInInsert {
  const habitId = normalizeText(body.habitId, 80);
  if (!habitId) throw new Error("Choose a habit.");

  const valueNumeric = normalizePositiveNumber(body.valueNumeric);
  const valueBoolean = typeof body.valueBoolean === "boolean" ? body.valueBoolean : null;
  const valueTime = normalizeHabitTime(body.valueTime);
  const note = normalizeOptionalText(body.note, 280);

  if (body.status !== "skipped" && valueNumeric === null && valueBoolean === null && !valueTime) {
    throw new Error("Add a check-in value.");
  }

  return {
    user_id: userId,
    habit_id: habitId,
    check_in_date: normalizeHabitDate(body.checkInDate, now),
    timezone: normalizeHabitTimezone(body.timezone),
    value_numeric: valueNumeric,
    value_boolean: valueBoolean,
    value_time: valueTime,
    note,
    status: body.status === "skipped" ? "skipped" : "logged",
    completed_at: body.status === "skipped" ? null : now.toISOString(),
  };
}

export function buildHabitDefinitionView(row: HabitDefinitionRow): HabitDefinitionView {
  const habitType = getHabitType(row.habit_type);
  const targetOperator = isOneOf(HABIT_OPERATOR_VALUES, row.target_operator)
    ? row.target_operator
    : "at_least";
  const targetUnit = isOneOf(HABIT_UNIT_VALUES, row.target_unit) ? row.target_unit : null;

  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    habitType,
    category: getHabitCategory(row.category),
    targetOperator,
    targetValueNumeric:
      typeof row.target_value_numeric === "number" ? row.target_value_numeric : null,
    targetUnit,
    targetTime: row.target_time,
    targetLabel: buildTargetLabel({
      habitType,
      targetOperator,
      targetValueNumeric:
        typeof row.target_value_numeric === "number" ? row.target_value_numeric : null,
      targetUnit,
      targetTime: row.target_time,
    }),
    scheduleDays: normalizeScheduleDays(row.schedule_days),
    isPerfectDayItem: row.is_perfect_day_item,
    status: row.status === "archived" ? "archived" : "active",
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildHabitCheckInView(row: HabitCheckInRow): HabitCheckInView {
  return {
    id: row.id,
    habitId: row.habit_id,
    checkInDate: row.check_in_date,
    timezone: row.timezone,
    valueNumeric: typeof row.value_numeric === "number" ? row.value_numeric : null,
    valueBoolean: row.value_boolean,
    valueTime: row.value_time,
    note: row.note,
    status: row.status === "skipped" ? "skipped" : "logged",
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildTargetLabel(input: {
  habitType: HabitType;
  targetOperator: HabitOperator;
  targetValueNumeric: number | null;
  targetUnit: HabitUnit | null;
  targetTime: string | null;
}) {
  if (input.habitType === "binary") return "Done once";
  if (input.habitType === "time_of_day") {
    const time = input.targetTime?.slice(0, 5) ?? "";
    return input.targetOperator === "after" ? `After ${time}` : `Before ${time}`;
  }

  const operator = input.targetOperator === "at_most" ? "Max" : "At least";
  const value = input.targetValueNumeric ?? 0;
  const unit = input.targetUnit ?? "times";
  return `${operator} ${value} ${unit}`;
}

function compareTime(valueTime: string, targetTime: string, operator: HabitOperator) {
  const value = valueTime.slice(0, 5);
  const target = targetTime.slice(0, 5);
  return operator === "after" ? value >= target : value <= target;
}

export function evaluateHabitForDate(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null
): HabitEvaluation {
  if (!checkIn || checkIn.status === "skipped") {
    return {
      isSatisfied: false,
      valueLabel: "No check-in",
      stateLabel: checkIn?.status === "skipped" ? "Skipped" : "Open",
      progressRatio: 0,
    };
  }

  if (habit.habitType === "binary") {
    const isSatisfied = checkIn.valueBoolean === true;
    return {
      isSatisfied,
      valueLabel: isSatisfied ? "Done" : "Open",
      stateLabel: isSatisfied ? "Counts today" : "Open",
      progressRatio: isSatisfied ? 1 : 0,
    };
  }

  if (habit.habitType === "time_of_day") {
    const valueTime = checkIn.valueTime;
    const targetTime = habit.targetTime;
    const isSatisfied = Boolean(
      valueTime && targetTime && compareTime(valueTime, targetTime, habit.targetOperator)
    );
    return {
      isSatisfied,
      valueLabel: valueTime ? valueTime.slice(0, 5) : "No time",
      stateLabel: isSatisfied ? "On target" : "Logged",
      progressRatio: isSatisfied ? 1 : 0,
    };
  }

  const value = checkIn.valueNumeric ?? 0;
  const target = habit.targetValueNumeric ?? 0;
  const isSatisfied =
    habit.targetOperator === "at_most"
      ? value <= target
      : target <= 0
        ? value > 0
        : value >= target;
  const ratio =
    habit.targetOperator === "at_most"
      ? isSatisfied
        ? 1
        : 0
      : target <= 0
        ? value > 0
          ? 1
          : 0
        : Math.max(0, Math.min(1, value / target));

  return {
    isSatisfied,
    valueLabel: `${value} ${habit.targetUnit ?? "times"}`,
    stateLabel: isSatisfied ? "On target" : "Logged",
    progressRatio: ratio,
  };
}

export function isHabitScheduledForDate(habit: HabitDefinitionView, date: string): boolean {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return true;
  const weekday = HABIT_WEEKDAY_VALUES[(new Date(parsed).getUTCDay() + 6) % 7];
  return habit.scheduleDays.includes(weekday);
}

export function buildHabitDaySummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  date: string
): HabitDaySummary {
  const checkInByHabitId = new Map(checkIns.map((checkIn) => [checkIn.habitId, checkIn]));
  const scheduledHabits = habits.filter((habit) => isHabitScheduledForDate(habit, date));
  const items = scheduledHabits.map((habit) => {
    const checkIn = checkInByHabitId.get(habit.id) ?? null;
    return {
      habit,
      checkIn,
      evaluation: evaluateHabitForDate(habit, checkIn),
    };
  });
  const perfectDayItems = items.filter((item) => item.habit.isPerfectDayItem);
  const satisfiedPerfectDayItemCount = perfectDayItems.filter(
    (item) => item.evaluation.isSatisfied
  ).length;
  const perfectDayItemCount = perfectDayItems.length;
  const completedDurationMinutes = items.reduce((total, item) => {
    if (!item.evaluation.isSatisfied || item.habit.habitType !== "duration") return total;
    return total + (item.checkIn?.valueNumeric ?? 0);
  }, 0);
  const completedCountTotal = items.reduce((total, item) => {
    if (!item.evaluation.isSatisfied || item.habit.habitType !== "count") return total;
    return total + (item.checkIn?.valueNumeric ?? 0);
  }, 0);

  return {
    date,
    scheduledHabitCount: scheduledHabits.length,
    perfectDayItemCount,
    satisfiedPerfectDayItemCount,
    completionPercent:
      perfectDayItemCount > 0
        ? Math.round((satisfiedPerfectDayItemCount / perfectDayItemCount) * 100)
        : 0,
    isPerfectDay: perfectDayItemCount > 0 && satisfiedPerfectDayItemCount === perfectDayItemCount,
    completedDurationMinutes,
    completedCountTotal,
    items,
  };
}

export function buildHabitWeekSummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  selectedDate: string
): HabitWeekSummary {
  const selected = Date.parse(`${selectedDate}T00:00:00.000Z`);
  const baseDate = Number.isNaN(selected) ? new Date() : new Date(selected);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setUTCDate(baseDate.getUTCDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    return buildHabitDaySummary(
      habits,
      checkIns.filter((checkIn) => checkIn.checkInDate === dateKey),
      dateKey
    );
  });
  const daysWithItems = days.filter((day) => day.perfectDayItemCount > 0);

  return {
    days,
    perfectDayCount: days.filter((day) => day.isPerfectDay).length,
    averageCompletionPercent:
      daysWithItems.length > 0
        ? Math.round(
            daysWithItems.reduce((total, day) => total + day.completionPercent, 0) /
              daysWithItems.length
          )
        : 0,
    totalDurationMinutes: days.reduce((total, day) => total + day.completedDurationMinutes, 0),
    totalCount: days.reduce((total, day) => total + day.completedCountTotal, 0),
  };
}
