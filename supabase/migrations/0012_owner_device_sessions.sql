-- 0012_owner_device_sessions.sql
-- Device-limit login control for stall owners, plus admin visibility
-- and remote sign-out.
--
-- This is deliberately independent of Supabase Auth's own internal
-- session table (not reliably reachable from the client libraries
-- this project uses — there is no supported "list this user's
-- sessions" call in @supabase/supabase-js v2). Instead we track our
-- own "device session" row per successful stall-owner login, gated
-- by a server-only opaque token stored in an httpOnly cookie.
--
-- Nothing here is writable by a normal client: there is no insert/
-- update/delete policy for stall_owner or anon/public. Every write
-- goes through server code using the service-role key (login,
-- self-logout) or through the "admin manages all owner sessions"
-- policy below (admin removing a device). A stolen anon key can read
-- nothing but the owner's own rows, and can never create, extend, or
-- hide a session.

alter table stalls
  add column device_limit integer not null default 2
    check (device_limit >= 1 and device_limit <= 20);

create table owner_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  stall_id uuid not null references stalls(id) on delete cascade,
  session_token text not null unique,
  device_label text,
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Fast "how many active sessions does this owner have" lookup — the
-- exact query the login flow runs on every attempt, and the exact
-- query middleware runs on every /owner request.
create index owner_sessions_active_by_owner_idx
  on owner_sessions (owner_id)
  where revoked_at is null;

create index owner_sessions_token_idx on owner_sessions (session_token);

alter table owner_sessions enable row level security;

create policy "owner reads own sessions" on owner_sessions
  for select using (owner_id = auth.uid());

create policy "admin manages all owner sessions" on owner_sessions
  for all using (auth_role() = 'admin')
  with check (auth_role() = 'admin');