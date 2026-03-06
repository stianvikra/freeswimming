-- QR redirect foundation: canonical link table, RLS, and audit trigger.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'qr_link_status' and n.nspname = 'public'
  ) then
    create type public.qr_link_status as enum ('draft', 'active', 'disabled', 'archived');
  end if;
end
$$;

create table if not exists public.qr_redirect_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  destination_url text not null,
  status public.qr_link_status not null default 'draft',
  content_item_id uuid references public.admin_content_items (id) on delete set null,
  content_label text not null default '',
  placement_key text not null default '',
  owner_user_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  last_resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint qr_redirect_links_slug_length
    check (char_length(slug) >= 2 and char_length(slug) <= 120),
  constraint qr_redirect_links_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint qr_redirect_links_destination_https
    check (destination_url ~* '^https://'),
  constraint qr_redirect_links_destination_url_length
    check (char_length(destination_url) <= 2048)
);

create unique index if not exists qr_redirect_links_slug_unique_idx
  on public.qr_redirect_links (slug);

create index if not exists qr_redirect_links_status_slug_idx
  on public.qr_redirect_links (status, slug);

create index if not exists qr_redirect_links_content_item_idx
  on public.qr_redirect_links (content_item_id);

drop trigger if exists qr_redirect_links_set_updated_at on public.qr_redirect_links;
create trigger qr_redirect_links_set_updated_at
before update on public.qr_redirect_links
for each row execute function public.set_updated_at();

grant select on public.qr_redirect_links to anon;
grant select, insert, update, delete on public.qr_redirect_links to authenticated;

alter table public.qr_redirect_links enable row level security;

drop policy if exists qr_redirect_links_select_public_active on public.qr_redirect_links;
create policy qr_redirect_links_select_public_active
on public.qr_redirect_links
for select
to anon
using (status = 'active');

drop policy if exists qr_redirect_links_select_roles on public.qr_redirect_links;
create policy qr_redirect_links_select_roles
on public.qr_redirect_links
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

drop policy if exists qr_redirect_links_insert_roles on public.qr_redirect_links;
create policy qr_redirect_links_insert_roles
on public.qr_redirect_links
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

drop policy if exists qr_redirect_links_update_roles on public.qr_redirect_links;
create policy qr_redirect_links_update_roles
on public.qr_redirect_links
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

drop policy if exists qr_redirect_links_delete_admin_only on public.qr_redirect_links;
create policy qr_redirect_links_delete_admin_only
on public.qr_redirect_links
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

drop trigger if exists qr_redirect_links_audit_log on public.qr_redirect_links;
create trigger qr_redirect_links_audit_log
after insert or update or delete on public.qr_redirect_links
for each row execute function public.log_admin_content_item_audit();
