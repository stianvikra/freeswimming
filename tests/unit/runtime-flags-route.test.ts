import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/runtime/flags/route";

describe("/api/runtime/flags route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disables soft-launch banner when site lock is enabled in fallback mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.com");
    vi.stubEnv("SITE_LOCK_ENABLED", "1");
    vi.stubEnv("SITE_LOCK_MODE", "password");
    vi.stubEnv(
      "SITE_LOCK_PASSWORD_HASH",
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    vi.stubEnv("SITE_LOCK_BYPASS_TOKEN", "token-123");

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { softLaunchBanner?: boolean; dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.flags?.softLaunchBanner).toBe(false);
    expect(payload.flags?.dashboardVisible).toBe(false);
  });

  it("keeps soft-launch banner enabled when site lock is disabled in fallback mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.com");
    vi.stubEnv("SITE_LOCK_ENABLED", "0");

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { softLaunchBanner?: boolean; dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.flags?.softLaunchBanner).toBe(true);
    expect(payload.flags?.dashboardVisible).toBe(false);
  });
});
