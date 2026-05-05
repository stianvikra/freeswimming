import { describe, expect, it } from "vitest";
import { validateSupabaseEgressGuard } from "@/scripts/lib/supabase-egress-guard.mjs";

describe("supabase egress script guard", () => {
  it("blocks local commands that would use Supabase cloud and live service role", () => {
    const errors = validateSupabaseEgressGuard({
      NODE_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_live-key",
    });

    expect(errors).toHaveLength(2);
    expect(errors.join(" ")).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(errors.join(" ")).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("allows local commands with example Supabase settings", () => {
    expect(
      validateSupabaseEgressGuard({
        NODE_ENV: "development",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.com",
        SUPABASE_SERVICE_ROLE_KEY: "local-service-role-key",
      })
    ).toEqual([]);
  });

  it("allows explicit production opt-in for a single command", () => {
    expect(
      validateSupabaseEgressGuard({
        NODE_ENV: "development",
        FS_ALLOW_PROD_SUPABASE: "1",
        NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "sb_secret_live-key",
      })
    ).toEqual([]);
  });

  it("allows explicitly isolated CI Supabase for admin e2e", () => {
    expect(
      validateSupabaseEgressGuard({
        NODE_ENV: "development",
        FS_SUPABASE_ENV: "ci",
        NEXT_PUBLIC_SUPABASE_URL: "https://ci-project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "sb_secret_ci-key",
      })
    ).toEqual([]);
  });

  it("blocks known production Supabase origin in CI without production opt-in", () => {
    const errors = validateSupabaseEgressGuard({
      NODE_ENV: "development",
      FS_SUPABASE_ENV: "ci",
      NEXT_PUBLIC_SUPABASE_URL: "https://prod-project.supabase.co",
      FS_PRODUCTION_SUPABASE_URL: "https://prod-project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "sb_secret_ci-key",
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("FS_PRODUCTION_SUPABASE_URL");
  });
});
