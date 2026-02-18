import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteLockConfig, isSiteLockEnabled } from "@/lib/site-lock/config";

describe("site lock config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns disabled config when SITE_LOCK_ENABLED is not set", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "0");

    const config = getSiteLockConfig();
    expect(config.enabled).toBe(false);
    expect(isSiteLockEnabled()).toBe(false);
  });

  it("returns enabled config when required env vars are set", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");

    const config = getSiteLockConfig();
    expect(config.enabled).toBe(true);
    expect(config.mode).toBe("password");
    expect(config.cookieName).toBe("fs_preview_access");
  });

  it("throws when enabled but required vars are missing", () => {
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv("SITE_LOCK_PASSWORD_HASH", "");
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "");

    expect(() => getSiteLockConfig()).toThrowError(/SITE_LOCK_PASSWORD_HASH/);
  });
});
