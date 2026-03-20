-- Canonical workout foundation for accepted single-session drafts.
-- Keeps accepted workout entities separate from local generator drafts, later builder UX,
-- program entities, and training-history reconciliation.

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_kind text not null check (source_kind in ('ai_session_v1', 'manual')),
  status text not null check (status in ('accepted')),
  generator_kind text not null check (generator_kind in ('rule_engine_v1')),
  source_fingerprint text not null,
  title text not null,
  title_suggestions text[] not null default '{}',
  description text not null default '',
  environment text not null check (environment in ('pool', 'open_water')),
  pool_length_m numeric(4, 1) check (
    pool_length_m is null or
    pool_length_m in (12.5, 25, 50)
  ),
  session_type text not null check (
    session_type in (
      'recovery',
      'endurance',
      'technique',
      'threshold_css',
      'speed',
      'race_pace'
    )
  ),
  effort text not null check (
    effort in (
      'easy',
      'moderate',
      'hard',
      'very_hard',
      'race_pace'
    )
  ),
  size_mode text not null check (size_mode in ('distance', 'estimated_time')),
  target_distance_m integer,
  target_time_min integer,
  total_distance_m integer,
  estimated_duration_min integer,
  base_pace_seconds_per_100 numeric(8, 2) not null,
  used_css_pace_label text,
  allowed_strokes text[] not null default '{}',
  equipment_allowlist text[] not null default '{}',
  focus_text text,
  goal_title text,
  constraint_text text,
  warnings text[] not null default '{}',
  steps jsonb not null,
  generated_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workouts_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint workouts_source_fingerprint_check
    check (char_length(btrim(source_fingerprint)) between 1 and 64),
  constraint workouts_description_check
    check (char_length(description) <= 600),
  constraint workouts_used_css_pace_label_check
    check (
      used_css_pace_label is null or
      char_length(btrim(used_css_pace_label)) between 1 and 32
    ),
  constraint workouts_focus_text_check
    check (focus_text is null or char_length(btrim(focus_text)) between 1 and 120),
  constraint workouts_goal_title_check
    check (goal_title is null or char_length(btrim(goal_title)) between 1 and 120),
  constraint workouts_constraint_text_check
    check (
      constraint_text is null or
      char_length(btrim(constraint_text)) between 1 and 240
    ),
  constraint workouts_target_distance_m_check
    check (target_distance_m is null or target_distance_m between 1 and 100000),
  constraint workouts_target_time_min_check
    check (target_time_min is null or target_time_min between 1 and 1440),
  constraint workouts_total_distance_m_check
    check (total_distance_m is null or total_distance_m between 1 and 100000),
  constraint workouts_estimated_duration_min_check
    check (
      estimated_duration_min is null or
      estimated_duration_min between 1 and 1440
    ),
  constraint workouts_base_pace_check
    check (base_pace_seconds_per_100 > 0 and base_pace_seconds_per_100 < 10000),
  constraint workouts_steps_array_check
    check (jsonb_typeof(steps) = 'array'),
  constraint workouts_steps_non_empty_check
    check (jsonb_array_length(steps) > 0),
  constraint workouts_size_mode_targets_check
    check (
      (size_mode = 'distance' and target_distance_m is not null and target_time_min is null) or
      (
        size_mode = 'estimated_time' and
        target_time_min is not null and
        target_distance_m is null
      )
    )
);

create index if not exists workouts_user_updated_idx
  on public.workouts (user_id, updated_at desc);

create index if not exists workouts_user_source_updated_idx
  on public.workouts (user_id, source_kind, updated_at desc);

drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
before update on public.workouts
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.workouts to authenticated;

alter table public.workouts enable row level security;

drop policy if exists workouts_select_own on public.workouts;
create policy workouts_select_own
on public.workouts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists workouts_insert_own on public.workouts;
create policy workouts_insert_own
on public.workouts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists workouts_update_own on public.workouts;
create policy workouts_update_own
on public.workouts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workouts_delete_own on public.workouts;
create policy workouts_delete_own
on public.workouts
for delete
to authenticated
using (auth.uid() = user_id);
