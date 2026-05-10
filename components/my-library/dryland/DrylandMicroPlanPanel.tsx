"use client";

import { useEffect, useId, useMemo, useState } from "react";
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

const RELEASE_MODES: Array<{ value: DrylandMicroReleaseMode; label: string }> = [
  { value: "available_now", label: "Available now" },
  { value: "weekday", label: "Weekday release" },
  { value: "manual", label: "Manual release" },
];

const WEEKDAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6] as const;

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const progressLabelId = useId();

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

      setPlan(responseBody.plan);
      setPlanTitle(responseBody.plan.title);
      setSelectedSessionIds(buildInitialSelectedSessionIds(responseBody.plan));
      setReleaseDayAssignments(buildInitialReleaseDayAssignments(responseBody.plan));
      setReleaseMode(responseBody.plan.releaseMode);
      setReleaseTime(responseBody.plan.releaseTime);
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

  async function patchPlan(body: Record<string, unknown>) {
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

    setPlan(responseBody.plan);
    setPlanTitle(responseBody.plan.title);
    setSelectedSessionIds(buildInitialSelectedSessionIds(responseBody.plan));
    setReleaseDayAssignments(buildInitialReleaseDayAssignments(responseBody.plan));
    setReleaseMode(responseBody.plan.releaseMode);
    setReleaseTime(responseBody.plan.releaseTime);
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

  async function updateBlock(blockId: string, blockStatus: DrylandMicroBlockStatus) {
    setPendingBlockId(blockId);
    setError("");
    setSuccess("");

    try {
      const nextPlan = await patchPlan({ blockId, blockStatus });
      setSuccess(
        nextPlan?.status === "completed"
          ? "All micro units are complete for this week."
          : "Micro unit updated."
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Could not update micro session."
      );
    } finally {
      setPendingBlockId(null);
    }
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

  function renderUnitControls(unit: UnitView) {
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
              onClick={() => void updateBlock(unit.block.id, "completed")}
              disabled={completeDisabled}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isPending ? "Saving..." : unit.block.targetLabel}
            </button>
            <button
              type="button"
              data-testid={`dryland-micro-skip-${unit.index}`}
              onClick={() => void updateBlock(unit.block.id, "skipped")}
              disabled={completeDisabled}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-amber-200 bg-white px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-50 active:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            type="button"
            data-testid={`dryland-micro-undo-${unit.index}`}
            onClick={() => void updateBlock(unit.block.id, "queued")}
            disabled={isPending || isPaused}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Undo"}
          </button>
        )}
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
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Ordered mobile execution</h3>
          <p className="mt-1 max-w-[68ch] text-sm text-slate-700">
            Build one weekly Micro Session from saved Dryland Sessions and finish one set unit at a
            time.
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
                  {(plan.sourceSessionSnapshots.length || 1) === 1 ? "" : "s"} · ordered mode
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
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                Ordered mode
              </span>
            </div>

            {availableUnits.length > 0 ? (
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
            ) : (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-medium text-slate-900">No units are available now.</p>
                <p className="mt-1 text-sm text-slate-600">
                  Release an upcoming unit or wait for the next weekday release.
                </p>
              </div>
            )}
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
