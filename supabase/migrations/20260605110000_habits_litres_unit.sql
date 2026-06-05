-- Allow Habits hydration/count targets to persist litres as a first-class unit.

alter table public.habit_definitions
  drop constraint if exists habit_definitions_target_unit_check,
  add constraint habit_definitions_target_unit_check
    check (
      target_unit is null or
      target_unit in (
        'times',
        'minutes',
        'seconds',
        'steps',
        'pages',
        'glasses',
        'litres',
        'custom'
      )
    );
