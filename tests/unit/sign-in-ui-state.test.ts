import { describe, expect, it } from "vitest";
import {
  deriveSignInRequestState,
  getSignInCooldownRemainingSeconds,
} from "@/lib/auth/sign-in-ui-state";

describe("sign-in ui state helpers", () => {
  it("returns 0 cooldown seconds for invalid timestamps", () => {
    expect(getSignInCooldownRemainingSeconds(null, 1_000)).toBe(0);
    expect(getSignInCooldownRemainingSeconds(undefined, 1_000)).toBe(0);
    expect(getSignInCooldownRemainingSeconds(Number.NaN, 1_000)).toBe(0);
  });

  it("rounds cooldown seconds up to keep countdown deterministic", () => {
    expect(getSignInCooldownRemainingSeconds(1_001, 1_000)).toBe(1);
    expect(getSignInCooldownRemainingSeconds(1_999, 1_000)).toBe(1);
    expect(getSignInCooldownRemainingSeconds(2_001, 1_000)).toBe(2);
  });

  it("prioritizes sending state over all other inputs", () => {
    const state = deriveSignInRequestState(
      {
        sent: true,
        error: "some error",
        cooldownUntilMs: 10_000,
        sending: true,
      },
      1_000
    );
    expect(state).toBe("sending");
  });

  it("shows cooldown state when error has an active cooldown", () => {
    const state = deriveSignInRequestState(
      {
        sent: false,
        error: "Please wait before retrying.",
        cooldownUntilMs: 5_000,
      },
      1_000
    );
    expect(state).toBe("cooldown");
  });

  it("shows error state when there is an error but no active cooldown", () => {
    const state = deriveSignInRequestState(
      {
        sent: false,
        error: "Could not send sign-in email right now.",
      },
      1_000
    );
    expect(state).toBe("error");
  });

  it("shows error when sent state has a non-cooldown error", () => {
    const state = deriveSignInRequestState(
      {
        sent: true,
        error: "Could not verify sign-in code.",
      },
      3_000
    );
    expect(state).toBe("error");
  });

  it("returns sent when a cooldown-backed error has expired", () => {
    const state = deriveSignInRequestState(
      {
        sent: true,
        error: "Please wait before retrying.",
        cooldownUntilMs: 1_000,
      },
      3_000
    );
    expect(state).toBe("sent");
  });

  it("falls back to idle when no sent/error/cooldown signal is present", () => {
    const state = deriveSignInRequestState(
      {
        sent: false,
        error: "",
      },
      1_000
    );
    expect(state).toBe("idle");
  });
});
