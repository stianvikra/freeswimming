create table if not exists public.swim_capability_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  limit_kind text not null check (limit_kind in ('stroke', 'drill', 'kick')),
  stroke text check (stroke is null or stroke in ('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individual_medley')),
  max_repeat_distance_m numeric(8, 4) check (max_repeat_distance_m is null or max_repeat_distance_m between 1 and 10000),
  max_total_distance_m numeric(8, 4) check (max_total_distance_m is null or max_total_distance_m between 1 and 10000),
  target_total_distance_m numeric(8, 4) check (target_total_distance_m is null or target_total_distance_m between 1 and 10000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint swim_capability_limits_kind_stroke_check check ((limit_kind = 'stroke' and stroke is not null) or (limit_kind in ('drill', 'kick') and stroke is null)),
  constraint swim_capability_limits_not_blank_check check (max_repeat_distance_m is not null or max_total_distance_m is not null or target_total_distance_m is not null),
  constraint swim_capability_limits_unique_kind_per_user unique (user_id, limit_kind, stroke)
);
create index if not exists swim_capability_limits_user_updated_idx on public.swim_capability_limits (user_id, updated_at desc);
drop trigger if exists swim_capability_limits_set_updated_at on public.swim_capability_limits;
create trigger swim_capability_limits_set_updated_at
before update on public.swim_capability_limits for each row execute function public.set_updated_at();
grant select, insert, update, delete on public.swim_capability_limits to authenticated;
alter table public.swim_capability_limits enable row level security;
drop policy if exists swim_capability_limits_select_own on public.swim_capability_limits;
create policy swim_capability_limits_select_own on public.swim_capability_limits for select to authenticated using (auth.uid() = user_id);
drop policy if exists swim_capability_limits_insert_own on public.swim_capability_limits;
create policy swim_capability_limits_insert_own on public.swim_capability_limits for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists swim_capability_limits_update_own on public.swim_capability_limits;
create policy swim_capability_limits_update_own on public.swim_capability_limits for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists swim_capability_limits_delete_own on public.swim_capability_limits;
create policy swim_capability_limits_delete_own on public.swim_capability_limits for delete to authenticated using (auth.uid() = user_id);
