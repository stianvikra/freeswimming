-- Habits cadence contract.
-- Adds explicit frequency fields while preserving schedule_days for fixed weekday compatibility.

alter table public.habit_definitions
  add column if not exists cadence_period text,
  add column if not exists cadence_target_count integer,
  add column if not exists cadence_day_policy text;

update public.habit_definitions
set
  cadence_period = case
    when cardinality(schedule_days) >= 7 then 'daily'
    else 'weekly'
  end,
  cadence_target_count = case
    when cardinality(schedule_days) >= 7 then 1
    else greatest(1, least(7, cardinality(schedule_days)))
  end,
  cadence_day_policy = 'fixed'
where cadence_period is null
  or cadence_target_count is null
  or cadence_day_policy is null;

alter table public.habit_definitions
  alter column cadence_period set default 'daily',
  alter column cadence_period set not null,
  alter column cadence_target_count set default 1,
  alter column cadence_target_count set not null,
  alter column cadence_day_policy set default 'fixed',
  alter column cadence_day_policy set not null,
  drop constraint if exists habit_definitions_cadence_period_check,
  add constraint habit_definitions_cadence_period_check
    check (cadence_period in ('daily', 'weekly', 'monthly')),
  drop constraint if exists habit_definitions_cadence_day_policy_check,
  add constraint habit_definitions_cadence_day_policy_check
    check (cadence_day_policy in ('any', 'fixed')),
  drop constraint if exists habit_definitions_cadence_shape_check,
  add constraint habit_definitions_cadence_shape_check
    check (
      (
        cadence_period = 'daily' and
        cadence_day_policy = 'fixed' and
        cadence_target_count = 1 and
        cardinality(schedule_days) = 7
      ) or (
        cadence_period = 'weekly' and
        cadence_day_policy = 'fixed' and
        cadence_target_count between 1 and 7 and
        cardinality(schedule_days) between 1 and 7
      ) or (
        cadence_period = 'weekly' and
        cadence_day_policy = 'any' and
        cadence_target_count between 1 and 7
      ) or (
        cadence_period = 'monthly' and
        cadence_day_policy = 'any' and
        cadence_target_count between 1 and 31
      )
    );

create index if not exists habit_definitions_user_cadence_status_idx
  on public.habit_definitions (user_id, status, cadence_period, cadence_day_policy);
