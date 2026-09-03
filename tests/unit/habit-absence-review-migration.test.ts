import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260903123000_habit_absence_review_not_tracked_day_status.sql"
  ),
  "utf8"
);

describe("Habit absence review not-tracked migration", () => {
  it("adds one nullable constrained day status without reinterpreting existing rows", () => {
    const schemaChange = migration.slice(
      0,
      migration.indexOf("create or replace function public.habit_absence_review_guard_day_status")
    );
    expect(migration).toContain("add column if not exists day_status text;");
    expect(migration).toContain("check (day_status is null or day_status in ('not_tracked'))");
    expect(schemaChange).not.toMatch(
      /update public\.habit_absence_review_acknowledgements\s+set day_status/i
    );
    expect(migration).not.toContain("day_status text not null");
  });

  it("keeps all day-status mutations owner-scoped, bounded, atomic, and server-only", () => {
    expect(migration).toContain("create function public.habit_absence_review_set_day_status(");
    expect(migration).toContain("p_user_id uuid");
    expect(migration).toContain("current_user_id uuid := p_user_id");
    expect(migration).toContain("cardinality(p_review_dates) > 7");
    expect(migration).toContain("count(distinct input_date)");
    expect(migration).toContain("p_day_status <> 'not_tracked'");
    expect(migration).toMatch(
      /function public\.habit_absence_review_set_day_status\([\s\S]+?security invoker[\s\S]+?set search_path = ''/
    );
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain(
      "revoke all on function public.habit_absence_review_set_day_status(uuid, date[], text)\n  from authenticated"
    );
    expect(migration).toContain(
      "grant execute on function public.habit_absence_review_set_day_status(uuid, date[], text)\n  to service_role"
    );
    expect(migration).toContain(
      "revoke insert, update on public.habit_absence_review_acknowledgements from authenticated"
    );
    expect(migration).toContain("grant insert (user_id, review_scope, review_date, status)");
    expect(migration).not.toMatch(/grant execute[^;]+to authenticated/i);
    expect(migration).not.toMatch(/grant (?:insert|update)[^;]*day_status/i);
    expect(migration).toContain("HABIT_ABSENCE_REVIEW_WORKFLOW_STATUS_UNSUPPORTED");
    expect(migration).toContain("and acknowledgement.status <> 'reviewed'");
    expect(migration).toContain("was_changed boolean");
    expect(migration).toContain("acknowledgement.review_date = any(changed_dates) as was_changed");
    expect(migration).toMatch(/with changed as \([\s\S]+?returning acknowledgement\.review_date/);
  });

  it("serializes races and makes every successful check-in writer clear the marker", () => {
    expect(migration.match(/pg_catalog\.pg_advisory_xact_lock/g)).toHaveLength(3);
    expect(migration).toContain("HABIT_ABSENCE_REVIEW_CHECK_IN_EXISTS");
    expect(migration).toContain("before insert or update on public.habit_check_ins");
    expect(migration).toMatch(
      /function public\.habit_check_in_clear_absence_review_day_status\(\)[\s\S]+?security definer[\s\S]+?set search_path = ''/
    );
    expect(migration).toContain(
      "revoke all on function public.habit_check_in_clear_absence_review_day_status()\n  from authenticated"
    );
    expect(migration).toContain("set day_status = null");
    expect(migration).toContain("and review_date = new.check_in_date");
    expect(migration).toContain("and day_status is not null");
    expect(migration).toContain("HABIT_ABSENCE_REVIEW_STATUS_IDENTITY_IMMUTABLE");
    expect(migration).toContain("or new.status is distinct from old.status");
    expect(migration).toContain(
      "before insert or update of user_id, review_scope, review_date, status, day_status"
    );
  });

  it("never creates, updates, or deletes synthetic Habit check-ins", () => {
    expect(migration).not.toMatch(/insert into public\.habit_check_ins/i);
    expect(migration).not.toMatch(/update public\.habit_check_ins/i);
    expect(migration).not.toMatch(/delete from public\.habit_check_ins/i);
  });
});
