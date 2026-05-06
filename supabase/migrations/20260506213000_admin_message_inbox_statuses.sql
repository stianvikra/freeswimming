-- Admin Messages v1 inbox: add explicit triage statuses while preserving legacy triaged rows.

alter type public.admin_message_status add value if not exists 'read';
alter type public.admin_message_status add value if not exists 'needs_reply';
alter type public.admin_message_status add value if not exists 'replied';

create index if not exists admin_messages_status_source_created_at_idx
  on public.admin_messages (status, source_variant, created_at desc);
