-- 0006_fix_status_history_trigger.sql
-- log_order_status_change needs SECURITY DEFINER: it runs under the
-- caller's role (e.g. a customer placing an order), but customers
-- have no RLS insert policy on order_status_history — only read.
-- This is an automated system log, not a direct user action, so it
-- should bypass RLS the same way other system triggers do.
create or replace function log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
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