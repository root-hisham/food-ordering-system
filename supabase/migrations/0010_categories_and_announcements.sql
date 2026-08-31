-- 0010_categories_and_announcements.sql
-- Admin-managed category chips (top of customer home page) and
-- admin-managed announcement/banner images (home page carousel).

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Link each stall to one category so tapping a chip can filter stalls.
-- Nullable + on delete set null: deleting a category should never
-- delete or orphan-break a stall, it just becomes uncategorized.
alter table stalls add column category_id uuid references categories(id) on delete set null;
create index idx_stalls_category_id on stalls(category_id);

alter table categories enable row level security;

create policy "public reads categories" on categories
  for select using (true);
create policy "admin manages categories" on categories
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- ============================================================
-- ANNOUNCEMENTS (home page banner carousel)
-- ============================================================
create table announcements (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  link_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "public reads active announcements" on announcements
  for select using (is_active = true or auth_role() = 'admin');
create policy "admin manages announcements" on announcements
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- No new storage policies needed — category icons and announcement
-- images reuse the existing "public-images" bucket, which already
-- grants admin insert/update/delete (see 0004_storage.sql).
