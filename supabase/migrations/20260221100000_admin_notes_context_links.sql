-- Admin notes contextual attachments for lesson/drill/product/page workflows.

alter table public.admin_notes
  add column if not exists context_type text,
  add column if not exists context_ref text;

alter table public.admin_notes
  drop constraint if exists admin_notes_context_type_check;

alter table public.admin_notes
  add constraint admin_notes_context_type_check
  check (
    context_type is null
    or context_type in (
      'course_module',
      'course_lesson',
      'guide_session',
      'guide_drill',
      'product',
      'page'
    )
  );

alter table public.admin_notes
  drop constraint if exists admin_notes_context_pair_check;

alter table public.admin_notes
  add constraint admin_notes_context_pair_check
  check (
    (context_type is null and context_ref is null)
    or (context_type is not null and context_ref is not null)
  );

create index if not exists admin_notes_context_idx
  on public.admin_notes (context_type, context_ref, note_date desc, created_at desc);
