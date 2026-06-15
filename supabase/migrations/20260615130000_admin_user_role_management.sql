-- Admin Users 10/10 foundation repair:
-- atomic role profile update + audit log for admin user role changes.

create or replace function public.admin_set_user_role(
  p_target_user_id uuid,
  p_target_email text,
  p_next_role public.admin_role,
  p_actor_user_id uuid,
  p_actor_email text,
  p_reason text,
  p_before jsonb,
  p_after jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_profile public.profiles%rowtype;
  updated_profile public.profiles%rowtype;
  audit_action text;
  other_admin_count integer;
begin
  if p_target_email is null or btrim(p_target_email) = '' then
    raise exception 'target_email_required' using errcode = '22023';
  end if;

  select *
  into existing_profile
  from public.profiles
  where id = p_target_user_id
  for update;

  if existing_profile.id is not null
    and existing_profile.role = 'admin'
    and p_next_role <> 'admin'
  then
    select count(*)
    into other_admin_count
    from public.profiles
    where role = 'admin'
      and id <> p_target_user_id;

    if other_admin_count = 0 then
      raise exception 'last_admin_role_change_blocked' using errcode = 'P0001';
    end if;
  end if;

  insert into public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  )
  values (
    p_target_user_id,
    lower(btrim(p_target_email)),
    p_next_role,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    updated_at = timezone('utc', now())
  returning * into updated_profile;

  audit_action := case when existing_profile.id is null then 'insert' else 'update' end;

  insert into public.admin_audit_logs (
    actor_user_id,
    actor_email,
    entity_table,
    entity_id,
    action,
    before,
    after
  )
  values (
    p_actor_user_id,
    nullif(btrim(p_actor_email), ''),
    'profiles',
    p_target_user_id,
    audit_action,
    p_before,
    coalesce(p_after, '{}'::jsonb) || jsonb_build_object('reason', p_reason)
  );

  return updated_profile;
end;
$$;

revoke all on function public.admin_set_user_role(
  uuid,
  text,
  public.admin_role,
  uuid,
  text,
  text,
  jsonb,
  jsonb
) from public;

revoke all on function public.admin_set_user_role(
  uuid,
  text,
  public.admin_role,
  uuid,
  text,
  text,
  jsonb,
  jsonb
) from anon;

revoke all on function public.admin_set_user_role(
  uuid,
  text,
  public.admin_role,
  uuid,
  text,
  text,
  jsonb,
  jsonb
) from authenticated;

grant execute on function public.admin_set_user_role(
  uuid,
  text,
  public.admin_role,
  uuid,
  text,
  text,
  jsonb,
  jsonb
) to service_role;
