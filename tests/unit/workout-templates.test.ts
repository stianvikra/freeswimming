import { describe, expect, it } from "vitest";
import {
  buildWorkoutTemplateDraft,
  getActiveWorkoutTemplateByKey,
  getWorkoutTemplateByKey,
  listActiveWorkoutTemplates,
  parseWorkoutTemplateKey,
  validateWorkoutTemplateRegistry,
} from "@/lib/workouts/templates";

describe("workout builder templates", () => {
  it("accepts only stable low-cardinality template keys", () => {
    expect(parseWorkoutTemplateKey("pool_endurance_base_1000")).toBe("pool_endurance_base_1000");
    expect(parseWorkoutTemplateKey("pool-endurance-base")).toBe("pool-endurance-base");
    expect(parseWorkoutTemplateKey("Pool Endurance Base")).toBeNull();
    expect(parseWorkoutTemplateKey("ab")).toBeNull();
    expect(parseWorkoutTemplateKey("pool.template")).toBeNull();
    expect(parseWorkoutTemplateKey("")).toBeNull();
    expect(parseWorkoutTemplateKey(null)).toBeNull();
  });

  it("validates registry keys, statuses, and duplicate identities", () => {
    expect(validateWorkoutTemplateRegistry().ok).toBe(true);
    expect(
      validateWorkoutTemplateRegistry([
        { templateKey: "pool_endurance_base_1000", status: "active", title: "Base" },
        { templateKey: "pool_endurance_base_1000", status: "active", title: "Renamed base" },
        { templateKey: "Bad Key", status: "active", title: "Bad" },
        { templateKey: "retired_template", status: "retired" as "active", title: "" },
      ]).errors
    ).toEqual([
      "Duplicate templateKey: pool_endurance_base_1000",
      "Invalid templateKey: Bad Key",
      "Unsupported template status for retired_template: retired",
      "Missing title for retired_template",
    ]);
  });

  it("lists only active templates while keeping deprecated keys non-selectable", () => {
    expect(listActiveWorkoutTemplates().map((template) => template.templateKey)).toEqual([
      "pool_endurance_base_1000",
      "pool_technique_reset_900",
    ]);
    expect(getWorkoutTemplateByKey("pool_endurance_base_1000")?.title).toBe("Aerobic base 1000");
    expect(getActiveWorkoutTemplateByKey("unknown_template")).toBeNull();
  });

  it("builds a normal editable workout draft without persisted template identity", () => {
    const draft = buildWorkoutTemplateDraft(
      "pool_endurance_base_1000",
      new Date("2026-06-10T09:00:00.000Z"),
      { basePaceSecondsPer100m: 118, usedCssPaceLabel: "1:58 / 100m" }
    );

    expect(draft?.title).toBe("Aerobic base 1000");
    expect(draft?.environment).toBe("pool");
    expect(draft?.sessionType).toBe("endurance");
    expect(draft?.sourceFingerprint).toBe("manual-template-20260610090000");
    expect(draft?.basePaceSecondsPer100m).toBe(118);
    expect(draft?.usedCssPaceLabel).toBe("1:58 / 100m");
    expect(draft?.totalDistanceM).toBe(1000);
    expect(JSON.stringify(draft)).not.toContain("pool_endurance_base_1000");
  });

  it("fails closed for unknown or invalid template draft requests", () => {
    expect(buildWorkoutTemplateDraft("unknown_template")).toBeNull();
    expect(buildWorkoutTemplateDraft("Bad Key")).toBeNull();
  });
});
