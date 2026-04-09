-- Persist canonical pool-workout unit and allow exact meter totals/distances for yard-authored workouts.
-- This keeps yard pool sessions truthful through save/reload/export instead of truncating back to integers.

alter table public.workouts
  add column if not exists pool_length_unit text not null default 'm';

alter table public.workouts
  drop constraint if exists workouts_pool_length_unit_check;

alter table public.workouts
  add constraint workouts_pool_length_unit_check
    check (pool_length_unit in ('m', 'yd'));

alter table public.workouts
  alter column target_distance_m type numeric(8, 2)
  using target_distance_m::numeric(8, 2);

alter table public.workouts
  alter column total_distance_m type numeric(8, 2)
  using total_distance_m::numeric(8, 2);
