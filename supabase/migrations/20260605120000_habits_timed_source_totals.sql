-- Habits timed source totals.
-- Additive source fields keep timer time and manual time diagnosable while preserving value_numeric as the compatible total.

alter table public.habit_check_ins
  add column if not exists timer_seconds integer not null default 0,
  add column if not exists manual_minutes integer not null default 0;

alter table public.habit_check_ins
  drop constraint if exists habit_check_ins_timer_seconds_check,
  add constraint habit_check_ins_timer_seconds_check
    check (timer_seconds between 0 and 86400),
  drop constraint if exists habit_check_ins_manual_minutes_check,
  add constraint habit_check_ins_manual_minutes_check
    check (manual_minutes between 0 and 1440);
