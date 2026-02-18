import { describe, expect, it } from "vitest";
import {
  buildCustomGoalInsert,
  buildDerivedGoalSyncUpdate,
  buildGoalView,
  buildTemplateGoalInsert,
} from "@/lib/goals/mvp";

function createGoalRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "goal-1",
    user_id: "user-1",
    title: "Goal",
    goal_type: "distance_time",
    source: "template",
    target_value: 600,
    target_unit: "seconds_at_distance",
    target_date: null,
    target_distance_m: 1000,
    target_time_seconds: 600,
    target_count: null,
    target_ref: null,
    progress_value: 0,
    status: "active",
    achieved_at: null,
    celebrated_at: null,
    created_at: "2026-02-18T10:00:00.000Z",
    updated_at: "2026-02-18T10:00:00.000Z",
    ...overrides,
  } as const;
}

describe("goals mvp model", () => {
  it("builds template insert payload for locked template", () => {
    const insert = buildTemplateGoalInsert("distance_1000_under_10", "2026-03-15");
    expect(insert).toMatchObject({
      title: "1000m under 10:00",
      goal_type: "distance_time",
      source: "template",
      target_distance_m: 1000,
      target_time_seconds: 600,
      status: "active",
    });
  });

  it("returns null for unknown template", () => {
    expect(buildTemplateGoalInsert("unknown-template", null)).toBeNull();
  });

  it("validates custom payload with strict typed targets", () => {
    const valid = buildCustomGoalInsert({
      title: "1000m under 18:00",
      metric: "distance_time",
      targetDate: null,
      distanceM: 1000,
      timeSeconds: 1080,
    });

    expect(valid).toMatchObject({
      goal_type: "distance_time",
      target_distance_m: 1000,
      target_time_seconds: 1080,
      status: "active",
    });

    const invalid = buildCustomGoalInsert({
      title: "No",
      metric: "distance_time",
      targetDate: null,
      distanceM: 0,
      timeSeconds: 0,
    });
    expect(invalid).toBeNull();
  });

  it("marks drill template as achieved when drill is completed in context", () => {
    const goal = createGoalRow({
      goal_type: "drill_complete",
      target_count: 1,
      target_ref: "D01",
      target_unit: "count",
      target_value: 1,
      target_distance_m: null,
      target_time_seconds: null,
    });

    const view = buildGoalView(goal, {
      completedDrillIds: new Set(["D01"]),
      completedModuleLessonCounts: new Map(),
    });

    expect(view.status).toBe("achieved");
    expect(view.progressPercent).toBe(100);
    expect(view.primaryAction).toMatchObject({
      kind: "link",
      href: "/guides/poolside",
    });
    expect(view.showCelebration).toBe(true);
  });

  it("computes timed goal progress and action as log result", () => {
    const goal = createGoalRow({
      progress_value: 590,
    });

    const view = buildGoalView(goal, {
      completedDrillIds: new Set(),
      completedModuleLessonCounts: new Map(),
    });

    expect(view.status).toBe("achieved");
    expect(view.progressPercent).toBe(100);
    expect(view.primaryAction).toMatchObject({
      kind: "log_result",
      inputKind: "time_seconds",
    });
  });

  it("builds sync patch for derived module goals", () => {
    const goal = createGoalRow({
      goal_type: "module_complete",
      target_count: 3,
      target_ref: "mod1",
      target_unit: "count",
      target_value: 3,
      target_distance_m: null,
      target_time_seconds: null,
      progress_value: 0,
      status: "active",
    });

    const patch = buildDerivedGoalSyncUpdate(goal, {
      completedDrillIds: new Set(),
      completedModuleLessonCounts: new Map([["mod1", 3]]),
    });

    expect(patch).toMatchObject({
      progress_value: 3,
      status: "achieved",
    });
    expect(typeof patch?.achieved_at).toBe("string");
  });
});
