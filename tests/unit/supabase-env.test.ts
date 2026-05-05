import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertSupabaseServiceRoleAllowed,
  assertSupabaseUrlAllowed,
} from "@/lib/supabase/egress-guard";
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
    vi.stubEnv("NODE_ENV", "test");

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

  it("blocks Supabase cloud URLs in local/test contexts unless explicitly allowed", () => {
    expect(() =>
      assertSupabaseUrlAllowed({
        value: "https://project-ref.supabase.co",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        env: {
          NODE_ENV: "test",
        },
        isBrowser: false,
      })
    ).toThrowError("Unsafe Supabase configuration");
  });

  it("allows explicit production smoke opt-in for Supabase cloud URLs", () => {
    expect(() =>
      assertSupabaseUrlAllowed({
        value: "https://project-ref.supabase.co",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        env: {
          NODE_ENV: "test",
          FS_ALLOW_PROD_SUPABASE: "1",
        },
        isBrowser: false,
      })
    ).not.toThrow();
  });

  it("blocks live service-role shaped keys in local/test contexts", () => {
    expect(() =>
      assertSupabaseServiceRoleAllowed({
        value: "sb_secret_live-key",
        name: "SUPABASE_SERVICE_ROLE_KEY",
        env: {
          NODE_ENV: "test",
        },
        isBrowser: false,
      })
    ).toThrowError("Unsafe Supabase configuration");
  });

  it("allows production runtime with Supabase cloud configuration", () => {
    expect(() =>
      assertSupabaseUrlAllowed({
        value: "https://project-ref.supabase.co",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        env: {
          NODE_ENV: "production",
          VERCEL_ENV: "production",
        },
        isBrowser: false,
      })
    ).not.toThrow();
  });

  it("allows explicitly isolated CI Supabase without production opt-in", () => {
    expect(() =>
      assertSupabaseUrlAllowed({
        value: "https://ci-project.supabase.co",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        env: {
          NODE_ENV: "development",
          FS_SUPABASE_ENV: "ci",
        },
        isBrowser: false,
      })
    ).not.toThrow();
  });

  it("blocks known production Supabase origin in CI without production opt-in", () => {
    expect(() =>
      assertSupabaseUrlAllowed({
        value: "https://prod-project.supabase.co",
        name: "NEXT_PUBLIC_SUPABASE_URL",
        env: {
          NODE_ENV: "development",
          FS_SUPABASE_ENV: "ci",
          FS_PRODUCTION_SUPABASE_URL: "https://prod-project.supabase.co",
        },
        isBrowser: false,
      })
    ).toThrowError("matches the known production Supabase origin");
  });
});
