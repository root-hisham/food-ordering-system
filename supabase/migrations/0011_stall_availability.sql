-- 0011_stall_availability.sql
-- Owner-controlled "are we taking orders right now" toggle.
--
-- This is deliberately separate from the existing `status`
-- ('active'/'inactive') column, which is admin-controlled and
-- decides whether the stall is listed/provisioned at all.
-- `availability` is owner-controlled and decides whether the
-- *already-listed* stall can currently accept new orders.

create type stall_availability as enum ('open', 'closed', 'opening_soon');

alter table stalls
  add column availability stall_availability not null default 'open';

-- No new RLS policy needed: the existing "owner updates own stall"
-- policy (update using/with check id = auth_stall_id()) already
-- covers this column, and "admin manages stalls" already covers
-- admin writes to it too.
