import { describe, expect, it } from "vitest";

import {
  evaluateSupabaseMigrationDrift,
  getChangedSupabaseMigrationFiles,
  isSupabaseMigrationFile,
  parsePendingSupabaseMigrations,
} from "../../scripts/assert-supabase-migration-drift.mjs";

describe("Supabase migration drift gate", () => {
  it("detects changed Supabase SQL migrations only", () => {
    expect(isSupabaseMigrationFile("supabase/migrations/20260512103000_example.sql")).toBe(true);
    expect(isSupabaseMigrationFile("./supabase/migrations/20260512103000_example.sql")).toBe(true);
    expect(isSupabaseMigrationFile("supabase/README.md")).toBe(false);
    expect(isSupabaseMigrationFile("docs/supabase/migrations/example.sql")).toBe(false);

    expect(
      getChangedSupabaseMigrationFiles([
        "docs/foo.md",
        "supabase/migrations/20260512103000_example.sql",
        "supabase/migrations/20260512103000_example.sql",
      ])
    ).toEqual(["supabase/migrations/20260512103000_example.sql"]);
  });

  it("parses pending migrations from Supabase dry-run output", () => {
    expect(
      parsePendingSupabaseMigrations(`DRY RUN: migrations will *not* be pushed to the database.
Connecting to remote database...
Would push these migrations:
 \u2022 20260512103000_habits_v2_build_quit_timed_tracking.sql
 \u2022 20260513120000_next_schema.sql
Finished supabase db push.`)
    ).toEqual([
      "20260512103000_habits_v2_build_quit_timed_tracking.sql",
      "20260513120000_next_schema.sql",
    ]);
  });

  it("skips without remote inspection when no migration file changed", () => {
    const result = evaluateSupabaseMigrationDrift({
      changedFiles: ["docs/runbooks/supabase-migration-discipline.md"],
      dryRunStatus: 1,
      dryRunOutput: "",
    });

    expect(result.ok).toBe(true);
    expect(result.kind).toBe("skipped");
  });

  it("passes when changed migrations are already applied remotely", () => {
    const result = evaluateSupabaseMigrationDrift({
      changedFiles: ["supabase/migrations/20260512103000_example.sql"],
      dryRunStatus: 0,
      dryRunOutput: "Remote database is up to date.",
    });

    expect(result.ok).toBe(true);
    expect(result.kind).toBe("up-to-date");
  });

  it("fails changed migration branches when dry-run reports pending migrations", () => {
    const result = evaluateSupabaseMigrationDrift({
      changedFiles: ["supabase/migrations/20260512103000_example.sql"],
      dryRunStatus: 0,
      dryRunOutput: `Would push these migrations:
 \u2022 20260512103000_example.sql`,
    });

    expect(result.ok).toBe(false);
    expect(result.kind).toBe("pending-blocked");
    expect(result.pendingMigrations).toEqual(["20260512103000_example.sql"]);
  });

  it("allows pending migrations only with the explicit rollout override", () => {
    const result = evaluateSupabaseMigrationDrift({
      changedFiles: ["supabase/migrations/20260512103000_example.sql"],
      dryRunStatus: 0,
      dryRunOutput: `Would push these migrations:
 \u2022 20260512103000_example.sql`,
      allowPending: true,
    });

    expect(result.ok).toBe(true);
    expect(result.kind).toBe("pending-allowed");
  });

  it("fails closed when remote dry-run cannot inspect the linked database", () => {
    const result = evaluateSupabaseMigrationDrift({
      changedFiles: ["supabase/migrations/20260512103000_example.sql"],
      dryRunStatus: 1,
      dryRunOutput: "failed SASL auth",
    });

    expect(result.ok).toBe(false);
    expect(result.kind).toBe("dry-run-failed");
  });
});
