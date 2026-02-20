-- Admin 10/10 hardening:
-- 1) immutable content revisions for admin_content_items
-- 2) audit logging for admin_notes mutations

create table if not exists public.admin_content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null,
  content_slug text not null,
  revision_number integer not null check (revision_number > 0),
  action text not null check (action in ('insert', 'update', 'delete')),
  snapshot jsonb not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_by_email text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (content_item_id, revision_number)
);

create index if not exists admin_content_revisions_item_created_idx
  on public.admin_content_revisions (content_item_id, created_at desc);

create index if not exists admin_content_revisions_slug_created_idx
  on public.admin_content_revisions (content_slug, created_at desc);

grant select, insert on public.admin_content_revisions to authenticated;

alter table public.admin_content_revisions enable row level security;

drop policy if exists admin_content_revisions_select_roles on public.admin_content_revisions;
create policy admin_content_revisions_select_roles
on public.admin_content_revisions
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

drop policy if exists admin_content_revisions_insert_roles on public.admin_content_revisions;
create policy admin_content_revisions_insert_roles
on public.admin_content_revisions
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

create or replace function public.log_admin_content_revision()
returns trigger
language plpgsql
as $$
declare
  actor_email text;
  target_id uuid;
  target_slug text;
  snapshot jsonb;
  next_revision integer;
begin
  actor_email := nullif(auth.jwt() ->> 'email', '');

  if tg_op = 'INSERT' then
    target_id := new.id;
    target_slug := new.slug;
    snapshot := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    target_id := new.id;
    target_slug := new.slug;
    snapshot := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    target_id := old.id;
    target_slug := old.slug;
    snapshot := to_jsonb(old);
  else
    return null;
  end if;

  select coalesce(max(revision_number), 0) + 1
  into next_revision
  from public.admin_content_revisions
  where content_item_id = target_id;

  insert into public.admin_content_revisions (
    content_item_id,
    content_slug,
    revision_number,
    action,
    snapshot,
    changed_by,
    changed_by_email
  ) values (
    target_id,
    target_slug,
    next_revision,
    lower(tg_op),
    snapshot,
    auth.uid(),
    actor_email
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists admin_content_items_revision_log on public.admin_content_items;
create trigger admin_content_items_revision_log
after insert or update or delete on public.admin_content_items
for each row execute function public.log_admin_content_revision();

create or replace function public.log_admin_note_audit()
returns trigger
language plpgsql
as $$
declare
  actor_email text;
begin
  actor_email := nullif(auth.jwt() ->> 'email', '');

  if tg_op = 'INSERT' then
    insert into public.admin_audit_logs (
      actor_user_id,
      actor_email,
      entity_table,
      entity_id,
      action,
      before,
      after
    ) values (
      auth.uid(),
      actor_email,
      tg_table_name::text,
      new.id,
      'insert',
      null,
      to_jsonb(new)
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    insert into public.admin_audit_logs (
      actor_user_id,
      actor_email,
      entity_table,
      entity_id,
      action,
      before,
      after
    ) values (
      auth.uid(),
      actor_email,
      tg_table_name::text,
      new.id,
      'update',
      to_jsonb(old),
      to_jsonb(new)
    );
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.admin_audit_logs (
      actor_user_id,
      actor_email,
      entity_table,
      entity_id,
      action,
      before,
      after
    ) values (
      auth.uid(),
      actor_email,
      tg_table_name::text,
      old.id,
      'delete',
      to_jsonb(old),
      null
    );
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists admin_notes_audit_log on public.admin_notes;
create trigger admin_notes_audit_log
after insert or update or delete on public.admin_notes
for each row execute function public.log_admin_note_audit();
