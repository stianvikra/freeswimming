-- Private My Perfect Day and standalone habit foundation.
-- Habit definitions stay separate from raw daily check-ins so later stats can rebuild summaries safely.

create table if not exists public.habit_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  habit_type text not null check (
    habit_type in ('binary', 'count', 'duration', 'time_of_day', 'avoidance')
  ),
  category text not null default 'other' check (
    category in ('movement', 'nutrition', 'recovery', 'learning', 'training', 'other')
  ),
  target_operator text not null check (
    target_operator in ('at_least', 'at_most', 'before', 'after')
  ),
  target_value_numeric numeric,
  target_unit text check (
    target_unit is null or
    target_unit in ('times', 'minutes', 'seconds', 'steps', 'pages', 'glasses', 'custom')
  ),
  target_time time,
  schedule_days text[] not null default array[
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ]::text[],
  is_perfect_day_item boolean not null default true,
  status text not null default 'active' check (status in ('active', 'archived')),
  sort_order integer not null default 0 check (sort_order between 0 and 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint habit_definitions_title_check
    check (char_length(btrim(title)) between 2 and 80),
  constraint habit_definitions_notes_check
    check (notes is null or char_length(btrim(notes)) between 1 and 280),
  constraint habit_definitions_schedule_days_check
    check (
      cardinality(schedule_days) between 1 and 7 and
      schedule_days <@ array[
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ]::text[]
    ),
  constraint habit_definitions_target_value_check
    check (target_value_numeric is null or target_value_numeric between 0 and 10000),
  constraint habit_definitions_target_shape_check
    check (
      (
        habit_type = 'binary' and
        target_operator = 'at_least' and
        target_value_numeric is null and
        target_unit is null and
        target_time is null
      ) or (
        habit_type in ('count', 'duration') and
        target_operator in ('at_least', 'at_most') and
        target_value_numeric is not null and
        target_unit is not null and
        target_time is null
      ) or (
        habit_type = 'time_of_day' and
        target_operator in ('before', 'after') and
        target_value_numeric is null and
        target_unit is null and
        target_time is not null
      ) or (
        habit_type = 'avoidance' and
        target_operator = 'at_most' and
        target_value_numeric is not null and
        target_unit is not null and
        target_time is null
      )
    ),
  constraint habit_definitions_id_user_unique
    unique (id, user_id)
);

create index if not exists habit_definitions_user_status_order_idx
  on public.habit_definitions (user_id, status, sort_order, updated_at desc);

drop trigger if exists habit_definitions_set_updated_at on public.habit_definitions;
create trigger habit_definitions_set_updated_at
before update on public.habit_definitions
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.habit_definitions to authenticated;

alter table public.habit_definitions enable row level security;

drop policy if exists habit_definitions_select_own on public.habit_definitions;
create policy habit_definitions_select_own
on public.habit_definitions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists habit_definitions_insert_own on public.habit_definitions;
create policy habit_definitions_insert_own
on public.habit_definitions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists habit_definitions_update_own on public.habit_definitions;
create policy habit_definitions_update_own
on public.habit_definitions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists habit_definitions_delete_own on public.habit_definitions;
create policy habit_definitions_delete_own
on public.habit_definitions
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.habit_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null,
  check_in_date date not null,
  timezone text not null default 'UTC',
  value_numeric numeric,
  value_boolean boolean,
  value_time time,
  note text,
  status text not null default 'logged' check (status in ('logged', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint habit_check_ins_habit_owner_fkey
    foreign key (habit_id, user_id)
    references public.habit_definitions (id, user_id)
    on delete cascade,
  constraint habit_check_ins_user_habit_date_unique
    unique (user_id, habit_id, check_in_date),
  constraint habit_check_ins_timezone_check
    check (char_length(btrim(timezone)) between 1 and 80),
  constraint habit_check_ins_note_check
    check (note is null or char_length(btrim(note)) between 1 and 280),
  constraint habit_check_ins_value_numeric_check
    check (value_numeric is null or value_numeric between 0 and 10000),
  constraint habit_check_ins_value_shape_check
    check (
      status = 'skipped' or
      value_numeric is not null or
      value_boolean is not null or
      value_time is not null
    )
);

create index if not exists habit_check_ins_user_date_idx
  on public.habit_check_ins (user_id, check_in_date desc);

create index if not exists habit_check_ins_user_habit_date_idx
  on public.habit_check_ins (user_id, habit_id, check_in_date desc);

drop trigger if exists habit_check_ins_set_updated_at on public.habit_check_ins;
create trigger habit_check_ins_set_updated_at
before update on public.habit_check_ins
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.habit_check_ins to authenticated;

alter table public.habit_check_ins enable row level security;

drop policy if exists habit_check_ins_select_own on public.habit_check_ins;
create policy habit_check_ins_select_own
on public.habit_check_ins
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists habit_check_ins_insert_own on public.habit_check_ins;
create policy habit_check_ins_insert_own
on public.habit_check_ins
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists habit_check_ins_update_own on public.habit_check_ins;
create policy habit_check_ins_update_own
on public.habit_check_ins
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists habit_check_ins_delete_own on public.habit_check_ins;
create policy habit_check_ins_delete_own
on public.habit_check_ins
for delete
to authenticated
using (auth.uid() = user_id);
