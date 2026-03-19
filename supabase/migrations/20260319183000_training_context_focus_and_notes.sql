-- User-owned training context for My Library:
-- separate long-term goals, current focus, and structured notes.

create table if not exists public.training_focuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid references public.goals (id) on delete set null,
  title text not null,
  details text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  context_type text check (
    context_type in (
      'course_lesson',
      'course_module',
      'guide_drill',
      'guide_session',
      'workout_session',
      'program'
    )
  ),
  context_ref text,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint training_focuses_title_check
    check (char_length(btrim(title)) between 3 and 140),
  constraint training_focuses_context_pair_check
    check (
      (context_type is null and context_ref is null) or
      (context_type is not null and nullif(btrim(context_ref), '') is not null)
    ),
  constraint training_focuses_terminal_timestamp_check
    check (
      (status = 'active' and completed_at is null and archived_at is null) or
      (status = 'completed' and completed_at is not null and archived_at is null) or
      (status = 'archived' and archived_at is not null and completed_at is null)
    )
);

create unique index if not exists training_focuses_one_active_per_user_idx
  on public.training_focuses (user_id)
  where status = 'active';

create index if not exists training_focuses_user_status_idx
  on public.training_focuses (user_id, status, updated_at desc);

create index if not exists training_focuses_goal_idx
  on public.training_focuses (goal_id);

create table if not exists public.training_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid references public.goals (id) on delete set null,
  focus_id uuid references public.training_focuses (id) on delete set null,
  note_type text not null check (note_type in ('observation', 'question')),
  status text not null,
  body text not null,
  answer text,
  context_type text check (
    context_type in (
      'course_lesson',
      'course_module',
      'guide_drill',
      'guide_session',
      'workout_session',
      'program'
    )
  ),
  context_ref text,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint training_notes_body_check
    check (char_length(btrim(body)) between 3 and 2000),
  constraint training_notes_context_pair_check
    check (
      (context_type is null and context_ref is null) or
      (context_type is not null and nullif(btrim(context_ref), '') is not null)
    ),
  constraint training_notes_type_status_check
    check (
      (
        note_type = 'observation' and
        status in ('open', 'actioned', 'no_action_needed') and
        answer is null
      ) or (
        note_type = 'question' and
        (
          (status = 'unanswered' and answer is null) or
          (status = 'answered' and nullif(btrim(answer), '') is not null) or
          (status = 'no_answer_needed' and answer is null)
        )
      )
    ),
  constraint training_notes_resolved_at_check
    check (
      (status in ('open', 'unanswered') and resolved_at is null) or
      (status in ('actioned', 'no_action_needed', 'answered', 'no_answer_needed') and resolved_at is not null)
    )
);

create index if not exists training_notes_user_created_idx
  on public.training_notes (user_id, created_at desc);

create index if not exists training_notes_user_status_idx
  on public.training_notes (user_id, status, updated_at desc);

create index if not exists training_notes_focus_idx
  on public.training_notes (focus_id);

create index if not exists training_notes_goal_idx
  on public.training_notes (goal_id);

drop trigger if exists training_focuses_set_updated_at on public.training_focuses;
create trigger training_focuses_set_updated_at
before update on public.training_focuses
for each row
execute function public.set_updated_at();

drop trigger if exists training_notes_set_updated_at on public.training_notes;
create trigger training_notes_set_updated_at
before update on public.training_notes
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.training_focuses to authenticated;
grant select, insert, update, delete on public.training_notes to authenticated;

alter table public.training_focuses enable row level security;
alter table public.training_notes enable row level security;

drop policy if exists training_focuses_select_own on public.training_focuses;
create policy training_focuses_select_own
on public.training_focuses
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists training_focuses_insert_own on public.training_focuses;
create policy training_focuses_insert_own
on public.training_focuses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists training_focuses_update_own on public.training_focuses;
create policy training_focuses_update_own
on public.training_focuses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists training_focuses_delete_own on public.training_focuses;
create policy training_focuses_delete_own
on public.training_focuses
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists training_notes_select_own on public.training_notes;
create policy training_notes_select_own
on public.training_notes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists training_notes_insert_own on public.training_notes;
create policy training_notes_insert_own
on public.training_notes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists training_notes_update_own on public.training_notes;
create policy training_notes_update_own
on public.training_notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists training_notes_delete_own on public.training_notes;
create policy training_notes_delete_own
on public.training_notes
for delete
to authenticated
using (auth.uid() = user_id);
