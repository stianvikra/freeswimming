-- Planned workout instance actions: reversible planned-only status and manual date overrides.

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'planned_workout_instances_status_check'
      and conrelid = 'public.planned_workout_instances'::regclass
  ) then
    alter table public.planned_workout_instances
      drop constraint planned_workout_instances_status_check;
  end if;
end
$$;

alter table public.planned_workout_instances
  add constraint planned_workout_instances_status_check
  check (status in ('planned', 'skipped', 'cancelled'));

alter table public.planned_workout_instances
  add column if not exists date_override_kind text not null default 'program_assignment';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'planned_workout_instances_date_override_kind_check'
      and conrelid = 'public.planned_workout_instances'::regclass
  ) then
    alter table public.planned_workout_instances
      add constraint planned_workout_instances_date_override_kind_check
      check (date_override_kind in ('program_assignment', 'manual'));
  end if;
end
$$;

create index if not exists planned_workout_instances_user_status_planned_on_idx
  on public.planned_workout_instances (user_id, status, planned_on, position);
