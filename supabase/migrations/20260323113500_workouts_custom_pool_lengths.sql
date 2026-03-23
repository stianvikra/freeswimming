-- Expand canonical workout pool lengths beyond the original 12.5/25/50m enum-style contract.
-- Manual builder workflows now need broader presets plus exact custom pool sizes.

alter table public.workouts
  drop constraint if exists workouts_pool_length_m_check;

alter table public.workouts
  alter column pool_length_m type numeric(5, 2);

alter table public.workouts
  add constraint workouts_pool_length_m_check
    check (
      pool_length_m is null or
      pool_length_m between 12.5 and 500
    );
