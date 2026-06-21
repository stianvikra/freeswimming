-- Expand manual swim completion rows into editable actual-history rows.
-- The legacy table name stays for compatibility; provider evidence still belongs in future
-- provider/reconciliation tables rather than this manual actual row.

alter table public.completed_activity_events
  add column if not exists actual_started_at timestamptz,
  add column if not exists actual_duration_seconds integer,
  add column if not exists actual_distance_m numeric(8, 2),
  add column if not exists actual_environment text,
  add column if not exists actual_pool_length_m numeric(5, 2),
  add column if not exists actual_pool_length_unit text,
  add column if not exists correction_note text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'completed_activity_events_outcome_check'
      and conrelid = 'public.completed_activity_events'::regclass
  ) then
    alter table public.completed_activity_events
      drop constraint completed_activity_events_outcome_check;
  end if;
end $$;

alter table public.completed_activity_events
  add constraint completed_activity_events_outcome_check
  check (
    outcome in (
      'completed',
      'completed_as_planned',
      'completed_different',
      'partial',
      'completed_on_another_day',
      'cancelled_as_actual',
      'needs_review'
    )
  );

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_duration_seconds_check,
  add constraint completed_activity_events_actual_duration_seconds_check
    check (actual_duration_seconds is null or actual_duration_seconds between 0 and 86400);

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_distance_m_check,
  add constraint completed_activity_events_actual_distance_m_check
    check (actual_distance_m is null or actual_distance_m between 0 and 100000);

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_environment_check,
  add constraint completed_activity_events_actual_environment_check
    check (actual_environment is null or actual_environment in ('pool', 'open_water'));

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_pool_length_m_check,
  add constraint completed_activity_events_actual_pool_length_m_check
    check (actual_pool_length_m is null or actual_pool_length_m between 12.5 and 500);

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_pool_length_unit_check,
  add constraint completed_activity_events_actual_pool_length_unit_check
    check (actual_pool_length_unit is null or actual_pool_length_unit in ('m', 'yd'));

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_correction_note_check,
  add constraint completed_activity_events_correction_note_check
    check (correction_note is null or char_length(correction_note) <= 1000);

grant select, insert, update on public.completed_activity_events to authenticated;

drop policy if exists completed_activity_events_select_own on public.completed_activity_events;
create policy completed_activity_events_select_own
on public.completed_activity_events
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists completed_activity_events_insert_own on public.completed_activity_events;
create policy completed_activity_events_insert_own
on public.completed_activity_events
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists completed_activity_events_update_own on public.completed_activity_events;
create policy completed_activity_events_update_own
on public.completed_activity_events
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);
