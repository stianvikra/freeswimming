-- Admin foundation: persist profile role for server-side authorization.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_role' and n.nspname = 'public'
  ) then
    create type public.admin_role as enum ('admin', 'editor', 'viewer');
  end if;
end
$$;

alter table public.profiles
  add column if not exists role public.admin_role not null default 'viewer';

create index if not exists profiles_role_idx
  on public.profiles (role);
