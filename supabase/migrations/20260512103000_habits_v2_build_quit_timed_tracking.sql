-- Habits V2: build, quit, and timed tracking metadata.
-- Existing V1 habit rows remain readable as build-mode habits.

alter table public.habit_definitions
  add column if not exists habit_mode text not null default 'build'
    check (habit_mode in ('build', 'quit', 'timed')),
  add column if not exists start_date date not null default (timezone('utc', now())::date),
  add column if not exists last_lapse_date date,
  add column if not exists timer_enabled boolean not null default false,
  add column if not exists timer_target_seconds integer;

update public.habit_definitions
set start_date = (created_at at time zone 'utc')::date
where created_at is not null
  and habit_mode = 'build'
  and start_date = (timezone('utc', now())::date);

alter table public.habit_definitions
  drop constraint if exists habit_definitions_lapse_date_check,
  add constraint habit_definitions_lapse_date_check
    check (last_lapse_date is null or last_lapse_date >= start_date),
  drop constraint if exists habit_definitions_timer_target_seconds_check,
  add constraint habit_definitions_timer_target_seconds_check
    check (timer_target_seconds is null or timer_target_seconds between 1 and 86400),
  drop constraint if exists habit_definitions_mode_shape_check,
  add constraint habit_definitions_mode_shape_check
    check (
      (
        habit_mode = 'build' and
        (
          timer_enabled = false or
          habit_type = 'duration'
        )
      ) or (
        habit_mode = 'quit' and
        habit_type = 'avoidance' and
        target_operator = 'at_most' and
        target_value_numeric = 0 and
        timer_enabled = false and
        timer_target_seconds is null
      ) or (
        habit_mode = 'timed' and
        habit_type = 'duration' and
        target_operator = 'at_least' and
        target_value_numeric is not null and
        target_unit in ('minutes', 'seconds') and
        timer_enabled = true and
        timer_target_seconds is not null
      )
    );

create index if not exists habit_definitions_user_mode_status_idx
  on public.habit_definitions (user_id, habit_mode, status, start_date desc);
