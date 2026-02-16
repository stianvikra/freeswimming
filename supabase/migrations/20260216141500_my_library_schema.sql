-- My Library commerce and progress sync foundation.
-- Covers schema, indexes, grants, and RLS policies for v1.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  title text not null,
  kind text not null,
  stripe_price_id text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_active_idx
  on public.products (active);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  purchaser_email text not null,
  product_id text not null references public.products (id) on delete restrict,
  source text not null default 'stripe_checkout',
  stripe_customer_id text,
  stripe_checkout_session_id text not null unique,
  granted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists entitlements_user_id_idx
  on public.entitlements (user_id);

create index if not exists entitlements_user_product_idx
  on public.entitlements (user_id, product_id);

create index if not exists entitlements_purchaser_email_lower_idx
  on public.entitlements (lower(purchaser_email));

create table if not exists public.download_links (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.entitlements (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists download_links_entitlement_id_idx
  on public.download_links (entitlement_id);

create index if not exists download_links_expires_at_idx
  on public.download_links (expires_at);

create table if not exists public.course_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  done boolean not null default false,
  video_seconds integer not null default 0 check (video_seconds >= 0),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, lesson_id)
);

create index if not exists course_progress_lesson_id_idx
  on public.course_progress (lesson_id);

create table if not exists public.guide_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  guide_slug text not null,
  section_id text not null,
  completed boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, guide_slug, section_id)
);

create index if not exists guide_progress_guide_slug_idx
  on public.guide_progress (guide_slug);

create table if not exists public.guide_sessions (
  guide_slug text not null,
  session_number integer not null check (session_number > 0),
  week_number integer not null check (week_number > 0),
  title text not null,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (guide_slug, session_number)
);

create index if not exists guide_sessions_guide_week_idx
  on public.guide_sessions (guide_slug, week_number);

create table if not exists public.guide_session_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  guide_slug text not null,
  session_number integer not null check (session_number > 0),
  completed boolean not null default false,
  notes text not null default '',
  completed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, guide_slug, session_number),
  constraint guide_session_progress_guide_fk
    foreign key (guide_slug, session_number)
    references public.guide_sessions (guide_slug, session_number)
    on delete cascade
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_value numeric,
  target_unit text not null,
  target_date date,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived')),
  celebrated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists goals_user_status_idx
  on public.goals (user_id, status);

-- Keep updated_at fields consistent on mutable tables.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at
before update on public.entitlements
for each row
execute function public.set_updated_at();

drop trigger if exists course_progress_set_updated_at on public.course_progress;
create trigger course_progress_set_updated_at
before update on public.course_progress
for each row
execute function public.set_updated_at();

drop trigger if exists guide_progress_set_updated_at on public.guide_progress;
create trigger guide_progress_set_updated_at
before update on public.guide_progress
for each row
execute function public.set_updated_at();

drop trigger if exists guide_sessions_set_updated_at on public.guide_sessions;
create trigger guide_sessions_set_updated_at
before update on public.guide_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists guide_session_progress_set_updated_at on public.guide_session_progress;
create trigger guide_session_progress_set_updated_at
before update on public.guide_session_progress
for each row
execute function public.set_updated_at();

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

-- API grants (service_role keeps full access by default).
grant usage on schema public to anon, authenticated;

grant select on public.products, public.guide_sessions to anon, authenticated;
grant select on public.entitlements, public.download_links to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.course_progress to authenticated;
grant select, insert, update, delete on public.guide_progress to authenticated;
grant select, insert, update, delete on public.guide_session_progress to authenticated;
grant select, insert, update, delete on public.goals to authenticated;

-- RLS setup.
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.entitlements enable row level security;
alter table public.download_links enable row level security;
alter table public.course_progress enable row level security;
alter table public.guide_progress enable row level security;
alter table public.guide_sessions enable row level security;
alter table public.guide_session_progress enable row level security;
alter table public.goals enable row level security;

-- profiles policies.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

-- products policies (public read catalog).
drop policy if exists products_select_public on public.products;
create policy products_select_public
on public.products
for select
to anon, authenticated
using (true);

-- entitlements policies (read own only).
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
on public.entitlements
for select
to authenticated
using (auth.uid() = user_id);

-- download_links policies (read only for owner via entitlement relationship).
drop policy if exists download_links_select_own on public.download_links;
create policy download_links_select_own
on public.download_links
for select
to authenticated
using (
  exists (
    select 1
    from public.entitlements e
    where e.id = entitlement_id
      and e.user_id = auth.uid()
  )
);

-- course_progress policies.
drop policy if exists course_progress_select_own on public.course_progress;
create policy course_progress_select_own
on public.course_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists course_progress_insert_own on public.course_progress;
create policy course_progress_insert_own
on public.course_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists course_progress_update_own on public.course_progress;
create policy course_progress_update_own
on public.course_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists course_progress_delete_own on public.course_progress;
create policy course_progress_delete_own
on public.course_progress
for delete
to authenticated
using (auth.uid() = user_id);

-- guide_progress policies.
drop policy if exists guide_progress_select_own on public.guide_progress;
create policy guide_progress_select_own
on public.guide_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists guide_progress_insert_own on public.guide_progress;
create policy guide_progress_insert_own
on public.guide_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists guide_progress_update_own on public.guide_progress;
create policy guide_progress_update_own
on public.guide_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists guide_progress_delete_own on public.guide_progress;
create policy guide_progress_delete_own
on public.guide_progress
for delete
to authenticated
using (auth.uid() = user_id);

-- guide_sessions policies (public read plan structure).
drop policy if exists guide_sessions_select_public on public.guide_sessions;
create policy guide_sessions_select_public
on public.guide_sessions
for select
to anon, authenticated
using (true);

-- guide_session_progress policies.
drop policy if exists guide_session_progress_select_own on public.guide_session_progress;
create policy guide_session_progress_select_own
on public.guide_session_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists guide_session_progress_insert_own on public.guide_session_progress;
create policy guide_session_progress_insert_own
on public.guide_session_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists guide_session_progress_update_own on public.guide_session_progress;
create policy guide_session_progress_update_own
on public.guide_session_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists guide_session_progress_delete_own on public.guide_session_progress;
create policy guide_session_progress_delete_own
on public.guide_session_progress
for delete
to authenticated
using (auth.uid() = user_id);

-- goals policies.
drop policy if exists goals_select_own on public.goals;
create policy goals_select_own
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists goals_update_own on public.goals;
create policy goals_update_own
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists goals_delete_own on public.goals;
create policy goals_delete_own
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);
