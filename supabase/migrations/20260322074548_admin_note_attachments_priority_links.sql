-- Admin notes v2 enrichments: explicit priority, image attachments, and canonical related-note links.

alter table public.admin_notes
  add column if not exists priority text not null default 'normal';

alter table public.admin_notes
  drop constraint if exists admin_notes_priority_check;

alter table public.admin_notes
  add constraint admin_notes_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

create index if not exists admin_notes_priority_idx
  on public.admin_notes (priority, is_done, note_date desc, created_at desc);

create table if not exists public.admin_note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.admin_notes (id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint admin_note_attachments_mime_type_check
    check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'image/gif'))
);

create index if not exists admin_note_attachments_note_idx
  on public.admin_note_attachments (note_id, created_at asc);

grant select, insert, update, delete on public.admin_note_attachments to authenticated;

alter table public.admin_note_attachments enable row level security;

drop policy if exists admin_note_attachments_select_roles on public.admin_note_attachments;
create policy admin_note_attachments_select_roles
on public.admin_note_attachments
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

drop policy if exists admin_note_attachments_insert_roles on public.admin_note_attachments;
create policy admin_note_attachments_insert_roles
on public.admin_note_attachments
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

drop policy if exists admin_note_attachments_delete_roles on public.admin_note_attachments;
create policy admin_note_attachments_delete_roles
on public.admin_note_attachments
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
);

create table if not exists public.admin_note_links (
  note_id uuid not null references public.admin_notes (id) on delete cascade,
  related_note_id uuid not null references public.admin_notes (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (note_id, related_note_id),
  constraint admin_note_links_not_self check (note_id <> related_note_id),
  constraint admin_note_links_canonical_order check (note_id < related_note_id)
);

create index if not exists admin_note_links_related_idx
  on public.admin_note_links (related_note_id, created_at asc);

grant select, insert, delete on public.admin_note_links to authenticated;

alter table public.admin_note_links enable row level security;

drop policy if exists admin_note_links_select_roles on public.admin_note_links;
create policy admin_note_links_select_roles
on public.admin_note_links
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

drop policy if exists admin_note_links_insert_roles on public.admin_note_links;
create policy admin_note_links_insert_roles
on public.admin_note_links
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

drop policy if exists admin_note_links_delete_roles on public.admin_note_links;
create policy admin_note_links_delete_roles
on public.admin_note_links
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-note-attachments',
  'admin-note-attachments',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
