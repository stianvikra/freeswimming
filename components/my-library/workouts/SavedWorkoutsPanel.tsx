"use client";

import Link from "next/link";
import { ChevronUp, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui/cx";
import PoolsideNotePanel from "@/components/my-library/workouts/PoolsideNotePanel";
import { SessionStepViewSections } from "@/components/my-library/workouts/SessionStepSurfaceRenderer";
import type {
  SessionStepViewSection,
  SessionStepViewSectionLine,
} from "@/components/my-library/workouts/sessionStepSurfaceContract";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  formatDistanceMetersLabel,
  getSessionStepCategoryLabel,
  resolveSessionDraftPoolLengthUnit,
  type SessionDraftStep,
} from "@/lib/session-generator-v1/shared";
import { buildWorkoutPoolsidePreviewHref } from "@/lib/workouts/poolside-preview";
import type { WorkoutPoolsideFocusOption, WorkoutSummary } from "@/lib/workouts/shared";

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
  trainingFocusOptions?: WorkoutPoolsideFocusOption[];
  swimmerName?: string | null;
};

const actionBaseClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryActionClass = cx("fs-cta-secondary", actionBaseClass, "hover:bg-white");
const quietActionClass = cx(
  actionBaseClass,
  "border border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-ink)] hover:bg-white"
);
const mutedActionClass = cx(
  actionBaseClass,
  "border border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-muted)] hover:bg-white"
);
const poolsideActionClass = cx(
  actionBaseClass,
  "border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)] hover:bg-white"
);
const dangerActionClass = cx(
  actionBaseClass,
  "border border-rose-200 bg-white/80 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-400"
);
const dangerPrimaryActionClass = cx(
  actionBaseClass,
  "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus-visible:ring-rose-400"
);
const iconActionClass =
  "inline-flex min-h-10 w-10 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:hidden";
const inlinePanelClass =
  "mt-3 rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-white/80 p-4";
const warningPanelClass =
  "mt-3 rounded-[var(--fs-radius-card)] border border-rose-200 bg-rose-50/80 p-3";

function inferQuickPreviewCategory(title: string | null | undefined): SessionDraftStep["category"] {
  const normalizedTitle = title?.trim().toLowerCase() ?? "";

  return (
    SESSION_DRAFT_STEP_CATEGORIES.find(
      (category) => getSessionStepCategoryLabel(category).toLowerCase() === normalizedTitle
    ) ?? "main"
  );
}

function buildQuickPreviewRowsFromPreviewText(
  workout: WorkoutSummary
): SessionStepViewSectionLine[] {
  if (!workout.previewText) {
    return [];
  }

  return workout.previewText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^Total:/i.test(line))
    .map((line, index) => {
      const setRestIndex = line.indexOf(" · Set rest ");
      if (setRestIndex >= 0) {
        return {
          key: `${workout.id}-preview-${index}`,
          primaryText: line.slice(0, setRestIndex).trim(),
          secondaryText: line.slice(setRestIndex + 3).trim(),
        };
      }

      return {
        key: `${workout.id}-preview-${index}`,
        primaryText: line,
        secondaryText: null,
      };
    });
}

function buildQuickPreviewSections(workout: WorkoutSummary): SessionStepViewSection[] {
  if (workout.previewSections && workout.previewSections.length > 0) {
    return workout.previewSections.map((section, sectionIndex) => ({
      key: section.key || `${workout.id}-preview-section-${sectionIndex}`,
      title: section.title,
      category: section.category ?? inferQuickPreviewCategory(section.title),
      lines: section.rows.map((lineItem, lineIndex) => ({
        key: `${section.key || `${workout.id}-preview-section-${sectionIndex}`}-line-${lineIndex}`,
        primaryText: lineItem.text,
        secondaryText: lineItem.secondaryText ?? null,
      })),
    }));
  }

  if (workout.previewLineItems && workout.previewLineItems.length > 0) {
    return [
      {
        key: `${workout.id}-preview-section-0`,
        title: "Workout",
        category: "main",
        lines: workout.previewLineItems.map((lineItem, index) => ({
          key: `${workout.id}-preview-${index}`,
          primaryText: lineItem.text,
          secondaryText: lineItem.secondaryText ?? null,
        })),
      },
    ];
  }

  const fallbackRows = buildQuickPreviewRowsFromPreviewText(workout);
  return fallbackRows.length > 0
    ? [
        {
          key: `${workout.id}-preview-section-0`,
          title: "Workout",
          category: "main",
          lines: fallbackRows,
        },
      ]
    : [];
}

export default function SavedWorkoutsPanel({
  workouts,
  description,
  workoutHrefBuilder,
  workoutPdfHrefBuilder = null,
  workoutPoolsidePdfHrefBuilder = null,
  collapsedByDefault = true,
  testId = "session-generator-recent-workouts",
  heading = "My Swim Sessions",
  editLabel = "Open",
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
  trainingFocusOptions = [],
  swimmerName = null,
}: Props) {
  const [expanded, setExpanded] = useState(() => !collapsedByDefault);
  const [previewWorkoutId, setPreviewWorkoutId] = useState<string | null>(null);
  const [poolsideWorkoutId, setPoolsideWorkoutId] = useState<string | null>(null);
  const [mobileActionsWorkoutId, setMobileActionsWorkoutId] = useState<string | null>(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(() => initialVisibleCount == null);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);
  const [selectedPoolsideFocusIds, setSelectedPoolsideFocusIds] = useState<string[]>(() =>
    trainingFocusOptions.map((focus) => focus.id)
  );
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
      setPoolsideWorkoutId(null);
      setMobileActionsWorkoutId(null);
    }
  }, [pendingDeleteWorkoutId]);

  useEffect(() => {
    if (previewWorkoutId && !workouts.some((workout) => workout.id === previewWorkoutId)) {
      setPreviewWorkoutId(null);
    }
  }, [previewWorkoutId, workouts]);

  useEffect(() => {
    if (poolsideWorkoutId && !workouts.some((workout) => workout.id === poolsideWorkoutId)) {
      setPoolsideWorkoutId(null);
    }
  }, [poolsideWorkoutId, workouts]);

  useEffect(() => {
    if (
      mobileActionsWorkoutId &&
      !workouts.some((workout) => workout.id === mobileActionsWorkoutId)
    ) {
      setMobileActionsWorkoutId(null);
    }
  }, [mobileActionsWorkoutId, workouts]);

  useEffect(() => {
    setSelectedWorkoutIds((current) =>
      current.filter((workoutId) => workouts.some((workout) => workout.id === workoutId))
    );
  }, [workouts]);

  useEffect(() => {
    const availableFocusIds = trainingFocusOptions.map((focus) => focus.id);
    setSelectedPoolsideFocusIds((current) => {
      const filtered = current.filter((focusId) => availableFocusIds.includes(focusId));
      if (filtered.length > 0 || availableFocusIds.length === 0) {
        return filtered;
      }
      return availableFocusIds;
    });
  }, [trainingFocusOptions]);

  useEffect(() => {
    if (bulkSelectionMode) {
      setPreviewWorkoutId(null);
      setPoolsideWorkoutId(null);
      setMobileActionsWorkoutId(null);
    }
  }, [bulkSelectionMode]);

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

  function toggleWorkoutSelection(workoutId: string) {
    setSelectedWorkoutIds((current) =>
      current.includes(workoutId)
        ? current.filter((selectedWorkoutId) => selectedWorkoutId !== workoutId)
        : [...current, workoutId]
    );
  }

  return (
    <div data-testid={testId} className="fs-library-card fs-library-card-muted p-4">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{heading}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
            <p className="mt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {workouts.length} saved session{workouts.length === 1 ? "" : "s"}
            </p>
          </div>
          {showToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              data-testid={`${testId}-toggle`}
              className={secondaryActionClass}
            >
              {expanded ? "Hide swim sessions" : "Show swim sessions"}
            </button>
          ) : null}
        </div>
      ) : null}

      {!showToggle || expanded ? (
        <div className={`${showHeader ? "mt-4" : ""} grid gap-3`}>
          {showBulkToolbar ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-soft)] bg-white/80 px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Library cleanup</p>
                {bulkSelectionMode ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedWorkoutIds.length} selected
                  </p>
                ) : null}
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
                    className={secondaryActionClass}
                  >
                    Select sessions
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkoutIds(workouts.map((workout) => workout.id))}
                      className={quietActionClass}
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
                      className={quietActionClass}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingBulkDelete(true)}
                      disabled={selectedWorkoutIds.length === 0 || bulkDeleting}
                      data-testid={`${testId}-bulk-delete`}
                      className={dangerActionClass}
                    >
                      {bulkDeleting ? "Deleting..." : "Delete selected sessions"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {showBulkToolbar && bulkSelectionMode && pendingBulkDelete ? (
            <div className="rounded-[var(--fs-radius-card)] border border-rose-200 bg-rose-50/80 p-3">
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
                  className={dangerPrimaryActionClass}
                >
                  {bulkDeleting ? "Deleting..." : "Delete selected sessions"}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingBulkDelete(false)}
                  disabled={bulkDeleting}
                  className={dangerActionClass}
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
            const poolsideOpen = poolsideWorkoutId === workout.id;
            const isSelected = selectedWorkoutIds.includes(workout.id);
            const quickPreviewSections = buildQuickPreviewSections(workout);
            const totalDistanceQuickLabel = workout.totalDistanceM
              ? workout.environment === "pool"
                ? formatDistanceMetersLabel(
                    workout.totalDistanceM,
                    resolveSessionDraftPoolLengthUnit(workout.poolLengthUnit)
                  )
                : `${workout.totalDistanceM}m`
              : null;
            const workoutPoolsidePreviewHref = workoutPoolsidePdfHref
              ? buildWorkoutPoolsidePreviewHref(workoutPoolsidePdfHref, {
                  selectedFocusIds: selectedPoolsideFocusIds,
                })
              : null;
            const hasQuickView =
              showInlinePreview && (quickPreviewSections.length > 0 || totalDistanceQuickLabel);
            const hasDeleteAction =
              !isCurrentWorkout && typeof onRequestDeleteWorkout === "function";
            const hasSecondaryActions = Boolean(
              hasQuickView || workoutPdfHref || workoutPoolsidePdfHref || hasDeleteAction
            );
            const hasMobileActions = Boolean(!isCurrentWorkout || hasSecondaryActions);
            const mobileActionsOpen = mobileActionsWorkoutId === workout.id;
            const cardClasses = bulkSelectionMode
              ? isSelected
                ? "border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] ring-1 ring-[color:var(--fs-border-brand)]"
                : "bg-white/90"
              : "bg-white/90";

            return (
              <div
                key={workout.id}
                data-testid={`saved-workout-card-${workout.id}`}
                data-selected={bulkSelectionMode ? String(isSelected) : undefined}
                className={cx("fs-library-card p-3 transition", cardClasses)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {bulkSelectionMode ? (
                      <label
                        data-testid={`saved-workout-selection-hit-area-${workout.id}`}
                        className={`flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[var(--fs-radius-control)] px-2 py-2 transition ${
                          isSelected ? "bg-white/80" : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Select ${workout.title}`}
                          checked={isSelected}
                          onChange={() => toggleWorkoutSelection(workout.id)}
                          data-testid={`saved-workout-select-${workout.id}`}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                        />
                        <span className="min-w-0 text-sm font-semibold text-slate-900">
                          {workout.title}
                        </span>
                      </label>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{workout.title}</p>
                    )}
                  </div>
                  {!bulkSelectionMode ? (
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      {!isCurrentWorkout ? (
                        <Link
                          href={workoutHrefBuilder(workout.id)}
                          data-testid={editButtonTestIdBuilder(workout.id)}
                          className={cx(secondaryActionClass, "hidden sm:inline-flex")}
                        >
                          {editLabel}
                        </Link>
                      ) : null}
                      {hasMobileActions ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMobileActionsWorkoutId((current) =>
                              current === workout.id ? null : workout.id
                            )
                          }
                          aria-expanded={mobileActionsOpen}
                          aria-controls={`saved-workout-mobile-actions-panel-${workout.id}`}
                          aria-label={mobileActionsOpen ? "Hide actions" : "More actions"}
                          data-testid={`saved-workout-mobile-actions-toggle-${workout.id}`}
                          className={iconActionClass}
                        >
                          {mobileActionsOpen ? (
                            <ChevronUp aria-hidden="true" className="size-4" />
                          ) : (
                            <Ellipsis aria-hidden="true" className="size-5" />
                          )}
                        </button>
                      ) : null}
                      <div className="hidden flex-wrap items-center gap-2 sm:flex">
                        {hasQuickView ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPoolsideWorkoutId(null);
                              setPreviewWorkoutId((current) =>
                                current === workout.id ? null : workout.id
                              );
                            }}
                            data-testid={viewButtonTestIdBuilder(workout.id)}
                            className={quietActionClass}
                          >
                            {previewOpen ? "Hide" : "Quick View"}
                          </button>
                        ) : null}
                        {workoutPdfHref ? (
                          <Link
                            href={workoutPdfHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={printButtonTestIdBuilder(workout.id)}
                            className={mutedActionClass}
                          >
                            View PDF
                          </Link>
                        ) : null}
                        {workoutPoolsidePdfHref ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewWorkoutId(null);
                              setPoolsideWorkoutId((current) =>
                                current === workout.id ? null : workout.id
                              );
                            }}
                            data-testid={poolsidePdfButtonTestIdBuilder(workout.id)}
                            className={poolsideActionClass}
                          >
                            {poolsideOpen ? "Hide Poolside" : "Poolside Note"}
                          </button>
                        ) : null}
                        {hasDeleteAction ? (
                          <button
                            type="button"
                            onClick={() => onRequestDeleteWorkout?.(workout)}
                            disabled={deleting}
                            data-testid={deleteButtonTestIdBuilder(workout.id)}
                            className={dangerActionClass}
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                {!bulkSelectionMode && mobileActionsOpen ? (
                  <div
                    id={`saved-workout-mobile-actions-panel-${workout.id}`}
                    data-testid={`saved-workout-mobile-actions-panel-${workout.id}`}
                    className="mt-3 grid gap-2 sm:hidden"
                  >
                    {!isCurrentWorkout ? (
                      <Link
                        href={workoutHrefBuilder(workout.id)}
                        data-testid={`saved-workout-mobile-open-${workout.id}`}
                        className={secondaryActionClass}
                      >
                        {editLabel}
                      </Link>
                    ) : null}
                    {hasQuickView ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPoolsideWorkoutId(null);
                          setPreviewWorkoutId((current) =>
                            current === workout.id ? null : workout.id
                          );
                        }}
                        data-testid={viewButtonTestIdBuilder(workout.id)}
                        className={quietActionClass}
                      >
                        {previewOpen ? "Hide quick view" : "Quick View"}
                      </button>
                    ) : null}
                    {workoutPdfHref ? (
                      <Link
                        href={workoutPdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={printButtonTestIdBuilder(workout.id)}
                        className={mutedActionClass}
                      >
                        View PDF
                      </Link>
                    ) : null}
                    {workoutPoolsidePdfHref ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewWorkoutId(null);
                          setPoolsideWorkoutId((current) =>
                            current === workout.id ? null : workout.id
                          );
                        }}
                        data-testid={poolsidePdfButtonTestIdBuilder(workout.id)}
                        className={poolsideActionClass}
                      >
                        {poolsideOpen ? "Hide Poolside" : "Poolside Note"}
                      </button>
                    ) : null}
                    {hasDeleteAction ? (
                      <button
                        type="button"
                        onClick={() => onRequestDeleteWorkout?.(workout)}
                        disabled={deleting}
                        data-testid={deleteButtonTestIdBuilder(workout.id)}
                        className={dangerActionClass}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {previewOpen && (quickPreviewSections.length > 0 || totalDistanceQuickLabel) ? (
                  <div data-testid={previewTestIdBuilder(workout.id)} className={inlinePanelClass}>
                    <div className="space-y-3">
                      <SessionStepViewSections
                        sections={quickPreviewSections}
                        sectionTestIdPrefix={`saved-workouts-preview-section-${workout.id}`}
                      />
                    </div>
                    {totalDistanceQuickLabel ? (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/90 px-3 py-3">
                        <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                          Total
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {totalDistanceQuickLabel}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {poolsideOpen && workoutPoolsidePreviewHref ? (
                  <PoolsideNotePanel
                    className="mt-3 rounded-[var(--fs-radius-card)] border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] p-4 sm:p-5"
                    testIdPrefix={`saved-workout-poolside-${workout.id}`}
                    swimmerName={swimmerName}
                    focusOptions={trainingFocusOptions}
                    selectedFocusIds={selectedPoolsideFocusIds}
                    onToggleFocus={(focusId) =>
                      setSelectedPoolsideFocusIds((current) =>
                        current.includes(focusId)
                          ? current.filter((currentId) => currentId !== focusId)
                          : [...current, focusId]
                      )
                    }
                    actionSlot={
                      <Link
                        href={workoutPoolsidePreviewHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`saved-workout-poolside-${workout.id}-print-preview`}
                        className={poolsideActionClass}
                      >
                        Print Preview
                      </Link>
                    }
                  />
                ) : null}

                {pendingDelete ? (
                  <div className={warningPanelClass}>
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
                        className={dangerPrimaryActionClass}
                      >
                        {deleting ? "Deleting..." : "Delete saved session"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelDeleteWorkout?.()}
                        disabled={deleting}
                        className={dangerActionClass}
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
              className={cx(quietActionClass, "self-start")}
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
