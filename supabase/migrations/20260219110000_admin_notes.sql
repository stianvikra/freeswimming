-- Admin foundation extension: notes workspace for internal planning and follow-up.

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  category text not null default 'General',
  note_date date not null default (timezone('utc', now())::date),
  is_done boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_notes_note_date_idx
  on public.admin_notes (note_date desc, created_at desc);

create index if not exists admin_notes_category_idx
  on public.admin_notes (category);

create index if not exists admin_notes_done_idx
  on public.admin_notes (is_done, updated_at desc);

drop trigger if exists admin_notes_set_updated_at on public.admin_notes;
create trigger admin_notes_set_updated_at
before update on public.admin_notes
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.admin_notes to authenticated;

alter table public.admin_notes enable row level security;

drop policy if exists admin_notes_select_roles on public.admin_notes;
create policy admin_notes_select_roles
on public.admin_notes
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

drop policy if exists admin_notes_insert_roles on public.admin_notes;
create policy admin_notes_insert_roles
on public.admin_notes
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

drop policy if exists admin_notes_update_roles on public.admin_notes;
create policy admin_notes_update_roles
on public.admin_notes
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

drop policy if exists admin_notes_delete_roles on public.admin_notes;
create policy admin_notes_delete_roles
on public.admin_notes
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
