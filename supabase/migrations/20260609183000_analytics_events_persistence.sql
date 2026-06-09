-- Privacy-safe first-party analytics persistence foundation.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name ~ '^[a-z][a-z0-9_]{1,80}$'),
  channel text not null check (channel in ('client', 'server')),
  user_id uuid references auth.users (id) on delete set null,
  public_aggregate boolean not null default false,
  source text,
  route_template text,
  route_category text,
  product_id text,
  product_type text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint analytics_events_public_no_user check (
    public_aggregate = false
    or user_id is null
  ),
  constraint analytics_events_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_event_time_idx
  on public.analytics_events (event_name, occurred_at desc);

create index if not exists analytics_events_user_time_idx
  on public.analytics_events (user_id, occurred_at desc)
  where user_id is not null;

create index if not exists analytics_events_public_time_idx
  on public.analytics_events (public_aggregate, occurred_at desc);

create index if not exists analytics_events_route_time_idx
  on public.analytics_events (route_template, occurred_at desc)
  where route_template is not null;

create index if not exists analytics_events_product_time_idx
  on public.analytics_events (product_id, occurred_at desc)
  where product_id is not null;

grant select on public.analytics_events to authenticated;
grant insert, select on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

drop policy if exists analytics_events_select_admin_viewer_plus on public.analytics_events;
create policy analytics_events_select_admin_viewer_plus
on public.analytics_events
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

comment on table public.analytics_events is
  'Sanitized first-party analytics events. Public aggregate events must not be joined to user profiles.';
