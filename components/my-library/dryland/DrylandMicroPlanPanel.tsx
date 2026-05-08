"use client";

import { useEffect, useId, useState } from "react";
import { getDrylandSessionKindLabel, type DrylandSessionSummary } from "@/lib/dryland/shared";
import type {
  DrylandMicroBlockStatus,
  DrylandMicroPlanApiResponse,
  DrylandMicroPlanRecord,
} from "@/lib/dryland/micro-plans";

type Props = {
  initialPlan: DrylandMicroPlanRecord | null;
  sessions: DrylandSessionSummary[];
  schemaReady: boolean;
  loadError: string | null;
};

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "This week";
  return parsed.toLocaleDateString("en-GB", {
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
      return "Not complete";
  }
}

function getBlockStatusClasses(status: DrylandMicroBlockStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "skipped":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

function getPlanStatusLabel(plan: DrylandMicroPlanRecord) {
  if (plan.status === "completed") return "Week complete";
  if (plan.status === "paused") return "Paused";
  return "Active this week";
}

export default function DrylandMicroPlanPanel({
  initialPlan,
  sessions,
  schemaReady,
  loadError,
}: Props) {
  const [plan, setPlan] = useState(initialPlan);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);
  const [isPlanStatusSaving, setIsPlanStatusSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const progressLabelId = useId();

  useEffect(() => {
    setPlan(initialPlan);
    setError("");
    setSuccess("");
    setPendingSessionId(null);
    setPendingBlockId(null);
    setIsPlanStatusSaving(false);
  }, [initialPlan]);

  async function startPlan(sessionId: string) {
    setPendingSessionId(sessionId);
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
          sourceDrylandSessionId: sessionId,
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
            : "Could not start a micro session plan right now."
        );
        return;
      }

      setPlan(responseBody.plan);
      setSuccess(
        responseBody.reusedExisting
          ? "You already have an active micro plan. Continue that one first."
          : "Micro plan started for this week."
      );
    } catch {
      setError("Could not start a micro session plan right now.");
    } finally {
      setPendingSessionId(null);
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
          : "Could not update micro session plan right now."
      );
    }

    setPlan(responseBody.plan);
    return responseBody.plan;
  }

  async function updateBlock(blockId: string, blockStatus: DrylandMicroBlockStatus) {
    setPendingBlockId(blockId);
    setError("");
    setSuccess("");

    try {
      const nextPlan = await patchPlan({ blockId, blockStatus });
      setSuccess(
        nextPlan?.status === "completed"
          ? "All micro blocks are complete for this week."
          : "Micro block updated."
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update micro session plan right now."
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
      setSuccess(planStatus === "paused" ? "Micro plan paused." : "Micro plan resumed.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update micro session plan right now."
      );
    } finally {
      setIsPlanStatusSaving(false);
    }
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
            Exercise blocks for this week
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm text-slate-700">
            Split a saved dryland session into small blocks and mark the exercise-level work you
            actually complete.
          </p>
        </div>
        {plan ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            {getPlanStatusLabel(plan)}
          </span>
        ) : null}
      </div>

      {!schemaReady ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4">
          <p className="text-sm text-amber-900">
            Micro Sessions are still syncing in this environment. Saved dryland sessions remain
            available while the micro-plan table is applied.
          </p>
        </div>
      ) : null}

      {loadError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-white p-4">
          <p className="text-sm text-rose-900">{loadError}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-white p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      {schemaReady && !plan ? (
        <div className="mt-5">
          {sessions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {sessions.slice(0, 4).map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-slate-950">{session.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {getDrylandSessionKindLabel(session.sessionKind)} · {session.exerciseCount}{" "}
                        block
                        {session.exerciseCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid={`dryland-micro-start-${session.id}`}
                      onClick={() => void startPlan(session.id)}
                      disabled={pendingSessionId !== null}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {pendingSessionId === session.id ? "Starting..." : "Start"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-900">No micro plan yet.</p>
              <p className="mt-2 text-sm text-slate-600">
                Create a dryland session first, then start a weekly micro plan from it.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {schemaReady && plan ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h4 className="text-xl font-semibold text-slate-950">{plan.title}</h4>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateLabel(plan.weekStartsAt)} to {formatDateLabel(plan.weekEndsAt)} ·
                  snapshot from {plan.sourceSessionTitle}
                </p>
              </div>
              {plan.status !== "completed" ? (
                <button
                  type="button"
                  data-testid="dryland-micro-toggle-plan-status"
                  onClick={() =>
                    void updatePlanStatus(plan.status === "paused" ? "active" : "paused")
                  }
                  disabled={isPlanStatusSaving}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlanStatusSaving
                    ? "Saving..."
                    : plan.status === "paused"
                      ? "Resume plan"
                      : "Pause plan"}
                </button>
              ) : null}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <p id={progressLabelId} className="text-sm font-semibold text-slate-900">
                  Micro session progress
                </p>
                <p className="text-sm text-slate-600">
                  {plan.progress.completedBlockCount}/{plan.progress.totalBlockCount} blocks ·{" "}
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
              {plan.progress.skippedBlockCount > 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  {plan.progress.skippedBlockCount} skipped block
                  {plan.progress.skippedBlockCount === 1 ? "" : "s"} stay visible and do not count
                  as complete.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3">
            {plan.blocks.map((block, index) => {
              const isPending = pendingBlockId === block.id;
              const isPaused = plan.status === "paused";
              return (
                <article
                  key={block.id}
                  data-testid={`dryland-micro-block-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-800">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-base font-semibold text-slate-950">{block.title}</h5>
                        <span
                          className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold tracking-wide uppercase ${getBlockStatusClasses(
                            block.status
                          )}`}
                        >
                          {getBlockStatusLabel(block.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{block.targetLabel}</p>
                      <p className="mt-2 text-sm text-slate-700">{block.coachCue}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {block.status !== "completed" ? (
                        <button
                          type="button"
                          data-testid={`dryland-micro-complete-${index}`}
                          onClick={() => void updateBlock(block.id, "completed")}
                          disabled={isPending || isPaused}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                          {isPending ? "Saving..." : "Complete"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`dryland-micro-undo-${index}`}
                          onClick={() => void updateBlock(block.id, "queued")}
                          disabled={isPending || isPaused}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPending ? "Saving..." : "Mark not complete"}
                        </button>
                      )}
                      {block.status === "queued" ? (
                        <button
                          type="button"
                          data-testid={`dryland-micro-skip-${index}`}
                          onClick={() => void updateBlock(block.id, "skipped")}
                          disabled={isPending || isPaused}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-50 active:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Skip
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {plan.status === "completed" && sessions.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-950">
                    Start another weekly plan
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    Completed plans stay as evidence. Start a new one when the next week or focus is
                    ready.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sessions.slice(0, 2).map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      data-testid={`dryland-micro-start-next-${session.id}`}
                      onClick={() => void startPlan(session.id)}
                      disabled={pendingSessionId !== null}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 active:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingSessionId === session.id ? "Starting..." : session.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
