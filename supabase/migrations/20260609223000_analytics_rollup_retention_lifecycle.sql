-- Privacy-safe analytics rollup and retention lifecycle foundation.

create table if not exists public.analytics_event_daily_rollups (
  rollup_day date not null,
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]{1,80}$'),
  channel text not null check (channel in ('client', 'server')),
  public_aggregate boolean not null,
  source text not null default '',
  route_template text not null default '',
  route_category text not null default '',
  product_id text not null default '',
  product_type text not null default '',
  event_count integer not null default 0 check (event_count >= 0),
  known_user_count integer not null default 0 check (known_user_count >= 0),
  first_event_at timestamptz not null,
  last_event_at timestamptz not null,
  refreshed_at timestamptz not null default timezone('utc', now()),
  primary key (
    rollup_day,
    event_name,
    channel,
    public_aggregate,
    source,
    route_template,
    route_category,
    product_id,
    product_type
  )
);

create index if not exists analytics_event_daily_rollups_day_idx
  on public.analytics_event_daily_rollups (rollup_day desc);

create index if not exists analytics_event_daily_rollups_event_day_idx
  on public.analytics_event_daily_rollups (event_name, rollup_day desc);

create index if not exists analytics_event_daily_rollups_route_day_idx
  on public.analytics_event_daily_rollups (route_template, rollup_day desc)
  where route_template <> '';

create index if not exists analytics_event_daily_rollups_product_day_idx
  on public.analytics_event_daily_rollups (product_id, rollup_day desc)
  where product_id <> '';

create table if not exists public.analytics_event_rollup_runs (
  id uuid primary key default gen_random_uuid(),
  operation text not null check (operation in ('refresh_daily_rollups', 'prune_raw_events')),
  range_start date,
  range_end date,
  raw_retention_days integer check (raw_retention_days is null or raw_retention_days > 0),
  rollup_window_days integer check (rollup_window_days is null or rollup_window_days > 0),
  rows_affected integer not null default 0 check (rows_affected >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_event_rollup_runs_created_at_idx
  on public.analytics_event_rollup_runs (created_at desc);

grant select on public.analytics_event_daily_rollups to authenticated;
grant select on public.analytics_event_rollup_runs to authenticated;
grant insert, select, update, delete on public.analytics_event_daily_rollups to service_role;
grant insert, select on public.analytics_event_rollup_runs to service_role;

alter table public.analytics_event_daily_rollups enable row level security;
alter table public.analytics_event_rollup_runs enable row level security;

drop policy if exists analytics_event_daily_rollups_select_admin_viewer_plus
on public.analytics_event_daily_rollups;
create policy analytics_event_daily_rollups_select_admin_viewer_plus
on public.analytics_event_daily_rollups
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor', 'viewer')
  )
);

drop policy if exists analytics_event_rollup_runs_select_admin_viewer_plus
on public.analytics_event_rollup_runs;
create policy analytics_event_rollup_runs_select_admin_viewer_plus
on public.analytics_event_rollup_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor', 'viewer')
  )
);

create or replace function public.refresh_analytics_event_daily_rollups(
  p_start_day date default ((timezone('utc', now())::date) - 90),
  p_end_day date default (timezone('utc', now())::date)
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_day date;
  v_end_day date;
  v_rows integer;
begin
  v_start_day := least(
    coalesce(p_start_day, (timezone('utc', now())::date) - 90),
    coalesce(p_end_day, timezone('utc', now())::date)
  );
  v_end_day := greatest(
    coalesce(p_start_day, (timezone('utc', now())::date) - 90),
    coalesce(p_end_day, timezone('utc', now())::date)
  );

  if v_end_day > timezone('utc', now())::date then
    v_end_day := timezone('utc', now())::date;
  end if;

  delete from public.analytics_event_daily_rollups
  where rollup_day between v_start_day and v_end_day;

  insert into public.analytics_event_daily_rollups (
    rollup_day,
    event_name,
    channel,
    public_aggregate,
    source,
    route_template,
    route_category,
    product_id,
    product_type,
    event_count,
    known_user_count,
    first_event_at,
    last_event_at,
    refreshed_at
  )
  select
    (event.occurred_at at time zone 'utc')::date as rollup_day,
    event.event_name,
    event.channel,
    event.public_aggregate,
    coalesce(event.source, '') as source,
    coalesce(event.route_template, '') as route_template,
    coalesce(event.route_category, '') as route_category,
    coalesce(event.product_id, '') as product_id,
    coalesce(event.product_type, '') as product_type,
    count(*)::integer as event_count,
    count(distinct event.user_id)::integer as known_user_count,
    min(event.occurred_at) as first_event_at,
    max(event.occurred_at) as last_event_at,
    timezone('utc', now()) as refreshed_at
  from public.analytics_events event
  where event.occurred_at >= (v_start_day::timestamp at time zone 'utc')
    and event.occurred_at < ((v_end_day + 1)::timestamp at time zone 'utc')
  group by
    (event.occurred_at at time zone 'utc')::date,
    event.event_name,
    event.channel,
    event.public_aggregate,
    coalesce(event.source, ''),
    coalesce(event.route_template, ''),
    coalesce(event.route_category, ''),
    coalesce(event.product_id, ''),
    coalesce(event.product_type, '');

  get diagnostics v_rows = row_count;

  insert into public.analytics_event_rollup_runs (
    operation,
    range_start,
    range_end,
    rollup_window_days,
    rows_affected
  )
  values (
    'refresh_daily_rollups',
    v_start_day,
    v_end_day,
    (v_end_day - v_start_day + 1),
    v_rows
  );

  return v_rows;
end;
$$;

revoke all on function public.refresh_analytics_event_daily_rollups(date, date) from public;
revoke all on function public.refresh_analytics_event_daily_rollups(date, date) from anon;
revoke all on function public.refresh_analytics_event_daily_rollups(date, date) from authenticated;
grant execute on function public.refresh_analytics_event_daily_rollups(date, date) to service_role;

create or replace function public.prune_analytics_events(
  p_before timestamptz default (now() - interval '180 days')
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before timestamptz;
  v_deleted integer;
begin
  v_before := coalesce(p_before, now() - interval '180 days');

  if v_before > now() - interval '30 days' then
    raise exception 'analytics_events prune cutoff must retain at least 30 days of raw events';
  end if;

  with deleted as (
    delete from public.analytics_events event
    where event.occurred_at < v_before
      and exists (
        select 1
        from public.analytics_event_daily_rollups rollup
        where rollup.rollup_day = (event.occurred_at at time zone 'utc')::date
      )
    returning 1
  )
  select count(*)::integer into v_deleted
  from deleted;

  insert into public.analytics_event_rollup_runs (
    operation,
    range_end,
    raw_retention_days,
    rows_affected
  )
  values (
    'prune_raw_events',
    (v_before at time zone 'utc')::date,
    greatest(1, floor(extract(epoch from (now() - v_before)) / 86400)::integer),
    v_deleted
  );

  return v_deleted;
end;
$$;

revoke all on function public.prune_analytics_events(timestamptz) from public;
revoke all on function public.prune_analytics_events(timestamptz) from anon;
revoke all on function public.prune_analytics_events(timestamptz) from authenticated;
grant execute on function public.prune_analytics_events(timestamptz) to service_role;

comment on table public.analytics_event_daily_rollups is
  'Daily aggregate counts derived from sanitized analytics_events rows. Stores no payload JSON or user IDs.';

comment on table public.analytics_event_rollup_runs is
  'Service-role analytics rollup/prune operation log. Stores maintenance metadata only.';

comment on function public.refresh_analytics_event_daily_rollups(date, date) is
  'Rebuilds privacy-safe daily analytics rollups for an inclusive UTC date window. Service role only.';

comment on function public.prune_analytics_events(timestamptz) is
  'Deletes raw analytics_events older than the cutoff only when their UTC day has rollup coverage. Service role only.';
