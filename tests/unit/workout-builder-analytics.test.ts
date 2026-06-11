import { describe, expect, it } from "vitest";
import {
  buildWorkoutBuilderTemplateSelectedPayload,
  buildWorkoutBuilderTemplateSelectedPayloadForTemplate,
  buildWorkoutContextCtaPayload,
} from "@/lib/analytics/workout-builder";

describe("workout builder analytics", () => {
  it("builds a privacy-safe template selection payload from an active registry template", () => {
    expect(
      buildWorkoutBuilderTemplateSelectedPayload({
        templateKey: "pool_endurance_base_1000",
      })
    ).toEqual({
      source: "workout_builder",
      surface: "my_library_workouts",
      templateKey: "pool_endurance_base_1000",
      templateSource: "workout_builder_v1",
      builderMode: "pool",
      environment: "pool",
      sessionType: "endurance",
      sizeMode: "distance",
    });
  });

  it("does not emit template selection payloads for missing, invalid, or unknown identities", () => {
    expect(buildWorkoutBuilderTemplateSelectedPayload({ templateKey: null })).toBeNull();
    expect(
      buildWorkoutBuilderTemplateSelectedPayload({ templateKey: "Bad Template Key" })
    ).toBeNull();
    expect(
      buildWorkoutBuilderTemplateSelectedPayload({ templateKey: "missing_template" })
    ).toBeNull();
  });

  it("rejects deprecated templates and excludes editable display/workout values", () => {
    const payload = buildWorkoutBuilderTemplateSelectedPayloadForTemplate({
      templateKey: "deprecated_template",
      status: "deprecated",
      environment: "pool",
      sessionType: "technique",
      sizeMode: "distance",
    });

    expect(payload).toBeNull();

    const activePayload = buildWorkoutBuilderTemplateSelectedPayloadForTemplate({
      templateKey: "pool_technique_reset_900",
      status: "active",
      environment: "pool",
      sessionType: "technique",
      sizeMode: "distance",
    });

    expect(activePayload).toEqual({
      source: "workout_builder",
      surface: "my_library_workouts",
      templateKey: "pool_technique_reset_900",
      templateSource: "workout_builder_v1",
      builderMode: "pool",
      environment: "pool",
      sessionType: "technique",
      sizeMode: "distance",
    });
    expect(JSON.stringify(activePayload)).not.toContain("Technique reset 900");
    expect(JSON.stringify(activePayload)).not.toContain("manual-template");
    expect(JSON.stringify(activePayload)).not.toContain("notes");
  });

  it("builds a bounded workout-context CTA payload without private workout identifiers", () => {
    const payload = buildWorkoutContextCtaPayload({
      draft: {
        environment: "pool",
      },
      sourceKind: "manual",
    });

    expect(payload).toEqual({
      source: "workout_context",
      surface: "saved_workout_post_success",
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      sourceKind: "manual",
      builderMode: "pool",
    });
    expect(JSON.stringify(payload)).not.toContain("workout-");
    expect(JSON.stringify(payload)).not.toContain("title");
    expect(JSON.stringify(payload)).not.toContain("notes");
    expect(JSON.stringify(payload)).not.toContain("email");
  });
});
