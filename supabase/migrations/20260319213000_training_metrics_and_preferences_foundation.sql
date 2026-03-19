-- Private training metrics and training preferences foundation for My Library.
-- Keeps trusted swim metrics and practical training defaults separate from athlete profile text.

create table if not exists public.training_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  metric_key text not null check (metric_key in ('css')),
  unit text not null check (unit in ('seconds_per_100m')),
  value_seconds integer not null check (value_seconds between 1 and 3600),
  recorded_on date,
  source_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint training_metrics_source_note_check
    check (source_note is null or char_length(btrim(source_note)) between 1 and 280),
  constraint training_metrics_unique_metric_per_user
    unique (user_id, metric_key)
);

create index if not exists training_metrics_user_metric_updated_idx
  on public.training_metrics (user_id, metric_key, updated_at desc);

drop trigger if exists training_metrics_set_updated_at on public.training_metrics;
create trigger training_metrics_set_updated_at
before update on public.training_metrics
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.training_metrics to authenticated;

alter table public.training_metrics enable row level security;

drop policy if exists training_metrics_select_own on public.training_metrics;
create policy training_metrics_select_own
on public.training_metrics
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists training_metrics_insert_own on public.training_metrics;
create policy training_metrics_insert_own
on public.training_metrics
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists training_metrics_update_own on public.training_metrics;
create policy training_metrics_update_own
on public.training_metrics
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists training_metrics_delete_own on public.training_metrics;
create policy training_metrics_delete_own
on public.training_metrics
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.training_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  pool_length_m integer check (pool_length_m in (25, 50)),
  available_days text[] check (
    available_days is null or (
      cardinality(available_days) > 0 and
      available_days <@ array[
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]::text[]
    )
  ),
  preferred_weekly_session_count integer check (
    preferred_weekly_session_count is null or
    preferred_weekly_session_count between 1 and 14
  ),
  preferred_session_minutes integer check (
    preferred_session_minutes is null or
    preferred_session_minutes in (30, 45, 60, 75, 90)
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint training_preferences_not_blank_check
    check (
      pool_length_m is not null or
      nullif(array_length(available_days, 1), 0) is not null or
      preferred_weekly_session_count is not null or
      preferred_session_minutes is not null
    )
);

create index if not exists training_preferences_user_updated_idx
  on public.training_preferences (user_id, updated_at desc);

drop trigger if exists training_preferences_set_updated_at on public.training_preferences;
create trigger training_preferences_set_updated_at
before update on public.training_preferences
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.training_preferences to authenticated;

alter table public.training_preferences enable row level security;

drop policy if exists training_preferences_select_own on public.training_preferences;
create policy training_preferences_select_own
on public.training_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists training_preferences_insert_own on public.training_preferences;
create policy training_preferences_insert_own
on public.training_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists training_preferences_update_own on public.training_preferences;
create policy training_preferences_update_own
on public.training_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists training_preferences_delete_own on public.training_preferences;
create policy training_preferences_delete_own
on public.training_preferences
for delete
to authenticated
using (auth.uid() = user_id);
