-- Admin foundation: audit log for admin content mutations.

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_email text,
  entity_table text not null,
  entity_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  before jsonb,
  after jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_audit_logs_entity_idx
  on public.admin_audit_logs (entity_table, entity_id, created_at desc);

create index if not exists admin_audit_logs_actor_idx
  on public.admin_audit_logs (actor_user_id, created_at desc);

grant select, insert on public.admin_audit_logs to authenticated;

alter table public.admin_audit_logs enable row level security;

drop policy if exists admin_audit_logs_select_admin_only on public.admin_audit_logs;
create policy admin_audit_logs_select_admin_only
on public.admin_audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  )
);

drop policy if exists admin_audit_logs_insert_editor_plus on public.admin_audit_logs;
create policy admin_audit_logs_insert_editor_plus
on public.admin_audit_logs
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

create or replace function public.log_admin_content_item_audit()
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

drop trigger if exists admin_content_items_audit_log on public.admin_content_items;
create trigger admin_content_items_audit_log
after insert or update or delete on public.admin_content_items
for each row execute function public.log_admin_content_item_audit();
