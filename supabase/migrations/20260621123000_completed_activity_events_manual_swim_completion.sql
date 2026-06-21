-- Canonical completed swim activity events for manual Calendar completion.
-- Plan rows stay separate. The route validates planned/workout/program ownership at write time,
-- while this table keeps immutable IDs and snapshots so completed history survives later plan edits.

create table if not exists public.completed_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planned_workout_instance_id uuid not null,
  workout_id uuid not null,
  program_id uuid not null,
  outcome text not null default 'completed',
  source_kind text not null default 'manual',
  completed_on date not null,
  planned_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint completed_activity_events_outcome_check
    check (outcome in ('completed')),
  constraint completed_activity_events_source_kind_check
    check (source_kind in ('manual')),
  constraint completed_activity_events_planned_unique
    unique (user_id, planned_workout_instance_id)
);

create index if not exists completed_activity_events_user_completed_on_idx
  on public.completed_activity_events (user_id, completed_on, created_at);

create index if not exists completed_activity_events_user_planned_instance_idx
  on public.completed_activity_events (user_id, planned_workout_instance_id);

drop trigger if exists completed_activity_events_set_updated_at on public.completed_activity_events;
create trigger completed_activity_events_set_updated_at
before update on public.completed_activity_events
for each row
execute function public.set_updated_at();

grant select, insert on public.completed_activity_events to authenticated;

alter table public.completed_activity_events enable row level security;

drop policy if exists completed_activity_events_select_own on public.completed_activity_events;
create policy completed_activity_events_select_own
on public.completed_activity_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists completed_activity_events_insert_own on public.completed_activity_events;
create policy completed_activity_events_insert_own
on public.completed_activity_events
for insert
to authenticated
with check (auth.uid() = user_id);
