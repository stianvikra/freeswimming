import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260609223000_analytics_rollup_retention_lifecycle.sql"
  ),
  "utf8"
);

describe("analytics rollup retention migration contract", () => {
  it("creates daily rollups without raw payload or user identity columns", () => {
    expect(migration).toContain("create table if not exists public.analytics_event_daily_rollups");
    expect(migration).toContain("event_count integer not null default 0");
    expect(migration).toContain("known_user_count integer not null default 0");
    expect(migration).toContain("primary key (");

    const rollupTable = migration.slice(
      migration.indexOf("create table if not exists public.analytics_event_daily_rollups"),
      migration.indexOf("create index if not exists analytics_event_daily_rollups_day_idx")
    );

    expect(rollupTable).not.toMatch(/\bpayload\b/);
    expect(rollupTable).not.toMatch(/\buser_id\b/);
  });

  it("keeps refresh and prune functions service-role-only", () => {
    expect(migration).toContain(
      "revoke all on function public.refresh_analytics_event_daily_rollups(date, date) from authenticated"
    );
    expect(migration).toContain(
      "grant execute on function public.refresh_analytics_event_daily_rollups(date, date) to service_role"
    );
    expect(migration).toContain(
      "revoke all on function public.prune_analytics_events(timestamptz) from authenticated"
    );
    expect(migration).toContain(
      "grant execute on function public.prune_analytics_events(timestamptz) to service_role"
    );
  });

  it("requires rollup coverage and a safe raw-retention floor before pruning", () => {
    expect(migration).toContain(
      "analytics_events prune cutoff must retain at least 30 days of raw events"
    );
    expect(migration).toContain(
      "where rollup.rollup_day = (event.occurred_at at time zone 'utc')::date"
    );
    expect(migration).toContain("operation in ('refresh_daily_rollups', 'prune_raw_events')");
  });
});
