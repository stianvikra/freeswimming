import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/runtime/flags/route";

describe("/api/runtime/flags route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns dashboard visibility fallback in example-host mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.com");

    const response = await GET();
    const payload = (await response.json()) as {
      ok?: boolean;
      flags?: { dashboardVisible?: boolean };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.flags?.dashboardVisible).toBe(false);
  });
});
