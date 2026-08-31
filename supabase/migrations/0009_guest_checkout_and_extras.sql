-- 0009_guest_checkout_and_extras.sql
-- Adds: guest checkout support, pickup OTP, customer self-cancel,
-- owner cancellation reasons, and an optional table number.

-- ============================================================
-- ORDERS: new columns
-- ============================================================
alter table orders alter column customer_id drop not null;

alter table orders add column contact_name text;
alter table orders add column contact_mobile text;
alter table orders add column table_number text;
alter table orders add column guest_token uuid unique;
alter table orders add column pickup_code text;
alter table orders add column cancellation_reason text;

-- ============================================================
-- Generate a 4-digit pickup code alongside the order number
-- ============================================================
create or replace function generate_order_number()
returns trigger
language plpgsql
as $$
declare
  today_prefix text := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-';
begin
  if new.order_number is null then
    new.order_number := today_prefix || lpad(nextval('order_number_seq')::text, 5, '0');
  end if;

  if new.pickup_code is null then
    new.pickup_code := lpad(floor(random() * 10000)::text, 4, '0');
  end if;

  return new;
end;
$$;

-- ============================================================
-- RLS: let a customer cancel their OWN order while still pending
-- ============================================================
create policy "customer cancels own pending order" on orders
  for update using (customer_id = auth.uid() and status = 'pending')
  with check (customer_id = auth.uid());

-- ============================================================
-- Secure guest order lookup — NOT via table-level RLS.
-- A guest has no auth session, so instead of opening the orders
-- table to anonymous reads (which would let anyone enumerate every
-- guest order via the API), the ONLY way to read a guest order is
-- through this function, which requires knowing the exact random
-- guest_token embedded in that customer's private tracking link.
-- ============================================================
create or replace function get_guest_order(p_token uuid)
returns table (
  id uuid,
  order_number text,
  status order_status,
  total numeric,
  created_at timestamptz,
  stall_name text,
  contact_name text,
  contact_mobile text,
  table_number text,
  pickup_code text,
  cancellation_reason text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.order_number, o.status, o.total, o.created_at,
         s.name as stall_name, o.contact_name, o.contact_mobile,
         o.table_number, o.pickup_code, o.cancellation_reason
  from orders o
  join stalls s on s.id = o.stall_id
  where o.guest_token = p_token;
$$;

grant execute on function get_guest_order(uuid) to anon, authenticated;

create or replace function get_guest_order_items(p_token uuid)
returns table (
  item_name text,
  quantity int,
  unit_price numeric,
  subtotal numeric
)
language sql
security definer
set search_path = public
as $$
  select oi.item_name, oi.quantity, oi.unit_price, oi.subtotal
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.guest_token = p_token;
$$;

grant execute on function get_guest_order_items(uuid) to anon, authenticated;