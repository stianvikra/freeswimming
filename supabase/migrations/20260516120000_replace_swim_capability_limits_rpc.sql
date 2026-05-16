create or replace function public.replace_swim_capability_limits(p_limits jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if jsonb_typeof(coalesce(p_limits, '[]'::jsonb)) <> 'array' then
    raise exception 'limits must be a JSON array' using errcode = '22023';
  end if;

  delete from public.swim_capability_limits
  where user_id = v_user_id;

  insert into public.swim_capability_limits (
    user_id,
    limit_kind,
    stroke,
    max_repeat_distance_m,
    max_total_distance_m,
    target_total_distance_m
  )
  select
    v_user_id,
    limit_kind,
    stroke,
    max_repeat_distance_m,
    max_total_distance_m,
    target_total_distance_m
  from jsonb_to_recordset(coalesce(p_limits, '[]'::jsonb)) as limit_payload(
    limit_kind text,
    stroke text,
    max_repeat_distance_m numeric,
    max_total_distance_m numeric,
    target_total_distance_m numeric
  );
end;
$$;

revoke all on function public.replace_swim_capability_limits(jsonb) from public;
grant execute on function public.replace_swim_capability_limits(jsonb) to authenticated;
