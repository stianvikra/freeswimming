"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { Bubbles, Check, ListChecks, SkipForward, Undo2 } from "lucide-react";
import {
  getDrylandMicroBlockReleaseDate,
  getDrylandMicroWeekdayLabel,
  isDrylandMicroBlockAvailable,
  type DrylandMicroBlockSnapshot,
  type DrylandMicroBlockStatus,
  type DrylandMicroPlanApiResponse,
  type DrylandMicroPlanRecord,
  type DrylandMicroReleaseMode,
} from "@/lib/dryland/micro-plans";
import { getDrylandSessionKindLabel, type DrylandSessionSummary } from "@/lib/dryland/shared";

type Props = {
  initialPlan: DrylandMicroPlanRecord | null;
  sessions: DrylandSessionSummary[];
  schemaReady: boolean;
  loadError: string | null;
};

type UnitView = {
  block: DrylandMicroBlockSnapshot;
  index: number;
  isAvailable: boolean;
  releaseDate: Date | null;
};

type ExecutionMode = "ordered" | "bubbles";
type PatchPlanOptions = {
  applyResponse?: boolean;
};

const RELEASE_MODES: Array<{ value: DrylandMicroReleaseMode; label: string }> = [
  { value: "available_now", label: "Available now" },
  { value: "weekday", label: "Weekday release" },
  { value: "manual", label: "Manual release" },
];

const WEEKDAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;
const BUBBLE_DOUBLE_TAP_WINDOW_MS = 520;
const BUBBLE_POP_ANIMATION_MS = 320;
const BUBBLE_TONE_CLASSES = [
  "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-900/10",
  "border-cyan-200 bg-cyan-50 text-cyan-950 shadow-cyan-900/10",
  "border-amber-200 bg-amber-50 text-amber-950 shadow-amber-900/10",
  "border-sky-200 bg-sky-50 text-sky-950 shadow-sky-900/10",
  "border-violet-200 bg-violet-50 text-violet-950 shadow-violet-900/10",
  "border-rose-200 bg-rose-50 text-rose-950 shadow-rose-900/10",
] as const;
const BUBBLE_OFFSETS_PX = [0, 14, 5, 20, 9, 16] as const;

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "This week";
  return parsed.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

function formatReleaseDateLabel(value: Date | null) {
  if (!value) return "Manual";
  return value.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getBlockStatusLabel(status: DrylandMicroBlockStatus) {
  switch (status) {
    case "completed":
      return "Complete";
    case "skipped":
      return "Skipped";
    default:
      return "Queued";
  }
}

function getPlanStatusLabel(plan: DrylandMicroPlanRecord) {
  if (plan.status === "completed") return "Week complete";
  if (plan.status === "paused") return "Paused";
  return "Active this week";
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

function buildDefaultTitle(sessionIds: string[], sessions: DrylandSessionSummary[]) {
  if (sessionIds.length === 1) {
    const session = sessions.find((candidate) => candidate.id === sessionIds[0]);
    return `Micro session: ${session?.title ?? "Dryland"}`.slice(0, 120);
  }
  return sessionIds.length > 1 ? `Micro session: ${sessionIds.length} sessions` : "Micro session";
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

function getBubbleToneClasses(unit: UnitView) {
  const seed = hashBubbleSeed(getBubbleExerciseKey(unit.block));
  return BUBBLE_TONE_CLASSES[seed % BUBBLE_TONE_CLASSES.length];
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

function getBubbleVisualStyle(unit: UnitView): CSSProperties {
  const seed = hashBubbleSeed(getBubbleExerciseKey(unit.block));
  const targetLabel = getBubbleTargetLabel(unit.block);
  const contentWeight = unit.block.title.length + Math.round(targetLabel.length * 0.55);
  const size = Math.min(9.25, Math.max(7, 6.5 + contentWeight * 0.09));
  const rawOffset =
    BUBBLE_OFFSETS_PX[(unit.index + unit.block.setIndex) % BUBBLE_OFFSETS_PX.length] ??
    BUBBLE_OFFSETS_PX[0];
  const offset = Math.round(rawOffset * 0.55);
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
}: Props) {
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
  const [isEditing, setIsEditing] = useState(false);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [isPlanStatusSaving, setIsPlanStatusSaving] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("ordered");
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [poppingBubbleId, setPoppingBubbleId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const progressLabelId = useId();
  const lastBubbleTapRef = useRef<{ blockId: string; tappedAt: number } | null>(null);

  useEffect(() => {
    setPlan(initialPlan);
    setSelectedSessionIds(buildInitialSelectedSessionIds(initialPlan));
    setReleaseMode(initialPlan?.releaseMode ?? "available_now");
    setReleaseTime(initialPlan?.releaseTime ?? "06:00");
    setReleaseDayAssignments(buildInitialReleaseDayAssignments(initialPlan));
    setPlanTitle(initialPlan?.title ?? "");
    setIsEditing(false);
    setError("");
    setSuccess("");
    setPendingBlockId(null);
    setIsPlanStatusSaving(false);
    setIsSavingPlan(false);
    setExecutionMode("ordered");
    setSelectedBubbleId(null);
    setPoppingBubbleId(null);
    lastBubbleTapRef.current = null;
  }, [initialPlan]);

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

  const availableUnits = unitViews
    .filter((unit) => unit.block.status === "queued" && unit.isAvailable && !unit.block.isArchived)
    .sort(sortUnitsByRelease);
  const upcomingUnits = unitViews
    .filter((unit) => unit.block.status === "queued" && !unit.isAvailable && !unit.block.isArchived)
    .sort(sortUnitsByRelease);
  const historyUnits = unitViews
    .filter((unit) => unit.block.status !== "queued")
    .sort((first, second) => first.index - second.index);
  const selectedBubbleUnit =
    availableUnits.find((unit) => unit.block.id === selectedBubbleId) ?? null;

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

  function applyPlanState(nextPlan: DrylandMicroPlanRecord) {
    setPlan(nextPlan);
    setPlanTitle(nextPlan.title);
    setSelectedSessionIds(buildInitialSelectedSessionIds(nextPlan));
    setReleaseDayAssignments(buildInitialReleaseDayAssignments(nextPlan));
    setReleaseMode(nextPlan.releaseMode);
    setReleaseTime(nextPlan.releaseTime);
    setSelectedBubbleId((current) => {
      if (!current) return null;
      return nextPlan.blocks.some(
        (block) => block.id === current && block.status === "queued" && !block.isArchived
      )
        ? current
        : null;
    });
  }

  function switchExecutionMode(mode: ExecutionMode) {
    setExecutionMode(mode);
    setError("");
    setSuccess("");
    if (mode === "bubbles" && !selectedBubbleId && availableUnits[0]) {
      setSelectedBubbleId(availableUnits[0].block.id);
    }
  }

  async function createPlan() {
    if (selectedSessionIds.length === 0) {
      setError("Select at least one saved Dryland Session.");
      return;
    }

    setIsSavingPlan(true);
    setError("");
    setSuccess("");

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch("/api/my-library/dryland/micro-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceDrylandSessionIds: selectedSessionIds,
          title: planTitle.trim() || buildDefaultTitle(selectedSessionIds, sessions),
          releaseMode,
          releaseTime,
          sourceReleaseOffsetDays: releaseDayAssignments,
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

  async function patchPlan(body: Record<string, unknown>, options: PatchPlanOptions = {}) {
    if (!plan) return null;

    const response = await fetch(`/api/my-library/dryland/micro-plans/${plan.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    return responseBody.plan;
  }

  async function savePlanEdit() {
    if (selectedSessionIds.length === 0) {
      setError("Select at least one saved Dryland Session.");
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
    options: { visualOrigin?: ExecutionMode } = {}
  ) {
    setPendingBlockId(blockId);
    setError("");
    setSuccess("");

    try {
      const shouldPopBubble = options.visualOrigin === "bubbles" && blockStatus === "completed";
      const nextPlan = await patchPlan(
        { blockId, blockStatus },
        { applyResponse: !shouldPopBubble }
      );

      if (shouldPopBubble && nextPlan) {
        setPoppingBubbleId(blockId);
        setSuccess(
          nextPlan.status === "completed"
            ? "All micro units are complete for this week."
            : "Bubble completed."
        );
        await wait(BUBBLE_POP_ANIMATION_MS);
        applyPlanState(nextPlan);
        setPoppingBubbleId(null);
        return;
      }

      setSuccess(
        nextPlan?.status === "completed"
          ? "All micro units are complete for this week."
          : "Micro unit updated."
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not update micro session."
      );
      setPoppingBubbleId(null);
    } finally {
      setPendingBlockId(null);
    }
  }

  function handleBubbleClick(unit: UnitView) {
    setSelectedBubbleId(unit.block.id);
    setError("");
    setSuccess("");

    if (plan?.status === "paused" || pendingBlockId === unit.block.id || !unit.isAvailable) {
      lastBubbleTapRef.current = null;
      return;
    }

    const now = Date.now();
    const lastTap = lastBubbleTapRef.current;
    if (
      lastTap?.blockId === unit.block.id &&
      now - lastTap.tappedAt <= BUBBLE_DOUBLE_TAP_WINDOW_MS
    ) {
      lastBubbleTapRef.current = null;
      void updateBlock(unit.block.id, "completed", { visualOrigin: "bubbles" });
      return;
    }

    lastBubbleTapRef.current = {
      blockId: unit.block.id,
      tappedAt: now,
    };
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

  function renderReleaseControls() {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Release pacing</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {RELEASE_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setReleaseMode(mode.value)}
                className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition ${
                  releaseMode === mode.value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

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

        {releaseMode === "manual" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Manual release keeps units queued until you release them.
          </p>
        ) : null}
      </div>
    );
  }

  function renderSessionSelector() {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Select sessions</p>
          <p className="mt-1 text-sm text-slate-600">
            Saved Dryland Sessions stay in the library. Micro Sessions creates ordered set units
            from the selected sources.
          </p>
        </div>
        {sessions.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {sessions.slice(0, 8).map((session) => {
              const isSelected = selectedSessionIds.includes(session.id);
              return (
                <label
                  key={session.id}
                  className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    data-testid={`dryland-micro-select-${session.id}`}
                    checked={isSelected}
                    onChange={() => toggleSelectedSession(session.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-950">
                      {session.title}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {getDrylandSessionKindLabel(session.sessionKind)} · {session.exerciseCount}{" "}
                      exercises · {session.setCount} set units
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">No dryland sessions yet.</p>
            <p className="mt-2 text-sm text-slate-600">
              Create a saved dryland session first, then build a Micro Session from it.
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderUnitControls(unit: UnitView, visualOrigin: ExecutionMode = "ordered") {
    const isPending = pendingBlockId === unit.block.id;
    const isPaused = plan?.status === "paused";
    const completeDisabled = isPending || isPaused || !unit.isAvailable;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {unit.block.status === "queued" ? (
          <>
            <button
              type="button"
              data-testid={`dryland-micro-complete-${unit.index}`}
              onClick={() => void updateBlock(unit.block.id, "completed", { visualOrigin })}
              disabled={completeDisabled}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isPending
                ? "Saving..."
                : visualOrigin === "bubbles"
                  ? "Complete"
                  : unit.block.targetLabel}
            </button>
            <button
              type="button"
              data-testid={`dryland-micro-skip-${unit.index}`}
              onClick={() => void updateBlock(unit.block.id, "skipped", { visualOrigin })}
              disabled={completeDisabled}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-50 active:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
              Skip set
            </button>
          </>
        ) : (
          <button
            type="button"
            data-testid={`dryland-micro-undo-${unit.index}`}
            onClick={() => void updateBlock(unit.block.id, "queued", { visualOrigin })}
            disabled={isPending || isPaused}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Undo"}
          </button>
        )}
      </div>
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
      <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
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
              className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-white hover:text-blue-700"
              }`}
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
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
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
          return (
            <article
              key={`${firstUnit.block.id}-group`}
              data-testid={`dryland-micro-unit-group-${firstUnit.index}`}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h5 className="text-base font-semibold text-slate-950">
                    {firstUnit.block.title}
                  </h5>
                  <p className="mt-1 text-sm text-slate-600">
                    {firstUnit.block.sourceSessionTitle} ·{" "}
                    {formatReleaseDateLabel(firstUnit.releaseDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{firstUnit.block.coachCue}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.map((unit) => (
                  <div key={unit.block.id} className="flex flex-wrap gap-2">
                    {renderUnitControls(unit)}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  function renderBubbleDetail() {
    if (!selectedBubbleUnit) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Select a bubble</p>
          <p className="mt-1 text-sm text-slate-600">
            Tap once to inspect a unit. Tap the same bubble twice to complete it after the server
            confirms the update.
          </p>
        </div>
      );
    }

    return (
      <aside
        data-testid="dryland-micro-bubble-detail"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Selected bubble
            </p>
            <h5 className="mt-1 text-lg font-semibold text-slate-950">
              {selectedBubbleUnit.block.title}
            </h5>
            <p className="mt-1 text-sm text-slate-600">
              {selectedBubbleUnit.block.sourceSessionTitle} ·{" "}
              {formatReleaseDateLabel(selectedBubbleUnit.releaseDate)}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {selectedBubbleUnit.block.targetLabel}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-700">{selectedBubbleUnit.block.coachCue}</p>
        <div className="mt-4">{renderUnitControls(selectedBubbleUnit, "bubbles")}</div>
      </aside>
    );
  }

  function renderBubbleBoard() {
    if (availableUnits.length === 0) {
      return (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-medium text-slate-900">No bubbles are available now.</p>
          <p className="mt-1 text-sm text-slate-600">
            Release an upcoming unit or switch back to ordered mode when the next unit opens.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div
          data-testid="dryland-micro-bubble-board"
          className="flex flex-wrap items-start gap-x-4 gap-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-3"
        >
          {availableUnits.map((unit) => {
            const isSelected = selectedBubbleId === unit.block.id;
            const isPending = pendingBlockId === unit.block.id;
            const isPopping = poppingBubbleId === unit.block.id;
            return (
              <button
                key={unit.block.id}
                type="button"
                data-testid={`dryland-micro-bubble-${unit.index}`}
                aria-pressed={isSelected}
                aria-label={`${unit.block.title}, ${getBubbleTargetLabel(
                  unit.block
                )}. Select bubble. Double tap to complete.`}
                onClick={() => handleBubbleClick(unit)}
                disabled={plan?.status === "paused" || isPending}
                style={getBubbleVisualStyle(unit)}
                className={`dryland-micro-bubble dryland-micro-bubble-float ui-press relative flex min-h-28 min-w-28 flex-none flex-col items-center justify-center rounded-full border p-3 text-center shadow-sm transition ${getBubbleToneClasses(
                  unit
                )} ${
                  isSelected
                    ? "ring-4 ring-blue-300 ring-offset-2"
                    : "hover:border-blue-300 hover:bg-white"
                } ${
                  isPopping ? "dryland-micro-bubble-pop" : ""
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="block text-sm leading-tight font-semibold break-words">
                  {unit.block.title}
                </span>
                <span className="mt-1 block text-xs leading-tight font-medium break-words text-slate-700">
                  {getBubbleTargetLabel(unit.block)}
                </span>
                {isPending ? (
                  <span className="absolute inset-x-0 bottom-3 text-xs font-semibold text-slate-600">
                    Saving...
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {renderBubbleDetail()}
      </div>
    );
  }

  return (
    <section
      data-testid="dryland-micro-plan-panel"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/45 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            Micro Sessions
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Ordered and bubbles execution
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm text-slate-700">
            Build one weekly Micro Session from saved Dryland Sessions and finish one set unit at a
            time in a calm list or a bubble board.
          </p>
        </div>
        {plan ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            {getPlanStatusLabel(plan)}
          </span>
        ) : null}
      </div>

      {!schemaReady ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
          <p className="text-sm text-amber-900">
            Micro Sessions are still syncing in this environment. Saved dryland sessions remain
            available while the micro-plan table is applied.
          </p>
        </div>
      ) : null}

      {loadError ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-white p-4">
          <p className="text-sm text-rose-900">{loadError}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-white p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      {schemaReady && !plan ? (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
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
              {releaseMode === "weekday"
                ? "weekday release"
                : releaseMode === "manual"
                  ? "manual release"
                  : "available now"}
            </p>
            <button
              type="button"
              data-testid="dryland-micro-create"
              onClick={() => void createPlan()}
              disabled={isSavingPlan || selectedSessionIds.length === 0}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSavingPlan ? "Creating..." : "Create micro session"}
            </button>
          </div>
        </div>
      ) : null}

      {schemaReady && plan ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h4 className="text-xl font-semibold text-slate-950">{plan.title}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateLabel(plan.weekStartsAt)} to {formatDateLabel(plan.weekEndsAt)} ·{" "}
                  {plan.sourceSessionSnapshots.length || 1} source session
                  {(plan.sourceSessionSnapshots.length || 1) === 1 ? "" : "s"} · {executionMode}{" "}
                  mode
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  data-testid="dryland-micro-edit-plan"
                  onClick={() => {
                    setIsEditing((current) => !current);
                    setError("");
                    setSuccess("");
                  }}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  {isEditing ? "Close edit" : "Edit micro session"}
                </button>
                {plan.status !== "completed" ? (
                  <button
                    type="button"
                    data-testid="dryland-micro-toggle-plan-status"
                    onClick={() =>
                      void updatePlanStatus(plan.status === "paused" ? "active" : "paused")
                    }
                    disabled={isPlanStatusSaving}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPlanStatusSaving
                      ? "Saving..."
                      : plan.status === "paused"
                        ? "Resume"
                        : "Pause"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <p id={progressLabelId} className="text-sm font-semibold text-slate-900">
                  Micro session progress
                </p>
                <p className="text-sm text-slate-600">
                  {plan.progress.completedBlockCount}/{plan.progress.totalBlockCount} units ·{" "}
                  {plan.progress.progressPercent}%
                </p>
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
              className="space-y-4 rounded-xl border border-blue-200 bg-white p-4"
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
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="dryland-micro-save-edit"
                  onClick={() => void savePlanEdit()}
                  disabled={isSavingPlan || selectedSessionIds.length === 0}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSavingPlan ? "Saving..." : "Save micro session"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-semibold text-slate-950">Available units</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {availableUnits.length} ready · {upcomingUnits.length} upcoming
                </p>
              </div>
              {renderExecutionModeSwitch()}
            </div>

            {executionMode === "ordered" ? renderOrderedUnits() : renderBubbleBoard()}
          </div>

          {upcomingUnits.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-base font-semibold text-slate-950">Upcoming units</h4>
              <div className="mt-3 space-y-2">
                {upcomingUnits.map((unit) => {
                  const isPending = pendingBlockId === unit.block.id;
                  const releaseLabel =
                    unit.block.releaseMode === "manual" ? "Release now" : "Move to today";
                  return (
                    <div
                      key={unit.block.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {unit.block.title} · {unit.block.targetLabel}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {unit.block.sourceSessionTitle} ·{" "}
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
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? "Saving..." : releaseLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {historyUnits.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-base font-semibold text-slate-950">Completed and skipped</h4>
              <div className="mt-3 grid gap-2">
                {historyUnits.map((unit) => (
                  <div
                    key={unit.block.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {unit.block.title} · {unit.block.targetLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {getBlockStatusLabel(unit.block.status)}
                        {unit.block.isArchived ? " · source removed from active plan" : ""}
                      </p>
                    </div>
                    {renderUnitControls(unit)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
