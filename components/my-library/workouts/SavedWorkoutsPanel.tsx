"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionTypeLabel } from "@/lib/session-generator-v1/shared";
import type { WorkoutSummary } from "@/lib/workouts/shared";

type Props = {
  workouts: WorkoutSummary[];
  description: string;
  workoutHrefBuilder: (workoutId: string) => string;
  collapsedByDefault?: boolean;
  testId?: string;
  heading?: string;
  editLabel?: string;
  editButtonTestIdBuilder?: (workoutId: string) => string;
  deleteButtonTestIdBuilder?: (workoutId: string) => string;
  confirmDeleteButtonTestIdBuilder?: (workoutId: string) => string;
  onRequestDeleteWorkout?: ((workout: WorkoutSummary) => void) | null;
  onCancelDeleteWorkout?: (() => void) | null;
  onConfirmDeleteWorkout?: ((workout: WorkoutSummary) => void) | null;
  pendingDeleteWorkoutId?: string | null;
  deletingWorkoutId?: string | null;
  currentWorkoutId?: string | null;
  onOpenCurrentWorkoutPdf?: (() => void) | null;
  printButtonTestIdBuilder?: (workoutId: string) => string;
};

export default function SavedWorkoutsPanel({
  workouts,
  description,
  workoutHrefBuilder,
  collapsedByDefault = true,
  testId = "session-generator-recent-workouts",
  heading = "Saved workouts",
  editLabel = "Edit",
  editButtonTestIdBuilder = (workoutId) => `saved-workouts-edit-${workoutId}`,
  deleteButtonTestIdBuilder = (workoutId) => `saved-workouts-delete-${workoutId}`,
  confirmDeleteButtonTestIdBuilder = (workoutId) => `saved-workouts-confirm-delete-${workoutId}`,
  onRequestDeleteWorkout = null,
  onCancelDeleteWorkout = null,
  onConfirmDeleteWorkout = null,
  pendingDeleteWorkoutId = null,
  deletingWorkoutId = null,
  currentWorkoutId = null,
  onOpenCurrentWorkoutPdf = null,
  printButtonTestIdBuilder = (workoutId) => `saved-workouts-print-${workoutId}`,
}: Props) {
  const [expanded, setExpanded] = useState(() => !collapsedByDefault);

  useEffect(() => {
    if (pendingDeleteWorkoutId) {
      setExpanded(true);
    }
  }, [pendingDeleteWorkoutId]);

  if (workouts.length === 0) {
    return null;
  }

  return (
    <div data-testid={testId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {workouts.length} saved workout{workouts.length === 1 ? "" : "s"} ready for review
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          data-testid={`${testId}-toggle`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          {expanded ? "Collapse workouts" : "Show workouts"}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-3">
          {workouts.map((workout) => {
            const deleting = deletingWorkoutId === workout.id;
            const pendingDelete = pendingDeleteWorkoutId === workout.id;
            const canPrintCurrentWorkout =
              currentWorkoutId === workout.id && typeof onOpenCurrentWorkoutPdf === "function";

            return (
              <div
                key={workout.id}
                data-testid={`saved-workout-card-${workout.id}`}
                className="rounded-2xl border border-white/80 bg-white p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{workout.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {workout.totalDistanceM ? `${workout.totalDistanceM}m` : null}
                      {workout.totalDistanceM && workout.estimatedDurationMin ? " · " : null}
                      {workout.estimatedDurationMin ? `~${workout.estimatedDurationMin} min` : null}
                      {workout.totalDistanceM || workout.estimatedDurationMin ? " · " : null}
                      {getSessionTypeLabel(workout.sessionType)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={workoutHrefBuilder(workout.id)}
                      data-testid={editButtonTestIdBuilder(workout.id)}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      {editLabel}
                    </Link>
                    {canPrintCurrentWorkout ? (
                      <button
                        type="button"
                        onClick={() => onOpenCurrentWorkoutPdf?.()}
                        data-testid={printButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-50 active:bg-amber-100"
                      >
                        Poolside PDF
                      </button>
                    ) : null}
                    {typeof onRequestDeleteWorkout === "function" ? (
                      <button
                        type="button"
                        onClick={() => onRequestDeleteWorkout(workout)}
                        disabled={deleting}
                        data-testid={deleteButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {pendingDelete ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3">
                    <p className="text-sm font-medium text-rose-900">
                      Delete this saved workout from My Library?
                    </p>
                    <p className="mt-1 text-sm text-rose-900/90">
                      This removes the canonical workout and any unsaved local edits in this open
                      builder view.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onConfirmDeleteWorkout?.(workout)}
                        disabled={deleting}
                        data-testid={confirmDeleteButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Delete workout"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelDeleteWorkout?.()}
                        disabled={deleting}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
