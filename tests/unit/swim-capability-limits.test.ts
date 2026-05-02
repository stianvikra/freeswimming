import { describe, expect, it } from "vitest";
import { buildSwimCapabilityLimitUpserts } from "@/lib/athlete-profile/capabilities";

describe("swim capability limits", () => {
  it("normalizes meaningful limits and skips empty rows", () => {
    const result = buildSwimCapabilityLimitUpserts({
      limits: [
        { kind: "drill", maxRepeatDistanceM: "25", targetTotalDistanceM: "300" },
        {
          kind: "stroke",
          stroke: "backstroke",
          maxRepeatDistanceM: "25",
          maxTotalDistanceM: "200",
        },
        { kind: "kick" },
      ],
    });
    expect(result.kind).toBe("valid");
    if (result.kind !== "valid") return;
    expect(result.value).toEqual([
      expect.objectContaining({ limit_kind: "drill", max_repeat_distance_m: 25 }),
      expect.objectContaining({ limit_kind: "stroke", max_total_distance_m: 200 }),
    ]);
  });
});
