"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
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
type GoalFilter = "all" | "active" | "achieved" | "archived";
type AddGoalMode = "template" | "custom";

type ApiError = {
  ok?: boolean;
  error?: string;
};

const ACTIVE_STATUSES = new Set<GoalView["status"]>(["active", "on_track", "at_risk"]);

function isActiveStatus(status: GoalView["status"]) {
  return ACTIVE_STATUSES.has(status);
}

function matchesGoalFilter(goal: GoalView, filter: GoalFilter) {
  if (filter === "active") return isActiveStatus(goal.status);
  if (filter === "achieved") return goal.status === "achieved";
  if (filter === "archived") return goal.status === "archived";
  return true;
}

function getDefaultGoalFilter(goals: GoalView[]): GoalFilter {
  if (goals.some((goal) => isActiveStatus(goal.status))) return "active";
  if (goals.some((goal) => goal.status === "achieved")) return "achieved";
  return "all";
}

function orderGoals(goals: GoalView[]) {
  return [
    ...goals.filter((goal) => isActiveStatus(goal.status)),
    ...goals.filter((goal) => goal.status === "achieved"),
    ...goals.filter((goal) => goal.status === "archived"),
  ];
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

type GoalsFeedbackTone = "warning" | "error" | "success" | "empty";

const goalsFeedbackToneClass: Record<GoalsFeedbackTone, string> = {
  warning: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
  error: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
  success: "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700",
  empty:
    "rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-700",
};

function GoalsFeedback({
  tone,
  children,
  action,
  testId,
}: {
  tone: GoalsFeedbackTone;
  children: ReactNode;
  action?: ReactNode;
  testId?: string;
}) {
  const isError = tone === "error";
  const isStaticEmpty = tone === "empty";

  return (
    <div
      className={goalsFeedbackToneClass[tone]}
      data-feedback-tone={tone}
      data-testid={testId}
      role={isStaticEmpty ? undefined : isError ? "alert" : "status"}
      aria-live={isStaticEmpty ? undefined : isError ? "assertive" : "polite"}
    >
      {children}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default function GoalsHub({ initialGoals, templates, activeLimit }: Props) {
  const [goals, setGoals] = useState<GoalView[]>(initialGoals);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [clientReady, setClientReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<GoalFilter>(() =>
    getDefaultGoalFilter(initialGoals)
  );
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(initialGoals.length === 0);
  const [addGoalMode, setAddGoalMode] = useState<AddGoalMode>("template");
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);

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
  const archivedGoalCount = useMemo(
    () => goals.filter((goal) => goal.status === "archived").length,
    [goals]
  );
  const totalGoalCount = goals.length;
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
  const orderedGoals = useMemo(() => orderGoals(goals), [goals]);
  const filteredGoals = useMemo(
    () => orderedGoals.filter((goal) => matchesGoalFilter(goal, activeFilter)),
    [orderedGoals, activeFilter]
  );

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  async function refreshGoals() {
    setIsRefreshing(true);
    setActionError("");
    setActionNotice("");

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
      setActionNotice("Goals refreshed.");
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
      setActionNotice("");
      return;
    }

    setPendingTemplateId(templateId);
    setActionError("");
    setActionNotice("");

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
      setActionNotice("Goal added from template.");
      setIsAddGoalOpen(false);
      setActiveFilter("active");
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
      setActionNotice("");
      return;
    }

    setIsCreatingCustom(true);
    setActionError("");
    setActionNotice("");

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
      setActionNotice("Custom goal created.");
      setIsAddGoalOpen(false);
      setActiveFilter("active");
    } catch {
      setActionError("Could not create custom goal right now.");
    } finally {
      setIsCreatingCustom(false);
    }
  }

  async function patchGoal(
    goalId: string,
    payload: Record<string, unknown>,
    fallbackMessage: string,
    successMessage?: string
  ) {
    if (!isOnline) {
      setActionError("You are offline. Reconnect to sync goal updates.");
      setActionNotice("");
      return null;
    }

    setPendingGoalId(goalId);
    setActionError("");
    setActionNotice("");

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
      if (successMessage) {
        setActionNotice(successMessage);
      }
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

    const updated = await patchGoal(
      goal.id,
      payload,
      "Could not log this goal result right now.",
      "Result saved."
    );
    if (updated) {
      setResultDrafts((prev) => ({ ...prev, [goal.id]: "" }));
    }
  }

  async function clearGoalResult(goal: GoalView) {
    const updated = await patchGoal(
      goal.id,
      { action: "reset_result" },
      "Could not clear this best result right now.",
      "Best result cleared."
    );

    if (updated) {
      setResultDrafts((prev) => ({ ...prev, [goal.id]: "" }));
      setActiveFilter("active");
    }
  }

  function handleSelectFilter(filter: GoalFilter) {
    setActiveFilter(filter);
    setActionError("");
    setActionNotice("");
  }

  function toggleGoalDetails(goalId: string) {
    setExpandedGoalIds((current) =>
      current.includes(goalId)
        ? current.filter((candidate) => candidate !== goalId)
        : [...current, goalId]
    );
  }

  const filterHeading =
    activeFilter === "active"
      ? "Current goals"
      : activeFilter === "achieved"
        ? "Achieved goals"
        : activeFilter === "archived"
          ? "Archived goals"
          : "All goals";

  const filterDescription =
    activeFilter === "active"
      ? "Work on the goals that are still open."
      : activeFilter === "achieved"
        ? "Review goals you already reached."
        : activeFilter === "archived"
          ? "Restore older goals when they matter again."
          : "Current work first, then achieved and archived goals.";

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
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your goals</h2>
            <p className="mt-1 text-sm text-slate-600">
              {activeGoalCount}/{activeLimit} active · {achievedGoalCount} achieved ·{" "}
              {archivedGoalCount} archived
            </p>
          </div>
          <button
            type="button"
            data-testid="goals-add-toggle"
            aria-expanded={isAddGoalOpen}
            onClick={() => {
              setIsAddGoalOpen((current) => !current);
              setActionError("");
              setActionNotice("");
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isAddGoalOpen ? "Close add goal" : "Add goal"}
          </button>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Goal filter"
          data-testid="goals-filter-control"
        >
          {[
            { key: "active", label: `Active (${activeGoalCount})` },
            { key: "achieved", label: `Achieved (${achievedGoalCount})` },
            { key: "archived", label: `Archived (${archivedGoalCount})` },
            { key: "all", label: `All (${totalGoalCount})` },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleSelectFilter(filter.key as GoalFilter)}
              data-testid={`goals-filter-${filter.key}`}
              aria-pressed={activeFilter === filter.key}
              className={[
                "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition",
                activeFilter === filter.key
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {!isOnline ? (
        <GoalsFeedback tone="warning" testId="goals-offline-feedback">
          <p>You are offline. You can still browse goals, but create/update actions are paused.</p>
        </GoalsFeedback>
      ) : null}

      {actionError ? (
        <GoalsFeedback
          tone="error"
          testId="goals-action-error"
          action={
            <button
              type="button"
              onClick={refreshGoals}
              disabled={isRefreshing}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Retrying…" : "Retry"}
            </button>
          }
        >
          <p>{actionError}</p>
        </GoalsFeedback>
      ) : null}

      {actionNotice ? (
        <GoalsFeedback tone="success" testId="goals-action-success">
          <p>{actionNotice}</p>
        </GoalsFeedback>
      ) : null}

      {isAddGoalOpen ? (
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5"
          data-testid="goals-add-panel"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add goal</h2>
              <p className="mt-1 text-sm text-slate-600">
                {canCreateGoal
                  ? `${Math.max(0, activeLimit - activeGoalCount)} active slot${
                      activeLimit - activeGoalCount === 1 ? "" : "s"
                    } open.`
                  : "Archive one active goal before adding another."}
              </p>
            </div>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[
                { key: "template", label: "Templates" },
                { key: "custom", label: "Custom" },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  aria-pressed={addGoalMode === mode.key}
                  onClick={() => setAddGoalMode(mode.key as AddGoalMode)}
                  className={[
                    "inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold transition",
                    addGoalMode === mode.key
                      ? "bg-white text-blue-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900",
                  ].join(" ")}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {addGoalMode === "template" ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {templates.map((template) => {
                const isAlreadyActive = activeTemplateTitleSet.has(template.title);
                const isDisabled =
                  !canCreateGoal || isAlreadyActive || pendingTemplateId === template.id;

                return (
                  <article
                    key={template.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <h3 className="text-base font-semibold text-slate-900">{template.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{template.summary}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Target: {getTemplateTargetCopy(template)}
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => createTemplateGoal(template.id)}
                        disabled={isDisabled}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingTemplateId === template.id
                          ? "Adding..."
                          : isAlreadyActive
                            ? "Already active"
                            : "Use template"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <form onSubmit={createCustomGoal} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                  htmlFor="goal-title"
                >
                  Goal title
                </label>
                <input
                  id="goal-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Example: Swim 800m continuous with calm breathing"
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  maxLength={80}
                  required
                />
              </div>

              <div>
                <label
                  className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                  htmlFor="goal-metric"
                >
                  Target type
                </label>
                <select
                  id="goal-metric"
                  value={customMetric}
                  onChange={(e) => setCustomMetric(e.target.value as typeof customMetric)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="distance_time">Distance + time</option>
                  <option value="distance_continuous">Distance (continuous)</option>
                  <option value="count">Count target</option>
                </select>
              </div>

              <div>
                <label
                  className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                  htmlFor="goal-target-date"
                >
                  Target date (optional)
                </label>
                <input
                  id="goal-target-date"
                  type="date"
                  value={customTargetDate}
                  onChange={(e) => setCustomTargetDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {customMetric === "distance_time" ? (
                <>
                  <div>
                    <label
                      className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                      htmlFor="goal-distance"
                    >
                      Distance (meters)
                    </label>
                    <input
                      id="goal-distance"
                      value={customDistanceM}
                      onChange={(e) => setCustomDistanceM(e.target.value)}
                      inputMode="numeric"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                      htmlFor="goal-time"
                    >
                      Target time (seconds or mm:ss)
                    </label>
                    <input
                      id="goal-time"
                      value={customTimeSeconds}
                      onChange={(e) => setCustomTimeSeconds(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              ) : null}

              {customMetric === "distance_continuous" ? (
                <div>
                  <label
                    className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                    htmlFor="goal-distance-only"
                  >
                    Distance (meters)
                  </label>
                  <input
                    id="goal-distance-only"
                    value={customDistanceM}
                    onChange={(e) => setCustomDistanceM(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ) : null}

              {customMetric === "count" ? (
                <div>
                  <label
                    className="text-xs font-semibold tracking-wide text-slate-600 uppercase"
                    htmlFor="goal-count"
                  >
                    Target count
                  </label>
                  <input
                    id="goal-count"
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    inputMode="numeric"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
          )}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{filterHeading}</h2>
            <p className="mt-1 text-sm text-slate-600">{filterDescription}</p>
          </div>
        </div>

        {goals.length === 0 ? (
          <GoalsFeedback tone="empty" testId="goals-empty-state">
            <p>No goals yet. Add a template goal or create a custom one above.</p>
          </GoalsFeedback>
        ) : filteredGoals.length === 0 ? (
          <GoalsFeedback tone="empty" testId="goals-no-results-state">
            <p>
              {activeFilter === "active"
                ? "No active goals right now. View achieved goals, restore an archived goal, or add a new one."
                : activeFilter === "achieved"
                  ? "No achieved goals yet. Keep working on current goals and come back when you want to review wins."
                  : activeFilter === "archived"
                    ? "No archived goals yet. Archive older goals only when you want them out of the current list."
                    : "No goals match this view right now."}
            </p>
          </GoalsFeedback>
        ) : (
          <div className="space-y-3">
            {filteredGoals.map((goal) => {
              const isDetailsOpen = expandedGoalIds.includes(goal.id);
              return (
                <article
                  key={goal.id}
                  data-testid={`goal-card-${goal.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{goal.title}</h3>
                        <span
                          className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold ${getGoalStatusBadgeClass(goal.statusTone)}`}
                        >
                          {goal.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{goal.progressLabel}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
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

                  {goal.showCelebration ? (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      Goal achieved. Nice work.
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    {goal.status === "archived" ? (
                      <p className="text-sm font-medium text-slate-500">Archived goal</p>
                    ) : goal.primaryAction.kind === "link" ? (
                      <Link
                        href={goal.primaryAction.href}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
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
                            className="mt-1 h-9 w-[170px] rounded-lg border border-slate-200 px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            placeholder={getInputPlaceholder(goal.primaryAction)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void logGoalResult(goal);
                          }}
                          disabled={pendingGoalId === goal.id}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingGoalId === goal.id ? "Saving…" : goal.primaryAction.label}
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      data-testid={`goal-details-toggle-${goal.id}`}
                      aria-expanded={isDetailsOpen}
                      onClick={() => toggleGoalDetails(goal.id)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Details
                      <ChevronDown
                        className={`h-4 w-4 transition ${isDetailsOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {isDetailsOpen ? (
                    <div
                      data-testid={`goal-details-${goal.id}`}
                      className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Target
                          </p>
                          <p className="mt-1 text-slate-800">{goal.summary}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Target date
                          </p>
                          <p className="mt-1 font-medium text-slate-800">
                            {formatGoalDate(goal.targetDate)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {goal.status !== "archived" ? (
                          <>
                            <Link
                              href={`/my-library/training?goalId=${encodeURIComponent(goal.id)}&intent=focus`}
                              data-testid={`goal-use-focus-${goal.id}`}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
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

                        {goal.primaryAction.kind === "log_result" && goal.progressValue > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              void clearGoalResult(goal);
                            }}
                            disabled={pendingGoalId === goal.id}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Clear best result
                          </button>
                        ) : null}

                        {goal.showCelebration ? (
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
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Dismiss achievement
                          </button>
                        ) : null}

                        {goal.status === "archived" ? (
                          <button
                            type="button"
                            onClick={() => {
                              void patchGoal(
                                goal.id,
                                { action: "restore" },
                                "Could not restore goal right now.",
                                "Goal restored."
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
                                "Could not archive goal right now.",
                                "Goal archived."
                              );
                            }}
                            disabled={pendingGoalId === goal.id}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-600">Need a training schedule around these goals?</p>
        <Link
          href="/contact?source=goals_coaching"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          Request coaching schedule
        </Link>
      </section>
    </div>
  );
}
