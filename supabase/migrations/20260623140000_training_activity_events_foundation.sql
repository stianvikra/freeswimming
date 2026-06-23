-- Generic activity-history foundation.
-- Existing completed_activity_events rows remain planned swim actual truth.
-- This table is the future canonical activity-history boundary for mapped rows and compatibility
-- aliases; provider evidence remains evidence until a later reconciliation child links it.

create table if not exists public.training_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_kind text not null default 'manual',
  activity_category text not null default 'workout',
  canonical_sport text not null default 'unknown',
  canonical_sub_sport text not null default 'unknown',
  mapping_status text not null default 'needs_review',
  outcome text not null default 'needs_review',
  activity_started_at timestamptz,
  activity_ended_at timestamptz,
  activity_local_date date,
  activity_timezone text,
  timezone_source text not null default 'unknown',
  duration_seconds integer,
  distance_m numeric(10, 2),
  elevation_m numeric(10, 2),
  energy_kcal numeric(10, 2),
  average_heart_rate_bpm integer,
  training_load numeric(10, 2),
  planned_workout_instance_id uuid,
  workout_id uuid,
  program_id uuid,
  completed_activity_event_id uuid references public.completed_activity_events (id) on delete set null,
  provider_activity_evidence_id uuid references public.provider_activity_evidence (id) on delete set null,
  detail_kind text not null default 'none',
  detail_snapshot jsonb not null default '{}'::jsonb,
  support_diagnostics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint training_activity_events_source_kind_check
    check (source_kind in ('manual', 'provider_evidence', 'system_reconciled')),
  constraint training_activity_events_activity_category_check
    check (activity_category in ('workout')),
  constraint training_activity_events_canonical_sport_check
    check (canonical_sport in (
      'swimming',
      'running',
      'cycling',
      'walking',
      'strength_training',
      'yoga',
      'mobility',
      'dryland',
      'unknown'
    )),
  constraint training_activity_events_canonical_sub_sport_check
    check (canonical_sub_sport in (
      'pool_swim',
      'open_water_swim',
      'outdoor_run',
      'treadmill_run',
      'road_cycling',
      'indoor_cycling',
      'walk',
      'hike',
      'strength',
      'yoga',
      'mobility',
      'dryland',
      'unknown'
    )),
  constraint training_activity_events_mapping_status_check
    check (mapping_status in (
      'trusted',
      'needs_review',
      'unmapped',
      'unsupported',
      'duplicate',
      'orphaned',
      'schema_drift'
    )),
  constraint training_activity_events_outcome_check
    check (outcome in (
      'completed_as_planned',
      'completed_different',
      'partial',
      'completed_on_another_day',
      'cancelled_as_actual',
      'needs_review',
      'unmapped',
      'unsupported'
    )),
  constraint training_activity_events_time_order_check
    check (
      activity_started_at is null
      or activity_ended_at is null
      or activity_ended_at >= activity_started_at
    ),
  constraint training_activity_events_activity_timezone_check
    check (activity_timezone is null or char_length(btrim(activity_timezone)) between 1 and 120),
  constraint training_activity_events_timezone_source_check
    check (timezone_source in ('provider', 'manual', 'user_profile', 'unknown')),
  constraint training_activity_events_duration_seconds_check
    check (duration_seconds is null or duration_seconds between 0 and 172800),
  constraint training_activity_events_distance_m_check
    check (distance_m is null or distance_m between 0 and 1000000),
  constraint training_activity_events_elevation_m_check
    check (elevation_m is null or elevation_m between -10000 and 100000),
  constraint training_activity_events_energy_kcal_check
    check (energy_kcal is null or energy_kcal between 0 and 100000),
  constraint training_activity_events_average_heart_rate_bpm_check
    check (average_heart_rate_bpm is null or average_heart_rate_bpm between 0 and 260),
  constraint training_activity_events_training_load_check
    check (training_load is null or training_load between 0 and 100000),
  constraint training_activity_events_detail_kind_check
    check (detail_kind in ('none', 'swim_session_snapshot', 'provider_summary', 'unsupported_detail')),
  constraint training_activity_events_detail_snapshot_check
    check (jsonb_typeof(detail_snapshot) = 'object'),
  constraint training_activity_events_support_diagnostics_check
    check (jsonb_typeof(support_diagnostics) = 'object')
);

create index if not exists training_activity_events_user_local_date_idx
  on public.training_activity_events (user_id, activity_local_date desc, created_at desc);

create index if not exists training_activity_events_user_status_idx
  on public.training_activity_events (user_id, mapping_status, updated_at desc);

create index if not exists training_activity_events_user_source_idx
  on public.training_activity_events (user_id, source_kind, canonical_sport, created_at desc);

create unique index if not exists training_activity_events_completed_event_unique
  on public.training_activity_events (user_id, completed_activity_event_id)
  where completed_activity_event_id is not null;

create unique index if not exists training_activity_events_provider_evidence_unique
  on public.training_activity_events (user_id, provider_activity_evidence_id)
  where provider_activity_evidence_id is not null;

drop trigger if exists training_activity_events_set_updated_at on public.training_activity_events;
create trigger training_activity_events_set_updated_at
before update on public.training_activity_events
for each row
execute function public.set_updated_at();

grant select, insert, update on public.training_activity_events to authenticated;

alter table public.training_activity_events enable row level security;

drop policy if exists training_activity_events_select_own on public.training_activity_events;
create policy training_activity_events_select_own
on public.training_activity_events
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists training_activity_events_insert_own on public.training_activity_events;
create policy training_activity_events_insert_own
on public.training_activity_events
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists training_activity_events_update_own on public.training_activity_events;
create policy training_activity_events_update_own
on public.training_activity_events
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);
