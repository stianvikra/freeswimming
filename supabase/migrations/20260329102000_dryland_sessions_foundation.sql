-- Canonical dryland session foundation for owner-authored strength and stretching work.
-- Keeps dryland sessions separate from swim workouts so exercise/set logic can evolve safely.

create table if not exists public.dryland_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_kind text not null check (source_kind in ('manual')),
  status text not null check (status in ('draft', 'in_progress', 'completed')),
  session_kind text not null check (session_kind in ('strength', 'stretching')),
  title text not null,
  description text not null default '',
  focus_text text,
  exercises jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  actual_duration_seconds integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dryland_sessions_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint dryland_sessions_description_check
    check (char_length(description) <= 600),
  constraint dryland_sessions_focus_text_check
    check (focus_text is null or char_length(btrim(focus_text)) between 1 and 160),
  constraint dryland_sessions_exercises_array_check
    check (jsonb_typeof(exercises) = 'array'),
  constraint dryland_sessions_actual_duration_seconds_check
    check (
      actual_duration_seconds is null or
      actual_duration_seconds between 0 and 86400
    ),
  constraint dryland_sessions_completed_after_started_check
    check (
      completed_at is null or
      started_at is null or
      completed_at >= started_at
    )
);

create index if not exists dryland_sessions_user_updated_idx
  on public.dryland_sessions (user_id, updated_at desc);

create index if not exists dryland_sessions_user_kind_updated_idx
  on public.dryland_sessions (user_id, session_kind, updated_at desc);

drop trigger if exists dryland_sessions_set_updated_at on public.dryland_sessions;
create trigger dryland_sessions_set_updated_at
before update on public.dryland_sessions
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.dryland_sessions to authenticated;

alter table public.dryland_sessions enable row level security;

drop policy if exists dryland_sessions_select_own on public.dryland_sessions;
create policy dryland_sessions_select_own
on public.dryland_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists dryland_sessions_insert_own on public.dryland_sessions;
create policy dryland_sessions_insert_own
on public.dryland_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists dryland_sessions_update_own on public.dryland_sessions;
create policy dryland_sessions_update_own
on public.dryland_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists dryland_sessions_delete_own on public.dryland_sessions;
create policy dryland_sessions_delete_own
on public.dryland_sessions
for delete
to authenticated
using (auth.uid() = user_id);
