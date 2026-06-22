import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildProviderActivityEvidenceIdentityKey,
  isProviderActivityEvidenceCompletionTruth,
  isProviderEvidenceSchemaMissing,
  normalizeProviderActivityEvidenceStatus,
  normalizeProviderActivityFileKind,
  normalizeProviderActivityFileKinds,
  normalizeProviderActivityFileState,
  normalizeProviderConnectionStatus,
  normalizeProviderEvidenceProviderKey,
  normalizeProviderImportRunKind,
  normalizeProviderImportRunStatus,
} from "@/lib/my-library/provider-evidence";

describe("provider evidence contract", () => {
  it("keeps known provider values and fails unknown values closed", () => {
    expect(normalizeProviderEvidenceProviderKey("garmin_activity_api")).toBe("garmin_activity_api");
    expect(normalizeProviderEvidenceProviderKey("unknown_provider")).toBe("unmapped");

    expect(normalizeProviderConnectionStatus("revoked")).toBe("revoked");
    expect(normalizeProviderConnectionStatus("synced")).toBe("needs_review");

    expect(normalizeProviderActivityEvidenceStatus("duplicate_provider_activity")).toBe(
      "duplicate_provider_activity"
    );
    expect(normalizeProviderActivityEvidenceStatus("matched")).toBe("unmapped");

    expect(normalizeProviderImportRunKind("webhook_signal")).toBe("webhook_signal");
    expect(normalizeProviderImportRunKind("live_oauth_callback")).toBe("support_repair");

    expect(normalizeProviderImportRunStatus("failed_retryable")).toBe("failed_retryable");
    expect(normalizeProviderImportRunStatus("provider_secret_error")).toBe("failed_final");

    expect(normalizeProviderActivityFileState("available_from_provider")).toBe(
      "available_from_provider"
    );
    expect(normalizeProviderActivityFileState("stored_in_bucket")).toBe("unsupported");

    expect(normalizeProviderActivityFileKind("fit")).toBe("fit");
    expect(normalizeProviderActivityFileKind("json_payload")).toBe("unsupported");
    expect(normalizeProviderActivityFileKinds(["fit", "json_payload", "tcx"])).toEqual([
      "fit",
      "tcx",
    ]);
  });

  it("builds the same idempotency identity as the database unique guard", () => {
    expect(
      buildProviderActivityEvidenceIdentityKey({
        userId: "user-1",
        providerKey: "garmin_activity_api",
        providerActivityId: "activity-1",
      })
    ).toBe("user-1:garmin_activity_api:activity-1");
  });

  it("never treats raw provider evidence as completion truth", () => {
    expect(isProviderActivityEvidenceCompletionTruth()).toBe(false);
  });

  it("detects provider evidence schema drift and ignores unrelated database errors", () => {
    expect(
      isProviderEvidenceSchemaMissing({
        code: "42P01",
        message: "relation provider_activity_evidence does not exist",
      })
    ).toBe(true);
    expect(
      isProviderEvidenceSchemaMissing({
        message: "column redacted_summary does not exist",
      })
    ).toBe(true);
    expect(
      isProviderEvidenceSchemaMissing({
        code: "23505",
        message: "duplicate key value violates unique constraint",
      })
    ).toBe(false);
  });
});

describe("provider evidence migration", () => {
  const migration = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/20260622170000_provider_evidence_schema_foundation.sql"
    ),
    "utf8"
  );

  it("creates separate provider tables with owner-scoped RLS", () => {
    expect(migration).toContain("create table if not exists public.provider_connections");
    expect(migration).toContain("create table if not exists public.provider_import_runs");
    expect(migration).toContain("create table if not exists public.provider_activity_evidence");
    expect(migration).toContain(
      "alter table public.provider_connections enable row level security"
    );
    expect(migration).toContain(
      "alter table public.provider_import_runs enable row level security"
    );
    expect(migration).toContain(
      "alter table public.provider_activity_evidence enable row level security"
    );
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("auth.uid() is not null and auth.uid() = user_id");
  });

  it("keeps provider evidence idempotent and separate from manual actual history", () => {
    expect(migration).toContain(
      "constraint provider_activity_evidence_user_provider_activity_unique"
    );
    expect(migration).toContain("unique (user_id, provider_key, provider_activity_id)");
    expect(migration).toContain("constraint provider_connections_id_user_provider_unique");
    expect(migration).toContain("unique (id, user_id, provider_key)");
    expect(migration).toContain("constraint provider_import_runs_connection_user_provider_fkey");
    expect(migration).toContain("foreign key (provider_connection_id, user_id, provider_key)");
    expect(migration).toContain(
      "constraint provider_activity_evidence_import_run_user_provider_fkey"
    );
    expect(migration).toContain("foreign key (import_run_id, user_id, provider_key)");
    expect(migration).not.toContain("alter table public.completed_activity_events");
  });

  it("does not add token or raw provider file storage", () => {
    expect(migration).not.toMatch(/\b(access|refresh)_token\b/i);
    expect(migration).not.toMatch(/\boauth.*secret\b/i);
    expect(migration).not.toMatch(/\braw_(payload|file)\b/i);
    expect(migration).toContain("redacted_summary jsonb");
    expect(migration).toContain("available_file_kinds text[]");
  });
});
