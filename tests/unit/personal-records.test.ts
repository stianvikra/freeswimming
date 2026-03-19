import { describe, expect, it } from "vitest";
import {
  buildPersonalRecordUpsert,
  formatPersonalRecordTime,
  parsePersonalRecordTimeToCentiseconds,
} from "@/lib/athlete-profile/personal-records";

describe("personal records helpers", () => {
  it("parses swimmer-friendly times into canonical centiseconds", () => {
    expect(parsePersonalRecordTimeToCentiseconds("59.87")).toBe(5987);
    expect(parsePersonalRecordTimeToCentiseconds("1:02.34")).toBe(6234);
    expect(parsePersonalRecordTimeToCentiseconds("1:01:02.34")).toBe(366234);
  });

  it("formats canonical centiseconds back into swimmer-friendly labels", () => {
    expect(formatPersonalRecordTime(5987)).toBe("59.87");
    expect(formatPersonalRecordTime(6234)).toBe("1:02.34");
    expect(formatPersonalRecordTime(366234)).toBe("1:01:02.34");
  });

  it("builds canonical personal record payloads", () => {
    expect(
      buildPersonalRecordUpsert({
        distanceM: "100",
        stroke: "freestyle",
        course: "pool_25m",
        time: "1:02.34",
        recordedOn: "2026-03-19",
        sourceNote: "Club night",
      })
    ).toEqual({
      kind: "valid",
      value: {
        distance_m: 100,
        stroke: "freestyle",
        course: "pool_25m",
        time_centiseconds: 6234,
        recorded_on: "2026-03-19",
        source_note: "Club night",
      },
    });
  });

  it("rejects unsupported personal record values", () => {
    expect(
      buildPersonalRecordUpsert({
        distanceM: "10",
        stroke: "freestyle",
        course: "pool_25m",
        time: "1:02.34",
      })
    ).toEqual({
      kind: "invalid",
      error: "Distance must be a whole number between 25m and 100000m.",
    });

    expect(
      buildPersonalRecordUpsert({
        distanceM: "100",
        stroke: "freestyle",
        course: "pool_25m",
        time: "10234",
      })
    ).toEqual({
      kind: "invalid",
      error: "Use time format ss.hh, m:ss.hh, or h:mm:ss.hh before saving.",
    });
  });
});
