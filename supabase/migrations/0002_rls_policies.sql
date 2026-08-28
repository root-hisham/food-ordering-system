-- 0002_rls_policies.sql
-- Row Level Security: the real enforcement boundary.

create or replace function auth_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_stall_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select stall_id from stall_owners where id = auth.uid();
$$;

alter table profiles enable row level security;
alter table customers enable row level security;
alter table admins enable row level security;
alter table stalls enable row level security;
alter table stall_owners enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table notifications enable row level security;

-- PROFILES
create policy "read own profile" on profiles
  for select using (id = auth.uid());
create policy "admin reads all profiles" on profiles
  for select using (auth_role() = 'admin');
create policy "update own profile" on profiles
  for update using (id = auth.uid());
create policy "admin updates any profile" on profiles
  for update using (auth_role() = 'admin');

-- CUSTOMERS
create policy "read own customer row" on customers
  for select using (id = auth.uid());
create policy "admin reads all customers" on customers
  for select using (auth_role() = 'admin');
create policy "admin updates customers" on customers
  for update using (auth_role() = 'admin');

-- ADMINS
create policy "admin reads admins" on admins
  for select using (auth_role() = 'admin');

-- STALLS
create policy "public reads active stalls" on stalls
  for select using (status = 'active' or auth_role() in ('admin','stall_owner'));
create policy "admin manages stalls" on stalls
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');
create policy "owner updates own stall" on stalls
  for update using (id = auth_stall_id())
  with check (id = auth_stall_id());

-- STALL_OWNERS
create policy "owner reads own row" on stall_owners
  for select using (id = auth.uid());
create policy "admin manages stall_owners" on stall_owners
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- MENU_CATEGORIES
create policy "public reads menu categories" on menu_categories
  for select using (true);
create policy "owner manages own categories" on menu_categories
  for all using (stall_id = auth_stall_id())
  with check (stall_id = auth_stall_id());
create policy "admin manages all categories" on menu_categories
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- MENU_ITEMS
create policy "public reads menu items" on menu_items
  for select using (true);
create policy "owner manages own menu items" on menu_items
  for all using (stall_id = auth_stall_id())
  with check (stall_id = auth_stall_id());
create policy "admin manages all menu items" on menu_items
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- ORDERS
create policy "customer reads own orders" on orders
  for select using (customer_id = auth.uid());
create policy "customer creates own orders" on orders
  for insert with check (customer_id = auth.uid());
create policy "owner reads own stall orders" on orders
  for select using (stall_id = auth_stall_id());
create policy "owner updates own stall orders" on orders
  for update using (stall_id = auth_stall_id())
  with check (stall_id = auth_stall_id());
create policy "admin manages all orders" on orders
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- ORDER_ITEMS
create policy "customer reads own order items" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "customer inserts own order items" on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "owner reads own stall order items" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.stall_id = auth_stall_id())
  );
create policy "admin manages all order items" on order_items
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- ORDER_STATUS_HISTORY
create policy "customer reads own order history" on order_status_history
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "owner reads/writes own stall order history" on order_status_history
  for all using (
    exists (select 1 from orders o where o.id = order_id and o.stall_id = auth_stall_id())
  )
  with check (
    exists (select 1 from orders o where o.id = order_id and o.stall_id = auth_stall_id())
  );
create policy "admin manages all order history" on order_status_history
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- NOTIFICATIONS
create policy "user reads own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "user marks own notifications read" on notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "admin manages all notifications" on notifications
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');