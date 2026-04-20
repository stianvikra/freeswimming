import { afterEach, describe, expect, it } from "vitest";
import {
  buildWorkoutPoolsideImageFileName,
  buildWorkoutPoolsidePreviewHref,
  buildWorkoutPoolsidePrintFrameHref,
  readStoredWorkoutPoolsidePreviewDraft,
  writeStoredWorkoutPoolsidePreviewDraft,
} from "@/lib/workouts/poolside-preview";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";

function buildDraft(): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-04-19T08:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Poolside preview draft",
    titleSuggestions: [],
    description: "",
    environment: "pool",
    poolLengthUnit: "m",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 1600,
    targetTimeMin: null,
    totalDistanceM: 1600,
    estimatedDurationMin: 35,
    basePaceSecondsPer100m: 120,
    usedCssPaceLabel: null,
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: [],
    focusText: "",
    goalTitle: "",
    constraintText: "",
    warnings: [],
    steps: [
      {
        id: "step-1",
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
    ],
  };
}

describe("workout poolside preview helpers", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("builds a preview route href with default print settings and explicit focus selection", () => {
    const href = buildWorkoutPoolsidePreviewHref(
      "/my-library/workouts/poolside-preview?workoutId=workout-1",
      {
        selectedFocusIds: ["focus-1", "focus-2"],
      }
    );

    expect(href).toContain("/my-library/workouts/poolside-preview?workoutId=workout-1");
    expect(href).toContain("focusMode=custom");
    expect(href).toContain("focusId=focus-1");
    expect(href).toContain("focusId=focus-2");
    expect(href).toContain("printStyle=color");
    expect(href).toContain("printLayout=portrait");
    expect(href).toContain("notationMode=auto");
    expect(href).toContain("restLayout=auto");
  });

  it("builds an embedded canonical frame href for the preview surface", () => {
    const href = buildWorkoutPoolsidePrintFrameHref("workout-1", {
      selectedFocusIds: [],
      settings: {
        printStyle: "ink_saver",
        printLayout: "landscape",
        notationMode: "abbreviated",
        restLayout: "below_step",
      },
    });

    expect(href).toBe(
      "/api/my-library/workouts/workout-1/export/pdf?variant=poolside&previewChrome=embedded&printStyle=ink_saver&printLayout=landscape&notationMode=abbreviated&restLayout=below_step&focusMode=custom"
    );
  });

  it("stores and reloads local draft previews by preview id", () => {
    writeStoredWorkoutPoolsidePreviewDraft("preview-1", {
      draft: buildDraft(),
      draftState: "local_draft",
      focusPoints: ["High elbow catch"],
      swimmerName: "Stian Vikra",
    });

    expect(readStoredWorkoutPoolsidePreviewDraft("preview-1")).toMatchObject({
      draftState: "local_draft",
      focusPoints: ["High elbow catch"],
      swimmerName: "Stian Vikra",
    });
  });

  it("builds a predictable poolside image filename from title and layout", () => {
    expect(
      buildWorkoutPoolsideImageFileName({
        title: "S2 - Easy Base Session",
        printLayout: "landscape",
      })
    ).toBe("freeswimming-s2-easy-base-session-poolside-note-landscape.png");
  });

  it("falls back to a generic poolside image filename when title is empty", () => {
    expect(
      buildWorkoutPoolsideImageFileName({
        title: "   ",
        printLayout: "portrait",
      })
    ).toBe("freeswimming-poolside-note-portrait.png");
  });
});
