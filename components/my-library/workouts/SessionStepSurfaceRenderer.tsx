"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Ellipsis } from "lucide-react";
import type { ReactNode } from "react";
import {
  getMobileActionGroupClass,
  mobileActionItemClass,
  mobileSegmentedTrioClass,
} from "@/components/ui/actionLayout";
import { cx } from "@/components/ui/cx";
import {
  getManualPoolCategoryLabelClass,
  getManualPoolViewSectionHeaderClass,
  getManualPoolViewSectionToneClass,
  type SessionStepViewSection,
} from "@/components/my-library/workouts/sessionStepSurfaceContract";
import type { SessionDraftStep } from "@/lib/session-generator-v1/shared";

/**
 * Shared renderer for the workout session-step surface.
 *
 * Owns mode chrome, collapsed summary cards, view sections, mobile action shells, and rearrange
 * controls. It intentionally does not own canonical draft mutation, persistence, export/PDF
 * behavior, or the editable form fields that still live in `WorkoutEditor`.
 */

export const SESSION_STEP_SURFACE_MODES = ["edit", "rearrange", "view"] as const;

export type SessionStepSurfaceMode = (typeof SESSION_STEP_SURFACE_MODES)[number];

const SESSION_STEP_SURFACE_MODE_LABELS: Record<SessionStepSurfaceMode, string> = {
  edit: "Edit",
  rearrange: "Rearrange",
  view: "View",
};

const mobileSummaryToggleClass =
  "w-full rounded-2xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue-200";
const mobileIconButtonLayoutClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const mobileActionToggleClass = cx(
  "fs-cta-secondary text-slate-700 hover:bg-white",
  mobileIconButtonLayoutClass
);
const mobileActionPanelClass = "fs-library-card fs-library-card-muted mt-3 p-2.5 sm:hidden";
const surfaceActionBaseClass =
  "inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const surfaceCompactActionBaseClass =
  "inline-flex min-h-9 items-center justify-center gap-1.5 px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const surfacePrimaryActionClass = cx("fs-cta-primary", surfaceActionBaseClass);
const surfaceSecondaryActionClass = cx("fs-cta-secondary hover:bg-white", surfaceActionBaseClass);
const surfaceCompactSecondaryActionClass = cx(
  "fs-cta-secondary hover:bg-white",
  surfaceCompactActionBaseClass
);
const surfaceDangerActionClass = cx(
  "fs-cta-secondary border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
  surfaceActionBaseClass
);
const mobileSecondaryActionClass = cx(
  "fs-cta-secondary w-full justify-center text-center hover:bg-white",
  surfaceActionBaseClass
);
const rearrangeMoveButtonClass = cx(mobileActionToggleClass, "sm:h-9 sm:w-10");
const recentlyMovedBlockClass = "bg-teal-50/80 shadow-sm ring-2 ring-inset ring-teal-300";
const desktopHeaderStackClass = "flex items-start justify-between gap-3";
const desktopSummaryBlockClass = "min-w-0 flex-1";

function getMobileExpandToggleClass(expanded: boolean) {
  return cx(
    mobileIconButtonLayoutClass,
    expanded ? "fs-cta-primary" : "fs-cta-secondary text-slate-700 hover:bg-white"
  );
}

export type SessionStepSummaryContentModel = {
  label: string;
  title: string;
  labelClassName: string;
  categoryLabel?: string | null;
  description?: string | null;
  targetSummary?: string | null;
  notes?: string | null;
  pendingDelete?: boolean;
};

/**
 * Presentation-only model for the step surface. Callbacks are controlled by `WorkoutEditor`; IDs
 * are canonical draft identifiers and must not be derived from display labels.
 */
export type SessionStepSurfaceRendererProps = {
  mode: SessionStepSurfaceMode;
  title: string;
  showModeTabs: boolean;
  showAddActions: boolean;
  hasSteps: boolean;
  rearrangeLiveMessage: string;
  lastRemovedLabel: string | null;
  children: ReactNode;
  viewSections?: readonly SessionStepViewSection[];
  onModeChange: (mode: SessionStepSurfaceMode) => void;
  onAddStep: () => void;
  onAddRepeat: () => void;
  onUndoLastRemoval: () => void;
  onDismissLastRemoval: () => void;
  onOpenViewStep: (stepId: string) => void;
  onOpenViewRepeat: (repeatGroupId: string) => void;
};

export function SessionStepSurfaceRenderer({
  mode,
  title,
  showModeTabs,
  showAddActions,
  hasSteps,
  rearrangeLiveMessage,
  lastRemovedLabel,
  children,
  viewSections = [],
  onModeChange,
  onAddStep,
  onAddRepeat,
  onUndoLastRemoval,
  onDismissLastRemoval,
  onOpenViewStep,
  onOpenViewRepeat,
}: SessionStepSurfaceRendererProps) {
  const isViewMode = mode === "view";

  return (
    <div data-testid="workout-editor-session-steps-surface" className="fs-library-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div
          data-action-layout="mobile-surface-header"
          className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
        >
          {showModeTabs ? (
            <div
              role="group"
              aria-label="Builder mode"
              className={cx(
                "fs-library-card fs-library-card-muted min-h-12 p-1",
                mobileSegmentedTrioClass
              )}
            >
              {SESSION_STEP_SURFACE_MODES.map((nextMode) => {
                const isSelected = mode === nextMode;

                return (
                  <button
                    key={nextMode}
                    type="button"
                    onClick={() => onModeChange(nextMode)}
                    aria-pressed={isSelected}
                    data-testid={`workout-editor-builder-mode-${nextMode}`}
                    className={cx(
                      surfaceCompactActionBaseClass,
                      "w-full",
                      isSelected ? "fs-cta-primary" : "fs-cta-secondary shadow-none hover:bg-white"
                    )}
                  >
                    {SESSION_STEP_SURFACE_MODE_LABELS[nextMode]}
                  </button>
                );
              })}
            </div>
          ) : null}
          {showAddActions ? (
            <div
              data-action-layout="mobile-equal"
              className={cx(
                getMobileActionGroupClass(2, { desktopJustify: "start" }),
                "border-t border-slate-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3"
              )}
            >
              <button
                type="button"
                onClick={onAddStep}
                data-testid="session-draft-add-step"
                className={cx(surfaceCompactSecondaryActionClass, mobileActionItemClass)}
              >
                Add step
              </button>
              <button
                type="button"
                onClick={onAddRepeat}
                data-testid="session-draft-add-repeat"
                className={cx(surfaceCompactSecondaryActionClass, mobileActionItemClass)}
              >
                Add repeat
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <p data-testid="workout-editor-rearrange-live" className="sr-only" aria-live="polite">
          {rearrangeLiveMessage}
        </p>

        {!hasSteps ? (
          <div
            data-testid="session-draft-empty-steps"
            className="fs-library-card fs-library-card-muted border-dashed p-3 sm:p-4"
          >
            <p className="text-sm font-medium text-slate-900">Start from a clean empty session.</p>
            <p className="mt-1 text-sm text-slate-600">
              Add your first step or repeat block below when you are ready to build from scratch.
            </p>
          </div>
        ) : null}

        {lastRemovedLabel ? (
          <div
            data-testid="workout-editor-removal-undo"
            className="fs-library-card fs-library-card-accent p-3 sm:p-4"
          >
            <p className="text-sm font-medium text-blue-950">
              Deleted <span className="font-semibold">{lastRemovedLabel}</span>.
            </p>
            <p className="mt-1 text-sm text-blue-900">
              Undo restores it to the same local spot before you save this workout.
            </p>
            <div
              data-action-layout="mobile-equal"
              className={cx("mt-3", getMobileActionGroupClass(2, { desktopJustify: "start" }))}
            >
              <button
                type="button"
                onClick={onUndoLastRemoval}
                data-testid="workout-editor-removal-undo-button"
                className={cx(surfacePrimaryActionClass, mobileActionItemClass)}
              >
                Undo delete
              </button>
              <button
                type="button"
                onClick={onDismissLastRemoval}
                data-testid="workout-editor-removal-dismiss-button"
                className={cx(surfaceSecondaryActionClass, mobileActionItemClass)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {isViewMode && viewSections.length > 0 ? (
          <SessionStepViewSections
            sections={viewSections}
            onOpenStep={onOpenViewStep}
            onOpenRepeat={onOpenViewRepeat}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

type SessionStepViewSectionsProps = {
  sections: readonly SessionStepViewSection[];
  sectionTestIdPrefix?: string;
  onOpenStep?: (stepId: string) => void;
  onOpenRepeat?: (repeatGroupId: string) => void;
};

export function SessionStepViewSections({
  sections,
  sectionTestIdPrefix = "workout-editor-view-section",
  onOpenStep,
  onOpenRepeat,
}: SessionStepViewSectionsProps) {
  return (
    <>
      {sections.map((section) => (
        <section
          key={section.key}
          data-testid={`${sectionTestIdPrefix}-${section.key}`}
          data-view-category={section.category}
          className={`overflow-hidden rounded-2xl border bg-white ${getManualPoolViewSectionToneClass(
            section.category
          )}`}
        >
          <div className={`px-4 py-3 ${getManualPoolViewSectionHeaderClass(section.category)}`}>
            <p
              className={`text-xs font-semibold tracking-wide uppercase ${getManualPoolCategoryLabelClass(
                section.category
              )}`}
            >
              {section.title}
            </p>
          </div>
          <div className="divide-y divide-slate-200/80">
            {section.lines.map((line) => {
              const lineTarget = line.target;
              const lineContent = (
                <div className="space-y-2">
                  <p className="text-base leading-6 text-slate-900">{line.primaryText}</p>
                  {line.secondaryText ? (
                    <p className="text-sm font-semibold text-blue-800">{line.secondaryText}</p>
                  ) : null}
                  {line.detailText ? (
                    <p className="text-sm leading-5 text-slate-500">{line.detailText}</p>
                  ) : null}
                </div>
              );

              if (lineTarget?.kind === "repeat" && onOpenRepeat) {
                return (
                  <button
                    key={line.key}
                    type="button"
                    data-testid={`workout-editor-view-repeat-${lineTarget.repeatGroupId}`}
                    onClick={() => onOpenRepeat(lineTarget.repeatGroupId)}
                    className="block w-full px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
                  >
                    {lineContent}
                  </button>
                );
              }

              if (lineTarget?.kind === "step" && onOpenStep) {
                return (
                  <button
                    key={line.key}
                    type="button"
                    data-testid={`workout-editor-view-line-${section.key}-${line.key}`}
                    onClick={() => onOpenStep(lineTarget.stepId)}
                    className="block w-full px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
                  >
                    {lineContent}
                  </button>
                );
              }

              return (
                <div key={line.key} className="px-4 py-3">
                  {lineContent}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export type SessionStepSummaryCardProps = {
  stepId: string;
  index: number;
  panelId: string;
  dataManualPoolCategory?: SessionDraftStep["category"];
  canUseDesktopCardOpen: boolean;
  cardStateClass: string;
  categoryRailClass: string;
  isEditMode: boolean;
  isSummaryOnlyMode: boolean;
  isOpen: boolean;
  mobileActionsOpen: boolean;
  pendingDelete: boolean;
  removalLabel: string | null;
  showRearrangeControls: boolean;
  showMobilePrimaryAddAfter: boolean;
  showMobilePrimaryAddRepeatAfter: boolean;
  canAddRepeatAfter: boolean;
  isLinkedPostSetRest: boolean;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  wasRecentlyMoved: boolean;
  summary: SessionStepSummaryContentModel;
  editPanel: ReactNode;
  onOpen: () => void;
  onToggle: () => void;
  onToggleMobileActions: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddStepAfter: () => void;
  onAddRepeatAfter: () => void;
  onDuplicate: () => void;
  onRequestRemove: () => void;
  onConfirmRemoval: () => void;
  onCancelRemoval: () => void;
};

export function SessionStepSummaryCard({
  stepId,
  index,
  panelId,
  dataManualPoolCategory,
  canUseDesktopCardOpen,
  cardStateClass,
  categoryRailClass,
  isEditMode,
  isSummaryOnlyMode,
  isOpen,
  mobileActionsOpen,
  pendingDelete,
  removalLabel,
  showRearrangeControls,
  showMobilePrimaryAddAfter,
  showMobilePrimaryAddRepeatAfter,
  canAddRepeatAfter,
  isLinkedPostSetRest,
  moveUpDisabled,
  moveDownDisabled,
  wasRecentlyMoved,
  summary,
  editPanel,
  onOpen,
  onToggle,
  onToggleMobileActions,
  onMoveUp,
  onMoveDown,
  onAddStepAfter,
  onAddRepeatAfter,
  onDuplicate,
  onRequestRemove,
  onConfirmRemoval,
  onCancelRemoval,
}: SessionStepSummaryCardProps) {
  const mobileOverflowActionCount =
    Number(!showMobilePrimaryAddAfter && !isLinkedPostSetRest) +
    Number(canAddRepeatAfter && !showMobilePrimaryAddRepeatAfter && !isLinkedPostSetRest) +
    Number(!isLinkedPostSetRest) +
    Number(!isLinkedPostSetRest);

  return (
    <article
      key={stepId}
      data-mobile-actions="progressive"
      data-manual-pool-category={dataManualPoolCategory}
      data-desktop-card-clickable={canUseDesktopCardOpen ? "true" : "false"}
      onClick={
        canUseDesktopCardOpen
          ? (event) => {
              if (shouldIgnoreCardEditClick(event.target)) {
                return;
              }

              onOpen();
            }
          : undefined
      }
      className={`rounded-2xl border p-3 transition sm:p-4 ${cardStateClass} ${categoryRailClass} ${
        wasRecentlyMoved ? recentlyMovedBlockClass : ""
      } ${
        canUseDesktopCardOpen && !pendingDelete
          ? "cursor-pointer hover:border-blue-200 hover:bg-white hover:shadow-sm"
          : ""
      }`}
    >
      <div className={desktopHeaderStackClass}>
        <div className={desktopSummaryBlockClass}>
          {isSummaryOnlyMode || showRearrangeControls ? (
            <div data-testid={`session-draft-step-mobile-summary-${index}`} className="sm:hidden">
              <SessionStepSummaryContent summary={summary} />
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={panelId}
              data-testid={`session-draft-step-mobile-summary-${index}`}
              className={`${mobileSummaryToggleClass} sm:hidden`}
            >
              <SessionStepSummaryContent summary={summary} />
            </button>
          )}
          <div data-testid={`session-draft-step-summary-${index}`} className="hidden sm:block">
            <SessionStepSummaryContent summary={summary} />
          </div>
        </div>
        {isEditMode ? (
          <div className="hidden shrink-0 sm:flex">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={panelId}
              data-testid={`session-draft-step-toggle-${index}`}
              className={cx(
                surfaceCompactSecondaryActionClass,
                isOpen ? "border-[color:var(--fs-border-brand)]" : ""
              )}
            >
              {isOpen ? "Done" : "Edit"}
            </button>
          </div>
        ) : null}
        {showRearrangeControls ? (
          <div
            data-testid={`session-draft-step-rearrange-controls-${index}`}
            className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap"
          >
            <MoveButton
              testId={`session-draft-step-rearrange-move-up-${index}`}
              disabled={moveUpDisabled}
              onClick={onMoveUp}
              direction="up"
            />
            <MoveButton
              testId={`session-draft-step-rearrange-move-down-${index}`}
              disabled={moveDownDisabled}
              onClick={onMoveDown}
              direction="down"
            />
          </div>
        ) : isEditMode ? (
          <div className="flex shrink-0 items-start gap-2 sm:hidden">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={isOpen ? "Hide step details" : "Show step details"}
              data-testid={`session-draft-step-mobile-toggle-${index}`}
              className={getMobileExpandToggleClass(isOpen)}
            >
              {isOpen ? (
                <ChevronUp aria-hidden="true" className="size-4" />
              ) : (
                <ChevronDown aria-hidden="true" className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onToggleMobileActions}
              aria-expanded={mobileActionsOpen}
              aria-controls={`session-draft-step-mobile-actions-panel-${stepId}`}
              data-testid={`session-draft-step-mobile-actions-toggle-${index}`}
              className={mobileActionToggleClass}
            >
              <Ellipsis className="size-5" />
              <span className="sr-only">
                {mobileActionsOpen ? "Hide step actions" : "Show step actions"}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {isEditMode && mobileActionsOpen ? (
        <div
          id={`session-draft-step-mobile-actions-panel-${stepId}`}
          data-testid={`session-draft-step-mobile-actions-panel-${index}`}
          className={`${mobileActionPanelClass} sm:hidden`}
        >
          <div
            data-action-layout="mobile-equal"
            className={getMobileActionGroupClass(mobileOverflowActionCount, {
              desktopJustify: "start",
            })}
          >
            {!showMobilePrimaryAddAfter && !isLinkedPostSetRest ? (
              <MobileActionButton
                testId={`session-draft-step-mobile-add-after-${index}`}
                tone="blue"
                onClick={onAddStepAfter}
              >
                Add step after
              </MobileActionButton>
            ) : null}
            {canAddRepeatAfter && !showMobilePrimaryAddRepeatAfter && !isLinkedPostSetRest ? (
              <MobileActionButton
                testId={`session-draft-step-mobile-add-repeat-after-${index}`}
                tone="blue"
                onClick={onAddRepeatAfter}
              >
                Add repeat after
              </MobileActionButton>
            ) : null}
            {isLinkedPostSetRest ? null : (
              <MobileActionButton
                testId={`session-draft-step-mobile-duplicate-${index}`}
                tone="slate"
                onClick={onDuplicate}
              >
                Duplicate
              </MobileActionButton>
            )}
            {isLinkedPostSetRest ? null : (
              <MobileActionButton
                testId={`session-draft-step-mobile-remove-${index}`}
                tone="rose"
                onClick={onRequestRemove}
              >
                Delete
              </MobileActionButton>
            )}
          </div>
        </div>
      ) : null}

      {isEditMode && showMobilePrimaryAddAfter ? (
        <div
          data-action-layout="mobile-equal"
          className={cx(
            "mt-3 sm:hidden",
            getMobileActionGroupClass(showMobilePrimaryAddRepeatAfter ? 2 : 1, {
              desktopJustify: "start",
            })
          )}
        >
          <button
            type="button"
            onClick={onAddStepAfter}
            data-testid={`session-draft-step-mobile-primary-add-after-${index}`}
            className={cx(surfaceCompactSecondaryActionClass, mobileActionItemClass)}
          >
            Add after
          </button>
          {showMobilePrimaryAddRepeatAfter ? (
            <button
              type="button"
              onClick={onAddRepeatAfter}
              data-testid={`session-draft-step-mobile-primary-add-repeat-after-${index}`}
              className={cx(surfaceCompactSecondaryActionClass, mobileActionItemClass)}
            >
              Repeat after
            </button>
          ) : null}
        </div>
      ) : null}

      {pendingDelete ? (
        <RemovalConfirm
          className="mt-3"
          label={removalLabel}
          fallbackLabel="this step"
          onConfirm={onConfirmRemoval}
          onCancel={onCancelRemoval}
        />
      ) : null}

      {editPanel}
    </article>
  );
}

export type SessionStepRepeatSummaryCardProps = {
  repeatGroupId: string;
  groupIndex: number;
  dataManualPoolCategory?: SessionDraftStep["category"];
  categoryRailClass?: string;
  dataDesktopCardClickable: boolean;
  pendingDelete: boolean;
  isEditMode: boolean;
  isRearrangeMode: boolean;
  isOpen: boolean;
  isManualPoolMode: boolean;
  mobileActionsOpen: boolean;
  moveUpDisabled: boolean;
  moveDownDisabled: boolean;
  wasRecentlyMoved: boolean;
  summary: SessionStepSummaryContentModel & {
    showRepeatBlockBadge: boolean;
  };
  editPanel: ReactNode;
  onOpen: () => void;
  onToggle: () => void;
  onToggleMobileActions: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddStepAfter: () => void;
  onAddRepeatAfter: () => void;
  onDuplicate: () => void;
  onRequestRemove: () => void;
};

export function SessionStepRepeatSummaryCard({
  repeatGroupId,
  groupIndex,
  dataManualPoolCategory,
  categoryRailClass = "",
  dataDesktopCardClickable,
  pendingDelete,
  isEditMode,
  isRearrangeMode,
  isOpen,
  isManualPoolMode,
  mobileActionsOpen,
  moveUpDisabled,
  moveDownDisabled,
  wasRecentlyMoved,
  summary,
  editPanel,
  onOpen,
  onToggle,
  onToggleMobileActions,
  onMoveUp,
  onMoveDown,
  onAddStepAfter,
  onAddRepeatAfter,
  onDuplicate,
  onRequestRemove,
}: SessionStepRepeatSummaryCardProps) {
  return (
    <section
      key={repeatGroupId}
      data-testid={`workout-editor-repeat-group-${groupIndex}`}
      data-containment-style="calm"
      data-manual-pool-category={dataManualPoolCategory}
      data-desktop-card-clickable={dataDesktopCardClickable ? "true" : "false"}
      onClick={
        dataDesktopCardClickable
          ? (event) => {
              if (shouldIgnoreCardEditClick(event.target)) {
                return;
              }

              onOpen();
            }
          : undefined
      }
      className={`rounded-2xl border p-3 sm:p-4 ${
        pendingDelete
          ? "border-dashed border-rose-300 bg-rose-50/70 ring-1 ring-rose-100 ring-inset"
          : `border-blue-100 bg-gradient-to-b from-blue-50/70 to-white ring-1 ring-blue-100 ring-inset ${categoryRailClass}`
      } ${wasRecentlyMoved ? recentlyMovedBlockClass : ""} ${
        dataDesktopCardClickable && !pendingDelete ? "cursor-pointer hover:shadow-sm" : ""
      }`}
    >
      <div className="space-y-3">
        <div className={desktopHeaderStackClass}>
          <div className={desktopSummaryBlockClass}>
            {isRearrangeMode ? (
              <div
                data-testid={`session-draft-repeat-mobile-summary-${groupIndex}`}
                className="sm:hidden"
              >
                <RepeatSummaryContent summary={summary} isManualPoolMode={isManualPoolMode} />
              </div>
            ) : (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                data-testid={`session-draft-repeat-mobile-summary-${groupIndex}`}
                className={`${mobileSummaryToggleClass} sm:hidden`}
              >
                <RepeatSummaryContent summary={summary} isManualPoolMode={isManualPoolMode} />
              </button>
            )}
            <div
              data-testid={`session-draft-repeat-summary-${groupIndex}`}
              className="hidden sm:block"
            >
              <RepeatSummaryContent summary={summary} isManualPoolMode={isManualPoolMode} />
            </div>
          </div>
          {isEditMode ? (
            <div className="hidden shrink-0 sm:flex">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                data-testid={`session-draft-repeat-toggle-${groupIndex}`}
                className={cx(
                  surfaceCompactSecondaryActionClass,
                  isOpen ? "border-[color:var(--fs-border-brand)]" : ""
                )}
              >
                {isOpen ? "Done" : "Edit"}
              </button>
            </div>
          ) : null}
          {isRearrangeMode ? (
            <div
              data-testid={`session-draft-repeat-rearrange-controls-${groupIndex}`}
              className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap"
            >
              <MoveButton
                testId={`session-draft-repeat-rearrange-move-up-${groupIndex}`}
                disabled={moveUpDisabled}
                onClick={onMoveUp}
                direction="up"
              />
              <MoveButton
                testId={`session-draft-repeat-rearrange-move-down-${groupIndex}`}
                disabled={moveDownDisabled}
                onClick={onMoveDown}
                direction="down"
              />
            </div>
          ) : isEditMode ? (
            <div className="flex shrink-0 items-start gap-2 sm:hidden">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Hide repeat details" : "Show repeat details"}
                data-testid={`session-draft-repeat-mobile-toggle-${groupIndex}`}
                className={getMobileExpandToggleClass(isOpen)}
              >
                {isOpen ? (
                  <ChevronUp aria-hidden="true" className="size-4" />
                ) : (
                  <ChevronDown aria-hidden="true" className="size-4" />
                )}
              </button>
              {isOpen ? (
                <button
                  type="button"
                  onClick={onToggleMobileActions}
                  aria-expanded={mobileActionsOpen}
                  aria-controls={`session-draft-repeat-mobile-actions-panel-${repeatGroupId}`}
                  data-testid={`session-draft-repeat-mobile-actions-toggle-${groupIndex}`}
                  className={mobileActionToggleClass}
                >
                  <Ellipsis className="size-5" />
                  <span className="sr-only">
                    {mobileActionsOpen ? "Hide repeat actions" : "Show repeat actions"}
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {isEditMode && isOpen ? (
          <div
            data-action-layout="mobile-equal"
            className={cx("sm:hidden", getMobileActionGroupClass(1, { desktopJustify: "start" }))}
          >
            <button
              type="button"
              onClick={onAddStepAfter}
              data-testid={`session-draft-repeat-mobile-primary-add-step-after-${groupIndex}`}
              className={cx(surfaceCompactSecondaryActionClass, mobileActionItemClass)}
            >
              Add step after
            </button>
          </div>
        ) : null}

        {isEditMode && isOpen && mobileActionsOpen ? (
          <div
            id={`session-draft-repeat-mobile-actions-panel-${repeatGroupId}`}
            data-testid={`session-draft-repeat-mobile-actions-panel-${groupIndex}`}
            className={`${mobileActionPanelClass} sm:hidden`}
          >
            <div
              data-action-layout="mobile-equal"
              className={getMobileActionGroupClass(3, { desktopJustify: "start" })}
            >
              <MobileActionButton
                testId={`session-draft-repeat-mobile-add-repeat-after-${groupIndex}`}
                tone="blue"
                onClick={onAddRepeatAfter}
              >
                Add repeat after
              </MobileActionButton>
              <MobileActionButton
                testId={`session-draft-repeat-mobile-duplicate-${groupIndex}`}
                tone="slate"
                onClick={onDuplicate}
              >
                Duplicate repeat
              </MobileActionButton>
              <MobileActionButton
                testId={`session-draft-repeat-mobile-remove-${groupIndex}`}
                tone="rose"
                onClick={onRequestRemove}
              >
                Delete repeat
              </MobileActionButton>
            </div>
          </div>
        ) : null}
      </div>

      {editPanel}
    </section>
  );
}

export function SessionStepSummaryContent({
  summary,
}: {
  summary: SessionStepSummaryContentModel;
}) {
  return (
    <>
      <p className={`text-xs font-semibold tracking-wide uppercase ${summary.labelClassName}`}>
        {summary.label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{summary.title}</p>
      {summary.categoryLabel ? (
        <p className="mt-1 text-xs font-medium text-slate-600">{summary.categoryLabel}</p>
      ) : null}
      {summary.description ? (
        <p className="mt-2 text-xs text-slate-500">{summary.description}</p>
      ) : null}
      {summary.targetSummary ? (
        <p className="mt-1 text-xs text-slate-500">{summary.targetSummary}</p>
      ) : null}
      {summary.pendingDelete ? (
        <p className="mt-2 text-[11px] font-semibold tracking-wide text-rose-700 uppercase">
          Will be removed
        </p>
      ) : null}
      {summary.notes ? <p className="mt-1 text-xs text-slate-400">{summary.notes}</p> : null}
    </>
  );
}

function RepeatSummaryContent({
  summary,
  isManualPoolMode,
}: {
  summary: SessionStepSummaryContentModel & { showRepeatBlockBadge: boolean };
  isManualPoolMode: boolean;
}) {
  return (
    <>
      <p className={`text-xs font-semibold tracking-wide uppercase ${summary.labelClassName}`}>
        {summary.label}
      </p>
      {isManualPoolMode && summary.showRepeatBlockBadge ? (
        <p className="mt-2">
          <span className="inline-flex rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-700 uppercase">
            Repeat block
          </span>
        </p>
      ) : null}
      <p className="mt-2 text-sm font-medium text-slate-900">{summary.title}</p>
      {summary.pendingDelete ? (
        <p className="mt-2 text-[11px] font-semibold tracking-wide text-rose-700 uppercase">
          Will be removed
        </p>
      ) : null}
    </>
  );
}

function MoveButton({
  testId,
  disabled,
  onClick,
  direction,
}: {
  testId: string;
  disabled: boolean;
  onClick: () => void;
  direction: "up" | "down";
}) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Move ${direction}`}
      title={`Move ${direction}`}
      data-testid={testId}
      className={rearrangeMoveButtonClass}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

function MobileActionButton({
  testId,
  tone,
  onClick,
  children,
}: {
  testId: string;
  tone: "blue" | "slate" | "rose";
  onClick: () => void;
  children: ReactNode;
}) {
  const toneClass =
    tone === "blue"
      ? "border-[color:var(--fs-border-brand)]"
      : tone === "rose"
        ? "border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500"
        : "";

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cx(mobileSecondaryActionClass, toneClass)}
    >
      {children}
    </button>
  );
}

export function RemovalConfirm({
  className = "",
  label,
  fallbackLabel,
  onConfirm,
  onCancel,
}: {
  className?: string;
  label: string | null;
  fallbackLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      data-testid="workout-editor-removal-confirm"
      className={cx(className, "fs-library-card border-rose-200 bg-rose-50/90 p-3")}
    >
      <p className="text-sm font-medium text-rose-950">
        Delete <span className="font-semibold">{label ?? fallbackLabel}</span>?
      </p>
      <p className="mt-1 text-sm text-rose-900">
        This builder change stays local until you save, and you can still undo it right after
        deletion.
      </p>
      <div
        data-action-layout="mobile-equal"
        className={cx("mt-3", getMobileActionGroupClass(2, { desktopJustify: "start" }))}
      >
        <button
          type="button"
          onClick={onConfirm}
          data-testid="workout-editor-removal-confirm-button"
          className={cx(surfaceDangerActionClass, mobileActionItemClass)}
        >
          Delete now
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-testid="workout-editor-removal-cancel-button"
          className={cx(surfaceSecondaryActionClass, mobileActionItemClass)}
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

function shouldIgnoreCardEditClick(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [role="button"], [data-card-click-ignore="true"]'
    )
  );
}
