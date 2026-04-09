-- Preserve whole-yard and decimal pool-workout distances cleanly through
-- canonical save/reload by storing top-level distances with more precision.

alter table public.workouts
  alter column target_distance_m type numeric(10,4),
  alter column total_distance_m type numeric(10,4);
