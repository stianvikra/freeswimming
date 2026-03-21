-- Focus v2:
-- allow multiple open focuses, add one optional primary focus, and
-- migrate legacy singular `active` rows into the new `open` model.

alter table public.training_focuses
  add column if not exists is_primary boolean not null default false;

drop index if exists training_focuses_one_active_per_user_idx;

alter table public.training_focuses
  drop constraint if exists training_focuses_status_check;

alter table public.training_focuses
  drop constraint if exists training_focuses_terminal_timestamp_check;

alter table public.training_focuses
  drop constraint if exists training_focuses_primary_open_check;

update public.training_focuses
set is_primary = true
where status = 'active'
  and is_primary = false;

update public.training_focuses
set status = 'open'
where status = 'active';

alter table public.training_focuses
  alter column status set default 'open';

alter table public.training_focuses
  add constraint training_focuses_status_check
  check (status in ('open', 'completed', 'archived'));

alter table public.training_focuses
  add constraint training_focuses_terminal_timestamp_check
  check (
    (status = 'open' and completed_at is null and archived_at is null) or
    (status = 'completed' and completed_at is not null and archived_at is null) or
    (status = 'archived' and archived_at is not null and completed_at is null)
  );

alter table public.training_focuses
  add constraint training_focuses_primary_open_check
  check (status = 'open' or is_primary = false);

create unique index if not exists training_focuses_one_primary_open_per_user_idx
  on public.training_focuses (user_id)
  where status = 'open' and is_primary = true;

drop function if exists public.training_focus_set_primary(uuid);

create function public.training_focus_set_primary(p_focus_id uuid)
returns public.training_focuses
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_row public.training_focuses%rowtype;
begin
  if current_user_id is null then
    raise exception 'Unauthorized.'
      using errcode = '42501';
  end if;

  select *
  into target_row
  from public.training_focuses
  where id = p_focus_id
    and user_id = current_user_id
    and status = 'open';

  if target_row.id is null then
    raise exception 'Open focus not found.'
      using errcode = 'P0001';
  end if;

  update public.training_focuses
  set is_primary = (id = p_focus_id)
  where user_id = current_user_id
    and status = 'open';

  select *
  into target_row
  from public.training_focuses
  where id = p_focus_id
    and user_id = current_user_id;

  return target_row;
end;
$$;

grant execute on function public.training_focus_set_primary(uuid) to authenticated;
