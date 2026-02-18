import { describe, expect, it } from "vitest";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

describe("readNavigatorOnlineState", () => {
  it("defaults to online when navigator state is unavailable", () => {
    expect(readNavigatorOnlineState(undefined)).toBe(true);
    expect(readNavigatorOnlineState(null)).toBe(true);
    expect(readNavigatorOnlineState({})).toBe(true);
    expect(readNavigatorOnlineState({ onLine: undefined })).toBe(true);
  });

  it("returns explicit browser online state", () => {
    expect(readNavigatorOnlineState({ onLine: true })).toBe(true);
    expect(readNavigatorOnlineState({ onLine: false })).toBe(false);
  });
});
