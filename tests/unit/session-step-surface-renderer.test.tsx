import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  SessionStepSummaryCard,
  SessionStepSurfaceRenderer,
  SessionStepViewSections,
} from "@/components/my-library/workouts/SessionStepSurfaceRenderer";
import type { SessionStepViewSection } from "@/components/my-library/workouts/sessionStepSurfaceContract";

const viewSections: SessionStepViewSection[] = [
  {
    key: "warmup-0",
    title: "Warmup",
    category: "warmup",
    lines: [
      {
        key: "warmup-step",
        primaryText: "400m · Freestyle · Easy",
        secondaryText: "Rest 0:30",
        target: { kind: "step", stepId: "warmup-step" },
      },
      {
        key: "main-repeat",
        primaryText: "4 x 100m · Freestyle · Moderate · Interval rest 0:30",
        secondaryText: "Set rest 1:00",
        target: { kind: "repeat", repeatGroupId: "main-repeat" },
      },
    ],
  },
];

function clickAll(...testIds: string[]) {
  testIds.forEach((testId) => fireEvent.click(screen.getByTestId(testId)));
}

function renderSurface(mode: "edit" | "view" = "edit") {
  const action = vi.fn();
  const callbacks = {
    action,
    onModeChange: vi.fn(),
    onOpenViewStep: vi.fn(),
    onOpenViewRepeat: vi.fn(),
  };

  render(
    <SessionStepSurfaceRenderer
      mode={mode}
      title="Session steps"
      showModeTabs
      showAddActions={mode === "edit"}
      hasSteps={mode !== "edit"}
      rearrangeLiveMessage="Moved Warmup down."
      lastRemovedLabel={mode === "edit" ? "Warmup and attached rest" : null}
      viewSections={viewSections}
      onModeChange={callbacks.onModeChange}
      onAddStep={action}
      onAddRepeat={action}
      onUndoLastRemoval={action}
      onDismissLastRemoval={action}
      onOpenViewStep={callbacks.onOpenViewStep}
      onOpenViewRepeat={callbacks.onOpenViewRepeat}
    >
      <article data-testid="renderer-edit-child">Editable cards</article>
    </SessionStepSurfaceRenderer>
  );

  return callbacks;
}

function renderStepCard() {
  const action = vi.fn();

  render(
    <SessionStepSummaryCard
      stepId="warmup-step"
      index={0}
      panelId="warmup-panel"
      canUseDesktopCardOpen
      cardStateClass="border-dashed border-rose-300"
      categoryRailClass="border-l-4 border-cyan-400"
      isEditMode
      isSummaryOnlyMode={false}
      isOpen={false}
      mobileActionsOpen
      pendingDelete
      removalLabel="Warmup and attached rest"
      showRearrangeControls={false}
      showMobilePrimaryAddAfter={false}
      showMobilePrimaryAddRepeatAfter={false}
      canAddRepeatAfter
      isLinkedPostSetRest={false}
      moveUpDisabled={false}
      moveDownDisabled={false}
      wasRecentlyMoved={false}
      summary={{
        label: "Warmup",
        title: "400m · Freestyle · Easy · Rest 0:30",
        labelClassName: "text-cyan-700",
        pendingDelete: true,
      }}
      editPanel={<div data-testid="single-edit-panel" />}
      onOpen={action}
      onToggle={action}
      onToggleMobileActions={action}
      onMoveUp={action}
      onMoveDown={action}
      onAddStepAfter={action}
      onAddRepeatAfter={action}
      onDuplicate={action}
      onRequestRemove={action}
      onConfirmRemoval={action}
      onCancelRemoval={action}
    />
  );

  return action;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("renders shell states and delegates mode/add/undo callbacks", () => {
  const callbacks = renderSurface();

  expect(screen.getByTestId("session-draft-empty-steps")).toBeVisible();
  expect(screen.getByTestId("workout-editor-removal-undo")).toHaveTextContent(
    "Warmup and attached rest"
  );

  clickAll(
    "workout-editor-builder-mode-view",
    "session-draft-add-step",
    "session-draft-add-repeat",
    "workout-editor-removal-undo-button",
    "workout-editor-removal-dismiss-button"
  );

  expect(callbacks.onModeChange).toHaveBeenCalledWith("view");
  expect(callbacks.action).toHaveBeenCalledTimes(4);
});

it("renders view sections from presentation input and delegates targeted callbacks", () => {
  const callbacks = renderSurface("view");

  expect(screen.getAllByTestId(/workout-editor-view-section-/)).toHaveLength(1);
  expect(screen.getByText("400m · Freestyle · Easy")).toBeVisible();

  clickAll(
    "workout-editor-view-line-warmup-0-warmup-step",
    "workout-editor-view-repeat-main-repeat"
  );

  expect(callbacks.onOpenViewStep).toHaveBeenCalledWith("warmup-step");
  expect(callbacks.onOpenViewRepeat).toHaveBeenCalledWith("main-repeat");
});

it("renders shared view sections as read-only when no open callbacks are provided", () => {
  render(
    <SessionStepViewSections sections={viewSections} sectionTestIdPrefix="saved-preview-section" />
  );

  expect(screen.getByTestId("saved-preview-section-warmup-0")).toHaveAttribute(
    "data-view-category",
    "warmup"
  );
  expect(screen.getByText("400m · Freestyle · Easy")).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /400m · Freestyle · Easy/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /4 x 100m/i })).not.toBeInTheDocument();
});

it("renders shared single-step chrome and delegates card/delete actions", () => {
  const action = renderStepCard();

  clickAll(
    "session-draft-step-summary-0",
    "session-draft-step-toggle-0",
    "session-draft-step-mobile-add-after-0",
    "session-draft-step-mobile-add-repeat-after-0",
    "session-draft-step-mobile-duplicate-0",
    "session-draft-step-mobile-remove-0",
    "workout-editor-removal-confirm-button",
    "workout-editor-removal-cancel-button"
  );

  expect(action).toHaveBeenCalledTimes(8);
});
