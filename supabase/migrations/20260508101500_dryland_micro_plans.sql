-- Weekly exercise-level completion plans for saved dryland sessions.
-- Plans snapshot source exercises so active progress is not silently rewritten by later edits.

create table if not exists public.dryland_micro_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_dryland_session_id uuid references public.dryland_sessions (id) on delete set null,
  status text not null check (status in ('active', 'paused', 'completed')),
  session_kind text not null check (session_kind in ('strength', 'stretching')),
  source_session_title text not null,
  title text not null,
  timezone text not null default 'UTC',
  week_starts_at timestamptz not null,
  week_ends_at timestamptz not null,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dryland_micro_plans_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint dryland_micro_plans_source_title_check
    check (char_length(btrim(source_session_title)) between 1 and 120),
  constraint dryland_micro_plans_timezone_check
    check (char_length(btrim(timezone)) between 1 and 80),
  constraint dryland_micro_plans_week_window_check
    check (week_ends_at > week_starts_at),
  constraint dryland_micro_plans_blocks_array_check
    check (jsonb_typeof(blocks) = 'array' and jsonb_array_length(blocks) > 0)
);

create index if not exists dryland_micro_plans_user_status_week_idx
  on public.dryland_micro_plans (user_id, status, week_starts_at desc);

create index if not exists dryland_micro_plans_user_updated_idx
  on public.dryland_micro_plans (user_id, updated_at desc);

create index if not exists dryland_micro_plans_source_session_idx
  on public.dryland_micro_plans (source_dryland_session_id);

create unique index if not exists dryland_micro_plans_one_open_per_user_idx
  on public.dryland_micro_plans (user_id)
  where status in ('active', 'paused');

drop trigger if exists dryland_micro_plans_set_updated_at on public.dryland_micro_plans;
create trigger dryland_micro_plans_set_updated_at
before update on public.dryland_micro_plans
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.dryland_micro_plans to authenticated;

alter table public.dryland_micro_plans enable row level security;

drop policy if exists dryland_micro_plans_select_own on public.dryland_micro_plans;
create policy dryland_micro_plans_select_own
on public.dryland_micro_plans
for select
to authenticated
using (auth.uid() = user_id);
drop policy if exists dryland_micro_plans_insert_own on public.dryland_micro_plans;
create policy dryland_micro_plans_insert_own
on public.dryland_micro_plans
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists dryland_micro_plans_update_own on public.dryland_micro_plans;
create policy dryland_micro_plans_update_own
on public.dryland_micro_plans
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists dryland_micro_plans_delete_own on public.dryland_micro_plans;
create policy dryland_micro_plans_delete_own
on public.dryland_micro_plans
for delete
to authenticated
using (auth.uid() = user_id);
