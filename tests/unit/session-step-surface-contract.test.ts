import { describe, expect, it } from "vitest";
import {
  buildGeneratedSessionViewSections,
  buildManualPoolViewSections,
  buildSessionStepEditBlocks,
  buildStepRenderGroups,
  buildStepSummary,
} from "@/components/my-library/workouts/sessionStepSurfaceContract";
import type { SessionDraftStep } from "@/lib/session-generator-v1/shared";

function buildStep(overrides: Partial<SessionDraftStep>): SessionDraftStep {
  return {
    id: "step-1",
    category: "main",
    name: "Main step",
    stroke: "freestyle",
    drillType: "none",
    equipment: "none",
    intensity: "moderate",
    durationMode: "distance",
    distanceM: 100,
    timeMin: null,
    targetMode: "effort",
    effortTarget: "moderate",
    targetPaceSecondsPer100m: null,
    cssTargetOffsetSeconds: null,
    cssSendOffOffsetSeconds: null,
    targetSummary: "",
    notes: "",
    repeatGroupId: null,
    repeatCount: null,
    repeatEndingRestMode: null,
    postSetRestForRepeatGroupId: null,
    ...overrides,
  };
}

describe("sessionStepSurfaceContract", () => {
  it("groups manual top-level linked rests into the parent view line without mutating steps", () => {
    const steps = [
      buildStep({
        id: "warmup",
        category: "warmup",
        distanceM: 400,
        intensity: "easy",
        effortTarget: "easy",
        name: "400m · Freestyle · Easy",
      }),
      buildStep({
        id: "warmup-rest",
        category: "rest",
        name: "Warmup rest",
        stroke: "choice",
        intensity: "recovery",
        durationMode: "fixed_rest",
        distanceM: null,
        timeMin: 0.5,
        targetMode: "none",
        effortTarget: null,
      }),
      buildStep({
        id: "standalone-rest",
        category: "rest",
        name: "Standalone rest",
        stroke: "choice",
        intensity: "recovery",
        durationMode: "fixed_rest",
        distanceM: null,
        timeMin: 1,
        targetMode: "none",
        effortTarget: null,
      }),
    ];
    const original = JSON.stringify(steps);
    const groups = buildStepRenderGroups(steps);
    const sections = buildManualPoolViewSections(groups, steps, 120, "m");
    const blocks = buildSessionStepEditBlocks(groups, steps);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      category: "warmup",
      lines: [
        {
          key: "warmup",
          primaryText: "400m · Freestyle · Easy",
          secondaryText: "Rest 0:30",
        },
      ],
    });
    expect(sections[1]).toMatchObject({
      category: "rest",
      lines: [
        {
          key: "standalone-rest",
          primaryText: "Rest 1:00",
          secondaryText: null,
        },
      ],
    });
    expect(blocks[0]).toMatchObject({
      kind: "single",
      key: "warmup",
      steps: [{ id: "warmup" }, { id: "warmup-rest" }],
    });
    expect(JSON.stringify(steps)).toBe(original);
  });

  it("embeds generated repeat rests and omits uncontrolled coach notes from view output", () => {
    const steps = [
      buildStep({
        id: "main-work",
        category: "main",
        distanceM: 100,
        repeatGroupId: "main-repeat",
        repeatCount: 4,
        repeatEndingRestMode: "skip_last_rest",
        notes: "Coach note: hold this back.",
        targetSummary: "Swim around CSS-derived pacing.",
      }),
      buildStep({
        id: "main-rest",
        category: "rest",
        name: "Between-round rest",
        stroke: "choice",
        intensity: "recovery",
        durationMode: "fixed_rest",
        distanceM: null,
        timeMin: 0.5,
        targetMode: "none",
        effortTarget: null,
        repeatGroupId: "main-repeat",
        repeatCount: 4,
        repeatEndingRestMode: "skip_last_rest",
      }),
      buildStep({
        id: "main-post-rest",
        category: "rest",
        name: "Post-set rest",
        stroke: "choice",
        intensity: "recovery",
        durationMode: "fixed_rest",
        distanceM: null,
        timeMin: 1,
        targetMode: "none",
        effortTarget: null,
        postSetRestForRepeatGroupId: "main-repeat",
      }),
    ];

    const sections = buildGeneratedSessionViewSections(
      buildStepRenderGroups(steps),
      120,
      "pool",
      "m"
    );
    const renderedText = JSON.stringify(sections);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.lines[0]?.primaryText).toBe(
      "4 x 100m · Freestyle · Moderate · Interval rest 0:30"
    );
    expect(sections[0]?.lines[0]?.secondaryText).toBe("Set rest 1:00");
    expect(renderedText).not.toContain("Coach note");
    expect(renderedText).not.toContain("Swim around CSS-derived pacing");
  });

  it("uses deterministic fallback text for malformed generated steps", () => {
    const summary = buildStepSummary(
      buildStep({
        id: "empty-rest",
        category: "rest",
        stroke: "choice",
        durationMode: "fixed_rest",
        distanceM: null,
        timeMin: null,
        targetMode: "none",
        effortTarget: null,
      }),
      120,
      "pool",
      "m"
    );

    expect(summary).toBe("Fixed Rest Time not set · Moderate");
  });
});
