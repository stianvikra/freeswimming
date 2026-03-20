"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatGoalDate, type GoalPrimaryAction, type GoalView } from "@/lib/goals/mvp";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

type TemplateOption = {
  id: string;
  title: string;
  summary: string;
  goalType: string;
  targetDistanceM: number | null;
  targetTimeSeconds: number | null;
  targetCount: number | null;
  targetRef: string | null;
};

type Props = {
  initialGoals: GoalView[];
  templates: readonly TemplateOption[];
  activeLimit: number;
};

type LogResultAction = Extract<GoalPrimaryAction, { kind: "log_result" }>;

type ApiError = {
  ok?: boolean;
  error?: string;
};

const ACTIVE_STATUSES = new Set<GoalView["status"]>(["active", "on_track", "at_risk"]);

function isActiveStatus(status: GoalView["status"]) {
  return ACTIVE_STATUSES.has(status);
}

function parseTimeInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map((part) => part.trim());
    if (parts.length !== 2) return null;
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null;
    if (minutes < 0 || seconds < 0 || seconds >= 60) return null;
    return Math.round(minutes * 60 + seconds);
  }

  const asNumber = Number(trimmed);
  if (!Number.isFinite(asNumber) || asNumber <= 0) return null;
  return Math.round(asNumber);
}

function getGoalStatusBadgeClass(tone: GoalView["statusTone"]) {
  if (tone === "emerald") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "amber") return "border border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "blue") return "border border-blue-200 bg-blue-50 text-blue-700";
  return "border border-slate-200 bg-slate-50 text-slate-700";
}

function getTemplateTargetCopy(template: TemplateOption) {
  if (
    template.goalType === "distance_time" &&
    template.targetDistanceM &&
    template.targetTimeSeconds
  ) {
    const minutes = Math.floor(template.targetTimeSeconds / 60);
    const seconds = template.targetTimeSeconds % 60;
    return `${template.targetDistanceM}m under ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  if (template.goalType === "distance_continuous" && template.targetDistanceM) {
    return `${template.targetDistanceM}m continuous`;
  }

  if (template.goalType === "drill_complete" && template.targetRef) {
    return `Complete ${template.targetRef}`;
  }

  if (template.goalType === "module_complete" && template.targetCount) {
    return `Complete ${template.targetCount} lessons`;
  }

  return "Goal template";
}

export default function GoalsHub({ initialGoals, templates, activeLimit }: Props) {
  const [goals, setGoals] = useState<GoalView[]>(initialGoals);
  const [actionError, setActionError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});

  const [customTitle, setCustomTitle] = useState("");
  const [customMetric, setCustomMetric] = useState<
    "distance_time" | "distance_continuous" | "count"
  >("distance_time");
  const [customDistanceM, setCustomDistanceM] = useState("1000");
  const [customTimeSeconds, setCustomTimeSeconds] = useState("600");
  const [customCount, setCustomCount] = useState("3");
  const [customTargetDate, setCustomTargetDate] = useState("");
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());
    setClientReady(true);

    function onOnline() {
      setIsOnline(true);
    }

    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const activeGoalCount = useMemo(
    () => goals.filter((goal) => isActiveStatus(goal.status)).length,
    [goals]
  );
  const achievedGoalCount = useMemo(
    () => goals.filter((goal) => goal.status === "achieved").length,
    [goals]
  );
  const canCreateGoal = activeGoalCount < activeLimit;
  const activeTemplateTitleSet = useMemo(
    () =>
      new Set(
        goals
          .filter((goal) => goal.source === "template" && isActiveStatus(goal.status))
          .map((goal) => goal.title)
      ),
    [goals]
  );

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  async function refreshGoals() {
    setIsRefreshing(true);
    setActionError("");

    try {
      const response = await fetch("/api/goals", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await parseError(response, "Could not refresh goals right now.");
        setActionError(message);
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        goals?: GoalView[];
        activeCount?: number;
      } | null;

      if (!payload?.ok || !Array.isArray(payload.goals)) {
        setActionError("Could not refresh goals right now.");
        return;
      }

      setGoals(payload.goals);
    } catch {
      setActionError("Could not refresh goals right now.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function upsertGoal(nextGoal: GoalView) {
    setGoals((prev) => {
      const existingIndex = prev.findIndex((goal) => goal.id === nextGoal.id);
      if (existingIndex < 0) {
        return [nextGoal, ...prev];
      }
      const clone = [...prev];
      clone[existingIndex] = nextGoal;
      return clone;
    });
  }

  async function createTemplateGoal(templateId: string) {
    if (!canCreateGoal) return;
    if (!isOnline) {
      setActionError("You are offline. Reconnect to create goals.");
      return;
    }

    setPendingTemplateId(templateId);
    setActionError("");

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "template",
          templateId,
        }),
      });

      if (!response.ok) {
        const message = await parseError(response, "Could not create goal right now.");
        setActionError(message);
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        goal?: GoalView;
      } | null;

      if (!payload?.ok || !payload.goal) {
        setActionError("Could not create goal right now.");
        return;
      }

      upsertGoal(payload.goal);
      setActionError("");
    } catch {
      setActionError("Could not create goal right now.");
    } finally {
      setPendingTemplateId(null);
    }
  }

  async function createCustomGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreateGoal) return;
    if (!isOnline) {
      setActionError("You are offline. Reconnect to create goals.");
      return;
    }

    setIsCreatingCustom(true);
    setActionError("");

    const payload: Record<string, unknown> = {
      mode: "custom",
      title: customTitle.trim(),
      metric: customMetric,
      targetDate: customTargetDate.trim() || null,
    };

    if (customMetric === "distance_time") {
      payload.distanceM = Number(customDistanceM);
      payload.timeSeconds = parseTimeInput(customTimeSeconds);
    } else if (customMetric === "distance_continuous") {
      payload.distanceM = Number(customDistanceM);
    } else {
      payload.count = Number(customCount);
    }

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseError(response, "Could not create custom goal right now.");
        setActionError(message);
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        goal?: GoalView;
      } | null;
      if (!data?.ok || !data.goal) {
        setActionError("Could not create custom goal right now.");
        return;
      }

      upsertGoal(data.goal);
      setCustomTitle("");
      if (customMetric === "distance_time") {
        setCustomDistanceM("1000");
        setCustomTimeSeconds("600");
      } else if (customMetric === "distance_continuous") {
        setCustomDistanceM("1000");
      } else {
        setCustomCount("3");
      }
    } catch {
      setActionError("Could not create custom goal right now.");
    } finally {
      setIsCreatingCustom(false);
    }
  }

  async function patchGoal(
    goalId: string,
    payload: Record<string, unknown>,
    fallbackMessage: string
  ) {
    if (!isOnline) {
      setActionError("You are offline. Reconnect to sync goal updates.");
      return null;
    }

    setPendingGoalId(goalId);
    setActionError("");

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseError(response, fallbackMessage);
        setActionError(message);
        return null;
      }

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        goal?: GoalView;
      } | null;
      if (!data?.ok || !data.goal) {
        setActionError(fallbackMessage);
        return null;
      }

      upsertGoal(data.goal);
      return data.goal;
    } catch {
      setActionError(fallbackMessage);
      return null;
    } finally {
      setPendingGoalId(null);
    }
  }

  async function logGoalResult(goal: GoalView) {
    const draft = resultDrafts[goal.id]?.trim() ?? "";
    if (!draft) return;
    if (goal.primaryAction.kind !== "log_result") return;

    const inputKind = goal.primaryAction.inputKind;
    const payload: Record<string, unknown> = { action: "log_result" };

    if (inputKind === "time_seconds") {
      const parsed = parseTimeInput(draft);
      if (!parsed) {
        setActionError("Use seconds (e.g. 585) or mm:ss (e.g. 9:45) for timed goals.");
        return;
      }
      payload.timeSeconds = parsed;
    } else if (inputKind === "distance_m") {
      const parsed = Number(draft);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setActionError("Enter a valid distance in meters.");
        return;
      }
      payload.distanceM = parsed;
    } else {
      const parsed = Number(draft);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setActionError("Enter a valid count value.");
        return;
      }
      payload.count = parsed;
    }

    const updated = await patchGoal(goal.id, payload, "Could not log this goal result right now.");
    if (updated) {
      setResultDrafts((prev) => ({ ...prev, [goal.id]: "" }));
    }
  }

  function getInputLabel(action: LogResultAction) {
    if (action.inputKind === "time_seconds") return "Result (seconds or mm:ss)";
    if (action.inputKind === "distance_m") return "Result (meters)";
    return "Result (count)";
  }

  function getInputPlaceholder(action: LogResultAction) {
    if (action.inputKind === "time_seconds") return "e.g. 585 or 9:45";
    if (action.inputKind === "distance_m") return "e.g. 800";
    return "e.g. 4";
  }

  return (
    <div
      className="space-y-8"
      data-testid="goals-hub"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Turn goals into next-session work
            </h2>
            <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
              Goals stay long-term. Use Focus & Notes to turn one goal into the next training
              priority or a poolside observation without re-entering the same context.
            </p>
          </div>
          <Link
            href="/my-library/training"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
          >
            Open focus & notes
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Active</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeGoalCount}/{activeLimit}
          </p>
          <p className="mt-1 text-xs text-slate-600">Focused goals in progress.</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Achieved</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{achievedGoalCount}</p>
          <p className="mt-1 text-xs text-slate-600">Milestones already reached.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sync</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {isOnline ? "Online and syncing" : "Offline mode"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {isOnline
              ? "Goal changes save to your account immediately."
              : "Changes pause until your connection returns."}
          </p>
        </article>
      </div>

      {!isOnline ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are offline. You can still browse goals, but create/update actions are paused.
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p>{actionError}</p>
          <button
            type="button"
            onClick={refreshGoals}
            disabled={isRefreshing}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Retrying…" : "Retry"}
          </button>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Start from a template</h2>
          <p className="text-xs text-slate-600">
            {canCreateGoal
              ? `You can add ${Math.max(0, activeLimit - activeGoalCount)} more active goal(s).`
              : "You reached the active goal limit. Archive one to add a new goal."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const isAlreadyActive = activeTemplateTitleSet.has(template.title);
            const isDisabled =
              !canCreateGoal || isAlreadyActive || pendingTemplateId === template.id;

            return (
              <article
                key={template.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <h3 className="text-base font-semibold text-slate-900">{template.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{template.summary}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Target: {getTemplateTargetCopy(template)}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => createTemplateGoal(template.id)}
                    disabled={isDisabled}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingTemplateId === template.id
                      ? "Adding…"
                      : isAlreadyActive
                        ? "Already active"
                        : "Use template"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Create a custom goal</h2>
        <p className="mt-1 text-sm text-slate-600">
          Define your own target with strict units so progress stays measurable.
        </p>

        <form onSubmit={createCustomGoal} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-600"
              htmlFor="goal-title"
            >
              Goal title
            </label>
            <input
              id="goal-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Example: Swim 800m continuous with calm breathing"
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              maxLength={80}
              required
            />
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-600"
              htmlFor="goal-metric"
            >
              Target type
            </label>
            <select
              id="goal-metric"
              value={customMetric}
              onChange={(e) => setCustomMetric(e.target.value as typeof customMetric)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="distance_time">Distance + time</option>
              <option value="distance_continuous">Distance (continuous)</option>
              <option value="count">Count target</option>
            </select>
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-600"
              htmlFor="goal-target-date"
            >
              Target date (optional)
            </label>
            <input
              id="goal-target-date"
              type="date"
              value={customTargetDate}
              onChange={(e) => setCustomTargetDate(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {customMetric === "distance_time" ? (
            <>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  htmlFor="goal-distance"
                >
                  Distance (meters)
                </label>
                <input
                  id="goal-distance"
                  value={customDistanceM}
                  onChange={(e) => setCustomDistanceM(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  htmlFor="goal-time"
                >
                  Target time (seconds or mm:ss)
                </label>
                <input
                  id="goal-time"
                  value={customTimeSeconds}
                  onChange={(e) => setCustomTimeSeconds(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </>
          ) : null}

          {customMetric === "distance_continuous" ? (
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                htmlFor="goal-distance-only"
              >
                Distance (meters)
              </label>
              <input
                id="goal-distance-only"
                value={customDistanceM}
                onChange={(e) => setCustomDistanceM(e.target.value)}
                inputMode="numeric"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ) : null}

          {customMetric === "count" ? (
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                htmlFor="goal-count"
              >
                Target count
              </label>
              <input
                id="goal-count"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                inputMode="numeric"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isCreatingCustom || !canCreateGoal}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingCustom ? "Creating…" : "Create custom goal"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Your goals</h2>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
            <p className="text-sm text-slate-700">
              No goals yet. Pick a template above or create your own target to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <article
                key={goal.id}
                data-testid={`goal-card-${goal.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{goal.title}</h3>
                      <span
                        className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold ${getGoalStatusBadgeClass(goal.statusTone)}`}
                      >
                        {goal.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{goal.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Target date:{" "}
                      <span className="font-medium text-slate-700">
                        {formatGoalDate(goal.targetDate)}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Progress
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {goal.progressPercent}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">{goal.progressLabel}</p>

                {goal.showCelebration ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Goal achieved. Nice work.
                    <button
                      type="button"
                      onClick={() => {
                        void patchGoal(
                          goal.id,
                          { action: "mark_celebrated" },
                          "Could not update celebration state right now."
                        );
                      }}
                      disabled={pendingGoalId === goal.id}
                      className="ml-2 inline-flex h-7 items-center justify-center rounded-md border border-emerald-300 bg-white px-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-end gap-2">
                  {goal.status !== "archived" ? (
                    <>
                      <Link
                        href={`/my-library/training?goalId=${encodeURIComponent(goal.id)}&intent=focus`}
                        data-testid={`goal-use-focus-${goal.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                      >
                        Use as focus
                      </Link>
                      <Link
                        href={`/my-library/training?goalId=${encodeURIComponent(goal.id)}&intent=note`}
                        data-testid={`goal-use-note-${goal.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        Add note
                      </Link>
                    </>
                  ) : null}

                  {goal.primaryAction.kind === "link" ? (
                    <Link
                      href={goal.primaryAction.href}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      {goal.primaryAction.label}
                    </Link>
                  ) : (
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <label
                          htmlFor={`goal-result-${goal.id}`}
                          className="text-xs text-slate-600"
                        >
                          {getInputLabel(goal.primaryAction)}
                        </label>
                        <input
                          id={`goal-result-${goal.id}`}
                          value={resultDrafts[goal.id] ?? ""}
                          onChange={(e) =>
                            setResultDrafts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                          }
                          className="mt-1 h-9 w-[170px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          placeholder={getInputPlaceholder(goal.primaryAction)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void logGoalResult(goal);
                        }}
                        disabled={pendingGoalId === goal.id}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingGoalId === goal.id ? "Saving…" : goal.primaryAction.label}
                      </button>
                    </div>
                  )}

                  {goal.status === "archived" ? (
                    <button
                      type="button"
                      onClick={() => {
                        void patchGoal(
                          goal.id,
                          { action: "restore" },
                          "Could not restore goal right now."
                        );
                      }}
                      disabled={pendingGoalId === goal.id}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        void patchGoal(
                          goal.id,
                          { action: "archive" },
                          "Could not archive goal right now."
                        );
                      }}
                      disabled={pendingGoalId === goal.id}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Need help reaching your goals faster? Let us help you set up a training schedule.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Share your current level, available training days, and target timeline. We will reply with
          a focused plan.
        </p>
        <div className="mt-4">
          <Link
            href="/contact?source=goals_coaching"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
          >
            Request coaching schedule
          </Link>
        </div>
      </section>
    </div>
  );
}
