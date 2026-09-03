-- Add an explicit, reversible whole-day coverage disposition to absence review.
-- Workflow acknowledgement remains separate, and no Habit check-in is synthesized.

alter table public.habit_absence_review_acknowledgements
  add column if not exists day_status text;

alter table public.habit_absence_review_acknowledgements
  drop constraint if exists habit_absence_review_ack_day_status_check;

alter table public.habit_absence_review_acknowledgements
  add constraint habit_absence_review_ack_day_status_check
  check (day_status is null or day_status in ('not_tracked'));

-- Serialize day-status and check-in writes on the same owner/local-day key. The
-- lock makes the trigger checks deterministic even when both requests race.
create or replace function public.habit_absence_review_guard_day_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text || ':' || new.review_date::text, 0)
  );

  if tg_op = 'UPDATE'
    and (
      new.user_id is distinct from old.user_id
      or new.review_scope is distinct from old.review_scope
      or new.review_date is distinct from old.review_date
      or new.status is distinct from old.status
    )
  then
    raise exception 'HABIT_ABSENCE_REVIEW_STATUS_IDENTITY_IMMUTABLE'
      using errcode = 'P0001';
  end if;

  if new.day_status is not null and exists (
    select 1
    from public.habit_check_ins as check_in
    where check_in.user_id = new.user_id
      and check_in.check_in_date = new.review_date
  ) then
    raise exception 'HABIT_ABSENCE_REVIEW_CHECK_IN_EXISTS'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists habit_absence_review_guard_day_status
  on public.habit_absence_review_acknowledgements;
create trigger habit_absence_review_guard_day_status
before insert or update of user_id, review_scope, review_date, status, day_status
on public.habit_absence_review_acknowledgements
for each row
execute function public.habit_absence_review_guard_day_status();

-- Any supported check-in writer goes through this table trigger, including
-- manual/timer/Rest/Slip writes and linked Micro Session credit. Clearing the
-- marker is part of the same transaction; a failed check-in rolls it back.
create or replace function public.habit_check_in_clear_absence_review_day_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text || ':' || new.check_in_date::text, 0)
  );

  update public.habit_absence_review_acknowledgements
  set day_status = null
  where user_id = new.user_id
    and review_scope = 'weekly_absence_review'
    and review_date = new.check_in_date
    and day_status is not null;

  return new;
end;
$$;

drop trigger if exists habit_check_ins_clear_absence_review_day_status
  on public.habit_check_ins;
create trigger habit_check_ins_clear_absence_review_day_status
before insert or update on public.habit_check_ins
for each row
execute function public.habit_check_in_clear_absence_review_day_status();

-- One bounded RPC gives single, visible-batch, and Undo actions one atomic,
-- owner-scoped mutation path. The route remains responsible for deriving the
-- exact selected-week H-077 candidate set before calling this function.
drop function if exists public.habit_absence_review_set_day_status(date[], text);
drop function if exists public.habit_absence_review_set_day_status(uuid, date[], text);
create function public.habit_absence_review_set_day_status(
  p_user_id uuid,
  p_review_dates date[],
  p_day_status text
)
returns table (
  review_date date,
  day_status text,
  was_changed boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
  current_user_id uuid := p_user_id;
  candidate_date date;
  existing_row_count integer;
  changed_dates date[] := array[]::date[];
begin
  if current_user_id is null then
    raise exception 'HABIT_ABSENCE_REVIEW_UNAUTHORIZED'
      using errcode = '42501';
  end if;

  if p_review_dates is null
    or cardinality(p_review_dates) < 1
    or cardinality(p_review_dates) > 7
    or array_position(p_review_dates, null) is not null
  then
    raise exception 'HABIT_ABSENCE_REVIEW_INVALID_DATES'
      using errcode = '22023';
  end if;

  if cardinality(p_review_dates) <> (
    select count(distinct input_date)
    from unnest(p_review_dates) as input_date
  ) then
    raise exception 'HABIT_ABSENCE_REVIEW_DUPLICATE_DATES'
      using errcode = '22023';
  end if;

  if p_day_status is not null and p_day_status <> 'not_tracked' then
    raise exception 'HABIT_ABSENCE_REVIEW_INVALID_DAY_STATUS'
      using errcode = '22023';
  end if;

  -- Acquire every batch lock in stable order before checking or writing.
  for candidate_date in
    select input_date
    from unnest(p_review_dates) as input_date
    order by input_date
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(current_user_id::text || ':' || candidate_date::text, 0)
    );
  end loop;

  if exists (
    select 1
    from public.habit_absence_review_acknowledgements as acknowledgement
    where acknowledgement.user_id = current_user_id
      and acknowledgement.review_scope = 'weekly_absence_review'
      and acknowledgement.review_date = any(p_review_dates)
      and acknowledgement.status <> 'reviewed'
  ) then
    raise exception 'HABIT_ABSENCE_REVIEW_WORKFLOW_STATUS_UNSUPPORTED'
      using errcode = 'P0001';
  end if;

  if p_day_status = 'not_tracked' and exists (
    select 1
    from public.habit_check_ins as check_in
    where check_in.user_id = current_user_id
      and check_in.check_in_date = any(p_review_dates)
  ) then
    raise exception 'HABIT_ABSENCE_REVIEW_CHECK_IN_EXISTS'
      using errcode = 'P0001';
  end if;

  if p_day_status is null then
    select count(*)
    into existing_row_count
    from public.habit_absence_review_acknowledgements as acknowledgement
    where acknowledgement.user_id = current_user_id
      and acknowledgement.review_scope = 'weekly_absence_review'
      and acknowledgement.status = 'reviewed'
      and acknowledgement.review_date = any(p_review_dates);

    if existing_row_count <> cardinality(p_review_dates) then
      raise exception 'HABIT_ABSENCE_REVIEW_NOT_FOUND'
        using errcode = 'P0001';
    end if;

    with changed as (
      update public.habit_absence_review_acknowledgements as acknowledgement
      set day_status = null
      where acknowledgement.user_id = current_user_id
        and acknowledgement.review_scope = 'weekly_absence_review'
        and acknowledgement.status = 'reviewed'
        and acknowledgement.review_date = any(p_review_dates)
        and acknowledgement.day_status is distinct from null
      returning acknowledgement.review_date
    )
    select coalesce(
      pg_catalog.array_agg(changed.review_date order by changed.review_date),
      array[]::date[]
    )
    into changed_dates
    from changed;
  else
    with changed as (
      insert into public.habit_absence_review_acknowledgements as acknowledgement (
        user_id,
        review_scope,
        review_date,
        status,
        day_status
      )
      select
        current_user_id,
        'weekly_absence_review',
        input_date,
        'reviewed',
        p_day_status
      from unnest(p_review_dates) as input_date
      order by input_date
      on conflict (user_id, review_scope, review_date)
      do update
        set status = excluded.status,
            day_status = excluded.day_status
      where acknowledgement.status is distinct from excluded.status
        or acknowledgement.day_status is distinct from excluded.day_status
      returning acknowledgement.review_date
    )
    select coalesce(
      pg_catalog.array_agg(changed.review_date order by changed.review_date),
      array[]::date[]
    )
    into changed_dates
    from changed;
  end if;

  return query
  select
    acknowledgement.review_date,
    acknowledgement.day_status,
    acknowledgement.review_date = any(changed_dates) as was_changed
  from public.habit_absence_review_acknowledgements as acknowledgement
  where acknowledgement.user_id = current_user_id
    and acknowledgement.review_scope = 'weekly_absence_review'
    and acknowledgement.status = 'reviewed'
    and acknowledgement.review_date = any(p_review_dates)
  order by acknowledgement.review_date;
end;
$$;

revoke all on function public.habit_absence_review_set_day_status(uuid, date[], text) from public;
revoke all on function public.habit_absence_review_set_day_status(uuid, date[], text) from anon;
revoke all on function public.habit_absence_review_set_day_status(uuid, date[], text)
  from authenticated;
grant execute on function public.habit_absence_review_set_day_status(uuid, date[], text)
  to service_role;

-- Existing acknowledgement-only writes stay available through the owner RLS
-- policies, but authenticated clients cannot write or move the new day_status.
revoke insert, update on public.habit_absence_review_acknowledgements from authenticated;
grant insert (user_id, review_scope, review_date, status)
  on public.habit_absence_review_acknowledgements to authenticated;
grant update (user_id, review_scope, review_date, status)
  on public.habit_absence_review_acknowledgements to authenticated;

revoke all on function public.habit_absence_review_guard_day_status() from public;
revoke all on function public.habit_check_in_clear_absence_review_day_status() from public;
revoke all on function public.habit_check_in_clear_absence_review_day_status() from anon;
revoke all on function public.habit_check_in_clear_absence_review_day_status()
  from authenticated;
