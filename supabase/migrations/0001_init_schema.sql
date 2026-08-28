-- 0001_init_schema.sql
-- Core tables, enums, and constraints for the food ordering platform.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'stall_owner', 'customer');
create type order_status as enum ('pending','accepted','cooking','ready','completed','cancelled');
create type stall_status as enum ('active','inactive');

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  mobile_number text unique,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key references profiles(id) on delete cascade,
  is_active boolean not null default true
);

create table admins (
  id uuid primary key references profiles(id) on delete cascade
);

-- ============================================================
-- STALLS
-- ============================================================
create table stalls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  logo_url text,
  status stall_status not null default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stall_owners (
  id uuid primary key references profiles(id) on delete cascade,
  stall_id uuid not null references stalls(id) on delete cascade
);

create index idx_stall_owners_stall_id on stall_owners(stall_id);

-- ============================================================
-- MENU
-- ============================================================
create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid not null references stalls(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create index idx_menu_categories_stall_id on menu_categories(stall_id);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  stall_id uuid not null references stalls(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_veg boolean not null default true,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_menu_items_stall_id on menu_items(stall_id);
create index idx_menu_items_category_id on menu_items(category_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references customers(id),
  stall_id uuid not null references stalls(id),
  status order_status not null default 'pending',
  total numeric(10,2) not null check (total >= 0),
  payment_method text not null default 'pay_at_counter',
  payment_status text not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_customer_id on orders(customer_id);
create index idx_orders_stall_id on orders(stall_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  item_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create index idx_order_items_order_id on order_items(order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  changed_by uuid references profiles(id),
  changed_at timestamptz not null default now()
);

create index idx_order_status_history_order_id on order_status_history(order_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_is_read on notifications(user_id, is_read);