alter table public.course_progress
add column if not exists done_confirmed_at timestamptz;

