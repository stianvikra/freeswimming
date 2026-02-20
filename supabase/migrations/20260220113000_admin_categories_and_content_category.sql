-- Admin dashboard: category catalogs for notes/content + content category field.

create table if not exists public.admin_categories (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('notes', 'content')),
  slug text not null,
  title text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (scope, slug)
);

create index if not exists admin_categories_scope_sort_idx
  on public.admin_categories (scope, sort_order, created_at);

create index if not exists admin_categories_scope_active_idx
  on public.admin_categories (scope, is_active);

drop trigger if exists admin_categories_set_updated_at on public.admin_categories;
create trigger admin_categories_set_updated_at
before update on public.admin_categories
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.admin_categories to authenticated;

alter table public.admin_categories enable row level security;

drop policy if exists admin_categories_select_roles on public.admin_categories;
create policy admin_categories_select_roles
on public.admin_categories
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

drop policy if exists admin_categories_insert_roles on public.admin_categories;
create policy admin_categories_insert_roles
on public.admin_categories
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

drop policy if exists admin_categories_update_roles on public.admin_categories;
create policy admin_categories_update_roles
on public.admin_categories
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

drop policy if exists admin_categories_delete_roles on public.admin_categories;
create policy admin_categories_delete_roles
on public.admin_categories
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

alter table public.admin_content_items
  add column if not exists category text not null default 'General';

create index if not exists admin_content_items_category_idx
  on public.admin_content_items (category);

insert into public.admin_categories (scope, slug, title, sort_order, is_active)
values
  ('notes', 'general', 'General', 0, true),
  ('notes', 'operations', 'Operations', 10, true),
  ('notes', 'content', 'Content', 20, true),
  ('notes', 'release', 'Release', 30, true),
  ('content', 'general', 'General', 0, true),
  ('content', 'module', 'Module', 10, true),
  ('content', 'lesson', 'Lesson', 20, true),
  ('content', 'drill', 'Drill', 30, true),
  ('content', 'program', 'Program', 40, true)
on conflict (scope, slug) do nothing;
