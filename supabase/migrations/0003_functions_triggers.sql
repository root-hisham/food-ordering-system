-- 0003_functions_triggers.sql

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_stalls_updated_at
  before update on stalls
  for each row execute function set_updated_at();

create trigger trg_menu_items_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create sequence if not exists order_number_seq;

create or replace function generate_order_number()
returns trigger
language plpgsql
as $$
declare
  today_prefix text := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-';
  next_seq int;
begin
  if new.order_number is null then
    select count(*) + 1 into next_seq
    from orders
    where order_number like today_prefix || '%';

    new.order_number := today_prefix || lpad(next_seq::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_orders_generate_number
  before insert on orders
  for each row execute function generate_order_number();

create or replace function log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_orders_log_status
  after insert or update on orders
  for each row execute function log_order_status_change();

create or replace function validate_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op <> 'UPDATE' or new.status = old.status then
    return new;
  end if;

  if auth_role() = 'admin' then
    return new;
  end if;

  if (old.status = 'pending' and new.status = 'accepted')
     or (old.status = 'accepted' and new.status = 'cooking')
     or (old.status = 'cooking' and new.status = 'ready')
     or (old.status = 'ready' and new.status = 'completed')
     or (old.status in ('pending','accepted','cooking') and new.status = 'cancelled')
  then
    return new;
  end if;

  raise exception 'Invalid order status transition: % -> %', old.status, new.status;
end;
$$;

create trigger trg_orders_validate_transition
  before update on orders
  for each row execute function validate_order_status_transition();