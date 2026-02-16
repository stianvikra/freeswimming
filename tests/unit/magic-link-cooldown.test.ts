import { describe, expect, it } from "vitest";
import {
  formatLoginCodeCooldownMessage,
  formatLoginCodeCooldownMessageFromSeconds,
  getMagicLinkCadenceCooldownMs,
  toRetrySeconds,
} from "@/lib/auth/magic-link-cooldown";

describe("magic link cooldown helpers", () => {
  it("maps retry milliseconds to a safe second count", () => {
    expect(toRetrySeconds(1)).toBe(1);
    expect(toRetrySeconds(999)).toBe(1);
    expect(toRetrySeconds(1_001)).toBe(2);
  });

  it("formats cooldown message with proper singular/plural", () => {
    expect(formatLoginCodeCooldownMessageFromSeconds(1)).toBe(
      "Please wait 1 second before requesting a new login code."
    );
    expect(formatLoginCodeCooldownMessage(2_000)).toBe(
      "Please wait 2 seconds before requesting a new login code."
    );
  });

  it("uses stepped cadence: 30s, 60s, then 5m", () => {
    expect(getMagicLinkCadenceCooldownMs(1)).toBe(30_000);
    expect(getMagicLinkCadenceCooldownMs(2)).toBe(60_000);
    expect(getMagicLinkCadenceCooldownMs(3)).toBe(5 * 60_000);
    expect(getMagicLinkCadenceCooldownMs(7)).toBe(5 * 60_000);
  });
});
