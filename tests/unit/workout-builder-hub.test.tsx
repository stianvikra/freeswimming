import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { WORKOUT_NOTICE_AUTO_DISMISS_MS } from "@/components/my-library/workouts/useAutoDismissNotice";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import { buildManualWorkoutLocalDraftStorageKey } from "@/lib/workouts/manual-local-draft";
import { readStoredWorkoutPoolsidePreviewDraft } from "@/lib/workouts/poolside-preview";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSummary,
} from "@/lib/workouts/shared";
import {
  buildWorkoutPdfFileName,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutHandoffFileName,
} from "@/lib/workouts/shared";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildDraft(overrides?: Partial<SessionDraft>): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-20T12:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Accepted threshold workout",
    titleSuggestions: ["Accepted threshold workout"],
    description: "Threshold session in pool mode.",
    environment: "pool",
    poolLengthUnit: "m",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 2200,
    targetTimeMin: null,
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    basePaceSecondsPer100m: 128,
    usedCssPaceLabel: "1:58",
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: ["kickboard"],
    focusText: "Breathing timing",
    goalTitle: "Swim 1500m stronger",
    constraintText: "Keep the first half controlled.",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup",
        name: "Easy warmup swim",
        stroke: "freestyle",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swimming with relaxed breathing.",
        notes: "Start smooth.",
      },
    ],
    ...overrides,
  };
}

function buildMockPrintWindow(writtenDocuments: string[]) {
  return {
    document: {
      open: vi.fn(),
      write: vi.fn((html: string) => {
        writtenDocuments.push(html);
      }),
      close: vi.fn(),
    },
    focus: vi.fn(),
  };
}

function buildWorkoutSummary(overrides?: Partial<WorkoutSummary>): WorkoutSummary {
  return {
    id: "workout-1",
    title: "Accepted threshold workout",
    environment: "pool",
    poolLengthUnit: "m",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    updatedAt: "2026-03-20T12:20:00.000Z",
    acceptedAt: "2026-03-20T12:18:00.000Z",
    sourceKind: "ai_session_v1",
    status: "accepted",
    previewText: "400m · Freestyle · Easy\n\nTotal: 2200m",
    ...overrides,
  };
}

function buildWorkoutRecord(overrides?: Partial<WorkoutEditorRecord>): WorkoutEditorRecord {
  return {
    id: "workout-1",
    createdAt: "2026-03-20T12:18:00.000Z",
    updatedAt: "2026-03-20T12:20:00.000Z",
    acceptedAt: "2026-03-20T12:18:00.000Z",
    sourceKind: "ai_session_v1",
    status: "accepted",
    draft: buildDraft(),
    ...overrides,
  };
}

function buildWorkoutLibrary(overrides?: Partial<WorkoutLibrarySnapshot>): WorkoutLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedWorkout: buildWorkoutRecord(),
    selectedWorkoutMissing: false,
    recentWorkouts: [buildWorkoutSummary()],
    ...overrides,
  };
}

function readPreviewDraft() {
  if (!screen.queryByTestId("session-generator-draft-preview")) {
    openSupportToolsPanel();
  }

  return JSON.parse(
    screen.getByTestId("session-generator-draft-preview").textContent ?? "{}"
  ) as SessionDraft;
}

function buildTrainingFocusOptions() {
  return [
    {
      id: "focus-1",
      title: "High elbow catch",
      description: "Keep the forearm vertical before pressing back.",
      isPrimary: true,
    },
    {
      id: "focus-2",
      title: "Calm exhale",
      description: "Start the exhale before the head turns to breathe.",
      isPrimary: false,
    },
  ];
}

function openWorkoutMetadataPanel() {
  if (!screen.queryByTestId("workout-editor-metadata-toggle")) return;
  if (screen.queryByTestId("session-draft-title")) return;
  fireEvent.click(screen.getByTestId("workout-editor-metadata-toggle"));
}

function openSupportToolsPanel() {
  const toggle = screen.queryByTestId("workout-editor-support-tools-toggle");
  if (!toggle) return;
  if (toggle.getAttribute("aria-expanded") === "false") {
    fireEvent.click(toggle);
  }
}

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches,
      media: "(hover: hover) and (pointer: fine)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function getDesktopSummaryCard(testId: string) {
  const summary = screen.getByTestId(testId);
  const card = summary.closest("article, section");

  if (!card) {
    throw new Error(`No desktop summary card found for ${testId}.`);
  }

  return card as HTMLElement;
}

describe("WorkoutBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("keeps advanced support tools collapsed by default in the calm builder layout", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-support-tools-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByTestId("workout-editor-support-tools-status")).toHaveTextContent("Ready");
    expect(
      screen.queryByText("Advanced export and support tools stay here when you need them.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Open, copy, or download here without saving.")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-editor-garmin-readiness")).not.toBeInTheDocument();

    openSupportToolsPanel();

    expect(screen.getByTestId("workout-editor-garmin-readiness")).toBeVisible();
    expect(
      screen.getByText("Advanced export and support tools stay here when you need them.")
    ).toBeVisible();
    expect(screen.getByText("Open, copy, or download here without saving.")).toBeVisible();
  });

  it("uses the flatter containment markers for the calm workout builder layout", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-containment-style",
      "flat"
    );
    openWorkoutMetadataPanel();
    expect(screen.getByTestId("workout-editor-pool-size-panel")).toHaveAttribute(
      "data-containment-style",
      "integrated"
    );
    expect(screen.getByTestId("workout-editor-support-tools-panel")).toHaveAttribute(
      "data-containment-style",
      "sectioned"
    );
    expect(screen.getByTestId("workout-editor-poolside-panel")).toHaveAttribute(
      "data-containment-style",
      "stacked"
    );

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    expect(screen.getByTestId("workout-editor-repeat-group-1")).toHaveAttribute(
      "data-containment-style",
      "calm"
    );
  });

  it("keeps mobile step and repeat actions progressive while preserving access to secondary controls", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("session-draft-step-mobile-summary-0")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(
      screen.queryByTestId("session-draft-step-mobile-primary-add-after-0")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-draft-step-mobile-summary-0"));

    expect(screen.getByTestId("session-draft-step-mobile-summary-0")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByTestId("session-draft-step-mobile-primary-add-after-0")).toBeVisible();
    expect(
      screen.getByTestId("session-draft-step-mobile-primary-add-repeat-after-0")
    ).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-step-mobile-actions-toggle-0"));

    expect(screen.getByTestId("session-draft-step-mobile-actions-panel-0")).toBeVisible();
    expect(screen.queryByTestId("session-draft-step-mobile-move-up-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-mobile-remove-0")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));

    expect(
      screen.getByTestId("session-draft-repeat-mobile-primary-add-step-after-1")
    ).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-repeat-mobile-actions-toggle-1"));

    expect(screen.getByTestId("session-draft-repeat-mobile-actions-panel-1")).toBeVisible();
    expect(screen.getByTestId("session-draft-repeat-mobile-add-repeat-after-1")).toBeVisible();
    expect(screen.getByTestId("session-draft-repeat-mobile-remove-1")).toBeVisible();
  });

  it("keeps larger-screen step and repeat action rows stacked below readable summaries", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("session-draft-step-summary-0")).toBeVisible();
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    expect(screen.getByTestId("session-draft-step-desktop-actions-0")).toHaveAttribute(
      "data-desktop-layout",
      "bottom"
    );

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));

    expect(screen.getByTestId("session-draft-repeat-summary-1")).toBeVisible();
    expect(screen.getByTestId("session-draft-repeat-desktop-actions-1")).toHaveAttribute(
      "data-desktop-layout",
      "bottom"
    );
  });

  it("loads an accepted workout and saves canonical edits back to the same workout", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: SessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          workout: buildWorkoutRecord({
            draft: body.draft,
          }),
          summary: buildWorkoutSummary({
            title: body.draft.title,
            poolLengthUnit: body.draft.poolLengthUnit,
            totalDistanceM: body.draft.totalDistanceM,
            estimatedDurationMin: body.draft.estimatedDurationMin,
          }),
        }),
      } as Response;
    });

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All changes are saved to this session."
    );
    expect(screen.getByTestId("workout-editor-save-state")).toHaveClass("sr-only");
    expect(screen.getByTestId("workout-editor-pdf-source")).toHaveClass("sr-only");
    expect(screen.getByTestId("workout-editor-support-tools-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    openSupportToolsPanel();
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "ready"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness-summary")).toHaveTextContent(
      "Ready for the planned Garmin/export handoff."
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-toggle"));
    fireEvent.click(screen.getByTestId("workout-editor-handoff-toggle"));
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.queryByTestId("workout-editor-reset")).not.toBeInTheDocument();

    openWorkoutMetadataPanel();
    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Builder edited workout" },
    });
    fireEvent.change(screen.getByTestId("session-draft-description"), {
      target: { value: "Edited in the dedicated builder route." },
    });
    fireEvent.change(screen.getByTestId("session-draft-pool-length-input"), {
      target: { value: "33.33" },
    });
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-distance-0"), {
      target: { value: "custom" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-distance-custom-0"), {
      target: { value: "333" },
    });
    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.change(screen.getByLabelText("Repeat count"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-name-1"), {
      target: { value: "Repeat swim focus" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-distance-1"), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-1"), {
      target: { value: "backstroke" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-drill-type-1"), {
      target: { value: "pull" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-equipment-1"), {
      target: { value: "fins" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-target-mode-1"), {
      target: { value: "css_target_pace" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-css-offset-1"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-2"));
    fireEvent.change(screen.getByTestId("session-draft-step-duration-mode-2"), {
      target: { value: "send_off" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-sendoff-minutes-2"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-sendoff-seconds-2"), {
      target: { value: "00" },
    });
    fireEvent.click(screen.getByTestId("session-draft-add-step"));
    fireEvent.change(screen.getByTestId("session-draft-step-name-4"), {
      target: { value: "CSS send-off rest" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-duration-mode-4"), {
      target: { value: "css_send_off" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-4"), {
      target: { value: "im_by_round" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-css-sendoff-offset-4"), {
      target: { value: "2" },
    });

    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this session."
    );
    expect(screen.getByTestId("workout-editor-support-tools-status")).toHaveTextContent(
      "3 review items"
    );
    openSupportToolsPanel();
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness-summary")).toHaveTextContent(
      "Review 3 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-readiness-toggle"));
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "CSS-relative pacing"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "2:00/100m if no CSS is set"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent("Fins");
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "Manual Garmin translation is still required"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "CSS-Based Send-Off Time"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "Lap Button Press instead"
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-toggle"));
    fireEvent.click(screen.getByTestId("workout-editor-handoff-toggle"));
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-reset")).toBeEnabled();

    fireEvent.click(screen.getByTestId("workout-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts/workout-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Changes saved to this session.")).toBeVisible();
    });
    openSupportToolsPanel();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All changes are saved to this session."
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.queryByTestId("workout-editor-reset")).not.toBeInTheDocument();

    const fetchBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: SessionDraft;
    };
    const repeatSteps = fetchBody.draft.steps.filter((step) => step.repeatGroupId);

    expect(repeatSteps).toHaveLength(2);
    expect(repeatSteps.every((step) => step.repeatCount === 6)).toBe(true);
    expect(fetchBody.draft.poolLengthM).toBe(33.33);
    expect(fetchBody.draft.steps[0]).toMatchObject({
      durationMode: "distance",
      distanceM: 333,
    });
    expect(repeatSteps[0]).toMatchObject({
      distanceM: 200,
      stroke: "backstroke",
      drillType: "pull",
      equipment: "fins",
      targetMode: "css_target_pace",
      cssTargetOffsetSeconds: 2,
    });
    expect(fetchBody.draft.steps[2]).toMatchObject({
      durationMode: "send_off",
      timeMin: 2,
    });
    expect(fetchBody.draft.steps[3]).toMatchObject({
      category: "rest",
      durationMode: "fixed_rest",
      postSetRestForRepeatGroupId: expect.any(String),
    });
    expect(fetchBody.draft.steps[4]).toMatchObject({
      name: "CSS send-off rest",
      stroke: "im_by_round",
      durationMode: "css_send_off",
      cssSendOffOffsetSeconds: 2,
    });
    expect(fetchBody.draft.allowedStrokes).toContain("backstroke");
    expect(fetchBody.draft.allowedStrokes).not.toContain("im_by_round");
    expect(fetchBody.draft.equipmentAllowlist).toContain("fins");
    openWorkoutMetadataPanel();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Builder edited workout");
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    expect(screen.getByTestId("session-draft-step-distance-0")).toHaveValue("custom");
    expect(screen.getByTestId("session-draft-step-distance-custom-0")).toHaveValue("333");
    fireEvent.click(screen.getByTestId("session-draft-repeat-toggle-1"));
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-1"));
    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Repeat swim focus");
    expect(screen.getByTestId("session-draft-step-distance-1")).toHaveValue("200");
    expect(screen.getByTestId("session-draft-step-stroke-1")).toHaveValue("backstroke");
    expect(screen.getByTestId("session-draft-step-drill-type-1")).toHaveValue("pull");
    expect(screen.getByTestId("session-draft-step-equipment-1")).toHaveValue("fins");
    expect(screen.getByTestId("session-draft-step-target-mode-1")).toHaveValue("css_target_pace");
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-4"));
    expect(screen.getByTestId("session-draft-step-stroke-4")).toHaveValue("im_by_round");
  }, 30_000);

  it("can discard unsaved edits and undo the discard locally", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openWorkoutMetadataPanel();
    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Temporary builder title" },
    });
    fireEvent.change(screen.getByTestId("session-draft-description"), {
      target: { value: "Temporary builder description." },
    });

    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this session."
    );
    expect(screen.getByTestId("workout-editor-reset")).toBeEnabled();

    fireEvent.click(screen.getByTestId("workout-editor-reset"));

    expect(screen.getByTestId("workout-editor-discard-undo")).toHaveTextContent(
      "Changes discarded."
    );
    openWorkoutMetadataPanel();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Accepted threshold workout");
    expect(screen.getByTestId("session-draft-description")).toHaveValue(
      "Threshold session in pool mode."
    );
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All changes are saved to this session."
    );
    expect(screen.queryByTestId("workout-editor-reset")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workout-editor-discard-undo-button"));

    expect(screen.queryByTestId("workout-editor-discard-undo")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Temporary builder title");
    expect(screen.getByTestId("session-draft-description")).toHaveValue(
      "Temporary builder description."
    );
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this session."
    );
    expect(screen.getByTestId("workout-editor-reset")).toBeEnabled();
  }, 30000);

  it("requires confirmation and supports undo for destructive single-step removal", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-step-remove-0"));

    expect(screen.getByTestId("workout-editor-removal-confirm")).toHaveTextContent(
      "Delete Easy warmup swim?"
    );
    expect(getDesktopSummaryCard("session-draft-step-summary-0")).toHaveClass(
      "border-dashed",
      "border-rose-300"
    );
    expect(getDesktopSummaryCard("session-draft-step-summary-0")).toHaveTextContent(
      "Will be removed"
    );
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();

    fireEvent.click(screen.getByTestId("workout-editor-removal-cancel-button"));

    expect(screen.queryByTestId("workout-editor-removal-confirm")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();

    fireEvent.click(screen.getByTestId("session-draft-step-remove-0"));
    fireEvent.click(screen.getByTestId("workout-editor-removal-confirm-button"));

    expect(screen.queryByTestId("session-draft-step-toggle-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-editor-removal-undo")).toHaveTextContent(
      "Deleted Easy warmup swim."
    );
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this session."
    );

    fireEvent.click(screen.getByTestId("workout-editor-removal-undo-button"));

    expect(screen.queryByTestId("workout-editor-removal-undo")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All changes are saved to this session."
    );
  });

  it("duplicates a single step after the source step with a fresh local identity", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-step-duplicate-0"));

    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Easy warmup swim");
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this session."
    );

    const previewDraft = readPreviewDraft();

    expect(previewDraft.steps).toHaveLength(2);
    expect(previewDraft.steps[0]?.id).not.toBe(previewDraft.steps[1]?.id);
    expect(previewDraft.steps[1]).toMatchObject({
      name: "Easy warmup swim",
      category: "warmup",
      durationMode: "distance",
      distanceM: 400,
    });
    expect(previewDraft.steps[1]?.repeatGroupId ?? null).toBeNull();
  });

  it("adds a starter repeat block directly after a single-step context", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-step-add-repeat-after-0"));

    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");
    expect(screen.getByTestId("session-draft-repeat-ending-rest-mode-1")).toHaveValue(
      "skip_last_rest"
    );
    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Repeat swim");

    const previewDraft = readPreviewDraft();
    const repeatSteps = previewDraft.steps.filter((step) => step.repeatGroupId);
    const linkedPostSetRestSteps = previewDraft.steps.filter(
      (step) => step.postSetRestForRepeatGroupId
    );

    expect(previewDraft.steps).toHaveLength(4);
    expect(repeatSteps).toHaveLength(2);
    expect(linkedPostSetRestSteps).toHaveLength(1);
    expect(repeatSteps.every((step) => step.repeatCount === 4)).toBe(true);
    expect(repeatSteps.every((step) => step.repeatEndingRestMode === "skip_last_rest")).toBe(true);
    expect(previewDraft.steps[0]?.repeatGroupId ?? null).toBeNull();
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
  });

  it("shows repeat summary and final-interval-rest wording in the manual pool builder", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-pool-field-parity" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    const repeatEndingRestMode = screen.getAllByTestId(/session-draft-repeat-ending-rest-mode-/)[0];
    const repeatSummary = screen.getAllByTestId(/session-draft-repeat-summary-/)[0];

    expect(repeatEndingRestMode).toHaveValue("skip_last_rest");
    expect(repeatSummary).toHaveTextContent(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30 · Set rest 0:30"
    );
    expect(repeatSummary).toHaveTextContent("Repeat block");
    expect(
      screen.queryByText(
        "Fixed Rest Time 1:00 still runs between rounds. It is skipped only after the final round."
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Final rest skipped/)).not.toBeInTheDocument();
    expect(screen.getByText("Rest after last repeat")).toBeVisible();
    expect(screen.getByRole("option", { name: "Use separate rest step" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Use repeat rest time" })).toBeVisible();
    expect(
      screen.queryByText("Adjust or remove when you refine the workout.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Separate canonical rest after the set, outside the repeat block itself.")
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("REST BETWEEN REPEATS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REST AFTER SET").length).toBeGreaterThan(0);
    expect(screen.queryByText("MAIN INTERVAL REST")).not.toBeInTheDocument();
    expect(screen.queryByText("MAIN SET REST")).not.toBeInTheDocument();

    const previewDraft = readPreviewDraft();
    const repeatSteps = previewDraft.steps.filter((step) => step.repeatGroupId);

    expect(repeatSteps).toHaveLength(2);
    expect(repeatSteps.every((step) => step.repeatEndingRestMode === "skip_last_rest")).toBe(true);
  });

  it("shows attached rest inline in parent summaries and edits it inside the parent card", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({
              sourceFingerprint: "manual-rest-labels",
              steps: [
                {
                  id: "warmup-1",
                  category: "warmup",
                  name: "Warmup swim",
                  stroke: "freestyle",
                  intensity: "easy",
                  durationMode: "distance",
                  distanceM: 400,
                  timeMin: null,
                  targetSummary: "",
                  notes: "Start smooth.",
                },
                {
                  id: "warmup-rest-1",
                  category: "rest",
                  name: "Warmup rest",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 0.5,
                  targetSummary: "",
                  notes: "Use this as a simple fixed rest block.",
                },
                {
                  id: "cooldown-1",
                  category: "cooldown",
                  name: "Cooldown swim",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "distance",
                  distanceM: 200,
                  timeMin: null,
                  targetSummary: "",
                  notes: "Finish easy.",
                },
                {
                  id: "cooldown-rest-1",
                  category: "rest",
                  name: "Cooldown rest",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 1,
                  targetSummary: "",
                  notes: "",
                },
              ],
            }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent("Warmup");
    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "400m · Freestyle · Easy · Rest 0:30"
    );
    expect(screen.queryByTestId("session-draft-step-summary-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-summary-2")).toHaveTextContent("Cooldown");
    expect(screen.getByTestId("session-draft-step-summary-2")).toHaveTextContent("Rest 1:00");
    expect(screen.queryByTestId("session-draft-step-summary-3")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    expect(screen.getByTestId("session-draft-step-linked-rest-panel-0")).toBeVisible();
    expect(screen.getByTestId("session-draft-step-linked-rest-time-0")).toHaveValue("0:30");

    fireEvent.click(screen.getByTestId("session-draft-step-linked-rest-remove-0"));
    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "400m · Freestyle · Easy"
    );
    expect(screen.getByTestId("session-draft-step-summary-0")).not.toHaveTextContent("Rest 0:30");
    expect(screen.getByTestId("session-draft-step-linked-rest-add-0")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-step-linked-rest-add-0"));
    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "400m · Freestyle · Easy · Rest 0:30"
    );
  });

  it("keeps attached rest tied to the parent block for delete and add-after actions", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({
              sourceFingerprint: "manual-attached-rest-actions",
              steps: [
                {
                  id: "warmup-1",
                  category: "warmup",
                  name: "Warmup swim",
                  stroke: "freestyle",
                  intensity: "easy",
                  durationMode: "distance",
                  distanceM: 400,
                  timeMin: null,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "warmup-rest-1",
                  category: "rest",
                  name: "Warmup rest",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 0.5,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "main-1",
                  category: "main",
                  name: "Main swim",
                  stroke: "freestyle",
                  intensity: "moderate",
                  durationMode: "distance",
                  distanceM: 200,
                  timeMin: null,
                  targetSummary: "",
                  notes: "",
                },
              ],
            }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-step-add-after-0"));

    let previewDraft = readPreviewDraft();
    expect(previewDraft.steps.map((step) => step.id)).toEqual([
      "warmup-1",
      "warmup-rest-1",
      expect.stringMatching(/^step-/),
      "main-1",
    ]);

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-step-remove-0"));
    fireEvent.click(screen.getByTestId("workout-editor-removal-confirm-button"));

    previewDraft = readPreviewDraft();
    expect(previewDraft.steps).toHaveLength(2);
    expect(previewDraft.steps.some((step) => step.id === "warmup-1")).toBe(false);
    expect(previewDraft.steps.some((step) => step.id === "warmup-rest-1")).toBe(false);
  });

  it("does not auto-create a trailing rest when adding a new top-level step at the end", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-add-step-no-rest" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-step"));

    const previewDraft = readPreviewDraft();
    const lastStep = previewDraft.steps.at(-1);

    expect(lastStep?.category).not.toBe("rest");
    expect(
      previewDraft.steps.filter((step) => !step.repeatGroupId && !step.postSetRestForRepeatGroupId)
    ).toHaveLength(2);
    expect(screen.getByTestId("session-draft-step-linked-rest-add-1")).toBeVisible();
  });

  it("shows inline conflict handling before removing post-set rest from repeats", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-repeat-rest-conflict" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    const repeatEndingRestMode = screen.getAllByTestId(/session-draft-repeat-ending-rest-mode-/)[0];
    const repeatSummary = screen.getAllByTestId(/session-draft-repeat-summary-/)[0];

    fireEvent.change(repeatEndingRestMode, {
      target: { value: "use_last_rest" },
    });

    expect(screen.getByText("This creates two rests in a row.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Use separate rest step" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Use repeat rest time" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Keep both" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Use repeat rest time" }));
    expect(
      screen.getByText("Delete the separate rest step and use repeat rest time?")
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Delete rest step" }));

    const previewDraft = readPreviewDraft();
    expect(previewDraft.steps.some((step) => step.postSetRestForRepeatGroupId)).toBe(false);
    expect(screen.queryByText("This creates two rests in a row.")).not.toBeInTheDocument();
    expect(repeatSummary).toHaveTextContent("4 x 100m · Freestyle · Moderate · Interval rest 0:30");
  });

  it("does not seed scaffold note copy into a fresh manual pool session", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildManualWorkoutEmptyDraft(new Date("2026-04-15T08:00:00.000Z")),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByText("Keep the first 200m relaxed and long.")).not.toBeInTheDocument();
    expect(screen.queryByText("Use this as a simple fixed rest block.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Replace this with your exact set structure.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Adjust or remove when you refine the workout.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Swap stroke or distance as needed.")).not.toBeInTheDocument();
  });

  it("supports confirm and undo when removing a repeat block", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));

    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");

    fireEvent.click(screen.getByTestId("session-draft-repeat-remove-1"));

    expect(screen.getByTestId("workout-editor-removal-confirm")).toHaveTextContent(
      "Repeat block (3 steps, 4 rounds)"
    );
    expect(screen.getByTestId("workout-editor-repeat-group-1")).toHaveClass(
      "border-dashed",
      "border-rose-300"
    );
    expect(screen.getByTestId("workout-editor-repeat-group-1")).toHaveTextContent(
      "Will be removed"
    );

    fireEvent.click(screen.getByTestId("workout-editor-removal-confirm-button"));

    expect(screen.queryByTestId("session-draft-repeat-count-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-editor-removal-undo")).toHaveTextContent(
      "Deleted Repeat block (3 steps, 4 rounds)."
    );

    fireEvent.click(screen.getByTestId("workout-editor-removal-undo-button"));

    expect(screen.queryByTestId("workout-editor-removal-undo")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");
  });

  it("duplicates a repeat block with a new repeat group identity", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.click(screen.getByTestId("session-draft-repeat-duplicate-1"));

    fireEvent.click(screen.getByTestId("session-draft-repeat-toggle-1"));
    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");
    fireEvent.click(screen.getByTestId("session-draft-repeat-toggle-2"));
    expect(screen.getByTestId("session-draft-repeat-count-2")).toHaveValue("4");
    expect(screen.getByTestId("session-draft-step-name-4")).toHaveValue("Repeat swim");

    fireEvent.change(screen.getByTestId("session-draft-repeat-count-2"), {
      target: { value: "6" },
    });

    const previewDraft = readPreviewDraft();
    const repeatSteps = previewDraft.steps.filter((step) => step.repeatGroupId);

    expect(repeatSteps).toHaveLength(4);
    expect(repeatSteps[0]?.repeatGroupId).toBeTruthy();
    expect(repeatSteps[2]?.repeatGroupId).toBeTruthy();
    expect(repeatSteps[0]?.repeatGroupId).not.toBe(repeatSteps[2]?.repeatGroupId);
    expect(repeatSteps.slice(0, 2).every((step) => step.repeatCount === 4)).toBe(true);
    expect(repeatSteps.slice(2).every((step) => step.repeatCount === 6)).toBe(true);
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
  });

  it("inserts blank steps inside and after a repeat block with the right repeat boundaries", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));

    const repeatGroupIdBeforeInsert =
      readPreviewDraft().steps.find((step) => step.repeatGroupId)?.repeatGroupId ?? null;

    expect(repeatGroupIdBeforeInsert).toBeTruthy();

    fireEvent.click(screen.getByTestId("session-draft-step-add-after-1"));

    expect(screen.getByTestId("session-draft-step-name-2")).toHaveValue("Repeat step");

    let previewDraft = readPreviewDraft();

    expect(previewDraft.steps).toHaveLength(5);
    expect(previewDraft.steps[2]).toMatchObject({
      name: "Repeat step",
      repeatGroupId: repeatGroupIdBeforeInsert,
      repeatCount: 4,
    });

    fireEvent.click(screen.getByTestId("session-draft-repeat-add-step-after-1"));

    previewDraft = readPreviewDraft();

    expect(previewDraft.steps).toHaveLength(6);
    expect(previewDraft.steps[5]).toMatchObject({
      name: "Custom step",
    });
    expect(previewDraft.steps[5]?.repeatGroupId ?? null).toBeNull();
    expect(screen.getByTestId("session-draft-step-name-5")).toHaveValue("Custom step");
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
  });

  it("keeps step cards summary-first until the user opens them for editing", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByTestId("session-draft-step-name-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Edit");

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.getByTestId("session-draft-step-name-0")).toHaveValue("Easy warmup swim");
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Done");

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.queryByTestId("session-draft-step-name-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Edit");
  });

  it("adds stable bottom done actions for open steps and repeat editors", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.getByTestId("session-draft-step-done-bottom-0")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-step-done-bottom-0"));

    expect(screen.queryByTestId("session-draft-step-name-0")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    if (screen.queryAllByTestId(/session-draft-repeat-done-bottom-/).length === 0) {
      fireEvent.click(screen.getAllByTestId(/session-draft-repeat-toggle-/)[0]);
    }

    const repeatDoneButton = screen.getAllByTestId(/session-draft-repeat-done-bottom-/)[0];

    expect(repeatDoneButton).toBeVisible();

    fireEvent.click(repeatDoneButton);

    expect(screen.queryAllByTestId(/session-draft-repeat-done-bottom-/)).toHaveLength(0);
  });

  it("builds a truthful handoff preview and supports copy/download actions", async () => {
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });

    const createUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://127.0.0.1/mock-handoff");
    const revokeUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openSupportToolsPanel();
    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-toggle"));
    fireEvent.click(screen.getByTestId("workout-editor-handoff-toggle"));

    expect(screen.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "canonical"
    );
    expect(screen.getByTestId("workout-editor-handoff-preview")).toHaveTextContent(
      "Source: Canonical workout"
    );
    expect(screen.getByTestId("workout-editor-handoff-preview")).toHaveTextContent(
      "Title: Accepted threshold workout"
    );
    expect(screen.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );
    expect(screen.getByTestId("workout-editor-garmin-export-preview")).toHaveTextContent(
      '"kind": "freeswimming_garmin_ready_workout_v1"'
    );
    expect(screen.getByTestId("workout-editor-garmin-export-preview")).toHaveTextContent(
      '"draftState": "canonical"'
    );

    openWorkoutMetadataPanel();
    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Local handoff workout" },
    });
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-0"), {
      target: { value: "reverse_im_order" },
    });

    expect(screen.getByTestId("workout-editor-handoff-source")).toHaveAttribute(
      "data-handoff-state",
      "local_draft"
    );
    expect(screen.getByTestId("workout-editor-handoff-preview")).toHaveTextContent(
      "Source: Local draft"
    );
    expect(screen.getByTestId("workout-editor-handoff-preview")).toHaveTextContent(
      "Title: Local handoff workout"
    );
    expect(screen.getByTestId("workout-editor-handoff-preview")).toHaveTextContent(
      "Reverse IM order (RIMO)"
    );
    expect(screen.getByTestId("workout-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "local_draft"
    );
    expect(screen.getByTestId("workout-editor-garmin-export-preview")).toHaveTextContent(
      '"draftState": "local_draft"'
    );
    expect(screen.getByTestId("workout-editor-garmin-export-preview")).toHaveTextContent(
      '"title": "Local handoff workout"'
    );
    expect(screen.getByTestId("workout-editor-garmin-export-preview")).toHaveTextContent(
      '"reviewIssueIds": ['
    );

    fireEvent.click(screen.getByTestId("workout-editor-handoff-copy"));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining("Title: Local handoff workout")
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-handoff-notice")).toHaveTextContent(
        "Workout handoff copied."
      );
    });

    fireEvent.click(screen.getByTestId("workout-editor-handoff-download"));

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-handoff-notice")).toHaveTextContent(
        `Downloaded ${buildWorkoutHandoffFileName(
          {
            ...buildDraft(),
            title: "Local handoff workout",
          },
          { draftState: "local_draft" }
        )}.`
      );
    });

    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-download"));

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(2);
      expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByTestId("workout-editor-garmin-export-notice")).toHaveTextContent(
        `Downloaded ${buildWorkoutGarminReadyExportFileName(
          {
            ...buildDraft(),
            title: "Local handoff workout",
          },
          { draftState: "local_draft" }
        )}.`
      );
    });
    expect(revokeUrlSpy).toHaveBeenCalledTimes(0);
  });

  it("opens truthful PDF and poolside note views for the current draft state", async () => {
    const writtenDocuments: string[] = [];
    const pdfWindow = buildMockPrintWindow(writtenDocuments);
    const poolsideWindow = { focus: vi.fn() };
    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL");
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValueOnce(pdfWindow as unknown as Window)
      .mockReturnValueOnce(poolsideWindow as unknown as Window);

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary()}
        trainingFocusOptions={buildTrainingFocusOptions()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openWorkoutMetadataPanel();
    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Local PDF workout" },
    });
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-0"), {
      target: { value: "reverse_im_order" },
    });

    expect(screen.getByTestId("workout-editor-pdf-source")).toHaveAttribute(
      "data-pdf-state",
      "local_draft"
    );
    expect(screen.getByTestId("workout-editor-pdf-open")).toBeVisible();
    expect(screen.getByTestId("workout-editor-poolside-pdf-open")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-editor-pdf-open"));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("", "_blank");
    });

    const pdfHtml = writtenDocuments[0] ?? "";

    expect(pdfHtml).toContain("Local PDF workout");
    expect(pdfHtml).toContain("Workout PDF");
    expect(pdfHtml).toContain("--accent: #1d4ed8;");
    expect(pdfHtml).toContain("Source: Local draft");
    expect(pdfHtml).toContain("Reverse IM order (RIMO)");
    expect(pdfHtml).toContain(
      "<title>freeswimming-local-pdf-workout-draft.pdf - FreeSwimming</title>"
    );
    expect(pdfWindow.document.open).toHaveBeenCalledTimes(1);
    expect(pdfWindow.document.close).toHaveBeenCalledTimes(1);
    expect(pdfWindow.focus).toHaveBeenCalledTimes(1);
    expect(createObjectUrlSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("workout-editor-pdf-notice")).toHaveTextContent(
      `Opened PDF for ${buildWorkoutPdfFileName(
        {
          ...buildDraft(),
          title: "Local PDF workout",
        },
        { draftState: "local_draft", variant: "standard" }
      )}. Use Print / Save PDF in that tab.`
    );

    expect(screen.queryByText("Print options")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Style, layout, notation, and rest layout stay in Print Preview.")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("workout-editor-poolside-pdf-open"));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledTimes(2);
    });

    const poolsidePreviewHref = openSpy.mock.calls[1]?.[0] as string;
    expect(poolsidePreviewHref).toContain("/my-library/workouts/poolside-preview?previewId=");
    expect(poolsidePreviewHref).toContain("printStyle=color");
    expect(poolsidePreviewHref).toContain("printLayout=portrait");
    expect(poolsidePreviewHref).toContain("notationMode=auto");
    expect(poolsidePreviewHref).toContain("restLayout=auto");
    expect(openSpy.mock.calls[1]?.[1]).toBe("_blank");
    expect(openSpy.mock.calls[1]?.[2]).toBe("noopener,noreferrer");

    const poolsidePreviewUrl = new URL(poolsidePreviewHref, "http://localhost");
    const previewId = poolsidePreviewUrl.searchParams.get("previewId");
    expect(previewId).toBeTruthy();

    const storedPreview = readStoredWorkoutPoolsidePreviewDraft(previewId ?? "");
    expect(storedPreview?.draftState).toBe("local_draft");
    expect(storedPreview?.draft.title).toBe("Local PDF workout");
    expect(storedPreview?.draft.steps[0]?.stroke).toBe("reverse_im_order");
    expect(storedPreview?.focusPoints).toEqual([
      "High elbow catch: Keep the forearm vertical before pressing back.",
    ]);
    expect(poolsideWindow.focus).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("workout-editor-pdf-notice")).toHaveTextContent(
      `Opened Print Preview for ${buildWorkoutPdfFileName(
        {
          ...buildDraft(),
          title: "Local PDF workout",
        },
        { draftState: "local_draft", variant: "poolside" }
      )}. Finish layout and print settings in that tab.`
    );
  }, 30000);

  it("collapses the metadata panel by default for saved builder sessions and reopens on demand", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText("Accepted threshold workout")).toBeVisible();
    expect(screen.queryByText("Title through equipment")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Collapsed while you work on the session itself. Open anytime to change title, environment, or equipment."
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-title")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-editor-metadata-summary")).toHaveTextContent(
      "400m · ~10 min · Moderate"
    );

    fireEvent.click(screen.getByTestId("workout-editor-metadata-toggle"));

    expect(screen.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Accepted threshold workout");
  });

  it("shows a simplified metadata panel for manual workouts", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: {
              ...buildDraft(),
              sourceFingerprint: "manual-20260410",
              title: "Manual pool workout",
              description: "Manual notes for the session.",
              sessionType: "endurance",
              effort: "moderate",
            },
          }),
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openWorkoutMetadataPanel();
    expect(screen.getByText("Manual pool workout")).toBeVisible();
    expect(screen.getByLabelText("Session note")).toBeVisible();
    expect(screen.queryByText("Description")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Session type" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Effort" })).not.toBeInTheDocument();
    expect(screen.queryByText("Title through equipment")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Optional. Use this for the whole-workout purpose, pacing intent, or one short coaching note that applies across the session."
      )
    ).not.toBeInTheDocument();
  });

  it("keeps the full metadata controls for non-manual workout sources", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openWorkoutMetadataPanel();
    expect(screen.getByText("Description")).toBeVisible();
    expect(screen.getByTestId("session-draft-description")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Session type" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Effort" })).toBeVisible();
  });

  it("uses pool-swim field parity for manual builder workouts", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-pool-field-parity-2" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByText("Accepted threshold workout")).toBeVisible();
    expect(screen.getByText("Session note")).toBeVisible();
    expect(screen.queryByText("Environment")).not.toBeInTheDocument();
    expect(screen.getByText("Pool Size")).toBeVisible();
    expect(screen.getByRole("button", { name: "Meters" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Yards" })).toBeVisible();
    expect(screen.getByRole("button", { name: "25m" })).toBeVisible();
    expect(screen.getByRole("button", { name: "50m" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "33.33m" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Exact pool size (m)")).toHaveValue("25");
    expect(screen.getByTestId("workout-editor-pool-size-inline-row")).toHaveAttribute(
      "data-layout",
      "compact-inline"
    );
    expect(
      within(screen.getByTestId("workout-editor-pool-size-panel")).queryByText("Unit")
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("workout-editor-pool-size-panel")).queryByText("Common sizes")
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("workout-editor-pool-size-panel")).queryByText("Exact size")
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Session type" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Effort" })).not.toBeInTheDocument();
    expect(screen.queryByText("Training profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Session strokes")).not.toBeInTheDocument();
    expect(screen.queryByText("Equipment")).not.toBeInTheDocument();
  });

  it("resets pool-size unit switches to fresh defaults instead of converting the current exact value", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-pool-unit-defaults" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.change(screen.getByLabelText("Exact pool size (m)"), {
      target: { value: "33.33" },
    });
    expect(screen.getByLabelText("Exact pool size (m)")).toHaveValue("33.33");

    fireEvent.click(screen.getByTestId("workout-editor-pool-length-unit-yd"));
    expect(screen.getByLabelText("Exact pool size (yd)")).toHaveValue("25");

    fireEvent.click(screen.getByTestId("workout-editor-pool-length-unit-m"));
    expect(screen.getByLabelText("Exact pool size (m)")).toHaveValue("25");
  });

  it("locks open-water manual workouts to the open-water builder surface", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({
              sourceFingerprint: "manual-open-water-lock",
              environment: "open_water",
              poolLengthM: null,
              description: "Long aerobic open water work.",
            }),
          }),
          recentWorkouts: [
            buildWorkoutSummary({
              sourceKind: "manual",
              environment: "open_water",
              poolLengthM: null,
              previewText: "Open water aerobic session\n\nTotal: ~45 min",
            }),
          ],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByText("Accepted threshold workout")).toBeVisible();
    expect(screen.getByText("Session note")).toBeVisible();
    expect(screen.queryByText("Environment")).not.toBeInTheDocument();
    expect(screen.queryByText("Pool length")).not.toBeInTheDocument();
  });

  it("keeps training profile fields visible for AI-origin workouts", async () => {
    render(
      <WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} preferExpandedDetailsOnLoad />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByText("Accepted threshold workout")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Session type" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Effort" })).toBeVisible();
    expect(screen.queryByTestId("workout-editor-metadata-profile-toggle")).not.toBeInTheDocument();
  });

  it("switches the saved builder into a clean view mode with targeted edit entry points", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-view-mode" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-session-total")).toHaveTextContent("400m");

    expect(screen.getByTestId("workout-editor-builder-mode-edit")).toBeVisible();
    expect(screen.getByTestId("workout-editor-builder-mode-rearrange")).toBeVisible();
    expect(screen.getByTestId("workout-editor-builder-mode-view")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-view"));

    expect(screen.queryByTestId("session-draft-add-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-add-repeat")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-editor-metadata-toggle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-step-toggle-0")).not.toBeInTheDocument();
    expect(screen.getByText("Session steps")).toBeVisible();
    expect(screen.getByText("Warmup")).toBeVisible();
    expect(screen.getByText("400m · Freestyle · Easy")).toBeVisible();
    expect(screen.queryByText("Edit step")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit repeat")).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/workout-editor-view-section-/)).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /400m · Freestyle · Easy/i }));

    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByLabelText("Step Type")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-view"));
    expect(screen.getAllByTestId(/workout-editor-view-section-/).length).toBeGreaterThanOrEqual(2);
    const repeatViewCard = screen.getByTestId(/workout-editor-view-repeat-/);
    fireEvent.click(repeatViewCard);

    expect(screen.getByLabelText("Repeat count")).toBeVisible();
    expect(screen.queryByLabelText("Step Type")).not.toBeInTheDocument();
  });

  it("keeps view mode sections in workout order with calm section accents and parent-linked rest", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({
              sourceFingerprint: "manual-view-structure",
              steps: [
                {
                  id: "warmup-1",
                  category: "warmup",
                  name: "Warmup swim",
                  stroke: "freestyle",
                  intensity: "easy",
                  durationMode: "distance",
                  distanceM: 400,
                  timeMin: null,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "warmup-rest-1",
                  category: "rest",
                  name: "Warmup rest",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 0.5,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "main-1",
                  category: "main",
                  name: "Main swim",
                  stroke: "freestyle",
                  intensity: "moderate",
                  durationMode: "distance",
                  distanceM: 200,
                  timeMin: null,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "warmup-2",
                  category: "warmup",
                  name: "Warmup reset",
                  stroke: "backstroke",
                  intensity: "easy",
                  durationMode: "distance",
                  distanceM: 100,
                  timeMin: null,
                  targetSummary: "",
                  notes: "",
                },
                {
                  id: "warmup-rest-2",
                  category: "rest",
                  name: "Warmup reset rest",
                  stroke: "choice",
                  intensity: "easy",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 1,
                  targetSummary: "",
                  notes: "",
                },
              ],
            }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-view"));

    const sections = screen.getAllByTestId(/workout-editor-view-section-/);
    expect(sections).toHaveLength(3);
    expect(sections.map((section) => section.getAttribute("data-view-category"))).toEqual([
      "warmup",
      "main",
      "warmup",
    ]);

    expect(sections[0]).toHaveClass("border-l-4", "border-l-sky-400");
    expect(sections[1]).toHaveClass("border-l-4", "border-l-blue-500");
    expect(within(sections[0]).getByText("Warmup")).toHaveClass("text-sky-700");
    expect(within(sections[1]).getByText("Main")).toHaveClass("text-blue-700");

    expect(within(sections[0]).getByText("400m · Freestyle · Easy")).toBeVisible();
    expect(within(sections[0]).getByText("Rest 0:30")).toBeVisible();
    expect(within(sections[2]).getByText("100m · Backstroke · Easy")).toBeVisible();
    expect(within(sections[2]).getByText("Rest 1:00")).toBeVisible();

    expect(screen.queryByText("1 of 2")).not.toBeInTheDocument();
    expect(screen.queryByText("2 of 2")).not.toBeInTheDocument();
    expect(
      sections.filter((section) => section.getAttribute("data-view-category") === "rest")
    ).toHaveLength(0);
  });

  it("uses rearrange as a separate ordering mode without opening edit and keeps top-level moves in one place", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ sourceFingerprint: "manual-rearrange-mode" }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    openWorkoutMetadataPanel();
    expect(screen.getByTestId("session-draft-title")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.click(screen.getByTestId("workout-editor-builder-mode-rearrange"));

    expect(screen.queryByTestId("session-draft-title")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-editor-metadata-toggle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-add-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-add-repeat")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-step-toggle-0")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-draft-repeat-toggle-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-rearrange-controls-0")).toBeVisible();
    expect(screen.getByTestId("session-draft-repeat-rearrange-controls-1")).toBeVisible();

    fireEvent.click(getDesktopSummaryCard("session-draft-step-summary-0"));
    expect(screen.queryByLabelText("Step Type")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-draft-step-rearrange-move-down-0"));

    const previewDraft = readPreviewDraft();
    expect(previewDraft.steps[0]?.repeatGroupId).not.toBeNull();
    expect(previewDraft.steps.at(-1)?.id).toBe("step-1");
  });

  it("keeps existing step summaries stable when switching pool units", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "400m · Freestyle · Easy"
    );
    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));

    const repeatSummary = screen.getAllByTestId(/session-draft-repeat-summary-/)[0];

    expect(repeatSummary).toHaveTextContent(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30 · Set rest 0:30"
    );

    fireEvent.click(screen.getByRole("button", { name: "Yards" }));

    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "400m · Freestyle · Easy"
    );
    expect(screen.getByTestId("session-draft-step-summary-0")).not.toHaveTextContent("437.45yd");
    expect(screen.getAllByTestId(/session-draft-repeat-summary-/)[0]).toHaveTextContent(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30 · Set rest 0:30"
    );
    expect(screen.getAllByTestId(/session-draft-repeat-summary-/)[0]).not.toHaveTextContent(
      "109.36yd"
    );
  });

  it("keeps custom step distance inputs in their authored unit after a global unit switch", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Yards" }));
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-distance-0"), {
      target: { value: "custom" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("session-draft-step-distance-custom-0")).toHaveFocus();
    });

    fireEvent.change(screen.getByTestId("session-draft-step-distance-custom-0"), {
      target: { value: "333" },
    });

    expect(screen.getByLabelText("Custom distance (yd)")).toHaveValue("333");
    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "333yd · Freestyle · Easy"
    );

    fireEvent.click(screen.getByRole("button", { name: "Meters" }));

    expect(screen.getByLabelText("Custom distance (yd)")).toHaveValue("333");
    expect(screen.getByTestId("session-draft-step-summary-0")).toHaveTextContent(
      "333yd · Freestyle · Easy"
    );
    expect(screen.getByTestId("session-draft-step-summary-0")).not.toHaveTextContent("304.5m");
  });

  it("shows custom distance only when selected and hides it again when a preset is restored", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.queryByTestId("session-draft-step-distance-custom-0")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("session-draft-step-distance-0"), {
      target: { value: "custom" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("session-draft-step-distance-custom-0")).toHaveFocus();
    });

    fireEvent.change(screen.getByTestId("session-draft-step-distance-0"), {
      target: { value: "200" },
    });

    expect(screen.queryByTestId("session-draft-step-distance-custom-0")).not.toBeInTheDocument();
  });

  it("opens desktop step and repeat cards from the card body on fine-pointer layouts", async () => {
    stubMatchMedia(true);

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    await waitFor(() => {
      expect(getDesktopSummaryCard("session-draft-step-summary-0")).toHaveAttribute(
        "data-desktop-card-clickable",
        "true"
      );
    });

    fireEvent.click(getDesktopSummaryCard("session-draft-step-summary-0"));
    expect(screen.getByLabelText("Step Type")).toBeVisible();

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.click(screen.getByTestId("session-draft-repeat-toggle-1"));

    await waitFor(() => {
      expect(getDesktopSummaryCard("session-draft-repeat-summary-1")).toHaveAttribute(
        "data-desktop-card-clickable",
        "true"
      );
    });

    fireEvent.click(getDesktopSummaryCard("session-draft-repeat-summary-1"));

    expect(screen.getByLabelText("Repeat count")).toBeVisible();

    fireEvent.click(getDesktopSummaryCard("session-draft-step-summary-1"));
    expect(screen.getByTestId("session-draft-step-duration-mode-1")).toBeVisible();
  });

  it("keeps desktop full-card edit disabled on coarse-pointer layouts", async () => {
    stubMatchMedia(false);

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    await waitFor(() => {
      expect(getDesktopSummaryCard("session-draft-step-summary-0")).toHaveAttribute(
        "data-desktop-card-clickable",
        "false"
      );
    });

    fireEvent.click(getDesktopSummaryCard("session-draft-step-summary-0"));
    expect(screen.queryByLabelText("Step Type")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    expect(screen.getByLabelText("Step Type")).toBeVisible();
  });

  it("shows clearer kick and drill taxonomy guidance inside the step form", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.getByText("Stroke pattern")).toBeVisible();
    expect(screen.getByText("Focus tag")).toBeVisible();
    expect(
      screen.getByText(
        "Use Stroke pattern for the swim pattern. Add Focus tag only when the step needs extra drill, kick, or pull notation."
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        "Optional. Leave Focus tag on None unless the step needs extra drill, kick, or pull notation."
      )
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "kick" },
    });

    expect(screen.getByTestId("session-draft-step-drill-type-0")).toHaveValue("kick");
    expect(
      screen.getByText(
        "Kick category already tags this as kick work. Use Stroke pattern for the movement pattern this set supports, and change Focus tag only when you need extra kick, pull, or drill notation."
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        "Recommended Focus tag: Kick. Change it only when this kick set needs a more specific drill or pull note."
      )
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "drill" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-drill-type-0"), {
      target: { value: "none" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-0"), {
      target: { value: "drill" },
    });

    expect(screen.getByTestId("session-draft-step-drill-type-0")).toHaveValue("drill");
    expect(
      screen.getByText(
        "Drill shell is active. Use Stroke pattern for the base movement, and use Focus tag to clarify whether the drill is general, kick, or pull."
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        "Recommended Focus tag: Drill. Switch it to Kick or Pull only when this drill set needs that extra label."
      )
    ).toBeVisible();
  });

  it("uses Garmin-style pool step wording inside the manual pool builder", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.getByText("Session steps")).toBeVisible();
    expect(screen.getByLabelText("Step Type")).toBeVisible();
    expect(screen.getByLabelText("Stroke Type")).toBeVisible();
    expect(screen.getByLabelText("Drill Type")).toBeVisible();
    expect(screen.getByLabelText("Duration")).toBeVisible();
    expect(screen.getByLabelText("Target")).toBeVisible();
    expect(screen.getByLabelText("Notes")).toBeVisible();
    expect(screen.getByRole("option", { name: "Distance" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Time" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Lap Button Press" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Fixed Rest Time" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Send-Off Time" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "CSS-Based Send-Off Time" })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Step name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Effort cue")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Target summary")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Target notes")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Use Stroke pattern for the swim pattern. Add Drill type only when the step needs extra drill, kick, or pull notation."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Optional. Leave Drill type on None unless the step needs extra drill, kick, or pull notation."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("This step stays open until the swimmer advances with the lap button.")
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("session-draft-step-target-mode-0"), {
      target: { value: "effort" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-target-effort-0"), {
      target: { value: "moderate" },
    });

    await waitFor(() => {
      expect(readPreviewDraft().steps[0]).toMatchObject({
        targetMode: "effort",
        effortTarget: "moderate",
        name: expect.stringContaining("Moderate"),
      });
    });

    fireEvent.change(screen.getByTestId("session-draft-step-duration-mode-0"), {
      target: { value: "lap_button_press" },
    });

    expect(
      screen.queryByText("This step stays open until the swimmer advances with the lap button.")
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Step Type"), {
      target: { value: "rest" },
    });

    expect(screen.getByTestId("session-draft-step-duration-mode-0")).toHaveValue("fixed_rest");
    expect(screen.queryByLabelText("Stroke Type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Drill Type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Target")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fixed Rest Time" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Send-Off Time" })).toBeVisible();
    expect(screen.getByRole("option", { name: "CSS-Based Send-Off Time" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Lap Button Press" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Distance" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Time" })).not.toBeInTheDocument();
    expect(readPreviewDraft().steps[0]).toMatchObject({
      category: "rest",
      durationMode: "fixed_rest",
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    expect(screen.getByTestId("session-draft-repeat-ending-rest-mode-1")).toHaveValue(
      "skip_last_rest"
    );
    expect(
      screen.queryByText("Edit this into the exact repeat you want to hold.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Adjust or remove this recovery once the set is dialed in.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Move the full repeat block from the header.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Inside the repeat: work interval, then between-interval recovery. After the set: separate post-set rest."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Fixed Rest Time 1:00 still runs between rounds. It is skipped only after the final round."
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Final rest skipped")).not.toBeInTheDocument();
  }, 30000);

  it("uses a single MM:SS field for manual-pool time duration editing", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(screen.getByTestId("session-draft-step-duration-mode-0"), {
      target: { value: "time" },
    });

    const timeInput = screen.getByTestId("session-draft-step-time-0");
    fireEvent.focus(timeInput);
    fireEvent.change(timeInput, { target: { value: "1:30" } });
    fireEvent.blur(timeInput);

    expect(screen.getByTestId("session-draft-step-time-0")).toHaveValue("1:30");
    expect(readPreviewDraft().steps[0]).toMatchObject({
      durationMode: "time",
      timeMin: 1.5,
    });
  });

  it("normalizes legacy manual-pool mixed duration states on load", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({
              steps: [
                {
                  id: "step-1",
                  category: "main",
                  name: "Legacy mixed step",
                  stroke: "freestyle",
                  intensity: "moderate",
                  durationMode: "fixed_rest",
                  distanceM: null,
                  timeMin: 1,
                  targetSummary: "",
                  notes: "",
                },
              ],
            }),
          }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(readPreviewDraft().steps[0]).toMatchObject({
        category: "main",
        durationMode: "distance",
        distanceM: 100,
        timeMin: null,
      });
    });
  });

  it("hides the auto untitled pool title in the manual builder input until the owner edits it", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: buildDraft({ title: "Untitled pool session" }),
          }),
          recentWorkouts: [
            buildWorkoutSummary({ sourceKind: "manual", title: "Untitled pool session" }),
          ],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("session-draft-title")).toHaveValue("");

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Owner title" },
    });

    expect(screen.getByTestId("session-draft-title")).toHaveValue("Owner title");
    expect(readPreviewDraft().title).toBe("Owner title");
  });

  it("edits pool rest time with one MM:SS field while keeping canonical timeMin", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-add-repeat"));
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-2"));

    const restTimeInput = screen.getByTestId("session-draft-step-rest-time-2");
    expect(restTimeInput).toHaveValue("0:30");

    fireEvent.focus(restTimeInput);
    fireEvent.change(restTimeInput, {
      target: { value: "0:45" },
    });
    fireEvent.blur(restTimeInput);

    expect(readPreviewDraft().steps[2]?.timeMin).toBe(0.75);
    expect(readPreviewDraft().steps[2]?.name).toContain("Fixed Rest Time 0:45");
  });

  it("requires an exact pool size while invalid custom input still blocks save", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    fireEvent.change(screen.getByLabelText("Exact pool size (m)"), {
      target: { value: "3" },
    });

    expect(saveButton).toBeDisabled();
    expect(screen.queryByText(/Enter a valid pool size/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Exact pool size (m)"), {
      target: { value: "" },
    });

    expect(saveButton).toBeDisabled();
    expect(screen.queryByText(/Enter a valid pool size/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-editor-support-tools-status")).toHaveTextContent(
      "1 review item"
    );

    openSupportToolsPanel();
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness-summary")).toHaveTextContent(
      "Review 1 Garmin/export mapping detail before you treat this workout as handoff-ready."
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-readiness-toggle"));
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "no exact pool size set"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveTextContent(
      "Choose a pool size before Garmin/export handoff"
    );
  });

  it("converts exact yard pool sizes back into canonical meters on save", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: SessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          workout: buildWorkoutRecord({
            sourceKind: "manual",
            draft: body.draft,
          }),
          summary: buildWorkoutSummary({
            sourceKind: "manual",
            title: body.draft.title,
            poolLengthUnit: body.draft.poolLengthUnit,
            totalDistanceM: body.draft.totalDistanceM,
            estimatedDurationMin: body.draft.estimatedDurationMin,
          }),
        }),
      } as Response;
    });

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: buildWorkoutRecord({ sourceKind: "manual" }),
          recentWorkouts: [buildWorkoutSummary({ sourceKind: "manual" })],
        })}
        preferExpandedDetailsOnLoad
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("workout-editor-pool-length-unit-yd"));
    fireEvent.change(screen.getByLabelText("Exact pool size (yd)"), {
      target: { value: "33,33" },
    });

    expect(screen.getByLabelText("Exact pool size (yd)")).toHaveValue("33.33");
    expect(screen.queryByRole("button", { name: "33.33yd" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts/workout-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    const fetchBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: SessionDraft;
    };

    expect(fetchBody.draft.poolLengthUnit).toBe("yd");
    expect(fetchBody.draft.poolLengthM).toBe(30.477);
  });

  it("keeps long poolside focus lists on natural page scroll without redundant focus role labels", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary()}
        trainingFocusOptions={Array.from({ length: 10 }, (_, index) => ({
          id: `focus-${index + 1}`,
          title: `Focus ${index + 1}`,
          description: index === 0 ? "Hold the line before pressing back." : null,
          isPrimary: index === 0,
        }))}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-poolside-panel")).toHaveAttribute(
      "data-layout-mode",
      "stacked"
    );
    const focusList = screen.getByTestId("workout-editor-poolside-focus-list");
    expect(focusList).not.toHaveClass("overflow-y-auto");
    expect(within(focusList).queryByText("Primary focus")).not.toBeInTheDocument();
    expect(within(focusList).queryByText("Optional focus")).not.toBeInTheDocument();
    expect(within(focusList).getByText("Hold the line before pressing back.")).toBeVisible();
  });

  it("shows recovery guidance when the requested workout is missing", () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
          selectedWorkoutMissing: true,
        })}
      />
    );

    expect(screen.getByText("That saved swim session could not be found.")).toBeVisible();
    expect(screen.getByTestId("workout-builder-empty-create-pool")).toBeVisible();
    expect(screen.getByTestId("workout-builder-empty-create-open-water")).toBeVisible();
    expect(screen.queryByTestId("saved-workout-card-workout-1")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "AI-generated session" })).toHaveAttribute(
      "href",
      "/my-library/generator"
    );
    expect(screen.getByTestId("workout-builder-empty-view-sessions-link")).toHaveAttribute(
      "href",
      "/my-library/workouts"
    );
  });

  it("auto-dismisses workout pdf notices after a short delay", async () => {
    const printWindow = buildMockPrintWindow([]);

    vi.spyOn(window, "open").mockReturnValue(printWindow as unknown as Window);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    vi.useFakeTimers();
    act(() => {
      fireEvent.click(screen.getByTestId("workout-editor-pdf-open"));
    });
    expect(screen.queryByTestId("workout-editor-pdf-notice")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(WORKOUT_NOTICE_AUTO_DISMISS_MS);
    });

    expect(screen.queryByTestId("workout-editor-pdf-notice")).not.toBeInTheDocument();
  });

  it("shows saved sessions in browse mode, supports inline preview, and deletes a non-current workout deterministically", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        deletedWorkoutId: "workout-2",
      }),
    } as Response);

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
          recentWorkouts: [
            buildWorkoutSummary(),
            buildWorkoutSummary({
              id: "workout-2",
              title: "Old QA cleanup workout",
              totalDistanceM: 1600,
              estimatedDurationMin: 37,
              previewSections: [
                {
                  key: "warmup-0",
                  title: "Warmup",
                  rows: [
                    {
                      text: "8 x 25m Kick · Easy",
                      secondaryText: "Rest 0:20",
                    },
                  ],
                },
                {
                  key: "main-1",
                  title: "Main",
                  rows: [
                    {
                      text: "4 x 100m · Freestyle · Moderate",
                      secondaryText: "Interval rest 0:30",
                    },
                  ],
                },
              ],
            }),
          ],
        })}
        browseOnly
        trainingFocusOptions={buildTrainingFocusOptions()}
        swimmerName="Stian Vikra"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("saved-workout-card-workout-1")).toBeVisible();
    expect(screen.queryByTestId("saved-workout-current-workout-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workout-card-workout-2")).toBeVisible();
    expect(
      within(screen.getByTestId("saved-workout-card-workout-2")).queryByText("1600m")
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("saved-workout-card-workout-2")).queryByText(/updated/i)
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workouts-view-workout-2")).toBeVisible();
    expect(
      within(screen.getByTestId("saved-workout-card-workout-2")).getByRole("button", {
        name: "Quick View",
      })
    ).toBeVisible();

    fireEvent.click(screen.getByTestId("saved-workouts-view-workout-2"));
    expect(screen.queryByText("Quick preview")).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workouts-preview-workout-2")).toHaveTextContent("Warmup");
    expect(screen.getByTestId("saved-workouts-preview-workout-2")).toHaveTextContent("Main");
    expect(screen.getByTestId("saved-workouts-preview-workout-2")).toHaveTextContent(
      "8 x 25m Kick · Easy"
    );
    expect(screen.getByTestId("saved-workouts-preview-workout-2")).toHaveTextContent("Rest 0:20");
    expect(screen.getByTestId("saved-workouts-preview-workout-2")).toHaveTextContent("Total");
    expect(screen.queryByText("Select session")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("saved-workouts-poolside-workout-2"));
    expect(screen.getByTestId("saved-workout-poolside-workout-2-panel")).toBeVisible();
    expect(screen.getByText("Swimmer: Stian Vikra")).toBeVisible();
    expect(screen.queryByText("Print options")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Style, layout, notation, and rest layout stay in Print Preview.")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workout-poolside-workout-2-print-preview")).toHaveAttribute(
      "href",
      expect.stringContaining("/my-library/workouts/poolside-preview?workoutId=workout-2")
    );
    expect(screen.getByTestId("saved-workout-poolside-workout-2-print-preview")).toHaveAttribute(
      "href",
      expect.stringContaining("focusMode=custom")
    );
    expect(screen.getByTestId("saved-workout-poolside-workout-2-print-preview")).toHaveAttribute(
      "href",
      expect.stringContaining("notationMode=auto")
    );
    expect(screen.getByTestId("saved-workout-poolside-workout-2-print-preview")).toHaveAttribute(
      "href",
      expect.stringContaining("restLayout=auto")
    );
    fireEvent.click(screen.getByTestId("saved-workout-poolside-workout-2-focus-focus-2"));
    expect(
      screen.getByTestId("saved-workout-poolside-workout-2-print-preview").getAttribute("href")
    ).not.toContain("focusId=focus-2");

    fireEvent.click(screen.getByTestId("workout-builder-delete-workout-workout-2"));

    expect(screen.getByText("Delete this saved session from My Library?")).toBeVisible();
    expect(
      screen.getByText("Any unsaved builder edits for this session are discarded too.")
    ).toBeVisible();
    expect(screen.queryByText(/saved canonical session/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/unsaved local edits/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workout-builder-confirm-delete-workout-workout-2"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/my-library/workouts/workout-2", {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(screen.queryByTestId("saved-workout-card-workout-2")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Deleted Old QA cleanup workout.")).toBeVisible();
    expect(navigationState.refresh).toHaveBeenCalledTimes(1);
  });

  it("lets the owner delete the current workout without opening the saved-workouts list", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        deletedWorkoutId: "workout-1",
      }),
    } as Response);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByTestId("workout-builder-current-workout-actions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-builder-create-pool")).not.toBeInTheDocument();
    expect(screen.queryByTestId("workout-builder-create-open-water")).not.toBeInTheDocument();

    openWorkoutMetadataPanel();
    expect(screen.queryByTestId("workout-editor-danger-zone")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-builder-delete-current-workout")).toBeVisible();
    fireEvent.click(screen.getByTestId("workout-builder-delete-current-workout"));

    expect(screen.getByText("Delete this saved session?")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-builder-confirm-delete-current-workout"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/my-library/workouts/workout-1", {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith("/my-library");
    });

    expect(navigationState.refresh).not.toHaveBeenCalled();
  });

  it("shows pool, open-water, and AI entry actions in browse mode", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
        })}
        browseOnly
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByRole("button", { name: "Build pool session" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Build open water session" })).toBeVisible();
    expect(screen.getByRole("link", { name: "AI-generated session" })).toHaveAttribute(
      "href",
      "/my-library/generator"
    );
  });

  it("seeds a new local pool draft from the provided CSS pace", async () => {
    const storageKey = buildManualWorkoutLocalDraftStorageKey("user-1", "pool");

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
        })}
        manualPoolCssMetricSecondsPer100m={118}
        manualPoolCssPaceLabel="1:58"
        userId="user-1"
        manualLocalDraftMode="pool"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("session-draft-title")).toBeVisible();
    });

    const storedRaw = window.localStorage.getItem(storageKey);
    expect(storedRaw).not.toBeNull();

    const storedSnapshot = JSON.parse(String(storedRaw)) as {
      draft?: SessionDraft;
    };

    expect(storedSnapshot.draft?.basePaceSecondsPer100m).toBe(118);
    expect(storedSnapshot.draft?.usedCssPaceLabel).toBe("1:58");
  });

  it("can force session details open for a fresh manual-entry route", async () => {
    render(
      <WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} preferExpandedDetailsOnLoad />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("workout-editor-metadata-toggle")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByTestId("session-draft-title")).toBeVisible();
    expect(screen.queryByTestId("workout-editor-metadata-summary")).not.toBeInTheDocument();
  });

  it("renders the dedicated browse mode without the editor form", async () => {
    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
          recentWorkouts: [
            buildWorkoutSummary(),
            buildWorkoutSummary({
              id: "workout-2",
              title: "Follow-up session",
              totalDistanceM: 1800,
              estimatedDurationMin: 40,
            }),
          ],
        })}
        browseOnly
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByTestId("session-draft-title")).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workout-card-workout-1")).toBeVisible();
    expect(screen.getByTestId("saved-workout-card-workout-2")).toBeVisible();
    expect(screen.queryByTestId("workout-builder-view-sessions-link")).not.toBeInTheDocument();
  });

  it("shows all saved sessions immediately in browse mode and supports bulk delete cleanup", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    } as Response);

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
          recentWorkouts: [
            buildWorkoutSummary(),
            buildWorkoutSummary({
              id: "workout-2",
              title: "Threshold follow-up",
              totalDistanceM: 1800,
              estimatedDurationMin: 39,
            }),
            buildWorkoutSummary({
              id: "workout-3",
              title: "Kick reset session",
              totalDistanceM: 1500,
              estimatedDurationMin: 34,
            }),
            buildWorkoutSummary({
              id: "workout-4",
              title: "Long aerobic session",
              totalDistanceM: 2600,
              estimatedDurationMin: 52,
            }),
          ],
        })}
        browseOnly
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("saved-workout-card-workout-1")).toBeVisible();
    expect(screen.getByTestId("saved-workout-card-workout-2")).toBeVisible();
    expect(screen.getByTestId("saved-workout-card-workout-3")).toBeVisible();
    expect(screen.getByTestId("saved-workout-card-workout-4")).toBeVisible();
    expect(
      screen.queryByTestId("workout-builder-saved-sessions-load-more")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("workout-builder-saved-sessions-bulk-select-toggle"));
    expect(screen.queryByText("Select session")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Select Threshold follow-up")).toBeVisible();
    fireEvent.click(screen.getByTestId("saved-workout-select-workout-2"));
    fireEvent.click(screen.getByTestId("saved-workout-select-workout-4"));
    expect(screen.getByText("Delete selected sessions")).toBeVisible();
    fireEvent.click(screen.getByTestId("workout-builder-saved-sessions-bulk-delete"));

    expect(screen.getByText("Delete 2 saved sessions from My Library?")).toBeVisible();
    expect(screen.getAllByText("Delete selected sessions")).toHaveLength(2);

    fireEvent.click(screen.getByTestId("workout-builder-saved-sessions-bulk-confirm-delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/my-library/workouts/workout-2", {
        method: "DELETE",
      });
      expect(fetch).toHaveBeenCalledWith("/api/my-library/workouts/workout-4", {
        method: "DELETE",
      });
    });
  });

  it("recovers an existing local pool draft without loading a canonical session", async () => {
    const storageKey = buildManualWorkoutLocalDraftStorageKey("user-1", "pool");
    const recoveredDraft = buildManualWorkoutEmptyDraft(new Date("2026-04-18T09:00:00.000Z"));

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        mode: "pool",
        draft: {
          ...recoveredDraft,
          title: "Recovered local draft",
        },
        updatedAt: Date.now(),
      })
    );

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
        })}
        userId="user-1"
        manualLocalDraftMode="pool"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("session-draft-title")).toBeVisible();
    });

    expect(
      screen.getByText("Recovered your unsaved local pool draft on this device.")
    ).toBeVisible();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Recovered local draft");
    expect(screen.queryByTestId("saved-workout-card-workout-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-builder-view-sessions-link")).toHaveAttribute(
      "href",
      "/my-library/workouts"
    );
  });

  it("discards the current local draft without deleting any saved session", async () => {
    const storageKey = buildManualWorkoutLocalDraftStorageKey("user-1", "pool");
    const recoveredDraft = buildManualWorkoutEmptyDraft(new Date("2026-04-18T09:00:00.000Z"));

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        mode: "pool",
        draft: recoveredDraft,
        updatedAt: Date.now(),
      })
    );

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
        })}
        userId="user-1"
        manualLocalDraftMode="pool"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-discard-current-draft")).toBeVisible();
    });

    fireEvent.click(screen.getByTestId("workout-builder-discard-current-draft"));
    expect(screen.getByText("Discard this local draft?")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-builder-confirm-discard-current-draft"));

    await waitFor(() => {
      expect(window.localStorage.getItem(storageKey)).toBeNull();
    });

    expect(navigationState.replace).toHaveBeenCalledWith("/my-library/workouts");
    expect(screen.getByText("Discarded the local pool draft.")).toBeVisible();
    expect(screen.getByText("No saved swim session is loaded in this route yet.")).toBeVisible();
    expect(screen.queryByTestId("session-draft-title")).not.toBeInTheDocument();
  });

  it("creates the canonical workout only on the first explicit save from a local draft", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: SessionDraft;
        sourceKind?: string;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          workout: buildWorkoutRecord({
            id: "workout-created",
            sourceKind: "manual",
            draft: {
              ...body.draft,
              sourceFingerprint: "manual-empty-pool-saved",
            },
          }),
          summary: buildWorkoutSummary({
            id: "workout-created",
            sourceKind: "manual",
            title: body.draft.title,
          }),
        }),
      } as Response;
    });

    const storageKey = buildManualWorkoutLocalDraftStorageKey("user-1", "pool");

    render(
      <WorkoutBuilderHub
        workoutLibrary={buildWorkoutLibrary({
          selectedWorkout: null,
        })}
        userId="user-1"
        manualLocalDraftMode="pool"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("session-draft-title")).toBeVisible();
    });

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Saved from local draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    const request = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit | undefined;
    const body = JSON.parse(String(request?.body ?? "{}")) as {
      draft?: SessionDraft;
      sourceKind?: string;
    };

    expect(body.sourceKind).toBe("manual");
    expect(body.draft?.title).toBe("Saved from local draft");

    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith(
        "/my-library/workouts/workout-created?entry=manual-pool"
      );
    });

    expect(window.localStorage.getItem(storageKey)).toBeNull();
    expect(screen.queryByTestId("workout-builder-discard-current-draft")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeVisible();
    expect(screen.getByTestId("workout-builder-delete-current-workout")).toBeVisible();
  });
});
