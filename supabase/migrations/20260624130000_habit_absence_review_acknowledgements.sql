-- Server-canonical acknowledgement for habit absence review dates.
-- Acknowledging a date only closes the review prompt; it never creates or changes check-ins.

create table if not exists public.habit_absence_review_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  review_scope text not null default 'weekly_absence_review'
    check (review_scope in ('weekly_absence_review')),
  review_date date not null,
  status text not null default 'reviewed' check (status in ('reviewed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists habit_absence_review_ack_user_scope_date_key
  on public.habit_absence_review_acknowledgements (user_id, review_scope, review_date);

create index if not exists habit_absence_review_ack_user_scope_date_idx
  on public.habit_absence_review_acknowledgements (user_id, review_scope, review_date desc);

drop trigger if exists habit_absence_review_acknowledgements_set_updated_at
  on public.habit_absence_review_acknowledgements;
create trigger habit_absence_review_acknowledgements_set_updated_at
before update on public.habit_absence_review_acknowledgements
for each row
execute function public.set_updated_at();

grant select, insert, update on public.habit_absence_review_acknowledgements to authenticated;

alter table public.habit_absence_review_acknowledgements enable row level security;

drop policy if exists habit_absence_review_ack_select_own
  on public.habit_absence_review_acknowledgements;
create policy habit_absence_review_ack_select_own
on public.habit_absence_review_acknowledgements
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists habit_absence_review_ack_insert_own
  on public.habit_absence_review_acknowledgements;
create policy habit_absence_review_ack_insert_own
on public.habit_absence_review_acknowledgements
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists habit_absence_review_ack_update_own
  on public.habit_absence_review_acknowledgements;
create policy habit_absence_review_ack_update_own
on public.habit_absence_review_acknowledgements
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
