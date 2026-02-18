import { describe, expect, it } from "vitest";
import { isResendRequestFlag, shouldApplyMagicLinkCooldown } from "@/lib/auth/sign-in-request";

describe("sign-in request flow helpers", () => {
  it("treats resend as explicit opt-in flag", () => {
    expect(isResendRequestFlag("1")).toBe(true);
    expect(isResendRequestFlag("0")).toBe(false);
    expect(isResendRequestFlag(undefined)).toBe(false);
    expect(isResendRequestFlag(null)).toBe(false);
  });

  it("applies cooldown only for resend requests", () => {
    expect(shouldApplyMagicLinkCooldown(30_000, true)).toBe(true);
    expect(shouldApplyMagicLinkCooldown(30_000, false)).toBe(false);
    expect(shouldApplyMagicLinkCooldown(0, true)).toBe(false);
  });
});
