-- Email-template revision history must remain delete-safe.
-- Revision logs intentionally outlive live template rows long enough to
-- record delete actions, so they cannot enforce a live foreign key to the
-- canonical template table.

alter table public.admin_email_template_revisions
  drop constraint if exists admin_email_template_revisions_template_id_fkey;
