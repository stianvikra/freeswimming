-- Private athlete profile foundation for My Library.
-- Keeps swimmer identity/context separate from account profile and training notes/goals.

create table if not exists public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  first_name text,
  last_name text,
  age_band text check (
    age_band in (
      'under_18',
      '18_24',
      '25_34',
      '35_44',
      '45_54',
      '55_64',
      '65_plus',
      'prefer_not_to_say'
    )
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint athlete_profiles_display_name_check
    check (display_name is null or char_length(btrim(display_name)) between 1 and 80),
  constraint athlete_profiles_first_name_check
    check (first_name is null or char_length(btrim(first_name)) between 1 and 60),
  constraint athlete_profiles_last_name_check
    check (last_name is null or char_length(btrim(last_name)) between 1 and 60),
  constraint athlete_profiles_not_blank_check
    check (
      nullif(btrim(coalesce(display_name, '')), '') is not null or
      nullif(btrim(coalesce(first_name, '')), '') is not null or
      nullif(btrim(coalesce(last_name, '')), '') is not null or
      age_band is not null
    )
);

create index if not exists athlete_profiles_user_updated_idx
  on public.athlete_profiles (user_id, updated_at desc);

drop trigger if exists athlete_profiles_set_updated_at on public.athlete_profiles;
create trigger athlete_profiles_set_updated_at
before update on public.athlete_profiles
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.athlete_profiles to authenticated;

alter table public.athlete_profiles enable row level security;

drop policy if exists athlete_profiles_select_own on public.athlete_profiles;
create policy athlete_profiles_select_own
on public.athlete_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists athlete_profiles_insert_own on public.athlete_profiles;
create policy athlete_profiles_insert_own
on public.athlete_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists athlete_profiles_update_own on public.athlete_profiles;
create policy athlete_profiles_update_own
on public.athlete_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists athlete_profiles_delete_own on public.athlete_profiles;
create policy athlete_profiles_delete_own
on public.athlete_profiles
for delete
to authenticated
using (auth.uid() = user_id);
