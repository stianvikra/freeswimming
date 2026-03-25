import { describe, expect, it } from "vitest";
import { isPlaceholderAdminNoteArtifactCleanupEnv } from "@/tests/e2e/admin-note-test-artifact-cleanup";

describe("admin-note artifact cleanup env guard", () => {
  it("skips cleanup when CI placeholder Supabase config is injected", () => {
    expect(
      isPlaceholderAdminNoteArtifactCleanupEnv({
        supabaseUrl: "https://example.com",
        serviceRoleKey: "ci-service-role-key",
      })
    ).toBe(true);
  });

  it("keeps cleanup enabled for real Supabase config", () => {
    expect(
      isPlaceholderAdminNoteArtifactCleanupEnv({
        supabaseUrl: "https://project-ref.supabase.co",
        serviceRoleKey: "service-role-key",
      })
    ).toBe(false);
  });
});
