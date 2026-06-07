-- Append-only per-habit motivation reset events.
-- Reset stats restarts derived motivation stats without deleting historical check-ins.

create table if not exists public.habit_motivation_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null,
  reset_type text not null default 'reset_stats' check (reset_type in ('reset_stats')),
  status text not null default 'active' check (status in ('active', 'voided')),
  effective_date date not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint habit_motivation_resets_habit_owner_fkey
    foreign key (habit_id, user_id)
    references public.habit_definitions (id, user_id)
    on delete cascade,
  constraint habit_motivation_resets_created_by_check
    check (created_by = user_id)
);

create index if not exists habit_motivation_resets_user_habit_effective_idx
  on public.habit_motivation_resets (user_id, habit_id, effective_date desc, created_at desc);

create index if not exists habit_motivation_resets_user_effective_idx
  on public.habit_motivation_resets (user_id, effective_date desc, created_at desc);

grant select, insert on public.habit_motivation_resets to authenticated;

alter table public.habit_motivation_resets enable row level security;

drop policy if exists habit_motivation_resets_select_own on public.habit_motivation_resets;
create policy habit_motivation_resets_select_own
on public.habit_motivation_resets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists habit_motivation_resets_insert_own on public.habit_motivation_resets;
create policy habit_motivation_resets_insert_own
on public.habit_motivation_resets
for insert
to authenticated
with check (auth.uid() = user_id and auth.uid() = created_by);
