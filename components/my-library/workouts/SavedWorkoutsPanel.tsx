"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatDistanceMetersLabel,
  getSessionTypeLabel,
  resolveSessionDraftPoolLengthUnit,
} from "@/lib/session-generator-v1/shared";
import type { WorkoutSummary } from "@/lib/workouts/shared";

type Props = {
  workouts: WorkoutSummary[];
  description?: string;
  workoutHrefBuilder: (workoutId: string) => string;
  workoutPdfHrefBuilder?: ((workoutId: string) => string) | null;
  workoutPoolsidePdfHrefBuilder?: ((workoutId: string) => string) | null;
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
  enableBulkDelete?: boolean;
  onConfirmDeleteWorkouts?: ((workouts: WorkoutSummary[]) => void) | null;
  bulkDeleting?: boolean;
  printButtonTestIdBuilder?: (workoutId: string) => string;
  poolsidePdfButtonTestIdBuilder?: (workoutId: string) => string;
  currentWorkoutId?: string | null;
  showToggle?: boolean;
  showInlinePreview?: boolean;
  viewButtonTestIdBuilder?: (workoutId: string) => string;
  previewTestIdBuilder?: (workoutId: string) => string;
  showHeader?: boolean;
  initialVisibleCount?: number | null;
};

export default function SavedWorkoutsPanel({
  workouts,
  description,
  workoutHrefBuilder,
  workoutPdfHrefBuilder = null,
  workoutPoolsidePdfHrefBuilder = null,
  collapsedByDefault = true,
  testId = "session-generator-recent-workouts",
  heading = "My Swim Sessions",
  editLabel = "Edit",
  editButtonTestIdBuilder = (workoutId) => `saved-workouts-edit-${workoutId}`,
  deleteButtonTestIdBuilder = (workoutId) => `saved-workouts-delete-${workoutId}`,
  confirmDeleteButtonTestIdBuilder = (workoutId) => `saved-workouts-confirm-delete-${workoutId}`,
  onRequestDeleteWorkout = null,
  onCancelDeleteWorkout = null,
  onConfirmDeleteWorkout = null,
  pendingDeleteWorkoutId = null,
  deletingWorkoutId = null,
  enableBulkDelete = false,
  onConfirmDeleteWorkouts = null,
  bulkDeleting = false,
  printButtonTestIdBuilder = (workoutId) => `saved-workouts-print-${workoutId}`,
  poolsidePdfButtonTestIdBuilder = (workoutId) => `saved-workouts-poolside-${workoutId}`,
  currentWorkoutId = null,
  showToggle = true,
  showInlinePreview = false,
  viewButtonTestIdBuilder = (workoutId) => `saved-workouts-view-${workoutId}`,
  previewTestIdBuilder = (workoutId) => `saved-workouts-preview-${workoutId}`,
  showHeader = true,
  initialVisibleCount = null,
}: Props) {
  const [expanded, setExpanded] = useState(() => !collapsedByDefault);
  const [previewWorkoutId, setPreviewWorkoutId] = useState<string | null>(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(() => initialVisibleCount == null);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const visibleLimit = initialVisibleCount ?? undefined;

  const hasHiddenWorkouts =
    visibleLimit != null && Number.isFinite(visibleLimit) ? workouts.length > visibleLimit : false;
  const visibleWorkouts =
    hasHiddenWorkouts && !showAllWorkouts ? workouts.slice(0, visibleLimit) : workouts;
  const hiddenWorkoutCount = hasHiddenWorkouts ? workouts.length - visibleWorkouts.length : 0;

  useEffect(() => {
    if (pendingDeleteWorkoutId) {
      setExpanded(true);
      setShowAllWorkouts(true);
      setPendingBulkDelete(false);
    }
  }, [pendingDeleteWorkoutId]);

  useEffect(() => {
    if (pendingDeleteWorkoutId) {
      setPreviewWorkoutId(null);
    }
  }, [pendingDeleteWorkoutId]);

  useEffect(() => {
    if (previewWorkoutId && !workouts.some((workout) => workout.id === previewWorkoutId)) {
      setPreviewWorkoutId(null);
    }
  }, [previewWorkoutId, workouts]);

  useEffect(() => {
    setSelectedWorkoutIds((current) =>
      current.filter((workoutId) => workouts.some((workout) => workout.id === workoutId))
    );
  }, [workouts]);

  useEffect(() => {
    if (selectedWorkoutIds.length === 0) {
      setPendingBulkDelete(false);
    }
  }, [selectedWorkoutIds.length]);

  useEffect(() => {
    if (initialVisibleCount == null) {
      setShowAllWorkouts(true);
    }
  }, [initialVisibleCount]);

  if (workouts.length === 0) {
    return null;
  }

  const selectedWorkouts = workouts.filter((workout) => selectedWorkoutIds.includes(workout.id));
  const showBulkToolbar = enableBulkDelete && typeof onConfirmDeleteWorkouts === "function";

  return (
    <div data-testid={testId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {workouts.length} saved session{workouts.length === 1 ? "" : "s"}
            </p>
          </div>
          {showToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              data-testid={`${testId}-toggle`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {expanded ? "Hide swim sessions" : "Show swim sessions"}
            </button>
          ) : null}
        </div>
      ) : null}

      {!showToggle || expanded ? (
        <div className={`${showHeader ? "mt-4" : ""} grid gap-3`}>
          {showBulkToolbar ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/80 bg-white px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Library cleanup</p>
                <p className="mt-1 text-sm text-slate-600">
                  {bulkSelectionMode
                    ? `${selectedWorkoutIds.length} selected`
                    : "Use selection mode when you want to delete multiple saved sessions at once."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!bulkSelectionMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkSelectionMode(true);
                      setPendingBulkDelete(false);
                    }}
                    data-testid={`${testId}-bulk-select-toggle`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    Select sessions
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkoutIds(workouts.map((workout) => workout.id))}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkSelectionMode(false);
                        setPendingBulkDelete(false);
                        setSelectedWorkoutIds([]);
                      }}
                      disabled={bulkDeleting}
                      data-testid={`${testId}-bulk-cancel`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingBulkDelete(true)}
                      disabled={selectedWorkoutIds.length === 0 || bulkDeleting}
                      data-testid={`${testId}-bulk-delete`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bulkDeleting ? "Deleting..." : "Delete selected"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {showBulkToolbar && bulkSelectionMode && pendingBulkDelete ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3">
              <p className="text-sm font-medium text-rose-900">
                Delete {selectedWorkoutIds.length} saved session
                {selectedWorkoutIds.length === 1 ? "" : "s"} from My Library?
              </p>
              <p className="mt-1 text-sm text-rose-900/90">
                Selected sessions are deleted permanently from this library view.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onConfirmDeleteWorkouts?.(selectedWorkouts)}
                  disabled={selectedWorkoutIds.length === 0 || bulkDeleting}
                  data-testid={`${testId}-bulk-confirm-delete`}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkDeleting ? "Deleting..." : "Delete selected sessions"}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingBulkDelete(false)}
                  disabled={bulkDeleting}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {visibleWorkouts.map((workout) => {
            const deleting = deletingWorkoutId === workout.id;
            const pendingDelete = pendingDeleteWorkoutId === workout.id;
            const workoutPdfHref = workoutPdfHrefBuilder?.(workout.id) ?? null;
            const workoutPoolsidePdfHref = workoutPoolsidePdfHrefBuilder?.(workout.id) ?? null;
            const isCurrentWorkout = currentWorkoutId === workout.id;
            const previewOpen = previewWorkoutId === workout.id;
            const isSelected = selectedWorkoutIds.includes(workout.id);
            const workoutDistanceLabel = workout.totalDistanceM
              ? workout.environment === "pool"
                ? formatDistanceMetersLabel(
                    workout.totalDistanceM,
                    resolveSessionDraftPoolLengthUnit(workout.poolLengthUnit)
                  )
                : `${workout.totalDistanceM}m`
              : null;
            const updatedLabel = new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(workout.updatedAt));

            return (
              <div
                key={workout.id}
                data-testid={`saved-workout-card-${workout.id}`}
                className="rounded-2xl border border-white/80 bg-white p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {bulkSelectionMode ? (
                      <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedWorkoutIds((current) =>
                              current.includes(workout.id)
                                ? current.filter((workoutId) => workoutId !== workout.id)
                                : [...current, workout.id]
                            )
                          }
                          data-testid={`saved-workout-select-${workout.id}`}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                        />
                        Select session
                      </label>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{workout.title}</p>
                      {isCurrentWorkout ? (
                        <span
                          data-testid={`saved-workout-current-${workout.id}`}
                          className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700"
                        >
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {[workoutDistanceLabel, getSessionTypeLabel(workout.sessionType)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Updated {updatedLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {showInlinePreview && workout.previewText ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewWorkoutId((current) =>
                            current === workout.id ? null : workout.id
                          )
                        }
                        data-testid={viewButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        {previewOpen ? "Hide" : "View"}
                      </button>
                    ) : null}
                    {!isCurrentWorkout ? (
                      <Link
                        href={workoutHrefBuilder(workout.id)}
                        data-testid={editButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        {editLabel}
                      </Link>
                    ) : null}
                    {workoutPdfHref ? (
                      <Link
                        href={workoutPdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={printButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-50 active:bg-amber-100"
                      >
                        View PDF
                      </Link>
                    ) : null}
                    {workoutPoolsidePdfHref ? (
                      <Link
                        href={workoutPoolsidePdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={poolsidePdfButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
                      >
                        Poolside Note
                      </Link>
                    ) : null}
                    {!bulkSelectionMode &&
                    !isCurrentWorkout &&
                    typeof onRequestDeleteWorkout === "function" ? (
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

                {previewOpen && workout.previewText ? (
                  <div
                    data-testid={previewTestIdBuilder(workout.id)}
                    className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Session preview
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {workout.previewText}
                    </pre>
                  </div>
                ) : null}

                {pendingDelete ? (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3">
                    <p className="text-sm font-medium text-rose-900">
                      Delete this saved session from My Library?
                    </p>
                    <p className="mt-1 text-sm text-rose-900/90">
                      Any unsaved builder edits for this session are discarded too.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onConfirmDeleteWorkout?.(workout)}
                        disabled={deleting}
                        data-testid={confirmDeleteButtonTestIdBuilder(workout.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deleting ? "Deleting..." : "Delete saved session"}
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
          {hiddenWorkoutCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAllWorkouts(true)}
              data-testid={`${testId}-load-more`}
              className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {hiddenWorkoutCount === 1
                ? "Load 1 more session"
                : `Load ${hiddenWorkoutCount} more sessions`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
