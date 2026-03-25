-- Canonical program foundation for user-owned program shells.
-- Stores stable week + assignment identities inside one canonical program row
-- so save operations remain atomic in this first program slice.

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_kind text not null check (source_kind in ('manual')),
  status text not null check (status in ('draft')),
  title text not null,
  weeks jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint programs_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint programs_weeks_array_check
    check (jsonb_typeof(weeks) = 'array'),
  constraint programs_weeks_non_empty_check
    check (jsonb_array_length(weeks) between 1 and 24)
);

create index if not exists programs_user_updated_idx
  on public.programs (user_id, updated_at desc);

create index if not exists programs_user_source_updated_idx
  on public.programs (user_id, source_kind, updated_at desc);

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
before update on public.programs
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.programs to authenticated;

alter table public.programs enable row level security;

drop policy if exists programs_select_own on public.programs;
create policy programs_select_own
on public.programs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists programs_insert_own on public.programs;
create policy programs_insert_own
on public.programs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists programs_update_own on public.programs;
create policy programs_update_own
on public.programs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists programs_delete_own on public.programs;
create policy programs_delete_own
on public.programs
for delete
to authenticated
using (auth.uid() = user_id);
