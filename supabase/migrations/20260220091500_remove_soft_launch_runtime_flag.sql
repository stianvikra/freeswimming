-- Remove deprecated soft-launch runtime flag.
-- Private access is now managed by site-lock gate only.

delete from public.admin_runtime_flags
where key = 'soft_launch_banner';
