-- Admin Messages v1: DB-first public contact intake and provider-independent notification attempts.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_message_source' and n.nspname = 'public'
  ) then
    create type public.admin_message_source as enum (
      'contact',
      'preview_access_notify',
      'analysis',
      'goals_coaching'
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
    where t.typname = 'admin_message_status' and n.nspname = 'public'
  ) then
    create type public.admin_message_status as enum ('new', 'triaged', 'archived', 'deleted');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_message_delivery_target' and n.nspname = 'public'
  ) then
    create type public.admin_message_delivery_target as enum (
      'inbound_notification',
      'admin_reply',
      'system_notice'
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
    where t.typname = 'admin_message_delivery_status' and n.nspname = 'public'
  ) then
    create type public.admin_message_delivery_status as enum (
      'queued',
      'accepted_by_provider',
      'failed_retryable',
      'failed_final',
      'disabled'
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
    where t.typname = 'admin_message_delivery_provider' and n.nspname = 'public'
  ) then
    create type public.admin_message_delivery_provider as enum (
      'smtp_one_com_compatible',
      'resend_api',
      'resend_smtp',
      'disabled'
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
    where t.typname = 'admin_message_delivery_error_code' and n.nspname = 'public'
  ) then
    create type public.admin_message_delivery_error_code as enum (
      'provider_disabled',
      'provider_invalid',
      'provider_config_missing',
      'payload_invalid',
      'provider_timeout',
      'provider_auth_failed',
      'provider_rejected',
      'provider_rate_limited',
      'provider_request_failed',
      'provider_response_invalid'
    );
  end if;
end
$$;

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  source_variant public.admin_message_source not null,
  submitter_name text not null,
  submitter_email text not null,
  message_body text not null default '',
  structured_intake jsonb not null default '{}'::jsonb,
  request_metadata jsonb not null default '{}'::jsonb,
  status public.admin_message_status not null default 'new',
  notification_status public.admin_message_delivery_status not null default 'queued',
  notification_error_code public.admin_message_delivery_error_code,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_messages_submitter_name_length_check
    check (char_length(btrim(submitter_name)) between 2 and 80),
  constraint admin_messages_submitter_email_length_check
    check (char_length(btrim(submitter_email)) between 3 and 120),
  constraint admin_messages_message_body_length_check
    check (char_length(message_body) <= 2000),
  constraint admin_messages_structured_intake_object_check
    check (jsonb_typeof(structured_intake) = 'object'),
  constraint admin_messages_request_metadata_object_check
    check (jsonb_typeof(request_metadata) = 'object')
);

create index if not exists admin_messages_created_at_idx
  on public.admin_messages (created_at desc);

create index if not exists admin_messages_status_created_at_idx
  on public.admin_messages (status, created_at desc);

create index if not exists admin_messages_source_created_at_idx
  on public.admin_messages (source_variant, created_at desc);

create index if not exists admin_messages_submitter_email_idx
  on public.admin_messages (lower(submitter_email));

drop trigger if exists admin_messages_set_updated_at on public.admin_messages;
create trigger admin_messages_set_updated_at
before update on public.admin_messages
for each row execute function public.set_updated_at();

create table if not exists public.admin_message_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  target public.admin_message_delivery_target not null,
  message_id uuid not null references public.admin_messages (id) on delete cascade,
  reply_id uuid,
  provider_key public.admin_message_delivery_provider not null default 'disabled',
  status public.admin_message_delivery_status not null default 'queued',
  provider_message_id text,
  error_code public.admin_message_delivery_error_code,
  retry_after_seconds integer,
  redacted_error_message text,
  attempt_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_message_delivery_attempts_retry_after_check
    check (retry_after_seconds is null or retry_after_seconds >= 0),
  constraint admin_message_delivery_attempts_metadata_object_check
    check (jsonb_typeof(attempt_metadata) = 'object')
);

create index if not exists admin_message_delivery_attempts_message_created_idx
  on public.admin_message_delivery_attempts (message_id, created_at desc);

create index if not exists admin_message_delivery_attempts_status_created_idx
  on public.admin_message_delivery_attempts (status, created_at desc);

create index if not exists admin_message_delivery_attempts_provider_created_idx
  on public.admin_message_delivery_attempts (provider_key, created_at desc);

drop trigger if exists admin_message_delivery_attempts_set_updated_at
on public.admin_message_delivery_attempts;
create trigger admin_message_delivery_attempts_set_updated_at
before update on public.admin_message_delivery_attempts
for each row execute function public.set_updated_at();

grant select, update, delete on public.admin_messages to authenticated;
grant select, update, delete on public.admin_message_delivery_attempts to authenticated;
grant select, insert, update, delete on public.admin_messages to service_role;
grant select, insert, update, delete on public.admin_message_delivery_attempts to service_role;

alter table public.admin_messages enable row level security;
alter table public.admin_message_delivery_attempts enable row level security;

drop policy if exists admin_messages_select_roles on public.admin_messages;
create policy admin_messages_select_roles
on public.admin_messages
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

drop policy if exists admin_messages_update_roles on public.admin_messages;
create policy admin_messages_update_roles
on public.admin_messages
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

drop policy if exists admin_messages_delete_admin_roles on public.admin_messages;
create policy admin_messages_delete_admin_roles
on public.admin_messages
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

drop policy if exists admin_message_delivery_attempts_select_roles
on public.admin_message_delivery_attempts;
create policy admin_message_delivery_attempts_select_roles
on public.admin_message_delivery_attempts
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

drop policy if exists admin_message_delivery_attempts_update_roles
on public.admin_message_delivery_attempts;
create policy admin_message_delivery_attempts_update_roles
on public.admin_message_delivery_attempts
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

drop policy if exists admin_message_delivery_attempts_delete_admin_roles
on public.admin_message_delivery_attempts;
create policy admin_message_delivery_attempts_delete_admin_roles
on public.admin_message_delivery_attempts
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
