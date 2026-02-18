-- Admin foundation: content CRUD scaffold table + RLS.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_content_type' and n.nspname = 'public'
  ) then
    create type public.admin_content_type as enum (
      'course_module',
      'course_lesson',
      'guide_session',
      'guide_drill'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_content_status' and n.nspname = 'public'
  ) then
    create type public.admin_content_status as enum ('draft', 'published');
  end if;
end
$$;

create table if not exists public.admin_content_items (
  id uuid primary key default gen_random_uuid(),
  content_type public.admin_content_type not null,
  parent_id uuid references public.admin_content_items (id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status public.admin_content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_content_items_type_status_idx
  on public.admin_content_items (content_type, status);

create index if not exists admin_content_items_parent_sort_idx
  on public.admin_content_items (parent_id, sort_order, created_at);

create index if not exists admin_content_items_slug_idx
  on public.admin_content_items (slug);

drop trigger if exists admin_content_items_set_updated_at on public.admin_content_items;
create trigger admin_content_items_set_updated_at
before update on public.admin_content_items
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.admin_content_items to authenticated;

alter table public.admin_content_items enable row level security;

drop policy if exists admin_content_items_select_roles on public.admin_content_items;
create policy admin_content_items_select_roles
on public.admin_content_items
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor', 'viewer')
  )
);

drop policy if exists admin_content_items_insert_roles on public.admin_content_items;
create policy admin_content_items_insert_roles
on public.admin_content_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
);

drop policy if exists admin_content_items_update_roles on public.admin_content_items;
create policy admin_content_items_update_roles
on public.admin_content_items
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
);

drop policy if exists admin_content_items_delete_roles on public.admin_content_items;
create policy admin_content_items_delete_roles
on public.admin_content_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
);
