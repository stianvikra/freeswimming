-- Extend admin content type enum with page/product entries for full edit workflow.

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_content_type' and n.nspname = 'public'
  ) then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where t.typname = 'admin_content_type'
        and n.nspname = 'public'
        and e.enumlabel = 'page'
    ) then
      alter type public.admin_content_type add value 'page';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where t.typname = 'admin_content_type'
        and n.nspname = 'public'
        and e.enumlabel = 'product'
    ) then
      alter type public.admin_content_type add value 'product';
    end if;
  end if;
end
$$;
