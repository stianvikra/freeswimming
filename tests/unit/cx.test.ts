import { describe, expect, it } from "vitest";
import { cx } from "@/components/ui/cx";

describe("cx", () => {
  it("joins only truthy class names", () => {
    expect(cx("base", undefined, "", false, "active", null)).toBe("base active");
  });

  it("returns an empty string when no class names are passed", () => {
    expect(cx(undefined, false, null, "")).toBe("");
  });
});
