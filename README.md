# Food Ordering System — Phase 1 (Project Setup)

This phase sets up the Next.js + TypeScript + Tailwind + Supabase
foundation. No database schema, auth, or app pages yet — those are
Phases 2–6.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and keys
(Project Settings → API in the Supabase dashboard). Don't have a
project yet? Create one free at https://supabase.com — Phase 2
will walk through running the schema migrations against it.

```bash
npm run dev
```

Visit http://localhost:3000 — you should see the default (empty)
root layout with no errors in the console.

## What's included in this phase

- Next.js App Router project (TypeScript, Tailwind configured with
  a starter brand color)
- Supabase client helpers: `lib/supabase/client.ts` (browser),
  `lib/supabase/server.ts` (Server Components/Actions +
  service-role client for trusted admin operations),
  `lib/supabase/middleware.ts` (session refresh)
- Root `middleware.ts` wired to refresh the auth session on every
  request (role-based route guarding comes in Phase 3)

## Next: Phase 2

Database schema, migrations, and RLS policies.
