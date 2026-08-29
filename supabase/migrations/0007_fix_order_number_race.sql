-- 0007_fix_order_number_race.sql
-- The original generate_order_number() counted existing rows to pick
-- the next number, which is NOT safe under concurrent inserts: two
-- orders placed close together can both read the same count before
-- either commits, producing a duplicate order_number and a unique
-- constraint violation. Sequences are atomic in Postgres, so use the
-- one already created in 0003 (it was defined but never actually
-- used by this function).
create or replace function generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;