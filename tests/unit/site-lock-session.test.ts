import { describe, expect, it } from "vitest";
import {
  createSiteLockSessionToken,
  isSiteLockBypassTokenValid,
  isSiteLockPathBypassed,
  isSiteLockSessionTokenValid,
} from "@/lib/site-lock/session";

describe("site lock session", () => {
  it("validates signed session token within max age", async () => {
    const nowMs = 1_700_000_000_000;
    const token = await createSiteLockSessionToken("secret-token", nowMs);
    const isValid = await isSiteLockSessionTokenValid({
      token,
      secret: "secret-token",
      maxAgeSeconds: 60,
      nowMs: nowMs + 5_000,
    });

    expect(isValid).toBe(true);
  });

  it("rejects expired session token", async () => {
    const nowMs = 1_700_000_000_000;
    const token = await createSiteLockSessionToken("secret-token", nowMs);
    const isValid = await isSiteLockSessionTokenValid({
      token,
      secret: "secret-token",
      maxAgeSeconds: 5,
      nowMs: nowMs + 10_000,
    });

    expect(isValid).toBe(false);
  });

  it("checks bypass header token in constant-length compare flow", () => {
    expect(isSiteLockBypassTokenValid("abc123", "abc123")).toBe(true);
    expect(isSiteLockBypassTokenValid("abc124", "abc123")).toBe(false);
    expect(isSiteLockBypassTokenValid(null, "abc123")).toBe(false);
  });

  it("marks preview/contact/auth/install/offline/contact-api/stripe webhook paths as bypassed", () => {
    expect(isSiteLockPathBypassed("/preview-access")).toBe(true);
    expect(isSiteLockPathBypassed("/contact")).toBe(true);
    expect(isSiteLockPathBypassed("/manifest.webmanifest")).toBe(true);
    expect(isSiteLockPathBypassed("/offline.html")).toBe(true);
    expect(isSiteLockPathBypassed("/sw.js")).toBe(true);
    expect(isSiteLockPathBypassed("/auth/sign-in")).toBe(true);
    expect(isSiteLockPathBypassed("/api/contact")).toBe(true);
    expect(isSiteLockPathBypassed("/api/stripe/webhook")).toBe(true);
    expect(isSiteLockPathBypassed("/my-library")).toBe(false);
  });
});
