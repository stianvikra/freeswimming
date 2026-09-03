import { isLocalDayDateKey } from "@/lib/my-library/local-day";
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
export const HABIT_MOTIVATION_RESET_TYPE_VALUES = ["reset_stats"] as const;
export const HABIT_MOTIVATION_RESET_STATUS_VALUES = ["active", "voided"] as const;
export const HABIT_STATUS_VALUES = ["active", "archived"] as const;
export const HABIT_DAY_STATUS_VALUES = ["not_tracked"] as const;
export const HABIT_DAY_STATUS_LABELS = {
  not_tracked: "Not tracked",
  unsupported: "Needs review",
} as const satisfies Record<HabitDayStatusState, string>;
export const UNSUPPORTED_HABIT_DEFINITION_CODE = "UNSUPPORTED_HABIT_DEFINITION" as const;
export const UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE =
  "UNSUPPORTED_HABIT_DEFINITION_VALUE" as const;
export const HABIT_CHECK_IN_SOURCE_KIND_VALUES = ["manual", "timer", "micro_session"] as const;
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
export type HabitMotivationResetType = (typeof HABIT_MOTIVATION_RESET_TYPE_VALUES)[number];
export type HabitMotivationResetStatus =
  | (typeof HABIT_MOTIVATION_RESET_STATUS_VALUES)[number]
  | "unsupported";
export type HabitStatus = (typeof HABIT_STATUS_VALUES)[number];
export type HabitDayStatus = (typeof HABIT_DAY_STATUS_VALUES)[number];
export type HabitDayStatusState = HabitDayStatus | "unsupported";
export type HabitItemTrackingState = "known" | "not_tracked" | "incomplete" | "needs_review";
export type HabitCheckInSourceKind =
  | (typeof HABIT_CHECK_IN_SOURCE_KIND_VALUES)[number]
  | "unsupported";

export type HabitMicroSessionLinkStatus = "active" | "paused" | "unsupported";

export type HabitMicroSessionProgressView = {
  totalBlockCount: number;
  completedBlockCount: number;
  skippedBlockCount: number;
  remainingBlockCount: number;
  progressPercent: number;
};

export type HabitMicroSessionLinkView = {
  planId: string;
  status: HabitMicroSessionLinkStatus;
  progress: HabitMicroSessionProgressView | null;
};

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
  | "not_tracked"
  | "tracking_incomplete"
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
export type HabitAbsenceReviewAcknowledgementRow =
  Database["public"]["Tables"]["habit_absence_review_acknowledgements"]["Row"];
export type HabitMotivationResetRow =
  Database["public"]["Tables"]["habit_motivation_resets"]["Row"];
export type HabitMotivationResetInsert =
  Database["public"]["Tables"]["habit_motivation_resets"]["Insert"];
export type HabitCheckInStatus = "logged" | "skipped" | "unsupported";

export type HabitDayStatusView = {
  reviewDate: string;
  dayStatus: HabitDayStatusState;
};

export type HabitDayStatusClassification =
  | { kind: "none" }
  | { kind: "supported"; dayStatus: HabitDayStatus }
  | { kind: "unsupported" };

export type HabitMetricCoverageState = "available" | "no_tracked_data" | "needs_review";

export type HabitMetricCoverage = {
  potentialUnitCount: number;
  knownUnitCount: number;
  successfulUnitCount: number;
  performancePercent: number | null;
  coveragePercent: number | null;
  notTrackedDayCount: number;
  state: HabitMetricCoverageState;
};

export type HabitMetricOptions = {
  dayStatuses?: readonly HabitDayStatusView[];
  dayStatusPrecedenceCheckIns?: readonly HabitCheckInView[];
};

export type HabitUnsupportedDefinitionField =
  | "unknown_habit_type"
  | "unknown_habit_mode"
  | "unknown_definition_status"
  | "unknown_category"
  | "unknown_target_operator"
  | "unknown_target_unit"
  | "invalid_target_shape"
  | "invalid_timer_shape"
  | "unknown_cadence_period"
  | "unknown_cadence_day_policy"
  | "invalid_cadence_target_count"
  | "invalid_schedule_days"
  | "invalid_cadence_shape";

export type HabitUnsupportedDefinitionView = {
  id: string;
  title: string;
  unsupportedFields: HabitUnsupportedDefinitionField[];
};

type HabitDefinitionCore = Pick<
  HabitDefinitionRow,
  "id" | "title" | "habit_type" | "habit_mode" | "status"
> & {
  category?: unknown;
  target_operator?: unknown;
  target_value_numeric?: unknown;
  target_unit?: unknown;
  target_time?: unknown;
  timer_enabled?: unknown;
  timer_target_seconds?: unknown;
  cadence_period?: unknown;
  cadence_target_count?: unknown;
  cadence_day_policy?: unknown;
  schedule_days?: unknown;
};

type HabitDefinitionSemanticFields =
  | "habit_type"
  | "habit_mode"
  | "status"
  | "category"
  | "target_operator"
  | "target_value_numeric"
  | "target_unit"
  | "target_time"
  | "timer_enabled"
  | "timer_target_seconds"
  | "cadence_period"
  | "cadence_target_count"
  | "cadence_day_policy"
  | "schedule_days";

export type SupportedHabitDefinitionRow<T extends HabitDefinitionCore = HabitDefinitionRow> = Omit<
  T,
  HabitDefinitionSemanticFields
> & {
  habit_type: HabitType;
  habit_mode: HabitMode;
  status: HabitStatus;
  category: HabitCategory;
  target_operator: HabitOperator;
  target_value_numeric: number | null;
  target_unit: HabitUnit | null;
  target_time: string | null;
  timer_enabled: boolean;
  timer_target_seconds: number | null;
  cadence_period: HabitCadencePeriod;
  cadence_target_count: number;
  cadence_day_policy: HabitCadenceDayPolicy;
  schedule_days: HabitWeekday[];
};

export type LegacyCadenceHabitDefinitionRow<T extends HabitDefinitionCore = HabitDefinitionRow> =
  Omit<T, HabitDefinitionSemanticFields> & {
    habit_type: HabitType;
    habit_mode: HabitMode;
    status: HabitStatus;
    category: HabitCategory;
    target_operator: HabitOperator;
    target_value_numeric: number | null;
    target_unit: HabitUnit | null;
    target_time: string | null;
    timer_enabled: boolean;
    timer_target_seconds: number | null;
    cadence_period?: null;
    cadence_target_count?: null;
    cadence_day_policy?: null;
    schedule_days: HabitWeekday[];
  };

export type HabitResolvedCadence = {
  cadencePeriod: "daily" | "weekly";
  cadenceTargetCount: number;
  cadenceDayPolicy: "fixed";
  scheduleDays: HabitWeekday[];
};

export type UsableHabitDefinitionRow<T extends HabitDefinitionCore = HabitDefinitionRow> =
  | SupportedHabitDefinitionRow<T>
  | LegacyCadenceHabitDefinitionRow<T>;

export type HabitDefinitionClassification<T extends HabitDefinitionCore = HabitDefinitionRow> =
  | { kind: "supported"; row: SupportedHabitDefinitionRow<T> }
  | {
      kind: "legacy_cadence";
      row: LegacyCadenceHabitDefinitionRow<T>;
      resolvedCadence: HabitResolvedCadence;
    }
  | { kind: "unsupported"; descriptor: HabitUnsupportedDefinitionView };

export class UnsupportedHabitDefinitionValueError extends Error {
  readonly code = UNSUPPORTED_HABIT_DEFINITION_VALUE_CODE;

  constructor() {
    super("This Habit setup is not supported yet.");
    this.name = "UnsupportedHabitDefinitionValueError";
  }
}

function hasOwnProperty<K extends PropertyKey>(value: object, key: K): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isFiniteHabitInputNumber(value: unknown, min: number, max: number): boolean {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(numeric) && numeric >= min && numeric <= max;
}

function isIntegerHabitInputNumber(value: unknown, min: number, max: number): boolean {
  if (!isFiniteHabitInputNumber(value, min, max)) return false;
  return Number.isInteger(typeof value === "number" ? value : Number(value));
}

export function validateHabitDefinitionCoreInput(body: {
  habitType?: unknown;
  habitMode?: unknown;
  status?: unknown;
  category?: unknown;
  targetOperator?: unknown;
  targetValueNumeric?: unknown;
  targetUnit?: unknown;
  targetTime?: unknown;
  timerEnabled?: unknown;
  timerTargetSeconds?: unknown;
  cadencePeriod?: unknown;
  cadenceTargetCount?: unknown;
  cadenceDayPolicy?: unknown;
  scheduleDays?: unknown;
}): void {
  if (hasOwnProperty(body, "habitType") && !isOneOf(HABIT_TYPE_VALUES, body.habitType)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (hasOwnProperty(body, "habitMode") && !isOneOf(HABIT_MODE_VALUES, body.habitMode)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (hasOwnProperty(body, "status") && !isOneOf(HABIT_STATUS_VALUES, body.status)) {
    throw new Error("Unsupported habit status.");
  }
  if (hasOwnProperty(body, "category") && !isOneOf(HABIT_CATEGORY_VALUES, body.category)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (hasOwnProperty(body, "targetOperator")) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "targetValueNumeric") &&
    body.targetValueNumeric !== null &&
    !isFiniteHabitInputNumber(body.targetValueNumeric, 0, 10_000)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "targetUnit") &&
    body.targetUnit !== null &&
    !isOneOf(HABIT_UNIT_VALUES, body.targetUnit)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "targetTime") &&
    body.targetTime !== null &&
    normalizeHabitTime(body.targetTime) === null
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (hasOwnProperty(body, "timerEnabled") && typeof body.timerEnabled !== "boolean") {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "timerTargetSeconds") &&
    body.timerTargetSeconds !== null &&
    !isIntegerHabitInputNumber(body.timerTargetSeconds, 1, HABIT_TIMER_MAX_SECONDS)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "cadencePeriod") &&
    !isOneOf(HABIT_CADENCE_PERIOD_VALUES, body.cadencePeriod)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "cadenceTargetCount") &&
    !isIntegerHabitInputNumber(body.cadenceTargetCount, 1, 31)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (
    hasOwnProperty(body, "cadenceDayPolicy") &&
    !isOneOf(HABIT_CADENCE_DAY_POLICY_VALUES, body.cadenceDayPolicy)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (hasOwnProperty(body, "scheduleDays") && !isCanonicalScheduleDays(body.scheduleDays)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
}

export type HabitMotivationResetView = {
  id: string;
  habitId: string;
  resetType: HabitMotivationResetType | "unsupported";
  status: HabitMotivationResetStatus;
  effectiveDate: string;
  createdAt: string;
  createdBy: string;
};

export type HabitMotivationResetBoundary = {
  id: string;
  effectiveDate: string;
  createdAt: string;
};

export type HabitMotivationBeforeResetSummary = {
  historyStartDate: string;
  historyEndDate: string;
  savedCheckInCount: number;
  lastTrackedDate: string | null;
};

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
  microSessionLink: HabitMicroSessionLinkView | null;
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
  status: HabitCheckInStatus;
  sourceKind: HabitCheckInSourceKind;
  sourceDrylandMicroPlanId: string | null;
  sourceMicroBlockId: string | null;
  sourceCompletedAt: string | null;
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
  trackingState: HabitItemTrackingState;
  priorityGroup: HabitPriorityGroup;
};

export type HabitDaySummary = {
  date: string;
  dayStatus: HabitDayStatusState | null;
  trackingState: "known" | "not_tracked" | "needs_review";
  scheduledHabitCount: number;
  potentialPerfectDayItemCount: number;
  perfectDayItemCount: number;
  satisfiedPerfectDayItemCount: number;
  completionPercent: number | null;
  isPerfectDay: boolean;
  completedDurationMinutes: number;
  completedCountTotal: number;
  metricCoverage: HabitMetricCoverage;
  items: HabitDayItem[];
};

export type HabitWeekSummary = {
  days: HabitDaySummary[];
  perfectDayCount: number;
  averageCompletionPercent: number | null;
  totalDurationMinutes: number;
  totalCount: number;
  metricCoverage: HabitMetricCoverage;
};

export type HabitMotivationItem = {
  habitId: string;
  title: string;
  status: HabitStatus;
  mode: HabitMode;
  startDate: string;
  updatedAt: string;
  motivationStartDate: string;
  resetBoundary: HabitMotivationResetBoundary | null;
  resetBoundaries: HabitMotivationResetBoundary[];
  beforeResetSummary: HabitMotivationBeforeResetSummary | null;
  lastTrackedDate: string | null;
  potentialDayCount: number;
  eligibleDayCount: number;
  onTrackDayCount: number;
  notTrackedDayCount: number;
  unknownPeriodCount: number;
  restDayCount: number;
  slipCount: number;
  noteCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
  consistencyPercent: number | null;
  habitScore: number | null;
  totalTimedMinutes: number;
  totalCount: number;
  metricCoverage: HabitMetricCoverage;
};

export type HabitMotivationSummary = {
  historyStartDate: string;
  historyEndDate: string;
  activeHabitCount: number;
  archivedHabitCount: number;
  lastTrackedDate: string | null;
  potentialDayCount: number;
  eligibleDayCount: number;
  onTrackDayCount: number;
  notTrackedDayCount: number;
  restDayCount: number;
  slipCount: number;
  noteCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
  consistencyPercent: number | null;
  habitScore: number | null;
  totalTimedMinutes: number;
  totalCount: number;
  metricCoverage: HabitMetricCoverage;
  items: HabitMotivationItem[];
};

export const HABIT_MOTIVATION_RANGE_VALUES = [
  "week",
  "month",
  "three_months",
  "six_months",
  "year",
  "all",
] as const;

export type HabitMotivationRange = (typeof HABIT_MOTIVATION_RANGE_VALUES)[number];

export type HabitMotivationRangeSummaries = Partial<
  Record<HabitMotivationRange, HabitMotivationSummary>
>;

export type HabitSnapshot = {
  schemaReady: boolean;
  resetEventsReady?: boolean;
  absenceReviewAcknowledgementsReady?: boolean;
  loadError: string | null;
  selectedDate: string;
  activeHabits: HabitDefinitionView[];
  archivedHabits: HabitDefinitionView[];
  unsupportedHabits: HabitUnsupportedDefinitionView[];
  daySummary: HabitDaySummary;
  weekSummary: HabitWeekSummary;
  absenceReviewRecordedCheckInDates?: string[];
  absenceReviewAcknowledgedDates?: string[];
  dayStatusesReady?: boolean;
  dayStatuses?: HabitDayStatusView[];
  motivationSummary?: HabitMotivationSummary;
  motivationSummaries?: HabitMotivationRangeSummaries;
};

export type HabitCreateRequestBody = {
  title?: unknown;
  notes?: unknown;
  habitMode?: unknown;
  habitType?: unknown;
  category?: unknown;
  targetOperator?: unknown;
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
  renderedTodayDate?: unknown;
  timezone?: unknown;
};

export type HabitUpdateRequestBody = Partial<HabitCreateRequestBody> & {
  status?: unknown;
};

export type HabitCheckInRequestBody = {
  habitId?: unknown;
  checkInDate?: unknown;
  selectedDate?: unknown;
  renderedTodayDate?: unknown;
  timezone?: unknown;
  valueNumeric?: unknown;
  valueBoolean?: unknown;
  valueTime?: unknown;
  timerSeconds?: unknown;
  manualMinutes?: unknown;
  note?: unknown;
  status?: unknown;
  clear?: unknown;
  clearTimedCompletion?: unknown;
  actionSource?: unknown;
};

export type HabitMotivationResetRequestBody = {
  effectiveDate?: unknown;
  selectedDate?: unknown;
  renderedTodayDate?: unknown;
  actionSource?: unknown;
  timezone?: unknown;
};

export type HabitWriteDateContext = {
  now: Date;
  todayDate: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(?::\d{2})?$/;
const DEFAULT_WEEKDAYS: HabitWeekday[] = [...HABIT_WEEKDAY_VALUES];
const HABIT_COUNT_UNIT_VALUES = [
  "times",
  "steps",
  "pages",
  "glasses",
  "litres",
  "custom",
] as const satisfies readonly HabitUnit[];
const HABIT_DURATION_UNIT_VALUES = ["minutes", "seconds"] as const satisfies readonly HabitUnit[];
const HABIT_AVOIDANCE_UNIT_VALUES = [
  "times",
  "glasses",
  "litres",
  "custom",
] as const satisfies readonly HabitUnit[];

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function isCanonicalScheduleDays(value: unknown): value is HabitWeekday[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 7) return false;
  if (!value.every((day) => isOneOf(HABIT_WEEKDAY_VALUES, day))) return false;
  return new Set(value).size === value.length;
}

function isCanonicalHabitTime(value: unknown): value is string {
  if (typeof value !== "string" || value !== value.trim() || !TIME_PATTERN.test(value)) {
    return false;
  }
  const [hours = -1, minutes = -1, seconds = 0] = value.split(":").map(Number);
  return (
    hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59
  );
}

function isStoredTargetNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10_000;
}

function isCanonicalTargetShape(
  row: HabitDefinitionCore,
  habitType: HabitType,
  habitMode: HabitMode
): boolean {
  const operator = row.target_operator;
  const value = row.target_value_numeric;
  const unit = row.target_unit;
  const time = row.target_time;

  if (habitMode === "quit") {
    return (
      habitType === "avoidance" &&
      operator === "at_most" &&
      value === 0 &&
      unit === "times" &&
      time === null
    );
  }

  if (habitMode === "timed") {
    return (
      habitType === "duration" &&
      operator === "at_least" &&
      isStoredTargetNumber(value) &&
      value > 0 &&
      isOneOf(HABIT_DURATION_UNIT_VALUES, unit) &&
      time === null
    );
  }

  if (habitType === "binary") {
    return operator === "at_least" && value === null && unit === null && time === null;
  }
  if (habitType === "count") {
    return (
      (operator === "at_least" || operator === "at_most") &&
      isStoredTargetNumber(value) &&
      isOneOf(HABIT_COUNT_UNIT_VALUES, unit) &&
      time === null
    );
  }
  if (habitType === "duration") {
    return (
      (operator === "at_least" || operator === "at_most") &&
      isStoredTargetNumber(value) &&
      isOneOf(HABIT_DURATION_UNIT_VALUES, unit) &&
      time === null
    );
  }
  if (habitType === "time_of_day") {
    return (
      (operator === "before" || operator === "after") &&
      value === null &&
      unit === null &&
      isCanonicalHabitTime(time)
    );
  }
  return (
    operator === "at_most" &&
    isStoredTargetNumber(value) &&
    isOneOf(HABIT_AVOIDANCE_UNIT_VALUES, unit) &&
    time === null
  );
}

function isCanonicalTimerShape(
  row: HabitDefinitionCore,
  habitType: HabitType,
  habitMode: HabitMode
): boolean {
  if (habitMode !== "timed") {
    return row.timer_enabled === false && row.timer_target_seconds === null;
  }

  const targetValue = row.target_value_numeric;
  const targetUnit = row.target_unit;
  const targetSeconds = row.timer_target_seconds;
  if (
    habitType !== "duration" ||
    !isStoredTargetNumber(targetValue) ||
    targetValue <= 0 ||
    !isOneOf(HABIT_DURATION_UNIT_VALUES, targetUnit) ||
    row.timer_enabled !== true ||
    typeof targetSeconds !== "number" ||
    !Number.isInteger(targetSeconds) ||
    targetSeconds < 1 ||
    targetSeconds > HABIT_TIMER_MAX_SECONDS
  ) {
    return false;
  }

  const resolvedSeconds = Math.round(targetUnit === "seconds" ? targetValue : targetValue * 60);
  return targetSeconds === resolvedSeconds;
}

function isCadenceCountValidForPeriod(value: unknown, period: unknown): value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) return false;
  if (period === "daily") return value === 1;
  if (period === "weekly") return value >= 1 && value <= 7;
  if (period === "monthly") return value >= 1 && value <= 31;
  return value >= 1 && value <= 31;
}

function isCanonicalCadenceShape(
  period: HabitCadencePeriod,
  targetCount: number,
  dayPolicy: HabitCadenceDayPolicy,
  scheduleDays: HabitWeekday[]
): boolean {
  const isAllDays = scheduleDays.length === HABIT_WEEKDAY_VALUES.length;
  if (period === "daily") {
    return dayPolicy === "fixed" && targetCount === 1 && isAllDays;
  }
  if (period === "weekly" && dayPolicy === "fixed") {
    return targetCount === scheduleDays.length;
  }
  if (period === "weekly" && dayPolicy === "any") {
    return isAllDays;
  }
  return period === "monthly" && dayPolicy === "any" && isAllDays;
}

export function classifyHabitDayStatus(value: unknown): HabitDayStatusClassification {
  if (value === null || value === undefined) return { kind: "none" };
  if (isOneOf(HABIT_DAY_STATUS_VALUES, value)) {
    return { kind: "supported", dayStatus: value };
  }
  return { kind: "unsupported" };
}

export function getHabitDayStatusLabel(value: HabitDayStatusState): string {
  return HABIT_DAY_STATUS_LABELS[value];
}

export function getHabitItemTrackingStateLabel(value: HabitItemTrackingState): string {
  if (value === "not_tracked") return getHabitDayStatusLabel("not_tracked");
  if (value === "needs_review") return getHabitDayStatusLabel("unsupported");
  if (value === "incomplete") return "Tracking incomplete";
  return "Tracked";
}

export function buildHabitDayStatusView(input: {
  reviewDate: unknown;
  dayStatus: unknown;
  acknowledgementStatus?: unknown;
}): HabitDayStatusView | null {
  if (!isLocalDayDateKey(input.reviewDate)) {
    throw new Error("Habit day status date must be a real YYYY-MM-DD date.");
  }
  if (input.acknowledgementStatus !== undefined && input.acknowledgementStatus !== "reviewed") {
    return { reviewDate: input.reviewDate, dayStatus: "unsupported" };
  }
  const classification = classifyHabitDayStatus(input.dayStatus);
  if (classification.kind === "none") return null;
  return {
    reviewDate: input.reviewDate,
    dayStatus: classification.kind === "supported" ? classification.dayStatus : "unsupported",
  };
}

export function buildHabitMetricCoverage(input: {
  potentialUnitCount: number;
  knownUnitCount: number;
  successfulUnitCount: number;
  notTrackedDayCount?: number;
  hasUnsupportedDayStatus?: boolean;
}): HabitMetricCoverage {
  const potentialUnitCount = Math.max(0, Math.trunc(input.potentialUnitCount));
  const knownUnitCount = Math.min(
    potentialUnitCount,
    Math.max(0, Math.trunc(input.knownUnitCount))
  );
  const successfulUnitCount = Math.min(
    knownUnitCount,
    Math.max(0, Math.trunc(input.successfulUnitCount))
  );
  const notTrackedDayCount = Math.max(0, Math.trunc(input.notTrackedDayCount ?? 0));
  const state: HabitMetricCoverageState = input.hasUnsupportedDayStatus
    ? "needs_review"
    : knownUnitCount <= 0
      ? "no_tracked_data"
      : "available";

  return {
    potentialUnitCount,
    knownUnitCount,
    successfulUnitCount,
    performancePercent:
      state === "available" ? Math.round((successfulUnitCount / knownUnitCount) * 100) : null,
    coveragePercent:
      state !== "needs_review" && potentialUnitCount > 0
        ? Math.round((knownUnitCount / potentialUnitCount) * 100)
        : null,
    notTrackedDayCount,
    state,
  };
}

export function isHabitMetricCoverageIncomplete(
  coverage: HabitMetricCoverage | null | undefined
): boolean {
  return Boolean(coverage && coverage.knownUnitCount < coverage.potentialUnitCount);
}

export function classifyHabitDefinition<T extends HabitDefinitionCore>(
  row: T
): HabitDefinitionClassification<T> {
  const unsupportedFields: HabitUnsupportedDefinitionField[] = [];
  const hasKnownHabitType = isOneOf(HABIT_TYPE_VALUES, row.habit_type);
  const hasKnownHabitMode = isOneOf(HABIT_MODE_VALUES, row.habit_mode);
  const hasKnownStatus = isOneOf(HABIT_STATUS_VALUES, row.status);
  const hasKnownCategory = isOneOf(HABIT_CATEGORY_VALUES, row.category);
  const hasKnownOperator = isOneOf(HABIT_OPERATOR_VALUES, row.target_operator);
  const hasKnownUnit = row.target_unit === null || isOneOf(HABIT_UNIT_VALUES, row.target_unit);
  const hasCanonicalSchedule = isCanonicalScheduleDays(row.schedule_days);
  const cadenceValues = [
    row.cadence_period,
    row.cadence_target_count,
    row.cadence_day_policy,
  ] as const;
  const hasLegacyCadenceTuple = cadenceValues.every(
    (value) => value === null || value === undefined
  );
  const hasPartialNullCadenceTuple =
    !hasLegacyCadenceTuple && cadenceValues.some((value) => value === null || value === undefined);
  const hasKnownCadencePeriod = isOneOf(HABIT_CADENCE_PERIOD_VALUES, row.cadence_period);
  const hasKnownCadenceDayPolicy = isOneOf(HABIT_CADENCE_DAY_POLICY_VALUES, row.cadence_day_policy);
  const hasValidCadenceCount = isCadenceCountValidForPeriod(
    row.cadence_target_count,
    row.cadence_period
  );

  if (!hasKnownHabitType) {
    unsupportedFields.push("unknown_habit_type");
  }
  if (!hasKnownHabitMode) {
    unsupportedFields.push("unknown_habit_mode");
  }
  if (!hasKnownStatus) {
    unsupportedFields.push("unknown_definition_status");
  }
  if (!hasKnownCategory) {
    unsupportedFields.push("unknown_category");
  }
  if (!hasKnownOperator) {
    unsupportedFields.push("unknown_target_operator");
  }
  if (!hasKnownUnit) {
    unsupportedFields.push("unknown_target_unit");
  }
  if (
    hasKnownHabitType &&
    hasKnownHabitMode &&
    hasKnownOperator &&
    hasKnownUnit &&
    !isCanonicalTargetShape(row, row.habit_type as HabitType, row.habit_mode as HabitMode)
  ) {
    unsupportedFields.push("invalid_target_shape");
  }
  if (
    hasKnownHabitType &&
    hasKnownHabitMode &&
    !isCanonicalTimerShape(row, row.habit_type as HabitType, row.habit_mode as HabitMode)
  ) {
    unsupportedFields.push("invalid_timer_shape");
  }
  if (
    !hasLegacyCadenceTuple &&
    row.cadence_period !== null &&
    row.cadence_period !== undefined &&
    !hasKnownCadencePeriod
  ) {
    unsupportedFields.push("unknown_cadence_period");
  }
  if (
    !hasLegacyCadenceTuple &&
    row.cadence_day_policy !== null &&
    row.cadence_day_policy !== undefined &&
    !hasKnownCadenceDayPolicy
  ) {
    unsupportedFields.push("unknown_cadence_day_policy");
  }
  if (
    !hasLegacyCadenceTuple &&
    row.cadence_target_count !== null &&
    row.cadence_target_count !== undefined &&
    !hasValidCadenceCount
  ) {
    unsupportedFields.push("invalid_cadence_target_count");
  }
  if (!hasCanonicalSchedule) {
    unsupportedFields.push("invalid_schedule_days");
  }
  if (
    !hasLegacyCadenceTuple &&
    (hasPartialNullCadenceTuple ||
      (hasKnownCadencePeriod &&
        hasKnownCadenceDayPolicy &&
        hasValidCadenceCount &&
        hasCanonicalSchedule &&
        !isCanonicalCadenceShape(
          row.cadence_period as HabitCadencePeriod,
          row.cadence_target_count as number,
          row.cadence_day_policy as HabitCadenceDayPolicy,
          row.schedule_days as HabitWeekday[]
        )))
  ) {
    unsupportedFields.push("invalid_cadence_shape");
  }

  if (unsupportedFields.length > 0) {
    return {
      kind: "unsupported",
      descriptor: {
        id: row.id,
        title: row.title,
        unsupportedFields,
      },
    };
  }

  if (hasLegacyCadenceTuple && hasCanonicalSchedule) {
    const scheduleDays = row.schedule_days as HabitWeekday[];
    const isDaily = scheduleDays.length === HABIT_WEEKDAY_VALUES.length;
    return {
      kind: "legacy_cadence",
      row: row as unknown as LegacyCadenceHabitDefinitionRow<T>,
      resolvedCadence: {
        cadencePeriod: isDaily ? "daily" : "weekly",
        cadenceTargetCount: isDaily ? 1 : scheduleDays.length,
        cadenceDayPolicy: "fixed",
        scheduleDays: [...scheduleDays],
      },
    };
  }

  return { kind: "supported", row: row as SupportedHabitDefinitionRow<T> };
}

export function isUsableHabitDefinition<T extends HabitDefinitionCore>(
  definition: HabitDefinitionClassification<T>
): definition is Extract<
  HabitDefinitionClassification<T>,
  { kind: "supported" | "legacy_cadence" }
> {
  return definition.kind !== "unsupported";
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

function requireHabitWriteTodayDate(value: unknown): asserts value is string {
  if (!isLocalDayDateKey(value)) {
    throw new Error("Habit write today date must be a real YYYY-MM-DD date.");
  }
}

function requireHabitWriteInstant(value: unknown): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("Habit write instant must be a valid Date.");
  }
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
  if (!isCanonicalHabitTime(trimmed)) return null;
  return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
}

function normalizePositiveNumber(value: unknown): number | null {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(numeric)) return null;
  if (numeric < 0 || numeric > 10000) return null;
  return Math.round(numeric * 100) / 100;
}

function isSameStoredTargetNumberInput(value: unknown, currentValue: number | null): boolean {
  if (currentValue === null) return value === null;
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(numeric) && numeric === currentValue;
}

function isSameStoredTargetTimeInput(value: unknown, currentValue: string | null): boolean {
  if (currentValue === null) return value === null;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const normalized = normalizeHabitTime(trimmed);
  if (!normalized) return false;
  return (
    normalized === currentValue || (trimmed.length === 5 && trimmed === currentValue.slice(0, 5))
  );
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

function getLegacyCadencePeriod(scheduleDays: HabitWeekday[]): HabitCadencePeriod {
  return scheduleDays.length >= 7 ? "daily" : "weekly";
}

type HabitInputCadence = {
  cadencePeriod: HabitCadencePeriod;
  cadenceTargetCount: number;
  cadenceDayPolicy: HabitCadenceDayPolicy;
  scheduleDays: HabitWeekday[];
};

type HabitCadenceInput = {
  cadencePeriod?: unknown;
  cadenceTargetCount?: unknown;
  cadenceDayPolicy?: unknown;
  scheduleDays?: unknown;
};

function hasCadenceInput(body: HabitCadenceInput): boolean {
  return ["cadencePeriod", "cadenceTargetCount", "cadenceDayPolicy", "scheduleDays"].some((field) =>
    hasOwnProperty(body, field)
  );
}

function getResolvedCadenceForRow(row: UsableHabitDefinitionRow): HabitInputCadence {
  if (
    row.cadence_period === null ||
    row.cadence_period === undefined ||
    row.cadence_target_count === null ||
    row.cadence_target_count === undefined ||
    row.cadence_day_policy === null ||
    row.cadence_day_policy === undefined
  ) {
    const isDaily = row.schedule_days.length === HABIT_WEEKDAY_VALUES.length;
    return {
      cadencePeriod: isDaily ? "daily" : "weekly",
      cadenceTargetCount: isDaily ? 1 : row.schedule_days.length,
      cadenceDayPolicy: "fixed",
      scheduleDays: [...row.schedule_days],
    };
  }
  return {
    cadencePeriod: row.cadence_period,
    cadenceTargetCount: row.cadence_target_count,
    cadenceDayPolicy: row.cadence_day_policy,
    scheduleDays: [...row.schedule_days],
  };
}

function normalizeCadenceInput(
  body: HabitCadenceInput,
  currentCadence?: HabitInputCadence
): HabitInputCadence {
  const hasSchedule = hasOwnProperty(body, "scheduleDays");
  const requestedScheduleDays = hasSchedule
    ? ([...(body.scheduleDays as HabitWeekday[])] as HabitWeekday[])
    : [...(currentCadence?.scheduleDays ?? DEFAULT_WEEKDAYS)];
  const hasPeriod = hasOwnProperty(body, "cadencePeriod");
  const cadencePeriod = hasPeriod
    ? (body.cadencePeriod as HabitCadencePeriod)
    : (currentCadence?.cadencePeriod ?? getLegacyCadencePeriod(requestedScheduleDays));
  const hasPolicy = hasOwnProperty(body, "cadenceDayPolicy");
  const cadenceDayPolicy = hasPolicy
    ? (body.cadenceDayPolicy as HabitCadenceDayPolicy)
    : (currentCadence?.cadenceDayPolicy ?? (cadencePeriod === "monthly" ? "any" : "fixed"));
  if (
    hasSchedule &&
    (cadencePeriod === "daily" || cadenceDayPolicy === "any") &&
    !haveSameScheduleDays(requestedScheduleDays, DEFAULT_WEEKDAYS)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  const scheduleDays =
    cadencePeriod === "daily" || cadenceDayPolicy === "any"
      ? [...DEFAULT_WEEKDAYS]
      : requestedScheduleDays;
  const hasCount = hasOwnProperty(body, "cadenceTargetCount");
  const cadenceTargetCount = hasCount
    ? Number(body.cadenceTargetCount)
    : (currentCadence?.cadenceTargetCount ??
      (cadencePeriod === "daily" ? 1 : cadenceDayPolicy === "fixed" ? scheduleDays.length : 1));

  if (
    !isCadenceCountValidForPeriod(cadenceTargetCount, cadencePeriod) ||
    !isCanonicalCadenceShape(cadencePeriod, cadenceTargetCount, cadenceDayPolicy, scheduleDays)
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }

  return {
    cadencePeriod,
    cadenceTargetCount,
    cadenceDayPolicy,
    scheduleDays,
  };
}

function getHabitTypeInput(value: unknown, fallback: HabitType): HabitType {
  if (value === undefined) return fallback;
  if (!isOneOf(HABIT_TYPE_VALUES, value)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  return value;
}

function getHabitMode(
  value: unknown,
  input?: { habitType?: HabitType; timerEnabled?: unknown }
): HabitMode {
  if (isOneOf(HABIT_MODE_VALUES, value)) return value;
  if (input?.timerEnabled === true && input.habitType === "duration") return "timed";
  return "build";
}

function getHabitModeInput(
  value: unknown,
  fallback: HabitMode,
  input?: { habitType?: HabitType; timerEnabled?: unknown }
): HabitMode {
  if (value === undefined) return fallback;
  if (!isOneOf(HABIT_MODE_VALUES, value)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  return getHabitMode(value, input);
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
  if (value !== undefined && !isLocalDayDateKey(value)) {
    throw new Error("Choose a valid start date.");
  }
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

export function getHabitMotivationRangeStartDate(
  range: HabitMotivationRange,
  selectedDate: string
): string | null {
  switch (range) {
    case "week":
      return getCalendarWeekStartDate(selectedDate);
    case "month":
      return getCalendarMonthStartDate(selectedDate);
    case "three_months":
      return getCalendarQuarterStartDate(selectedDate);
    case "six_months":
      return getCalendarHalfYearStartDate(selectedDate);
    case "year":
      return getCalendarYearStartDate(selectedDate);
    case "all":
    default:
      return null;
  }
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

function getCalendarQuarterStartDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1)).toISOString().slice(0, 10);
}

function getCalendarHalfYearStartDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  const halfYearStartMonth = date.getUTCMonth() < 6 ? 0 : 6;
  return new Date(Date.UTC(date.getUTCFullYear(), halfYearStartMonth, 1))
    .toISOString()
    .slice(0, 10);
}

function getCalendarYearStartDate(dateKey: string): string {
  const parsed = Date.parse(`${dateKey}T00:00:00.000Z`);
  const date = Number.isNaN(parsed) ? new Date() : new Date(parsed);
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1)).toISOString().slice(0, 10);
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
  explicitSeconds: unknown,
  hasExplicitSeconds: boolean,
  explicitTimerEnabled: unknown,
  hasExplicitTimerEnabled: boolean
): number | null {
  if (habitMode !== "timed") {
    if (hasExplicitTimerEnabled && explicitTimerEnabled !== false) {
      throw new UnsupportedHabitDefinitionValueError();
    }
    return null;
  }

  if (hasExplicitTimerEnabled && explicitTimerEnabled !== true) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (targetValueNumeric === null || !isOneOf(HABIT_DURATION_UNIT_VALUES, targetUnit)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  const seconds = targetUnit === "seconds" ? targetValueNumeric : targetValueNumeric * 60;
  const resolvedSeconds = Math.round(seconds);
  if (
    !Number.isFinite(seconds) ||
    resolvedSeconds < 1 ||
    resolvedSeconds > HABIT_TIMER_MAX_SECONDS
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  if (!hasExplicitSeconds) return resolvedSeconds;
  if (explicitSeconds === null || Number(explicitSeconds) !== resolvedSeconds) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  return resolvedSeconds;
}

function getHabitShape(
  habitMode: HabitMode,
  habitType: HabitType,
  targetValueNumeric: unknown,
  targetUnit: unknown,
  targetTime: unknown,
  preservedOperator?: HabitOperator
) {
  if (habitMode === "quit") {
    if (
      (targetValueNumeric !== undefined && normalizePositiveNumber(targetValueNumeric) !== 0) ||
      (targetUnit !== undefined && targetUnit !== "times")
    ) {
      throw new UnsupportedHabitDefinitionValueError();
    }
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
      throw new UnsupportedHabitDefinitionValueError();
    }

    const unit = targetUnit === undefined ? "minutes" : targetUnit;
    if (!isOneOf(HABIT_DURATION_UNIT_VALUES, unit)) {
      throw new UnsupportedHabitDefinitionValueError();
    }
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
    if (!time) throw new UnsupportedHabitDefinitionValueError();
    return {
      habitType,
      targetOperator:
        preservedOperator === "after" || preservedOperator === "before"
          ? preservedOperator
          : ("before" as const),
      targetValueNumeric: null,
      targetUnit: null,
      targetTime: time,
    };
  }

  const value = normalizePositiveNumber(targetValueNumeric);
  if (value === null) {
    throw new UnsupportedHabitDefinitionValueError();
  }

  const unit =
    targetUnit === undefined ? (habitType === "duration" ? "minutes" : "times") : targetUnit;
  const allowedUnits =
    habitType === "duration"
      ? HABIT_DURATION_UNIT_VALUES
      : habitType === "count"
        ? HABIT_COUNT_UNIT_VALUES
        : HABIT_AVOIDANCE_UNIT_VALUES;
  if (!isOneOf(allowedUnits, unit)) {
    throw new UnsupportedHabitDefinitionValueError();
  }
  const defaultOperator = habitType === "avoidance" ? "at_most" : "at_least";
  const targetOperator =
    preservedOperator === "at_least" || preservedOperator === "at_most"
      ? preservedOperator
      : defaultOperator;

  return {
    habitType,
    targetOperator,
    targetValueNumeric: value,
    targetUnit: unit,
    targetTime: null,
  };
}

function getResolvedHabitType(habitMode: HabitMode, requestedHabitType: HabitType): HabitType {
  if (habitMode === "quit") return "avoidance";
  if (habitMode === "timed") return "duration";
  return requestedHabitType;
}

function hasTargetInput(body: HabitCreateRequestBody | HabitUpdateRequestBody): boolean {
  return [
    "habitType",
    "habitMode",
    "targetValueNumeric",
    "targetUnit",
    "targetTime",
    "timerEnabled",
    "timerTargetSeconds",
  ].some((field) => hasOwnProperty(body, field));
}

function haveSameScheduleDays(
  left: readonly HabitWeekday[],
  right: readonly HabitWeekday[]
): boolean {
  return left.length === right.length && left.every((day) => right.includes(day));
}

function haveSameCadence(left: HabitInputCadence, right: HabitInputCadence): boolean {
  return (
    left.cadencePeriod === right.cadencePeriod &&
    left.cadenceTargetCount === right.cadenceTargetCount &&
    left.cadenceDayPolicy === right.cadenceDayPolicy &&
    haveSameScheduleDays(left.scheduleDays, right.scheduleDays)
  );
}

function requireUsableHabitDefinitionCandidate(
  row: HabitDefinitionCore,
  requireCanonical = false
): void {
  const classification = classifyHabitDefinition(row);
  if (
    classification.kind === "unsupported" ||
    (requireCanonical && classification.kind !== "supported")
  ) {
    throw new UnsupportedHabitDefinitionValueError();
  }
}

export function buildHabitDefinitionInsert(
  userId: string,
  body: HabitCreateRequestBody,
  sortOrder: number,
  todayDate: string
): HabitDefinitionInsert {
  requireHabitWriteTodayDate(todayDate);
  validateHabitDefinitionCoreInput(body);
  const title = normalizeText(body.title, 80);
  if (!title || title.length < 2) {
    throw new Error("Give the habit a short name.");
  }

  if (
    body.startDate === undefined &&
    body.selectedDate !== undefined &&
    !isLocalDayDateKey(body.selectedDate)
  ) {
    throw new Error("Choose a valid start date.");
  }
  const selectedDate = isLocalDayDateKey(body.selectedDate) ? body.selectedDate : todayDate;
  const requestedHabitType = getHabitTypeInput(body.habitType, "binary");
  const defaultHabitMode =
    body.timerEnabled === true && requestedHabitType === "duration" ? "timed" : "build";
  const habitMode = getHabitModeInput(body.habitMode, defaultHabitMode, {
    habitType: requestedHabitType,
    timerEnabled: body.timerEnabled,
  });
  const startDate = normalizeHabitStartDate(body.startDate, selectedDate);
  if (isAfterHabitDate(startDate, todayDate)) {
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
    body.timerTargetSeconds,
    hasOwnProperty(body, "timerTargetSeconds"),
    body.timerEnabled,
    hasOwnProperty(body, "timerEnabled")
  );
  const cadence = normalizeCadenceInput(body);

  const insert = {
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
  } satisfies HabitDefinitionInsert;

  requireUsableHabitDefinitionCandidate(
    {
      id: "input-candidate",
      title,
      status: "active",
      habit_type: insert.habit_type,
      habit_mode: insert.habit_mode,
      category: insert.category,
      target_operator: insert.target_operator,
      target_value_numeric: insert.target_value_numeric,
      target_unit: insert.target_unit,
      target_time: insert.target_time,
      timer_enabled: insert.timer_enabled,
      timer_target_seconds: insert.timer_target_seconds,
      cadence_period: insert.cadence_period,
      cadence_target_count: insert.cadence_target_count,
      cadence_day_policy: insert.cadence_day_policy,
      schedule_days: insert.schedule_days,
    },
    true
  );

  return insert;
}

export function buildHabitDefinitionUpdate(
  body: HabitUpdateRequestBody,
  todayDate: string,
  currentHabit?: UsableHabitDefinitionRow
): HabitDefinitionUpdate {
  requireHabitWriteTodayDate(todayDate);
  validateHabitDefinitionCoreInput(body);
  const update: HabitDefinitionUpdate = {};

  if (hasOwnProperty(body, "title")) {
    const title = normalizeText(body.title, 80);
    if (!title || title.length < 2) throw new Error("Give the habit a short name.");
    if (!currentHabit || title !== currentHabit.title) update.title = title;
  }

  if (hasOwnProperty(body, "notes")) {
    const notes = normalizeOptionalText(body.notes, 280);
    if (!currentHabit || notes !== currentHabit.notes) update.notes = notes;
  }

  if (hasOwnProperty(body, "category")) {
    const category = getHabitCategory(body.category);
    if (!currentHabit || category !== currentHabit.category) update.category = category;
  }

  if (hasCadenceInput(body)) {
    const currentCadence = currentHabit ? getResolvedCadenceForRow(currentHabit) : undefined;
    const isLegacyCadence =
      currentHabit?.cadence_period === null || currentHabit?.cadence_period === undefined;
    if (
      isLegacyCadence &&
      !["cadencePeriod", "cadenceTargetCount", "cadenceDayPolicy", "scheduleDays"].every((field) =>
        hasOwnProperty(body, field)
      )
    ) {
      throw new UnsupportedHabitDefinitionValueError();
    }
    const cadence = normalizeCadenceInput(body, currentCadence);
    if (!currentCadence || (isLegacyCadence && !haveSameCadence(cadence, currentCadence))) {
      update.cadence_period = cadence.cadencePeriod;
      update.cadence_target_count = cadence.cadenceTargetCount;
      update.cadence_day_policy = cadence.cadenceDayPolicy;
      update.schedule_days = cadence.scheduleDays;
    } else if (!isLegacyCadence) {
      if (cadence.cadencePeriod !== currentCadence.cadencePeriod) {
        update.cadence_period = cadence.cadencePeriod;
      }
      if (cadence.cadenceTargetCount !== currentCadence.cadenceTargetCount) {
        update.cadence_target_count = cadence.cadenceTargetCount;
      }
      if (cadence.cadenceDayPolicy !== currentCadence.cadenceDayPolicy) {
        update.cadence_day_policy = cadence.cadenceDayPolicy;
      }
      if (!haveSameScheduleDays(cadence.scheduleDays, currentCadence.scheduleDays)) {
        update.schedule_days = cadence.scheduleDays;
      }
    }
  }

  if (hasOwnProperty(body, "isPerfectDayItem")) {
    const isPerfectDayItem = body.isPerfectDayItem === false ? false : true;
    if (!currentHabit || isPerfectDayItem !== currentHabit.is_perfect_day_item) {
      update.is_perfect_day_item = isPerfectDayItem;
    }
  }

  if (hasOwnProperty(body, "startDate")) {
    const selectedDate = normalizeHabitDate(body.selectedDate, buildUtcDate(todayDate));
    const startDate = normalizeHabitStartDate(body.startDate, selectedDate);
    if (isAfterHabitDate(startDate, todayDate)) {
      throw new Error("Choose today or an earlier start date.");
    }
    if (!currentHabit || startDate !== currentHabit.start_date) update.start_date = startDate;
  }

  if (hasOwnProperty(body, "status") && isOneOf(HABIT_STATUS_VALUES, body.status)) {
    if (!currentHabit || body.status !== currentHabit.status) update.status = body.status;
  }

  if (hasTargetInput(body)) {
    const requestedHabitType = getHabitTypeInput(
      body.habitType,
      currentHabit?.habit_type ?? "binary"
    );
    const habitMode = getHabitModeInput(
      body.habitMode,
      currentHabit?.habit_mode ??
        (body.timerEnabled === true && requestedHabitType === "duration" ? "timed" : "build"),
      {
        habitType: requestedHabitType,
        timerEnabled: body.timerEnabled,
      }
    );
    const resolvedHabitType = getResolvedHabitType(habitMode, requestedHabitType);
    const hasSameTypeAndMode =
      currentHabit?.habit_type === resolvedHabitType && currentHabit.habit_mode === habitMode;
    const preservesCurrentTargetValue =
      Boolean(hasSameTypeAndMode && currentHabit) &&
      (!hasOwnProperty(body, "targetValueNumeric") ||
        isSameStoredTargetNumberInput(
          body.targetValueNumeric,
          currentHabit?.target_value_numeric ?? null
        ));
    const preservesCurrentTargetTime =
      Boolean(hasSameTypeAndMode && currentHabit) &&
      (!hasOwnProperty(body, "targetTime") ||
        isSameStoredTargetTimeInput(body.targetTime, currentHabit?.target_time ?? null));
    const shape = getHabitShape(
      habitMode,
      resolvedHabitType,
      hasOwnProperty(body, "targetValueNumeric")
        ? body.targetValueNumeric
        : hasSameTypeAndMode
          ? currentHabit?.target_value_numeric
          : undefined,
      hasOwnProperty(body, "targetUnit")
        ? body.targetUnit
        : hasSameTypeAndMode
          ? currentHabit?.target_unit
          : undefined,
      hasOwnProperty(body, "targetTime")
        ? body.targetTime
        : hasSameTypeAndMode
          ? currentHabit?.target_time
          : undefined,
      hasSameTypeAndMode ? currentHabit?.target_operator : undefined
    );
    const targetValueNumeric = preservesCurrentTargetValue
      ? (currentHabit?.target_value_numeric ?? null)
      : shape.targetValueNumeric;
    const targetTime = preservesCurrentTargetTime
      ? (currentHabit?.target_time ?? null)
      : shape.targetTime;
    const hasExplicitTimerTargetSeconds = hasOwnProperty(body, "timerTargetSeconds");
    const hasMergedTimerTargetSeconds =
      hasExplicitTimerTargetSeconds || (Boolean(hasSameTypeAndMode) && habitMode === "timed");
    const timerTargetSecondsInput = hasExplicitTimerTargetSeconds
      ? body.timerTargetSeconds
      : hasMergedTimerTargetSeconds
        ? currentHabit?.timer_target_seconds
        : undefined;
    const hasExplicitTimerEnabled = hasOwnProperty(body, "timerEnabled");
    const hasMergedTimerEnabled = hasExplicitTimerEnabled || Boolean(hasSameTypeAndMode);
    const timerEnabledInput = hasExplicitTimerEnabled
      ? body.timerEnabled
      : hasMergedTimerEnabled
        ? currentHabit?.timer_enabled
        : undefined;
    const timerTargetSeconds = normalizeTimerTargetSeconds(
      habitMode,
      targetValueNumeric,
      shape.targetUnit as HabitUnit | null,
      timerTargetSecondsInput,
      hasMergedTimerTargetSeconds,
      timerEnabledInput,
      hasMergedTimerEnabled
    );
    const targetUpdate = {
      habit_mode: habitMode,
      habit_type: shape.habitType,
      target_operator: shape.targetOperator,
      target_value_numeric: targetValueNumeric,
      target_unit: shape.targetUnit,
      target_time: targetTime,
      timer_enabled: habitMode === "timed",
      timer_target_seconds: timerTargetSeconds,
    } satisfies Pick<
      HabitDefinitionUpdate,
      | "habit_mode"
      | "habit_type"
      | "target_operator"
      | "target_value_numeric"
      | "target_unit"
      | "target_time"
      | "timer_enabled"
      | "timer_target_seconds"
    >;
    for (const [field, value] of Object.entries(targetUpdate)) {
      if (!currentHabit || currentHabit[field as keyof typeof targetUpdate] !== value) {
        Object.assign(update, { [field]: value });
      }
    }
  }

  if (currentHabit) {
    requireUsableHabitDefinitionCandidate({
      ...currentHabit,
      ...update,
    });
  }

  return update;
}

export function buildHabitCheckInInsert(
  userId: string,
  body: HabitCheckInRequestBody,
  dateContext: HabitWriteDateContext
): HabitCheckInInsert {
  const now = dateContext?.now;
  const todayDate = dateContext?.todayDate;
  requireHabitWriteInstant(now);
  requireHabitWriteTodayDate(todayDate);
  const habitId = normalizeText(body.habitId, 80);
  if (!habitId) throw new Error("Choose a habit.");
  if (body.checkInDate !== undefined && !isLocalDayDateKey(body.checkInDate)) {
    throw new Error("Choose a valid check-in date.");
  }

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
  const sourceKind =
    body.status === "skipped" ? "manual" : hasTimedSourceValues ? "timer" : "manual";

  if (body.status !== "skipped" && valueNumeric === null && valueBoolean === null && !valueTime) {
    throw new Error("Add a check-in value.");
  }

  return {
    user_id: userId,
    habit_id: habitId,
    check_in_date: isLocalDayDateKey(body.checkInDate) ? body.checkInDate : todayDate,
    timezone: normalizeHabitTimezone(body.timezone),
    value_numeric: valueNumeric,
    value_boolean: valueBoolean,
    value_time: valueTime,
    timer_seconds: body.status === "skipped" ? 0 : timerSeconds,
    manual_minutes: body.status === "skipped" ? 0 : manualMinutes,
    note,
    source_kind: sourceKind,
    source_dryland_micro_plan_id: null,
    source_micro_block_id: null,
    source_completed_at: null,
    status: body.status === "skipped" ? "skipped" : "logged",
    completed_at: body.status === "skipped" ? null : now.toISOString(),
  };
}

export function buildHabitMotivationResetInsert(
  userId: string,
  habit: Pick<HabitDefinitionView, "id" | "startDate" | "status">,
  body: HabitMotivationResetRequestBody,
  todayDate: string
): HabitMotivationResetInsert {
  requireHabitWriteTodayDate(todayDate);
  if (habit.status !== "active") {
    throw new Error("Reset stats is only available for active habits.");
  }

  const effectiveDateInput =
    body.effectiveDate !== undefined ? body.effectiveDate : body.selectedDate;
  if (effectiveDateInput !== undefined && !isLocalDayDateKey(effectiveDateInput)) {
    throw new Error("Choose a valid reset date.");
  }
  const effectiveDate = normalizeHabitDate(effectiveDateInput, buildUtcDate(todayDate));
  if (effectiveDate > todayDate) {
    throw new Error("Choose today or an earlier reset date.");
  }

  if (effectiveDate < habit.startDate) {
    throw new Error("Choose a reset date on or after the habit start date.");
  }

  return {
    user_id: userId,
    habit_id: habit.id,
    reset_type: "reset_stats",
    status: "active",
    effective_date: effectiveDate,
    created_by: userId,
  };
}

export function buildHabitDefinitionView(
  row: UsableHabitDefinitionRow,
  options: { microSessionLink?: HabitMicroSessionLinkView | null } | number = {}
): HabitDefinitionView {
  const definition = classifyHabitDefinition<HabitDefinitionRow>(
    row as unknown as HabitDefinitionRow
  );
  if (definition.kind === "unsupported") {
    throw new Error(UNSUPPORTED_HABIT_DEFINITION_CODE);
  }
  const supportedRow = definition.row;
  const viewOptions = typeof options === "object" && options !== null ? options : {};
  const resolvedCadence: {
    cadencePeriod: HabitCadencePeriod;
    cadenceTargetCount: number;
    cadenceDayPolicy: HabitCadenceDayPolicy;
    scheduleDays: HabitWeekday[];
  } =
    definition.kind === "legacy_cadence"
      ? definition.resolvedCadence
      : {
          cadencePeriod: definition.row.cadence_period,
          cadenceTargetCount: definition.row.cadence_target_count,
          cadenceDayPolicy: definition.row.cadence_day_policy,
          scheduleDays: definition.row.schedule_days,
        };
  const { cadencePeriod, cadenceTargetCount, cadenceDayPolicy, scheduleDays } = resolvedCadence;
  const habitType = supportedRow.habit_type;
  const habitMode = supportedRow.habit_mode;
  const targetOperator = supportedRow.target_operator;
  const targetUnit = supportedRow.target_unit;

  return {
    id: supportedRow.id,
    title: supportedRow.title,
    notes: supportedRow.notes,
    habitMode,
    habitType,
    category: supportedRow.category,
    targetOperator,
    targetValueNumeric: supportedRow.target_value_numeric,
    targetUnit,
    targetTime: supportedRow.target_time,
    targetLabel: buildTargetLabel({
      habitMode,
      habitType,
      targetOperator,
      targetValueNumeric: supportedRow.target_value_numeric,
      targetUnit,
      targetTime: supportedRow.target_time,
    }),
    startDate: normalizeHabitDate(
      supportedRow.start_date,
      getSelectedDateFallback(supportedRow.created_at)
    ),
    lastLapseDate: supportedRow.last_lapse_date
      ? normalizeHabitDate(supportedRow.last_lapse_date)
      : null,
    timerEnabled: supportedRow.timer_enabled,
    timerTargetSeconds: supportedRow.timer_target_seconds,
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
    isPerfectDayItem: supportedRow.is_perfect_day_item,
    status: supportedRow.status,
    microSessionLink: viewOptions.microSessionLink ?? null,
    sortOrder: supportedRow.sort_order,
    createdAt: supportedRow.created_at,
    updatedAt: supportedRow.updated_at,
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
    status:
      row.status === "logged" || row.status === "skipped" ? row.status : ("unsupported" as const),
    sourceKind: isOneOf(HABIT_CHECK_IN_SOURCE_KIND_VALUES, row.source_kind)
      ? row.source_kind
      : "unsupported",
    sourceDrylandMicroPlanId: row.source_dryland_micro_plan_id,
    sourceMicroBlockId: row.source_micro_block_id,
    sourceCompletedAt: row.source_completed_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildHabitMotivationResetView(
  row: HabitMotivationResetRow
): HabitMotivationResetView {
  const resetType = isOneOf(HABIT_MOTIVATION_RESET_TYPE_VALUES, row.reset_type)
    ? row.reset_type
    : "unsupported";
  const status = isOneOf(HABIT_MOTIVATION_RESET_STATUS_VALUES, row.status)
    ? row.status
    : "unsupported";

  return {
    id: row.id,
    habitId: row.habit_id,
    resetType,
    status,
    effectiveDate: normalizeHabitDate(row.effective_date),
    createdAt: row.created_at,
    createdBy: row.created_by,
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
  return `Streak: ${formatDayCount(value)}.`;
}

function isRestDayCheckIn(checkIn: HabitCheckInView | null | undefined): boolean {
  return checkIn?.status === "skipped";
}

function isUnsupportedCheckIn(checkIn: HabitCheckInView | null | undefined): boolean {
  return checkIn?.status === "unsupported";
}

function isSupportedCheckIn(checkIn: HabitCheckInView | null | undefined): boolean {
  return checkIn?.status === "logged" || checkIn?.status === "skipped";
}

export function getEffectiveHabitDayStatus(
  date: string,
  dayStatuses: readonly HabitDayStatusView[] = [],
  checkIns: readonly HabitCheckInView[] = []
): HabitDayStatusState | null {
  if (checkIns.some((checkIn) => checkIn.checkInDate === date && isSupportedCheckIn(checkIn))) {
    return null;
  }

  let effectiveStatus: HabitDayStatusState | null = null;
  for (const candidate of dayStatuses) {
    if (candidate.reviewDate !== date) continue;
    if (candidate.dayStatus === "unsupported") return "unsupported";
    effectiveStatus = candidate.dayStatus;
  }
  return effectiveStatus;
}

export function getHabitDayStatusRangeEvidence(input: {
  periodStart: string;
  periodEnd: string;
  throughDate: string;
  dayStatuses?: readonly HabitDayStatusView[];
  precedenceCheckIns?: readonly HabitCheckInView[];
}) {
  const lastDate = input.periodEnd < input.throughDate ? input.periodEnd : input.throughDate;
  const statusDates = [
    ...new Set(
      (input.dayStatuses ?? [])
        .filter((status) => status.reviewDate >= input.periodStart && status.reviewDate <= lastDate)
        .map((status) => status.reviewDate)
    ),
  ];
  const effectiveStatuses = statusDates
    .map((reviewDate) =>
      getEffectiveHabitDayStatus(reviewDate, input.dayStatuses, input.precedenceCheckIns)
    )
    .filter((status): status is HabitDayStatusState => status !== null);

  return {
    notTrackedDayCount: effectiveStatuses.filter((status) => status === "not_tracked").length,
    hasUnsupportedDayStatus: effectiveStatuses.includes("unsupported"),
  };
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
  if (!checkIn || isRestDayCheckIn(checkIn) || isUnsupportedCheckIn(checkIn)) return false;

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
  checkIns: HabitCheckInView[],
  options?: HabitMetricOptions
): { valueLabel: string; supportingLabel: string | null; progressRatio: number } | null {
  if (!isDailyBuildMotivationCandidate(habit)) return null;
  if (isAfterHabitDate(habit.startDate, date)) return null;
  const precedenceCheckIns = options?.dayStatusPrecedenceCheckIns ?? checkIns;

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
    if (getEffectiveHabitDayStatus(day, options?.dayStatuses, precedenceCheckIns)) continue;
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
    if (getEffectiveHabitDayStatus(day, options?.dayStatuses, precedenceCheckIns)) break;
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
        : `${onTrackDays}/${trackedDays} days completed`,
    supportingLabel: currentStreak >= 5 ? `${onTrackDays}/${trackedDays} days completed` : null,
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
  checkIns: HabitCheckInView[],
  options?: HabitMetricOptions
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
  let daysSince = getDayDelta(anchorDate, date);
  let totalDays = getDayDelta(habit.startDate, date) + 1;
  const dayStatuses = options?.dayStatuses ?? [];
  const precedenceCheckIns = options?.dayStatusPrecedenceCheckIns ?? checkIns;
  const hasEffectiveDayStatus = dayStatuses.some(
    (status) =>
      status.reviewDate >= habit.startDate &&
      status.reviewDate <= date &&
      getEffectiveHabitDayStatus(status.reviewDate, dayStatuses, precedenceCheckIns) !== null
  );

  if (hasEffectiveDayStatus) {
    totalDays = 0;
    daysSince = 0;
    let continuityBroken = false;
    const totalCalendarDays = getDayDelta(habit.startDate, date);
    for (let index = 0; index <= totalCalendarDays; index += 1) {
      const day = addUtcDays(habit.startDate, index);
      if (getEffectiveHabitDayStatus(day, dayStatuses, precedenceCheckIns)) {
        continuityBroken = true;
        daysSince = 0;
        continue;
      }
      totalDays += 1;
      if (lapseDates.includes(day)) {
        continuityBroken = true;
        daysSince = 0;
        continue;
      }
      if (continuityBroken || day > habit.startDate) daysSince += 1;
    }
  }

  if (lapseDates.length > 0) {
    const onTrackDays = Math.max(0, totalDays - lapseDates.length);
    return {
      isSatisfied: !lapseLoggedToday,
      valueLabel: `${onTrackDays}/${totalDays} days clear`,
      stateLabel: lapseLoggedToday ? "Slip logged today" : "Clear today",
      supportingLabel: daysSince >= 5 ? `Current streak ${formatDayCount(daysSince)}` : null,
      progressRatio: Math.max(0, Math.min(1, onTrackDays / totalDays)),
    };
  }

  return {
    isSatisfied: true,
    valueLabel: `${formatDayCount(daysSince)} without`,
    stateLabel: "Clear today",
    supportingLabel: null,
    progressRatio: 1,
  };
}

export function evaluateHabitForDate(
  habit: HabitDefinitionView,
  checkIn: HabitCheckInView | null,
  date: string,
  checkIns: HabitCheckInView[] = checkIn ? [checkIn] : [],
  options?: HabitMetricOptions
): HabitEvaluation {
  if (isUnsupportedCheckIn(checkIn)) {
    return {
      isSatisfied: false,
      valueLabel: "Unsupported check-in",
      stateLabel: "Unsupported",
      supportingLabel: "Not counted",
      progressRatio: 0,
    };
  }

  if (habit.habitMode === "quit") {
    return evaluateQuitHabitForDate(habit, checkIn, date, checkIns, options);
  }

  if (!checkIn || isRestDayCheckIn(checkIn)) {
    const motivation = !isRestDayCheckIn(checkIn)
      ? getDailyBuildMotivation(habit, checkIn, date, checkIns, options)
      : null;
    return {
      isSatisfied: false,
      valueLabel: isRestDayCheckIn(checkIn) ? "Rest day" : (motivation?.valueLabel ?? "Open"),
      stateLabel: isRestDayCheckIn(checkIn) ? "Rest day" : "Open",
      supportingLabel: isRestDayCheckIn(checkIn)
        ? "Not counted as done or missed"
        : (motivation?.supportingLabel ?? null),
      progressRatio: motivation?.progressRatio ?? 0,
    };
  }

  if (habit.habitType === "binary") {
    const isSatisfied = checkIn.valueBoolean === true;
    const motivation = getDailyBuildMotivation(habit, checkIn, date, checkIns, options);
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
    not_tracked: 5,
    tracking_incomplete: 6,
    rest_day: 7,
    done_today: 8,
    done_period: 9,
    not_due: 10,
    archived: 11,
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

function countsTowardPerfectDay(item: HabitDayItem, date: string): boolean {
  if (!item.habit.isPerfectDayItem) return false;
  if (item.checkIn?.status === "skipped") return false;

  if (item.habit.cadenceDayPolicy !== "any" || item.habit.cadencePeriod === "daily") {
    return item.isScheduledForDate;
  }

  if (item.checkIn !== null) return true;
  if (item.cadenceProgress.isTargetMet) return false;
  return date === item.cadenceProgress.periodEnd;
}

function getAnyCadencePeriodTrackingState(
  item: HabitDayItem,
  checkIns: HabitCheckInView[],
  date: string,
  options?: HabitMetricOptions
): HabitDayItem["trackingState"] {
  if (item.habit.cadenceDayPolicy !== "any" || item.habit.cadencePeriod === "daily") {
    return "known";
  }
  if (item.cadenceProgress.isTargetMet || date !== item.cadenceProgress.periodEnd) {
    return "known";
  }

  const evidence = getHabitDayStatusRangeEvidence({
    periodStart:
      item.cadenceProgress.periodStart < item.habit.startDate
        ? item.habit.startDate
        : item.cadenceProgress.periodStart,
    periodEnd: item.cadenceProgress.periodEnd,
    throughDate: date,
    dayStatuses: options?.dayStatuses,
    precedenceCheckIns: options?.dayStatusPrecedenceCheckIns ?? checkIns,
  });
  if (evidence.hasUnsupportedDayStatus) return "needs_review";
  if (
    item.cadenceProgress.completedCount + evidence.notTrackedDayCount >=
    item.cadenceProgress.targetCount
  ) {
    return "incomplete";
  }
  return "known";
}

function applyHabitItemTrackingState(
  item: HabitDayItem,
  trackingState: Exclude<HabitDayItem["trackingState"], "known">,
  supportingLabel?: string
): HabitDayItem {
  const label = getHabitItemTrackingStateLabel(trackingState);
  return {
    ...item,
    evaluation: {
      isSatisfied: false,
      valueLabel: label,
      stateLabel: label,
      supportingLabel:
        supportingLabel ??
        (trackingState === "not_tracked"
          ? "Excluded from performance"
          : trackingState === "incomplete"
            ? "Cadence period excluded from performance"
            : "Status is not supported"),
      progressRatio: 0,
    },
    trackingState,
    priorityGroup: trackingState === "incomplete" ? "tracking_incomplete" : "not_tracked",
  };
}

export function buildHabitDaySummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  date: string,
  options?: HabitMetricOptions
): HabitDaySummary {
  const effectiveDayStatus = getEffectiveHabitDayStatus(
    date,
    options?.dayStatuses,
    options?.dayStatusPrecedenceCheckIns ?? checkIns
  );
  const trackingState =
    effectiveDayStatus === "not_tracked"
      ? "not_tracked"
      : effectiveDayStatus === "unsupported"
        ? "needs_review"
        : "known";
  const normalItems = habits.map((habit): HabitDayItem => {
    const checkIn = getCheckInForHabitDate(habit, checkIns, date);
    const evaluation = evaluateHabitForDate(habit, checkIn, date, checkIns, options);
    const cadenceProgress = buildHabitCadenceProgress(habit, checkIns, date);
    const isScheduledForDate = isHabitScheduledForDate(habit, date, checkIns);
    const item: HabitDayItem = {
      habit,
      checkIn,
      evaluation,
      cadenceProgress,
      isScheduledForDate,
      trackingState: "known",
      priorityGroup: getHabitPriorityGroup(
        habit,
        checkIn,
        evaluation,
        cadenceProgress,
        isScheduledForDate,
        date
      ),
    };
    const itemTrackingState = getAnyCadencePeriodTrackingState(item, checkIns, date, options);
    return itemTrackingState === "known"
      ? item
      : applyHabitItemTrackingState(
          item,
          itemTrackingState,
          itemTrackingState === "incomplete"
            ? "This cadence period is excluded from performance because tracking is incomplete"
            : undefined
        );
  });
  const potentialPerfectDayItems = normalItems.filter((item) => countsTowardPerfectDay(item, date));
  const items = normalItems
    .map((item): HabitDayItem => {
      if (trackingState === "known") return item;
      return applyHabitItemTrackingState(item, trackingState);
    })
    .sort(compareHabitDayItems);
  const perfectDayItems =
    trackingState === "known"
      ? potentialPerfectDayItems.filter((item) => item.trackingState === "known")
      : [];
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
  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialPerfectDayItems.length,
    knownUnitCount: perfectDayItemCount,
    successfulUnitCount: satisfiedPerfectDayItemCount,
    notTrackedDayCount:
      trackingState === "not_tracked" && potentialPerfectDayItems.length > 0 ? 1 : 0,
    hasUnsupportedDayStatus:
      trackingState === "needs_review" ||
      potentialPerfectDayItems.some((item) => item.trackingState === "needs_review"),
  });

  return {
    date,
    dayStatus: effectiveDayStatus,
    trackingState,
    scheduledHabitCount: items.filter((item) => item.isScheduledForDate).length,
    potentialPerfectDayItemCount: potentialPerfectDayItems.length,
    perfectDayItemCount,
    satisfiedPerfectDayItemCount,
    completionPercent: metricCoverage.performancePercent,
    isPerfectDay:
      perfectDayItemCount > 0 &&
      perfectDayItemCount === potentialPerfectDayItems.length &&
      satisfiedPerfectDayItemCount === perfectDayItemCount,
    completedDurationMinutes: trackingState === "known" ? completedDurationMinutes : 0,
    completedCountTotal: trackingState === "known" ? completedCountTotal : 0,
    metricCoverage,
    items,
  };
}

export function buildHabitWeekSummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  selectedDate: string,
  options?: HabitMetricOptions
): HabitWeekSummary {
  const weekStart = getCalendarWeekStartDate(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addUtcDays(weekStart, index);
    return buildHabitDaySummary(habits, checkIns, dateKey, options);
  });
  const potentialDays = days.filter((day) => day.potentialPerfectDayItemCount > 0);
  const knownDays = potentialDays.filter(
    (day) =>
      day.trackingState === "known" &&
      day.metricCoverage.state !== "needs_review" &&
      day.metricCoverage.knownUnitCount === day.metricCoverage.potentialUnitCount
  );
  const successfulDays = knownDays.filter((day) => day.isPerfectDay);
  const relevantDayStatuses = (options?.dayStatuses ?? []).filter(
    (status) =>
      status.reviewDate >= weekStart &&
      status.reviewDate <= addUtcDays(weekStart, 6) &&
      habits.some((habit) => habit.startDate <= status.reviewDate)
  );
  const weekStatusEvidence = getHabitDayStatusRangeEvidence({
    periodStart: weekStart,
    periodEnd: addUtcDays(weekStart, 6),
    throughDate: addUtcDays(weekStart, 6),
    dayStatuses: relevantDayStatuses,
    precedenceCheckIns: options?.dayStatusPrecedenceCheckIns ?? checkIns,
  });
  const hasUnsupportedDayStatus =
    weekStatusEvidence.hasUnsupportedDayStatus ||
    potentialDays.some(
      (day) => day.trackingState === "needs_review" || day.metricCoverage.state === "needs_review"
    );
  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialDays.length,
    knownUnitCount: knownDays.length,
    successfulUnitCount: successfulDays.length,
    notTrackedDayCount: weekStatusEvidence.notTrackedDayCount,
    hasUnsupportedDayStatus,
  });

  return {
    days,
    perfectDayCount: successfulDays.length,
    averageCompletionPercent:
      metricCoverage.state === "available"
        ? Math.round(
            knownDays.reduce((total, day) => total + (day.completionPercent ?? 0), 0) /
              knownDays.length
          )
        : null,
    totalDurationMinutes: days.reduce((total, day) => total + day.completedDurationMinutes, 0),
    totalCount: days.reduce((total, day) => total + day.completedCountTotal, 0),
    metricCoverage,
  };
}

function isHabitAbsenceReviewCandidateItem(item: HabitDayItem): boolean {
  if (item.habit.status !== "active") return false;
  if (!item.habit.isPerfectDayItem) return false;
  if (item.habit.habitMode === "quit") return false;
  if (item.habit.microSessionLink || item.checkIn?.sourceKind === "micro_session") return false;
  if (!item.isScheduledForDate || !item.cadenceProgress.isDueToday) return false;
  if (item.checkIn?.status === "skipped") return false;
  return !item.evaluation.isSatisfied;
}

export function getHabitAbsenceReviewCandidateDates(
  snapshot: HabitSnapshot,
  todayDate: string
): string[] {
  if (!isLocalDayDateKey(todayDate)) return [];
  const recordedCheckInDates = new Set(snapshot.absenceReviewRecordedCheckInDates ?? []);
  const notTrackedDates = new Set(
    (snapshot.dayStatuses ?? [])
      .filter((status) => status.dayStatus === "not_tracked")
      .map((status) => status.reviewDate)
  );
  const lastTrackedDate =
    snapshot.motivationSummaries?.all?.lastTrackedDate ??
    snapshot.motivationSummary?.lastTrackedDate ??
    null;
  const hasRecoveryHistory =
    Boolean(lastTrackedDate && lastTrackedDate < todayDate) ||
    snapshot.weekSummary.days.some(
      (day) => day.date < todayDate && day.items.some((item) => item.checkIn !== null)
    );
  if (!hasRecoveryHistory) return [];

  return snapshot.weekSummary.days
    .filter(
      (day) =>
        day.date < todayDate &&
        day.potentialPerfectDayItemCount > 0 &&
        !notTrackedDates.has(day.date) &&
        !recordedCheckInDates.has(day.date) &&
        !day.items.some((item) => item.checkIn !== null) &&
        day.items.some(isHabitAbsenceReviewCandidateItem)
    )
    .map((day) => day.date)
    .sort((left, right) => left.localeCompare(right));
}

function getCheckInsForHabit(
  habit: HabitDefinitionView,
  checkIns: HabitCheckInView[],
  historyStartDate: string,
  historyEndDate: string
) {
  const effectiveStartDate =
    habit.startDate > historyStartDate ? habit.startDate : historyStartDate;
  return checkIns
    .filter(
      (checkIn) =>
        checkIn.habitId === habit.id &&
        checkIn.checkInDate >= effectiveStartDate &&
        checkIn.checkInDate <= historyEndDate
    )
    .sort((left, right) => left.checkInDate.localeCompare(right.checkInDate));
}

function toResetBoundary(reset: HabitMotivationResetView): HabitMotivationResetBoundary {
  return {
    id: reset.id,
    effectiveDate: reset.effectiveDate,
    createdAt: reset.createdAt,
  };
}

function compareResetBoundaries(
  left: HabitMotivationResetBoundary,
  right: HabitMotivationResetBoundary
) {
  if (left.effectiveDate !== right.effectiveDate) {
    return right.effectiveDate.localeCompare(left.effectiveDate);
  }
  return right.createdAt.localeCompare(left.createdAt);
}

function getActiveMotivationResetBoundaries(
  habit: HabitDefinitionView,
  resetEvents: HabitMotivationResetView[],
  historyEndDate: string
): HabitMotivationResetBoundary[] {
  return resetEvents
    .filter(
      (reset) =>
        reset.habitId === habit.id &&
        reset.resetType === "reset_stats" &&
        reset.status === "active" &&
        reset.effectiveDate >= habit.startDate &&
        reset.effectiveDate <= historyEndDate
    )
    .map(toResetBoundary)
    .sort(compareResetBoundaries);
}

function getMotivationMetricStartDate(
  habit: HabitDefinitionView,
  historyStartDate: string,
  resetBoundary: HabitMotivationResetBoundary | null
) {
  let metricStartDate = habit.startDate > historyStartDate ? habit.startDate : historyStartDate;
  if (resetBoundary && resetBoundary.effectiveDate > metricStartDate) {
    metricStartDate = resetBoundary.effectiveDate;
  }
  return metricStartDate;
}

function buildBeforeResetSummary(
  habit: HabitDefinitionView,
  habitCheckIns: HabitCheckInView[],
  resetBoundary: HabitMotivationResetBoundary | null
): HabitMotivationBeforeResetSummary | null {
  if (!resetBoundary) return null;
  const historyEndDate = addUtcDays(resetBoundary.effectiveDate, -1);
  if (historyEndDate < habit.startDate) return null;
  const beforeResetCheckIns = habitCheckIns.filter(
    (checkIn) => checkIn.checkInDate < resetBoundary.effectiveDate
  );
  return {
    historyStartDate: habit.startDate,
    historyEndDate,
    savedCheckInCount: beforeResetCheckIns.length,
    lastTrackedDate:
      beforeResetCheckIns
        .map((checkIn) => checkIn.checkInDate)
        .sort()
        .at(-1) ?? null,
  };
}

function getCheckInsByDate(checkIns: HabitCheckInView[]) {
  const checkInsByDate = new Map<string, HabitCheckInView>();
  for (const checkIn of checkIns) {
    const existing = checkInsByDate.get(checkIn.checkInDate);
    if (!existing || existing.updatedAt < checkIn.updatedAt) {
      checkInsByDate.set(checkIn.checkInDate, checkIn);
    }
  }
  return checkInsByDate;
}

function getLoggedTimedMinutes(habit: HabitDefinitionView, checkIn: HabitCheckInView) {
  if (habit.habitMode !== "timed" || checkIn.status !== "logged") return 0;
  const totalSeconds =
    checkIn.timerSeconds + checkIn.manualMinutes * 60 + checkIn.legacyTimedSeconds;
  return Math.round((totalSeconds / 60) * 100) / 100;
}

function getLoggedCountTotal(habit: HabitDefinitionView, checkIn: HabitCheckInView) {
  if (habit.habitType !== "count" || checkIn.status !== "logged") return 0;
  return Math.max(0, checkIn.valueNumeric ?? 0);
}

function buildHabitScore(input: {
  eligibleDayCount: number;
  onTrackDayCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
}) {
  if (input.eligibleDayCount < 3) return null;
  const consistency = input.onTrackDayCount / input.eligibleDayCount;
  const currentStreakRatio = Math.min(
    1,
    input.currentStreakDays / Math.min(14, input.eligibleDayCount)
  );
  const bestStreakRatio = Math.min(1, input.bestStreakDays / Math.min(30, input.eligibleDayCount));
  return Math.max(
    0,
    Math.min(100, Math.round(consistency * 70 + currentStreakRatio * 20 + bestStreakRatio * 10))
  );
}

function buildPerfectDayMotivationStats(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  resetEvents: HabitMotivationResetView[],
  historyStartDate: string,
  historyEndDate: string,
  options?: HabitMetricOptions
) {
  const perfectDayHabits = habits
    .filter(
      (habit) =>
        habit.status === "active" &&
        habit.isPerfectDayItem &&
        !isAfterHabitDate(habit.startDate, historyEndDate)
    )
    .map((habit) => {
      const resetBoundary = getActiveMotivationResetBoundaries(
        habit,
        resetEvents,
        historyEndDate
      )[0];
      return resetBoundary && resetBoundary.effectiveDate > habit.startDate
        ? { ...habit, startDate: resetBoundary.effectiveDate }
        : habit;
    });
  let potentialDayCount = 0;
  let eligibleDayCount = 0;
  let perfectDayCount = 0;
  let notTrackedDayCount = 0;
  let hasUnsupportedDayStatus = false;
  let currentStreakDays = 0;
  let bestStreakDays = 0;
  let runningStreakDays = 0;

  if (perfectDayHabits.length === 0) {
    return {
      potentialDayCount,
      eligibleDayCount,
      perfectDayCount,
      notTrackedDayCount,
      currentStreakDays,
      bestStreakDays,
      consistencyPercent: null,
      metricCoverage: buildHabitMetricCoverage({
        potentialUnitCount: 0,
        knownUnitCount: 0,
        successfulUnitCount: 0,
      }),
    };
  }

  const totalDays = getDayDelta(historyStartDate, historyEndDate);
  const relevantDayStatuses = (options?.dayStatuses ?? []).filter(
    (status) =>
      status.reviewDate >= historyStartDate &&
      status.reviewDate <= historyEndDate &&
      perfectDayHabits.some((habit) => habit.startDate <= status.reviewDate)
  );
  const rangeStatusEvidence = getHabitDayStatusRangeEvidence({
    periodStart: historyStartDate,
    periodEnd: historyEndDate,
    throughDate: historyEndDate,
    dayStatuses: relevantDayStatuses,
    precedenceCheckIns: options?.dayStatusPrecedenceCheckIns ?? checkIns,
  });
  notTrackedDayCount = rangeStatusEvidence.notTrackedDayCount;
  hasUnsupportedDayStatus = rangeStatusEvidence.hasUnsupportedDayStatus;

  for (let index = 0; index <= totalDays; index += 1) {
    const day = addUtcDays(historyStartDate, index);
    const daySummary = buildHabitDaySummary(perfectDayHabits, checkIns, day, options);
    const hasPotentialPerfectDayItems = daySummary.potentialPerfectDayItemCount > 0;
    if (hasPotentialPerfectDayItems) potentialDayCount += 1;
    if (daySummary.trackingState === "not_tracked") {
      runningStreakDays = 0;
      continue;
    }
    if (
      daySummary.trackingState === "needs_review" ||
      daySummary.metricCoverage.state === "needs_review"
    ) {
      hasUnsupportedDayStatus = true;
      runningStreakDays = 0;
      continue;
    }
    if (!hasPotentialPerfectDayItems) continue;
    if (daySummary.metricCoverage.knownUnitCount !== daySummary.metricCoverage.potentialUnitCount) {
      runningStreakDays = 0;
      continue;
    }
    eligibleDayCount += 1;
    if (daySummary.isPerfectDay) {
      perfectDayCount += 1;
      runningStreakDays += 1;
      bestStreakDays = Math.max(bestStreakDays, runningStreakDays);
    } else {
      runningStreakDays = 0;
    }
  }

  for (let index = totalDays; index >= 0; index -= 1) {
    const day = addUtcDays(historyStartDate, index);
    const daySummary = buildHabitDaySummary(perfectDayHabits, checkIns, day, options);
    if (
      daySummary.trackingState !== "known" ||
      daySummary.metricCoverage.state === "needs_review"
    ) {
      break;
    }
    if (daySummary.potentialPerfectDayItemCount <= 0) continue;
    if (daySummary.metricCoverage.knownUnitCount !== daySummary.metricCoverage.potentialUnitCount) {
      break;
    }

    if (daySummary.isPerfectDay) {
      currentStreakDays += 1;
      continue;
    }

    const hasAnyCheckIn = daySummary.items.some((item) => item.checkIn !== null);
    if (day === historyEndDate && !hasAnyCheckIn) continue;
    break;
  }

  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialDayCount,
    knownUnitCount: eligibleDayCount,
    successfulUnitCount: perfectDayCount,
    notTrackedDayCount,
    hasUnsupportedDayStatus,
  });

  return {
    potentialDayCount,
    eligibleDayCount,
    perfectDayCount,
    notTrackedDayCount,
    currentStreakDays,
    bestStreakDays,
    consistencyPercent: metricCoverage.performancePercent,
    metricCoverage,
  };
}

function buildAnyCadencePeriodMotivationStats(
  habit: HabitDefinitionView,
  periodCheckIns: HabitCheckInView[],
  precedenceCheckIns: HabitCheckInView[],
  metricStartDate: string,
  periodEvidenceStartDate: string,
  historyEndDate: string,
  options?: HabitMetricOptions
) {
  const periods: Array<{ periodStart: string; periodEnd: string }> = [];
  let cursor = metricStartDate;
  let guard = 0;

  while (cursor <= historyEndDate && guard < 500) {
    const cadenceWindow = getHabitCadenceWindow(habit, cursor);
    const periodStart =
      cadenceWindow.periodStart < periodEvidenceStartDate
        ? periodEvidenceStartDate
        : cadenceWindow.periodStart;
    periods.push({ periodStart, periodEnd: cadenceWindow.periodEnd });
    cursor = addUtcDays(cadenceWindow.periodEnd, 1);
    guard += 1;
  }

  let potentialDayCount = 0;
  let eligibleDayCount = 0;
  let onTrackDayCount = 0;
  let notTrackedDayCount = 0;
  let unknownPeriodCount = 0;
  let hasUnsupportedDayStatus = false;
  let currentStreakDays = 0;
  let bestStreakDays = 0;
  let runningStreakDays = 0;
  let hasOpenPeriodContinuityGap = false;
  const periodOutcomes: Array<"met" | "met_with_gap" | "missed" | "unknown" | "needs_review"> = [];

  for (const period of periods) {
    const completedCount = countCadenceCompletions(
      habit,
      periodCheckIns,
      period.periodStart,
      period.periodEnd
    );
    const isTargetMet = completedCount >= habit.cadenceTargetCount;
    const isClosedPeriod = period.periodEnd <= historyEndDate;
    const periodStatusEvidence = getHabitDayStatusRangeEvidence({
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      throughDate: historyEndDate,
      dayStatuses: options?.dayStatuses,
      precedenceCheckIns,
    });
    const periodNotTrackedDayCount = periodStatusEvidence.notTrackedDayCount;
    const reportedPeriodStart =
      period.periodStart < metricStartDate ? metricStartDate : period.periodStart;
    const reportedPeriodStatusEvidence =
      reportedPeriodStart === period.periodStart
        ? periodStatusEvidence
        : getHabitDayStatusRangeEvidence({
            periodStart: reportedPeriodStart,
            periodEnd: period.periodEnd,
            throughDate: historyEndDate,
            dayStatuses: options?.dayStatuses,
            precedenceCheckIns,
          });
    notTrackedDayCount += reportedPeriodStatusEvidence.notTrackedDayCount;
    const periodHasUnsupportedDayStatus = periodStatusEvidence.hasUnsupportedDayStatus;

    // An open period that has not met its target is not yet a performance
    // opportunity. Its day-level coverage evidence still remains visible and
    // unknown values must still fail closed.
    if (!isTargetMet && !isClosedPeriod) {
      if (periodHasUnsupportedDayStatus) hasUnsupportedDayStatus = true;
      if (periodHasUnsupportedDayStatus || periodNotTrackedDayCount > 0) {
        hasOpenPeriodContinuityGap = true;
        runningStreakDays = 0;
      }
      continue;
    }

    potentialDayCount += 1;

    if (periodHasUnsupportedDayStatus) {
      hasUnsupportedDayStatus = true;
      periodOutcomes.push("needs_review");
      runningStreakDays = 0;
    } else if (isTargetMet) {
      eligibleDayCount += 1;
      onTrackDayCount += 1;
      if (periodNotTrackedDayCount > 0) {
        periodOutcomes.push("met_with_gap");
        runningStreakDays = 0;
      } else {
        periodOutcomes.push("met");
        runningStreakDays += 1;
        bestStreakDays = Math.max(bestStreakDays, runningStreakDays);
      }
    } else if (completedCount + periodNotTrackedDayCount >= habit.cadenceTargetCount) {
      unknownPeriodCount += 1;
      periodOutcomes.push("unknown");
      runningStreakDays = 0;
    } else {
      eligibleDayCount += 1;
      periodOutcomes.push("missed");
      runningStreakDays = 0;
    }
  }

  for (let index = periodOutcomes.length - 1; index >= 0; index -= 1) {
    if (periodOutcomes[index] !== "met") break;
    currentStreakDays += 1;
  }
  if (hasOpenPeriodContinuityGap) currentStreakDays = 0;

  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialDayCount,
    knownUnitCount: eligibleDayCount,
    successfulUnitCount: onTrackDayCount,
    notTrackedDayCount,
    hasUnsupportedDayStatus,
  });

  return {
    potentialDayCount,
    eligibleDayCount,
    onTrackDayCount,
    notTrackedDayCount,
    unknownPeriodCount,
    currentStreakDays,
    bestStreakDays,
    consistencyPercent: metricCoverage.performancePercent,
    metricCoverage,
  };
}

function buildNonQuitMotivationItem(
  habit: HabitDefinitionView,
  habitCheckIns: HabitCheckInView[],
  precedenceCheckIns: HabitCheckInView[],
  historyStartDate: string,
  historyEndDate: string,
  resetBoundaries: HabitMotivationResetBoundary[],
  beforeResetCheckIns: HabitCheckInView[],
  options?: HabitMetricOptions
): HabitMotivationItem {
  const resetBoundary = resetBoundaries[0] ?? null;
  const metricStartDate = getMotivationMetricStartDate(habit, historyStartDate, resetBoundary);
  const metricCheckIns = habitCheckIns.filter((checkIn) => checkIn.checkInDate >= metricStartDate);
  const checkInsByDate = getCheckInsByDate(metricCheckIns);
  const totalDays = getDayDelta(metricStartDate, historyEndDate);
  let potentialDayCount = 0;
  let eligibleDayCount = 0;
  let onTrackDayCount = 0;
  let notTrackedDayCount = 0;
  let hasUnsupportedDayStatus = false;
  let restDayCount = 0;
  let noteCount = 0;
  let totalTimedMinutes = 0;
  let totalCount = 0;
  let currentStreakDays = 0;
  let bestStreakDays = 0;
  let runningStreakDays = 0;
  let hasCurrentStreakBroken = false;

  for (const checkIn of metricCheckIns) {
    if (checkIn.note) noteCount += 1;
    totalTimedMinutes += getLoggedTimedMinutes(habit, checkIn);
    totalCount += getLoggedCountTotal(habit, checkIn);
  }

  if (habit.cadenceDayPolicy === "any" && habit.cadencePeriod !== "daily") {
    restDayCount = metricCheckIns.filter(isRestDayCheckIn).length;
    const cadencePeriodStart = getHabitCadenceWindow(habit, metricStartDate).periodStart;
    const lifecycleStartDate =
      resetBoundary && resetBoundary.effectiveDate > habit.startDate
        ? resetBoundary.effectiveDate
        : habit.startDate;
    const periodEvidenceStartDate =
      cadencePeriodStart < lifecycleStartDate ? lifecycleStartDate : cadencePeriodStart;
    const periodCheckIns = precedenceCheckIns.filter(
      (checkIn) =>
        checkIn.habitId === habit.id &&
        checkIn.checkInDate >= periodEvidenceStartDate &&
        checkIn.checkInDate <= historyEndDate
    );
    const periodStats = buildAnyCadencePeriodMotivationStats(
      habit,
      periodCheckIns,
      precedenceCheckIns,
      metricStartDate,
      periodEvidenceStartDate,
      historyEndDate,
      options
    );
    const habitScore =
      periodStats.metricCoverage.state === "available" ? buildHabitScore(periodStats) : null;

    return {
      habitId: habit.id,
      title: habit.title,
      status: habit.status,
      mode: habit.habitMode,
      startDate: habit.startDate,
      updatedAt: habit.updatedAt,
      motivationStartDate: metricStartDate,
      resetBoundary,
      resetBoundaries,
      beforeResetSummary: buildBeforeResetSummary(habit, beforeResetCheckIns, resetBoundary),
      lastTrackedDate: metricCheckIns.at(-1)?.checkInDate ?? null,
      potentialDayCount: periodStats.potentialDayCount,
      eligibleDayCount: periodStats.eligibleDayCount,
      onTrackDayCount: periodStats.onTrackDayCount,
      notTrackedDayCount: periodStats.notTrackedDayCount,
      unknownPeriodCount: periodStats.unknownPeriodCount,
      restDayCount,
      slipCount: 0,
      noteCount,
      currentStreakDays: periodStats.currentStreakDays,
      bestStreakDays: periodStats.bestStreakDays,
      consistencyPercent: periodStats.consistencyPercent,
      habitScore,
      totalTimedMinutes,
      totalCount,
      metricCoverage: periodStats.metricCoverage,
    };
  }

  for (let index = 0; index <= totalDays; index += 1) {
    const day = addUtcDays(metricStartDate, index);
    const checkIn = checkInsByDate.get(day) ?? null;
    const isScheduled = isHabitScheduledForDate(habit, day, metricCheckIns);
    if (!isScheduled && !checkIn) continue;

    if (isRestDayCheckIn(checkIn)) {
      restDayCount += 1;
      continue;
    }

    potentialDayCount += 1;
    const effectiveDayStatus = getEffectiveHabitDayStatus(
      day,
      options?.dayStatuses,
      precedenceCheckIns
    );
    if (effectiveDayStatus === "not_tracked") {
      notTrackedDayCount += 1;
      runningStreakDays = 0;
      continue;
    }
    if (effectiveDayStatus === "unsupported") {
      hasUnsupportedDayStatus = true;
      runningStreakDays = 0;
      continue;
    }

    const evaluation = evaluateHabitForDate(habit, checkIn, day, metricCheckIns, options);
    eligibleDayCount += 1;
    if (evaluation.isSatisfied) {
      onTrackDayCount += 1;
      runningStreakDays += 1;
      bestStreakDays = Math.max(bestStreakDays, runningStreakDays);
    } else {
      runningStreakDays = 0;
    }
  }

  for (let index = totalDays; index >= 0; index -= 1) {
    const day = addUtcDays(metricStartDate, index);
    const checkIn = checkInsByDate.get(day) ?? null;
    const isScheduled = isHabitScheduledForDate(habit, day, metricCheckIns);
    if (!isScheduled && !checkIn) continue;
    if (isRestDayCheckIn(checkIn)) continue;
    if (getEffectiveHabitDayStatus(day, options?.dayStatuses, precedenceCheckIns)) {
      hasCurrentStreakBroken = true;
      break;
    }
    const evaluation = evaluateHabitForDate(habit, checkIn, day, metricCheckIns, options);
    if (evaluation.isSatisfied) {
      currentStreakDays += 1;
      continue;
    }
    if (day === historyEndDate && !checkIn) continue;
    hasCurrentStreakBroken = true;
    break;
  }

  if (!hasCurrentStreakBroken && currentStreakDays === 0 && bestStreakDays > 0) {
    currentStreakDays = bestStreakDays;
  }

  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialDayCount,
    knownUnitCount: eligibleDayCount,
    successfulUnitCount: onTrackDayCount,
    notTrackedDayCount,
    hasUnsupportedDayStatus,
  });
  const consistencyPercent = metricCoverage.performancePercent;
  const habitScore =
    metricCoverage.state === "available"
      ? buildHabitScore({
          eligibleDayCount,
          onTrackDayCount,
          currentStreakDays,
          bestStreakDays,
        })
      : null;

  return {
    habitId: habit.id,
    title: habit.title,
    status: habit.status,
    mode: habit.habitMode,
    startDate: habit.startDate,
    updatedAt: habit.updatedAt,
    motivationStartDate: metricStartDate,
    resetBoundary,
    resetBoundaries,
    beforeResetSummary: buildBeforeResetSummary(habit, beforeResetCheckIns, resetBoundary),
    lastTrackedDate: metricCheckIns.at(-1)?.checkInDate ?? null,
    potentialDayCount,
    eligibleDayCount,
    onTrackDayCount,
    notTrackedDayCount,
    unknownPeriodCount: 0,
    restDayCount,
    slipCount: 0,
    noteCount,
    currentStreakDays,
    bestStreakDays,
    consistencyPercent,
    habitScore,
    totalTimedMinutes,
    totalCount,
    metricCoverage,
  };
}

function buildQuitMotivationItem(
  habit: HabitDefinitionView,
  habitCheckIns: HabitCheckInView[],
  precedenceCheckIns: HabitCheckInView[],
  historyStartDate: string,
  historyEndDate: string,
  resetBoundaries: HabitMotivationResetBoundary[],
  beforeResetCheckIns: HabitCheckInView[],
  options?: HabitMetricOptions
): HabitMotivationItem {
  const resetBoundary = resetBoundaries[0] ?? null;
  const metricStartDate = getMotivationMetricStartDate(habit, historyStartDate, resetBoundary);
  const metricCheckIns = habitCheckIns.filter((checkIn) => checkIn.checkInDate >= metricStartDate);
  const totalDays = getDayDelta(metricStartDate, historyEndDate);
  const latestMetricLapseDate =
    habit.lastLapseDate &&
    habit.lastLapseDate >= metricStartDate &&
    habit.lastLapseDate <= historyEndDate
      ? habit.lastLapseDate
      : null;
  const lapseDates = new Set(
    getQuitLapseDates(habit, null, metricCheckIns, historyEndDate).filter(
      (date) => date >= metricStartDate
    )
  );
  let noteCount = 0;
  let currentStreakDays = 0;
  let bestStreakDays = 0;
  let runningStreakDays = 0;
  let potentialDayCount = 0;
  let eligibleDayCount = 0;
  let onTrackDayCount = 0;
  let notTrackedDayCount = 0;
  let hasUnsupportedDayStatus = false;

  for (const checkIn of metricCheckIns) {
    if (checkIn.note) noteCount += 1;
  }

  for (let index = 0; index <= totalDays; index += 1) {
    const day = addUtcDays(metricStartDate, index);
    potentialDayCount += 1;
    const effectiveDayStatus = getEffectiveHabitDayStatus(
      day,
      options?.dayStatuses,
      precedenceCheckIns
    );
    if (effectiveDayStatus === "not_tracked") {
      notTrackedDayCount += 1;
      runningStreakDays = 0;
      continue;
    }
    if (effectiveDayStatus === "unsupported") {
      hasUnsupportedDayStatus = true;
      runningStreakDays = 0;
      continue;
    }

    eligibleDayCount += 1;
    if (lapseDates.has(day)) {
      runningStreakDays = 0;
      continue;
    }
    onTrackDayCount += 1;
    runningStreakDays += 1;
    bestStreakDays = Math.max(bestStreakDays, runningStreakDays);
  }

  for (let index = totalDays; index >= 0; index -= 1) {
    const day = addUtcDays(metricStartDate, index);
    if (getEffectiveHabitDayStatus(day, options?.dayStatuses, precedenceCheckIns)) break;
    if (lapseDates.has(day)) break;
    currentStreakDays += 1;
  }

  const slipCount = lapseDates.size;
  const metricCoverage = buildHabitMetricCoverage({
    potentialUnitCount: potentialDayCount,
    knownUnitCount: eligibleDayCount,
    successfulUnitCount: onTrackDayCount,
    notTrackedDayCount,
    hasUnsupportedDayStatus,
  });
  const consistencyPercent = metricCoverage.performancePercent;
  const habitScore =
    metricCoverage.state === "available"
      ? buildHabitScore({
          eligibleDayCount,
          onTrackDayCount,
          currentStreakDays,
          bestStreakDays,
        })
      : null;

  return {
    habitId: habit.id,
    title: habit.title,
    status: habit.status,
    mode: habit.habitMode,
    startDate: habit.startDate,
    updatedAt: habit.updatedAt,
    motivationStartDate: metricStartDate,
    resetBoundary,
    resetBoundaries,
    beforeResetSummary: buildBeforeResetSummary(habit, beforeResetCheckIns, resetBoundary),
    lastTrackedDate: metricCheckIns.at(-1)?.checkInDate ?? latestMetricLapseDate,
    potentialDayCount,
    eligibleDayCount,
    onTrackDayCount,
    notTrackedDayCount,
    unknownPeriodCount: 0,
    restDayCount: 0,
    slipCount,
    noteCount,
    currentStreakDays,
    bestStreakDays,
    consistencyPercent,
    habitScore,
    totalTimedMinutes: 0,
    totalCount: 0,
    metricCoverage,
  };
}

function compareMotivationItems(left: HabitMotivationItem, right: HabitMotivationItem) {
  if (left.status !== right.status) return left.status === "active" ? -1 : 1;
  const leftScore = left.habitScore ?? -1;
  const rightScore = right.habitScore ?? -1;
  if (leftScore !== rightScore) return rightScore - leftScore;
  if (left.bestStreakDays !== right.bestStreakDays)
    return right.bestStreakDays - left.bestStreakDays;
  return left.title.localeCompare(right.title);
}

export function buildHabitMotivationSummary(
  habits: HabitDefinitionView[],
  checkIns: HabitCheckInView[],
  selectedDate: string,
  options?: HabitMetricOptions & {
    historyStartDate?: string | null;
    resetEvents?: HabitMotivationResetView[];
  }
): HabitMotivationSummary {
  const historyEndDate = selectedDate;
  const resetEvents = options?.resetEvents ?? [];
  const metricOptions: HabitMetricOptions = {
    dayStatuses: options?.dayStatuses,
    dayStatusPrecedenceCheckIns: options?.dayStatusPrecedenceCheckIns ?? checkIns,
  };
  const earliestHabitStartDate =
    habits.reduce<string | null>(
      (earliest, habit) =>
        earliest === null || habit.startDate < earliest ? habit.startDate : earliest,
      null
    ) ?? selectedDate;
  const requestedHistoryStartDate = options?.historyStartDate ?? null;
  const historyStartDate =
    requestedHistoryStartDate && requestedHistoryStartDate > earliestHabitStartDate
      ? requestedHistoryStartDate > historyEndDate
        ? historyEndDate
        : requestedHistoryStartDate
      : earliestHabitStartDate;
  const items = habits
    .filter((habit) => !isAfterHabitDate(habit.startDate, historyEndDate))
    .map((habit) => {
      const resetBoundaries = getActiveMotivationResetBoundaries(
        habit,
        resetEvents,
        historyEndDate
      );
      const habitCheckIns = getCheckInsForHabit(habit, checkIns, historyStartDate, historyEndDate);
      const allHabitCheckIns = getCheckInsForHabit(
        habit,
        checkIns,
        habit.startDate,
        historyEndDate
      );
      return habit.habitMode === "quit"
        ? buildQuitMotivationItem(
            habit,
            habitCheckIns,
            checkIns,
            historyStartDate,
            historyEndDate,
            resetBoundaries,
            allHabitCheckIns,
            metricOptions
          )
        : buildNonQuitMotivationItem(
            habit,
            habitCheckIns,
            checkIns,
            historyStartDate,
            historyEndDate,
            resetBoundaries,
            allHabitCheckIns,
            metricOptions
          );
    })
    .sort(compareMotivationItems);
  const perfectDayStats = buildPerfectDayMotivationStats(
    habits,
    checkIns,
    resetEvents,
    historyStartDate,
    historyEndDate,
    metricOptions
  );

  return {
    historyStartDate,
    historyEndDate,
    activeHabitCount: habits.filter((habit) => habit.status === "active").length,
    archivedHabitCount: habits.filter((habit) => habit.status === "archived").length,
    lastTrackedDate:
      items
        .map((item) => item.lastTrackedDate)
        .filter((date): date is string => Boolean(date))
        .sort()
        .at(-1) ?? null,
    potentialDayCount: perfectDayStats.potentialDayCount,
    eligibleDayCount: perfectDayStats.eligibleDayCount,
    onTrackDayCount: perfectDayStats.perfectDayCount,
    notTrackedDayCount: perfectDayStats.notTrackedDayCount,
    restDayCount: items.reduce((total, item) => total + item.restDayCount, 0),
    slipCount: items.reduce((total, item) => total + item.slipCount, 0),
    noteCount: items.reduce((total, item) => total + item.noteCount, 0),
    currentStreakDays: perfectDayStats.currentStreakDays,
    bestStreakDays: perfectDayStats.bestStreakDays,
    consistencyPercent: perfectDayStats.consistencyPercent,
    habitScore: null,
    totalTimedMinutes:
      Math.round(items.reduce((total, item) => total + item.totalTimedMinutes, 0) * 100) / 100,
    totalCount: Math.round(items.reduce((total, item) => total + item.totalCount, 0) * 100) / 100,
    metricCoverage: perfectDayStats.metricCoverage,
    items,
  };
}
