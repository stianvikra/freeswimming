-- Expand admin content lifecycle to draft/review/published/archived
-- and enforce published_at semantics.

do $$
begin
  alter type public.admin_content_status add value if not exists 'review';
  alter type public.admin_content_status add value if not exists 'archived';
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_content_items_published_at_status_check'
      and conrelid = 'public.admin_content_items'::regclass
  ) then
    alter table public.admin_content_items
      add constraint admin_content_items_published_at_status_check
      check (
        (
          status = 'published'
          and published_at is not null
        )
        or (
          status <> 'published'
          and published_at is null
        )
      );
  end if;
end
$$;
