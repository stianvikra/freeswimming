-- Store the corrected performed swim session separately from the planned workout.
-- This is manual actual truth only; raw provider evidence and reconciliation remain future tables.

alter table public.completed_activity_events
  add column if not exists actual_session_snapshot jsonb;

alter table public.completed_activity_events
  drop constraint if exists completed_activity_events_actual_session_snapshot_check,
  add constraint completed_activity_events_actual_session_snapshot_check
    check (
      actual_session_snapshot is null
      or jsonb_typeof(actual_session_snapshot) = 'object'
    );
