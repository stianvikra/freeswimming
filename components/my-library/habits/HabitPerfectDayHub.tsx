"use client";

import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Flag,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Target,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  HABIT_CATEGORY_VALUES,
  HABIT_MODE_VALUES,
  HABIT_TYPE_VALUES,
  type HabitDefinitionView,
  type HabitCadenceDayPolicy,
  type HabitCadencePeriod,
  type HabitDayItem,
  type HabitMode,
  type HabitSnapshot,
  type HabitType,
  type HabitUnit,
  type HabitWeekday,
} from "@/lib/habits/shared";
import { cx } from "@/components/ui/cx";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

type Props = {
  initialSnapshot: HabitSnapshot;
  preferMobileActiveFocus?: boolean;
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

const SEEN_HABIT_ROWS_STORAGE_KEY = "freeswimming:habits:v2:seen-row-ids";
const HABIT_TIMER_STORAGE_PREFIX = "freeswimming:habits:v3:timers";
const HABIT_TIMER_STORAGE_VERSION = 1;
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
  if (habitType === "count") return ["times", "steps", "pages", "glasses", "custom"];
  if (habitType === "avoidance") return ["times", "glasses", "custom"];
  return ["times"];
}

function getResolvedDraftHabitType(draft: HabitDraft): HabitType {
  if (draft.habitMode === "quit") return "avoidance";
  if (draft.habitMode === "timed") return "duration";
  return draft.habitType;
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

function secondsToMinutesInput(seconds: number) {
  return String(Math.round((seconds / 60) * 100) / 100);
}

function getTimerTargetDisplaySeconds(habit: HabitDefinitionView) {
  if (habit.timerTargetSeconds && habit.timerTargetSeconds > 0) return habit.timerTargetSeconds;
  const target = habit.targetValueNumeric;
  if (!target || target <= 0) return null;
  return habit.targetUnit === "seconds" ? Math.round(target) : Math.round(target * 60);
}

function getTimedProgressSeconds(item: HabitDayItem, timerSeconds: number) {
  if (timerSeconds > 0) return timerSeconds;
  const savedMinutes = item.checkIn?.valueNumeric;
  if (typeof savedMinutes !== "number" || savedMinutes <= 0) return 0;
  return Math.round(savedMinutes * 60);
}

function getTimedStatusLabel(item: HabitDayItem, timerSeconds: number) {
  const progressSeconds = getTimedProgressSeconds(item, timerSeconds);
  const targetSeconds = getTimerTargetDisplaySeconds(item.habit);
  if (!targetSeconds) return `${formatTimer(progressSeconds)} today`;
  return `${formatTimer(progressSeconds)} / ${formatTimer(targetSeconds)} today`;
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

function getHabitModeLabel(mode: HabitMode) {
  switch (mode) {
    case "quit":
      return "Quit";
    case "timed":
      return "Timed";
    case "build":
    default:
      return "Build";
  }
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

const habitFeedbackToneClasses: Record<HabitFeedbackTone, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  empty: "border-dashed border-slate-300 bg-slate-50 text-slate-600",
};

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

export default function HabitPerfectDayHub({
  initialSnapshot,
  preferMobileActiveFocus = false,
  userId,
}: Props) {
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
  const [recentlyCreatedHabitId, setRecentlyCreatedHabitId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialSnapshot.loadError);
  const hasLoadedRowPreferencesRef = useRef(false);
  const hasHydratedTimersRef = useRef(false);
  const habitsSectionRef = useRef<HTMLElement | null>(null);
  const addHabitSectionRef = useRef<HTMLElement | null>(null);
  const addHabitNameInputRef = useRef<HTMLInputElement | null>(null);
  const habitCardRefs = useRef<Record<string, HTMLElement | null>>({});

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
      if (window.location.hash === "#add-habit") {
        setIsAddHabitOpen(true);
        setRecentlyCreatedHabitId(null);
        setNotice(null);
        setError(null);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

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

  function getTimerSeconds(habitId: string) {
    const timer = timers[habitId];
    if (!timer) return 0;
    const runningSeconds =
      timer.startedAtMs === null ? 0 : Math.floor((nowMs - timer.startedAtMs) / 1000);
    return timer.elapsedSeconds + Math.max(0, runningSeconds);
  }

  function startTimer(habitId: string) {
    setTimers((current) => {
      const existing = current[habitId] ?? { elapsedSeconds: 0, startedAtMs: null };
      if (existing.startedAtMs !== null) return current;
      return {
        ...current,
        [habitId]: {
          ...existing,
          startedAtMs: Date.now(),
        },
      };
    });
    setNowMs(Date.now());
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
    setCheckInInputs((current) => ({ ...current, [habitId]: "" }));
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
    setEditingHabitId(habit.id);
    setEditDraft(buildDraftFromHabit(habit));
    setExpandedHabitIds((current) => [...new Set([...current, habit.id])]);
    setNotice(null);
    setError(null);
  }

  async function updateHabit(event: FormEvent<HTMLFormElement>, habitId: string) {
    event.preventDefault();
    if (!editDraft || editingHabitId !== habitId) return;

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
      await applyResponse(response, "Could not save that check-in right now.");
      collapseHabitDetails(habit.id);
      clearTimer(habit.id);
      setNotice("Check-in saved.");
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

  async function finishTimer(item: HabitDayItem) {
    const seconds = getTimerSeconds(item.habit.id);
    if (seconds <= 0) {
      setError("Start the timer before saving.");
      return;
    }

    const value = secondsToMinutesInput(seconds);
    setTimers((current) => ({
      ...current,
      [item.habit.id]: {
        elapsedSeconds: seconds,
        startedAtMs: null,
      },
    }));
    setCheckInInputs((current) => ({ ...current, [item.habit.id]: value }));
    await saveCheckIn(item, false, value);
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
        <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Cadence
        </legend>
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
              className={`min-h-10 rounded-xl border px-3 text-left text-sm font-semibold transition ${
                currentDraft.cadencePeriod === mode
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {currentDraft.cadencePeriod === "weekly" ? (
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Days
              </span>
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
                    className={`min-h-10 rounded-xl border px-3 text-left text-sm font-semibold transition ${
                      currentDraft.cadenceDayPolicy === policy
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {currentDraft.cadenceDayPolicy === "any" ? (
              <label className="block">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Times per week
                </span>
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
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {currentDraft.cadencePeriod === "monthly" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Times per month
              </span>
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
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <div>
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Days
              </span>
              <div className="mt-1 flex min-h-11 items-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-blue-900">
                Any days
              </div>
            </div>
          </div>
        ) : null}

        {currentDraft.cadencePeriod === "weekly" && currentDraft.cadenceDayPolicy === "fixed" ? (
          <fieldset className="mt-3">
            <legend className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Fixed weekdays
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ALL_HABIT_WEEKDAYS.map((day) => {
                const checked = currentDraft.scheduleDays.includes(day);
                return (
                  <label
                    key={day}
                    className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                      checked
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
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
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
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

  function getCountHabitStatus(item: HabitDayItem) {
    const todayValue = item.checkIn?.valueNumeric ?? 0;
    return `${formatCountValue(todayValue, item.habit.targetUnit)} today · ${
      item.cadenceProgress.completedCount
    }/${item.cadenceProgress.targetCount} ${item.cadenceProgress.periodLabel}`;
  }

  if (!snapshot.schemaReady) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
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
        className={`rounded-2xl border border-slate-200 bg-white p-5 ${
          preferMobileActiveFocus ? "hidden sm:block" : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
              My Perfect Day
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {snapshot.daySummary.isPerfectDay ? "Perfect day logged" : "Today"}
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              7-day perfect days
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.perfectDayCount}/7
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              7-day minutes
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalDurationMinutes}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              7-day count
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {snapshot.weekSummary.totalCount}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2" aria-label="Seven day habit consistency">
          {snapshot.weekSummary.days.map((day) => (
            <div key={day.date} className="min-w-0">
              <div className="flex h-20 items-end rounded-xl border border-slate-200 bg-slate-50 p-1">
                <div
                  className="w-full rounded-lg bg-blue-600"
                  style={{ height: `${Math.max(6, day.completionPercent)}%` }}
                  aria-label={`${getWeekdayLabel(day.date)} ${day.completionPercent}% complete`}
                />
              </div>
              <p className="mt-1 truncate text-center text-[11px] font-semibold text-slate-600">
                {getWeekdayLabel(day.date)}
              </p>
              <p className="text-center text-[11px] text-slate-500">{day.completionPercent}%</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="today-habits"
        ref={habitsSectionRef}
        data-testid="habit-active-list"
        className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Habits</h2>
            <p className="mt-1 text-sm text-slate-600">
              {preferMobileActiveFocus
                ? `${snapshot.daySummary.satisfiedPerfectDayItemCount}/${snapshot.daySummary.perfectDayItemCount} on target today`
                : getLongDateLabel(snapshot.selectedDate)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isAddHabitOpen ? null : (
              <button
                type="button"
                aria-expanded="false"
                aria-controls="add-habit"
                onClick={openAddHabitForm}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add habit
              </button>
            )}
            {online === false ? (
              <p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Offline
              </p>
            ) : null}
          </div>
        </div>

        <section
          id="add-habit"
          ref={addHabitSectionRef}
          hidden={!isAddHabitOpen}
          className="scroll-mt-28 pb-4 max-sm:pb-24"
        >
          {isAddHabitOpen ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Add habit</h2>
                <button
                  type="button"
                  onClick={closeAddHabitForm}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </button>
              </div>
              <form onSubmit={createHabit} className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Name
                  </span>
                  <input
                    ref={addHabitNameInputRef}
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Read 10 pages"
                  />
                </label>

                <div className="md:col-span-2">
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Mode
                  </span>
                  <div className="mt-1 grid gap-2 sm:grid-cols-3">
                    {HABIT_MODE_VALUES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={draft.habitMode === mode}
                        onClick={() => setDraft((current) => applyHabitModeToDraft(current, mode))}
                        className={`min-h-11 rounded-xl border px-3 text-left text-sm font-semibold transition ${
                          draft.habitMode === mode
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {getHabitModeLabel(mode)}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.habitMode === "build" ? (
                  <label className="block">
                    <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Type
                    </span>
                    <select
                      value={draft.habitType}
                      onChange={(event) => {
                        const habitType = event.target.value as HabitType;
                        const unitOptions = getUnitOptions(habitType);
                        setDraft((current) => ({
                          ...current,
                          habitType,
                          targetUnit: unitOptions[0] ?? "times",
                          targetValueNumeric:
                            habitType === "avoidance" ? "0" : current.targetValueNumeric,
                        }));
                      }}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {HABIT_TYPE_VALUES.map((type) => (
                        <option key={type} value={type}>
                          {getHabitTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="block">
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Category
                  </span>
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, category: event.target.value }))
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {HABIT_CATEGORY_VALUES.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {draft.habitMode === "quit" ? "Quit date" : "Start date"}
                  </span>
                  <input
                    type="date"
                    value={draft.startDate}
                    max={snapshot.selectedDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, startDate: event.target.value }))
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {draft.habitMode === "build" && draft.habitType === "time_of_day" ? (
                  <label className="block">
                    <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Target time
                    </span>
                    <input
                      type="time"
                      value={draft.targetTime}
                      onChange={(event) =>
                        setDraft((current) => ({ ...current, targetTime: event.target.value }))
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ) : null}

                {draft.habitMode !== "quit" &&
                draftHabitType !== "binary" &&
                draftHabitType !== "time_of_day" ? (
                  <>
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {draft.habitMode === "timed" ? "Timer target" : "Target"}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.25"
                        value={draft.targetValueNumeric}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            targetValueNumeric: event.target.value,
                          }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Unit
                      </span>
                      <select
                        value={draft.targetUnit}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            targetUnit: event.target.value as HabitUnit,
                          }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {draftUnitOptions.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}

                {renderScheduleControls(draft, setDraft, "Add habit")}

                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Note
                  </span>
                  <input
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <button
                    type="submit"
                    disabled={pendingKey !== null}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
            Use Add habit to start tracking today.
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
              const timerSeconds = getTimerSeconds(habit.id);
              const isTimerRunning = timers[habit.id]?.startedAtMs != null;
              const timerActionLabel = isTimerRunning
                ? "Pause"
                : timerSeconds > 0
                  ? "Resume"
                  : "Start";
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
              const canEditTodaysCheckIn = item.isScheduledForDate || item.checkIn !== null;
              const statusLabel = isCompletionGroup
                ? getCompletionStatusLabel(item)
                : !canEditTodaysCheckIn && item.priorityGroup === "not_due"
                  ? "Later"
                  : item.evaluation.stateLabel;
              const showGroupHeading =
                index === 0 ||
                getPriorityGroupKey(snapshot.daySummary.items[index - 1]!) !==
                  getPriorityGroupKey(item);
              const quickStatusLabel = isCompletionGroup
                ? habit.habitType === "count" && typeof item.checkIn?.valueNumeric === "number"
                  ? `${formatCountValue(
                      item.checkIn?.valueNumeric ?? 0,
                      habit.targetUnit
                    )} today · ${getCompletionStatusLabel(item)}`
                  : isTimed
                    ? `${getTimedStatusLabel(item, timerSeconds)} · ${getCompletionStatusLabel(
                        item
                      )}`
                    : getCompletionStatusLabel(item)
                : !canEditTodaysCheckIn && item.priorityGroup === "not_due"
                  ? "Not due today"
                  : isQuit
                    ? `${item.evaluation.valueLabel} · ${
                        item.evaluation.stateLabel === "Lapse logged"
                          ? "Slip logged today"
                          : "On track today"
                      }`
                    : isTimed
                      ? getTimedStatusLabel(item, timerSeconds)
                      : habit.habitType === "count"
                        ? getCountHabitStatus(item)
                        : item.evaluation.valueLabel;
              return (
                <div key={habit.id} className="space-y-2">
                  {showGroupHeading ? (
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {getPriorityGroupLabel(item)}
                    </p>
                  ) : null}
                  <article
                    ref={(element) => {
                      habitCardRefs.current[habit.id] = element;
                    }}
                    tabIndex={-1}
                    data-testid={`habit-card-${habit.id}`}
                    className={`scroll-mt-28 rounded-2xl border p-4 transition outline-none focus:ring-2 focus:ring-blue-100 ${
                      isNewlyCreated
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-200 bg-slate-50/70"
                    }`}
                  >
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        {isNewlyCreated ? (
                          <p
                            role="status"
                            aria-live="polite"
                            className="mb-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                          >
                            Habit added
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="min-w-0 text-base font-semibold text-slate-900">
                            {habit.title}
                          </h3>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                            {getHabitModeLabel(habit.habitMode)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {cadenceLabel}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isSatisfied || isCompletionGroup
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-white text-slate-600"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {quickStatusLabel}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {canEditTodaysCheckIn && habit.habitType === "binary" && !isQuit ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              return item.checkIn ? resetCheckIn(item) : saveCheckIn(item, true);
                            }}
                            disabled={disabled}
                            className={`inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              item.checkIn
                                ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                            }`}
                          >
                            {item.checkIn ? (
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            )}
                            {item.checkIn ? "Undo" : "Mark done"}
                          </button>
                        ) : null}

                        {canEditTodaysCheckIn && !isCompletionGroup && isTimed ? (
                          <>
                            <div className="flex h-10 min-w-24 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
                              <Clock className="h-4 w-4 text-blue-700" aria-hidden="true" />
                              {formatTimer(timerSeconds)}
                            </div>
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
                              className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isTimerRunning ? (
                                <Pause className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Play className="h-4 w-4" aria-hidden="true" />
                              )}
                              {timerActionLabel}
                            </button>
                          </>
                        ) : null}

                        {canEditTodaysCheckIn &&
                        !isCompletionGroup &&
                        !isQuit &&
                        !isTimed &&
                        habit.habitType !== "binary" ? (
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="block">
                              <span className="sr-only">
                                {habit.title} {habit.habitType === "time_of_day" ? "time" : "value"}
                              </span>
                              <input
                                type={habit.habitType === "time_of_day" ? "time" : "number"}
                                min={habit.habitType === "time_of_day" ? undefined : 0}
                                step={habit.habitType === "time_of_day" ? undefined : "0.25"}
                                aria-label={`${habit.title} ${
                                  habit.habitType === "time_of_day" ? "time" : "value"
                                }`}
                                value={checkInInputs[habit.id] ?? ""}
                                onChange={(event) =>
                                  setCheckInInputs((current) => ({
                                    ...current,
                                    [habit.id]: event.target.value,
                                  }))
                                }
                                className="h-10 w-24 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return saveCheckIn(item);
                              }}
                              disabled={disabled}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                        className="mt-4 grid gap-3 rounded-2xl border border-blue-100 bg-white p-4 md:grid-cols-2"
                      >
                        <p className="text-sm text-slate-600 md:col-span-2">
                          Updates this habit definition. Check-ins and history stay attached.
                        </p>

                        <label className="block md:col-span-2">
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Name
                          </span>
                          <input
                            value={editDraft.title}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, title: event.target.value } : current
                              )
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>

                        <div className="md:col-span-2">
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Mode
                          </span>
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
                                className={`min-h-11 rounded-xl border px-3 text-left text-sm font-semibold transition ${
                                  editDraft.habitMode === modeOption
                                    ? "border-blue-600 bg-blue-50 text-blue-900"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {getHabitModeLabel(modeOption)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {editDraft.habitMode === "build" ? (
                          <label className="block">
                            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                              Type
                            </span>
                            <select
                              value={editDraft.habitType}
                              onChange={(event) => {
                                const habitType = event.target.value as HabitType;
                                const unitOptions = getUnitOptions(habitType);
                                setEditDraft((current) =>
                                  current
                                    ? {
                                        ...current,
                                        habitType,
                                        targetUnit: unitOptions[0] ?? "times",
                                        targetValueNumeric:
                                          habitType === "avoidance"
                                            ? "0"
                                            : current.targetValueNumeric,
                                      }
                                    : current
                                );
                              }}
                              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              {HABIT_TYPE_VALUES.map((type) => (
                                <option key={type} value={type}>
                                  {getHabitTypeLabel(type)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}

                        <label className="block">
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Category
                          </span>
                          <select
                            value={editDraft.category}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, category: event.target.value } : current
                              )
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            {HABIT_CATEGORY_VALUES.map((category) => (
                              <option key={category} value={category}>
                                {getCategoryLabel(category)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
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
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>

                        {editDraft.habitMode === "build" &&
                        editDraft.habitType === "time_of_day" ? (
                          <label className="block">
                            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                              Target time
                            </span>
                            <input
                              type="time"
                              value={editDraft.targetTime}
                              onChange={(event) =>
                                setEditDraft((current) =>
                                  current ? { ...current, targetTime: event.target.value } : current
                                )
                              }
                              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </label>
                        ) : null}

                        {editDraft.habitMode !== "quit" &&
                        getResolvedDraftHabitType(editDraft) !== "binary" &&
                        getResolvedDraftHabitType(editDraft) !== "time_of_day" ? (
                          <>
                            <label className="block">
                              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                {editDraft.habitMode === "timed" ? "Timer target" : "Target"}
                              </span>
                              <input
                                type="number"
                                min={0}
                                step="0.25"
                                value={editDraft.targetValueNumeric}
                                onChange={(event) =>
                                  setEditDraft((current) =>
                                    current
                                      ? { ...current, targetValueNumeric: event.target.value }
                                      : current
                                  )
                                }
                                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                            <label className="block">
                              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Unit
                              </span>
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
                                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              >
                                {getUnitOptions(getResolvedDraftHabitType(editDraft)).map(
                                  (unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
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
                          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Note
                          </span>
                          <input
                            value={editDraft.notes}
                            onChange={(event) =>
                              setEditDraft((current) =>
                                current ? { ...current, notes: event.target.value } : current
                              )
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Optional"
                          />
                        </label>

                        <div className="flex flex-wrap items-center justify-end gap-2 md:col-span-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingHabitId(null);
                              setEditDraft(null);
                            }}
                            disabled={pendingKey === `edit-${habit.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={pendingKey !== null}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                          {habitTypeLabel !== habitTargetLabel ? (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {habitTypeLabel}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {getCategoryLabel(habit.category)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Started {getLongDateLabel(habit.startDate)}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {habitTargetLabel}
                          </span>
                        </div>

                        {habit.notes ? (
                          <p className="mt-3 text-sm text-slate-500">{habit.notes}</p>
                        ) : null}

                        <div className="mt-4 flex flex-wrap items-end gap-2">
                          {isQuit ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return logLapse(item);
                              }}
                              disabled={disabled || item.checkIn !== null}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Flag className="h-4 w-4" aria-hidden="true" />
                              Log slip
                            </button>
                          ) : null}

                          {canEditTodaysCheckIn && isTimed ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return finishTimer(item);
                                }}
                                disabled={disabled || timerSeconds <= 0}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Finish
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  resetTimer(habit.id);
                                }}
                                disabled={disabled || timerSeconds <= 0}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Reset
                              </button>
                              <label className="block">
                                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                  Manual min
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.25"
                                  value={checkInInputs[habit.id] ?? ""}
                                  onChange={(event) =>
                                    setCheckInInputs((current) => ({
                                      ...current,
                                      [habit.id]: event.target.value,
                                    }))
                                  }
                                  className="mt-1 h-10 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return saveCheckIn(item);
                                }}
                                disabled={disabled}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save manual
                              </button>
                            </>
                          ) : null}

                          {canEditTodaysCheckIn &&
                          !isQuit &&
                          !isTimed &&
                          habit.habitType !== "binary" ? (
                            <>
                              <label className="block">
                                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                  {habit.habitType === "time_of_day" ? "Time" : "Value"}
                                </span>
                                <input
                                  type={habit.habitType === "time_of_day" ? "time" : "number"}
                                  min={habit.habitType === "time_of_day" ? undefined : 0}
                                  step={habit.habitType === "time_of_day" ? undefined : "0.25"}
                                  value={checkInInputs[habit.id] ?? ""}
                                  onChange={(event) =>
                                    setCheckInInputs((current) => ({
                                      ...current,
                                      [habit.id]: event.target.value,
                                    }))
                                  }
                                  className="mt-1 h-10 w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  clearCreatedHabitNotice();
                                  return saveCheckIn(item);
                                }}
                                disabled={disabled}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Save
                              </button>
                            </>
                          ) : null}

                          {item.checkIn && (habit.habitType !== "binary" || isQuit) ? (
                            <button
                              type="button"
                              onClick={() => {
                                clearCreatedHabitNotice();
                                return resetCheckIn(item);
                              }}
                              disabled={disabled}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              {isQuit ? "Undo slip" : "Reset"}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              clearCreatedHabitNotice();
                              startEditingHabit(habit);
                            }}
                            disabled={disabled}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Archive className="h-4 w-4" aria-hidden="true" />
                            Archive
                          </button>

                          <p className="text-sm text-slate-500">{item.evaluation.valueLabel}</p>
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
