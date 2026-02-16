import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAppUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

describe("supabase env helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads configured supabase values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");

    expect(getSupabaseUrl()).toBe("https://example.supabase.co");
    expect(getSupabaseAnonKey()).toBe("anon-key");
    expect(getSupabaseServiceRoleKey()).toBe("service-role");
  });

  it("throws when required env value is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    expect(() => getSupabaseUrl()).toThrowError(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  });

  it("resolves app url from explicit env first, then vercel fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://freeswimming.org");
    vi.stubEnv("VERCEL_URL", "preview-domain.vercel.app");
    expect(getAppUrl()).toBe("https://freeswimming.org");

    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getAppUrl()).toBe("https://preview-domain.vercel.app");
  });

  it("falls back to localhost when no app host env is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(getAppUrl()).toBe("http://127.0.0.1:3000");
  });
});
