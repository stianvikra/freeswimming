-- Private personal-records foundation for My Library.
-- Keeps current best swim events separate from profile, metrics, preferences, goals, focus, and notes.

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  distance_m integer not null check (distance_m between 25 and 100000),
  stroke text not null check (
    stroke in (
      'freestyle',
      'backstroke',
      'breaststroke',
      'butterfly',
      'individual_medley'
    )
  ),
  course text not null check (
    course in (
      'pool_25m',
      'pool_50m',
      'open_water'
    )
  ),
  time_centiseconds integer not null check (time_centiseconds between 1 and 8639999),
  recorded_on date,
  source_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint personal_records_source_note_check
    check (source_note is null or char_length(btrim(source_note)) between 1 and 280),
  constraint personal_records_unique_event_per_user
    unique (user_id, distance_m, stroke, course)
);

create index if not exists personal_records_user_event_updated_idx
  on public.personal_records (user_id, distance_m, stroke, course, updated_at desc);

drop trigger if exists personal_records_set_updated_at on public.personal_records;
create trigger personal_records_set_updated_at
before update on public.personal_records
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.personal_records to authenticated;

alter table public.personal_records enable row level security;

drop policy if exists personal_records_select_own on public.personal_records;
create policy personal_records_select_own
on public.personal_records
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists personal_records_insert_own on public.personal_records;
create policy personal_records_insert_own
on public.personal_records
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists personal_records_update_own on public.personal_records;
create policy personal_records_update_own
on public.personal_records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists personal_records_delete_own on public.personal_records;
create policy personal_records_delete_own
on public.personal_records
for delete
to authenticated
using (auth.uid() = user_id);
