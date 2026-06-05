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
  type HabitDefinitionView,
  type HabitCadenceDayPolicy,
  type HabitCadencePeriod,
  type HabitDayItem,
  type HabitMode,
  type HabitOperator,
  type HabitSnapshot,
  type HabitType,
  type HabitUnit,
  type HabitWeekday,
} from "@/lib/habits/shared";
import { cx } from "@/components/ui/cx";
import { mobileActionItemClass, mobilePrimaryActionItemClass } from "@/components/ui/actionLayout";
import {
  buildMyLibraryCalendarHref,
  buildMyLibraryCalendarComparisonHref,
  buildMyLibraryCalendarWindow,
  getCalendarSourceFilterLabel,
  getMyLibraryCalendarPeriodStartDate,
} from "@/lib/my-library/calendar";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

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
};

type HabitDraft = {
  title: string;
  habitMode: HabitMode;
  habitType: HabitType;
  category: string;
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

type HabitSoundPlaybackResult = "played" | "blocked" | "unsupported";

type HabitFeedbackTone = "warning" | "error" | "success" | "empty";
type HabitFeedbackAnnouncement = "polite" | "assertive" | "none";

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
const HABIT_TIMER_STORAGE_PREFIX = "freeswimming:habits:v3:timers";
const HABIT_TIMER_STORAGE_VERSION = 1;
const HABIT_SOUND_PREFERENCE_STORAGE_KEY = "freeswimming:habits:v1:sound";
const HABIT_SOUND_PREFERENCE_STORAGE_VERSION = 1;
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

function buildDefaultDraft(selectedDate: string): HabitDraft {
  return {
    title: "",
    habitMode: "build",
    habitType: "binary",
    category: "movement",
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
  return `of ${formatTimer(targetSeconds)} today`;
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

function getSelectedDateDisplayLabel(selectedDate: string, todayDate: string) {
  return selectedDate === todayDate ? "Today" : getFullDateLabel(selectedDate);
}

function getHabitTypeLabel(type: HabitType) {
  switch (type) {
    case "avoidance":
      return "Avoid/limit";
    case "time_of_day":
      return "Time";
    case "duration":
      return "Minutes";
    case "count":
      return "Count";
    case "binary":
    default:
      return "Done only";
  }
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
    return `Streak: ${streakMatch[1]} days`;
  }
  const doneDaysMatch = label.match(/^(\d+)\/(\d+) days on track$/);
  if (doneDaysMatch?.[1] && doneDaysMatch[2]) {
    return `${doneDaysMatch[1]}/${doneDaysMatch[2]} days done`;
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

function formatQuitProgressLabel(label: string) {
  const clearDaysMatch = label.match(/^(\d+)\/(\d+) days on track$/);
  if (clearDaysMatch?.[1] && clearDaysMatch[2]) {
    return `${clearDaysMatch[1]}/${clearDaysMatch[2]} days clear`;
  }
  return label;
}

function shouldShowStatusChipOnMobile(statusLabel: string) {
  return (
    statusLabel === "Done today" ||
    statusLabel.startsWith("Done this ") ||
    statusLabel === "Slip logged today" ||
    statusLabel === "Rest day"
  );
}

function shouldShowStatusInDetails(statusLabel: string) {
  return statusLabel === "Open" || statusLabel === "Later";
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

async function playHabitCompletionTone(): Promise<HabitSoundPlaybackResult> {
  if (typeof window === "undefined") return "unsupported";

  const audioWindow = window as Window &
    typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
  const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return "unsupported";

  try {
    const context = new AudioContextConstructor();
    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.16);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    oscillator.addEventListener(
      "ended",
      () => {
        void context.close().catch(() => {
          // Audio feedback is optional; failed cleanup should not affect Habits tracking.
        });
      },
      { once: true }
    );

    return "played";
  } catch {
    return "blocked";
  }
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
  const [recentlyCreatedHabitId, setRecentlyCreatedHabitId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string | null>(null);
  const [failedRequestedDate, setFailedRequestedDate] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialSnapshot.loadError);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);
  const hasLoadedRowPreferencesRef = useRef(false);
  const hasHydratedTimersRef = useRef(false);
  const timedTargetProgressRef = useRef<Record<string, number>>({});
  const timedTargetSoundKeysRef = useRef<Set<string>>(new Set());
  const confirmedSelectedDateRef = useRef<string | null>(
    initialSnapshot.loadError ? null : initialSnapshot.selectedDate
  );
  const habitsSectionRef = useRef<HTMLElement | null>(null);
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
  const weekLabel = calendarWindow.weekLabel;
  const weekRangeLabel = getWeekRangeLabel(calendarWindow.startDate, calendarWindow.endDate);
  const editRuleLabel = isHistoricalDate
    ? "History day - correct existing check-ins here. Add, edit, and archive habits on Today."
    : "Today - manage habit setup and log today's check-ins here.";
  const pendingSelectedDate =
    requestedDate && requestedDate !== snapshot.selectedDate ? requestedDate : null;
  const analysisHref = buildMyLibraryCalendarComparisonHref({
    source: "habits",
    period: "week",
    selectedDate: snapshot.selectedDate,
  });

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
    setRecentlyCreatedHabitId(null);
    setNotice(null);
  }, [initialSnapshot]);

  useEffect(() => {
    setCheckInInputs(buildInputState(snapshot));
  }, [snapshot]);

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

  const playHabitSound = useCallback(async (reason: "completion" | "target" | "test") => {
    const result = await playHabitCompletionTone();
    if (result === "played") {
      setSoundNotice(reason === "test" ? "Test sound played." : null);
      return;
    }

    setSoundNotice(
      result === "unsupported"
        ? "Sound is not available in this browser."
        : "Sound was blocked. Your habit was still saved."
    );
  }, []);

  const playEnabledHabitSound = useCallback(
    (reason: "completion" | "target") => {
      if (!soundEnabled) return;
      void playHabitSound(reason);
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

  useEffect(() => {
    const nextProgress: Record<string, number> = {};

    for (const item of snapshot.daySummary.items) {
      if (item.habit.habitMode !== "timed" || item.habit.status !== "active") continue;
      const targetSeconds = getTimerTargetDisplaySeconds(item.habit);
      if (!targetSeconds) continue;

      const timer = timers[item.habit.id];
      const timerSeconds = getTimerSeconds(item.habit.id);
      const progressSeconds = getTimedProgressSeconds(item, timerSeconds);
      const soundKey = getTimedTargetSoundKey(snapshot.selectedDate, item.habit.id, targetSeconds);
      const previousProgress = timedTargetProgressRef.current[soundKey];

      if (
        previousProgress !== undefined &&
        isSelectedToday &&
        timer?.startedAtMs != null &&
        previousProgress < targetSeconds &&
        progressSeconds >= targetSeconds &&
        !timedTargetSoundKeysRef.current.has(soundKey)
      ) {
        timedTargetSoundKeysRef.current.add(soundKey);
        playEnabledHabitSound("target");
      }

      if (progressSeconds < targetSeconds) {
        timedTargetSoundKeysRef.current.delete(soundKey);
      }
      nextProgress[soundKey] = progressSeconds;
    }

    timedTargetProgressRef.current = nextProgress;
  }, [
    isSelectedToday,
    getTimerSeconds,
    nowMs,
    playEnabledHabitSound,
    snapshot.daySummary.items,
    snapshot.selectedDate,
    timers,
  ]);

  const activeCount = snapshot.activeHabits.length;
  const preferredCountLabel =
    activeCount === 0
      ? "No habits yet"
      : activeCount < 3
        ? `${activeCount} active · add a few more when ready`
        : `${activeCount} active`;

  const draftHabitType = getResolvedDraftHabitType(draft);
  const draftUnitOptions = useMemo(() => getUnitOptions(draftHabitType), [draftHabitType]);

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

  function closeAddHabitForm() {
    setIsAddHabitOpen(false);
    setError(null);
  }

  function clearCreatedHabitNotice() {
    setRecentlyCreatedHabitId(null);
  }

  function toggleHabitSoundPreference() {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    const didPersist = writeHabitSoundPreference(nextEnabled);
    setSoundNotice(
      didPersist
        ? nextEnabled
          ? "Sound on."
          : "Sound off."
        : "Sound preference cannot be saved in this browser."
    );
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
  }

  function collapseHabitDetails(habitId: string) {
    setExpandedHabitIds((current) => current.filter((id) => id !== habitId));
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
          isPerfectDayItem: true,
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
          selectedDate: snapshot.selectedDate,
        }),
      });
      await applyResponse(response, "Could not update that habit right now.");
      setEditingHabitId(null);
      setEditDraft(null);
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
      await applyResponse(response, "Could not archive that habit right now.");
      clearTimer(habitId);
      setNotice("Habit archived.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not archive that habit right now."
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
        playEnabledHabitSound("completion");
      }
      setNotice("Check-in saved.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function saveTimedSources(
    item: HabitDayItem,
    input: {
      timerSeconds: number;
      manualMinutes: number;
      successNotice: string;
      clearLocalTimerOnSuccess: boolean;
    }
  ) {
    const habit = item.habit;
    setPendingKey(`check-${habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: habit.id,
          checkInDate: snapshot.selectedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          timerSeconds: input.timerSeconds,
          manualMinutes: input.manualMinutes,
        }),
      });
      const nextSnapshot = await applyResponse(response, "Could not save that check-in right now.");
      collapseHabitDetails(habit.id);
      if (input.clearLocalTimerOnSuccess) clearTimer(habit.id);
      if (shouldPlaySuccessfulCompletionSound(item, nextSnapshot)) {
        playEnabledHabitSound("completion");
      }
      setNotice(input.successNotice);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save that check-in right now."
      );
    } finally {
      setPendingKey(null);
    }
  }

  async function logLapse(item: HabitDayItem) {
    setPendingKey(`lapse-${item.habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          valueBoolean: false,
        }),
      });
      await applyResponse(response, "Could not log that slip right now.");
      collapseHabitDetails(item.habit.id);
      setNotice("Slip logged.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log that slip right now.");
    } finally {
      setPendingKey(null);
    }
  }

  async function markRestDay(item: HabitDayItem) {
    setPendingKey(`rest-${item.habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
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
      successNotice: "Timer time saved.",
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
      successNotice: "Manual time saved.",
      clearLocalTimerOnSuccess: false,
    });
  }

  async function resetCheckIn(item: HabitDayItem) {
    setPendingKey(`reset-${item.habit.id}`);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: item.habit.id,
          checkInDate: snapshot.selectedDate,
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
          const dayLabel = `${getWeekdayLabel(day.date)} ${getLongDateLabel(day.date)} ${
            day.completionPercent
          }% complete${isSelected ? ", selected" : ""}${isPending ? ", loading" : ""}${
            didFailLoad ? ", could not load" : ""
          }${isToday ? ", today" : ""}`;
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
                  style={{ height: `${Math.max(6, day.completionPercent)}%` }}
                  aria-label={`${getWeekdayLabel(day.date)} ${day.completionPercent}% complete`}
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-slate-500 sm:text-[11px]">
                {day.completionPercent}%
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
        className="grid gap-3 rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-white/80 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={habitBrandChipClass}>{getCalendarSourceFilterLabel("habits")}</span>
            {isHistoricalDate ? <span className={habitWarningChipClass}>History</span> : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDateLabel}</p>
          <p className="mt-1 text-sm text-slate-600">
            {weekLabel} · {weekRangeLabel}
          </p>
          <p className="mt-1 text-sm text-slate-500">{editRuleLabel}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <Link
            href={previousWindowHref}
            onClick={(event) =>
              handleCalendarLinkClick(event, previousWindowHref, calendarWindow.previousWindowDate)
            }
            aria-busy={
              pendingSelectedDate === calendarWindow.previousWindowDate ? "true" : undefined
            }
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
    <div className="space-y-5">
      <section
        data-testid="habit-perfect-day-summary"
        className={cx(habitAccentPanelClass, preferMobileActiveFocus ? "hidden sm:block" : "")}
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
              {snapshot.daySummary.satisfiedPerfectDayItemCount}/
              {snapshot.daySummary.perfectDayItemCount} habits on target · {preferredCountLabel}
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
            <p className={habitLabelClass}>7-day perfect days</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.perfectDayCount}/7
            </p>
          </div>
          <div className={habitNestedMutedCardClass}>
            <p className={habitLabelClass}>7-day minutes</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalDurationMinutes}
            </p>
          </div>
          <div className={habitNestedMutedCardClass}>
            <p className={habitLabelClass}>7-day count</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalCount}
            </p>
          </div>
        </div>

        <div className="mt-5">{renderCalendarControls("habits-calendar-controls-summary")}</div>

        {renderWeekOverview("habits-week-overview-summary")}
      </section>

      <section
        id="today-habits"
        ref={habitsSectionRef}
        data-testid="habit-active-list"
        className={cx("scroll-mt-28", habitPanelClass)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Habits</h2>
            <p className="mt-1 text-sm text-slate-600">
              {preferMobileActiveFocus
                ? `${selectedDateLabel} · ${snapshot.daySummary.satisfiedPerfectDayItemCount}/${snapshot.daySummary.perfectDayItemCount} on target`
                : `${selectedDateLabel} · ${weekLabel} · ${weekRangeLabel}`}
            </p>
          </div>
          <div
            className={cx(
              preferMobileActiveFocus
                ? "grid w-full grid-cols-[2.75rem_2.75rem_minmax(0,1fr)] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end"
                : "flex flex-wrap items-center justify-end gap-2"
            )}
          >
            {preferMobileActiveFocus ? (
              <button
                type="button"
                aria-label={isMobileWeekOpen ? "Hide week overview" : "Show week overview"}
                aria-expanded={isMobileWeekOpen}
                aria-controls="mobile-habits-week-overview"
                title="Week overview"
                onClick={() => setIsMobileWeekOpen((current) => !current)}
                className={cx(
                  habitSecondaryActionClass,
                  "h-11 w-11 px-0 max-sm:rounded-[var(--fs-radius-control)] sm:hidden"
                )}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Week overview</span>
              </button>
            ) : null}
            {preferMobileActiveFocus ? (
              <Link
                href={analysisHref}
                aria-label="View Habits analysis"
                title="View Habits analysis"
                className={cx(
                  habitSecondaryActionClass,
                  "h-11 w-11 px-0 max-sm:rounded-[var(--fs-radius-control)] sm:hidden"
                )}
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">View Habits analysis</span>
              </Link>
            ) : null}
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

        <div
          className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center"
          data-testid="habits-sound-controls"
        >
          <p className={cx(habitLabelClass, "sm:mr-1")}>Completion sound</p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              aria-pressed={soundEnabled}
              onClick={toggleHabitSoundPreference}
              className={cx(habitSecondaryActionClass, "w-full px-2 sm:w-auto sm:px-3")}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              {soundEnabled ? "Sound on" : "Sound off"}
            </button>
            <button
              type="button"
              onClick={() => void playHabitSound("test")}
              className={cx(habitSecondaryActionClass, "w-full px-2 sm:w-auto sm:px-3")}
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              Test sound
            </button>
          </div>
          {soundNotice ? (
            <p role="status" className="text-sm font-medium text-slate-600">
              {soundNotice}
            </p>
          ) : null}
        </div>

        {preferMobileActiveFocus && isMobileWeekOpen ? (
          <div id="mobile-habits-week-overview" className="mt-4 space-y-3 sm:hidden">
            {renderCalendarControls("habits-calendar-controls-mobile")}
            <div className={habitNestedMutedCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={habitLabelClass}>Week overview</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {weekLabel} · {snapshot.weekSummary.perfectDayCount}/7 perfect days
                  </p>
                </div>
              </div>
              {renderWeekOverview("habits-week-overview-mobile")}
            </div>
          </div>
        ) : null}

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
              const disabled = pendingKey !== null;
              const isSatisfied = item.evaluation.isSatisfied;
              const isQuit = habit.habitMode === "quit";
              const isTimed = habit.habitMode === "timed";
              const isCompletionGroup =
                item.priorityGroup === "done_today" || item.priorityGroup === "done_period";
              const isRestDay = item.checkIn?.status === "skipped";
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
              const savedTimerSeconds = getSavedTimerSeconds(item);
              const savedManualMinutes = getSavedManualMinutes(item);
              const legacyTimedSeconds = getLegacyTimedSeconds(item);
              const isExpanded = expandedHabitIds.includes(habit.id);
              const detailsId = `habit-details-${habit.id}`;
              const cadenceLabel = habit.cadenceLabel;
              const timerTargetSeconds = getTimerTargetDisplaySeconds(habit);
              const habitTypeLabel = getHabitTypeLabel(habit.habitType);
              const isNewlyCreated = recentlyCreatedHabitId === habit.id;
              const habitTargetLabel =
                isTimed && timerTargetSeconds
                  ? `${cadenceLabel} target ${formatTimer(timerTargetSeconds)}`
                  : habit.targetLabel;
              const canEditSelectedCheckIn = item.isScheduledForDate || item.checkIn !== null;
              const canRunTimerForSelectedDate = canEditSelectedCheckIn && isSelectedToday;
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
              const timedProgressContextLabel = isCompletionGroup
                ? `${timedTargetContextLabel} · ${getCompletionStatusLabel(item)}`
                : timedTargetContextLabel;
              const quickStatusLabel = isRestDay
                ? "Rest day today"
                : isCompletionGroup
                  ? habit.habitType === "count" && typeof item.checkIn?.valueNumeric === "number"
                    ? getCountHabitStatus(item)
                    : isTimed
                      ? `${getTimedStatusLabel(item, timerSeconds)} · ${getCompletionStatusLabel(
                          item
                        )}`
                      : getBuildCompletionMotivationLabel(item)
                  : !canEditSelectedCheckIn && item.priorityGroup === "not_due"
                    ? "Not due today"
                    : isQuit
                      ? [
                          formatQuitProgressLabel(item.evaluation.valueLabel),
                          item.evaluation.supportingLabel,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : isTimed
                        ? getTimedStatusLabel(item, timerSeconds)
                        : habit.habitType === "count"
                          ? getCountHabitStatus(item)
                          : getBuildOpenStatusLabel(item);
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
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
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
                            {showTimedProgressModule ? null : (
                              <span className={cx(habitBrandChipClass, "shrink-0 max-sm:hidden")}>
                                {getHabitModeLabel(habit.habitMode)}
                              </span>
                            )}
                            <span className={cx(habitChipClass, "shrink-0")}>{cadenceLabel}</span>
                            {showTimedProgressModule ? null : (
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
                        {showTimedProgressModule ? (
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
                            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[color:var(--fs-color-muted)]">
                              <span className={habitChipClass}>
                                Timer {formatTimer(savedTimerSeconds)}
                              </span>
                              <span className={habitChipClass}>
                                Manual {savedManualMinutes} min
                              </span>
                              {timerSeconds > 0 ? (
                                <span className={habitBrandChipClass}>
                                  Active +{formatTimer(timerSeconds)}
                                </span>
                              ) : null}
                              {legacyTimedSeconds > 0 ? (
                                <span className={habitWarningChipClass}>
                                  Legacy total {formatTimer(legacyTimedSeconds)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : quickStatusLabel ? (
                          <p className="mt-1 text-[15px] leading-6 font-medium text-slate-600">
                            {quickStatusLabel}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:grid-cols-none sm:flex-wrap sm:items-center sm:justify-end">
                        {canEditSelectedCheckIn && habit.habitType === "binary" && !isQuit ? (
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
                            {item.checkIn ? "Undo" : "Mark done"}
                          </button>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={habitBrandChipClass}>
                            {getHabitModeLabel(habit.habitMode)}
                          </span>
                          {shouldShowStatusInDetails(statusLabel) ? (
                            <span className={habitChipClass}>{statusLabel}</span>
                          ) : null}
                          {habitTypeLabel !== habitTargetLabel ? (
                            <span className={habitChipClass}>{habitTypeLabel}</span>
                          ) : null}
                          <span className={habitChipClass}>{getCategoryLabel(habit.category)}</span>
                          <span className={habitChipClass}>
                            Started {getLongDateLabel(habit.startDate)}
                          </span>
                          <span className={habitChipClass}>{habitTargetLabel}</span>
                        </div>

                        {habit.notes ? (
                          <p className="mt-3 text-sm text-slate-500">{habit.notes}</p>
                        ) : null}

                        {item.evaluation.supportingLabel && isRestDay ? (
                          <p className="mt-3 text-sm font-medium text-slate-600">
                            {item.evaluation.supportingLabel}
                          </p>
                        ) : null}

                        <div
                          data-testid={`habit-details-actions-${habit.id}`}
                          className="mt-4 grid grid-cols-1 items-end gap-2 sm:flex sm:flex-wrap"
                        >
                          {isQuit ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return logLapse(item);
                              }}
                              disabled={disabled || item.checkIn !== null}
                              className={habitMobileDangerActionClass}
                            >
                              <Flag className="h-4 w-4" aria-hidden="true" />
                              Log slip
                            </button>
                          ) : null}

                          {canRunTimerForSelectedDate && !isRestDay && isTimed ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return finishTimer(item);
                              }}
                              disabled={disabled || timerSeconds <= 0}
                              className={cx(
                                habitMobilePrimaryActionClass,
                                habitPeerActionWidthClass
                              )}
                            >
                              <Save className="h-4 w-4" aria-hidden="true" />
                              Finish
                            </button>
                          ) : null}

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
                                return resetCheckIn(item);
                              }}
                              disabled={disabled}
                              className={habitMobileSecondaryActionClass}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              {isQuit ? "Undo slip" : isRestDay ? "Undo rest day" : "Reset"}
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
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return archiveHabit(habit.id);
                                }}
                                disabled={disabled}
                                className={habitMobileSecondaryActionClass}
                              >
                                <Archive className="h-4 w-4" aria-hidden="true" />
                                Archive
                              </button>
                            </>
                          ) : null}

                          {getBuildMotivationLabel(item) ? null : (
                            <p className="text-sm text-slate-500">{item.evaluation.valueLabel}</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="min-h-6 space-y-2">
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
