"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  Bubbles,
  CheckCircle2,
  ListChecks,
  Pause,
  Pencil,
  Play,
  RefreshCcw,
  Repeat,
  Trash2,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";
import DrylandFeedback from "@/components/my-library/dryland/DrylandFeedback";
import { cx } from "@/components/ui/cx";
import {
  playAppSoundProfile,
  type AppSoundPlaybackResult,
  type AppSoundProfileName,
} from "@/lib/audio/client-sound";
import {
  getDrylandMicroBlockReleaseDate,
  getDrylandMicroWeekdayLabel,
  isDrylandMicroBlockAvailable,
  type DrylandMicroBlockSnapshot,
  type DrylandMicroBlockStatus,
  type DrylandMicroHabitLinkRecord,
  type DrylandMicroPlanApiResponse,
  type DrylandMicroPlanRecord,
  type DrylandMicroReleaseMode,
} from "@/lib/dryland/micro-plans";
import { formatSecondsLabel, type DrylandSessionSummary } from "@/lib/dryland/shared";
import { getBrowserLocalDayTimezone } from "@/lib/my-library/local-day";

type Props = {
  initialPlan: DrylandMicroPlanRecord | null;
  sessions: DrylandSessionSummary[];
  schemaReady: boolean;
  loadError: string | null;
  initialEditorOpen?: boolean;
  preferMobileBubbles?: boolean;
  onSourceSelectionChange?: (isActive: boolean) => void;
  onPlanChange?: (plan: DrylandMicroPlanRecord | null) => void;
};

type UnitView = {
  block: DrylandMicroBlockSnapshot;
  index: number;
  isAvailable: boolean;
  releaseDate: Date | null;
};

type HistoryUnitGroup = {
  key: string;
  status: Exclude<DrylandMicroBlockStatus, "queued">;
  title: string;
  units: UnitView[];
  sortIndex: number;
  isArchived: boolean;
  seriesLabel: string;
};

type ExecutionMode = "ordered" | "bubbles";
type PatchPlanOptions = {
  applyResponse?: boolean;
};
type UpdateBlockOptions = {
  visualOrigin?: ExecutionMode;
  completePausedHabitLink?: boolean;
  skipPausedHabitPrompt?: boolean;
};
type UpdateBlockFn = (
  blockId: string,
  blockStatus: DrylandMicroBlockStatus,
  options?: UpdateBlockOptions
) => Promise<void>;
type CompletedUndoItem = {
  blockId: string;
  title: string;
};
type BubbleTimerState = {
  blockId: string;
  durationSeconds: number;
  remainingSeconds: number;
  startedAtMs: number | null;
  isConfirmingDone: boolean;
};
type PendingPausedCompletion = {
  blockId: string;
  title: string;
  visualOrigin: ExecutionMode;
};
type ArchivedRepeatPlan = {
  sourceIds: string[];
  releaseDayAssignments: Record<string, number>;
  title: string;
};

const RELEASE_MODES: Array<{ value: Exclude<DrylandMicroReleaseMode, "manual">; label: string }> = [
  { value: "available_now", label: "Available now" },
  { value: "weekday", label: "Weekday release" },
];

const WEEKDAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;
const BUBBLE_POP_ANIMATION_MS = 320;
const BUBBLE_EARLY_COMPLETE_CONFIRM_MS = 1000;
const DEFAULT_MICRO_HABIT_TITLE = "Weekly Micro Sessions";
const SHARED_COMPLETION_SOUND_PROFILE: AppSoundProfileName = "positiveDing";
const MICRO_SOUND_PREFERENCE_STORAGE_KEY = "freeswimming:micro-sessions:v1:sound";
const MICRO_SOUND_PREFERENCE_STORAGE_VERSION = 1;
const BUBBLE_TONE_CLASSES = [
  "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-900/10",
  "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-900/10",
  "border-rose-200 bg-rose-50 text-rose-950 shadow-rose-900/10",
  "border-sky-200 bg-sky-50 text-sky-950 shadow-sky-900/10",
  "border-violet-200 bg-violet-50 text-violet-950 shadow-violet-900/10",
  "border-cyan-200 bg-cyan-50 text-cyan-950 shadow-cyan-900/10",
  "border-orange-200 bg-orange-50 text-orange-950 shadow-orange-900/10",
  "border-indigo-200 bg-indigo-50 text-indigo-950 shadow-indigo-900/10",
  "border-teal-200 bg-teal-50 text-teal-950 shadow-teal-900/10",
  "border-lime-200 bg-lime-50 text-lime-950 shadow-lime-900/10",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950 shadow-fuchsia-900/10",
  "border-red-200 bg-red-50 text-red-950 shadow-red-900/10",
] as const;
const BUBBLE_OFFSETS_PX = [0, 14, 5, 20, 9, 16] as const;

const MICRO_ACTION_FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const MICRO_ACTION_DISABLED_CLASS = "disabled:cursor-not-allowed disabled:opacity-60";
const MICRO_PRIMARY_ACTION_CLASS = cx(
  "fs-cta-primary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_SECONDARY_ACTION_CLASS = cx(
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_UNIT_COMPLETE_ACTION_CLASS = cx(
  "fs-cta-secondary inline-flex min-h-10 w-full min-w-0 items-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_COMPACT_SECONDARY_ACTION_CLASS = cx(
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center gap-1.5 px-3 text-xs font-semibold transition-colors hover:bg-white sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_COMPACT_DANGER_ACTION_CLASS = cx(
  MICRO_COMPACT_SECONDARY_ACTION_CLASS,
  "border-rose-200 text-rose-700 hover:bg-rose-50"
);
const MICRO_ICON_ACTION_CLASS = cx(
  "fs-cta-secondary inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 transition-colors hover:bg-white",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_DANGER_ACTION_CLASS = cx(
  MICRO_SECONDARY_ACTION_CLASS,
  "border-rose-200 text-rose-700 hover:bg-rose-50"
);
const MICRO_WARNING_ACTION_CLASS = cx(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-50",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_WARNING_PRIMARY_ACTION_CLASS = cx(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-amber-300 bg-amber-100 px-4 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-200",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_COMPLETED_ACTION_CLASS = cx(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-emerald-300 bg-emerald-100 px-4 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-200",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_STATUS_ACTION_CLASS = cx(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50",
  MICRO_ACTION_FOCUS_CLASS,
  MICRO_ACTION_DISABLED_CLASS
);
const MICRO_SEGMENT_CLASS =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border px-3 text-sm font-semibold transition-colors";
const MICRO_SEGMENT_ACTIVE_CLASS =
  "border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)]";
const MICRO_SEGMENT_IDLE_CLASS =
  "border-transparent text-slate-600 hover:bg-white hover:text-[color:var(--fs-color-brand-700)]";

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "This week";
  return parsed.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getPlanStatusLabel(plan: DrylandMicroPlanRecord) {
  if (plan.status === "completed") return "Week complete";
  if (plan.status === "paused") return "Paused";
  return "Active this week";
}

function getHabitLinkTitle(link: DrylandMicroHabitLinkRecord | null) {
  return link?.habitTitle?.trim() || DEFAULT_MICRO_HABIT_TITLE;
}

function getHabitLinkStatusCopy(link: DrylandMicroHabitLinkRecord | null) {
  if (!link) return null;
  const title = getHabitLinkTitle(link);

  if (link.habitDefinitionSupport === "unsupported") {
    return {
      title: "Linked Habit needs review",
      body: "This Micro Session still works, but the weekly program cannot count toward this Habit until its setup is supported.",
      chip: `Needs review: ${title}`,
    };
  }

  if (link.status === "paused") {
    return {
      title: "Habit counting paused",
      body: "Micro Sessions still work. Resume counting when this weekly program should count again.",
      chip: `Paused: ${title}`,
    };
  }

  if (!link.canCount) {
    return {
      title: "Linked Habit unavailable",
      body: "This Micro Session still works, but the weekly program cannot complete this Habit right now.",
      chip: `Not counting: ${title}`,
    };
  }

  return {
    title,
    body: "Auto-completes the Habit when every unit in this week's Micro Session is done.",
    chip: "Linked Habit",
  };
}

function getDefaultReleaseDayAssignments(
  sessionIds: string[],
  existing: Record<string, number> = {}
) {
  const defaults =
    sessionIds.length <= 1
      ? [0]
      : sessionIds.length === 2
        ? [0, 3]
        : sessionIds.length === 3
          ? [0, 2, 4]
          : sessionIds.length === 4
            ? [0, 1, 3, 5]
            : sessionIds.map((_, index) =>
                Math.min(6, Math.round((index * 6) / Math.max(1, sessionIds.length - 1)))
              );

  return sessionIds.reduce<Record<string, number>>((next, sessionId, index) => {
    next[sessionId] = existing[sessionId] ?? defaults[index] ?? 0;
    return next;
  }, {});
}

function buildInitialSelectedSessionIds(plan: DrylandMicroPlanRecord | null) {
  return (
    plan?.sourceSessionSnapshots
      .map((source) => source.sourceDrylandSessionId)
      .filter((sourceId): sourceId is string => Boolean(sourceId)) ?? []
  );
}

function buildInitialReleaseDayAssignments(plan: DrylandMicroPlanRecord | null) {
  return (
    plan?.sourceSessionSnapshots.reduce<Record<string, number>>((assignments, source) => {
      if (source.sourceDrylandSessionId && source.releaseOffsetDays !== null) {
        assignments[source.sourceDrylandSessionId] = source.releaseOffsetDays;
      }
      return assignments;
    }, {}) ?? {}
  );
}

function buildArchivedRepeatPlan(plan: DrylandMicroPlanRecord): ArchivedRepeatPlan | null {
  const sourceIds = buildInitialSelectedSessionIds(plan);
  if (sourceIds.length === 0) return null;
  return {
    sourceIds,
    releaseDayAssignments: buildInitialReleaseDayAssignments(plan),
    title: plan.title,
  };
}

function getPreferredClientExecutionMode(preferMobileBubbles: boolean): ExecutionMode {
  if (
    preferMobileBubbles &&
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  ) {
    return "bubbles";
  }

  return "ordered";
}

function buildDefaultTitle(sessionIds: string[], sessions: DrylandSessionSummary[]) {
  if (sessionIds.length === 1) {
    const session = sessions.find((candidate) => candidate.id === sessionIds[0]);
    return `MS: ${session?.title ?? "Dryland"}`.slice(0, 120);
  }
  return sessionIds.length > 1 ? `MS: ${sessionIds.length} sessions` : "MS: Dryland";
}

function sortUnitsByRelease(first: UnitView, second: UnitView) {
  const firstTime = first.releaseDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const secondTime = second.releaseDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (firstTime !== secondTime) return firstTime - secondTime;
  return first.index - second.index;
}

function groupUnitsByExercise(units: UnitView[]) {
  const groups = new Map<string, UnitView[]>();
  for (const unit of units) {
    const key = [
      unit.block.sourceDrylandSessionId ?? unit.block.sourceSessionIndex,
      unit.block.sourceExerciseId,
      unit.block.title,
    ].join(":");
    groups.set(key, [...(groups.get(key) ?? []), unit]);
  }
  return Array.from(groups.values());
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readMicroSoundPreference() {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(MICRO_SOUND_PREFERENCE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version?: unknown; enabled?: unknown } | null;
    return (
      !!parsed &&
      parsed.version === MICRO_SOUND_PREFERENCE_STORAGE_VERSION &&
      parsed.enabled === true
    );
  } catch {
    return false;
  }
}

function writeMicroSoundPreference(enabled: boolean) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      MICRO_SOUND_PREFERENCE_STORAGE_KEY,
      JSON.stringify({
        version: MICRO_SOUND_PREFERENCE_STORAGE_VERSION,
        enabled,
      })
    );
    return true;
  } catch {
    return false;
  }
}

function hashBubbleSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBubbleExerciseKey(block: DrylandMicroBlockSnapshot) {
  return block.title.trim().toLowerCase() || block.sourceExerciseId || block.id;
}

function buildBubbleToneClassByExerciseKey(units: UnitView[]) {
  const toneByExerciseKey = new Map<string, (typeof BUBBLE_TONE_CLASSES)[number]>();
  let nextToneIndex = 0;

  for (const unit of units) {
    const exerciseKey = getBubbleExerciseKey(unit.block);
    if (toneByExerciseKey.has(exerciseKey)) continue;

    const toneIndex = nextToneIndex % BUBBLE_TONE_CLASSES.length;
    toneByExerciseKey.set(exerciseKey, BUBBLE_TONE_CLASSES[toneIndex] ?? BUBBLE_TONE_CLASSES[0]);
    nextToneIndex += 1;
  }

  return toneByExerciseKey;
}

function getBubbleToneClasses(
  unit: UnitView,
  toneByExerciseKey: Map<string, (typeof BUBBLE_TONE_CLASSES)[number]>
) {
  const exerciseKey = getBubbleExerciseKey(unit.block);
  return toneByExerciseKey.get(exerciseKey) ?? BUBBLE_TONE_CLASSES[0];
}

function getBubbleTargetLabel(block: DrylandMicroBlockSnapshot) {
  if (block.targetType === "reps" && block.targetValue !== null) {
    return `${block.targetValue} reps`;
  }

  if (block.targetType === "duration" && block.targetValue !== null) {
    return block.targetLabel.split("·")[0]?.trim() || `${block.targetValue} sec`;
  }

  return block.targetLabel.split("·")[0]?.trim() || block.targetLabel;
}

function formatLoadKg(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

function getMicroActionTargetLabel(block: DrylandMicroBlockSnapshot) {
  const parts = [getBubbleTargetLabel(block)];
  if (block.loadKg !== null) {
    parts.push(`${formatLoadKg(block.loadKg)}\u00a0kg`);
  }
  return parts.filter(Boolean).join(" · ");
}

function getCompleteNextLabel(block: DrylandMicroBlockSnapshot) {
  const parts = [`Set ${block.setIndex + 1}`, ...getMicroActionTargetLabel(block).split(" · ")];
  return `Complete next: ${parts.filter(Boolean).join(" - ")}`;
}

function getBubbleDurationSeconds(block: DrylandMicroBlockSnapshot) {
  if (block.targetType !== "duration" || block.targetValue === null || block.targetValue <= 0) {
    return null;
  }
  return block.targetValue;
}

function formatBubbleCountdown(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getBubbleRemainingSeconds(timer: BubbleTimerState, nowMs: number) {
  if (timer.startedAtMs === null) return timer.remainingSeconds;
  const elapsedSeconds = Math.floor((nowMs - timer.startedAtMs) / 1000);
  return Math.max(0, timer.remainingSeconds - Math.max(0, elapsedSeconds));
}

function formatSetCountLabel(count: number) {
  return `${count} set${count === 1 ? "" : "s"}`;
}

function getUnitSummaryParts(units: UnitView[]) {
  const firstUnit = units[0];
  if (!firstUnit) return [];

  const parts = [formatSetCountLabel(units.length)];
  const targetLabel = getBubbleTargetLabel(firstUnit.block);
  if (targetLabel) {
    parts.push(targetLabel);
  }

  const restLabel = formatSecondsLabel(firstUnit.block.restSeconds);
  if (restLabel) {
    parts.push(`Rest ${restLabel}`);
  }

  return parts;
}

function buildHistorySeriesLabel(units: UnitView[]) {
  const firstUnit = units[0];
  if (!firstUnit) return "";

  if (firstUnit.block.targetType === "reps") {
    const repsValues = units.map((unit) =>
      typeof unit.block.targetValue === "number"
        ? String(unit.block.targetValue)
        : getBubbleTargetLabel(unit.block)
    );
    return `Reps: ${repsValues.join(" + ")}`;
  }

  if (firstUnit.block.targetType === "duration") {
    const numericValues = units
      .map((unit) => unit.block.targetValue)
      .filter((value): value is number => typeof value === "number");
    if (numericValues.length === units.length) {
      return `Time: ${numericValues.join(" + ")} sec`;
    }

    const timeValues = units.map((unit) =>
      typeof unit.block.targetValue === "number"
        ? (formatSecondsLabel(unit.block.targetValue) ?? `${unit.block.targetValue} sec`)
        : getBubbleTargetLabel(unit.block)
    );
    return `Time: ${timeValues.join(" + ")}`;
  }

  return `Targets: ${units.map((unit) => getBubbleTargetLabel(unit.block)).join(" + ")}`;
}

function willCompleteWeeklyProgramAfterUpdate(
  plan: DrylandMicroPlanRecord,
  blockId: string,
  blockStatus: DrylandMicroBlockStatus
) {
  const activeBlocks = plan.blocks.filter((block) => !block.isArchived);
  return (
    activeBlocks.length > 0 &&
    activeBlocks.every((block) =>
      block.id === blockId ? blockStatus === "completed" : block.status === "completed"
    )
  );
}

function groupHistoryUnits(units: UnitView[]) {
  const groups = new Map<string, HistoryUnitGroup>();

  for (const unit of units) {
    if (unit.block.status === "queued") continue;

    const key = [
      unit.block.status,
      unit.block.sourceDrylandSessionId ?? unit.block.sourceSessionIndex,
      unit.block.sourceExerciseId,
      unit.block.title.trim().toLowerCase(),
      unit.block.targetType,
    ].join(":");
    const existing = groups.get(key);

    if (existing) {
      existing.units.push(unit);
      existing.sortIndex = Math.min(existing.sortIndex, unit.index);
      existing.isArchived = existing.isArchived || unit.block.isArchived;
      existing.seriesLabel = buildHistorySeriesLabel(existing.units);
      continue;
    }

    groups.set(key, {
      key,
      status: unit.block.status,
      title: unit.block.title,
      units: [unit],
      sortIndex: unit.index,
      isArchived: unit.block.isArchived,
      seriesLabel: buildHistorySeriesLabel([unit]),
    });
  }

  const statusOrder: Record<HistoryUnitGroup["status"], number> = {
    completed: 0,
    skipped: 1,
  };

  return Array.from(groups.values()).sort((first, second) => {
    const statusDelta = statusOrder[first.status] - statusOrder[second.status];
    if (statusDelta !== 0) return statusDelta;
    const titleDelta = first.title.localeCompare(second.title, "en", { sensitivity: "base" });
    if (titleDelta !== 0) return titleDelta;
    return first.sortIndex - second.sortIndex;
  });
}

function getBubbleVisualStyle(unit: UnitView, isActiveTimer = false): CSSProperties {
  const seed = hashBubbleSeed(getBubbleExerciseKey(unit.block));
  const targetLabel = getBubbleTargetLabel(unit.block);
  const contentWeight = unit.block.title.length + Math.round(targetLabel.length * 0.55);
  const baseSize = Math.min(7.5, Math.max(5.75, 5.25 + contentWeight * 0.07));
  const size = isActiveTimer ? Math.min(8.25, baseSize + 0.75) : baseSize;
  const rawOffset =
    BUBBLE_OFFSETS_PX[(unit.index + unit.block.setIndex) % BUBBLE_OFFSETS_PX.length] ??
    BUBBLE_OFFSETS_PX[0];
  const offset = Math.round(rawOffset * 0.35);
  const rotation = ((seed + unit.index) % 7) - 3;

  return {
    width: `${size}rem`,
    height: `${size}rem`,
    marginTop: `${offset}px`,
    animationDelay: `${-1 * ((seed + unit.index) % 6) * 0.45}s`,
    "--bubble-rotate": `${rotation}deg`,
    "--bubble-rotate-inverse": `${rotation * -1}deg`,
  } as CSSProperties;
}

export default function DrylandMicroPlanPanel({
  initialPlan,
  sessions,
  schemaReady,
  loadError,
  initialEditorOpen = false,
  preferMobileBubbles = false,
  onSourceSelectionChange,
  onPlanChange,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>(
    buildInitialSelectedSessionIds(initialPlan)
  );
  const [releaseMode, setReleaseMode] = useState<DrylandMicroReleaseMode>(
    initialPlan?.releaseMode ?? "available_now"
  );
  const [releaseTime, setReleaseTime] = useState(initialPlan?.releaseTime ?? "06:00");
  const [releaseDayAssignments, setReleaseDayAssignments] = useState<Record<string, number>>(
    buildInitialReleaseDayAssignments(initialPlan)
  );
  const [planTitle, setPlanTitle] = useState(initialPlan?.title ?? "");
  const [isCreating, setIsCreating] = useState(!initialPlan && initialEditorOpen);
  const [isEditing, setIsEditing] = useState(Boolean(initialPlan && initialEditorOpen));
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [isPlanStatusSaving, setIsPlanStatusSaving] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isClearingPlan, setIsClearingPlan] = useState(false);
  const [isHabitLinkFormOpen, setIsHabitLinkFormOpen] = useState(false);
  const [isHabitLinkSaving, setIsHabitLinkSaving] = useState(false);
  const [habitLinkTitle, setHabitLinkTitle] = useState(DEFAULT_MICRO_HABIT_TITLE);
  const [habitStartDate, setHabitStartDate] = useState(getLocalDateKey());
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("ordered");
  const [armedBubbleId, setArmedBubbleId] = useState<string | null>(null);
  const [bubbleTimer, setBubbleTimer] = useState<BubbleTimerState | null>(null);
  const [bubbleNowMs, setBubbleNowMs] = useState(() => Date.now());
  const [poppingBubbleId, setPoppingBubbleId] = useState<string | null>(null);
  const [completedUndoStack, setCompletedUndoStack] = useState<CompletedUndoItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundNotice, setSoundNotice] = useState<string | null>(null);
  const [isRouteRefreshing, setIsRouteRefreshing] = useState(false);
  const [archivedRepeatPlan, setArchivedRepeatPlan] = useState<ArchivedRepeatPlan | null>(null);
  const [pendingPausedCompletion, setPendingPausedCompletion] =
    useState<PendingPausedCompletion | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const progressLabelId = useId();
  const updateBlockRef = useRef<UpdateBlockFn | null>(null);
  const autoArchivedPlanIdRef = useRef<string | null>(null);
  const autoRenewedPlanIdRef = useRef<string | null>(null);

  useEffect(() => {
    setPlan(initialPlan);
    setSelectedSessionIds(buildInitialSelectedSessionIds(initialPlan));
    setReleaseMode(initialPlan?.releaseMode ?? "available_now");
    setReleaseTime(initialPlan?.releaseTime ?? "06:00");
    setReleaseDayAssignments(buildInitialReleaseDayAssignments(initialPlan));
    setPlanTitle(initialPlan?.title ?? "");
    setIsCreating(!initialPlan && initialEditorOpen);
    setIsEditing(Boolean(initialPlan && initialEditorOpen));
    setError("");
    setSuccess("");
    setPendingBlockId(null);
    setIsPlanStatusSaving(false);
    setIsSavingPlan(false);
    setIsClearingPlan(false);
    setIsHabitLinkFormOpen(false);
    setIsHabitLinkSaving(false);
    setHabitLinkTitle(DEFAULT_MICRO_HABIT_TITLE);
    setHabitStartDate(getLocalDateKey());
    setIsClearConfirmOpen(false);
    setExecutionMode("ordered");
    setArmedBubbleId(null);
    setBubbleTimer(null);
    setBubbleNowMs(Date.now());
    setPoppingBubbleId(null);
    setCompletedUndoStack([]);
    setSoundNotice(null);
    setArchivedRepeatPlan(null);
    setPendingPausedCompletion(null);
  }, [initialEditorOpen, initialPlan]);

  useEffect(() => {
    setSoundEnabled(readMicroSoundPreference());
  }, []);

  useEffect(() => {
    setExecutionMode(getPreferredClientExecutionMode(preferMobileBubbles));
  }, [initialPlan, preferMobileBubbles]);

  useEffect(() => {
    if (bubbleTimer?.startedAtMs === null || !bubbleTimer) return;

    const interval = window.setInterval(() => setBubbleNowMs(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [bubbleTimer]);

  useEffect(() => {
    if (!bubbleTimer?.isConfirmingDone) return;

    const timeout = window.setTimeout(() => {
      const now = Date.now();
      setBubbleTimer((current) => {
        if (!current?.isConfirmingDone || current.blockId !== bubbleTimer.blockId) return current;
        return {
          ...current,
          startedAtMs: now,
          isConfirmingDone: false,
        };
      });
      setBubbleNowMs(now);
    }, BUBBLE_EARLY_COMPLETE_CONFIRM_MS);

    return () => window.clearTimeout(timeout);
  }, [bubbleTimer]);

  useEffect(() => {
    if (!bubbleTimer || bubbleTimer.startedAtMs === null) return;
    if (pendingBlockId === bubbleTimer.blockId) return;
    const remainingSeconds = getBubbleRemainingSeconds(bubbleTimer, bubbleNowMs);
    if (remainingSeconds > 0) return;

    const blockId = bubbleTimer.blockId;
    setBubbleTimer((current) =>
      current?.blockId === blockId
        ? {
            ...current,
            remainingSeconds: 0,
            startedAtMs: null,
            isConfirmingDone: false,
          }
        : current
    );
    void updateBlockRef.current?.(blockId, "completed", { visualOrigin: "bubbles" });
  }, [bubbleNowMs, bubbleTimer, pendingBlockId]);

  useEffect(() => {
    onSourceSelectionChange?.(schemaReady && ((!plan && isCreating) || Boolean(plan && isEditing)));
  }, [isCreating, isEditing, onSourceSelectionChange, plan, schemaReady]);

  const unitViews = useMemo<UnitView[]>(() => {
    if (!plan) return [];
    const now = new Date();
    return plan.blocks.map((block, index) => ({
      block,
      index,
      releaseDate: getDrylandMicroBlockReleaseDate(plan, block),
      isAvailable: isDrylandMicroBlockAvailable(plan, block, now),
    }));
  }, [plan]);

  const { availableUnits, upcomingUnits, historyUnitGroups, historyUnitCount, visibleUnitCount } =
    useMemo(() => {
      const available = unitViews
        .filter(
          (unit) => unit.block.status === "queued" && unit.isAvailable && !unit.block.isArchived
        )
        .sort(sortUnitsByRelease);
      const upcoming = unitViews
        .filter(
          (unit) => unit.block.status === "queued" && !unit.isAvailable && !unit.block.isArchived
        )
        .sort(sortUnitsByRelease);
      const history = unitViews
        .filter((unit) => unit.block.status !== "queued")
        .sort((first, second) => first.index - second.index);

      return {
        availableUnits: available,
        upcomingUnits: upcoming,
        historyUnitGroups: groupHistoryUnits(history),
        historyUnitCount: history.length,
        visibleUnitCount: unitViews.filter((unit) => !unit.block.isArchived).length,
      };
    }, [unitViews]);
  const sessionIds = useMemo(() => new Set(sessions.map((session) => session.id)), [sessions]);
  const sourceSessionIds =
    plan?.sourceSessionSnapshots
      .map((source) => source.sourceDrylandSessionId)
      .filter((sourceId): sourceId is string => Boolean(sourceId)) ?? [];
  const hasMissingSourceSessions =
    sourceSessionIds.length > 0 && sourceSessionIds.every((sourceId) => !sessionIds.has(sourceId));
  const weekEndsAtTime = plan ? Date.parse(plan.weekEndsAt) : Number.NaN;
  const isPastWeek = Number.isFinite(weekEndsAtTime) && weekEndsAtTime <= Date.now();
  const isCompletePlan =
    Boolean(plan) &&
    (plan?.status === "completed" ||
      (visibleUnitCount > 0 && plan?.progress.remainingBlockCount === 0));
  const isBlockedPlan = plan?.status === "paused";
  const isEmptyPlan = Boolean(plan) && visibleUnitCount === 0;
  const shouldCollapsePlan =
    Boolean(plan) &&
    !isEditing &&
    (isCompletePlan ||
      isEmptyPlan ||
      isPastWeek ||
      hasMissingSourceSessions ||
      isBlockedPlan ||
      (availableUnits.length === 0 && upcomingUnits.length > 0));
  const isBubbleFocus = preferMobileBubbles && executionMode === "bubbles" && !isEditing;
  const undoableCompletedUnits = completedUndoStack.filter(
    (item) =>
      plan?.blocks.some(
        (block) => block.id === item.blockId && block.status === "completed" && !block.isArchived
      ) === true
  );
  const latestUndoableCompletedUnit =
    undoableCompletedUnits.length > 0
      ? (undoableCompletedUnits[undoableCompletedUnits.length - 1] ?? null)
      : null;
  const habitLink = plan?.habitLink ?? null;
  const habitLinkCopy = getHabitLinkStatusCopy(habitLink);
  const canCreateHabitLink =
    Boolean(plan) &&
    !habitLink &&
    !isEditing &&
    !isPastWeek &&
    !isEmptyPlan &&
    !hasMissingSourceSessions;
  const bubbleToneByExerciseKey = buildBubbleToneClassByExerciseKey(
    unitViews
      .filter((unit) => !unit.block.isArchived)
      .sort((first, second) => first.index - second.index)
  );

  function retryRouteRefresh() {
    setIsRouteRefreshing(true);
    if (typeof window !== "undefined" && window.navigator && !window.navigator.onLine) {
      window.location.reload();
      return;
    }

    router.refresh();
    window.setTimeout(() => setIsRouteRefreshing(false), 1200);
  }

  function toggleSelectedSession(sessionId: string) {
    setSelectedSessionIds((current) => {
      const next = current.includes(sessionId)
        ? current.filter((candidate) => candidate !== sessionId)
        : [...current, sessionId];
      setReleaseDayAssignments((assignments) =>
        getDefaultReleaseDayAssignments(next, plan ? assignments : {})
      );
      if (!plan && !planTitle.trim()) {
        setPlanTitle(buildDefaultTitle(next, sessions));
      }
      return next;
    });
  }

  const applyPlanState = useCallback(
    (nextPlan: DrylandMicroPlanRecord) => {
      setPlan(nextPlan);
      onPlanChange?.(nextPlan);
      setPlanTitle(nextPlan.title);
      setSelectedSessionIds(buildInitialSelectedSessionIds(nextPlan));
      setReleaseDayAssignments(buildInitialReleaseDayAssignments(nextPlan));
      setReleaseMode(nextPlan.releaseMode);
      setReleaseTime(nextPlan.releaseTime);
      if (nextPlan.habitLink) {
        setIsHabitLinkFormOpen(false);
      }
      setIsClearConfirmOpen(false);
      setArmedBubbleId((current) => {
        if (!current) return null;
        return nextPlan.blocks.some(
          (block) => block.id === current && block.status === "queued" && !block.isArchived
        )
          ? current
          : null;
      });
      setBubbleTimer((current) => {
        if (!current) return null;
        return nextPlan.blocks.some(
          (block) => block.id === current.blockId && block.status === "queued" && !block.isArchived
        )
          ? current
          : null;
      });
      setCompletedUndoStack((current) =>
        current.filter(
          (item) =>
            nextPlan.blocks.some(
              (block) =>
                block.id === item.blockId && block.status === "completed" && !block.isArchived
            ) === true
        )
      );
    },
    [onPlanChange]
  );

  function switchExecutionMode(mode: ExecutionMode) {
    setExecutionMode(mode);
    setError("");
    setSuccess("");
    setArmedBubbleId(null);
    setBubbleTimer(null);
  }

  async function playMicroSound(profileName: AppSoundProfileName) {
    const result: AppSoundPlaybackResult = await playAppSoundProfile(profileName);
    if (result === "played") {
      setSoundNotice(null);
      return;
    }

    setSoundNotice(
      result === "unsupported"
        ? "Sound is not available in this browser."
        : "Sound was blocked. Your micro session was still saved."
    );
  }

  function playEnabledMicroSound(profileName: AppSoundProfileName) {
    if (!soundEnabled) return;
    void playMicroSound(profileName);
  }

  function getCompletedBlockSoundProfile(): AppSoundProfileName {
    return SHARED_COMPLETION_SOUND_PROFILE;
  }

  function toggleMicroSoundPreference() {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    const didPersist = writeMicroSoundPreference(nextEnabled);
    if (!didPersist) {
      setSoundNotice("Sound preference cannot be saved in this browser.");
      return;
    }

    if (nextEnabled) {
      void playMicroSound(SHARED_COMPLETION_SOUND_PROFILE);
      return;
    }

    setSoundNotice(null);
  }

  async function createPlan(config: Partial<ArchivedRepeatPlan> = {}) {
    const sourceIds = config.sourceIds ?? selectedSessionIds;
    const nextTitle = config.title ?? (planTitle.trim() || buildDefaultTitle(sourceIds, sessions));
    const nextReleaseDayAssignments =
      config.releaseDayAssignments ??
      getDefaultReleaseDayAssignments(sourceIds, releaseDayAssignments);

    if (sourceIds.length === 0) {
      setError("Select at least one saved Dryland Session.");
      return;
    }

    setIsSavingPlan(true);
    setError("");
    setSuccess("");

    try {
      const timezone = getBrowserLocalDayTimezone();
      const response = await fetch("/api/my-library/dryland/micro-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceDrylandSessionIds: sourceIds,
          title: nextTitle,
          releaseMode,
          releaseTime,
          sourceReleaseOffsetDays: nextReleaseDayAssignments,
          timezone,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandMicroPlanApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Could not create a micro session right now."
        );
        return;
      }

      applyPlanState(responseBody.plan);
      setArchivedRepeatPlan(null);
      setSuccess(
        responseBody.reusedExisting
          ? "You already have an active micro session. Continue that one first."
          : "Micro session created."
      );
    } catch {
      setError("Could not create a micro session right now.");
    } finally {
      setIsSavingPlan(false);
    }
  }

  const patchPlan = useCallback(
    async (body: Record<string, unknown>, options: PatchPlanOptions = {}) => {
      if (!plan) return null;
      const timezone = getBrowserLocalDayTimezone();
      const requestBody = {
        selectedDate: getLocalDateKey(),
        timezone,
        ...body,
      };

      const response = await fetch(`/api/my-library/dryland/micro-plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandMicroPlanApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        throw new Error(
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Could not update micro session right now."
        );
      }

      if (options.applyResponse !== false) {
        applyPlanState(responseBody.plan);
      }
      return responseBody;
    },
    [applyPlanState, plan]
  );

  async function savePlanEdit() {
    if (selectedSessionIds.length === 0) {
      setError("Select at least one saved Dryland Session.");
      return;
    }

    if (releaseMode === "manual") {
      setError("Choose Available now or Weekday release before saving this micro session.");
      return;
    }

    setIsSavingPlan(true);
    setError("");
    setSuccess("");

    try {
      await patchPlan({
        title: planTitle.trim() || buildDefaultTitle(selectedSessionIds, sessions),
        sourceDrylandSessionIds: selectedSessionIds,
        releaseMode,
        releaseTime,
        sourceReleaseOffsetDays: releaseDayAssignments,
      });
      setIsEditing(false);
      setSuccess("Micro session updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not update micro session."
      );
    } finally {
      setIsSavingPlan(false);
    }
  }

  async function updateBlock(
    blockId: string,
    blockStatus: DrylandMicroBlockStatus,
    options: UpdateBlockOptions = {}
  ) {
    const targetBlock = plan?.blocks.find((block) => block.id === blockId) ?? null;
    const completionSoundProfile = getCompletedBlockSoundProfile();
    if (
      plan &&
      habitLink?.status === "paused" &&
      habitLink.habitDefinitionSupport === "supported" &&
      blockStatus === "completed" &&
      !options.skipPausedHabitPrompt &&
      plan.progress.remainingBlockCount > 0 &&
      willCompleteWeeklyProgramAfterUpdate(plan, blockId, blockStatus)
    ) {
      setPendingPausedCompletion({
        blockId,
        title: targetBlock?.title ?? "Micro unit",
        visualOrigin: options.visualOrigin ?? "ordered",
      });
      setError("");
      setSuccess("");
      return;
    }

    setPendingBlockId(blockId);
    setError("");
    setSuccess("");

    try {
      const shouldPopBubble = options.visualOrigin === "bubbles" && blockStatus === "completed";
      const patchResponse = await patchPlan(
        {
          blockId,
          blockStatus,
          ...(options.completePausedHabitLink ? { completePausedHabitLink: true } : {}),
        },
        { applyResponse: !shouldPopBubble }
      );
      const nextPlan = patchResponse?.plan ?? null;
      const habitCredit = patchResponse?.habitCredit ?? null;

      if (shouldPopBubble && nextPlan) {
        setPoppingBubbleId(blockId);
        setArmedBubbleId(null);
        await wait(BUBBLE_POP_ANIMATION_MS);
        applyPlanState(nextPlan);
        setCompletedUndoStack((current) => [
          ...current.filter((item) => item.blockId !== blockId),
          targetBlock ? { blockId, title: targetBlock.title } : { blockId, title: "Micro unit" },
        ]);
        setPoppingBubbleId(null);
        setSuccess(
          habitCredit?.message ??
            (nextPlan.status === "completed" ? "All micro units are complete for this week." : "")
        );
        playEnabledMicroSound(completionSoundProfile);
        return;
      }

      if (blockStatus === "completed") {
        setCompletedUndoStack((current) => [
          ...current.filter((item) => item.blockId !== blockId),
          targetBlock ? { blockId, title: targetBlock.title } : { blockId, title: "Micro unit" },
        ]);
      } else {
        setCompletedUndoStack((current) => current.filter((item) => item.blockId !== blockId));
      }
      setSuccess(
        habitCredit?.message ??
          (nextPlan?.status === "completed"
            ? "All micro units are complete for this week."
            : blockStatus === "queued"
              ? "Micro unit restored."
              : "Micro unit updated.")
      );
      if (blockStatus === "completed") {
        playEnabledMicroSound(completionSoundProfile);
      }
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not update micro session."
      );
      setPoppingBubbleId(null);
    } finally {
      setPendingBlockId(null);
    }
  }

  updateBlockRef.current = updateBlock;

  function completePendingPausedUnit(completeHabit: boolean) {
    if (!pendingPausedCompletion) return;
    const nextCompletion = pendingPausedCompletion;
    setPendingPausedCompletion(null);
    void updateBlock(nextCompletion.blockId, "completed", {
      visualOrigin: nextCompletion.visualOrigin,
      skipPausedHabitPrompt: true,
      completePausedHabitLink: completeHabit,
    });
  }

  function handleBubbleClick(unit: UnitView) {
    setError("");
    setSuccess("");

    if (plan?.status === "paused" || pendingBlockId === unit.block.id || !unit.isAvailable) {
      return;
    }

    const durationSeconds = getBubbleDurationSeconds(unit.block);
    if (durationSeconds !== null) {
      const isActiveTimer = bubbleTimer?.blockId === unit.block.id;
      const remainingSeconds = isActiveTimer
        ? getBubbleRemainingSeconds(bubbleTimer, bubbleNowMs)
        : durationSeconds;

      if (!isActiveTimer) {
        setArmedBubbleId(unit.block.id);
        setBubbleTimer({
          blockId: unit.block.id,
          durationSeconds,
          remainingSeconds: durationSeconds,
          startedAtMs: null,
          isConfirmingDone: false,
        });
        setBubbleNowMs(Date.now());
        return;
      }

      if (bubbleTimer.isConfirmingDone || remainingSeconds <= 0) {
        void updateBlock(unit.block.id, "completed", { visualOrigin: "bubbles" });
        return;
      }

      if (bubbleTimer.startedAtMs === null) {
        const now = Date.now();
        setBubbleTimer({
          ...bubbleTimer,
          remainingSeconds,
          startedAtMs: now,
          isConfirmingDone: false,
        });
        setBubbleNowMs(now);
        return;
      }

      setBubbleTimer({
        ...bubbleTimer,
        remainingSeconds,
        startedAtMs: null,
        isConfirmingDone: true,
      });
      return;
    }

    setBubbleTimer(null);
    if (armedBubbleId === unit.block.id) {
      void updateBlock(unit.block.id, "completed", { visualOrigin: "bubbles" });
      return;
    }

    setArmedBubbleId(unit.block.id);
  }

  function handleBubbleKeyDown(event: KeyboardEvent<HTMLButtonElement>, unit: UnitView) {
    if (event.key === "Escape") {
      if (armedBubbleId === unit.block.id) {
        event.preventDefault();
        const durationSeconds = getBubbleDurationSeconds(unit.block);
        if (durationSeconds !== null && bubbleTimer?.blockId === unit.block.id) {
          if (bubbleTimer.isConfirmingDone) {
            setBubbleTimer({
              ...bubbleTimer,
              startedAtMs: Date.now(),
              isConfirmingDone: false,
            });
            setBubbleNowMs(Date.now());
            return;
          }
          setBubbleTimer(null);
        }
        setArmedBubbleId(null);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBubbleClick(unit);
    }
  }

  function undoLatestCompletedUnit() {
    if (!latestUndoableCompletedUnit) return;
    void updateBlock(latestUndoableCompletedUnit.blockId, "queued");
  }

  async function releaseBlockNow(blockId: string) {
    setPendingBlockId(blockId);
    setError("");
    setSuccess("");

    try {
      await patchPlan({ blockId, releaseNow: true });
      setSuccess("Micro unit released for today.");
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not release micro unit."
      );
    } finally {
      setPendingBlockId(null);
    }
  }

  async function updatePlanStatus(planStatus: "active" | "paused") {
    setIsPlanStatusSaving(true);
    setError("");
    setSuccess("");

    try {
      await patchPlan({ planStatus });
      setSuccess(planStatus === "paused" ? "Micro session paused." : "Micro session resumed.");
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not update micro session."
      );
    } finally {
      setIsPlanStatusSaving(false);
    }
  }

  async function createHabitLink() {
    if (!plan) return;
    const title = habitLinkTitle.trim() || DEFAULT_MICRO_HABIT_TITLE;

    setIsHabitLinkSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await patchPlan({
        createRecurringHabit: true,
        habitTitle: title,
        habitStartDate,
      });
      setSuccess(response?.habitCredit?.message ?? "Recurring Habit linked.");
      setIsHabitLinkFormOpen(false);
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not link recurring Habit."
      );
    } finally {
      setIsHabitLinkSaving(false);
    }
  }

  const updateHabitLinkStatus = useCallback(
    async (status: "active" | "paused") => {
      setIsHabitLinkSaving(true);
      setError("");
      setSuccess("");

      try {
        const response = await patchPlan({ habitLinkStatus: status });
        const planChanged = response?.plan.id !== plan?.id;
        setSuccess(
          status === "paused"
            ? "Habit counting paused."
            : planChanged
              ? "This week's Micro Session is ready."
              : "Habit counting resumed."
        );
        router.refresh();
      } catch (updateError) {
        setError(
          updateError instanceof Error ? updateError.message : "Could not update linked Habit."
        );
      } finally {
        setIsHabitLinkSaving(false);
      }
    },
    [patchPlan, plan?.id, router]
  );

  const archiveStaleManualPlan = useCallback(async () => {
    if (!plan) return;
    const repeatPlan = buildArchivedRepeatPlan(plan);

    setIsClearingPlan(true);
    setError("");
    setSuccess("");
    setCompletedUndoStack([]);

    try {
      await patchPlan({ clearPlan: true }, { applyResponse: false });
      setPlan(null);
      onPlanChange?.(null);
      setPlanTitle(repeatPlan?.title ?? "");
      setSelectedSessionIds(repeatPlan?.sourceIds ?? []);
      setReleaseDayAssignments(repeatPlan?.releaseDayAssignments ?? {});
      setArchivedRepeatPlan(repeatPlan);
      setIsEditing(false);
      setIsCreating(false);
      setIsClearConfirmOpen(false);
      setArmedBubbleId(null);
      setBubbleTimer(null);
      setPoppingBubbleId(null);
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not archive last week's plan."
      );
    } finally {
      setIsClearingPlan(false);
    }
  }, [onPlanChange, patchPlan, plan]);

  useEffect(() => {
    if (!plan || !isPastWeek || isEditing || isCreating || isSavingPlan || isClearingPlan) return;
    if (habitLink || plan.status !== "active") return;
    if (autoArchivedPlanIdRef.current === plan.id) return;
    autoArchivedPlanIdRef.current = plan.id;
    void archiveStaleManualPlan();
  }, [
    archiveStaleManualPlan,
    habitLink,
    isClearingPlan,
    isCreating,
    isEditing,
    isPastWeek,
    isSavingPlan,
    plan,
  ]);

  useEffect(() => {
    if (!plan || !isPastWeek || isEditing || isSavingPlan || isHabitLinkSaving) return;
    if (habitLink?.status !== "active" || !habitLink.canCount) return;
    if (autoRenewedPlanIdRef.current === plan.id) return;
    autoRenewedPlanIdRef.current = plan.id;
    void updateHabitLinkStatus("active");
  }, [
    habitLink,
    isEditing,
    isHabitLinkSaving,
    isPastWeek,
    isSavingPlan,
    plan,
    updateHabitLinkStatus,
  ]);

  async function clearPlan() {
    if (!plan) return;

    setIsClearingPlan(true);
    setError("");
    setSuccess("");
    setCompletedUndoStack([]);

    try {
      await patchPlan({ clearPlan: true }, { applyResponse: false });
      setPlan(null);
      onPlanChange?.(null);
      setPlanTitle("");
      setSelectedSessionIds([]);
      setReleaseDayAssignments({});
      setArchivedRepeatPlan(null);
      setIsEditing(false);
      setIsCreating(false);
      setIsClearConfirmOpen(false);
      setArmedBubbleId(null);
      setBubbleTimer(null);
      setPoppingBubbleId(null);
      setSuccess("Micro session cleared.");
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not clear micro session."
      );
    } finally {
      setIsClearingPlan(false);
    }
  }

  function getCollapsedPlanCopy() {
    if (isPastWeek && habitLink?.status === "paused") {
      return {
        title: "Habit counting paused",
        body: "Resume counting to create this week's Micro Session. Missed weeks will not count.",
      };
    }
    if (isCompletePlan) {
      return {
        title: "Week complete",
        body: "This week's Micro Session is saved.",
      };
    }
    if (isPastWeek) {
      return {
        title: "Last week saved",
        body: "Repeat it this week or choose sessions for a fresh plan.",
      };
    }
    if (hasMissingSourceSessions) {
      return {
        title: "Source sessions are unavailable",
        body: "This Micro Session can no longer find its saved source sessions in the active library list. Clear it or edit the source selection.",
      };
    }
    if (isEmptyPlan) {
      return {
        title: "No units in this Micro Session",
        body: "Clear this empty plan, then create a new Micro Session from saved Dryland Sessions.",
      };
    }
    if (isBlockedPlan) {
      return {
        title: "Micro session paused",
        body: "Resume when you want the units back on the active surface.",
      };
    }
    return {
      title: "No units are ready today",
      body: "Keep the plan for its next release or move an upcoming unit to today.",
    };
  }

  function renderClearPlanControls(options: { compact?: boolean; fillRow?: boolean } = {}) {
    if (!plan) return null;
    const actionClass = options.compact
      ? cx(MICRO_COMPACT_DANGER_ACTION_CLASS, "min-w-0 flex-1")
      : cx(MICRO_DANGER_ACTION_CLASS, options.fillRow ? "min-w-0 flex-1 sm:flex-none" : "");

    if (!isClearConfirmOpen) {
      return (
        <button
          type="button"
          aria-label="Clear micro session"
          data-testid="dryland-micro-clear-open"
          onClick={() => {
            setIsClearConfirmOpen(true);
            setError("");
            setSuccess("");
          }}
          disabled={isClearingPlan || isSavingPlan}
          className={actionClass}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      );
    }

    return (
      <div
        data-testid="dryland-micro-clear-confirm"
        className="rounded-[var(--fs-radius-card)] border border-amber-200 bg-amber-50 p-3"
      >
        <p className="text-sm font-semibold text-amber-950">Clear this Micro Session?</p>
        <p className="mt-1 text-sm text-amber-900">Only the active micro session is cleared.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="dryland-micro-clear-confirm-action"
            onClick={() => void clearPlan()}
            disabled={isClearingPlan}
            className={MICRO_WARNING_PRIMARY_ACTION_CLASS}
          >
            {isClearingPlan ? "Clearing..." : "Clear micro session"}
          </button>
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(false)}
            disabled={isClearingPlan}
            className={MICRO_WARNING_ACTION_CLASS}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function renderSoundToggle() {
    return (
      <button
        type="button"
        data-testid="dryland-micro-sound-toggle"
        aria-pressed={soundEnabled}
        onClick={toggleMicroSoundPreference}
        title={soundEnabled ? "Sound on" : "Sound off"}
        className={MICRO_ICON_ACTION_CLASS}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">{soundEnabled ? "Sound on" : "Sound off"}</span>
      </button>
    );
  }

  function renderHabitLinkPanel() {
    if (!plan || isEditing) return null;
    if (pendingPausedCompletion) return null;

    if (habitLinkCopy && habitLink) {
      const needsHabitReview = habitLink.habitDefinitionSupport === "unsupported";
      return (
        <div
          data-testid="dryland-micro-habit-link-status"
          className={cx(
            "rounded-2xl border p-3 sm:p-4",
            needsHabitReview
              ? "border-amber-200 bg-amber-50/70"
              : "border-emerald-100 bg-emerald-50/60"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={cx(
                  "inline-flex min-h-7 items-center rounded-full border bg-white px-3 text-xs font-semibold",
                  needsHabitReview
                    ? "border-amber-300 text-amber-900"
                    : "border-emerald-200 text-emerald-800"
                )}
              >
                {habitLinkCopy.chip}
              </span>
              <h4 className="mt-2 text-base font-semibold text-slate-950">{habitLinkCopy.title}</h4>
              <p className="mt-1 max-w-[64ch] text-sm text-slate-700">{habitLinkCopy.body}</p>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {habitLink.habitDefinitionSupport === "supported" && habitLink.status === "paused" ? (
                <button
                  type="button"
                  data-testid="dryland-micro-resume-habit-link"
                  onClick={() => void updateHabitLinkStatus("active")}
                  disabled={isHabitLinkSaving}
                  className={cx(MICRO_STATUS_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {isHabitLinkSaving ? "Saving..." : "Resume counting"}
                </button>
              ) : habitLink.habitDefinitionSupport === "supported" && habitLink.canCount ? (
                <button
                  type="button"
                  data-testid="dryland-micro-pause-habit-link"
                  onClick={() => void updateHabitLinkStatus("paused")}
                  disabled={isHabitLinkSaving}
                  className={cx(MICRO_STATUS_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
                >
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  {isHabitLinkSaving ? "Saving..." : "Pause counting"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (!canCreateHabitLink) return null;

    if (!isHabitLinkFormOpen) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3 sm:p-4">
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-slate-950">Recurring Habit</h4>
            <p className="mt-1 text-sm text-slate-700">
              Complete this weekly Micro Session program as a repeatable Habit.
            </p>
          </div>
          <button
            type="button"
            data-testid="dryland-micro-open-habit-link"
            onClick={() => {
              setHabitLinkTitle(DEFAULT_MICRO_HABIT_TITLE);
              setHabitStartDate(getLocalDateKey());
              setIsHabitLinkFormOpen(true);
              setError("");
              setSuccess("");
            }}
            className={MICRO_PRIMARY_ACTION_CLASS}
          >
            <Repeat className="h-4 w-4" aria-hidden="true" />
            Make recurring habit
          </button>
        </div>
      );
    }

    return (
      <div
        data-testid="dryland-micro-habit-link-form"
        className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-3 sm:p-4"
      >
        <div>
          <h4 className="text-base font-semibold text-slate-950">New Weekly Habit</h4>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            <span>Habit name</span>
            <input
              type="text"
              value={habitLinkTitle}
              onChange={(event) => setHabitLinkTitle(event.target.value)}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            <span>Start date</span>
            <input
              type="date"
              value={habitStartDate}
              onChange={(event) => setHabitStartDate(event.target.value)}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            />
          </label>
        </div>
        <p className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-100">
          {"The Habit auto-completes when every unit in this week's Micro Session is done."}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => setIsHabitLinkFormOpen(false)}
            disabled={isHabitLinkSaving}
            className={cx(MICRO_SECONDARY_ACTION_CLASS, "min-w-0")}
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="dryland-micro-create-habit-link"
            onClick={() => void createHabitLink()}
            disabled={isHabitLinkSaving || habitLinkTitle.trim().length < 2}
            className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0")}
          >
            <Repeat className="h-4 w-4" aria-hidden="true" />
            {isHabitLinkSaving ? "Saving..." : "Create Habit"}
          </button>
        </div>
      </div>
    );
  }

  function renderPlanActionButtons(options: { compact?: boolean } = {}) {
    if (!plan || shouldCollapsePlan) return null;
    const secondaryClass = options.compact
      ? cx(MICRO_COMPACT_SECONDARY_ACTION_CLASS, "min-w-0 flex-1")
      : cx(MICRO_SECONDARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none");

    return (
      <>
        <button
          type="button"
          aria-label={isEditing ? "Close micro session edit" : "Edit micro session"}
          data-testid="dryland-micro-edit-plan"
          onClick={() => {
            setIsEditing((current) => !current);
            setError("");
            setSuccess("");
          }}
          className={secondaryClass}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {isEditing ? "Close" : "Edit"}
        </button>
        {plan.status === "paused" ? (
          <button
            type="button"
            data-testid="dryland-micro-resume-plan-status"
            onClick={() => void updatePlanStatus("active")}
            disabled={isPlanStatusSaving}
            className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
          >
            {isPlanStatusSaving ? "Saving..." : "Resume"}
          </button>
        ) : null}
        {renderClearPlanControls({ compact: options.compact, fillRow: true })}
      </>
    );
  }

  function renderReleaseControls() {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Release exercises</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {RELEASE_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setReleaseMode(mode.value)}
                className={cx(
                  "inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold transition-colors",
                  releaseMode === mode.value ? "fs-cta-primary" : "fs-cta-secondary hover:bg-white",
                  MICRO_ACTION_FOCUS_CLASS
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {releaseMode === "manual" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This micro session uses legacy manual release. Choose a supported pacing above before
            saving edits. Existing queued units can still be released from the upcoming list.
          </p>
        ) : null}

        {releaseMode === "weekday" ? (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <div className="grid gap-2">
              {selectedSessionIds.map((sessionId) => {
                const session = sessions.find((candidate) => candidate.id === sessionId);
                return (
                  <label key={sessionId} className="grid gap-1 text-sm font-medium text-slate-700">
                    <span>{session?.title ?? "Selected session"}</span>
                    <select
                      value={releaseDayAssignments[sessionId] ?? 0}
                      onChange={(event) =>
                        setReleaseDayAssignments((current) => ({
                          ...current,
                          [sessionId]: Number.parseInt(event.target.value, 10),
                        }))
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    >
                      {WEEKDAY_OPTIONS.map((day) => (
                        <option key={day} value={day}>
                          {getDrylandMicroWeekdayLabel(day)}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              <span>Time</span>
              <input
                type="time"
                value={releaseTime}
                onChange={(event) => setReleaseTime(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              />
            </label>
          </div>
        ) : null}
      </div>
    );
  }

  function renderSessionSelector() {
    const visibleSessions = sessions.slice(0, 8);

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Choose source sessions</p>
        </div>
        {sessions.length > 0 ? (
          <div className="grid gap-0 sm:gap-2 md:grid-cols-2">
            {visibleSessions.map((session, index) => {
              const isSelected = selectedSessionIds.includes(session.id);
              const isLastVisibleSession = index === visibleSessions.length - 1;
              const checkboxId = `dryland-micro-select-${session.id}`;
              return (
                <div
                  key={session.id}
                  className={`grid min-h-12 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-0 py-3 transition sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:rounded-xl sm:border sm:px-3 sm:py-2 ${
                    isSelected
                      ? "border-blue-300 bg-blue-50/70 sm:border-blue-500 sm:bg-blue-50"
                      : "border-slate-200 bg-transparent sm:bg-white sm:hover:bg-slate-50"
                  } ${isLastVisibleSession ? "border-b-0 sm:border-b" : "border-b"}`}
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    data-testid={`dryland-micro-select-${session.id}`}
                    checked={isSelected}
                    onChange={() => toggleSelectedSession(session.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <label
                    htmlFor={checkboxId}
                    className="min-w-0 cursor-pointer text-sm leading-snug font-semibold break-words text-slate-950"
                  >
                    {session.title}
                  </label>
                  <Link
                    href={`/my-library/dryland/${session.id}`}
                    className={cx(
                      MICRO_COMPACT_SECONDARY_ACTION_CLASS,
                      "col-start-2 w-fit sm:col-start-auto"
                    )}
                  >
                    Edit
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-3 sm:rounded-xl sm:border sm:bg-white sm:p-4">
            <p className="text-sm font-medium text-slate-900">No dryland sessions yet.</p>
            <p className="mt-2 text-sm text-slate-600">
              Create a dryland exercise, then split it into micro sessions here.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderUnitControls(
    unit: UnitView,
    visualOrigin: ExecutionMode = "ordered",
    actionLabel?: string
  ) {
    const isPending = pendingBlockId === unit.block.id;
    const isPaused = plan?.status === "paused";
    const completeDisabled = isPending || isPaused || !unit.isAvailable;
    const targetLabel = actionLabel ?? getBubbleTargetLabel(unit.block);
    const completeNextPrefix = "Complete next: ";
    const completeNextTarget = targetLabel.startsWith(completeNextPrefix)
      ? targetLabel.slice(completeNextPrefix.length)
      : null;
    const isDetailedCompleteAction = completeNextTarget !== null;
    const completeAriaLabel = targetLabel.toLowerCase().startsWith("complete")
      ? targetLabel
      : `Complete ${targetLabel}`;

    return (
      <div className="flex w-full flex-wrap items-center gap-2">
        {unit.block.status === "queued" ? (
          <button
            type="button"
            data-testid={`dryland-micro-complete-${unit.index}`}
            aria-pressed="false"
            aria-label={completeAriaLabel}
            onClick={() => void updateBlock(unit.block.id, "completed", { visualOrigin })}
            disabled={completeDisabled}
            className={cx(
              MICRO_UNIT_COMPLETE_ACTION_CLASS,
              isDetailedCompleteAction ? "justify-start text-left" : "justify-center text-center"
            )}
          >
            {isPending ? (
              "Saving..."
            ) : completeNextTarget ? (
              <span className="min-w-0 text-left leading-tight">
                <span className="block sm:inline">
                  Complete next:<span className="hidden sm:inline"> </span>
                </span>
                <span className="block sm:inline">{completeNextTarget}</span>
              </span>
            ) : (
              targetLabel
            )}
          </button>
        ) : unit.block.status === "completed" ? (
          <button
            type="button"
            data-testid={`dryland-micro-undo-${unit.index}`}
            aria-pressed="true"
            aria-label={`Completed ${targetLabel}. Undo completion`}
            onClick={() => void updateBlock(unit.block.id, "queued", { visualOrigin })}
            disabled={isPending || isPaused}
            className={cx(MICRO_COMPLETED_ACTION_CLASS, "w-full")}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Completed"}
          </button>
        ) : (
          <button
            type="button"
            data-testid={`dryland-micro-undo-${unit.index}`}
            onClick={() => void updateBlock(unit.block.id, "queued", { visualOrigin })}
            disabled={isPending || isPaused}
            className={cx(MICRO_SECONDARY_ACTION_CLASS, "w-full")}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Undo"}
          </button>
        )}
      </div>
    );
  }

  function renderHistoryGroupControls(group: HistoryUnitGroup) {
    const latestUnit = group.units[group.units.length - 1];
    if (!latestUnit) return null;

    const isPending = pendingBlockId === latestUnit.block.id;
    const isPaused = plan?.status === "paused";

    if (group.status === "completed") {
      return (
        <button
          type="button"
          data-testid={`dryland-micro-history-undo-${group.sortIndex}`}
          aria-pressed="true"
          aria-label={`Completed ${group.title}. Undo latest completion`}
          onClick={() => void updateBlock(latestUnit.block.id, "queued")}
          disabled={isPending || isPaused}
          className={cx(
            MICRO_COMPLETED_ACTION_CLASS,
            "min-h-9 px-3 text-xs sm:min-h-10 sm:px-4 sm:text-sm"
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          {isPending ? "Saving..." : "Completed"}
        </button>
      );
    }

    return (
      <button
        type="button"
        data-testid={`dryland-micro-history-undo-${group.sortIndex}`}
        aria-label={`Skipped ${group.title}. Undo latest skipped unit`}
        onClick={() => void updateBlock(latestUnit.block.id, "queued")}
        disabled={isPending || isPaused}
        className={MICRO_COMPACT_SECONDARY_ACTION_CLASS}
      >
        <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        {isPending ? "Saving..." : "Undo"}
      </button>
    );
  }

  function renderExecutionModeSwitch() {
    const modes: Array<{
      value: ExecutionMode;
      label: string;
      icon: typeof ListChecks;
    }> = [
      { value: "ordered", label: "Ordered", icon: ListChecks },
      { value: "bubbles", label: "Bubbles", icon: Bubbles },
    ];

    return (
      <div className="inline-flex rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = executionMode === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              data-testid={`dryland-micro-mode-${mode.value}`}
              aria-pressed={isActive}
              onClick={() => switchExecutionMode(mode.value)}
              className={cx(
                MICRO_SEGMENT_CLASS,
                isActive ? MICRO_SEGMENT_ACTIVE_CLASS : MICRO_SEGMENT_IDLE_CLASS,
                MICRO_ACTION_FOCUS_CLASS
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.label}
            </button>
          );
        })}
      </div>
    );
  }

  function renderOrderedUnits() {
    if (availableUnits.length === 0) {
      return (
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-900">No units are available now.</p>
          <p className="mt-1 text-sm text-slate-600">
            Release an upcoming unit or wait for the next weekday release.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-3">
        {groupUnitsByExercise(availableUnits).map((group) => {
          const firstUnit = group[0];
          if (!firstUnit) return null;
          const summaryParts = getUnitSummaryParts(group);
          const actionLabel = getCompleteNextLabel(firstUnit.block);
          return (
            <article
              key={`${firstUnit.block.id}-group`}
              data-testid={`dryland-micro-unit-group-${firstUnit.index}`}
              className="rounded-xl bg-white p-3 ring-1 ring-slate-100"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <h5 className="text-base font-semibold text-slate-950">
                    {firstUnit.block.title}
                  </h5>
                  <p className="mt-1 text-sm text-slate-600">{summaryParts.join(" · ")}</p>
                  <p className="mt-2 text-sm text-slate-700">{firstUnit.block.coachCue}</p>
                </div>
                <div className="min-w-0 sm:w-80 sm:self-center">
                  {renderUnitControls(firstUnit, "ordered", actionLabel)}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  function renderBubbleBoard() {
    if (availableUnits.length === 0) {
      return (
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-900">No bubbles are available now.</p>
          <p className="mt-1 text-sm text-slate-600">
            Release an upcoming unit or switch back to ordered mode when the next unit opens.
          </p>
        </div>
      );
    }

    return (
      <div className={isBubbleFocus ? "mt-0 sm:mt-3" : "mt-2 sm:mt-3"}>
        <div
          data-testid="dryland-micro-bubble-board"
          className="flex flex-wrap items-start gap-x-2 gap-y-2 rounded-2xl bg-white p-2 ring-1 ring-slate-100 sm:gap-x-3 sm:gap-y-3"
        >
          {availableUnits.map((unit) => {
            const isArmed = armedBubbleId === unit.block.id;
            const isPending = pendingBlockId === unit.block.id;
            const isPopping = poppingBubbleId === unit.block.id;
            const durationSeconds = getBubbleDurationSeconds(unit.block);
            const isTimedBubble = durationSeconds !== null;
            const isTimedActive = isTimedBubble && bubbleTimer?.blockId === unit.block.id;
            const remainingSeconds =
              isTimedActive && bubbleTimer
                ? getBubbleRemainingSeconds(bubbleTimer, bubbleNowMs)
                : (durationSeconds ?? 0);
            const isTimerRunning = Boolean(isTimedActive && bubbleTimer?.startedAtMs !== null);
            const timerActionLabel = isPending
              ? "Saving..."
              : isTimedActive && bubbleTimer?.isConfirmingDone
                ? "Complete?"
                : isTimerRunning
                  ? formatBubbleCountdown(remainingSeconds)
                  : isTimedActive && remainingSeconds <= 0
                    ? formatBubbleCountdown(remainingSeconds)
                    : isTimedActive
                      ? "Start"
                      : null;
            const ariaLabel =
              isTimedBubble && !isTimedActive
                ? `Open timer for ${unit.block.title}, ${getBubbleTargetLabel(unit.block)}`
                : isTimedActive && bubbleTimer?.isConfirmingDone
                  ? `Confirm ${unit.block.title} done`
                  : isTimedActive && isTimerRunning
                    ? `Mark ${unit.block.title} done early, ${formatBubbleCountdown(
                        remainingSeconds
                      )} remaining`
                    : isTimedActive && remainingSeconds <= 0
                      ? `Complete ${unit.block.title}, ${getBubbleTargetLabel(unit.block)}`
                      : isTimedActive
                        ? `Start ${unit.block.title} timer, ${getBubbleTargetLabel(unit.block)}`
                        : `Complete ${unit.block.title}, ${getBubbleTargetLabel(unit.block)}`;
            return (
              <div
                key={unit.block.id}
                className="flex flex-none flex-col items-center"
                style={{ marginTop: getBubbleVisualStyle(unit).marginTop }}
              >
                <button
                  type="button"
                  data-testid={`dryland-micro-bubble-${unit.index}`}
                  aria-pressed={isArmed || isTimedActive}
                  aria-label={ariaLabel}
                  onClick={() => handleBubbleClick(unit)}
                  onKeyDown={(event) => handleBubbleKeyDown(event, unit)}
                  disabled={plan?.status === "paused" || isPending}
                  style={{ ...getBubbleVisualStyle(unit, isTimedActive), marginTop: undefined }}
                  className={`dryland-micro-bubble dryland-micro-bubble-float ui-press relative flex min-h-24 min-w-24 flex-none flex-col items-center justify-center rounded-full border p-2.5 text-center shadow-sm transition sm:p-3 ${getBubbleToneClasses(
                    unit,
                    bubbleToneByExerciseKey
                  )} ${
                    isArmed || isTimedActive
                      ? "ring-4 ring-blue-300 ring-offset-2"
                      : "hover:border-blue-300 hover:bg-white"
                  } ${
                    isPopping ? "dryland-micro-bubble-pop" : ""
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="block text-[13px] leading-tight font-semibold break-words sm:text-[15px]">
                    {unit.block.title}
                  </span>
                  <span className="mt-1 block text-xs leading-tight font-medium break-words text-slate-700 sm:text-[13px]">
                    {getBubbleTargetLabel(unit.block)}
                  </span>
                  {isTimedBubble && timerActionLabel ? (
                    <span className="mt-2 inline-flex min-h-6 items-center rounded-full bg-white/85 px-2 text-[11px] leading-none font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                      {timerActionLabel}
                    </span>
                  ) : null}
                  {!isTimedBubble && isArmed && !isPending ? (
                    <span className="mt-2 inline-flex min-h-6 items-center rounded-full bg-white/85 px-2 text-[11px] leading-none font-bold text-blue-700 shadow-sm ring-1 ring-blue-100">
                      Complete?
                    </span>
                  ) : null}
                  {isPending && !isTimedBubble ? (
                    <span className="absolute inset-x-0 bottom-3 text-xs font-semibold text-slate-600">
                      Saving...
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCollapsedPlan() {
    const copy = getCollapsedPlanCopy();
    const nextUpcomingUnit = upcomingUnits[0] ?? null;
    const repeatPlan = plan ? buildArchivedRepeatPlan(plan) : null;
    const isPausedLinkedPastWeek =
      isPastWeek &&
      habitLink?.status === "paused" &&
      habitLink.habitDefinitionSupport === "supported";
    const isManualPastWeek = isPastWeek && !habitLink;
    return (
      <div data-testid="dryland-micro-collapsed-state" className="rounded-2xl bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-slate-950">{copy.title}</h4>
            <p className="mt-1 max-w-[62ch] text-sm text-slate-600">{copy.body}</p>
            <p className="mt-2 text-sm text-slate-600">
              {availableUnits.length} ready · {upcomingUnits.length} upcoming · {historyUnitCount}{" "}
              completed or skipped
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            {isPausedLinkedPastWeek ? (
              <button
                type="button"
                data-testid="dryland-micro-resume-habit-link-collapsed"
                onClick={() => void updateHabitLinkStatus("active")}
                disabled={isHabitLinkSaving}
                className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {isHabitLinkSaving ? "Saving..." : "Resume counting"}
              </button>
            ) : null}
            {isManualPastWeek ? (
              <>
                {repeatPlan ? (
                  <button
                    type="button"
                    data-testid="dryland-micro-repeat-this-week"
                    onClick={() => void createPlan(repeatPlan)}
                    disabled={isSavingPlan}
                    className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
                  >
                    <Repeat className="h-4 w-4" aria-hidden="true" />
                    {isSavingPlan ? "Creating..." : "Repeat this week"}
                  </button>
                ) : null}
                <button
                  type="button"
                  data-testid="dryland-micro-choose-sessions-from-stale"
                  onClick={() => {
                    setIsCreating(true);
                    setError("");
                    setSuccess("");
                  }}
                  className={cx(MICRO_SECONDARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
                >
                  Choose sessions
                </button>
              </>
            ) : null}
            {isBlockedPlan && !isPausedLinkedPastWeek && !isManualPastWeek ? (
              <button
                type="button"
                data-testid="dryland-micro-resume-collapsed"
                onClick={() => void updatePlanStatus("active")}
                disabled={isPlanStatusSaving}
                className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
              >
                {isPlanStatusSaving ? "Saving..." : "Resume"}
              </button>
            ) : null}
            {nextUpcomingUnit && !isCompletePlan && !isPastWeek ? (
              <button
                type="button"
                data-testid={`dryland-micro-release-now-${nextUpcomingUnit.index}`}
                onClick={() => void releaseBlockNow(nextUpcomingUnit.block.id)}
                disabled={pendingBlockId === nextUpcomingUnit.block.id || plan?.status === "paused"}
                className={cx(MICRO_SECONDARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
              >
                {pendingBlockId === nextUpcomingUnit.block.id ? "Saving..." : "Move next to today"}
              </button>
            ) : null}
            {!isManualPastWeek && !isPausedLinkedPastWeek && !isCompletePlan ? (
              <button
                type="button"
                data-testid="dryland-micro-edit-from-collapsed"
                onClick={() => {
                  setIsEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className={cx(MICRO_SECONDARY_ACTION_CLASS, "min-w-0 flex-1 sm:flex-none")}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit micro session
              </button>
            ) : null}
            {!isManualPastWeek && !isPausedLinkedPastWeek && !isCompletePlan
              ? renderClearPlanControls({ fillRow: true })
              : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="micro-sessions"
      data-testid="dryland-micro-plan-panel"
      className={`rounded-2xl border border-slate-200 bg-white ${
        isBubbleFocus ? "p-3 sm:p-5" : "p-3 sm:p-5"
      }`}
    >
      <div
        className={`flex flex-wrap items-start justify-between gap-3 ${
          isBubbleFocus ? "hidden sm:flex" : ""
        }`}
      >
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            Micro Sessions
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Weekly micro plan</h3>
          <p className="mt-1 max-w-[68ch] text-sm text-slate-700">
            Split dryland sessions into manageable micro sessions.
          </p>
        </div>
        {plan ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            {getPlanStatusLabel(plan)}
          </span>
        ) : null}
      </div>

      {!schemaReady ? (
        <DrylandFeedback
          tone="warning"
          className="mt-4"
          testId="dryland-micro-schema-warning"
          action={
            <button
              type="button"
              onClick={retryRouteRefresh}
              disabled={isRouteRefreshing}
              className={MICRO_WARNING_ACTION_CLASS}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {isRouteRefreshing ? "Retrying..." : "Retry"}
            </button>
          }
        >
          <p>
            Micro Sessions are still syncing in this environment. Saved dryland sessions remain
            available.
          </p>
        </DrylandFeedback>
      ) : null}

      {loadError ? (
        <DrylandFeedback
          tone="error"
          className="mt-4"
          testId="dryland-micro-load-error"
          action={
            <button
              type="button"
              onClick={retryRouteRefresh}
              disabled={isRouteRefreshing}
              className={MICRO_DANGER_ACTION_CLASS}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {isRouteRefreshing ? "Retrying..." : "Retry"}
            </button>
          }
        >
          <p>{loadError}</p>
        </DrylandFeedback>
      ) : null}

      {error ? (
        <DrylandFeedback tone="error" className="mt-4" testId="dryland-micro-action-error">
          <p>{error}</p>
        </DrylandFeedback>
      ) : null}

      {success ? (
        <DrylandFeedback tone="success" className="mt-4" testId="dryland-micro-action-success">
          <p>{success}</p>
        </DrylandFeedback>
      ) : null}

      {soundNotice ? (
        <p role="status" className="mt-3 text-sm font-medium text-slate-600">
          {soundNotice}
        </p>
      ) : null}

      {pendingPausedCompletion ? (
        <DrylandFeedback
          tone="warning"
          className="mt-4"
          testId="dryland-micro-paused-final-prompt"
          action={
            <div className="grid max-w-full gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                data-testid="dryland-micro-complete-paused-count"
                onClick={() => completePendingPausedUnit(true)}
                className={MICRO_WARNING_PRIMARY_ACTION_CLASS}
              >
                Resume tracking + complete Habit
              </button>
              <button
                type="button"
                data-testid="dryland-micro-complete-paused-micro-only"
                onClick={() => completePendingPausedUnit(false)}
                className={MICRO_WARNING_ACTION_CLASS}
              >
                Complete Micro Session only
              </button>
              <button
                type="button"
                onClick={() => setPendingPausedCompletion(null)}
                className={MICRO_WARNING_ACTION_CLASS}
              >
                Cancel
              </button>
            </div>
          }
        >
          <p>
            {
              "This completes this week's Micro Session. Habit tracking is paused. Resume tracking to complete the Habit too."
            }
          </p>
        </DrylandFeedback>
      ) : null}

      {schemaReady && !plan ? (
        <>
          {!isCreating ? (
            <DrylandFeedback
              tone="empty"
              testId="dryland-micro-empty"
              className="mt-5 !border-0 !bg-transparent !p-0 !shadow-none [&>div:first-child]:w-full [&>div:first-child]:max-w-none"
            >
              <h4 className="text-base font-semibold text-slate-950">
                {archivedRepeatPlan ? "Start this week" : "No active micro session"}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {archivedRepeatPlan
                  ? "Last week's Micro Session is saved. Repeat it or choose sessions."
                  : "Create one weekly Micro Session from saved Dryland Sessions when you want small set-by-set work."}
              </p>
              {sessions.length > 0 ? (
                <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
                  {archivedRepeatPlan ? (
                    <button
                      type="button"
                      data-testid="dryland-micro-repeat-this-week-empty"
                      onClick={() => void createPlan(archivedRepeatPlan)}
                      disabled={isSavingPlan}
                      className={cx(MICRO_PRIMARY_ACTION_CLASS, "min-w-0 flex-1")}
                    >
                      <Repeat className="h-4 w-4" aria-hidden="true" />
                      {isSavingPlan ? "Creating..." : "Repeat this week"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    data-testid="dryland-micro-start-create"
                    onClick={() => {
                      setIsCreating(true);
                      setError("");
                      setSuccess("");
                    }}
                    className={cx(
                      archivedRepeatPlan
                        ? MICRO_SECONDARY_ACTION_CLASS
                        : MICRO_PRIMARY_ACTION_CLASS,
                      "min-w-0 flex-1"
                    )}
                  >
                    {archivedRepeatPlan ? null : <Bubbles className="h-4 w-4" aria-hidden="true" />}
                    {archivedRepeatPlan ? "Choose sessions" : "Create micro session"}
                  </button>
                </div>
              ) : null}
            </DrylandFeedback>
          ) : (
            <div className="mt-5 space-y-4 rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-slate-50/70 p-4">
              {renderSessionSelector()}
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                <span>Title</span>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(event) => setPlanTitle(event.target.value)}
                  placeholder={buildDefaultTitle(selectedSessionIds, sessions)}
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                />
              </label>
              {renderReleaseControls()}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {selectedSessionIds.length} selected ·{" "}
                  {releaseMode === "weekday" ? "weekday release" : "available now"}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setError("");
                    }}
                    disabled={isSavingPlan}
                    className={MICRO_SECONDARY_ACTION_CLASS}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="dryland-micro-create"
                    onClick={() => void createPlan()}
                    disabled={isSavingPlan || selectedSessionIds.length === 0}
                    className={MICRO_PRIMARY_ACTION_CLASS}
                  >
                    {isSavingPlan ? "Creating..." : "Create micro session"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {schemaReady && plan ? (
        <div className={isBubbleFocus ? "mt-0 space-y-2 sm:mt-5 sm:space-y-4" : "mt-5 space-y-4"}>
          <div
            className={`rounded-2xl bg-slate-50/70 ${isBubbleFocus ? "p-3 sm:p-4" : "p-3 sm:p-4"}`}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h4 className="text-xl font-semibold text-slate-950">{plan.title}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateLabel(plan.weekStartsAt)} to {formatDateLabel(plan.weekEndsAt)} ·{" "}
                  {plan.sourceSessionSnapshots.length || 1} source session
                  {(plan.sourceSessionSnapshots.length || 1) === 1 ? "" : "s"}
                  {isEditing ? "" : ` · ${executionMode} mode`}
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                {executionMode === "bubbles" ? null : (
                  <>
                    {renderPlanActionButtons()}
                    {renderSoundToggle()}
                  </>
                )}
              </div>
            </div>

            {executionMode === "bubbles" && !shouldCollapsePlan && !isEditing ? (
              <div
                data-testid="dryland-micro-manage-actions"
                className="mt-3 flex w-full items-center gap-2"
              >
                {renderPlanActionButtons({ compact: true })}
                {renderSoundToggle()}
              </div>
            ) : null}

            <div className={isBubbleFocus ? "mt-3" : "mt-5"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p id={progressLabelId} className="text-sm font-semibold text-slate-900">
                  Progress
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {latestUndoableCompletedUnit ? (
                    <button
                      type="button"
                      data-testid="dryland-micro-global-undo"
                      aria-label={`Undo last completed micro unit: ${latestUndoableCompletedUnit.title}`}
                      onClick={undoLatestCompletedUnit}
                      disabled={pendingBlockId === latestUndoableCompletedUnit.blockId}
                      className={cx(MICRO_COMPACT_SECONDARY_ACTION_CLASS, "min-h-8")}
                    >
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                      {pendingBlockId === latestUndoableCompletedUnit.blockId
                        ? "Restoring..."
                        : `Undo${undoableCompletedUnits.length > 1 ? ` · ${undoableCompletedUnits.length}` : ""}`}
                    </button>
                  ) : null}
                  <p className="text-sm text-slate-600">
                    {plan.progress.completedBlockCount}/{plan.progress.totalBlockCount} units ·{" "}
                    {plan.progress.progressPercent}%
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                aria-labelledby={progressLabelId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={plan.progress.progressPercent}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${plan.progress.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {isEditing ? (
            <div
              data-testid="dryland-micro-edit-form"
              className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4"
            >
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                <span>Title</span>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(event) => setPlanTitle(event.target.value)}
                  className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                />
              </label>
              {renderSessionSelector()}
              {renderReleaseControls()}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSavingPlan}
                  className={MICRO_SECONDARY_ACTION_CLASS}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="dryland-micro-save-edit"
                  onClick={() => void savePlanEdit()}
                  disabled={
                    isSavingPlan || selectedSessionIds.length === 0 || releaseMode === "manual"
                  }
                  className={MICRO_PRIMARY_ACTION_CLASS}
                >
                  {isSavingPlan ? "Saving..." : "Update micro session"}
                </button>
              </div>
            </div>
          ) : null}

          {!isEditing ? (
            shouldCollapsePlan ? (
              renderCollapsedPlan()
            ) : (
              <>
                <div
                  className={`rounded-2xl bg-slate-50/70 ${
                    executionMode === "bubbles" ? "p-1.5 sm:p-4" : "p-3 sm:p-4"
                  }`}
                >
                  <div
                    className={`flex flex-wrap items-center justify-between gap-2 ${
                      isBubbleFocus ? "max-sm:hidden" : ""
                    }`}
                  >
                    <div>
                      <h4
                        className={
                          executionMode === "bubbles"
                            ? "text-sm font-semibold text-slate-950"
                            : "text-base font-semibold text-slate-950"
                        }
                      >
                        Available units
                      </h4>
                      <p
                        className={
                          executionMode === "bubbles"
                            ? "text-xs text-slate-600"
                            : "mt-1 text-sm text-slate-600"
                        }
                      >
                        {availableUnits.length} ready · {upcomingUnits.length} upcoming
                      </p>
                    </div>
                    {renderExecutionModeSwitch()}
                  </div>

                  {executionMode === "ordered" ? renderOrderedUnits() : renderBubbleBoard()}
                </div>

                {renderHabitLinkPanel()}

                {upcomingUnits.length > 0 ? (
                  <div className="rounded-2xl bg-slate-50/70 p-4">
                    <h4 className="text-base font-semibold text-slate-950">Upcoming units</h4>
                    <div className="mt-3 space-y-2">
                      {upcomingUnits.map((unit) => {
                        const isPending = pendingBlockId === unit.block.id;
                        const releaseLabel =
                          unit.block.releaseMode === "manual" ? "Release now" : "Move to today";
                        return (
                          <div
                            key={unit.block.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-100"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {unit.block.title} · {getBubbleTargetLabel(unit.block)}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {unit.block.releaseMode === "weekday"
                                  ? `${getDrylandMicroWeekdayLabel(unit.block.releaseOffsetDays)} ${
                                      unit.block.releaseTime
                                    }`
                                  : "Manual release"}
                              </p>
                            </div>
                            <button
                              type="button"
                              data-testid={`dryland-micro-release-now-${unit.index}`}
                              onClick={() => void releaseBlockNow(unit.block.id)}
                              disabled={isPending || plan.status === "paused"}
                              className={MICRO_SECONDARY_ACTION_CLASS}
                            >
                              {isPending ? "Saving..." : releaseLabel}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {historyUnitGroups.length > 0 ? (
                  <div className="rounded-2xl bg-slate-50/70 p-4">
                    <h4 className="text-base font-semibold text-slate-950">
                      Completed and skipped
                    </h4>
                    <div className="mt-3 grid gap-2">
                      {historyUnitGroups.map((group) => (
                        <div
                          key={group.key}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-950">{group.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                              <span>{group.seriesLabel}</span>
                              {group.isArchived ? (
                                <>
                                  <span className="text-slate-400">·</span>
                                  <span>source removed from active plan</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {renderHistoryGroupControls(group)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
