import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutBuilderHub from "@/components/my-library/workouts/WorkoutBuilderHub";
import { WORKOUT_NOTICE_AUTO_DISMISS_MS } from "@/components/my-library/workouts/useAutoDismissNotice";
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
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildDraft(): SessionDraft {
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
  };
}

function buildWorkoutSummary(overrides?: Partial<WorkoutSummary>): WorkoutSummary {
  return {
    id: "workout-1",
    title: "Accepted threshold workout",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    updatedAt: "2026-03-20T12:20:00.000Z",
    acceptedAt: "2026-03-20T12:18:00.000Z",
    sourceKind: "ai_session_v1",
    status: "accepted",
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
  return JSON.parse(
    screen.getByTestId("session-generator-draft-preview").textContent ?? "{}"
  ) as SessionDraft;
}

describe("WorkoutBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
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
      "All builder changes are saved to the canonical workout."
    );
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
    expect(screen.getByTestId("workout-editor-reset")).toBeDisabled();

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
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId("session-draft-add-step"));
    fireEvent.change(screen.getByTestId("session-draft-step-name-3"), {
      target: { value: "CSS send-off rest" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-duration-mode-3"), {
      target: { value: "css_send_off" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-3"), {
      target: { value: "im_by_round" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-css-sendoff-offset-3"), {
      target: { value: "2" },
    });

    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this workout."
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness-summary")).toHaveTextContent(
      "Review 3 Garmin/export mapping details before you treat this workout as handoff-ready."
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-readiness-toggle"));
    expect(screen.getByTestId("workout-editor-garmin-readiness-issue-0")).toHaveTextContent("Pull");
    expect(screen.getByTestId("workout-editor-garmin-readiness-issue-1")).toHaveTextContent("Fins");
    expect(screen.getByTestId("workout-editor-garmin-readiness-issue-2")).toHaveTextContent(
      "IM by round"
    );
    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-toggle"));
    fireEvent.click(screen.getByTestId("workout-editor-handoff-toggle"));
    expect(screen.getByText(/Review the Garmin\/export notes above/i)).toBeVisible();
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
      expect(screen.getByText("Workout changes saved to the canonical workout.")).toBeVisible();
    });
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All builder changes are saved to the canonical workout."
    );
    expect(screen.getByTestId("workout-editor-garmin-readiness")).toHaveAttribute(
      "data-readiness-status",
      "review"
    );
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.getByTestId("workout-editor-reset")).toBeDisabled();

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
      name: "CSS send-off rest",
      stroke: "im_by_round",
      durationMode: "css_send_off",
      cssSendOffOffsetSeconds: 2,
    });
    expect(fetchBody.draft.allowedStrokes).toContain("backstroke");
    expect(fetchBody.draft.allowedStrokes).not.toContain("im_by_round");
    expect(fetchBody.draft.equipmentAllowlist).toContain("fins");
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Builder edited workout");
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));
    expect(screen.getByTestId("session-draft-step-distance-0")).toHaveValue("custom");
    expect(screen.getByTestId("session-draft-step-distance-custom-0")).toHaveValue("333");
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-1"));
    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Repeat swim focus");
    expect(screen.getByTestId("session-draft-step-distance-1")).toHaveValue("200");
    expect(screen.getByTestId("session-draft-step-stroke-1")).toHaveValue("backstroke");
    expect(screen.getByTestId("session-draft-step-drill-type-1")).toHaveValue("pull");
    expect(screen.getByTestId("session-draft-step-equipment-1")).toHaveValue("fins");
    expect(screen.getByTestId("session-draft-step-target-mode-1")).toHaveValue("css_target_pace");
    fireEvent.click(screen.getByTestId("session-draft-step-toggle-3"));
    expect(screen.getByTestId("session-draft-step-stroke-3")).toHaveValue("im_by_round");
  }, 15_000);

  it("can reset unsaved edits back to the last saved workout", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.change(screen.getByTestId("session-draft-title"), {
      target: { value: "Temporary builder title" },
    });
    fireEvent.change(screen.getByTestId("session-draft-description"), {
      target: { value: "Temporary builder description." },
    });

    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this workout."
    );
    expect(screen.getByTestId("workout-editor-reset")).toBeEnabled();

    fireEvent.click(screen.getByTestId("workout-editor-reset"));

    expect(
      screen.getByText("Unsaved builder edits were reset to the last saved workout.")
    ).toBeVisible();
    expect(screen.getByTestId("session-draft-title")).toHaveValue("Accepted threshold workout");
    expect(screen.getByTestId("session-draft-description")).toHaveValue(
      "Threshold session in pool mode."
    );
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All builder changes are saved to the canonical workout."
    );
  });

  it("requires confirmation and supports undo for destructive single-step removal", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.click(screen.getByTestId("session-draft-step-remove-0"));

    expect(screen.getByTestId("workout-editor-removal-confirm")).toHaveTextContent(
      "Remove Easy warmup swim?"
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
      "Removed Easy warmup swim."
    );
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this workout."
    );

    fireEvent.click(screen.getByTestId("workout-editor-removal-undo-button"));

    expect(screen.queryByTestId("workout-editor-removal-undo")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toBeVisible();
    expect(screen.getByTestId("workout-builder-save")).toBeDisabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "All builder changes are saved to the canonical workout."
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

    fireEvent.click(screen.getByTestId("session-draft-step-duplicate-0"));

    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Easy warmup swim");
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
    expect(screen.getByTestId("workout-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this workout."
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

    fireEvent.click(screen.getByTestId("session-draft-step-add-repeat-after-0"));

    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");
    expect(screen.getByTestId("session-draft-step-name-1")).toHaveValue("Repeat swim");

    const previewDraft = readPreviewDraft();
    const repeatSteps = previewDraft.steps.filter((step) => step.repeatGroupId);

    expect(previewDraft.steps).toHaveLength(3);
    expect(repeatSteps).toHaveLength(2);
    expect(repeatSteps.every((step) => step.repeatCount === 4)).toBe(true);
    expect(previewDraft.steps[0]?.repeatGroupId ?? null).toBeNull();
    expect(screen.getByTestId("workout-builder-save")).toBeEnabled();
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
      "Repeat block (2 steps, 4 rounds)"
    );

    fireEvent.click(screen.getByTestId("workout-editor-removal-confirm-button"));

    expect(screen.queryByTestId("session-draft-repeat-count-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("workout-editor-removal-undo")).toHaveTextContent(
      "Removed Repeat block (2 steps, 4 rounds)."
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

    expect(screen.getByTestId("session-draft-repeat-count-1")).toHaveValue("4");
    expect(screen.getByTestId("session-draft-repeat-count-2")).toHaveValue("4");
    expect(screen.getByTestId("session-draft-step-name-3")).toHaveValue("Repeat swim");

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

    expect(previewDraft.steps).toHaveLength(4);
    expect(previewDraft.steps[2]).toMatchObject({
      name: "Repeat step",
      repeatGroupId: repeatGroupIdBeforeInsert,
      repeatCount: 4,
    });

    fireEvent.click(screen.getByTestId("session-draft-repeat-add-step-after-1"));

    previewDraft = readPreviewDraft();

    expect(previewDraft.steps).toHaveLength(5);
    expect(previewDraft.steps[4]).toMatchObject({
      name: "Custom step",
    });
    expect(previewDraft.steps[4]?.repeatGroupId ?? null).toBeNull();
    expect(screen.getByTestId("session-draft-step-name-4")).toHaveValue("Custom step");
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
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Edit step");

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.getByTestId("session-draft-step-name-0")).toHaveValue("Easy warmup swim");
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Done");

    fireEvent.click(screen.getByTestId("session-draft-step-toggle-0"));

    expect(screen.queryByTestId("session-draft-step-name-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("session-draft-step-toggle-0")).toHaveTextContent("Edit step");
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

    expect(screen.getByTestId("workout-editor-handoff-notice")).toHaveTextContent(
      "Workout handoff copied."
    );

    fireEvent.click(screen.getByTestId("workout-editor-handoff-download"));

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("workout-editor-handoff-notice")).toHaveTextContent(
      `Downloaded ${buildWorkoutHandoffFileName(
        {
          ...buildDraft(),
          title: "Local handoff workout",
        },
        { draftState: "local_draft" }
      )}.`
    );

    fireEvent.click(screen.getByTestId("workout-editor-garmin-export-download"));

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(2);
      expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByTestId("workout-editor-garmin-export-notice")).toHaveTextContent(
      `Downloaded ${buildWorkoutGarminReadyExportFileName(
        {
          ...buildDraft(),
          title: "Local handoff workout",
        },
        { draftState: "local_draft" }
      )}.`
    );
    expect(revokeUrlSpy).toHaveBeenCalledTimes(0);
  });

  it("opens a truthful workout PDF print view for the current draft state", async () => {
    const printWindow = {
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
    };

    const openSpy = vi.spyOn(window, "open").mockReturnValue(printWindow as unknown as Window);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

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
    expect(screen.getByRole("button", { name: "Open PDF" })).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-editor-pdf-open"));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("", "_blank");
      expect(printWindow.document.open).toHaveBeenCalledTimes(1);
      expect(printWindow.document.write).toHaveBeenCalledWith(
        expect.stringContaining("Local PDF workout")
      );
    });

    expect(printWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining("Workout PDF print view")
    );
    expect(printWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining("--accent: #1d4ed8;")
    );
    expect(printWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining("Source: Local draft")
    );
    expect(printWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining("Reverse IM order (RIMO)")
    );
    expect(printWindow.document.close).toHaveBeenCalledTimes(1);
    expect(printWindow.focus).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("workout-editor-pdf-notice")).toHaveTextContent(
      `Opened print view for ${buildWorkoutPdfFileName(
        {
          ...buildDraft(),
          title: "Local PDF workout",
        },
        { draftState: "local_draft" }
      )}. Use Print / Save PDF in that tab.`
    );
  });

  it("shows whole-workout guidance for the description field", async () => {
    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByText("Description")).toBeVisible();
    expect(
      screen.getByText(
        "Optional. Use this for the whole-workout purpose, pacing intent, or one short coaching note that applies across the session."
      )
    ).toBeVisible();
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

    expect(screen.getByText("Primary stroke")).toBeVisible();
    expect(screen.getByText("Drill / kick / pull focus")).toBeVisible();
    expect(
      screen.getByText(
        "Use Primary stroke for the swim pattern. Add focus only when the step needs extra drill, kick, or pull notation."
      )
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "kick" },
    });

    expect(
      screen.getByText(
        "Kick category already marks this as kick work. Use Primary stroke for the stroke pattern this kick set supports, and use the focus field only when you want extra kick, pull, or drill notation."
      )
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "drill" },
    });
    fireEvent.change(screen.getByTestId("session-draft-step-stroke-0"), {
      target: { value: "drill" },
    });

    expect(
      screen.getByText(
        "Use Drill shell when the step is built around a drill. Then use the focus field to clarify whether it is a general drill, kick drill, or pull drill."
      )
    ).toBeVisible();
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
    expect(screen.getByTestId("workout-builder-empty-create-manual")).toBeVisible();
    expect(screen.getByRole("link", { name: "Open generator" })).toHaveAttribute(
      "href",
      "/my-library/generator"
    );
    fireEvent.click(screen.getByTestId("session-generator-recent-workouts-toggle"));
    expect(screen.getByTestId("workout-builder-open-workout-workout-1")).toHaveAttribute(
      "href",
      "/my-library/workouts/workout-1"
    );
    expect(screen.getByTestId("saved-workouts-print-workout-1")).toHaveAttribute(
      "href",
      "/api/my-library/workouts/workout-1/export/pdf"
    );
  });

  it("auto-dismisses workout pdf notices after a short delay", async () => {
    const printWindow = {
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
    };

    vi.spyOn(window, "open").mockReturnValue(printWindow as unknown as Window);

    render(<WorkoutBuilderHub workoutLibrary={buildWorkoutLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    vi.useFakeTimers();
    fireEvent.click(screen.getByTestId("workout-editor-pdf-open"));
    expect(screen.getByTestId("workout-editor-pdf-notice")).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(WORKOUT_NOTICE_AUTO_DISMISS_MS);
    });

    expect(screen.queryByTestId("workout-editor-pdf-notice")).not.toBeInTheDocument();
  });

  it("collapses saved workouts by default and deletes a non-current workout deterministically", async () => {
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
          recentWorkouts: [
            buildWorkoutSummary(),
            buildWorkoutSummary({
              id: "workout-2",
              title: "Old QA cleanup workout",
              totalDistanceM: 1600,
              estimatedDurationMin: 37,
            }),
          ],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByTestId("saved-workout-card-workout-2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("session-generator-recent-workouts-toggle"));

    expect(screen.queryByTestId("saved-workout-card-workout-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("saved-workout-card-workout-2")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-builder-delete-workout-workout-2"));

    expect(screen.getByText("Delete this saved session from My Library?")).toBeVisible();

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

    expect(screen.getByTestId("workout-builder-current-workout-actions")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-builder-delete-current-workout"));

    expect(screen.getByText("Delete this saved session?")).toBeVisible();

    fireEvent.click(screen.getByTestId("workout-builder-confirm-delete-current-workout"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/my-library/workouts/workout-1", {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith("/my-library");
    });

    expect(navigationState.refresh).toHaveBeenCalledTimes(1);
  });
});
