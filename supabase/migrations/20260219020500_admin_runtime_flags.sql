-- Admin foundation: runtime feature flags for operations controls.

create table if not exists public.admin_runtime_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null default '',
  is_public boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists admin_runtime_flags_set_updated_at on public.admin_runtime_flags;
create trigger admin_runtime_flags_set_updated_at
before update on public.admin_runtime_flags
for each row execute function public.set_updated_at();

grant select, insert, update on public.admin_runtime_flags to authenticated;

alter table public.admin_runtime_flags enable row level security;

drop policy if exists admin_runtime_flags_select_roles on public.admin_runtime_flags;
create policy admin_runtime_flags_select_roles
on public.admin_runtime_flags
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

drop policy if exists admin_runtime_flags_select_public on public.admin_runtime_flags;
create policy admin_runtime_flags_select_public
on public.admin_runtime_flags
for select
to anon, authenticated
using (is_public = true);

drop policy if exists admin_runtime_flags_insert_roles on public.admin_runtime_flags;
create policy admin_runtime_flags_insert_roles
on public.admin_runtime_flags
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

drop policy if exists admin_runtime_flags_update_roles on public.admin_runtime_flags;
create policy admin_runtime_flags_update_roles
on public.admin_runtime_flags
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

insert into public.admin_runtime_flags (key, enabled, description, is_public)
values
  ('soft_launch_banner', true, 'Show under-construction banner on public pages.', true)
on conflict (key) do nothing;
