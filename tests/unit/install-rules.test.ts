import { describe, expect, it } from "vitest";
import {
  A2HS_DISMISS_COOLDOWN_MS,
  isDismissCooldownActive,
  parseStoredTimestamp,
  shouldShowAutoInstallPrompt,
} from "@/components/install/install-rules";

describe("install rules", () => {
  it("parses timestamp from localStorage safely", () => {
    expect(parseStoredTimestamp(null)).toBeNull();
    expect(parseStoredTimestamp("")).toBeNull();
    expect(parseStoredTimestamp("foo")).toBeNull();
    expect(parseStoredTimestamp("-1")).toBeNull();
    expect(parseStoredTimestamp("123456")).toBe(123456);
  });

  it("evaluates dismiss cooldown window", () => {
    const now = 1_700_000_000_000;
    expect(isDismissCooldownActive(null, now)).toBe(false);
    expect(isDismissCooldownActive(now - 1_000, now)).toBe(true);
    expect(isDismissCooldownActive(now - A2HS_DISMISS_COOLDOWN_MS - 1, now)).toBe(false);
  });

  it("shows auto prompt only when all eligibility checks pass", () => {
    const now = 1_700_000_000_000;
    const base = {
      enabled: true,
      hasSeenPrompt: false,
      dismissedAtMs: null as number | null,
      isInstalled: false,
      canInstall: true,
      nowMs: now,
    };

    expect(shouldShowAutoInstallPrompt(base)).toBe(true);
    expect(shouldShowAutoInstallPrompt({ ...base, enabled: false })).toBe(false);
    expect(shouldShowAutoInstallPrompt({ ...base, hasSeenPrompt: true })).toBe(false);
    expect(shouldShowAutoInstallPrompt({ ...base, isInstalled: true })).toBe(false);
    expect(shouldShowAutoInstallPrompt({ ...base, canInstall: false })).toBe(false);
    expect(
      shouldShowAutoInstallPrompt({
        ...base,
        dismissedAtMs: now - 60_000,
      })
    ).toBe(false);
    expect(
      shouldShowAutoInstallPrompt({
        ...base,
        dismissedAtMs: now - A2HS_DISMISS_COOLDOWN_MS - 1,
      })
    ).toBe(true);
  });
});
