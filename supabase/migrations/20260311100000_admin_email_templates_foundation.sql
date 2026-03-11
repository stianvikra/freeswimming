-- AW-009 slice-2 foundation:
-- canonical admin email template storage + revision/audit trail.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_email_template_status' and n.nspname = 'public'
  ) then
    create type public.admin_email_template_status as enum ('draft', 'review', 'published', 'archived');
  end if;
end
$$;

create table if not exists public.admin_email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  locale text not null default 'nb-NO',
  status public.admin_email_template_status not null default 'draft',
  version integer not null default 1 check (version > 0),
  subject text not null default '',
  body text not null default '',
  required_placeholders text[] not null default '{}',
  optional_placeholders text[] not null default '{}',
  last_published_at timestamptz,
  last_published_by uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_email_templates_key_locale_unique
    unique (template_key, locale),
  constraint admin_email_templates_template_key_format
    check (template_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint admin_email_templates_template_key_length
    check (char_length(template_key) >= 3 and char_length(template_key) <= 120),
  constraint admin_email_templates_locale_length
    check (char_length(locale) >= 2 and char_length(locale) <= 16),
  constraint admin_email_templates_subject_length
    check (char_length(subject) <= 240),
  constraint admin_email_templates_body_length
    check (char_length(body) <= 20000),
  constraint admin_email_templates_required_placeholders_cardinality
    check (coalesce(cardinality(required_placeholders), 0) <= 50),
  constraint admin_email_templates_optional_placeholders_cardinality
    check (coalesce(cardinality(optional_placeholders), 0) <= 50)
);

create index if not exists admin_email_templates_status_key_idx
  on public.admin_email_templates (status, template_key, locale);

create index if not exists admin_email_templates_updated_idx
  on public.admin_email_templates (updated_at desc);

drop trigger if exists admin_email_templates_set_updated_at on public.admin_email_templates;
create trigger admin_email_templates_set_updated_at
before update on public.admin_email_templates
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.admin_email_templates to authenticated;

alter table public.admin_email_templates enable row level security;

drop policy if exists admin_email_templates_select_roles on public.admin_email_templates;
create policy admin_email_templates_select_roles
on public.admin_email_templates
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

drop policy if exists admin_email_templates_insert_roles on public.admin_email_templates;
create policy admin_email_templates_insert_roles
on public.admin_email_templates
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

drop policy if exists admin_email_templates_update_roles on public.admin_email_templates;
create policy admin_email_templates_update_roles
on public.admin_email_templates
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

drop policy if exists admin_email_templates_delete_admin_only on public.admin_email_templates;
create policy admin_email_templates_delete_admin_only
on public.admin_email_templates
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

create table if not exists public.admin_email_template_revisions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.admin_email_templates (id) on delete cascade,
  template_key text not null,
  locale text not null,
  revision_number integer not null check (revision_number > 0),
  action text not null check (action in ('insert', 'update', 'delete')),
  snapshot jsonb not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_by_email text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (template_id, revision_number)
);

create index if not exists admin_email_template_revisions_template_idx
  on public.admin_email_template_revisions (template_id, created_at desc);

create index if not exists admin_email_template_revisions_key_locale_idx
  on public.admin_email_template_revisions (template_key, locale, created_at desc);

grant select, insert on public.admin_email_template_revisions to authenticated;

alter table public.admin_email_template_revisions enable row level security;

drop policy if exists admin_email_template_revisions_select_roles on public.admin_email_template_revisions;
create policy admin_email_template_revisions_select_roles
on public.admin_email_template_revisions
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

drop policy if exists admin_email_template_revisions_insert_roles on public.admin_email_template_revisions;
create policy admin_email_template_revisions_insert_roles
on public.admin_email_template_revisions
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

create or replace function public.log_admin_email_template_revision()
returns trigger
language plpgsql
as $$
declare
  actor_email text;
  target_id uuid;
  target_key text;
  target_locale text;
  snapshot jsonb;
  next_revision integer;
begin
  actor_email := nullif(auth.jwt() ->> 'email', '');

  if tg_op = 'INSERT' then
    target_id := new.id;
    target_key := new.template_key;
    target_locale := new.locale;
    snapshot := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    target_id := new.id;
    target_key := new.template_key;
    target_locale := new.locale;
    snapshot := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    target_id := old.id;
    target_key := old.template_key;
    target_locale := old.locale;
    snapshot := to_jsonb(old);
  else
    return null;
  end if;

  select coalesce(max(revision_number), 0) + 1
  into next_revision
  from public.admin_email_template_revisions
  where template_id = target_id;

  insert into public.admin_email_template_revisions (
    template_id,
    template_key,
    locale,
    revision_number,
    action,
    snapshot,
    changed_by,
    changed_by_email
  ) values (
    target_id,
    target_key,
    target_locale,
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

drop trigger if exists admin_email_templates_revision_log on public.admin_email_templates;
create trigger admin_email_templates_revision_log
after insert or update or delete on public.admin_email_templates
for each row execute function public.log_admin_email_template_revision();

drop trigger if exists admin_email_templates_audit_log on public.admin_email_templates;
create trigger admin_email_templates_audit_log
after insert or update or delete on public.admin_email_templates
for each row execute function public.log_admin_content_item_audit();
