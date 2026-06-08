-- Runtime opt-in linkage from Dryland Micro Sessions to Habits.
-- Linkage is explicit, owner-scoped, and separate from existing one-off Micro Session progress.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dryland_micro_plans_id_user_unique'
  ) then
    alter table public.dryland_micro_plans
      add constraint dryland_micro_plans_id_user_unique
      unique (id, user_id);
  end if;
end $$;

create table if not exists public.micro_session_habit_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dryland_micro_plan_id uuid not null,
  habit_id uuid not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  starts_on date not null,
  paused_at timestamptz,
  resumed_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint micro_session_habit_links_plan_owner_fkey
    foreign key (dryland_micro_plan_id, user_id)
    references public.dryland_micro_plans (id, user_id)
    on delete cascade,
  constraint micro_session_habit_links_habit_owner_fkey
    foreign key (habit_id, user_id)
    references public.habit_definitions (id, user_id)
    on delete cascade,
  constraint micro_session_habit_links_status_timestamps_check
    check (
      (
        status = 'active' and ended_at is null
      ) or (
        status = 'paused' and paused_at is not null and ended_at is null
      ) or (
        status = 'ended' and ended_at is not null
      )
    )
);

create unique index if not exists micro_session_habit_links_one_link_per_plan_idx
  on public.micro_session_habit_links (dryland_micro_plan_id);

create unique index if not exists micro_session_habit_links_one_open_per_habit_idx
  on public.micro_session_habit_links (user_id, habit_id)
  where status in ('active', 'paused');

create index if not exists micro_session_habit_links_user_status_idx
  on public.micro_session_habit_links (user_id, status, updated_at desc);

create index if not exists micro_session_habit_links_user_plan_idx
  on public.micro_session_habit_links (user_id, dryland_micro_plan_id);

create index if not exists micro_session_habit_links_user_habit_idx
  on public.micro_session_habit_links (user_id, habit_id);

drop trigger if exists micro_session_habit_links_set_updated_at on public.micro_session_habit_links;
create trigger micro_session_habit_links_set_updated_at
before update on public.micro_session_habit_links
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.micro_session_habit_links to authenticated;

alter table public.micro_session_habit_links enable row level security;

drop policy if exists micro_session_habit_links_select_own on public.micro_session_habit_links;
create policy micro_session_habit_links_select_own
on public.micro_session_habit_links
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists micro_session_habit_links_insert_own on public.micro_session_habit_links;
create policy micro_session_habit_links_insert_own
on public.micro_session_habit_links
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists micro_session_habit_links_update_own on public.micro_session_habit_links;
create policy micro_session_habit_links_update_own
on public.micro_session_habit_links
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists micro_session_habit_links_delete_own on public.micro_session_habit_links;
create policy micro_session_habit_links_delete_own
on public.micro_session_habit_links
for delete
to authenticated
using (auth.uid() = user_id);

alter table public.habit_check_ins
  add column if not exists source_kind text not null default 'manual',
  add column if not exists source_dryland_micro_plan_id uuid,
  add column if not exists source_micro_block_id text,
  add column if not exists source_completed_at timestamptz;

alter table public.habit_check_ins
  drop constraint if exists habit_check_ins_source_kind_check,
  add constraint habit_check_ins_source_kind_check
    check (source_kind in ('manual', 'timer', 'micro_session')),
  drop constraint if exists habit_check_ins_source_micro_block_id_check,
  add constraint habit_check_ins_source_micro_block_id_check
    check (
      source_micro_block_id is null or
      char_length(btrim(source_micro_block_id)) between 1 and 160
    ),
  drop constraint if exists habit_check_ins_source_shape_check,
  add constraint habit_check_ins_source_shape_check
    check (
      source_kind <> 'micro_session' or
      (
        source_dryland_micro_plan_id is not null and
        source_micro_block_id is not null and
        source_completed_at is not null
      )
    );

create index if not exists habit_check_ins_micro_source_idx
  on public.habit_check_ins (user_id, source_dryland_micro_plan_id, check_in_date desc)
  where source_kind = 'micro_session';
