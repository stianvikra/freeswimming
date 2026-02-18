-- Goals MVP contract expansion.
-- Adds typed target fields and status range needed for the goals hub.

alter table public.goals
  add column if not exists goal_type text not null default 'custom',
  add column if not exists source text not null default 'custom',
  add column if not exists target_distance_m integer,
  add column if not exists target_time_seconds integer,
  add column if not exists target_count integer,
  add column if not exists target_ref text,
  add column if not exists progress_value numeric not null default 0,
  add column if not exists achieved_at timestamptz;

alter table public.goals
  drop constraint if exists goals_status_check;

alter table public.goals
  add constraint goals_status_check
    check (status in ('active', 'on_track', 'at_risk', 'achieved', 'archived'));

alter table public.goals
  drop constraint if exists goals_goal_type_check;

alter table public.goals
  add constraint goals_goal_type_check
    check (goal_type in ('distance_time', 'distance_continuous', 'drill_complete', 'module_complete', 'custom'));

alter table public.goals
  drop constraint if exists goals_source_check;

alter table public.goals
  add constraint goals_source_check
    check (source in ('template', 'custom'));

alter table public.goals
  drop constraint if exists goals_progress_value_check;

alter table public.goals
  add constraint goals_progress_value_check
    check (progress_value >= 0);

alter table public.goals
  drop constraint if exists goals_target_distance_m_check;

alter table public.goals
  add constraint goals_target_distance_m_check
    check (target_distance_m is null or target_distance_m > 0);

alter table public.goals
  drop constraint if exists goals_target_time_seconds_check;

alter table public.goals
  add constraint goals_target_time_seconds_check
    check (target_time_seconds is null or target_time_seconds > 0);

alter table public.goals
  drop constraint if exists goals_target_count_check;

alter table public.goals
  add constraint goals_target_count_check
    check (target_count is null or target_count > 0);

create index if not exists goals_user_type_status_idx
  on public.goals (user_id, goal_type, status);
