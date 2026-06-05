import type { Database } from "@/types/database";

export const HABIT_TYPE_VALUES = [
  "binary",
  "count",
  "duration",
  "time_of_day",
  "avoidance",
] as const;
export const HABIT_MODE_VALUES = ["build", "quit", "timed"] as const;
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
  "litres",
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
export const HABIT_CADENCE_PERIOD_VALUES = ["daily", "weekly", "monthly"] as const;
export const HABIT_CADENCE_DAY_POLICY_VALUES = ["any", "fixed"] as const;
export const HABIT_TIMER_MAX_SECONDS = 86_400;
export const HABIT_MANUAL_TIME_MAX_MINUTES = 1_440;

export type HabitType = (typeof HABIT_TYPE_VALUES)[number];
export type HabitMode = (typeof HABIT_MODE_VALUES)[number];
export type HabitCategory = (typeof HABIT_CATEGORY_VALUES)[number];
export type HabitOperator = (typeof HABIT_OPERATOR_VALUES)[number];
export type HabitUnit = (typeof HABIT_UNIT_VALUES)[number];
export type HabitWeekday = (typeof HABIT_WEEKDAY_VALUES)[number];
export type HabitCadencePeriod = (typeof HABIT_CADENCE_PERIOD_VALUES)[number];
export type HabitCadenceDayPolicy = (typeof HABIT_CADENCE_DAY_POLICY_VALUES)[number];
export type HabitStatus = "active" | "archived";

export type HabitCadenceProgress = {
  periodStart: string;
  periodEnd: string;
  periodLabel: "today" | "this week" | "this month";
  completedCount: number;
  targetCount: number;
  remainingCount: number;
  isTargetMet: boolean;
  isDueToday: boolean;
};

export type HabitPriorityGroup =
  | "due_build"
  | "due_timed"
  | "due_weekly"
  | "due_monthly"
  | "quit_status"
  | "rest_day"
  | "done_today"
  | "done_period"
  | "not_due"
  | "archived";

export type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];
export type HabitDefinitionInsert = Database["public"]["Tables"]["habit_definitions"]["Insert"];
export type HabitDefinitionUpdate = Database["public"]["Tables"]["habit_definitions"]["Update"];
export type HabitCheckInRow = Database["public"]["Tables"]["habit_check_ins"]["Row"];
export type HabitCheckInInsert = Database["public"]["Tables"]["habit_check_ins"]["Insert"];

export type HabitDefinitionView = {
  id: string;
  title: string;
  notes: string | null;
  habitMode: HabitMode;
  habitType: HabitType;
  category: HabitCategory;
  targetOperator: HabitOperator;
  targetValueNumeric: number | null;
  targetUnit: HabitUnit | null;
  targetTime: string | null;
  targetLabel: string;
  startDate: string;
  lastLapseDate: string | null;
  timerEnabled: boolean;
  timerTargetSeconds: number | null;
  cadencePeriod: HabitCadencePeriod;
  cadenceTargetCount: number;
  cadenceDayPolicy: HabitCadenceDayPolicy;
  cadenceLabel: string;
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
  timerSeconds: number;
  manualMinutes: number;
  legacyTimedSeconds: number;
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
  supportingLabel: string | null;
  progressRatio: number;
};

export type HabitDayItem = {
  habit: HabitDefinitionView;
  checkIn: HabitCheckInView | null;
  evaluation: HabitEvaluation;
  cadenceProgress: HabitCadenceProgress;
  isScheduledForDate: boolean;
  priorityGroup: HabitPriorityGroup;
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
  habitMode?: unknown;
  habitType?: unknown;
  category?: unknown;
  targetValueNumeric?: unknown;
  targetUnit?: unknown;
  targetTime?: unknown;
  startDate?: unknown;
  timerEnabled?: unknown;
  timerTargetSeconds?: unknown;
  cadencePeriod?: unknown;
  cadenceTargetCount?: unknown;
  cadenceDayPolicy?: unknown;
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
  timerSeconds?: unknown;
  manualMinutes?: unknown;
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

function normalizeIntegerInRange(
  value: unknown,
  min: number,
  max: number,
  errorMessage: string
): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < min || numeric > max) {
    throw new Error(errorMessage);
  }
  return numeric;
}

export function buildTimedTotalMinutes(timerSeconds: number, manualMinutes: number): number {
  const totalSeconds = Math.max(0, timerSeconds) + Math.max(0, manualMinutes) * 60;
  return Math.round((totalSeconds / 60) * 100) / 100;
}

function normalizeScheduleDays(value: unknown): HabitWeekday[] {
  if (!Array.isArray(value)) return DEFAULT_WEEKDAYS;
  const days = value.filter((day): day is HabitWeekday => isOneOf(HABIT_WEEKDAY_VALUES, day));
  return days.length > 0 ? Array.from(new Set(days)) : DEFAULT_WEEKDAYS;
}

function clampInteger(value: unknown, min: number, max: number): number | null {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function getLegacyCadencePeriod(scheduleDays: HabitWeekday[]): HabitCadencePeriod {
  return scheduleDays.length >= 7 ? "daily" : "weekly";
}

function getCadencePeriod(value: unknown, scheduleDays: HabitWeekday[]): HabitCadencePeriod {
  if (isOneOf(HABIT_CADENCE_PERIOD_VALUES, value)) return value;
  return getLegacyCadencePeriod(scheduleDays);
}

function getCadenceDayPolicy(
  value: unknown,
  cadencePeriod: HabitCadencePeriod,
  scheduleDays: HabitWeekday[]
): HabitCadenceDayPolicy {
  if (cadencePeriod === "daily") return "fixed";
  if (isOneOf(HABIT_CADENCE_DAY_POLICY_VALUES, value)) return value;
  return scheduleDays.length >= 7 && cadencePeriod !== "weekly" ? "any" : "fixed";
}

function normalizeCadenceTargetCount(
  value: unknown,
  cadencePeriod: HabitCadencePeriod,
  cadenceDayPolicy: HabitCadenceDayPolicy,
  scheduleDays: HabitWeekday[]
): number {
  if (cadencePeriod === "daily") return 1;
  if (cadenceDayPolicy === "fixed") return Math.max(1, Math.min(7, scheduleDays.length));
  const max = cadencePeriod === "monthly" ? 31 : 7;
  return clampInteger(value, 1, max) ?? 1;
}

function normalizeCadenceInput(body: {
  cadencePeriod?: unknown;
  cadenceTargetCount?: unknown;
  cadenceDayPolicy?: unknown;
  scheduleDays?: unknown;
}) {
  const requestedScheduleDays = normalizeScheduleDays(body.scheduleDays);
  const cadencePeriod = getCadencePeriod(body.cadencePeriod, requestedScheduleDays);
  const cadenceDayPolicy = getCadenceDayPolicy(
    body.cadenceDayPolicy,
    cadencePeriod,
    requestedScheduleDays
  );

  if (cadencePeriod === "monthly" && cadenceDayPolicy === "fixed") {
    throw new Error("Monthly fixed dates are not available yet.");
  }

  const scheduleDays =
    cadencePeriod === "daily" || cadenceDayPolicy === "any"
      ? [...DEFAULT_WEEKDAYS]
      : requestedScheduleDays;
  const cadenceTargetCount = normalizeCadenceTargetCount(
    body.cadenceTargetCount,
    cadencePeriod,
    cadenceDayPolicy,
    scheduleDays
  );

  return {
    cadencePeriod,
    cadenceTargetCount,
    cadenceDayPolicy,
    scheduleDays,
  };
}

function getHabitType(value: unknown): HabitType {
  return isOneOf(HABIT_TYPE_VALUES, value) ? value : "binary";
}

function getHabitMode(
  value: unknown,
  input?: { habitType?: HabitType; timerEnabled?: unknown }
): HabitMode {
  if (isOneOf(HABIT_MODE_VALUES, value)) return value;
  if (input?.timerEnabled === true && input.habitType === "duration") return "timed";
  return "build";
}

function getHabitCategory(value: unknown): HabitCategory {
  return isOneOf(HABIT_CATEGORY_VALUES, value) ? value : "other";
}

function buildUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function getSelectedDateFallback(value: unknown): Date {
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }
  return buildUtcDate(normalizeHabitDate(value));
}

function normalizeHabitStartDate(value: unknown, selectedDate: string): string {
  return normalizeHabitDate(value, buildUtcDate(selectedDate));
}

function isAfterHabitDate(left: string, right: string) {
  return left > right;
}

function getDayDelta(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  const end = Date.parse(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

function addUtcDays(dateKey: string, days: number): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getCalendarWeekStartDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function getCalendarWeekEndDate(dateKey: string): string {
  return addUtcDays(getCalendarWeekStartDate(dateKey), 6);
}

function getCalendarMonthStartDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

function getCalendarMonthEndDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
}

function getHabitCadenceWindow(habit: HabitDefinitionView, date: string) {
  if (habit.cadencePeriod === "monthly") {
    return {
      periodStart: getCalendarMonthStartDate(date),
      periodEnd: getCalendarMonthEndDate(date),
      periodLabel: "this month" as const,
    };
  }

  if (habit.cadencePeriod === "weekly") {
    return {
      periodStart: getCalendarWeekStartDate(date),
      periodEnd: getCalendarWeekEndDate(date),
      periodLabel: "this week" as const,
    };
  }

  return {
    periodStart: date,
    periodEnd: date,
    periodLabel: "today" as const,
  };
}

function isWithinDateRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function getWeekdayForHabitDate(date: string): HabitWeekday | null {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return null;
  return HABIT_WEEKDAY_VALUES[(new Date(parsed).getUTCDay() + 6) % 7] ?? null;
}

function normalizeTimerTargetSeconds(
  habitMode: HabitMode,
  targetValueNumeric: number | null,
  targetUnit: HabitUnit | null,
  explicitSeconds: unknown
): number | null {
  if (habitMode !== "timed") return null;

  const explicit =
    typeof explicitSeconds === "number"
      ? explicitSeconds
      : typeof explicitSeconds === "string"
        ? Number(explicitSeconds)
        : Number.NaN;
  if (Number.isFinite(explicit) && explicit >= 1 && explicit <= 86400) {
    return Math.round(explicit);
  }

  if (targetValueNumeric === null) return null;
  const seconds = targetUnit === "seconds" ? targetValueNumeric : targetValueNumeric * 60;
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 86400) return null;
  return Math.round(seconds);
}

function getHabitShape(
  habitMode: HabitMode,
  habitType: HabitType,
  targetValueNumeric: unknown,
  targetUnit: unknown,
  targetTime: unknown
) {
  if (habitMode === "quit") {
    return {
      habitType: "avoidance" as const,
      targetOperator: "at_most" as const,
      targetValueNumeric: 0,
      targetUnit: "times" as const,
      targetTime: null,
    };
  }

  if (habitMode === "timed") {
    const value = normalizePositiveNumber(targetValueNumeric);
    if (value === null || value <= 0) {
      throw new Error("Choose a timer target.");
    }

    const unit = targetUnit === "seconds" ? "seconds" : "minutes";
    return {
      habitType: "duration" as const,
      targetOperator: "at_least" as const,
      targetValueNumeric: value,
      targetUnit: unit,
      targetTime: null,
    };
  }

  if (habitType === "binary") {
    return {
      habitType,
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
      habitType,
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
    habitType,
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

  const selectedDate = normalizeHabitDate(body.selectedDate);
  const requestedHabitType = getHabitType(body.habitType);
  const habitMode = getHabitMode(body.habitMode, {
    habitType: requestedHabitType,
    timerEnabled: body.timerEnabled,
  });
  const startDate = normalizeHabitStartDate(body.startDate, selectedDate);
  if (isAfterHabitDate(startDate, selectedDate)) {
    throw new Error("Choose today or an earlier start date.");
  }

  const shape = getHabitShape(
    habitMode,
    requestedHabitType,
    body.targetValueNumeric,
    body.targetUnit,
    body.targetTime
  );
  const timerTargetSeconds = normalizeTimerTargetSeconds(
    habitMode,
    shape.targetValueNumeric,
    shape.targetUnit as HabitUnit | null,
    body.timerTargetSeconds
  );
  if (habitMode === "timed" && timerTargetSeconds === null) {
    throw new Error("Choose a timer target.");
  }
  const cadence = normalizeCadenceInput(body);

  return {
    user_id: userId,
    title,
    notes: normalizeOptionalText(body.notes, 280),
    habit_mode: habitMode,
    habit_type: shape.habitType,
    category: getHabitCategory(body.category),
    target_operator: shape.targetOperator,
    target_value_numeric: shape.targetValueNumeric,
    target_unit: shape.targetUnit,
    target_time: shape.targetTime,
    start_date: startDate,
    last_lapse_date: null,
    timer_enabled: habitMode === "timed",
    timer_target_seconds: timerTargetSeconds,
    cadence_period: cadence.cadencePeriod,
    cadence_target_count: cadence.cadenceTargetCount,
    cadence_day_policy: cadence.cadenceDayPolicy,
    schedule_days: cadence.scheduleDays,
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

  if (
    "scheduleDays" in body ||
    "cadencePeriod" in body ||
    "cadenceTargetCount" in body ||
    "cadenceDayPolicy" in body
  ) {
    const cadence = normalizeCadenceInput(body);
    update.cadence_period = cadence.cadencePeriod;
    update.cadence_target_count = cadence.cadenceTargetCount;
    update.cadence_day_policy = cadence.cadenceDayPolicy;
    update.schedule_days = cadence.scheduleDays;
  }

  if ("isPerfectDayItem" in body) {
    update.is_perfect_day_item = body.isPerfectDayItem === false ? false : true;
  }

  if ("startDate" in body) {
    const selectedDate = normalizeHabitDate(body.selectedDate);
    const startDate = normalizeHabitStartDate(body.startDate, selectedDate);
    if (isAfterHabitDate(startDate, selectedDate)) {
      throw new Error("Choose today or an earlier start date.");
    }
    update.start_date = startDate;
  }

  if ("status" in body) {
    update.status = body.status === "archived" ? "archived" : "active";
  }

  if (
    "habitType" in body ||
    "targetValueNumeric" in body ||
    "targetUnit" in body ||
    "targetTime" in body ||
    "habitMode" in body ||
    "timerEnabled" in body ||
    "timerTargetSeconds" in body
  ) {
    const requestedHabitType = getHabitType(body.habitType);
    const habitMode = getHabitMode(body.habitMode, {
      habitType: requestedHabitType,
      timerEnabled: body.timerEnabled,
    });
    const shape = getHabitShape(
      habitMode,
      requestedHabitType,
      body.targetValueNumeric,
      body.targetUnit,
      body.targetTime
    );
    const timerTargetSeconds = normalizeTimerTargetSeconds(
      habitMode,
      shape.targetValueNumeric,
      shape.targetUnit as HabitUnit | null,
      body.timerTargetSeconds
    );
    if (habitMode === "timed" && timerTargetSeconds === null) {
      throw new Error("Choose a timer target.");
    }
    update.habit_mode = habitMode;
    update.habit_type = shape.habitType;
    update.target_operator = shape.targetOperator;
    update.target_value_numeric = shape.targetValueNumeric;
    update.target_unit = shape.targetUnit;
    update.target_time = shape.targetTime;
    update.timer_enabled = habitMode === "timed";
    update.timer_target_seconds = timerTargetSeconds;
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

  const hasTimerSeconds = "timerSeconds" in body;
  const hasManualMinutes = "manualMinutes" in body;
  const hasTimedSourceValues = hasTimerSeconds || hasManualMinutes;
  const timerSeconds = hasTimerSeconds
    ? normalizeIntegerInRange(
        body.timerSeconds,
        0,
        HABIT_TIMER_MAX_SECONDS,
        "Timer time must be whole seconds between 0 and 86400."
      )
    : 0;
  const manualMinutes = hasManualMinutes
    ? normalizeIntegerInRange(
        body.manualMinutes,
        0,
        HABIT_MANUAL_TIME_MAX_MINUTES,
        "Manual time must be whole minutes between 0 and 1440."
      )
    : 0;
  const valueNumeric = hasTimedSourceValues
    ? buildTimedTotalMinutes(timerSeconds, manualMinutes)
    : normalizePositiveNumber(body.valueNumeric);
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
    timer_seconds: body.status === "skipped" ? 0 : timerSeconds,
    manual_minutes: body.status === "skipped" ? 0 : manualMinutes,
    note,
    status: body.status === "skipped" ? "skipped" : "logged",
    completed_at: body.status === "skipped" ? null : now.toISOString(),
  };
}

export function buildHabitDefinitionView(row: HabitDefinitionRow): HabitDefinitionView {
  const scheduleDays = normalizeScheduleDays(row.schedule_days);
  const cadencePeriod = getCadencePeriod(row.cadence_period, scheduleDays);
  const cadenceDayPolicy = getCadenceDayPolicy(row.cadence_day_policy, cadencePeriod, scheduleDays);
  const cadenceTargetCount = normalizeCadenceTargetCount(
    row.cadence_target_count,
    cadencePeriod,
    cadenceDayPolicy,
    scheduleDays
  );
  const habitType = getHabitType(row.habit_type);
  const habitMode = getHabitMode(row.habit_mode, {
    habitType,
    timerEnabled: row.timer_enabled,
  });
  const targetOperator = isOneOf(HABIT_OPERATOR_VALUES, row.target_operator)
    ? row.target_operator
    : "at_least";
  const targetUnit = isOneOf(HABIT_UNIT_VALUES, row.target_unit) ? row.target_unit : null;

  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    habitMode,
    habitType,
    category: getHabitCategory(row.category),
    targetOperator,
    targetValueNumeric:
      typeof row.target_value_numeric === "number" ? row.target_value_numeric : null,
    targetUnit,
    targetTime: row.target_time,
    targetLabel: buildTargetLabel({
      habitMode,
      habitType,
      targetOperator,
      targetValueNumeric:
        typeof row.target_value_numeric === "number" ? row.target_value_numeric : null,
      targetUnit,
      targetTime: row.target_time,
    }),
    startDate: normalizeHabitDate(row.start_date, getSelectedDateFallback(row.created_at)),
    lastLapseDate: row.last_lapse_date ? normalizeHabitDate(row.last_lapse_date) : null,
    timerEnabled: row.timer_enabled === true,
    timerTargetSeconds:
      typeof row.timer_target_seconds === "number" ? row.timer_target_seconds : null,
    cadencePeriod,
    cadenceTargetCount,
    cadenceDayPolicy,
    cadenceLabel: buildHabitCadenceLabel({
      cadencePeriod,
      cadenceTargetCount,
      cadenceDayPolicy,
      scheduleDays,
    }),
    scheduleDays,
    isPerfectDayItem: row.is_perfect_day_item,
    status: row.status === "archived" ? "archived" : "active",
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildHabitCheckInView(row: HabitCheckInRow): HabitCheckInView {
  const timerSeconds =
    typeof row.timer_seconds === "number" && Number.isFinite(row.timer_seconds)
      ? Math.max(0, Math.floor(row.timer_seconds))
      : 0;
  const manualMinutes =
    typeof row.manual_minutes === "number" && Number.isFinite(row.manual_minutes)
      ? Math.max(0, Math.floor(row.manual_minutes))
      : 0;
  const valueNumeric = typeof row.value_numeric === "number" ? row.value_numeric : null;
  const legacyTimedSeconds =
    timerSeconds === 0 &&
    manualMinutes === 0 &&
    typeof valueNumeric === "number" &&
    valueNumeric > 0
      ? Math.round(valueNumeric * 60)
      : 0;

  return {
    id: row.id,
    habitId: row.habit_id,
    checkInDate: row.check_in_date,
    timezone: row.timezone,
    valueNumeric,
    valueBoolean: row.value_boolean,
    valueTime: row.value_time,
    timerSeconds,
    manualMinutes,
    legacyTimedSeconds,
    note: row.note,
    status: row.status === "skipped" ? "skipped" : "logged",
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildHabitCadenceLabel(input: {
  cadencePeriod: HabitCadencePeriod;
  cadenceTargetCount: number;
  cadenceDayPolicy: HabitCadenceDayPolicy;
  scheduleDays: HabitWeekday[];
}) {
  if (input.cadencePeriod === "daily") return "Daily";

  if (input.cadencePeriod === "weekly") {
    if (input.cadenceDayPolicy === "fixed") {
      const count = input.scheduleDays.length;
      return count === 1 ? "Weekly - fixed day" : `Weekly - ${count} fixed days`;
    }
    return input.cadenceTargetCount === 1
      ? "Weekly - any day"
      : `${input.cadenceTargetCount}x/week - any days`;
  }

  return input.cadenceTargetCount === 1
    ? "Monthly - any day"
    : `${input.cadenceTargetCount}x/month - any days`;
}

function buildTargetLabel(input: {
  habitMode: HabitMode;
  habitType: HabitType;
  targetOperator: HabitOperator;
  targetValueNumeric: number | null;
  targetUnit: HabitUnit | null;
  targetTime: string | null;
}) {
  if (input.habitMode === "quit") return "Days without";
  if (input.habitMode === "timed") {
    const value = input.targetValueNumeric ?? 0;
    const unit = input.targetUnit ?? "minutes";
    return `Timer ${value} ${unit}`;
  }
  if (input.habitType === "binary") return "Done only";
  if (input.habitType === "time_of_day") {
    const time = input.targetTime?.slice(0, 5) ?? "";
    return input.targetOperator === "after" ? `After ${time}` : `Before ${time}`;
  }

  const operator = input.targetOperator === "at_most" ? "Max" : "At least";
  const value = input.targetValueNumeric ?? 0;
  const unit = input.targetUnit ?? "times";
  return `${operator} ${value} ${formatHabitUnit(unit, value)}`;
}

function formatHabitUnit(unit: HabitUnit, value: number) {
  if (value !== 1) return unit;
  switch (unit) {
    case "glasses":
      return "glass";
    case "litres":
      return "litre";
    case "minutes":
      return "minute";
    case "seconds":
      return "second";
    case "steps":
      return "step";
    case "pages":
      return "page";
    case "times":
      return "time";
    case "custom":
      return "unit";
    default:
      return unit;
  }
}

function compareTime(valueTime: string, targetTime: string, operator: HabitOperator) {
  const value = valueTime.slice(0, 5);
  const target = targetTime.slice(0, 5);
  return operator === "after" ? value >= target : value <= target;
}

function formatDayCount(value: number) {
  return `${value} ${value === 1 ? "day" : "days"}`;
}

function formatStreakCount(value: number) {
  return `${value}-day streak`;
}

function isRestDayCheckIn(checkIn: HabitCheckInView | null | undefined): boolean {
  return checkIn?.status === "skipped";
}

function isQuitLapseCheckIn(checkIn: HabitCheckInView | null | undefined): boolean {
  return (
    checkIn?.status === "logged" &&
    (checkIn.valueBoolean === false || (checkIn.valueNumeric ?? 0) > 0)
  );
}

function isDailyBuildMotivationCandidate(habit: HabitDefinitionView): boolean {
  return habit.habitMode === "build" && habit.cadencePeriod === "daily";
}

function isHabitScheduledOnDate(habit: HabitDefinitionView, date: string): boolean {
  if (isAfterHabitDate(habit.startDate, date)) return false;
  if (habit.cadenceDayPolicy === "any") return true;
  const weekday = getWeekdayForHabitDate(date);
  return weekday ? habit.scheduleDays.includes(weekday) : true;
}

function isBuildCheckInSatisfied(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null | undefined
): boolean {
  if (!checkIn || isRestDayCheckIn(checkIn)) return false;

  if (habit.habitType === "binary") {
    return checkIn.valueBoolean === true;
  }

  if (habit.habitType === "time_of_day") {
    return Boolean(
      checkIn.valueTime &&
      habit.targetTime &&
      compareTime(checkIn.valueTime, habit.targetTime, habit.targetOperator)
    );
  }

  const value = checkIn.valueNumeric ?? 0;
  const target = habit.targetValueNumeric ?? 0;
  return habit.targetOperator === "at_most"
    ? value <= target
    : target <= 0
      ? value > 0
      : value >= target;
}

function getDailyBuildMotivation(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  date: string,
  checkIns: HabitCheckInView[]
): { valueLabel: string; supportingLabel: string | null; progressRatio: number } | null {
  if (!isDailyBuildMotivationCandidate(habit)) return null;
  if (isAfterHabitDate(habit.startDate, date)) return null;

  const checkInsByDate = new Map<string, HabitCheckInView>();
  for (const candidate of checkIns) {
    if (candidate.habitId !== habit.id) continue;
    if (candidate.checkInDate < habit.startDate || candidate.checkInDate > date) continue;
    checkInsByDate.set(candidate.checkInDate, candidate);
  }
  if (checkIn) {
    checkInsByDate.set(checkIn.checkInDate, checkIn);
  }

  let trackedDays = 0;
  let onTrackDays = 0;
  const totalDays = getDayDelta(habit.startDate, date);

  for (let index = 0; index <= totalDays; index += 1) {
    const day = addUtcDays(habit.startDate, index);
    if (!isHabitScheduledOnDate(habit, day)) continue;
    const candidate = checkInsByDate.get(day) ?? null;
    if (isRestDayCheckIn(candidate)) continue;
    trackedDays += 1;
    if (isBuildCheckInSatisfied(habit, candidate)) {
      onTrackDays += 1;
    }
  }

  let currentStreak = 0;
  for (let index = totalDays; index >= 0; index -= 1) {
    const day = addUtcDays(habit.startDate, index);
    if (!isHabitScheduledOnDate(habit, day)) continue;
    const candidate = checkInsByDate.get(day) ?? null;
    if (day === date && !candidate) continue;
    if (isRestDayCheckIn(candidate)) continue;
    if (!isBuildCheckInSatisfied(habit, candidate)) break;
    currentStreak += 1;
  }

  if (trackedDays <= 0 || (currentStreak <= 0 && onTrackDays <= 0)) return null;

  return {
    valueLabel:
      currentStreak >= 5
        ? formatStreakCount(currentStreak)
        : `${onTrackDays}/${trackedDays} days on track`,
    supportingLabel: currentStreak >= 5 ? `${onTrackDays}/${trackedDays} days on track` : null,
    progressRatio: Math.max(0, Math.min(1, onTrackDays / trackedDays)),
  };
}

function getQuitLapseDates(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  checkIns: HabitCheckInView[],
  date: string
) {
  const lapseDates = new Set<string>();
  const candidates = checkIn ? [...checkIns, checkIn] : checkIns;

  for (const candidate of candidates) {
    if (candidate.habitId !== habit.id) continue;
    if (candidate.checkInDate < habit.startDate || candidate.checkInDate > date) continue;
    if (isQuitLapseCheckIn(candidate)) {
      lapseDates.add(candidate.checkInDate);
    }
  }

  if (
    habit.lastLapseDate &&
    habit.lastLapseDate >= habit.startDate &&
    habit.lastLapseDate <= date
  ) {
    lapseDates.add(habit.lastLapseDate);
  }

  return [...lapseDates].sort();
}

function evaluateQuitHabitForDate(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  date: string,
  checkIns: HabitCheckInView[]
): HabitEvaluation {
  const started = !isAfterHabitDate(habit.startDate, date);
  if (!started) {
    return {
      isSatisfied: false,
      valueLabel: `Starts ${habit.startDate}`,
      stateLabel: "Not started",
      supportingLabel: null,
      progressRatio: 0,
    };
  }

  const lapseLoggedToday = isQuitLapseCheckIn(checkIn);
  const lapseDates = getQuitLapseDates(habit, checkIn, checkIns, date);
  const latestLapseDate = lapseDates.at(-1) ?? null;
  const anchorDate = latestLapseDate ?? habit.startDate;
  const daysSince = getDayDelta(anchorDate, date);
  const totalDays = getDayDelta(habit.startDate, date) + 1;

  if (lapseDates.length > 0) {
    const onTrackDays = Math.max(0, totalDays - lapseDates.length);
    return {
      isSatisfied: !lapseLoggedToday,
      valueLabel: `${onTrackDays}/${totalDays} days on track`,
      stateLabel: lapseLoggedToday ? "Slip logged today" : "On track",
      supportingLabel: daysSince >= 5 ? `Current streak ${formatDayCount(daysSince)}` : null,
      progressRatio: Math.max(0, Math.min(1, onTrackDays / totalDays)),
    };
  }

  return {
    isSatisfied: true,
    valueLabel: `${formatDayCount(daysSince)} without`,
    stateLabel: "On track",
    supportingLabel: null,
    progressRatio: 1,
  };
}

export function evaluateHabitForDate(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  date: string,
  checkIns: HabitCheckInView[] = checkIn ? [checkIn] : []
): HabitEvaluation {
  if (habit.habitMode === "quit") {
    return evaluateQuitHabitForDate(habit, checkIn, date, checkIns);
  }

  if (!checkIn || isRestDayCheckIn(checkIn)) {
    const motivation = !isRestDayCheckIn(checkIn)
      ? getDailyBuildMotivation(habit, checkIn, date, checkIns)
      : null;
    return {
      isSatisfied: false,
      valueLabel: isRestDayCheckIn(checkIn)
        ? "Rest day"
        : (motivation?.valueLabel ?? "No check-in"),
      stateLabel: isRestDayCheckIn(checkIn) ? "Rest day" : "Open",
      supportingLabel: isRestDayCheckIn(checkIn)
        ? "Not counted as done or missed"
        : (motivation?.supportingLabel ?? null),
      progressRatio: motivation?.progressRatio ?? 0,
    };
  }

  if (habit.habitType === "binary") {
    const isSatisfied = checkIn.valueBoolean === true;
    const motivation = getDailyBuildMotivation(habit, checkIn, date, checkIns);
    return {
      isSatisfied,
      valueLabel: isSatisfied
        ? (motivation?.valueLabel ?? "Done")
        : (motivation?.valueLabel ?? "Open"),
      stateLabel: isSatisfied ? "Counts today" : "Open",
      supportingLabel: motivation?.supportingLabel ?? null,
      progressRatio: isSatisfied ? 1 : (motivation?.progressRatio ?? 0),
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
      supportingLabel: null,
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
    valueLabel: `${value} ${formatHabitUnit(habit.targetUnit ?? "times", value)}`,
    stateLabel: isSatisfied
      ? habit.habitMode === "timed"
        ? "Timer saved"
        : "On target"
      : "Logged",
    supportingLabel: null,
    progressRatio: ratio,
  };
}

function getCheckInForHabitDate(
  habit: HabitDefinitionView,
  checkIns: HabitCheckInView[],
  date: string
): HabitCheckInView | null {
  return (
    checkIns.find((checkIn) => checkIn.habitId === habit.id && checkIn.checkInDate === date) ?? null
  );
}

function countCadenceCompletions(
  habit: HabitDefinitionView,
  checkIns: HabitCheckInView[],
  periodStart: string,
  periodEnd: string
): number {
  const dates = new Set<string>();
  for (const checkIn of checkIns) {
    if (checkIn.habitId !== habit.id) continue;
    if (!isWithinDateRange(checkIn.checkInDate, periodStart, periodEnd)) continue;
    if (isAfterHabitDate(habit.startDate, checkIn.checkInDate)) continue;
    if (habit.cadenceDayPolicy === "fixed") {
      const weekday = getWeekdayForHabitDate(checkIn.checkInDate);
      if (!weekday || !habit.scheduleDays.includes(weekday)) continue;
    }
    if (evaluateHabitForDate(habit, checkIn, checkIn.checkInDate).isSatisfied) {
      dates.add(checkIn.checkInDate);
    }
  }
  return dates.size;
}

function buildHabitCadenceProgress(
  habit: HabitDefinitionView,
  checkIns: HabitCheckInView[],
  date: string
): HabitCadenceProgress {
  const { periodStart, periodEnd, periodLabel } = getHabitCadenceWindow(habit, date);
  const completedCount = countCadenceCompletions(habit, checkIns, periodStart, periodEnd);
  const targetCount = habit.cadencePeriod === "daily" ? 1 : habit.cadenceTargetCount;
  const remainingCount = Math.max(0, targetCount - completedCount);
  const todayCheckIn = getCheckInForHabitDate(habit, checkIns, date);
  const todaySatisfied = evaluateHabitForDate(habit, todayCheckIn, date).isSatisfied;
  const isTargetMet = completedCount >= targetCount;

  return {
    periodStart,
    periodEnd,
    periodLabel,
    completedCount,
    targetCount,
    remainingCount,
    isTargetMet,
    isDueToday: remainingCount > 0 && !todaySatisfied,
  };
}

export function isHabitScheduledForDate(
  habit: HabitDefinitionView,
  date: string,
  checkIns: HabitCheckInView[] = []
): boolean {
  if (isAfterHabitDate(habit.startDate, date)) return false;
  const todayCheckIn = getCheckInForHabitDate(habit, checkIns, date);

  if (habit.cadenceDayPolicy === "any") {
    const progress = buildHabitCadenceProgress(habit, checkIns, date);
    return !progress.isTargetMet || todayCheckIn !== null;
  }

  const weekday = getWeekdayForHabitDate(date);
  return weekday ? habit.scheduleDays.includes(weekday) : true;
}

function getHabitPriorityGroup(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  evaluation: HabitEvaluation,
  cadenceProgress: HabitCadenceProgress,
  isScheduledForDate: boolean,
  date: string
): HabitPriorityGroup {
  if (habit.status === "archived") return "archived";
  if (isAfterHabitDate(habit.startDate, date)) return "not_due";
  if (checkIn?.status === "skipped") return "rest_day";
  if (habit.habitMode === "quit") return "quit_status";
  if (evaluation.isSatisfied || cadenceProgress.isTargetMet) {
    return habit.cadencePeriod === "daily" ? "done_today" : "done_period";
  }
  if (!isScheduledForDate || !cadenceProgress.isDueToday) return "not_due";
  if (habit.cadencePeriod === "weekly" && habit.cadenceDayPolicy === "any") {
    return "due_weekly";
  }
  if (habit.cadencePeriod === "monthly") return "due_monthly";
  return habit.habitMode === "timed" ? "due_timed" : "due_build";
}

function compareHabitDayItems(left: HabitDayItem, right: HabitDayItem): number {
  const priorityOrder: Record<HabitPriorityGroup, number> = {
    due_build: 0,
    due_timed: 1,
    due_weekly: 2,
    due_monthly: 3,
    quit_status: 4,
    rest_day: 5,
    done_today: 6,
    done_period: 7,
    not_due: 8,
    archived: 9,
  };
  const cadenceOrder: Record<HabitCadencePeriod, number> = {
    daily: 0,
    weekly: 1,
    monthly: 2,
  };
  const priorityDelta = priorityOrder[left.priorityGroup] - priorityOrder[right.priorityGroup];
  if (priorityDelta !== 0) return priorityDelta;
  const cadenceDelta =
    cadenceOrder[left.habit.cadencePeriod] - cadenceOrder[right.habit.cadencePeriod];
  if (cadenceDelta !== 0) return cadenceDelta;
  const sortDelta = left.habit.sortOrder - right.habit.sortOrder;
  if (sortDelta !== 0) return sortDelta;
  return left.habit.updatedAt < right.habit.updatedAt ? 1 : -1;
}

export function buildHabitDaySummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  date: string
): HabitDaySummary {
  const items = habits
    .map((habit) => {
      const checkIn = getCheckInForHabitDate(habit, checkIns, date);
      const evaluation = evaluateHabitForDate(habit, checkIn, date, checkIns);
      const cadenceProgress = buildHabitCadenceProgress(habit, checkIns, date);
      const isScheduledForDate = isHabitScheduledForDate(habit, date, checkIns);
      return {
        habit,
        checkIn,
        evaluation,
        cadenceProgress,
        isScheduledForDate,
        priorityGroup: getHabitPriorityGroup(
          habit,
          checkIn,
          evaluation,
          cadenceProgress,
          isScheduledForDate,
          date
        ),
      };
    })
    .sort(compareHabitDayItems);
  const perfectDayItems = items.filter(
    (item) =>
      item.isScheduledForDate && item.habit.isPerfectDayItem && item.checkIn?.status !== "skipped"
  );
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
    scheduledHabitCount: items.filter((item) => item.isScheduledForDate).length,
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
  const weekStart = getCalendarWeekStartDate(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addUtcDays(weekStart, index);
    return buildHabitDaySummary(habits, checkIns, dateKey);
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
