-- 0008_remove_cooking_status.sql
update orders set status = 'accepted' where status = 'cooking';
update order_status_history set status = 'accepted' where status = 'cooking';

alter type order_status rename to order_status_old;

create type order_status as enum ('pending','accepted','ready','completed','cancelled');

alter table orders
  alter column status drop default,
  alter column status type order_status using status::text::order_status,
  alter column status set default 'pending';

alter table order_status_history
  alter column status type order_status using status::text::order_status;

drop type order_status_old;

-- New flow: pending -> accepted -> ready -> completed
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
     or (old.status = 'accepted' and new.status = 'ready')
     or (old.status = 'ready' and new.status = 'completed')
     or (old.status in ('pending','accepted') and new.status = 'cancelled')
  then
    return new;
  end if;

  raise exception 'Invalid order status transition: % -> %', old.status, new.status;
end;
$$;