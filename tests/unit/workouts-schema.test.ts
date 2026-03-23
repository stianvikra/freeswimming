import { describe, expect, it } from "vitest";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";

describe("workouts schema detection", () => {
  it("treats known schema-missing codes as schema readiness failures", () => {
    expect(
      isWorkoutSchemaMissing({
        code: "42703",
        message: 'column "pool_length_m" does not exist',
      })
    ).toBe(true);
  });

  it("does not misclassify constraint failures that mention pool_length_m", () => {
    expect(
      isWorkoutSchemaMissing({
        code: "23514",
        message:
          'new row for relation "workouts" violates check constraint "workouts_pool_length_m_check"',
        details: "Failing row contains pool_length_m = 33.33.",
      })
    ).toBe(false);
  });
});
