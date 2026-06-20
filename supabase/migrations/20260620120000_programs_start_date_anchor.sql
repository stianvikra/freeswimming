-- Add a nullable calendar anchor for saved program plans.
-- Existing program rows remain readable; new create/save flows validate Monday starts in app code.

alter table public.programs
  add column if not exists starts_on date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'programs_starts_on_monday_check'
      and conrelid = 'public.programs'::regclass
  ) then
    alter table public.programs
      add constraint programs_starts_on_monday_check
      check (starts_on is null or extract(isodow from starts_on) = 1);
  end if;
end
$$;

create index if not exists programs_user_starts_on_idx
  on public.programs (user_id, starts_on)
  where starts_on is not null;

create table if not exists public.planned_workout_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  program_week_id text not null,
  program_week_index integer not null check (program_week_index >= 0),
  program_assignment_id text not null,
  workout_id uuid references public.workouts (id) on delete set null,
  planned_on date not null,
  day_index integer not null check (day_index between 0 and 6),
  position integer not null default 0 check (position >= 0),
  status text not null default 'planned' check (status in ('planned')),
  source_kind text not null default 'program_assignment' check (source_kind in ('program_assignment')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint planned_workout_instances_week_id_check
    check (char_length(btrim(program_week_id)) between 1 and 120),
  constraint planned_workout_instances_assignment_id_check
    check (char_length(btrim(program_assignment_id)) between 1 and 120),
  constraint planned_workout_instances_program_assignment_unique
    unique (program_id, program_assignment_id)
);

create index if not exists planned_workout_instances_user_planned_on_idx
  on public.planned_workout_instances (user_id, planned_on, position);

create index if not exists planned_workout_instances_program_idx
  on public.planned_workout_instances (program_id, planned_on);

drop trigger if exists planned_workout_instances_set_updated_at on public.planned_workout_instances;
create trigger planned_workout_instances_set_updated_at
before update on public.planned_workout_instances
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.planned_workout_instances to authenticated;

alter table public.planned_workout_instances enable row level security;

drop policy if exists planned_workout_instances_select_own on public.planned_workout_instances;
create policy planned_workout_instances_select_own
on public.planned_workout_instances
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists planned_workout_instances_insert_own on public.planned_workout_instances;
create policy planned_workout_instances_insert_own
on public.planned_workout_instances
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists planned_workout_instances_update_own on public.planned_workout_instances;
create policy planned_workout_instances_update_own
on public.planned_workout_instances
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists planned_workout_instances_delete_own on public.planned_workout_instances;
create policy planned_workout_instances_delete_own
on public.planned_workout_instances
for delete
to authenticated
using (auth.uid() = user_id);
