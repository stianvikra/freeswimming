import { describe, expect, it } from "vitest";
import {
  buildCssMetricUpsert,
  buildTrainingPreferencesUpsert,
  formatCssSecondsPer100m,
  normalizeWeekdays,
} from "@/lib/athlete-profile/training-setup";

describe("training setup helpers", () => {
  it("normalizes CSS pace to canonical seconds per 100m", () => {
    expect(
      buildCssMetricUpsert({
        pace: "1:58",
        recordedOn: "2026-03-19",
        sourceNote: "400 easy + 200 hard test",
      })
    ).toEqual({
      kind: "valid",
      value: {
        metric_key: "css",
        unit: "seconds_per_100m",
        value_seconds: 118,
        recorded_on: "2026-03-19",
        source_note: "400 easy + 200 hard test",
      },
    });
  });

  it("rejects malformed CSS pace values", () => {
    expect(
      buildCssMetricUpsert({
        pace: "118",
      })
    ).toEqual({
      kind: "invalid",
      error: "Use CSS pace format m:ss, for example 1:58.",
    });
  });

  it("formats canonical CSS seconds back to swimmer-friendly pace", () => {
    expect(formatCssSecondsPer100m(118)).toBe("1:58");
  });

  it("normalizes and sorts available days", () => {
    expect(normalizeWeekdays(["wednesday", "monday", "wednesday"])).toEqual([
      "monday",
      "wednesday",
    ]);
  });

  it("builds canonical training preferences payloads", () => {
    expect(
      buildTrainingPreferencesUpsert({
        poolLengthM: "25",
        availableDays: ["wednesday", "monday"],
        preferredWeeklySessionCount: "5",
        preferredSessionMinutes: "60",
      })
    ).toEqual({
      kind: "valid",
      value: {
        pool_length_m: 25,
        available_days: ["monday", "wednesday"],
        preferred_weekly_session_count: 5,
        preferred_session_minutes: 60,
      },
    });
  });

  it("rejects unsupported preference values", () => {
    expect(
      buildTrainingPreferencesUpsert({
        poolLengthM: "33",
      })
    ).toEqual({
      kind: "invalid",
      error: "Pool length must be 25m or 50m.",
    });
  });
});
