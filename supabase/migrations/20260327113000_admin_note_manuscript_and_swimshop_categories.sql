-- Add manuscript-planning and Swimshop categories for admin notes.

insert into public.admin_categories (scope, slug, title, sort_order, is_active)
values
  ('notes', 'lesson-manuscript', 'Lesson Manuscript', 22, true),
  ('notes', 'page-manuscript', 'Page Manuscript', 24, true),
  ('notes', 'video-manuscript', 'Video Manuscript', 26, true),
  ('notes', 'swimshop', 'Swimshop', 40, true)
on conflict (scope, slug) do nothing;
