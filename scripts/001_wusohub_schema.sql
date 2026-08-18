-- =====================================================================
-- WusoHub - Complete database schema, RLS policies, triggers & storage
-- Run this in the Supabase SQL editor (or via the Supabase MCP) once.
-- =====================================================================

-- ---------- Helper: is the current user the founder? -----------------
create or replace function public.is_founder()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) = 'wusozz12@gmail.com'
  );
$$;

-- ---------- Helper: can the current user perform actions? ------------
-- Suspended or disabled users are NOT active.
create or replace function public.is_active()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select not coalesce(
    (select p.is_suspended or p.is_disabled
     from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ============================== PROFILES ==============================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  is_verified boolean not null default false,
  is_founder boolean not null default false,
  is_muted boolean not null default false,
  is_suspended boolean not null default false,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_founder" on public.profiles;
create policy "profiles_update_self_or_founder" on public.profiles for update
  using (auth.uid() = id or public.is_founder())
  with check (auth.uid() = id or public.is_founder());

drop policy if exists "profiles_delete_founder" on public.profiles;
create policy "profiles_delete_founder" on public.profiles for delete
  using (public.is_founder());

-- Prevent normal users from escalating privileges / self-moderating.
-- Only the founder can change verification & moderation columns.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_founder() then
    new.is_verified  := old.is_verified;
    new.is_founder   := old.is_founder;
    new.is_muted     := old.is_muted;
    new.is_suspended := old.is_suspended;
    new.is_disabled  := old.is_disabled;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_columns_trg on public.profiles;
create trigger protect_profile_columns_trg
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ================================ POSTS ===============================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  media_url text,
  media_type text check (media_type in ('image','video')),
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_user_idx on public.posts (user_id);
create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_popular_idx on public.posts (like_count desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts for select using (true);

drop policy if exists "posts_insert_active_owner" on public.posts;
create policy "posts_insert_active_owner" on public.posts for insert
  with check (auth.uid() = user_id and public.is_active());

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own_or_founder" on public.posts;
create policy "posts_delete_own_or_founder" on public.posts for delete
  using (auth.uid() = user_id or public.is_founder());

-- ============================== COMMENTS ==============================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments for select using (true);

drop policy if exists "comments_insert_active_owner" on public.comments;
create policy "comments_insert_active_owner" on public.comments for insert
  with check (
    auth.uid() = user_id
    and public.is_active()
    and exists (select 1 from public.posts p where p.id = post_id)
  );

drop policy if exists "comments_delete_own_or_founder" on public.comments;
create policy "comments_delete_own_or_founder" on public.comments for delete
  using (auth.uid() = user_id or public.is_founder());

-- ================================ LIKES ===============================
create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all" on public.likes for select using (true);

drop policy if exists "likes_insert_active_owner" on public.likes;
create policy "likes_insert_active_owner" on public.likes for insert
  with check (
    auth.uid() = user_id
    and public.is_active()
    and exists (select 1 from public.posts p where p.id = post_id)
  );

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes for delete
  using (auth.uid() = user_id);

-- =============================== FOLLOWS ==============================
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows for select using (true);

drop policy if exists "follows_insert_active_owner" on public.follows;
create policy "follows_insert_active_owner" on public.follows for insert
  with check (auth.uid() = follower_id and public.is_active());

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete
  using (auth.uid() = follower_id);

-- =============================== REPORTS ==============================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','user')),
  target_post_id uuid references public.posts(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open','reviewed','resolved')),
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_select_founder_or_own" on public.reports;
create policy "reports_select_founder_or_own" on public.reports for select
  using (public.is_founder() or auth.uid() = reporter_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_update_founder" on public.reports;
create policy "reports_update_founder" on public.reports for update
  using (public.is_founder()) with check (public.is_founder());

-- ======================= MODERATION ACTIONS LOG ======================
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_post_id uuid references public.posts(id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_created_idx on public.moderation_actions (created_at desc);

alter table public.moderation_actions enable row level security;

drop policy if exists "moderation_select_founder" on public.moderation_actions;
create policy "moderation_select_founder" on public.moderation_actions for select
  using (public.is_founder());

drop policy if exists "moderation_insert_founder" on public.moderation_actions;
create policy "moderation_insert_founder" on public.moderation_actions for insert
  with check (public.is_founder() and auth.uid() = admin_id);

-- ===================== COUNT MAINTENANCE TRIGGERS =====================
create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists likes_count_trg on public.likes;
create trigger likes_count_trg
  after insert or delete on public.likes
  for each row execute function public.bump_like_count();

create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists comments_count_trg on public.comments;
create trigger comments_count_trg
  after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

-- ====================== AUTO-CREATE PROFILE ==========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
  if base_username = '' then base_username := 'kullanici'; end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, is_founder)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', final_username),
    lower(new.email) = 'wusozz12@gmail.com'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================== STORAGE ==============================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true) on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true) on conflict (id) do nothing;

-- Public read for both buckets
drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read" on storage.objects for select
  using (bucket_id in ('avatars', 'media'));

-- Authenticated users may upload into a folder named after their own uid.
drop policy if exists "storage_insert_own_folder" on storage.objects;
create policy "storage_insert_own_folder" on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_update_own_folder" on storage.objects;
create policy "storage_update_own_folder" on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_delete_own_folder" on storage.objects;
create policy "storage_delete_own_folder" on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
