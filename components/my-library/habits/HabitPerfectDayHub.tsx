"use client";

import {
  Archive,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Target,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useCallback,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  HABIT_CATEGORY_VALUES,
  HABIT_MANUAL_TIME_MAX_MINUTES,
  HABIT_MODE_VALUES,
  HABIT_MOTIVATION_RANGE_VALUES,
  type HabitDefinitionView,
  type HabitCadenceDayPolicy,
  type HabitCadencePeriod,
  type HabitDayItem,
  type HabitDaySummary,
  type HabitMode,
  type HabitMotivationItem,
  type HabitMotivationRange,
  type HabitMotivationSummary,
  type HabitOperator,
  type HabitSnapshot,
  type HabitType,
  type HabitUnit,
  type HabitWeekday,
} from "@/lib/habits/shared";
import { cx } from "@/components/ui/cx";
import { mobileActionItemClass, mobilePrimaryActionItemClass } from "@/components/ui/actionLayout";
import {
  addCalendarDays,
  buildMyLibraryCalendarHref,
  buildMyLibraryCalendarComparisonHref,
  buildMyLibraryCalendarWindow,
  getMyLibraryCalendarIsoWeek,
  getMyLibraryCalendarPeriodStartDate,
} from "@/lib/my-library/calendar";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";
import { playAppSoundProfile, type AppSoundPlaybackResult } from "@/lib/audio/client-sound";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

type Props = {
  initialSnapshot: HabitSnapshot;
  preferMobileActiveFocus?: boolean;
  todayDate?: string;
  userId?: string;
};

type ApiResponse = {
  ok?: boolean;
  error?: string;
  snapshot?: HabitSnapshot;
  reviewedDates?: string[];
};

type HabitDraft = {
  title: string;
  habitMode: HabitMode;
  habitType: HabitType;
  category: string;
  isPerfectDayItem: boolean;
  targetValueNumeric: string;
  targetUnit: HabitUnit;
  targetTime: string;
  startDate: string;
  notes: string;
  cadencePeriod: HabitCadencePeriod;
  cadenceTargetCount: string;
  cadenceDayPolicy: HabitCadenceDayPolicy;
  scheduleDays: HabitWeekday[];
};

type TimerState = {
  elapsedSeconds: number;
  startedAtMs: number | null;
};

type SaveTimedSourcesInput = {
  timerSeconds: number;
  manualMinutes: number;
  successNotice: string;
  clearLocalTimerOnSuccess: boolean;
};

type CatchUpEntry = {
  date: string;
  item: HabitDayItem;
};

type AbsenceReviewDate = {
  date: string;
  entries: CatchUpEntry[];
  reviewed: boolean;
};

type HabitTrackingModeView = {
  label: "Manual" | "Manual timed" | "Quit" | "Source-backed";
  summary: string;
  details: string;
};

type HabitFeedbackTone = "warning" | "error" | "success" | "empty";
type HabitFeedbackAnnouncement = "polite" | "assertive" | "none";
type MotivationPanel = "definitions";

type HabitFeedbackProps = {
  tone: HabitFeedbackTone;
  children: ReactNode;
  title?: ReactNode;
  announcement?: HabitFeedbackAnnouncement;
  className?: string;
  testId?: string;
};

type NumberStepperFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputAriaLabel?: string;
  inputMode?: "decimal" | "numeric";
  normalizeInputValue?: (value: string) => string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
};

const SEEN_HABIT_ROWS_STORAGE_KEY = "freeswimming:habits:v2:seen-row-ids";
const HABIT_ABSENCE_REVIEW_STORAGE_PREFIX = "freeswimming:habits:v1:absence-review";
const HABIT_ABSENCE_REVIEW_STORAGE_VERSION = 1;
const HABIT_TIMER_STORAGE_PREFIX = "freeswimming:habits:v3:timers";
const HABIT_TIMER_STORAGE_VERSION = 1;
const HABIT_SOUND_PREFERENCE_STORAGE_KEY = "freeswimming:habits:v1:sound";
const HABIT_SOUND_PREFERENCE_STORAGE_VERSION = 1;
const HABIT_SUCCESS_NOTICE_AUTO_DISMISS_MS = 3000;
const PAST_HABIT_PREVIEW_COUNT = 3;
const HABIT_WEEK_SWIPE_THRESHOLD_PX = 48;
const HABIT_WEEK_SWIPE_VERTICAL_TOLERANCE_PX = 40;
const WEEKDAY_LABELS: Record<HabitWeekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const ALL_HABIT_WEEKDAYS: HabitWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const BUILD_TARGET_TYPE_OPTIONS: HabitType[] = [
  "binary",
  "count",
  "duration",
  "time_of_day",
  "avoidance",
];
const HABIT_MOTIVATION_RANGE_LABELS: Record<HabitMotivationRange, string> = {
  week: "Week",
  month: "Month",
  three_months: "Quarter",
  six_months: "Half-year",
  year: "Year",
  all: "All",
};
const HABIT_MOTIVATION_RANGE_CONTEXT: Record<HabitMotivationRange, string> = {
  week: "This week",
  month: "This month",
  three_months: "This quarter",
  six_months: "This half-year",
  year: "This year",
  all: "All time",
};

function buildDefaultDraft(selectedDate: string): HabitDraft {
  return {
    title: "",
    habitMode: "build",
    habitType: "binary",
    category: "movement",
    isPerfectDayItem: true,
    targetValueNumeric: "10",
    targetUnit: "minutes",
    targetTime: "05:00",
    startDate: selectedDate,
    notes: "",
    cadencePeriod: "daily",
    cadenceTargetCount: "1",
    cadenceDayPolicy: "fixed",
    scheduleDays: [...ALL_HABIT_WEEKDAYS],
  };
}

function getWeekdayForDate(date: string): HabitWeekday {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return "monday";
  return ALL_HABIT_WEEKDAYS[(new Date(parsed).getUTCDay() + 6) % 7] ?? "monday";
}

function normalizeDraftScheduleDays(days: HabitWeekday[]) {
  const uniqueDays = ALL_HABIT_WEEKDAYS.filter((day) => days.includes(day));
  return uniqueDays.length > 0 ? uniqueDays : [...ALL_HABIT_WEEKDAYS];
}

function getScheduleDaysForDraft(draft: HabitDraft) {
  if (draft.cadencePeriod === "daily" || draft.cadenceDayPolicy === "any") {
    return [...ALL_HABIT_WEEKDAYS];
  }
  return normalizeDraftScheduleDays(draft.scheduleDays);
}

function getCadenceTargetCountForDraft(draft: HabitDraft) {
  if (draft.cadencePeriod === "daily") return 1;
  if (draft.cadenceDayPolicy === "fixed") return getScheduleDaysForDraft(draft).length;
  const max = draft.cadencePeriod === "monthly" ? 31 : 7;
  const parsed = Number(draft.cadenceTargetCount);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(max, Math.round(parsed)));
}

function buildDraftFromHabit(habit: HabitDefinitionView): HabitDraft {
  const scheduleDays = normalizeDraftScheduleDays(habit.scheduleDays);
  const habitMode = habit.habitMode;
  return {
    title: habit.title,
    habitMode,
    habitType:
      habitMode === "quit" ? "avoidance" : habitMode === "timed" ? "duration" : habit.habitType,
    category: habit.category,
    isPerfectDayItem: habit.isPerfectDayItem,
    targetValueNumeric:
      habitMode === "quit"
        ? "0"
        : habit.targetValueNumeric === null || habit.targetValueNumeric === undefined
          ? "10"
          : String(habit.targetValueNumeric),
    targetUnit:
      habitMode === "quit"
        ? "times"
        : (habit.targetUnit ?? getUnitOptions(habit.habitType)[0] ?? "times"),
    targetTime: habit.targetTime?.slice(0, 5) ?? "05:00",
    startDate: habit.startDate,
    notes: habit.notes ?? "",
    cadencePeriod: habit.cadencePeriod,
    cadenceTargetCount: String(habit.cadenceTargetCount),
    cadenceDayPolicy: habit.cadenceDayPolicy,
    scheduleDays,
  };
}

function getInputValue(item: HabitDayItem) {
  if (item.habit.habitType === "time_of_day") {
    return item.checkIn?.valueTime?.slice(0, 5) ?? "";
  }

  if (
    item.habit.habitType === "count" ||
    item.habit.habitType === "duration" ||
    item.habit.habitType === "avoidance"
  ) {
    if (item.habit.habitMode === "timed") return String(item.checkIn?.manualMinutes ?? 0);
    return item.checkIn?.valueNumeric === null || item.checkIn?.valueNumeric === undefined
      ? ""
      : String(item.checkIn.valueNumeric);
  }

  return "";
}

function buildInputState(snapshot: HabitSnapshot) {
  return Object.fromEntries(
    snapshot.daySummary.items.map((item) => [item.habit.id, getInputValue(item)])
  );
}

function getUnitOptions(habitType: HabitType): HabitUnit[] {
  if (habitType === "duration") return ["minutes", "seconds"];
  if (habitType === "count") return ["times", "steps", "pages", "glasses", "litres", "custom"];
  if (habitType === "avoidance") return ["times", "glasses", "litres", "custom"];
  return ["times"];
}

function getHabitUnitOptionLabel(unit: HabitUnit) {
  return unit.charAt(0).toUpperCase() + unit.slice(1);
}

function getResolvedDraftHabitType(draft: HabitDraft): HabitType {
  if (draft.habitMode === "quit") return "avoidance";
  if (draft.habitMode === "timed") return "duration";
  return draft.habitType;
}

function getDefaultTargetValueForHabitType(habitType: HabitType) {
  if (habitType === "avoidance") return "0";
  if (habitType === "count") return "1";
  if (habitType === "duration") return "10";
  return "10";
}

function applyHabitTypeToDraft(current: HabitDraft, habitType: HabitType): HabitDraft {
  const unitOptions = getUnitOptions(habitType);
  return {
    ...current,
    habitType,
    targetUnit: unitOptions[0] ?? "times",
    targetValueNumeric:
      current.habitType === habitType
        ? current.targetValueNumeric
        : getDefaultTargetValueForHabitType(habitType),
  };
}

function applyHabitModeToDraft(current: HabitDraft, mode: HabitMode): HabitDraft {
  if (mode === "build") {
    return {
      ...current,
      habitMode: mode,
      habitType: current.habitMode === "build" ? current.habitType : "binary",
      targetUnit: current.habitMode === "build" ? current.targetUnit : "times",
      targetValueNumeric: current.habitMode === "build" ? current.targetValueNumeric : "10",
    };
  }

  return {
    ...current,
    habitMode: mode,
    habitType: mode === "quit" ? "avoidance" : "duration",
    targetValueNumeric: mode === "quit" ? "0" : "10",
    targetUnit: mode === "timed" ? "minutes" : mode === "quit" ? "times" : current.targetUnit,
  };
}

function getTimerTargetSeconds(draft: HabitDraft) {
  const target = Number(draft.targetValueNumeric);
  if (!Number.isFinite(target) || target <= 0) return null;
  return draft.targetUnit === "seconds" ? Math.round(target) : Math.round(target * 60);
}

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getStepPrecision(step: number) {
  const [, decimal = ""] = String(step).split(".");
  return decimal.length;
}

function formatSteppedNumber(value: number, step: number) {
  const precision = getStepPrecision(step);
  const fixed = value.toFixed(precision);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}

function clampSteppedNumber(value: number, min: number, max?: number) {
  const lowerBounded = Math.max(min, value);
  return typeof max === "number" ? Math.min(max, lowerBounded) : lowerBounded;
}

function normalizeNumberInputValue(value: string, min: number, step: number, max?: number) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  if (normalized === "") return "";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return normalized;
  return formatSteppedNumber(clampSteppedNumber(parsed, min, max), step);
}

function normalizeManualMinutesInputValue(value: string) {
  const normalized = value
    .trim()
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  if (normalized === "") return "";
  if (/^\d+$/.test(normalized)) {
    return String(Math.min(HABIT_MANUAL_TIME_MAX_MINUTES, Number(normalized)));
  }
  return normalized.slice(0, 8);
}

function parseManualMinutesInput(value: string) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > HABIT_MANUAL_TIME_MAX_MINUTES) {
    return null;
  }
  return parsed;
}

function stepNumberInputValue(
  value: string,
  step: number,
  direction: 1 | -1,
  min: number,
  max?: number
) {
  const parsed = Number(value);
  const base = Number.isFinite(parsed) ? parsed : min;
  const next = clampSteppedNumber(base + step * direction, min, max);
  return formatSteppedNumber(next, step);
}

function getTimerTargetDisplaySeconds(habit: HabitDefinitionView) {
  if (habit.timerTargetSeconds && habit.timerTargetSeconds > 0) return habit.timerTargetSeconds;
  const target = habit.targetValueNumeric;
  if (!target || target <= 0) return null;
  return habit.targetUnit === "seconds" ? Math.round(target) : Math.round(target * 60);
}

function getSavedTimerSeconds(item: HabitDayItem) {
  return Math.max(0, item.checkIn?.timerSeconds ?? 0);
}

function getSavedManualMinutes(item: HabitDayItem) {
  return Math.max(0, item.checkIn?.manualMinutes ?? 0);
}

function getLegacyTimedSeconds(item: HabitDayItem) {
  return Math.max(0, item.checkIn?.legacyTimedSeconds ?? 0);
}

function getSavedTimedSeconds(item: HabitDayItem) {
  return (
    getSavedTimerSeconds(item) + getSavedManualMinutes(item) * 60 + getLegacyTimedSeconds(item)
  );
}

function getTimedProgressSeconds(item: HabitDayItem, timerSeconds: number) {
  return getSavedTimedSeconds(item) + Math.max(0, timerSeconds);
}

function getTimedStatusLabel(item: HabitDayItem, timerSeconds: number) {
  const progressSeconds = getTimedProgressSeconds(item, timerSeconds);
  const targetSeconds = getTimerTargetDisplaySeconds(item.habit);
  if (!targetSeconds) return `Total ${formatTimer(progressSeconds)} today`;
  return `Total ${formatTimer(progressSeconds)} / ${formatTimer(targetSeconds)} today`;
}

function getTimedTargetContextLabel(habit: HabitDefinitionView) {
  const targetSeconds = getTimerTargetDisplaySeconds(habit);
  if (!targetSeconds) return "today";
  return `/ ${formatTimer(targetSeconds)} today`;
}

function getWeekdayLabel(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function getLongDateLabel(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function getFullDateLabel(date: string) {
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(parsed));
}

function getMonthDayLabel(date: string) {
  return getLongDateLabel(date);
}

function getWeekRangeLabel(startDate: string, endDate: string) {
  return `${getMonthDayLabel(startDate)} - ${getMonthDayLabel(endDate)}`;
}

function getCompactFullDateRangeLabel(startDate: string, endDate: string) {
  const startParsed = Date.parse(`${startDate}T00:00:00.000Z`);
  const endParsed = Date.parse(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(startParsed) || Number.isNaN(endParsed)) {
    return `${getFullDateLabel(startDate)} - ${getFullDateLabel(endDate)}`;
  }

  const start = new Date(startParsed);
  const end = new Date(endParsed);
  const startMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(start);
  const endMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonth} ${startDay}-${endMonth} ${endDay}, ${startYear}`;
  }

  return `${getFullDateLabel(startDate)} - ${getFullDateLabel(endDate)}`;
}

function getSortableTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareArchivedMotivationItems(left: HabitMotivationItem, right: HabitMotivationItem) {
  const updatedDelta = getSortableTimestamp(right.updatedAt) - getSortableTimestamp(left.updatedAt);
  if (updatedDelta !== 0) return updatedDelta;
  return left.title.localeCompare(right.title);
}

function getSelectedDateDisplayLabel(selectedDate: string, todayDate: string) {
  return selectedDate === todayDate ? "Today" : getFullDateLabel(selectedDate);
}

function getSelectedDateContextLabel(selectedDate: string, todayDate: string) {
  return selectedDate === todayDate
    ? `Today · ${getLongDateLabel(selectedDate)}`
    : `${getWeekdayLabel(selectedDate)} · ${getLongDateLabel(selectedDate)}`;
}

function formatMetricDays(value: number) {
  if (value <= 0) return "0 days";
  return `${value} ${value === 1 ? "day" : "days"}`;
}

function formatMetricPercent(value: number | null) {
  return `${value ?? 0}%`;
}

function formatPerfectDayCount(summary: HabitMotivationSummary) {
  return `${summary.onTrackDayCount}/${summary.eligibleDayCount}`;
}

function getMotivationDataQuality(summary: HabitMotivationSummary): {
  label: string;
  tone: "muted" | "warning";
} | null {
  if (summary.eligibleDayCount <= 0) {
    return {
      label: "No scheduled Perfect Day days in this period.",
      tone: "muted",
    };
  }

  return null;
}

function formatHistoryRange(summary: HabitMotivationSummary) {
  if (summary.historyStartDate === summary.historyEndDate) {
    return getFullDateLabel(summary.historyEndDate);
  }
  return `${getFullDateLabel(summary.historyStartDate)} - ${getFullDateLabel(
    summary.historyEndDate
  )}`;
}

function formatMotivationRangeLabel(summary: HabitMotivationSummary, range: HabitMotivationRange) {
  const context = HABIT_MOTIVATION_RANGE_CONTEXT[range];
  if (range === "week") {
    const { weekNumber } = getMyLibraryCalendarIsoWeek(summary.historyStartDate);
    const weekEndDate = addCalendarDays(summary.historyStartDate, 6);
    return `${context} · Week ${weekNumber} · ${getCompactFullDateRangeLabel(
      summary.historyStartDate,
      weekEndDate
    )}`;
  }
  return `${context} · ${formatHistoryRange(summary)}`;
}

function getHabitPeriodStatusFragment(
  items: HabitDayItem[],
  cadencePeriod: Extract<HabitCadencePeriod, "weekly" | "monthly">,
  label: string
) {
  const periodItems = items.filter(
    (item) =>
      item.habit.status === "active" &&
      item.habit.cadencePeriod === cadencePeriod &&
      item.habit.startDate <= item.cadenceProgress.periodEnd
  );
  if (periodItems.length === 0) return null;

  const satisfiedCount = periodItems.reduce(
    (total, item) =>
      total + Math.min(item.cadenceProgress.completedCount, item.cadenceProgress.targetCount),
    0
  );
  const targetCount = periodItems.reduce(
    (total, item) => total + item.cadenceProgress.targetCount,
    0
  );
  return `${label}: ${satisfiedCount}/${targetCount}`;
}

function getHabitsStatusLabel(snapshot: HabitSnapshot, dayLabel = "Today") {
  const dailyCounts = getHabitDayDailyCounts(snapshot.daySummary);
  const fragments = [
    `${dayLabel}: ${dailyCounts.completed}/${dailyCounts.total}`,
    getHabitPeriodStatusFragment(snapshot.daySummary.items, "weekly", "Week"),
    getHabitPeriodStatusFragment(snapshot.daySummary.items, "monthly", "Month"),
  ].filter((fragment): fragment is string => Boolean(fragment));

  return fragments.join(" · ");
}

function getBuildTargetChoiceLabel(type: HabitType) {
  switch (type) {
    case "count":
      return "Specific count";
    case "duration":
      return "Duration target";
    case "time_of_day":
      return "Time of day";
    case "avoidance":
      return "Avoid/limit";
    case "binary":
    default:
      return "Done only";
  }
}

function getBuildTargetChoiceContext(type: HabitType) {
  switch (type) {
    case "count":
      return "Fixed amount";
    case "duration":
      return "Manual time";
    case "time_of_day":
      return "Clock target";
    case "avoidance":
      return "Stay under";
    case "binary":
    default:
      return "Any amount";
  }
}

function getHabitModeLabel(mode: HabitMode) {
  switch (mode) {
    case "quit":
      return "Quit";
    case "timed":
      return "Timed";
    case "build":
    default:
      return "Do";
  }
}

function formatMotivationLabel(label: string) {
  const streakMatch = label.match(/^(\d+)-day streak$/);
  if (streakMatch?.[1]) {
    return `Streak: ${streakMatch[1]} days.`;
  }
  const doneDaysMatch = label.match(/^(\d+)\/(\d+) days (?:hit|completed)$/);
  if (doneDaysMatch?.[1] && doneDaysMatch[2]) {
    return `${doneDaysMatch[1]}/${doneDaysMatch[2]} days completed`;
  }
  return label;
}

function getPriorityGroupKey(item: HabitDayItem) {
  return item.priorityGroup === "done_period"
    ? `${item.priorityGroup}-${item.cadenceProgress.periodLabel}`
    : item.priorityGroup;
}

function getCompletionStatusLabel(item: HabitDayItem) {
  return item.priorityGroup === "done_period"
    ? `Done ${item.cadenceProgress.periodLabel}`
    : "Done today";
}

function getBuildMotivationLabel(item: HabitDayItem) {
  if (item.habit.habitMode !== "build" || item.habit.habitType !== "binary") return null;
  if (
    item.evaluation.valueLabel === "Done" ||
    item.evaluation.valueLabel === "No check-in" ||
    item.evaluation.valueLabel === "Open" ||
    item.evaluation.valueLabel === "Rest day"
  ) {
    return null;
  }
  return formatMotivationLabel(item.evaluation.valueLabel);
}

function getBuildOpenStatusLabel(item: HabitDayItem) {
  const motivationLabel = getBuildMotivationLabel(item);
  if (!motivationLabel) return item.evaluation.valueLabel;
  return motivationLabel;
}

function getBuildCompletionMotivationLabel(item: HabitDayItem) {
  const motivationLabel = getBuildMotivationLabel(item);
  return motivationLabel?.startsWith("Streak:") ? motivationLabel : null;
}

function shouldShowStatusChipOnMobile(statusLabel: string) {
  return (
    statusLabel === "Done today" ||
    statusLabel.startsWith("Done this ") ||
    statusLabel === "Slip logged today" ||
    statusLabel === "Rest day"
  );
}

function getCadenceStreakUnit(period: HabitCadencePeriod) {
  switch (period) {
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "daily":
    default:
      return "day";
  }
}

function formatCadenceStreak(value: number, period: HabitCadencePeriod) {
  const unit = getCadenceStreakUnit(period);
  return `Streak: ${value} ${unit}${value === 1 ? "" : "s"}.`;
}

function getStartStreakPrompt(period: HabitCadencePeriod) {
  switch (period) {
    case "weekly":
      return "Complete this week to start your streak";
    case "monthly":
      return "Complete this month to start your streak";
    case "daily":
    default:
      return "Complete today to start your streak";
  }
}

function normalizeQuitClearDaysLabel(label: string) {
  const daysWithoutMatch = label.match(/^(\d+) days? without$/);
  if (daysWithoutMatch?.[1]) {
    const count = Number(daysWithoutMatch[1]);
    return `${count} clear ${count === 1 ? "day" : "days"}`;
  }

  if (/^\d+\/\d+ days clear$/.test(label)) return label;
  return null;
}

function getClosedCardMotivationLabel(
  item: HabitDayItem,
  motivationItem: HabitMotivationItem | undefined
) {
  const habit = item.habit;
  const currentStreak = motivationItem?.currentStreakDays ?? 0;
  if (habit.habitMode === "quit") {
    const quitEvaluationLabel = normalizeQuitClearDaysLabel(item.evaluation.valueLabel);
    if (motivationItem && motivationItem.slipCount > 0 && motivationItem.eligibleDayCount > 0) {
      return `${motivationItem.onTrackDayCount}/${motivationItem.eligibleDayCount} days clear`;
    }
    if (quitEvaluationLabel) return quitEvaluationLabel;
    if (currentStreak > 0) return `${currentStreak} clear days`;
    return "No slips logged in this range";
  }
  if (currentStreak > 0) return formatCadenceStreak(currentStreak, habit.cadencePeriod);
  return getStartStreakPrompt(habit.cadencePeriod);
}

function isMicroSessionBackedHabit(item: HabitDayItem) {
  return Boolean(item.habit.microSessionLink) || item.checkIn?.sourceKind === "micro_session";
}

function getMicroSessionProgress(item: HabitDayItem) {
  const progress = item.habit.microSessionLink?.progress ?? null;
  if (progress) return progress;

  if (item.checkIn?.sourceKind === "micro_session" && item.evaluation.isSatisfied) {
    return {
      totalBlockCount: 1,
      completedBlockCount: 1,
      skippedBlockCount: 0,
      remainingBlockCount: 0,
      progressPercent: 100,
    };
  }

  return null;
}

function getMicroSessionProgressLabel(item: HabitDayItem) {
  const progress = getMicroSessionProgress(item);
  if (!progress) return "Go to Micro Sessions";

  return `${progress.completedBlockCount}/${progress.totalBlockCount} units · ${progress.progressPercent}%`;
}

function getMicroSessionHabitCardLabel(item: HabitDayItem) {
  if (item.evaluation.isSatisfied) return "Auto-completed from Micro Sessions.";
  if (item.habit.microSessionLink?.status === "paused") {
    return "Micro Sessions are linked, but Habit counting is paused.";
  }
  return "Auto-completes when every Micro Session unit is done.";
}

function getHabitTrackingModeView(item: HabitDayItem): HabitTrackingModeView {
  if (isMicroSessionBackedHabit(item)) {
    return {
      label: "Source-backed",
      summary: "Completed by Micro Sessions when every linked unit is done.",
      details:
        "Habits does not show Mark done for this source-backed habit. Use Micro Sessions to complete, pause, or resume the linked source.",
    };
  }

  if (item.habit.habitMode === "quit") {
    return {
      label: "Quit",
      summary: "Counts clear days until you log a slip.",
      details:
        "No slip is logged automatically at day change. Use Log slip only on the date where the slip happened.",
    };
  }

  if (item.habit.habitMode === "timed") {
    return {
      label: "Manual timed",
      summary: "Use the timer, Finish, or Save manual time.",
      details:
        "Timed habits do not complete just because the timer reaches target. Save with Finish or Save manual time when the work is done.",
    };
  }

  return {
    label: "Manual",
    summary: "Use Mark done or Save when this is completed.",
    details:
      "There is no automatic daily increment. Missed days stay derived until you backfill, mark Rest day, or leave them missed.",
  };
}

function isCatchUpCandidateItem(item: HabitDayItem) {
  if (item.habit.status !== "active") return false;
  if (!item.habit.isPerfectDayItem) return false;
  if (item.habit.habitMode === "quit") return false;
  if (isMicroSessionBackedHabit(item)) return false;
  if (!item.isScheduledForDate || !item.cadenceProgress.isDueToday) return false;
  if (item.checkIn?.status === "skipped") return false;
  return !item.evaluation.isSatisfied;
}

function getCatchUpCandidateItems(day: HabitDaySummary) {
  return day.items.filter(isCatchUpCandidateItem);
}

function hasCatchUpRecoveryHistory(snapshot: HabitSnapshot, todayDate: string) {
  const lastTrackedDate =
    snapshot.motivationSummaries?.all?.lastTrackedDate ??
    snapshot.motivationSummary?.lastTrackedDate ??
    null;
  if (lastTrackedDate && lastTrackedDate < todayDate) return true;

  return snapshot.weekSummary.days.some(
    (day) => day.date < todayDate && day.items.some((item) => item.checkIn !== null)
  );
}

function getCatchUpEntries(snapshot: HabitSnapshot, todayDate: string): CatchUpEntry[] {
  if (!hasCatchUpRecoveryHistory(snapshot, todayDate)) return [];

  return snapshot.weekSummary.days
    .filter((day) => day.date < todayDate && day.perfectDayItemCount > 0)
    .flatMap((day) =>
      getCatchUpCandidateItems(day).map((item) => ({
        date: day.date,
        item,
      }))
    );
}

function getSortedCatchUpDates(entries: CatchUpEntry[]) {
  return [...new Set(entries.map((entry) => entry.date))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function getAbsenceReviewDates(
  entries: CatchUpEntry[],
  reviewedDates: Set<string>
): AbsenceReviewDate[] {
  const entriesByDate = new Map<string, CatchUpEntry[]>();
  for (const entry of entries) {
    const current = entriesByDate.get(entry.date) ?? [];
    current.push(entry);
    entriesByDate.set(entry.date, current);
  }

  return [...entriesByDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, dateEntries]) => ({
      date,
      entries: dateEntries,
      reviewed: reviewedDates.has(date),
    }));
}

function getAbsenceReviewTitle(dateCount: number) {
  return `${dateCount} ${dateCount === 1 ? "day" : "days"} to check`;
}

function getAbsenceReviewHabitCountLabel(entryCount: number) {
  return `${entryCount} ${entryCount === 1 ? "habit" : "habits"}`;
}

function getAbsenceReviewProgressLabel(rows: AbsenceReviewDate[]) {
  const reviewedCount = rows.filter((row) => row.reviewed).length;
  return `${reviewedCount} of ${rows.length} checked`;
}

function getAbsenceReviewRemainingLabel(rows: AbsenceReviewDate[]) {
  const remainingCount = rows.filter((row) => !row.reviewed).length;
  if (remainingCount === 0) return "Review complete";
  return `${remainingCount} ${remainingCount === 1 ? "day" : "days"} left`;
}

function getHabitDayTargetCountLabel(day: HabitDaySummary) {
  const counts = getHabitDayDailyCounts(day);
  if (counts.total === 0) return "No habits";
  return `${counts.completed}/${counts.total} habits`;
}

function getHabitDayDailyCounts(day: HabitDaySummary) {
  const items = day.items.filter(
    (item) =>
      item.habit.cadencePeriod === "daily" &&
      item.habit.isPerfectDayItem &&
      item.isScheduledForDate &&
      item.checkIn?.status !== "skipped"
  );
  return {
    completed: items.filter((item) => item.evaluation.isSatisfied).length,
    total: items.length,
  };
}

function getHabitDayWeeklyItems(day: HabitDaySummary) {
  return day.items.filter(
    (item) =>
      item.habit.cadencePeriod === "weekly" &&
      item.habit.isPerfectDayItem &&
      item.habit.startDate <= item.cadenceProgress.periodEnd
  );
}

function getHabitDayWeeklyCompletedOnDateCount(day: HabitDaySummary) {
  return getHabitDayWeeklyItems(day).filter(
    (item) => item.checkIn !== null && item.evaluation.isSatisfied
  ).length;
}

function getHabitWeekCountSummary(days: HabitDaySummary[], todayDate: string) {
  const countedDays = days.filter((day) => day.date <= todayDate);
  const daily = countedDays.reduce(
    (totals, day) => {
      const counts = getHabitDayDailyCounts(day);
      return {
        completed: totals.completed + counts.completed,
        total: totals.total + counts.total,
      };
    },
    { completed: 0, total: 0 }
  );
  const latestDay = [...countedDays].reverse()[0] ?? null;
  const weeklyItems = latestDay ? getHabitDayWeeklyItems(latestDay) : [];
  const weekly = weeklyItems.reduce(
    (totals, item) => ({
      completed:
        totals.completed +
        Math.min(item.cadenceProgress.completedCount, item.cadenceProgress.targetCount),
      total: totals.total + item.cadenceProgress.targetCount,
    }),
    { completed: 0, total: 0 }
  );

  return { daily, weekly };
}

function getNextUnreviewedAbsenceDate(
  rows: AbsenceReviewDate[],
  selectedDate: string
): string | null {
  const unreviewed = rows.filter((row) => !row.reviewed).map((row) => row.date);
  if (unreviewed.length === 0) return null;
  return (
    unreviewed.find((date) => date > selectedDate) ??
    unreviewed.find((date) => date !== selectedDate) ??
    unreviewed[0] ??
    null
  );
}

function getNextUnreviewedAbsenceDateAfterChecking(
  rows: AbsenceReviewDate[],
  selectedDate: string
): string | null {
  const remaining = rows
    .filter((row) => !row.reviewed && row.date !== selectedDate)
    .map((row) => row.date);
  if (remaining.length === 0) return null;
  return (
    remaining.find((date) => date > selectedDate) ??
    remaining.find((date) => date !== selectedDate) ??
    remaining[0] ??
    null
  );
}

function getPriorityGroupLabel(item: HabitDayItem) {
  switch (item.priorityGroup) {
    case "due_build":
      return "Action needed";
    case "due_timed":
      return "Timed today";
    case "due_weekly":
      return "This week";
    case "due_monthly":
      return "This month";
    case "quit_status":
      return "Quit status";
    case "rest_day":
      return "Rest day";
    case "done_today":
    case "done_period":
      return getCompletionStatusLabel(item);
    case "archived":
      return "Archived";
    case "not_due":
    default:
      return "Later";
  }
}

function getCategoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDisplayUnit(unit: HabitUnit | null, value: number) {
  const plural = value === 1 ? "" : "s";
  switch (unit) {
    case "glasses":
      return value === 1 ? "glass" : "glasses";
    case "litres":
      return value === 1 ? "litre" : "litres";
    case "minutes":
      return value === 1 ? "minute" : "minutes";
    case "seconds":
      return value === 1 ? "second" : "seconds";
    case "steps":
      return value === 1 ? "step" : "steps";
    case "pages":
      return value === 1 ? "page" : "pages";
    case "times":
      return value === 1 ? "time" : "times";
    case "custom":
      return value === 1 ? "unit" : "units";
    default:
      return `time${plural}`;
  }
}

function formatCountValue(value: number, unit: HabitUnit | null) {
  return `${value} ${getDisplayUnit(unit, value)}`;
}

function getCountTargetPrefix(operator: HabitOperator) {
  switch (operator) {
    case "at_most":
      return "Limit";
    case "at_least":
      return "Goal";
    case "after":
    case "before":
    default:
      return "Target";
  }
}

const habitFeedbackToneClasses: Record<HabitFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  empty: "border-dashed border-slate-300 bg-slate-50 text-slate-600",
};
const habitPanelClass = "fs-library-card p-4 sm:p-5";
const habitAccentPanelClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const habitMutedPanelClass = "fs-library-card fs-library-card-muted p-4";
const habitNestedCardClass = "fs-library-card p-3";
const habitNestedMutedCardClass = "fs-library-card fs-library-card-muted p-3";
const habitFieldClass = "ui-field mt-1 min-h-10";
const habitLabelClass = "ui-field-label uppercase";
const habitActionBaseClass =
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const habitPrimaryActionClass = cx("fs-cta-primary", habitActionBaseClass);
const habitSecondaryActionClass = cx("fs-cta-secondary hover:bg-white", habitActionBaseClass);
const habitDangerActionClass = cx("fs-cta-danger", habitActionBaseClass);
const habitMobilePrimaryActionClass = cx(habitPrimaryActionClass, mobilePrimaryActionItemClass);
const habitMobileSecondaryActionClass = cx(habitSecondaryActionClass, mobileActionItemClass);
const habitMobileDangerActionClass = cx(habitDangerActionClass, mobileActionItemClass);
const habitIconActionClass = cx(
  habitSecondaryActionClass,
  "h-11 w-11 px-0 max-sm:rounded-[var(--fs-radius-control)] sm:w-auto sm:px-3"
);
const habitPeerActionWidthClass = "h-11 min-h-11 min-w-36 px-4 sm:!w-36";
const habitWideActionWidthClass = "h-11 min-h-11 min-w-36 px-4 sm:!w-36";
const habitStepperButtonClass =
  "inline-flex h-full min-h-0 items-center justify-center bg-white px-0 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-60";
const habitChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/85 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)]";
const habitBrandChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--fs-color-brand-700)]";
const habitSuccessChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700";
const habitWarningChipClass =
  "inline-flex rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-semibold text-amber-700";
const habitChoiceBaseClass =
  "min-h-10 rounded-[var(--fs-radius-control)] border px-3 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const habitChoiceSelectedClass =
  "border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)]";
const habitChoiceIdleClass =
  "border-[color:var(--fs-border-soft)] bg-white/90 text-[color:var(--fs-color-muted)] hover:bg-white";

function getHabitChoiceClass(isSelected: boolean) {
  return cx(habitChoiceBaseClass, isSelected ? habitChoiceSelectedClass : habitChoiceIdleClass);
}

function getDefaultHabitFeedbackAnnouncement(tone: HabitFeedbackTone): HabitFeedbackAnnouncement {
  if (tone === "empty") return "none";
  if (tone === "error") return "assertive";
  return "polite";
}

function HabitFeedback({
  tone,
  title,
  children,
  announcement,
  className,
  testId,
}: HabitFeedbackProps) {
  const resolvedAnnouncement = announcement ?? getDefaultHabitFeedbackAnnouncement(tone);
  const role =
    resolvedAnnouncement === "assertive"
      ? "alert"
      : resolvedAnnouncement === "polite"
        ? "status"
        : undefined;
  const ariaLive =
    resolvedAnnouncement === "assertive"
      ? "assertive"
      : resolvedAnnouncement === "polite"
        ? "polite"
        : undefined;

  return (
    <div
      className={cx("rounded-xl border px-4 py-3", habitFeedbackToneClasses[tone], className)}
      role={role}
      aria-live={ariaLive}
      data-testid={testId}
    >
      {title ? (
        <p className={cx("text-sm font-semibold", tone === "empty" ? "text-slate-900" : "")}>
          {title}
        </p>
      ) : null}
      <p className={cx("text-sm", title ? "mt-1" : "", tone === "error" ? "font-medium" : "")}>
        {children}
      </p>
    </div>
  );
}

function NumberStepperField({
  label,
  value,
  onChange,
  inputAriaLabel,
  inputMode = "decimal",
  normalizeInputValue,
  min = 0,
  max,
  step = 1,
  disabled = false,
  hideLabel = false,
  className,
}: NumberStepperFieldProps) {
  const inputId = useId();

  return (
    <div className={className}>
      <label htmlFor={inputId} className={hideLabel ? "sr-only" : habitLabelClass}>
        {label}
      </label>
      <div
        className={cx(
          hideLabel ? "mt-0" : "mt-1",
          "grid h-11 min-h-11 grid-cols-[2.75rem_minmax(4rem,1fr)_2.75rem] items-stretch overflow-hidden rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white shadow-sm"
        )}
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled}
          onClick={() => onChange(stepNumberInputValue(value, step, -1, min, max))}
          className={cx(habitStepperButtonClass, "border-r border-[color:var(--fs-border-soft)]")}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          id={inputId}
          type="text"
          inputMode={inputMode}
          aria-label={inputAriaLabel}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              normalizeInputValue
                ? normalizeInputValue(event.target.value)
                : normalizeNumberInputValue(event.target.value, min, step, max)
            )
          }
          className={cx(
            habitFieldClass,
            "mt-0 h-full min-h-0 rounded-none border-0 px-3 py-0 text-center tabular-nums shadow-none"
          )}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled}
          onClick={() => onChange(stepNumberInputValue(value, step, 1, min, max))}
          className={cx(habitStepperButtonClass, "border-l border-[color:var(--fs-border-soft)]")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function readSeenHabitRowIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SEEN_HABIT_ROWS_STORAGE_KEY) ?? "[]");
    return new Set(
      Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : []
    );
  } catch {
    return new Set<string>();
  }
}

function writeSeenHabitRowIds(ids: Set<string>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SEEN_HABIT_ROWS_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Local UI preference only; habit tracking must continue if storage is unavailable.
  }
}

function readHabitSoundPreference() {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(HABIT_SOUND_PREFERENCE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version?: unknown; enabled?: unknown } | null;
    return (
      !!parsed &&
      parsed.version === HABIT_SOUND_PREFERENCE_STORAGE_VERSION &&
      parsed.enabled === true
    );
  } catch {
    return false;
  }
}

function writeHabitSoundPreference(enabled: boolean) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      HABIT_SOUND_PREFERENCE_STORAGE_KEY,
      JSON.stringify({
        version: HABIT_SOUND_PREFERENCE_STORAGE_VERSION,
        enabled,
      })
    );
    return true;
  } catch {
    return false;
  }
}

function getTimerStorageUserKey(userId: string | undefined) {
  const normalized = userId?.trim();
  return encodeURIComponent(normalized || "current-user");
}

function getAbsenceReviewStorageKey(userId: string | undefined) {
  return `${HABIT_ABSENCE_REVIEW_STORAGE_PREFIX}:${getTimerStorageUserKey(userId)}:reviewed-dates`;
}

function getLegacyAbsenceReviewStorageKey(userId: string | undefined, todayDate: string) {
  return `${HABIT_ABSENCE_REVIEW_STORAGE_PREFIX}:${getTimerStorageUserKey(userId)}:${todayDate}`;
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseAbsenceReviewDates(raw: string | null) {
  if (!raw) return [];

  const parsed = JSON.parse(raw) as { version?: unknown; reviewedDates?: unknown } | null;
  if (
    !parsed ||
    parsed.version !== HABIT_ABSENCE_REVIEW_STORAGE_VERSION ||
    !Array.isArray(parsed.reviewedDates)
  ) {
    return [];
  }
  return [...new Set(parsed.reviewedDates.filter(isIsoDateString))];
}

function readAbsenceReviewDates(userId: string | undefined, todayDate: string) {
  if (typeof window === "undefined") return [];

  try {
    const current = parseAbsenceReviewDates(
      window.localStorage.getItem(getAbsenceReviewStorageKey(userId))
    );
    if (current.length > 0) return current;
    return parseAbsenceReviewDates(
      window.localStorage.getItem(getLegacyAbsenceReviewStorageKey(userId, todayDate))
    );
  } catch {
    return [];
  }
}

function writeAbsenceReviewDates(userId: string | undefined, reviewedDates: string[]) {
  if (typeof window === "undefined") return false;

  try {
    const uniqueDates = [...new Set(reviewedDates.filter(isIsoDateString))].sort((left, right) =>
      left.localeCompare(right)
    );
    window.localStorage.setItem(
      getAbsenceReviewStorageKey(userId),
      JSON.stringify({
        version: HABIT_ABSENCE_REVIEW_STORAGE_VERSION,
        reviewedDates: uniqueDates,
      })
    );
    return true;
  } catch {
    return false;
  }
}

function normalizeAbsenceReviewDates(dates: unknown) {
  if (!Array.isArray(dates)) return [];
  return [...new Set(dates.filter(isIsoDateString))].sort((left, right) =>
    left.localeCompare(right)
  );
}

function getReviewedAbsenceDatesForSnapshot(
  snapshot: HabitSnapshot,
  userId: string | undefined,
  todayDate: string
) {
  if (snapshot.absenceReviewAcknowledgedDates !== undefined) {
    return normalizeAbsenceReviewDates(snapshot.absenceReviewAcknowledgedDates);
  }

  return readAbsenceReviewDates(userId, todayDate);
}

function getTimerStorageKey(userId: string | undefined, date: string) {
  return `${HABIT_TIMER_STORAGE_PREFIX}:${getTimerStorageUserKey(userId)}:${date}`;
}

function clearStaleTimerStorageForUser(userId: string | undefined, selectedDate: string) {
  if (typeof window === "undefined") return;

  const currentKey = getTimerStorageKey(userId, selectedDate);
  const prefix = `${HABIT_TIMER_STORAGE_PREFIX}:${getTimerStorageUserKey(userId)}:`;

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(prefix) && key !== currentKey) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Local execution recovery only; server-canonical habit tracking must keep working.
  }
}

function parsePersistedTimerRecord(
  value: unknown
): (TimerState & { targetSeconds: number | null }) | null {
  if (!value || typeof value !== "object") return null;
  const record = value as {
    version?: unknown;
    elapsedSeconds?: unknown;
    startedAtMs?: unknown;
    targetSeconds?: unknown;
  };
  if (record.version !== HABIT_TIMER_STORAGE_VERSION) return null;
  if (typeof record.elapsedSeconds !== "number" || !Number.isFinite(record.elapsedSeconds)) {
    return null;
  }
  const elapsedSeconds = Math.max(0, Math.floor(record.elapsedSeconds));
  const startedAtMs =
    typeof record.startedAtMs === "number" && Number.isFinite(record.startedAtMs)
      ? record.startedAtMs
      : null;
  const targetSeconds =
    typeof record.targetSeconds === "number" && Number.isFinite(record.targetSeconds)
      ? Math.max(1, Math.floor(record.targetSeconds))
      : null;

  return {
    elapsedSeconds,
    startedAtMs,
    targetSeconds,
  };
}

function readPersistedTimerRecords(userId: string | undefined, selectedDate: string) {
  if (typeof window === "undefined")
    return new Map<string, TimerState & { targetSeconds: number | null }>();

  try {
    const raw = window.localStorage.getItem(getTimerStorageKey(userId, selectedDate));
    if (!raw) return new Map<string, TimerState & { targetSeconds: number | null }>();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map<string, TimerState & { targetSeconds: number | null }>();
    }

    const records = new Map<string, TimerState & { targetSeconds: number | null }>();
    for (const [habitId, value] of Object.entries(parsed)) {
      const record = parsePersistedTimerRecord(value);
      if (record) records.set(habitId, record);
    }
    return records;
  } catch {
    return new Map<string, TimerState & { targetSeconds: number | null }>();
  }
}

function writePersistedTimerRecords(
  userId: string | undefined,
  selectedDate: string,
  records: Record<string, TimerState & { targetSeconds: number | null }>
) {
  if (typeof window === "undefined") return;

  try {
    const storageKey = getTimerStorageKey(userId, selectedDate);
    if (Object.keys(records).length === 0) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(
        Object.fromEntries(
          Object.entries(records).map(([habitId, record]) => [
            habitId,
            {
              version: HABIT_TIMER_STORAGE_VERSION,
              elapsedSeconds: Math.max(0, Math.floor(record.elapsedSeconds)),
              startedAtMs: record.startedAtMs,
              targetSeconds: record.targetSeconds,
              updatedAtMs: Date.now(),
            },
          ])
        )
      )
    );
  } catch {
    // Local execution recovery only; failed persistence should not block check-ins.
  }
}

function getHabitDayItem(snapshot: HabitSnapshot, habitId: string) {
  return snapshot.daySummary.items.find((item) => item.habit.id === habitId) ?? null;
}

function shouldPlaySuccessfulCompletionSound(
  beforeItem: HabitDayItem,
  nextSnapshot: HabitSnapshot
) {
  const afterItem = getHabitDayItem(nextSnapshot, beforeItem.habit.id);
  if (!afterItem) return false;
  if (afterItem.checkIn?.status === "skipped") return false;
  return !beforeItem.evaluation.isSatisfied && afterItem.evaluation.isSatisfied;
}

function getTimedTargetSoundKey(selectedDate: string, habitId: string, targetSeconds: number) {
  return `${selectedDate}:${habitId}:${targetSeconds}`;
}

export default function HabitPerfectDayHub({
  initialSnapshot,
  preferMobileActiveFocus = false,
  todayDate = initialSnapshot.selectedDate,
  userId,
}: Props) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [draft, setDraft] = useState<HabitDraft>(() =>
    buildDefaultDraft(initialSnapshot.selectedDate)
  );
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<HabitDraft | null>(null);
  const [checkInInputs, setCheckInInputs] = useState<Record<string, string>>(() =>
    buildInputState(initialSnapshot)
  );
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const [expandedHabitIds, setExpandedHabitIds] = useState<string[]>([]);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isMobileWeekOpen, setIsMobileWeekOpen] = useState(false);
  const [isPastHabitsExpanded, setIsPastHabitsExpanded] = useState(false);
  const [motivationRange, setMotivationRange] = useState<HabitMotivationRange>("month");
  const [openMotivationPanel, setOpenMotivationPanel] = useState<MotivationPanel | null>(null);
  const [confirmResetStatsHabitId, setConfirmResetStatsHabitId] = useState<string | null>(null);
  const [reviewedAbsenceDates, setReviewedAbsenceDates] = useState<string[]>(() =>
    getReviewedAbsenceDatesForSnapshot(initialSnapshot, userId, todayDate)
  );
  const [confirmEndHabitId, setConfirmEndHabitId] = useState<string | null>(null);
  const [confirmRestoreHabitId, setConfirmRestoreHabitId] = useState<string | null>(null);
  const [recentlyCreatedHabitId, setRecentlyCreatedHabitId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string | null>(null);
  const [failedRequestedDate, setFailedRequestedDate] = useState<string | null>(null);
  const [habitNotices, setHabitNotices] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialSnapshot.loadError);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);
  const hasLoadedRowPreferencesRef = useRef(false);
  const hasHydratedTimersRef = useRef(false);
  const timedTargetProgressRef = useRef<Record<string, number>>({});
  const timedTargetSignalKeysRef = useRef<Set<string>>(new Set());
  const catchUpAssistantShownKeysRef = useRef<Set<string>>(new Set());
  const saveTimedSourcesRef = useRef<
    ((item: HabitDayItem, input: SaveTimedSourcesInput) => Promise<void>) | null
  >(null);
  const confirmedSelectedDateRef = useRef<string | null>(
    initialSnapshot.loadError ? null : initialSnapshot.selectedDate
  );
  const summarySectionRef = useRef<HTMLElement | null>(null);
  const habitsSectionRef = useRef<HTMLElement | null>(null);
  const motivationSectionRef = useRef<HTMLElement | null>(null);
  const selectedAbsenceReviewSectionRef = useRef<HTMLElement | null>(null);
  const addHabitSectionRef = useRef<HTMLElement | null>(null);
  const addHabitNameInputRef = useRef<HTMLInputElement | null>(null);
  const habitCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const weekSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const calendarWindow = buildMyLibraryCalendarWindow(snapshot.selectedDate);
  const safeTodayDate = todayDate || snapshot.selectedDate;
  const todayWeekStartDate = getMyLibraryCalendarPeriodStartDate(safeTodayDate, "week");
  const isSelectedToday = snapshot.selectedDate === safeTodayDate;
  const isHistoricalDate = snapshot.selectedDate < safeTodayDate;
  const canManageHabitSetup = isSelectedToday;
  const nextWindowDate =
    calendarWindow.nextWindowDate > safeTodayDate ? safeTodayDate : calendarWindow.nextWindowDate;
  const canGoNextWindow = calendarWindow.startDate < todayWeekStartDate;
  const calendarViewParam = preferMobileActiveFocus ? "active" : undefined;
  const previousWindowHref = buildMyLibraryCalendarHref({
    path: "/my-library/habits",
    selectedDate: calendarWindow.previousWindowDate,
    view: calendarViewParam,
  });
  const todayWindowHref = buildMyLibraryCalendarHref({
    path: "/my-library/habits",
    selectedDate: safeTodayDate,
    view: calendarViewParam,
  });
  const nextWindowHref = buildMyLibraryCalendarHref({
    path: "/my-library/habits",
    selectedDate: nextWindowDate,
    view: calendarViewParam,
  });
  const selectedDateLabel = getSelectedDateDisplayLabel(snapshot.selectedDate, safeTodayDate);
  const selectedDateContextLabel = getSelectedDateContextLabel(
    snapshot.selectedDate,
    safeTodayDate
  );
  const habitsHeaderDateContextLabel = isSelectedToday
    ? getLongDateLabel(snapshot.selectedDate)
    : selectedDateContextLabel;
  const weekLabel = calendarWindow.weekLabel;
  const weekRangeLabel = getWeekRangeLabel(calendarWindow.startDate, calendarWindow.endDate);
  const pendingSelectedDate =
    requestedDate && requestedDate !== snapshot.selectedDate ? requestedDate : null;
  const analysisHref = buildMyLibraryCalendarComparisonHref({
    source: "habits",
    period: "week",
    selectedDate: snapshot.selectedDate,
  });
  const habitWeekCountSummary = getHabitWeekCountSummary(snapshot.weekSummary.days, safeTodayDate);

  useEffect(() => {
    setSoundEnabled(readHabitSoundPreference());
  }, []);

  useEffect(() => {
    if (
      initialSnapshot.loadError &&
      confirmedSelectedDateRef.current &&
      initialSnapshot.selectedDate !== confirmedSelectedDateRef.current
    ) {
      setRequestedDate(null);
      setFailedRequestedDate(initialSnapshot.selectedDate);
      setError(`${initialSnapshot.loadError} Showing ${confirmedSelectedDateRef.current}.`);
      setNotice(null);
      return;
    }

    setSnapshot(initialSnapshot);
    confirmedSelectedDateRef.current = initialSnapshot.selectedDate;
    setRequestedDate((current) => (current === initialSnapshot.selectedDate ? null : current));
    setFailedRequestedDate(null);
    setDraft(buildDefaultDraft(initialSnapshot.selectedDate));
    setError(initialSnapshot.loadError);
    setIsAddHabitOpen(false);
    setEditingHabitId(null);
    setEditDraft(null);
    setConfirmResetStatsHabitId(null);
    setConfirmEndHabitId(null);
    setConfirmRestoreHabitId(null);
    setRecentlyCreatedHabitId(null);
    setIsPastHabitsExpanded(false);
    setHabitNotices({});
    setNotice(null);
  }, [initialSnapshot]);

  useEffect(() => {
    setReviewedAbsenceDates(getReviewedAbsenceDatesForSnapshot(snapshot, userId, safeTodayDate));
  }, [safeTodayDate, snapshot, userId]);

  useEffect(() => {
    setCheckInInputs(buildInputState(snapshot));
  }, [snapshot]);

  useEffect(() => {
    if (Object.keys(habitNotices).length === 0) return;
    const timeout = window.setTimeout(() => {
      setHabitNotices({});
    }, HABIT_SUCCESS_NOTICE_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeout);
  }, [habitNotices]);

  useEffect(() => {
    hasHydratedTimersRef.current = false;
  }, [snapshot.selectedDate, userId]);

  useEffect(() => {
    const activeIds = snapshot.activeHabits.map((habit) => habit.id);
    const seenIds = readSeenHabitRowIds();

    setExpandedHabitIds((current) => {
      const currentExpanded = hasLoadedRowPreferencesRef.current
        ? new Set(current)
        : new Set<string>();
      return activeIds.filter((id) => currentExpanded.has(id));
    });

    activeIds.forEach((id) => seenIds.add(id));
    writeSeenHabitRowIds(seenIds);
    hasLoadedRowPreferencesRef.current = true;
  }, [snapshot.activeHabits]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function openFromHash() {
      if (window.location.hash === "#add-habit" && canManageHabitSetup) {
        setIsAddHabitOpen(true);
        setRecentlyCreatedHabitId(null);
        setNotice(null);
        setError(null);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [canManageHabitSetup]);

  useEffect(() => {
    const hasRunningTimer = Object.values(timers).some((timer) => timer.startedAtMs !== null);
    if (!hasRunningTimer) return;

    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [timers]);

  useEffect(() => {
    clearStaleTimerStorageForUser(userId, snapshot.selectedDate);
    const persistedRecords = readPersistedTimerRecords(userId, snapshot.selectedDate);
    const timedItems = snapshot.daySummary.items.filter(
      (item) =>
        item.habit.habitMode === "timed" &&
        item.habit.status === "active" &&
        item.priorityGroup !== "done_today" &&
        item.priorityGroup !== "done_period"
    );
    const allowedTargets = new Map(
      timedItems.map((item) => [item.habit.id, getTimerTargetDisplaySeconds(item.habit)])
    );

    setTimers((current) => {
      const next: Record<string, TimerState> = {};
      for (const [habitId, targetSeconds] of allowedTargets) {
        const currentTimer = current[habitId];
        if (currentTimer) {
          next[habitId] = currentTimer;
          continue;
        }
        const persistedTimer = persistedRecords.get(habitId);
        if (!persistedTimer) continue;
        if (targetSeconds !== persistedTimer.targetSeconds) continue;
        next[habitId] = {
          elapsedSeconds: persistedTimer.elapsedSeconds,
          startedAtMs: persistedTimer.startedAtMs,
        };
      }
      return next;
    });
    hasHydratedTimersRef.current = true;
  }, [snapshot.daySummary.items, snapshot.selectedDate, userId]);

  useEffect(() => {
    if (!hasHydratedTimersRef.current) return;

    const eligibleTargets = new Map(
      snapshot.daySummary.items
        .filter(
          (item) =>
            item.habit.habitMode === "timed" &&
            item.habit.status === "active" &&
            item.priorityGroup !== "done_today" &&
            item.priorityGroup !== "done_period"
        )
        .map((item) => [item.habit.id, getTimerTargetDisplaySeconds(item.habit)])
    );
    const records: Record<string, TimerState & { targetSeconds: number | null }> = {};

    for (const [habitId, timer] of Object.entries(timers)) {
      if (!eligibleTargets.has(habitId)) continue;
      if (timer.elapsedSeconds <= 0 && timer.startedAtMs === null) continue;
      records[habitId] = {
        ...timer,
        targetSeconds: eligibleTargets.get(habitId) ?? null,
      };
    }

    writePersistedTimerRecords(userId, snapshot.selectedDate, records);
  }, [snapshot.daySummary.items, snapshot.selectedDate, timers, userId]);

  useEffect(() => {
    if (!isAddHabitOpen) return;
    const timeout = window.setTimeout(() => {
      habitsSectionRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
      addHabitNameInputRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isAddHabitOpen]);

  useEffect(() => {
    if (!recentlyCreatedHabitId) return;
    const exists = snapshot.daySummary.items.some(
      (item) => item.habit.id === recentlyCreatedHabitId
    );
    if (!exists) {
      setRecentlyCreatedHabitId(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      const card = habitCardRefs.current[recentlyCreatedHabitId];
      card?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      card?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [recentlyCreatedHabitId, snapshot.daySummary.items]);

  const playHabitSound = useCallback(
    async (blockedMessage = "Sound was blocked. Your habit was still saved.") => {
      const result: AppSoundPlaybackResult = await playAppSoundProfile("positiveDing");
      if (result === "played") {
        setSoundNotice(null);
        return;
      }

      setSoundNotice(
        result === "unsupported" ? "Sound is not available in this browser." : blockedMessage
      );
    },
    []
  );

  const playEnabledHabitSound = useCallback(
    (blockedMessage?: string) => {
      if (!soundEnabled) return;
      void playHabitSound(blockedMessage);
    },
    [playHabitSound, soundEnabled]
  );

  const getTimerSeconds = useCallback(
    (habitId: string) => {
      const timer = timers[habitId];
      if (!timer) return 0;
      const runningSeconds =
        timer.startedAtMs === null ? 0 : Math.floor((nowMs - timer.startedAtMs) / 1000);
      return timer.elapsedSeconds + Math.max(0, runningSeconds);
    },
    [nowMs, timers]
  );

  const activeCount = snapshot.activeHabits.length;
  const preferredCountLabel =
    activeCount === 0
      ? "No habits yet"
      : activeCount < 3
        ? `${activeCount} active · add a few more when ready`
        : `${activeCount} active`;
  const habitsStatusLabel = getHabitsStatusLabel(snapshot, isSelectedToday ? "Today" : "This day");

  const draftHabitType = getResolvedDraftHabitType(draft);
  const draftUnitOptions = useMemo(() => getUnitOptions(draftHabitType), [draftHabitType]);
  const selectedMotivationSummary =
    snapshot.motivationSummaries?.[motivationRange] ??
    (motivationRange === "all" ? snapshot.motivationSummary : undefined) ??
    snapshot.motivationSummaries?.all ??
    snapshot.motivationSummary;
  const motivationItemsByHabitId = useMemo(() => {
    const items = selectedMotivationSummary?.items ?? [];
    return new Map(items.map((item) => [item.habitId, item]));
  }, [selectedMotivationSummary]);
  const reviewedAbsenceDateSet = useMemo(
    () => new Set(reviewedAbsenceDates),
    [reviewedAbsenceDates]
  );
  const catchUpEntries = useMemo(
    () => getCatchUpEntries(snapshot, safeTodayDate),
    [safeTodayDate, snapshot]
  );
  const catchUpDates = useMemo(() => getSortedCatchUpDates(catchUpEntries), [catchUpEntries]);
  const absenceReviewRows = useMemo(
    () => getAbsenceReviewDates(catchUpEntries, reviewedAbsenceDateSet),
    [catchUpEntries, reviewedAbsenceDateSet]
  );
  const unreviewedAbsenceRows = useMemo(
    () => absenceReviewRows.filter((row) => !row.reviewed),
    [absenceReviewRows]
  );
  const selectedAbsenceReviewRow =
    absenceReviewRows.find((row) => row.date === snapshot.selectedDate) ?? null;
  const nextAbsenceReviewDate = getNextUnreviewedAbsenceDate(
    absenceReviewRows,
    snapshot.selectedDate
  );
  const hasAbsenceReviewWindow = absenceReviewRows.length >= 2;
  const shouldShowCatchUpAssistant =
    isSelectedToday && hasAbsenceReviewWindow && unreviewedAbsenceRows.length > 0;
  const shouldShowSelectedAbsenceReview =
    isHistoricalDate && hasAbsenceReviewWindow && selectedAbsenceReviewRow !== null;
  const catchUpDateCount = unreviewedAbsenceRows.length;
  const catchUpEntryKey = catchUpEntries
    .map((entry) => `${entry.date}:${entry.item.habit.id}`)
    .join(",");

  useEffect(() => {
    if (!shouldShowCatchUpAssistant) return;
    const analyticsKey = `${snapshot.selectedDate}:${catchUpEntryKey}`;
    if (catchUpAssistantShownKeysRef.current.has(analyticsKey)) return;

    catchUpAssistantShownKeysRef.current.add(analyticsKey);
    void sendClientAnalyticsEvent("habit_catch_up_assistant_shown", {
      selectedDate: snapshot.selectedDate,
      catchUpDayCount: catchUpDateCount,
      catchUpEntryCount: catchUpEntries.length,
      catchUpHabitCount: new Set(catchUpEntries.map((entry) => entry.item.habit.id)).size,
      oldestCatchUpDate: catchUpDates[0] ?? null,
      newestCatchUpDate: catchUpDates[catchUpDates.length - 1] ?? null,
      reviewMode: "date_first",
    });
  }, [
    catchUpDateCount,
    catchUpDates,
    catchUpEntries,
    catchUpEntryKey,
    shouldShowCatchUpAssistant,
    snapshot.selectedDate,
  ]);

  function openAddHabitForm() {
    if (!canManageHabitSetup) {
      setNotice("Return to Today to add or edit habit setup.");
      setError(null);
      return;
    }
    setIsAddHabitOpen(true);
    setRecentlyCreatedHabitId(null);
    setNotice(null);
    setError(null);
  }

  function openMotivationSummary() {
    window.setTimeout(() => {
      motivationSectionRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    }, 0);
  }

  function openWeekOverview() {
    if (preferMobileActiveFocus) {
      setIsMobileWeekOpen((current) => !current);
      return;
    }

    summarySectionRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }

  function scrollToHabitsTop() {
    habitsSectionRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }

  function scrollToSelectedAbsenceReview() {
    const target = selectedAbsenceReviewSectionRef.current ?? habitsSectionRef.current;
    target?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }

  function handleMobileDatePillClick() {
    if (isSelectedToday) {
      scrollToHabitsTop();
      return;
    }

    scrollToSelectedAbsenceReview();
  }

  function closeAddHabitForm() {
    setIsAddHabitOpen(false);
    setError(null);
  }

  function clearCreatedHabitNotice() {
    setRecentlyCreatedHabitId(null);
  }

  function setHabitNotice(habitId: string, message: string) {
    setHabitNotices((current) => ({ ...current, [habitId]: message }));
  }

  function clearHabitNotice(habitId: string) {
    setHabitNotices((current) => {
      if (!(habitId in current)) return current;
      const next = { ...current };
      delete next[habitId];
      return next;
    });
  }

  function toggleHabitSoundPreference() {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    const didPersist = writeHabitSoundPreference(nextEnabled);
    if (!didPersist) {
      setSoundNotice("Sound preference cannot be saved in this browser.");
      return;
    }

    if (nextEnabled) {
      void playHabitSound();
      return;
    }

    setSoundNotice(null);
  }

  function startTimer(habitId: string) {
    const startedAtMs = Date.now();
    setTimers((current) => {
      const existing = current[habitId] ?? { elapsedSeconds: 0, startedAtMs: null };
      if (existing.startedAtMs !== null) return current;

      const next = { ...current };
      for (const [currentHabitId, timer] of Object.entries(current)) {
        if (currentHabitId === habitId || timer.startedAtMs === null) continue;
        next[currentHabitId] = {
          elapsedSeconds:
            timer.elapsedSeconds +
            Math.max(0, Math.floor((startedAtMs - timer.startedAtMs) / 1000)),
          startedAtMs: null,
        };
      }

      return {
        ...next,
        [habitId]: {
          ...existing,
          startedAtMs,
        },
      };
    });
    setNowMs(startedAtMs);
  }

  function pauseTimer(habitId: string) {
    setTimers((current) => {
      const existing = current[habitId];
      if (!existing || existing.startedAtMs === null) return current;
      const elapsedSeconds =
        existing.elapsedSeconds +
        Math.max(0, Math.floor((Date.now() - existing.startedAtMs) / 1000));
      return {
        ...current,
        [habitId]: {
          elapsedSeconds,
          startedAtMs: null,
        },
      };
    });
  }

  function resetTimer(habitId: string) {
    setTimers((current) => ({
      ...current,
      [habitId]: {
        elapsedSeconds: 0,
        startedAtMs: null,
      },
    }));
  }

  function clearTimer(habitId: string) {
    setTimers((current) => {
      if (!(habitId in current)) return current;
      const next = { ...current };
      delete next[habitId];
      return next;
    });
  }

  function toggleHabitDetails(habitId: string) {
    setExpandedHabitIds((current) =>
      current.includes(habitId) ? current.filter((id) => id !== habitId) : [...current, habitId]
    );
    if (expandedHabitIds.includes(habitId)) {
      setConfirmResetStatsHabitId((current) => (current === habitId ? null : current));
    }
  }

  function collapseHabitDetails(habitId: string) {
    setExpandedHabitIds((current) => current.filter((id) => id !== habitId));
    setConfirmResetStatsHabitId((current) => (current === habitId ? null : current));
    setConfirmEndHabitId((current) => (current === habitId ? null : current));
  }

  async function applyResponse(response: Response, fallback: string) {
    let payload: ApiResponse;
    try {
      payload = (await response.json()) as ApiResponse;
    } catch {
      throw new Error(fallback);
    }

    if (!response.ok || payload.ok === false || !payload.snapshot) {
      throw new Error(payload.error ?? fallback);
    }

    setSnapshot(payload.snapshot);
    setError(null);
    return payload.snapshot;
  }

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot.schemaReady) return;
    if (!canManageHabitSetup) {
      setNotice("Return to Today to add or edit habit setup.");
      setError(null);
      return;
    }

    const habitMode = draft.habitMode;
    const timerTargetSeconds = getTimerTargetSeconds(draft);
    const habitType = getResolvedDraftHabitType(draft);

    setPendingKey("create");
    setNotice(null);
    setError(null);
    try {
      const existingHabitIds = new Set(snapshot.activeHabits.map((habit) => habit.id));
      const response = await fetch("/api/my-library/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          habitMode,
          habitType,
          targetValueNumeric: habitMode === "quit" ? "0" : draft.targetValueNumeric,
          targetUnit: habitMode === "quit" ? "times" : draft.targetUnit,
          timerEnabled: habitMode === "timed",
          timerTargetSeconds,
          cadencePeriod: draft.cadencePeriod,
          cadenceTargetCount: getCadenceTargetCountForDraft(draft),
          cadenceDayPolicy: draft.cadenceDayPolicy,
          scheduleDays: getScheduleDaysForDraft(draft),
          selectedDate: snapshot.selectedDate,
          isPerfectDayItem: draft.isPerfectDayItem,
        }),
      });
      const nextSnapshot = await applyResponse(response, "Could not create that habit right now.");
      const createdHabit =
        nextSnapshot.activeHabits.find((habit) => !existingHabitIds.has(habit.id)) ??
        nextSnapshot.activeHabits.find((habit) => habit.title === draft.title.trim());
      setDraft(buildDefaultDraft(nextSnapshot.selectedDate));
      setIsAddHabitOpen(false);
      setRecentlyCreatedHabitId(createdHabit?.id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create that habit right now.");
    } finally {
      setPendingKey(null);
    }
  }

  function startEditingHabit(habit: HabitDefinitionView) {
    if (!canManageHabitSetup) {
      setNotice("Return to Today to add or edit habit setup.");
      setError(null);
      return;
    }
    setEditingHabitId(habit.id);
    setEditDraft(buildDraftFromHabit(habit));
    setExpandedHabitIds((current) => [...new Set([...current, habit.id])]);
    setNotice(null);
    setError(null);
  }

  async function updateHabit(event: FormEvent<HTMLFormElement>, habitId: string) {
    event.preventDefault();
    if (!editDraft || editingHabitId !== habitId) return;
    if (!canManageHabitSetup) {
      setNotice("Return to Today to add or edit habit setup.");
      setError(null);
      return;
    }

    const habitMode = editDraft.habitMode;
    const timerTargetSeconds = getTimerTargetSeconds(editDraft);
    const habitType = getResolvedDraftHabitType(editDraft);

    setPendingKey(`edit-${habitId}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/my-library/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title,
          notes: editDraft.notes,
          habitMode,
          habitType,
          category: editDraft.category,
          targetValueNumeric: habitMode === "quit" ? "0" : editDraft.targetValueNumeric,
          targetUnit: habitMode === "quit" ? "times" : editDraft.targetUnit,
          targetTime: editDraft.targetTime,
          startDate: editDraft.startDate,
          timerEnabled: habitMode === "timed",
          timerTargetSeconds,
          cadencePeriod: editDraft.cadencePeriod,
          cadenceTargetCount: getCadenceTargetCountForDraft(editDraft),
          cadenceDayPolicy: editDraft.cadenceDayPolicy,
          scheduleDays: getScheduleDaysForDraft(editDraft),
          isPerfectDayItem: editDraft.isPerfectDayItem,
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not update that habit right now.");
      setEditingHabitId(null);
      setEditDraft(null);
      setConfirmEndHabitId(null);
      setNotice("Habit updated. Check-ins and history were kept.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update that habit right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function archiveHabit(habitId: string) {
    if (!canManageHabitSetup) {
      setNotice("Return to Today to add or edit habit setup.");
      setError(null);
      return;
    }
    setPendingKey(`archive-${habitId}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/my-library/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "archived",
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not end that habit right now.");
      clearTimer(habitId);
      setConfirmEndHabitId(null);
      setNotice("Habit ended. Check-ins and reset history stayed saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not end that habit right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function restoreHabit(habitId: string) {
    if (!canManageHabitSetup) {
      setNotice("Return to Today to restore habit setup.");
      setError(null);
      return;
    }
    setPendingKey(`restore-${habitId}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/my-library/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not restore that habit right now.");
      setConfirmRestoreHabitId(null);
      setNotice("Habit restored. Check-ins and reset history were kept.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not restore that habit right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function saveCheckIn(item: HabitDayItem, completeBinary = false, overrideValue?: string) {
    const habit = item.habit;
    const input = overrideValue ?? checkInInputs[habit.id]?.trim() ?? "";
    const body: Record<string, unknown> = {
      habitId: habit.id,
      checkInDate: snapshot.selectedDate,
      selectedDate: snapshot.selectedDate,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    if (habit.habitType === "binary") {
      body.valueBoolean = completeBinary || true;
    } else if (habit.habitType === "time_of_day") {
      body.valueTime = input;
    } else {
      body.valueNumeric = input;
    }

    setPendingKey(`check-${habit.id}`);
    clearHabitNotice(habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const nextSnapshot = await applyResponse(response, "Could not save that check-in right now.");
      collapseHabitDetails(habit.id);
      clearTimer(habit.id);
      if (shouldPlaySuccessfulCompletionSound(item, nextSnapshot)) {
        playEnabledHabitSound();
      }
      setHabitNotice(habit.id, "Completion saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function saveTimedSources(item: HabitDayItem, input: SaveTimedSourcesInput) {
    const habit = item.habit;
    setPendingKey(`check-${habit.id}`);
    clearHabitNotice(habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: habit.id,
          checkInDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          timerSeconds: input.timerSeconds,
          manualMinutes: input.manualMinutes,
        }),
      });
      const nextSnapshot = await applyResponse(response, "Could not save that check-in right now.");
      collapseHabitDetails(habit.id);
      if (input.clearLocalTimerOnSuccess) clearTimer(habit.id);
      if (shouldPlaySuccessfulCompletionSound(item, nextSnapshot)) {
        playEnabledHabitSound();
      }
      setHabitNotice(habit.id, input.successNotice);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  useEffect(() => {
    saveTimedSourcesRef.current = saveTimedSources;
  });

  async function logLapse(item: HabitDayItem) {
    setPendingKey(`lapse-${item.habit.id}`);
    clearHabitNotice(item.habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          valueBoolean: false,
        }),
      });
      await applyResponse(response, "Could not log that slip right now.");
      collapseHabitDetails(item.habit.id);
      setHabitNotice(item.habit.id, "Slip logged.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log that slip right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function markRestDay(item: HabitDayItem) {
    setPendingKey(`rest-${item.habit.id}`);
    clearHabitNotice(item.habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          status: "skipped",
        }),
      });
      await applyResponse(response, "Could not save that rest day right now.");
      collapseHabitDetails(item.habit.id);
      clearTimer(item.habit.id);
      setNotice("Rest day saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that rest day right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function finishTimer(item: HabitDayItem) {
    const seconds = getTimerSeconds(item.habit.id);
    if (seconds <= 0) {
      setError("Start the timer before saving.");
      return;
    }

    const timerSeconds = getSavedTimerSeconds(item) + getLegacyTimedSeconds(item) + seconds;
    const manualMinutes = getSavedManualMinutes(item);
    setTimers((current) => ({
      ...current,
      [item.habit.id]: {
        elapsedSeconds: seconds,
        startedAtMs: null,
      },
    }));
    await saveTimedSources(item, {
      timerSeconds,
      manualMinutes,
      successNotice: "Completion saved.",
      clearLocalTimerOnSuccess: true,
    });
  }

  async function saveManualTime(item: HabitDayItem) {
    const input = checkInInputs[item.habit.id]?.trim() ?? "";
    const manualMinutes = parseManualMinutesInput(input);
    if (manualMinutes === null) {
      setError("Manual time must be whole minutes between 0 and 1440.");
      return;
    }

    const timerSeconds = getSavedTimerSeconds(item) + getLegacyTimedSeconds(item);
    setCheckInInputs((current) => ({ ...current, [item.habit.id]: String(manualMinutes) }));
    await saveTimedSources(item, {
      timerSeconds,
      manualMinutes,
      successNotice: "Completion saved.",
      clearLocalTimerOnSuccess: false,
    });
  }

  async function undoTimedCompletion(item: HabitDayItem) {
    const habit = item.habit;
    setPendingKey(`undo-timed-${habit.id}`);
    clearHabitNotice(habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: habit.id,
          checkInDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
          clearTimedCompletion: true,
        }),
      });
      await applyResponse(response, "Could not undo that completion right now.");
      collapseHabitDetails(habit.id);
      clearTimer(habit.id);
      setHabitNotice(habit.id, "Completion undone.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not undo that completion right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  useEffect(() => {
    const nextProgress: Record<string, number> = {};

    for (const item of snapshot.daySummary.items) {
      if (item.habit.habitMode !== "timed" || item.habit.status !== "active") continue;
      if (item.checkIn?.status === "skipped") continue;
      if (item.priorityGroup === "done_today" || item.priorityGroup === "done_period") continue;
      const targetSeconds = getTimerTargetDisplaySeconds(item.habit);
      if (!targetSeconds) continue;

      const timer = timers[item.habit.id];
      const timerSeconds = getTimerSeconds(item.habit.id);
      const progressSeconds = getTimedProgressSeconds(item, timerSeconds);
      const targetKey = getTimedTargetSoundKey(snapshot.selectedDate, item.habit.id, targetSeconds);
      const previousProgress = timedTargetProgressRef.current[targetKey];
      nextProgress[targetKey] = progressSeconds;

      if (progressSeconds < targetSeconds) {
        timedTargetSignalKeysRef.current.delete(targetKey);
      }

      if (
        previousProgress === undefined ||
        !isSelectedToday ||
        pendingKey !== null ||
        timer?.startedAtMs == null ||
        previousProgress >= targetSeconds ||
        progressSeconds < targetSeconds ||
        timedTargetSignalKeysRef.current.has(targetKey)
      ) {
        continue;
      }

      timedTargetSignalKeysRef.current.add(targetKey);
      setTimers((current) => {
        const currentTimer = current[item.habit.id];
        if (!currentTimer) return current;
        return {
          ...current,
          [item.habit.id]: {
            elapsedSeconds: timerSeconds,
            startedAtMs: null,
          },
        };
      });
      playEnabledHabitSound("Sound was blocked. Your timer target was still reached.");
      setHabitNotice(item.habit.id, "Target reached. Timer paused.");
    }

    timedTargetProgressRef.current = nextProgress;
  }, [
    getTimerSeconds,
    isSelectedToday,
    pendingKey,
    playEnabledHabitSound,
    snapshot.daySummary.items,
    snapshot.selectedDate,
    timers,
  ]);

  async function resetCheckIn(item: HabitDayItem) {
    setPendingKey(`reset-${item.habit.id}`);
    clearHabitNotice(item.habit.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
          clear: true,
        }),
      });
      await applyResponse(response, "Could not reset that check-in right now.");
      collapseHabitDetails(item.habit.id);
      clearTimer(item.habit.id);
      setNotice("Check-in reset.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not reset that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function resetHabitStats(item: HabitDayItem) {
    const habit = item.habit;
    setPendingKey(`reset-stats-${habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/my-library/habits/${habit.id}/reset-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          effectiveDate: snapshot.selectedDate,
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not reset habit stats right now.");
      setConfirmResetStatsHabitId(null);
      setNotice("Habit stats reset. Earlier check-ins stayed saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reset habit stats right now.");
    } finally {
      setPendingKey(null);
    }
  }

  function getNextReviewedAbsenceDates(updater: (current: string[]) => string[]) {
    const activeDates = new Set(catchUpDates);
    return [...new Set(updater(reviewedAbsenceDates).filter((date) => activeDates.has(date)))].sort(
      (left, right) => left.localeCompare(right)
    );
  }

  async function saveReviewedAbsenceDates(nextDates: string[], action: "mark" | "finish") {
    const response = await fetch("/api/my-library/habits/absence-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dates: nextDates,
        selectedDate: snapshot.selectedDate,
        action,
      }),
    });
    const nextSnapshot = await applyResponse(response, "Could not save that review right now.");
    const savedDates = getReviewedAbsenceDatesForSnapshot(nextSnapshot, userId, safeTodayDate);
    setReviewedAbsenceDates(savedDates);
    writeAbsenceReviewDates(userId, savedDates);
    return nextSnapshot;
  }

  async function markAbsenceReviewDate(date: string, nextDate: string | null = null) {
    if (pendingKey !== null) return;

    const nextDates = getNextReviewedAbsenceDates((current) => [...current, date]);
    setPendingKey(`absence-review-${date}`);
    try {
      await saveReviewedAbsenceDates(nextDates, "mark");
      void sendClientAnalyticsEvent("habit_absence_review_day_marked", {
        selectedDate: snapshot.selectedDate,
        reviewDate: date,
        reviewMode: "date_first",
      });
      setNotice(`${getLongDateLabel(date)} checked. No habit history was changed.`);
      setError(null);

      if (nextDate) {
        const nextHref = buildMyLibraryCalendarHref({
          path: "/my-library/habits",
          selectedDate: nextDate,
          view: calendarViewParam,
        });
        navigateToCalendarHref(nextHref, nextDate);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that review right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function finishAbsenceReview() {
    if (pendingKey !== null) return;

    const nextDates = getNextReviewedAbsenceDates(() => catchUpDates);
    setPendingKey("absence-review-finish");
    try {
      await saveReviewedAbsenceDates(nextDates, "finish");
      void sendClientAnalyticsEvent("habit_absence_review_finished", {
        selectedDate: snapshot.selectedDate,
        reviewMode: "date_first",
        reviewDateCount: catchUpDates.length,
      });
      setNotice("Review closed. No habit history was changed.");
      setError(null);

      if (!isSelectedToday) {
        navigateToCalendarHref(todayWindowHref, safeTodayDate);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that review right now.");
    } finally {
      setPendingKey(null);
    }
  }

  function renderCatchUpAssistant() {
    if (!shouldShowCatchUpAssistant) return null;

    return (
      <section
        aria-labelledby="habits-catch-up-title"
        data-testid="habits-catch-up-assistant"
        className="mt-4 rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50/60 p-4"
      >
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={habitLabelClass}>Review days</p>
            <h3 id="habits-catch-up-title" className="text-base font-bold text-amber-950">
              {getAbsenceReviewTitle(catchUpDateCount)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Nothing was marked failed automatically. Open each date, edit what happened, then mark
              the day checked.
            </p>
          </div>
          <span className={habitWarningChipClass}>
            {getAbsenceReviewProgressLabel(absenceReviewRows)}
          </span>
        </div>

        <div className="mt-4">{renderAbsenceReviewDateList(absenceReviewRows)}</div>
      </section>
    );
  }

  function renderAbsenceReviewDateList(rows: AbsenceReviewDate[]) {
    return (
      <ul className="grid gap-2" data-testid="habits-absence-review-date-list">
        {rows.map((row) => {
          const href = buildMyLibraryCalendarHref({
            path: "/my-library/habits",
            selectedDate: row.date,
            view: calendarViewParam,
          });
          const isCurrent = row.date === snapshot.selectedDate;
          return (
            <li
              key={row.date}
              data-testid={`habits-absence-review-date-${row.date}`}
              className={cx(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[var(--fs-radius-control)] border bg-white/80 px-3 py-2 text-sm",
                isCurrent ? "border-amber-400" : "border-amber-200"
              )}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-amber-950">
                  {getWeekdayLabel(row.date)} · {getLongDateLabel(row.date)}
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  {getAbsenceReviewHabitCountLabel(row.entries.length)}
                </span>
              </div>
              <div className="flex min-w-0 items-center justify-end gap-2">
                <span
                  className={cx(
                    "inline-flex rounded-[var(--fs-radius-control)] border px-2 py-0.5 text-xs font-semibold",
                    row.reviewed
                      ? "border-emerald-200 bg-white/90 text-emerald-700"
                      : "border-amber-200 bg-amber-50/90 text-amber-700"
                  )}
                >
                  {row.reviewed ? "Checked" : "Check"}
                </span>
                {isCurrent ? null : (
                  <Link
                    href={href}
                    aria-label={`Edit ${getWeekdayLabel(row.date)} ${getLongDateLabel(row.date)}`}
                    onClick={(event) => handleCalendarLinkClick(event, href, row.date)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm font-semibold whitespace-nowrap text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderSelectedAbsenceReviewPanel() {
    if (!shouldShowSelectedAbsenceReview || !selectedAbsenceReviewRow) return null;

    const progressLabel = getAbsenceReviewProgressLabel(absenceReviewRows);
    const remainingLabel = getAbsenceReviewRemainingLabel(absenceReviewRows);
    const nextHref =
      nextAbsenceReviewDate === null
        ? null
        : buildMyLibraryCalendarHref({
            path: "/my-library/habits",
            selectedDate: nextAbsenceReviewDate,
            view: calendarViewParam,
          });
    const nextDateAfterChecking = getNextUnreviewedAbsenceDateAfterChecking(
      absenceReviewRows,
      selectedAbsenceReviewRow.date
    );
    const allReviewed = absenceReviewRows.every((row) => row.reviewed);
    const isLastUncheckedDate =
      !selectedAbsenceReviewRow.reviewed && nextDateAfterChecking === null;
    const isReviewPending = pendingKey?.startsWith("absence-review-") ?? false;

    return (
      <section
        aria-label="Review days"
        data-testid="habits-selected-absence-review"
        ref={selectedAbsenceReviewSectionRef}
        className="mt-4 rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50/60 p-4"
      >
        <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={habitLabelClass}>Review days</p>
            <h3 className="mt-1 text-base font-bold text-amber-950">
              {allReviewed ? "Review complete" : "Review in progress"}
            </h3>
            <p className="mt-1 text-sm font-medium text-amber-900">{progressLabel}</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <span className={allReviewed ? habitSuccessChipClass : habitWarningChipClass}>
              {remainingLabel}
            </span>
            {allReviewed ? (
              <button
                type="button"
                onClick={finishAbsenceReview}
                disabled={isReviewPending}
                className={habitMobilePrimaryActionClass}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {isReviewPending ? "Saving..." : "Back to Today"}
              </button>
            ) : (
              <Link
                href={todayWindowHref}
                onClick={(event) => handleCalendarLinkClick(event, todayWindowHref, safeTodayDate)}
                aria-busy={pendingSelectedDate === safeTodayDate ? "true" : undefined}
                className={habitMobilePrimaryActionClass}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Today
              </Link>
            )}
          </div>
        </div>

        {renderAbsenceReviewDateList(absenceReviewRows)}

        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
          {selectedAbsenceReviewRow.reviewed ? (
            <span role="status" className={cx(habitSuccessChipClass, "min-h-11 px-4")}>
              Day checked
            </span>
          ) : isLastUncheckedDate ? (
            <button
              type="button"
              onClick={finishAbsenceReview}
              disabled={isReviewPending}
              className={habitMobilePrimaryActionClass}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {isReviewPending ? "Saving..." : "Close review"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                markAbsenceReviewDate(selectedAbsenceReviewRow.date, nextDateAfterChecking)
              }
              disabled={isReviewPending}
              className={habitMobilePrimaryActionClass}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {isReviewPending ? "Saving..." : "Done with this day"}
            </button>
          )}
          {selectedAbsenceReviewRow.reviewed && nextHref && nextAbsenceReviewDate ? (
            <Link
              href={nextHref}
              onClick={(event) => handleCalendarLinkClick(event, nextHref, nextAbsenceReviewDate)}
              className={habitMobileSecondaryActionClass}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              Next date
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  function renderBuildTargetControls(
    currentDraft: HabitDraft,
    updateDraft: (updater: (current: HabitDraft) => HabitDraft) => void
  ) {
    return (
      <fieldset className="md:col-span-2">
        <legend className={habitLabelClass}>Target</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {BUILD_TARGET_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              aria-label={`${getBuildTargetChoiceLabel(type)}: ${getBuildTargetChoiceContext(type)}`}
              aria-pressed={currentDraft.habitType === type}
              onClick={() => updateDraft((current) => applyHabitTypeToDraft(current, type))}
              className={cx("min-h-14", getHabitChoiceClass(currentDraft.habitType === type))}
            >
              <span className="block">{getBuildTargetChoiceLabel(type)}</span>
              <span className="mt-1 block text-xs font-medium opacity-75">
                {getBuildTargetChoiceContext(type)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  function renderPerfectDayEligibilityControl(
    currentDraft: HabitDraft,
    updateDraft: (updater: (current: HabitDraft) => HabitDraft) => void
  ) {
    return (
      <label className="flex min-h-14 items-start gap-3 rounded-[var(--fs-radius-control)] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm md:col-span-2">
        <input
          type="checkbox"
          checked={currentDraft.isPerfectDayItem}
          onChange={(event) =>
            updateDraft((current) => ({
              ...current,
              isPerfectDayItem: event.target.checked,
            }))
          }
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900">Counts toward Perfect Day</span>
          <span className="mt-1 block leading-5 text-slate-500">
            Turn off for tracking-only habits that should not decide whether the day was perfect.
          </span>
        </span>
      </label>
    );
  }

  function renderScheduleControls(
    currentDraft: HabitDraft,
    updateDraft: (updater: (current: HabitDraft) => HabitDraft) => void,
    idPrefix: string
  ) {
    function setCadencePeriod(cadencePeriod: HabitCadencePeriod) {
      updateDraft((current) => {
        if (cadencePeriod === "daily") {
          return {
            ...current,
            cadencePeriod,
            cadenceTargetCount: "1",
            cadenceDayPolicy: "fixed",
            scheduleDays: [...ALL_HABIT_WEEKDAYS],
          };
        }

        if (cadencePeriod === "monthly") {
          return {
            ...current,
            cadencePeriod,
            cadenceTargetCount: current.cadenceTargetCount || "1",
            cadenceDayPolicy: "any",
            scheduleDays: [...ALL_HABIT_WEEKDAYS],
          };
        }

        return {
          ...current,
          cadencePeriod,
          cadenceTargetCount: current.cadenceTargetCount || "1",
          cadenceDayPolicy: current.cadencePeriod === "weekly" ? current.cadenceDayPolicy : "any",
          scheduleDays:
            current.scheduleDays.length > 0
              ? normalizeDraftScheduleDays(current.scheduleDays)
              : [getWeekdayForDate(snapshot.selectedDate)],
        };
      });
    }

    return (
      <fieldset className="md:col-span-2">
        <legend className={habitLabelClass}>Cadence</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {[
            ["daily", "Daily"],
            ["weekly", "Weekly target"],
            ["monthly", "Monthly target"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={currentDraft.cadencePeriod === mode}
              onClick={() => setCadencePeriod(mode as HabitCadencePeriod)}
              className={getHabitChoiceClass(currentDraft.cadencePeriod === mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {currentDraft.cadencePeriod === "weekly" ? (
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <span className={habitLabelClass}>Days</span>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {[
                  ["any", "Any days"],
                  ["fixed", "Fixed days"],
                ].map(([policy, label]) => (
                  <button
                    key={policy}
                    type="button"
                    aria-pressed={currentDraft.cadenceDayPolicy === policy}
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        cadenceDayPolicy: policy as HabitCadenceDayPolicy,
                        scheduleDays:
                          policy === "any"
                            ? [...ALL_HABIT_WEEKDAYS]
                            : current.cadenceDayPolicy === "any"
                              ? [getWeekdayForDate(snapshot.selectedDate)]
                              : current.scheduleDays.length > 0
                                ? normalizeDraftScheduleDays(current.scheduleDays)
                                : [getWeekdayForDate(snapshot.selectedDate)],
                      }))
                    }
                    className={getHabitChoiceClass(currentDraft.cadenceDayPolicy === policy)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {currentDraft.cadenceDayPolicy === "any" ? (
              <label className="block">
                <span className={habitLabelClass}>Times per week</span>
                <input
                  aria-label={`${idPrefix} times per week`}
                  type="number"
                  min={1}
                  max={7}
                  step={1}
                  value={currentDraft.cadenceTargetCount}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      cadenceTargetCount: event.target.value,
                    }))
                  }
                  className={habitFieldClass}
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {currentDraft.cadencePeriod === "monthly" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={habitLabelClass}>Times per month</span>
              <input
                aria-label={`${idPrefix} times per month`}
                type="number"
                min={1}
                max={31}
                step={1}
                value={currentDraft.cadenceTargetCount}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    cadenceTargetCount: event.target.value,
                  }))
                }
                className={habitFieldClass}
              />
            </label>
            <div>
              <span className={habitLabelClass}>Days</span>
              <div className={cx("mt-1 flex items-center", habitBrandChipClass, "min-h-11")}>
                Any days
              </div>
            </div>
          </div>
        ) : null}

        {currentDraft.cadencePeriod === "weekly" && currentDraft.cadenceDayPolicy === "fixed" ? (
          <fieldset className="mt-3">
            <legend className={habitLabelClass}>Fixed weekdays</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ALL_HABIT_WEEKDAYS.map((day) => {
                const checked = currentDraft.scheduleDays.includes(day);
                return (
                  <label
                    key={day}
                    className={cx("flex items-center gap-2", getHabitChoiceClass(checked))}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        updateDraft((current) => {
                          const nextDays = checked
                            ? current.scheduleDays.filter((candidate) => candidate !== day)
                            : [...current.scheduleDays, day];
                          return {
                            ...current,
                            scheduleDays:
                              nextDays.length > 0
                                ? normalizeDraftScheduleDays(nextDays)
                                : current.scheduleDays,
                          };
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {WEEKDAY_LABELS[day]}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}
      </fieldset>
    );
  }

  function navigateToCalendarHref(href: string, requestedSelectedDate: string) {
    setRequestedDate(requestedSelectedDate);
    setFailedRequestedDate(null);
    setNotice(null);
    setError(null);
    router.push(href);
  }

  function handleCalendarLinkClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
    requestedSelectedDate: string
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    navigateToCalendarHref(href, requestedSelectedDate);
  }

  function handleWeekOverviewTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (!touch) {
      weekSwipeStartRef.current = null;
      return;
    }

    weekSwipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleWeekOverviewTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const start = weekSwipeStartRef.current;
    weekSwipeStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const isVerticalScroll = absY > HABIT_WEEK_SWIPE_VERTICAL_TOLERANCE_PX && absY > absX;
    if (absX < HABIT_WEEK_SWIPE_THRESHOLD_PX || isVerticalScroll) return;

    if (deltaX > 0) {
      navigateToCalendarHref(previousWindowHref, calendarWindow.previousWindowDate);
      return;
    }

    if (canGoNextWindow) {
      navigateToCalendarHref(nextWindowHref, nextWindowDate);
    }
  }

  function renderWeekOverview(testId: string) {
    return (
      <div
        className="mt-5 grid touch-pan-y grid-cols-7 gap-1.5 sm:gap-2"
        aria-label={`Habits calendar ${weekLabel} ${weekRangeLabel}`}
        data-testid={testId}
        onTouchStart={handleWeekOverviewTouchStart}
        onTouchEnd={handleWeekOverviewTouchEnd}
      >
        {snapshot.weekSummary.days.map((day) => {
          const isSelected = day.date === snapshot.selectedDate;
          const isPending = pendingSelectedDate === day.date;
          const didFailLoad = failedRequestedDate === day.date;
          const isToday = day.date === safeTodayDate;
          const isFutureDate = day.date > safeTodayDate;
          const dayHref = buildMyLibraryCalendarHref({
            path: "/my-library/habits",
            selectedDate: day.date,
            view: calendarViewParam,
          });
          const dailyCounts = getHabitDayDailyCounts(day);
          const dailyCompletionPercent =
            dailyCounts.total > 0
              ? Math.round((dailyCounts.completed / dailyCounts.total) * 100)
              : 0;
          const weeklyCompletedOnDateCount = getHabitDayWeeklyCompletedOnDateCount(day);
          const dayCountLabel = getHabitDayTargetCountLabel(day);
          const weeklyDayLabel =
            weeklyCompletedOnDateCount > 0
              ? `, ${weeklyCompletedOnDateCount} weekly habit${
                  weeklyCompletedOnDateCount === 1 ? "" : "s"
                } completed`
              : "";
          const dayLabel = `${getWeekdayLabel(day.date)} ${getLongDateLabel(day.date)} ${dayCountLabel}${
            isSelected ? ", selected" : ""
          }${isPending ? ", loading" : ""}${
            didFailLoad ? ", could not load" : ""
          }${isToday ? ", today" : ""}${weeklyDayLabel}`;
          const dayClassName = cx(
            "min-w-0 rounded-[var(--fs-radius-card)] p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2",
            isPending
              ? "bg-amber-50 ring-2 ring-amber-400"
              : didFailLoad
                ? "bg-rose-50 ring-2 ring-rose-300"
                : isSelected
                  ? "bg-[color:var(--fs-color-brand-50)] ring-2 ring-[color:var(--fs-border-brand)]"
                  : isFutureDate
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-white"
          );
          const dayContent = (
            <>
              <p className="truncate text-center text-[11px] font-semibold text-slate-700">
                {getWeekdayLabel(day.date)}
              </p>
              <p className="text-center text-[10px] font-medium text-slate-500 sm:text-[11px]">
                {getMonthDayLabel(day.date)}
              </p>
              <div className="mt-1 flex h-14 items-end rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-white/70 p-1 sm:h-20">
                <div
                  className="w-full rounded-[var(--fs-radius-control)] bg-[color:var(--fs-color-brand-600)]"
                  style={{ height: `${Math.max(6, dailyCompletionPercent)}%` }}
                  aria-label={`${getWeekdayLabel(day.date)} ${dayCountLabel}`}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-slate-500 sm:text-[11px]">
                {dailyCounts.total > 0 ? `${dailyCounts.completed}/${dailyCounts.total}` : "0/0"}
              </p>
              <p className="min-h-3 text-center text-[9px] font-semibold text-emerald-700 sm:text-[10px]">
                {weeklyCompletedOnDateCount > 0 ? `${weeklyCompletedOnDateCount} weekly` : null}
              </p>
            </>
          );

          if (isFutureDate) {
            return (
              <span
                key={day.date}
                aria-disabled="true"
                aria-label={`${dayLabel}, upcoming`}
                className={dayClassName}
              >
                {dayContent}
              </span>
            );
          }

          return (
            <Link
              key={day.date}
              href={dayHref}
              onClick={(event) => handleCalendarLinkClick(event, dayHref, day.date)}
              aria-current={isSelected ? "date" : undefined}
              aria-busy={isPending ? "true" : undefined}
              aria-label={dayLabel}
              className={dayClassName}
            >
              {dayContent}
            </Link>
          );
        })}
      </div>
    );
  }

  function renderCalendarControls(testId: string) {
    function getCalendarControlClass(targetDate: string) {
      return cx(
        habitSecondaryActionClass,
        "px-3",
        pendingSelectedDate === targetDate ? "ring-2 ring-amber-400 ring-offset-2" : "",
        failedRequestedDate === targetDate ? "ring-2 ring-rose-300 ring-offset-2" : ""
      );
    }

    return (
      <div
        data-testid={testId}
        className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end"
      >
        <Link
          href={previousWindowHref}
          onClick={(event) =>
            handleCalendarLinkClick(event, previousWindowHref, calendarWindow.previousWindowDate)
          }
          aria-busy={pendingSelectedDate === calendarWindow.previousWindowDate ? "true" : undefined}
          className={getCalendarControlClass(calendarWindow.previousWindowDate)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="max-sm:sr-only">Previous week</span>
        </Link>
        <Link
          href={todayWindowHref}
          onClick={(event) => handleCalendarLinkClick(event, todayWindowHref, safeTodayDate)}
          aria-busy={pendingSelectedDate === safeTodayDate ? "true" : undefined}
          className={getCalendarControlClass(safeTodayDate)}
        >
          Today
        </Link>
        {canGoNextWindow ? (
          <Link
            href={nextWindowHref}
            onClick={(event) => handleCalendarLinkClick(event, nextWindowHref, nextWindowDate)}
            aria-busy={pendingSelectedDate === nextWindowDate ? "true" : undefined}
            className={getCalendarControlClass(nextWindowDate)}
          >
            <span className="max-sm:sr-only">Next week</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-label="Next week unavailable"
            className={cx(habitSecondaryActionClass, "px-3")}
          >
            <span className="max-sm:sr-only">Next week</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  function renderMobileDatePill() {
    const pillLabel = isSelectedToday ? "Today" : "History";
    const pillDateLabel = getLongDateLabel(snapshot.selectedDate);
    const PillIcon = isSelectedToday ? CalendarDays : RotateCcw;
    const pillStateClass = isSelectedToday
      ? "border-blue-600 bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] hover:bg-blue-700 focus-visible:ring-blue-700"
      : "border-amber-300 bg-amber-50 text-amber-950 shadow-[0_12px_28px_rgba(180,83,9,0.14)] hover:bg-amber-100 focus-visible:ring-amber-600";
    const pillIconClass = isSelectedToday
      ? "bg-white/20 text-white"
      : "bg-amber-100 text-amber-700";
    const pillDateClass = isSelectedToday ? "text-blue-100" : "text-amber-700";
    return (
      <div
        data-testid="habits-mobile-date-pill"
        className="sticky top-0 z-20 -mx-4 mt-3 mb-4 flex justify-end border-y border-slate-200/70 bg-white/95 px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
      >
        <button
          type="button"
          onClick={handleMobileDatePillClick}
          aria-current={isSelectedToday ? "date" : undefined}
          aria-label={
            isSelectedToday
              ? `Today, ${pillDateLabel}. Back to top.`
              : shouldShowSelectedAbsenceReview
                ? `History, ${pillDateLabel}. Jump to review list.`
                : `History, ${pillDateLabel}.`
          }
          className={cx(
            "inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            pillStateClass
          )}
        >
          <span
            className={cx(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              pillIconClass
            )}
            aria-hidden="true"
          >
            <PillIcon className="h-3.5 w-3.5" />
          </span>
          <span>{pillLabel}</span>
          <span className={cx("truncate text-xs font-semibold", pillDateClass)}>
            {pillDateLabel}
          </span>
        </button>
      </div>
    );
  }

  function renderWeeklyOverviewCard(testId: string, controlsTestId: string) {
    return (
      <div className={cx("mt-5", habitNestedMutedCardClass)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={habitLabelClass}>Weekly Overview</p>
            <p className="mt-1 text-sm text-slate-600">
              {weekLabel}
              {habitWeekCountSummary.daily.total > 0
                ? ` · Daily habits ${habitWeekCountSummary.daily.completed}/${habitWeekCountSummary.daily.total}`
                : ""}
              {habitWeekCountSummary.weekly.total > 0
                ? ` · Weekly habits ${habitWeekCountSummary.weekly.completed}/${habitWeekCountSummary.weekly.total}`
                : ""}
            </p>
          </div>
          {isHistoricalDate ? <span className={habitWarningChipClass}>History</span> : null}
        </div>
        {renderWeekOverview(testId)}
        <div className="mt-4">{renderCalendarControls(controlsTestId)}</div>
      </div>
    );
  }

  function getCountHabitStatus(item: HabitDayItem) {
    const todayValue = item.checkIn?.valueNumeric ?? 0;
    const target = item.habit.targetValueNumeric;
    const todayLabel = formatCountValue(todayValue, item.habit.targetUnit);
    if (typeof target === "number" && target > 0) {
      return `Today: ${todayLabel} · ${getCountTargetPrefix(
        item.habit.targetOperator
      )}: ${formatCountValue(target, item.habit.targetUnit)}`;
    }
    return `Today: ${todayLabel}`;
  }

  function renderMotivationMetric(
    label: string,
    value: string,
    detail?: string,
    detailTone: "muted" | "warning" = "muted"
  ) {
    return (
      <div className="min-w-0 border-t border-[color:var(--fs-border-soft)] pt-3">
        <p className={habitLabelClass}>{label}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        {detail ? (
          <p
            className={cx(
              "mt-1 text-sm",
              detailTone === "warning" ? "font-semibold text-amber-700" : "text-slate-500"
            )}
          >
            {detail}
          </p>
        ) : null}
      </div>
    );
  }

  function renderHistoryMetric(label: string, value: string) {
    return (
      <div className="min-w-0 border-t border-[color:var(--fs-border-soft)] pt-3">
        <p className={habitLabelClass}>{label}</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      </div>
    );
  }

  function renderCompactMotivationMetric(label: string, value: string, detail?: string) {
    return (
      <div className="min-w-0">
        <p className={habitLabelClass}>{label}</p>
        <p className="mt-1 text-base font-bold break-words text-slate-900">{value}</p>
        {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
      </div>
    );
  }

  function renderHabitMotivationDetails(item: HabitMotivationItem | undefined) {
    if (!item) return null;

    return (
      <div
        data-testid={`habit-progress-details-${item.habitId}`}
        className="mt-4 border-t border-[color:var(--fs-border-soft)] pt-4"
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm leading-5 font-bold tracking-wide text-slate-900 uppercase">
            Habit stats
          </h4>
          <div className="flex flex-wrap justify-end gap-2">
            {item.resetBoundary ? (
              <span className={habitBrandChipClass}>
                Since {getLongDateLabel(item.resetBoundary.effectiveDate)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {renderCompactMotivationMetric(
            "Current streak",
            formatMetricDays(item.currentStreakDays)
          )}
          {renderCompactMotivationMetric("Best streak", formatMetricDays(item.bestStreakDays))}
          {renderCompactMotivationMetric(
            "Consistency",
            formatMetricPercent(item.consistencyPercent)
          )}
          {renderCompactMotivationMetric(
            "Days completed",
            `${item.onTrackDayCount}/${item.eligibleDayCount}`
          )}
        </div>
        {item.resetBoundary ? (
          <p className="mt-3 text-sm text-slate-500">
            Last stats restart {getLongDateLabel(item.resetBoundary.effectiveDate)}. For complete
            history, visit{" "}
            <Link
              href={analysisHref}
              className="font-semibold text-[color:var(--fs-color-brand-700)] underline-offset-2 hover:underline"
            >
              Calendar Comparison
            </Link>
            .
          </p>
        ) : null}
      </div>
    );
  }

  function renderMotivationItem(item: HabitMotivationItem) {
    const consistencyLabel = formatMetricPercent(item.consistencyPercent);
    const completedLabel = `${item.onTrackDayCount}/${item.eligibleDayCount} completed`;
    const isArchived = item.status === "archived";
    const restoreDialogTitleId = `habit-restore-title-${item.habitId}`;

    return (
      <li key={item.habitId} className="border-t border-[color:var(--fs-border-soft)] py-3">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
            {item.title}
          </p>
          <span className={isArchived ? habitWarningChipClass : habitChipClass}>
            {isArchived ? "Past habit" : getHabitModeLabel(item.mode)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {completedLabel} · Best streak: {formatMetricDays(item.bestStreakDays)} ·{" "}
          {isArchived ? "Final" : "Current"} streak: {formatMetricDays(item.currentStreakDays)}
        </p>
        <p className="mt-1 text-sm text-slate-500">Consistency: {consistencyLabel}</p>
        {isArchived && canManageHabitSetup ? (
          confirmRestoreHabitId === item.habitId ? (
            <div
              role="alertdialog"
              aria-labelledby={restoreDialogTitleId}
              data-testid={`habit-restore-confirm-${item.habitId}`}
              className="mt-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] p-3 text-sm text-[color:var(--fs-color-brand-900)]"
            >
              <p id={restoreDialogTitleId} className="font-semibold">
                Restore this habit?
              </p>
              <p className="mt-1">
                This moves it back to active habits with the same history, reset boundaries, and
                Calendar Comparison records.
              </p>
              <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setConfirmRestoreHabitId(null)}
                  disabled={pendingKey === `restore-${item.habitId}`}
                  className={habitMobileSecondaryActionClass}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => restoreHabit(item.habitId)}
                  disabled={pendingKey !== null}
                  className={habitMobilePrimaryActionClass}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {pendingKey === `restore-${item.habitId}` ? "Restoring..." : "Restore habit"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setConfirmRestoreHabitId(item.habitId);
                setNotice(null);
                setError(null);
              }}
              disabled={pendingKey !== null}
              className={cx(habitMobileSecondaryActionClass, "mt-3")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restore habit
            </button>
          )
        ) : null}
      </li>
    );
  }

  function renderMotivationShortcut() {
    if (!selectedMotivationSummary) return null;

    return (
      <button
        type="button"
        onClick={openMotivationSummary}
        title="Motivation"
        className={habitIconActionClass}
      >
        <Target className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Motivation</span>
      </button>
    );
  }

  function renderCalendarShortcut() {
    const label = preferMobileActiveFocus
      ? isMobileWeekOpen
        ? "Hide Weekly Overview"
        : "Show Weekly Overview"
      : "Weekly Overview";

    return (
      <button
        type="button"
        aria-label={label}
        aria-expanded={preferMobileActiveFocus ? isMobileWeekOpen : undefined}
        aria-controls={preferMobileActiveFocus ? "mobile-habits-week-overview" : undefined}
        title="Weekly Overview"
        onClick={openWeekOverview}
        className={cx(habitIconActionClass, "sm:hidden")}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  function renderAnalysisShortcut() {
    if (!preferMobileActiveFocus) return null;

    return (
      <Link
        href={analysisHref}
        aria-label="View Habits analysis"
        title="View Habits analysis"
        className={cx(habitIconActionClass, "sm:hidden")}
      >
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">View Habits analysis</span>
      </Link>
    );
  }

  function renderSoundToggle() {
    return (
      <span data-testid="habits-sound-controls" className="contents">
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleHabitSoundPreference}
          title={soundEnabled ? "Sound on" : "Sound off"}
          className={habitIconActionClass}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{soundEnabled ? "Sound on" : "Sound off"}</span>
        </button>
      </span>
    );
  }

  function renderMotivationSection(className?: string) {
    const summary = selectedMotivationSummary;
    if (!summary) return null;

    const archivedItems = summary.items
      .filter((item) => item.status === "archived")
      .sort(compareArchivedMotivationItems);
    const hasPastHabitOverflow = archivedItems.length > PAST_HABIT_PREVIEW_COUNT;
    const visibleArchivedItems =
      isPastHabitsExpanded || !hasPastHabitOverflow
        ? archivedItems
        : archivedItems.slice(0, PAST_HABIT_PREVIEW_COUNT);
    const motivationDataQuality = getMotivationDataQuality(summary);
    const isDefinitionsPanelOpen = openMotivationPanel === "definitions";

    return (
      <section
        id="habits-motivation"
        ref={motivationSectionRef}
        data-testid="habits-motivation-history"
        className={cx("scroll-mt-28", habitPanelClass, className)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
              Habit stats
            </p>
            <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
              <h2 className="min-w-0 text-xl font-bold text-slate-900">Motivation</h2>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <span className={habitBrandChipClass}>{summary.activeHabitCount} active</span>
                {summary.archivedHabitCount > 0 ? (
                  <span className={habitWarningChipClass}>
                    {summary.archivedHabitCount} past habits
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {formatMotivationRangeLabel(summary, motivationRange)}
            </p>
          </div>
        </div>

        <div
          data-testid="habits-motivation-range-controls"
          role="group"
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-6"
          aria-label="Motivation range"
        >
          {HABIT_MOTIVATION_RANGE_VALUES.map((range) => {
            const isSelected = motivationRange === range;
            return (
              <button
                key={range}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setMotivationRange(range)}
                className={cx(getHabitChoiceClass(isSelected), "justify-center text-center")}
              >
                {HABIT_MOTIVATION_RANGE_LABELS[range]}
              </button>
            );
          })}
        </div>

        <div id="habits-motivation-details">
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
            {renderMotivationMetric(
              "Current perfect-day streak",
              formatMetricDays(summary.currentStreakDays)
            )}
            {renderMotivationMetric(
              "Best perfect-day streak",
              formatMetricDays(summary.bestStreakDays)
            )}
            {renderMotivationMetric("Perfect days", formatPerfectDayCount(summary))}
            {renderMotivationMetric("Consistency", formatMetricPercent(summary.consistencyPercent))}
          </div>
          {motivationDataQuality ? (
            <p
              data-testid="habits-motivation-data-quality"
              className={cx(
                "mt-3 text-sm",
                motivationDataQuality.tone === "warning"
                  ? "font-semibold text-amber-700"
                  : "text-slate-500"
              )}
            >
              {motivationDataQuality.label}
            </p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-[color:var(--fs-border-soft)] pt-3">
            {renderHistoryMetric("Rest days", String(summary.restDayCount))}
            {renderHistoryMetric("Slips", String(summary.slipCount))}
          </div>

          <div className="mt-5 border-t border-[color:var(--fs-border-soft)] pt-3">
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                data-testid="habits-motivation-definitions"
                aria-expanded={isDefinitionsPanelOpen}
                aria-controls="habits-motivation-definitions-panel"
                onClick={() =>
                  setOpenMotivationPanel((current) =>
                    current === "definitions" ? null : "definitions"
                  )
                }
                className={cx(
                  habitSecondaryActionClass,
                  "h-11 w-full px-3 text-center",
                  isDefinitionsPanelOpen
                    ? "border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)]"
                    : ""
                )}
              >
                <span>What counts?</span>
                <ChevronDown
                  className={cx(
                    "h-4 w-4 transition-transform",
                    isDefinitionsPanelOpen ? "rotate-180" : ""
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

            {isDefinitionsPanelOpen ? (
              <div
                id="habits-motivation-definitions-panel"
                className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2"
              >
                <p>
                  <strong className="font-semibold text-slate-800">Perfect days</strong> are days
                  where every Perfect Day-counting habit scheduled for that day was completed.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Perfect-day streak</strong> is
                  days in a row where every Perfect Day-counting habit scheduled for each day was
                  completed.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Best perfect-day streak</strong>{" "}
                  is the longest perfect-day streak in the selected period.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Consistency</strong> is the
                  percent of days in this range that were perfect days.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">0/0</strong> means there were no
                  scheduled Perfect Day-counting habits in the selected period.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Rest days</strong> are
                  intentional skips. They are excluded from the habit target for the day, but kept
                  in history.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Slips</strong> are logged misses
                  for Quit habits. They stay in history and do not delete progress before or after
                  the slip.
                </p>
                <p>
                  <strong className="font-semibold text-slate-800">Reset habit stats</strong>{" "}
                  restarts motivation stats from the selected reset date. Earlier check-ins stay
                  saved and can be reviewed in Calendar Comparison.
                </p>
              </div>
            ) : null}

            <div className="mt-5 min-w-0 border-t border-[color:var(--fs-border-soft)] pt-4">
              <p className={habitLabelClass}>Past habits</p>
              {archivedItems.length > 0 ? (
                <>
                  <ul
                    id="habits-past-habits-list"
                    data-testid="habits-past-habits-list"
                    className={cx(
                      "mt-1",
                      isPastHabitsExpanded && hasPastHabitOverflow
                        ? "max-h-[28rem] overflow-y-auto pr-1"
                        : ""
                    )}
                  >
                    {visibleArchivedItems.map(renderMotivationItem)}
                  </ul>
                  {hasPastHabitOverflow ? (
                    <button
                      type="button"
                      aria-expanded={isPastHabitsExpanded}
                      aria-controls="habits-past-habits-list"
                      onClick={() => setIsPastHabitsExpanded((current) => !current)}
                      className={cx(habitMobileSecondaryActionClass, "mt-3 w-full")}
                    >
                      {isPastHabitsExpanded ? "Show less" : "See all"}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="mt-3 border-t border-[color:var(--fs-border-soft)] pt-3 text-sm text-slate-500">
                  No past habits
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!snapshot.schemaReady) {
    return (
      <section className={habitPanelClass}>
        <h2 className="text-lg font-semibold text-slate-900">My Perfect Day</h2>
        <HabitFeedback tone="warning" className="mt-3" testId="habits-schema-warning">
          Habits are still syncing in this environment.
        </HabitFeedback>
      </section>
    );
  }

  const online = readNavigatorOnlineState();

  return (
    <div className="flex flex-col gap-5">
      <section
        data-testid="habit-perfect-day-summary"
        ref={summarySectionRef}
        className={cx(
          "order-1",
          habitAccentPanelClass,
          preferMobileActiveFocus ? "hidden sm:block" : ""
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
              My Perfect Day
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {snapshot.daySummary.isPerfectDay ? "Perfect day logged" : selectedDateLabel}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {habitsStatusLabel} · {preferredCountLabel}
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="My Perfect Day completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={snapshot.daySummary.completionPercent}
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-center"
          >
            <span className="text-2xl font-bold text-blue-800">
              {snapshot.daySummary.completionPercent}%
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className={habitNestedMutedCardClass}>
            <p className={habitLabelClass}>Daily habits</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {habitWeekCountSummary.daily.completed}/{habitWeekCountSummary.daily.total}
            </p>
          </div>
          <div className={habitNestedMutedCardClass}>
            <p className={habitLabelClass}>Weekly habits</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {habitWeekCountSummary.weekly.completed}/{habitWeekCountSummary.weekly.total}
            </p>
          </div>
          <div className={habitNestedMutedCardClass}>
            <p className={habitLabelClass}>7-day minutes</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalDurationMinutes}
            </p>
          </div>
        </div>

        {renderWeeklyOverviewCard(
          "habits-week-overview-summary",
          "habits-calendar-controls-summary"
        )}
      </section>

      {renderMotivationSection("order-3 sm:order-2")}

      <section
        id="today-habits"
        ref={habitsSectionRef}
        data-testid="habit-active-list"
        className={cx("order-2 scroll-mt-28 sm:order-3", habitPanelClass)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Habits</h2>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <p className="text-slate-600">
                {habitsStatusLabel}
                <span data-testid="habits-selected-date-context" className="text-slate-500">
                  {" "}
                  · {habitsHeaderDateContextLabel}
                </span>
              </p>
            </div>
          </div>
          <div
            className={cx(
              preferMobileActiveFocus
                ? selectedMotivationSummary
                  ? "grid w-full grid-cols-[2.75rem_2.75rem_2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
                  : "grid w-full grid-cols-[2.75rem_2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
                : selectedMotivationSummary
                  ? "grid w-full grid-cols-[2.75rem_2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
                  : "grid w-full grid-cols-[2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
            )}
          >
            {renderCalendarShortcut()}
            {renderMotivationShortcut()}
            {renderAnalysisShortcut()}
            {renderSoundToggle()}
            {isAddHabitOpen || !canManageHabitSetup ? null : (
              <button
                type="button"
                aria-expanded="false"
                aria-controls="add-habit"
                onClick={openAddHabitForm}
                className={habitMobilePrimaryActionClass}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add habit
              </button>
            )}
            {online === false ? <p className={habitWarningChipClass}>Offline</p> : null}
          </div>
        </div>

        {renderMobileDatePill()}

        {soundNotice ? (
          <p role="status" className="mt-3 text-sm font-medium text-slate-600">
            {soundNotice}
          </p>
        ) : null}

        {preferMobileActiveFocus && isMobileWeekOpen ? (
          <div id="mobile-habits-week-overview" className="mt-4 space-y-3 sm:hidden">
            {renderWeeklyOverviewCard(
              "habits-week-overview-mobile",
              "habits-calendar-controls-mobile"
            )}
          </div>
        ) : null}

        {renderCatchUpAssistant()}

        <section
          id="add-habit"
          ref={addHabitSectionRef}
          hidden={!isAddHabitOpen}
          className="scroll-mt-28 pb-4 max-sm:pb-24"
        >
          {isAddHabitOpen ? (
            <div className={cx("mt-4 border-[color:var(--fs-border-brand)]", habitMutedPanelClass)}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Add habit</h2>
                <button
                  type="button"
                  onClick={closeAddHabitForm}
                  className={habitSecondaryActionClass}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
              </div>
              <form onSubmit={createHabit} className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className={habitLabelClass}>Name</span>
                  <input
                    ref={addHabitNameInputRef}
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    className={habitFieldClass}
                    placeholder="Read 10 pages"
                  />
                </label>

                <div className="md:col-span-2">
                  <span className={habitLabelClass}>Mode</span>
                  <div className="mt-1 grid gap-2 sm:grid-cols-3">
                    {HABIT_MODE_VALUES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={draft.habitMode === mode}
                        onClick={() => setDraft((current) => applyHabitModeToDraft(current, mode))}
                        className={cx("min-h-11", getHabitChoiceClass(draft.habitMode === mode))}
                      >
                        {getHabitModeLabel(mode)}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.habitMode === "build" ? renderBuildTargetControls(draft, setDraft) : null}

                <label className="block">
                  <span className={habitLabelClass}>Category</span>
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, category: event.target.value }))
                    }
                    className={habitFieldClass}
                  >
                    {HABIT_CATEGORY_VALUES.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={habitLabelClass}>
                    {draft.habitMode === "quit" ? "Quit date" : "Start date"}
                  </span>
                  <input
                    type="date"
                    value={draft.startDate}
                    max={snapshot.selectedDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, startDate: event.target.value }))
                    }
                    className={habitFieldClass}
                  />
                </label>

                {draft.habitMode === "build" && draft.habitType === "time_of_day" ? (
                  <label className="block">
                    <span className={habitLabelClass}>Target time</span>
                    <input
                      type="time"
                      value={draft.targetTime}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, targetTime: event.target.value }))
                      }
                      className={habitFieldClass}
                    />
                  </label>
                ) : null}

                {draft.habitMode !== "quit" &&
                draftHabitType !== "binary" &&
                draftHabitType !== "time_of_day" ? (
                  <>
                    <NumberStepperField
                      label={draft.habitMode === "timed" ? "Timer target" : "Target"}
                      value={draft.targetValueNumeric}
                      step={draftHabitType === "count" ? 1 : 0.25}
                      onChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          targetValueNumeric: value,
                        }))
                      }
                    />
                    <label className="block">
                      <span className={habitLabelClass}>Unit</span>
                      <select
                        value={draft.targetUnit}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            targetUnit: event.target.value as HabitUnit,
                          }))
                        }
                        className={habitFieldClass}
                      >
                        {draftUnitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {getHabitUnitOptionLabel(unit)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}

                {renderScheduleControls(draft, setDraft, "Add habit")}

                {renderPerfectDayEligibilityControl(draft, setDraft)}

                <label className="block md:col-span-2">
                  <span className={habitLabelClass}>Note</span>
                  <input
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, notes: event.target.value }))
                    }
                    className={habitFieldClass}
                    placeholder="Optional"
                  />
                </label>

                <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center md:col-span-2">
                  <button
                    type="submit"
                    disabled={pendingKey !== null}
                    className={cx(habitMobilePrimaryActionClass, "px-4")}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create habit
                  </button>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    Best with 3-7 active habits.
                  </p>
                </div>
              </form>
            </div>
          ) : null}
        </section>

        {snapshot.daySummary.items.length === 0 ? (
          <HabitFeedback
            tone="empty"
            title="No active habits"
            className={cx("mt-4", isAddHabitOpen ? "max-sm:hidden" : "")}
            testId="habits-empty-state"
          >
            {canManageHabitSetup
              ? "Use Add habit to start tracking today."
              : "No editable habits were available for this date."}
          </HabitFeedback>
        ) : (
          <div className={`mt-4 space-y-3 ${isAddHabitOpen ? "max-sm:hidden" : ""}`}>
            {snapshot.daySummary.items.map((item, index) => {
              const habit = item.habit;
              const motivationItem = motivationItemsByHabitId.get(habit.id);
              const disabled = pendingKey !== null;
              const isSatisfied = item.evaluation.isSatisfied;
              const isQuit = habit.habitMode === "quit";
              const isTimed = habit.habitMode === "timed";
              const isCompletionGroup =
                item.priorityGroup === "done_today" || item.priorityGroup === "done_period";
              const isRestDay = item.checkIn?.status === "skipped";
              const isMicroSessionBacked = isMicroSessionBackedHabit(item);
              const trackingModeView = getHabitTrackingModeView(item);
              const microSessionProgress = getMicroSessionProgress(item);
              const closedCardMotivationLabel = isMicroSessionBacked
                ? getMicroSessionHabitCardLabel(item)
                : getClosedCardMotivationLabel(item, motivationItem);
              const timerSeconds = getTimerSeconds(habit.id);
              const timedProgressSeconds = getTimedProgressSeconds(item, timerSeconds);
              const timedProgressLabel = formatTimer(timedProgressSeconds);
              const timedTargetSeconds = getTimerTargetDisplaySeconds(habit) ?? 0;
              const timedProgressPercent =
                timedTargetSeconds > 0
                  ? Math.min(100, Math.round((timedProgressSeconds / timedTargetSeconds) * 100))
                  : 0;
              const timedTargetContextLabel = getTimedTargetContextLabel(habit);
              const isTimerRunning = timers[habit.id]?.startedAtMs != null;
              const timerActionLabel = isTimerRunning
                ? "Pause"
                : timerSeconds > 0
                  ? "Resume"
                  : "Start";
              const manualTimeInput = checkInInputs[habit.id]?.trim() ?? "";
              const canSaveManualTime = manualTimeInput !== "";
              const isExpanded = expandedHabitIds.includes(habit.id);
              const detailsId = `habit-details-${habit.id}`;
              const resetStatsDialogTitleId = `habit-reset-stats-title-${habit.id}`;
              const endHabitDialogTitleId = `habit-end-title-${habit.id}`;
              const cadenceLabel = habit.cadenceLabel;
              const isNewlyCreated = recentlyCreatedHabitId === habit.id;
              const canEditSelectedCheckIn = item.isScheduledForDate || item.checkIn !== null;
              const canRunTimerForSelectedDate = canEditSelectedCheckIn && isSelectedToday;
              const canUndoTimedCompletion =
                canEditSelectedCheckIn &&
                isTimed &&
                !isRestDay &&
                (item.checkIn?.timerSeconds ?? 0) > 0;
              const canShowTimedFinishAction =
                canRunTimerForSelectedDate &&
                !isCompletionGroup &&
                !isRestDay &&
                isTimed &&
                timerSeconds > 0;
              const statusLabel = isRestDay
                ? "Rest day"
                : isCompletionGroup
                  ? getCompletionStatusLabel(item)
                  : !canEditSelectedCheckIn && item.priorityGroup === "not_due"
                    ? "Later"
                    : item.evaluation.stateLabel;
              const showGroupHeading =
                index === 0 ||
                getPriorityGroupKey(snapshot.daySummary.items[index - 1]!) !==
                  getPriorityGroupKey(item);
              const showTimedProgressModule = isTimed && !isRestDay && canEditSelectedCheckIn;
              const showQuickCheckInEditor =
                canEditSelectedCheckIn &&
                !isCompletionGroup &&
                !isRestDay &&
                !isQuit &&
                !isTimed &&
                habit.habitType !== "binary";
              const showDetailsCheckInEditor =
                canEditSelectedCheckIn &&
                !isRestDay &&
                !isQuit &&
                !isTimed &&
                habit.habitType !== "binary" &&
                !showQuickCheckInEditor;
              const timedProgressContextLabel = timedTargetContextLabel;
              const quickStatusLabel = isRestDay
                ? "Rest day today"
                : isCompletionGroup
                  ? habit.habitType === "count" && typeof item.checkIn?.valueNumeric === "number"
                    ? getCountHabitStatus(item)
                    : isTimed
                      ? getTimedStatusLabel(item, timerSeconds)
                      : getBuildCompletionMotivationLabel(item)
                  : !canEditSelectedCheckIn && item.priorityGroup === "not_due"
                    ? "Not due today"
                    : isQuit
                      ? null
                      : isTimed
                        ? getTimedStatusLabel(item, timerSeconds)
                        : habit.habitType === "count"
                          ? getCountHabitStatus(item)
                          : getBuildOpenStatusLabel(item);
              const normalizedQuickStatusLabel =
                quickStatusLabel === "No check-in" ? null : quickStatusLabel;
              return (
                <div key={habit.id} className="space-y-2">
                  {showGroupHeading ? (
                    <p className={habitLabelClass}>{getPriorityGroupLabel(item)}</p>
                  ) : null}
                  <article
                    ref={(element) => {
                      habitCardRefs.current[habit.id] = element;
                    }}
                    tabIndex={-1}
                    data-testid={`habit-card-${habit.id}`}
                    className={`scroll-mt-28 p-4 transition outline-none focus:ring-2 focus:ring-blue-100 ${
                      isNewlyCreated
                        ? "fs-library-card border-emerald-200 bg-emerald-50/50"
                        : "fs-library-card fs-library-card-muted"
                    }`}
                  >
                    <div
                      className={cx("grid gap-3", "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end")}
                    >
                      <div className="min-w-0">
                        {isNewlyCreated ? (
                          <p
                            role="status"
                            aria-live="polite"
                            className={cx("mb-2", habitSuccessChipClass)}
                          >
                            Habit added
                          </p>
                        ) : null}
                        <div
                          data-testid={`habit-heading-row-${habit.id}`}
                          className="flex min-w-0 flex-wrap items-center justify-start gap-x-2 gap-y-1"
                        >
                          <h3 className="max-w-full min-w-0 truncate text-[17px] leading-6 font-semibold text-slate-900">
                            {habit.title}
                          </h3>
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className={cx(habitBrandChipClass, "shrink-0")}>
                              {trackingModeView.label}
                            </span>
                            <span className={cx(habitChipClass, "shrink-0")}>{cadenceLabel}</span>
                            {showTimedProgressModule && isCompletionGroup ? (
                              <span className={cx(habitSuccessChipClass, "shrink-0")}>
                                {getCompletionStatusLabel(item)}
                              </span>
                            ) : showTimedProgressModule ? null : (
                              <span
                                className={cx(
                                  isRestDay || statusLabel === "Slip logged today"
                                    ? habitWarningChipClass
                                    : isSatisfied || isCompletionGroup
                                      ? habitSuccessChipClass
                                      : habitChipClass,
                                  "shrink-0",
                                  shouldShowStatusChipOnMobile(statusLabel) ? "" : "max-sm:hidden"
                                )}
                              >
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          data-testid={`habit-card-motivation-${habit.id}`}
                          className="mt-1 text-[15px] leading-6 font-medium text-slate-600"
                        >
                          {closedCardMotivationLabel}
                        </p>
                        <p
                          data-testid={`habit-tracking-mode-copy-${habit.id}`}
                          className="mt-1 text-sm leading-5 text-slate-500"
                        >
                          {trackingModeView.summary}
                        </p>
                        {isMicroSessionBacked ? (
                          <div
                            data-testid={`habit-micro-session-progress-${habit.id}`}
                            className="mt-2 max-w-sm rounded-[var(--fs-radius-control)] border border-emerald-100 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600"
                          >
                            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-emerald-800">Micro Sessions</span>
                              <span className="text-slate-700">
                                {getMicroSessionProgressLabel(item)}
                              </span>
                            </div>
                            {microSessionProgress ? (
                              <div
                                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80"
                                role="progressbar"
                                aria-label={`${habit.title} Micro Sessions progress`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={microSessionProgress.progressPercent}
                              >
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${microSessionProgress.progressPercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : showTimedProgressModule ? (
                          <div
                            className="mt-2 max-w-sm rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 px-3 py-2 text-sm font-medium text-slate-600"
                            aria-label={`Total timed progress ${timedProgressLabel} ${timedProgressContextLabel}`}
                          >
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="text-xl leading-none font-bold text-[color:var(--fs-color-ink)] tabular-nums">
                                {timedProgressLabel}
                              </span>
                              <span className="text-sm text-[color:var(--fs-color-muted)]">
                                {timedProgressContextLabel}
                              </span>
                            </div>
                            {timedTargetSeconds > 0 ? (
                              <div
                                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80"
                                role="progressbar"
                                aria-label={`${habit.title} timed progress`}
                                aria-valuemin={0}
                                aria-valuemax={timedTargetSeconds}
                                aria-valuenow={Math.min(timedProgressSeconds, timedTargetSeconds)}
                              >
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{ width: `${timedProgressPercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : normalizedQuickStatusLabel ? (
                          <p className="mt-1 text-[15px] leading-6 font-medium text-slate-600">
                            {normalizedQuickStatusLabel}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className={cx(
                          "grid w-full grid-cols-1 gap-2 sm:flex sm:grid-cols-none sm:flex-wrap sm:items-center",
                          "sm:w-auto sm:justify-end"
                        )}
                      >
                        {canEditSelectedCheckIn && isQuit && !item.checkIn ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              return logLapse(item);
                            }}
                            disabled={disabled}
                            className={cx(habitMobileDangerActionClass, habitPeerActionWidthClass)}
                          >
                            <Flag className="h-4 w-4" aria-hidden="true" />
                            Log slip
                          </button>
                        ) : null}

                        {canEditSelectedCheckIn &&
                        habit.habitType === "binary" &&
                        !isQuit &&
                        !isMicroSessionBacked ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              return item.checkIn ? resetCheckIn(item) : saveCheckIn(item, true);
                            }}
                            disabled={disabled}
                            className={cx(
                              item.checkIn
                                ? habitMobileSecondaryActionClass
                                : habitMobilePrimaryActionClass,
                              habitPeerActionWidthClass
                            )}
                          >
                            {item.checkIn ? (
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            )}
                            {item.checkIn
                              ? isRestDay
                                ? "Undo rest day"
                                : "Undo complete"
                              : "Mark done"}
                          </button>
                        ) : null}

                        {isMicroSessionBacked ? (
                          <Link
                            href="/my-library/dryland?micro=active&view=auto#micro-sessions"
                            className={cx(
                              habitMobilePrimaryActionClass,
                              "h-11 min-h-11 min-w-[12rem] px-4 sm:!w-48"
                            )}
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            Go to Micro Sessions
                          </Link>
                        ) : null}

                        {canRunTimerForSelectedDate &&
                        !isCompletionGroup &&
                        !isRestDay &&
                        isTimed ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              if (isTimerRunning) {
                                pauseTimer(habit.id);
                              } else {
                                startTimer(habit.id);
                              }
                            }}
                            disabled={disabled}
                            className={cx(habitMobilePrimaryActionClass, habitPeerActionWidthClass)}
                          >
                            {isTimerRunning ? (
                              <Pause className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Play className="h-4 w-4" aria-hidden="true" />
                            )}
                            {timerActionLabel}
                          </button>
                        ) : null}

                        {canShowTimedFinishAction ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              return finishTimer(item);
                            }}
                            disabled={disabled}
                            className={cx(habitMobilePrimaryActionClass, habitPeerActionWidthClass)}
                          >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            Finish
                          </button>
                        ) : null}

                        {canUndoTimedCompletion ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              return undoTimedCompletion(item);
                            }}
                            disabled={disabled}
                            className={cx(
                              habitMobileSecondaryActionClass,
                              habitPeerActionWidthClass
                            )}
                          >
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            Undo complete
                          </button>
                        ) : null}

                        {showQuickCheckInEditor ? (
                          <div className="grid w-full grid-cols-1 items-end gap-2 sm:w-auto sm:grid-cols-[12rem_9rem]">
                            {habit.habitType === "time_of_day" ? (
                              <label className="block sm:w-32">
                                <span className="sr-only">{habit.title} time</span>
                                <input
                                  type="time"
                                  aria-label={`${habit.title} time`}
                                  value={checkInInputs[habit.id] ?? ""}
                                  onChange={(event) =>
                                    setCheckInInputs((current) => ({
                                      ...current,
                                      [habit.id]: event.target.value,
                                    }))
                                  }
                                  className={cx(habitFieldClass, "mt-0 h-11 min-h-11 py-0")}
                                />
                              </label>
                            ) : (
                              <NumberStepperField
                                label={`${habit.title} value`}
                                value={checkInInputs[habit.id] ?? ""}
                                step={habit.habitType === "count" ? 1 : 0.25}
                                max={habit.habitType === "count" ? 100 : undefined}
                                disabled={disabled}
                                hideLabel
                                onChange={(value) =>
                                  setCheckInInputs((current) => ({
                                    ...current,
                                    [habit.id]: value,
                                  }))
                                }
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return saveCheckIn(item);
                              }}
                              disabled={disabled}
                              className={cx(
                                habitMobilePrimaryActionClass,
                                habitPeerActionWidthClass
                              )}
                            >
                              <Save className="h-4 w-4" aria-hidden="true" />
                              Save
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={detailsId}
                          onClick={() => {
                            clearCreatedHabitNotice();
                            toggleHabitDetails(habit.id);
                          }}
                          className={cx(habitMobileSecondaryActionClass, habitPeerActionWidthClass)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          )}
                          Details
                        </button>
                      </div>
                    </div>

                    {habitNotices[habit.id] ? (
                      <HabitFeedback
                        tone="success"
                        className="mt-3 py-2"
                        testId={`habit-action-success-${habit.id}`}
                      >
                        {habitNotices[habit.id]}
                      </HabitFeedback>
                    ) : null}

                    {editingHabitId === habit.id && editDraft ? (
                      <form
                        data-testid={`habit-edit-form-${habit.id}`}
                        onSubmit={(event) => updateHabit(event, habit.id)}
                        className={cx("mt-4 grid gap-3 md:grid-cols-2", habitNestedCardClass)}
                      >
                        <p className="text-sm text-slate-600 md:col-span-2">
                          Updates this habit definition. Check-ins and history stay attached.
                        </p>

                        <label className="block md:col-span-2">
                          <span className={habitLabelClass}>Name</span>
                          <input
                            value={editDraft.title}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, title: event.target.value } : current
                              )
                            }
                            className={habitFieldClass}
                          />
                        </label>

                        <div className="md:col-span-2">
                          <span className={habitLabelClass}>Mode</span>
                          <div className="mt-1 grid gap-2 sm:grid-cols-3">
                            {HABIT_MODE_VALUES.map((modeOption) => (
                              <button
                                key={modeOption}
                                type="button"
                                aria-pressed={editDraft.habitMode === modeOption}
                                onClick={() =>
                                  setEditDraft((current) =>
                                    current ? applyHabitModeToDraft(current, modeOption) : current
                                  )
                                }
                                className={cx(
                                  "min-h-11",
                                  getHabitChoiceClass(editDraft.habitMode === modeOption)
                                )}
                              >
                                {getHabitModeLabel(modeOption)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {editDraft.habitMode === "build"
                          ? renderBuildTargetControls(editDraft, (updater) =>
                              setEditDraft((current) => (current ? updater(current) : current))
                            )
                          : null}

                        <label className="block">
                          <span className={habitLabelClass}>Category</span>
                          <select
                            value={editDraft.category}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, category: event.target.value } : current
                              )
                            }
                            className={habitFieldClass}
                          >
                            {HABIT_CATEGORY_VALUES.map((category) => (
                              <option key={category} value={category}>
                                {getCategoryLabel(category)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className={habitLabelClass}>
                            {editDraft.habitMode === "quit" ? "Quit date" : "Start date"}
                          </span>
                          <input
                            type="date"
                            value={editDraft.startDate}
                            max={snapshot.selectedDate}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, startDate: event.target.value } : current
                              )
                            }
                            className={habitFieldClass}
                          />
                        </label>

                        {editDraft.habitMode === "build" &&
                        editDraft.habitType === "time_of_day" ? (
                          <label className="block">
                            <span className={habitLabelClass}>Target time</span>
                            <input
                              type="time"
                              value={editDraft.targetTime}
                              onChange={(event) =>
                                setEditDraft((current) =>
                                  current ? { ...current, targetTime: event.target.value } : current
                                )
                              }
                              className={habitFieldClass}
                            />
                          </label>
                        ) : null}

                        {editDraft.habitMode !== "quit" &&
                        getResolvedDraftHabitType(editDraft) !== "binary" &&
                        getResolvedDraftHabitType(editDraft) !== "time_of_day" ? (
                          <>
                            <NumberStepperField
                              label={editDraft.habitMode === "timed" ? "Timer target" : "Target"}
                              value={editDraft.targetValueNumeric}
                              step={getResolvedDraftHabitType(editDraft) === "count" ? 1 : 0.25}
                              onChange={(value) =>
                                setEditDraft((current) =>
                                  current ? { ...current, targetValueNumeric: value } : current
                                )
                              }
                            />
                            <label className="block">
                              <span className={habitLabelClass}>Unit</span>
                              <select
                                value={editDraft.targetUnit}
                                onChange={(event) =>
                                  setEditDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          targetUnit: event.target.value as HabitUnit,
                                        }
                                      : current
                                  )
                                }
                                className={habitFieldClass}
                              >
                                {getUnitOptions(getResolvedDraftHabitType(editDraft)).map(
                                  (unit) => (
                                    <option key={unit} value={unit}>
                                      {getHabitUnitOptionLabel(unit)}
                                    </option>
                                  )
                                )}
                              </select>
                            </label>
                          </>
                        ) : null}

                        {renderScheduleControls(
                          editDraft,
                          (updater) =>
                            setEditDraft((current) => (current ? updater(current) : current)),
                          "Edit habit"
                        )}

                        {renderPerfectDayEligibilityControl(editDraft, (updater) =>
                          setEditDraft((current) => (current ? updater(current) : current))
                        )}

                        <label className="block md:col-span-2">
                          <span className={habitLabelClass}>Note</span>
                          <input
                            value={editDraft.notes}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, notes: event.target.value } : current
                              )
                            }
                            className={habitFieldClass}
                            placeholder="Optional"
                          />
                        </label>

                        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end md:col-span-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHabitId(null);
                              setEditDraft(null);
                            }}
                            disabled={pendingKey === `edit-${habit.id}`}
                            className={habitMobileSecondaryActionClass}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={pendingKey !== null}
                            className={habitMobilePrimaryActionClass}
                          >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {pendingKey === `edit-${habit.id}` ? "Saving..." : "Save changes"}
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {isExpanded ? (
                      <div id={detailsId} className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-sm font-medium text-slate-500">
                          {cadenceLabel} · Started {getFullDateLabel(habit.startDate)}
                        </p>

                        <div className="mt-3 border-l-4 border-[color:var(--fs-border-brand)] pl-3 text-sm text-slate-600">
                          <p className="font-semibold text-slate-900">
                            {trackingModeView.label} tracking
                          </p>
                          <p className="mt-1 leading-5">{trackingModeView.details}</p>
                        </div>

                        {habit.notes ? (
                          <p className="mt-3 text-sm text-slate-500">{habit.notes}</p>
                        ) : null}

                        {item.evaluation.supportingLabel && isRestDay ? (
                          <p className="mt-3 text-sm font-medium text-slate-600">
                            {item.evaluation.supportingLabel}
                          </p>
                        ) : null}

                        {renderHabitMotivationDetails(motivationItem)}

                        {confirmResetStatsHabitId === habit.id ? (
                          <div
                            role="alertdialog"
                            aria-labelledby={resetStatsDialogTitleId}
                            data-testid={`habit-reset-stats-confirm-${habit.id}`}
                            className={cx(
                              "mt-4 rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900"
                            )}
                          >
                            <p id={resetStatsDialogTitleId} className="font-semibold">
                              Confirm reset stats?
                            </p>
                            <p className="mt-1">
                              Motivation stats restart from{" "}
                              {getLongDateLabel(snapshot.selectedDate)}. Earlier check-ins stay
                              saved and can still be reviewed in{" "}
                              <Link
                                href={analysisHref}
                                className="font-semibold text-amber-950 underline-offset-2 hover:underline"
                              >
                                Calendar Comparison
                              </Link>
                              .
                            </p>
                            <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() => setConfirmResetStatsHabitId(null)}
                                disabled={disabled}
                                className={habitMobileSecondaryActionClass}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => resetHabitStats(item)}
                                disabled={disabled}
                                className={habitMobilePrimaryActionClass}
                              >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                {pendingKey === `reset-stats-${habit.id}`
                                  ? "Resetting..."
                                  : "Reset stats"}
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {confirmEndHabitId === habit.id ? (
                          <div
                            role="alertdialog"
                            aria-labelledby={endHabitDialogTitleId}
                            data-testid={`habit-end-confirm-${habit.id}`}
                            className="mt-4 rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900"
                          >
                            <p id={endHabitDialogTitleId} className="font-semibold">
                              End this habit?
                            </p>
                            <p className="mt-1">
                              This moves it to Past habits. Check-ins, reset boundaries, and
                              Calendar Comparison records stay saved.
                            </p>
                            <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() => setConfirmEndHabitId(null)}
                                disabled={pendingKey === `archive-${habit.id}`}
                                className={habitMobileSecondaryActionClass}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => archiveHabit(habit.id)}
                                disabled={disabled}
                                className={habitMobilePrimaryActionClass}
                              >
                                <Archive className="h-4 w-4" aria-hidden="true" />
                                {pendingKey === `archive-${habit.id}` ? "Ending..." : "End habit"}
                              </button>
                            </div>
                          </div>
                        ) : null}

                        <div
                          data-testid={`habit-details-actions-${habit.id}`}
                          className="mt-4 grid grid-cols-1 items-end gap-2 sm:flex sm:flex-wrap"
                        >
                          {canEditSelectedCheckIn && !isRestDay && isTimed ? (
                            <>
                              <NumberStepperField
                                label="Manual time"
                                inputAriaLabel={`${habit.title} manual time`}
                                value={checkInInputs[habit.id] ?? ""}
                                step={1}
                                max={HABIT_MANUAL_TIME_MAX_MINUTES}
                                inputMode="numeric"
                                normalizeInputValue={normalizeManualMinutesInputValue}
                                disabled={disabled}
                                className="block sm:w-40"
                                onChange={(value) =>
                                  setCheckInInputs((current) => ({
                                    ...current,
                                    [habit.id]: value,
                                  }))
                                }
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return saveManualTime(item);
                                }}
                                disabled={disabled || !canSaveManualTime}
                                className={cx(
                                  habitMobilePrimaryActionClass,
                                  habitWideActionWidthClass
                                )}
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save manual time
                              </button>
                            </>
                          ) : null}

                          {showDetailsCheckInEditor ? (
                            <>
                              {habit.habitType === "time_of_day" ? (
                                <label className="block sm:w-36">
                                  <span className={habitLabelClass}>Time</span>
                                  <input
                                    type="time"
                                    value={checkInInputs[habit.id] ?? ""}
                                    onChange={(event) =>
                                      setCheckInInputs((current) => ({
                                        ...current,
                                        [habit.id]: event.target.value,
                                      }))
                                    }
                                    className={habitFieldClass}
                                  />
                                </label>
                              ) : (
                                <NumberStepperField
                                  label="Value"
                                  value={checkInInputs[habit.id] ?? ""}
                                  step={habit.habitType === "count" ? 1 : 0.25}
                                  max={habit.habitType === "count" ? 100 : undefined}
                                  disabled={disabled}
                                  className="block sm:w-40"
                                  onChange={(value) =>
                                    setCheckInInputs((current) => ({
                                      ...current,
                                      [habit.id]: value,
                                    }))
                                  }
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return saveCheckIn(item);
                                }}
                                disabled={disabled}
                                className={cx(
                                  habitMobilePrimaryActionClass,
                                  habitPeerActionWidthClass
                                )}
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save
                              </button>
                            </>
                          ) : null}

                          {canEditSelectedCheckIn &&
                          !isCompletionGroup &&
                          !isQuit &&
                          !item.checkIn ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return markRestDay(item);
                              }}
                              disabled={disabled}
                              className={cx(
                                habitMobileSecondaryActionClass,
                                habitPeerActionWidthClass
                              )}
                            >
                              <Pause className="h-4 w-4" aria-hidden="true" />
                              Rest day
                            </button>
                          ) : null}

                          {canRunTimerForSelectedDate &&
                          !isRestDay &&
                          isTimed &&
                          timerSeconds > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                resetTimer(habit.id);
                              }}
                              disabled={disabled}
                              className={cx(
                                habitMobileSecondaryActionClass,
                                habitPeerActionWidthClass
                              )}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              Reset timer
                            </button>
                          ) : null}

                          {item.checkIn && (habit.habitType !== "binary" || isQuit) ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return canUndoTimedCompletion
                                  ? undoTimedCompletion(item)
                                  : resetCheckIn(item);
                              }}
                              disabled={disabled}
                              className={habitMobileSecondaryActionClass}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              {isQuit
                                ? "Undo slip"
                                : isRestDay
                                  ? "Undo rest day"
                                  : canUndoTimedCompletion
                                    ? "Undo complete"
                                    : "Reset"}
                            </button>
                          ) : null}

                          {snapshot.resetEventsReady !== false ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                setConfirmResetStatsHabitId(habit.id);
                                setNotice(null);
                                setError(null);
                              }}
                              disabled={disabled}
                              className={habitMobileSecondaryActionClass}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              Reset habit stats
                            </button>
                          ) : null}

                          {canManageHabitSetup ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  startEditingHabit(habit);
                                }}
                                disabled={disabled}
                                className={habitMobileSecondaryActionClass}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                Edit this habit
                              </button>

                              {confirmEndHabitId !== habit.id ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    clearCreatedHabitNotice();
                                    setConfirmEndHabitId(habit.id);
                                    setNotice(null);
                                    setError(null);
                                  }}
                                  disabled={disabled}
                                  className={habitMobileSecondaryActionClass}
                                >
                                  <Archive className="h-4 w-4" aria-hidden="true" />
                                  End habit and move to Past habits
                                </button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                </div>
              );
            })}
          </div>
        )}

        {renderSelectedAbsenceReviewPanel()}
      </section>

      <div className="order-4 min-h-6 space-y-2">
        {notice ? (
          <HabitFeedback tone="success" className="py-2" testId="habits-action-success">
            {notice}
          </HabitFeedback>
        ) : null}
        {error ? (
          <HabitFeedback tone="error" className="py-2" testId="habits-action-error">
            {error}
          </HabitFeedback>
        ) : null}
      </div>
    </div>
  );
}
