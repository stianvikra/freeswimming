-- Provider evidence foundation for future received activity integrations.
-- These tables store private, owner-scoped provider evidence summaries only.
-- OAuth tokens, raw provider payloads, and FIT/GPX/TCX files remain out of scope.

create table if not exists public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_key text not null,
  status text not null default 'connected_metadata_only',
  provider_user_id text,
  provider_display_name text,
  connected_at timestamptz,
  revoked_at timestamptz,
  disabled_at timestamptz,
  last_successful_sync_at timestamptz,
  last_sync_error_code text,
  redacted_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_connections_provider_key_check
    check (provider_key in (
      'garmin_activity_api',
      'strava_activity_api',
      'apple_health',
      'android_health_connect',
      'manual_fixture'
    )),
  constraint provider_connections_status_check
    check (status in (
      'not_connected',
      'connected_metadata_only',
      'revoked',
      'disabled',
      'needs_review',
      'provider_unavailable'
    )),
  constraint provider_connections_provider_user_id_check
    check (provider_user_id is null or char_length(btrim(provider_user_id)) between 1 and 200),
  constraint provider_connections_provider_display_name_check
    check (
      provider_display_name is null
      or char_length(btrim(provider_display_name)) between 1 and 200
    ),
  constraint provider_connections_last_sync_error_code_check
    check (
      last_sync_error_code is null
      or char_length(btrim(last_sync_error_code)) between 1 and 120
    ),
  constraint provider_connections_redacted_metadata_check
    check (jsonb_typeof(redacted_metadata) = 'object'),
  constraint provider_connections_user_provider_unique
    unique (user_id, provider_key),
  constraint provider_connections_id_user_provider_unique
    unique (id, user_id, provider_key)
);

create index if not exists provider_connections_user_status_idx
  on public.provider_connections (user_id, status, updated_at desc);

drop trigger if exists provider_connections_set_updated_at on public.provider_connections;
create trigger provider_connections_set_updated_at
before update on public.provider_connections
for each row
execute function public.set_updated_at();

grant select on public.provider_connections to authenticated;

alter table public.provider_connections enable row level security;

drop policy if exists provider_connections_select_own on public.provider_connections;
create policy provider_connections_select_own
on public.provider_connections
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.provider_import_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_connection_id uuid,
  provider_key text not null,
  run_kind text not null default 'manual_fixture',
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  total_activity_count integer not null default 0,
  imported_count integer not null default 0,
  duplicate_count integer not null default 0,
  malformed_count integer not null default 0,
  unsupported_count integer not null default 0,
  error_code text,
  redacted_diagnostics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_import_runs_provider_key_check
    check (provider_key in (
      'garmin_activity_api',
      'strava_activity_api',
      'apple_health',
      'android_health_connect',
      'manual_fixture'
    )),
  constraint provider_import_runs_run_kind_check
    check (run_kind in (
      'manual_fixture',
      'backfill',
      'webhook_signal',
      'polling_import',
      'support_repair'
    )),
  constraint provider_import_runs_status_check
    check (status in (
      'queued',
      'running',
      'completed',
      'completed_with_warnings',
      'failed_retryable',
      'failed_final',
      'disabled'
    )),
  constraint provider_import_runs_counts_check
    check (
      total_activity_count >= 0
      and imported_count >= 0
      and duplicate_count >= 0
      and malformed_count >= 0
      and unsupported_count >= 0
    ),
  constraint provider_import_runs_error_code_check
    check (error_code is null or char_length(btrim(error_code)) between 1 and 120),
  constraint provider_import_runs_redacted_diagnostics_check
    check (jsonb_typeof(redacted_diagnostics) = 'object'),
  constraint provider_import_runs_id_user_provider_unique
    unique (id, user_id, provider_key),
  constraint provider_import_runs_connection_user_provider_fkey
    foreign key (provider_connection_id, user_id, provider_key)
    references public.provider_connections (id, user_id, provider_key)
    on delete cascade
);

create index if not exists provider_import_runs_user_provider_status_idx
  on public.provider_import_runs (user_id, provider_key, status, created_at desc);

create index if not exists provider_import_runs_connection_idx
  on public.provider_import_runs (provider_connection_id, created_at desc)
  where provider_connection_id is not null;

drop trigger if exists provider_import_runs_set_updated_at on public.provider_import_runs;
create trigger provider_import_runs_set_updated_at
before update on public.provider_import_runs
for each row
execute function public.set_updated_at();

grant select on public.provider_import_runs to authenticated;

alter table public.provider_import_runs enable row level security;

drop policy if exists provider_import_runs_select_own on public.provider_import_runs;
create policy provider_import_runs_select_own
on public.provider_import_runs
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create table if not exists public.provider_activity_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_connection_id uuid,
  import_run_id uuid,
  provider_key text not null,
  provider_activity_id text not null,
  status text not null default 'needs_review',
  activity_started_at timestamptz,
  activity_date date,
  activity_type text,
  sport_type text,
  sub_sport_type text,
  duration_seconds integer,
  distance_m numeric(10, 2),
  pool_length_m numeric(5, 2),
  pool_length_unit text,
  file_state text not null default 'none',
  available_file_kinds text[] not null default '{}'::text[],
  redacted_summary jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_activity_evidence_provider_key_check
    check (provider_key in (
      'garmin_activity_api',
      'strava_activity_api',
      'apple_health',
      'android_health_connect',
      'manual_fixture'
    )),
  constraint provider_activity_evidence_provider_activity_id_check
    check (char_length(btrim(provider_activity_id)) between 1 and 200),
  constraint provider_activity_evidence_status_check
    check (status in (
      'imported',
      'needs_review',
      'duplicate_provider_activity',
      'malformed',
      'unsupported_activity',
      'ignored',
      'unmapped'
    )),
  constraint provider_activity_evidence_activity_type_check
    check (activity_type is null or char_length(btrim(activity_type)) between 1 and 120),
  constraint provider_activity_evidence_sport_type_check
    check (sport_type is null or char_length(btrim(sport_type)) between 1 and 120),
  constraint provider_activity_evidence_sub_sport_type_check
    check (sub_sport_type is null or char_length(btrim(sub_sport_type)) between 1 and 120),
  constraint provider_activity_evidence_duration_seconds_check
    check (duration_seconds is null or duration_seconds between 0 and 172800),
  constraint provider_activity_evidence_distance_m_check
    check (distance_m is null or distance_m between 0 and 1000000),
  constraint provider_activity_evidence_pool_length_m_check
    check (pool_length_m is null or pool_length_m between 12.5 and 500),
  constraint provider_activity_evidence_pool_length_unit_check
    check (pool_length_unit is null or pool_length_unit in ('m', 'yd')),
  constraint provider_activity_evidence_file_state_check
    check (file_state in (
      'none',
      'available_from_provider',
      'deferred_storage',
      'unsupported',
      'redacted'
    )),
  constraint provider_activity_evidence_available_file_kinds_check
    check (available_file_kinds <@ array['fit', 'gpx', 'tcx']::text[]),
  constraint provider_activity_evidence_redacted_summary_check
    check (jsonb_typeof(redacted_summary) = 'object'),
  constraint provider_activity_evidence_user_provider_activity_unique
    unique (user_id, provider_key, provider_activity_id),
  constraint provider_activity_evidence_connection_user_provider_fkey
    foreign key (provider_connection_id, user_id, provider_key)
    references public.provider_connections (id, user_id, provider_key)
    on delete cascade,
  constraint provider_activity_evidence_import_run_user_provider_fkey
    foreign key (import_run_id, user_id, provider_key)
    references public.provider_import_runs (id, user_id, provider_key)
    on delete cascade
);

create index if not exists provider_activity_evidence_user_date_idx
  on public.provider_activity_evidence (user_id, activity_date desc, created_at desc);

create index if not exists provider_activity_evidence_user_status_idx
  on public.provider_activity_evidence (user_id, status, updated_at desc);

create index if not exists provider_activity_evidence_connection_idx
  on public.provider_activity_evidence (provider_connection_id, activity_date desc)
  where provider_connection_id is not null;

create index if not exists provider_activity_evidence_import_run_idx
  on public.provider_activity_evidence (import_run_id, created_at desc)
  where import_run_id is not null;

drop trigger if exists provider_activity_evidence_set_updated_at on public.provider_activity_evidence;
create trigger provider_activity_evidence_set_updated_at
before update on public.provider_activity_evidence
for each row
execute function public.set_updated_at();

grant select on public.provider_activity_evidence to authenticated;

alter table public.provider_activity_evidence enable row level security;

drop policy if exists provider_activity_evidence_select_own on public.provider_activity_evidence;
create policy provider_activity_evidence_select_own
on public.provider_activity_evidence
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);
