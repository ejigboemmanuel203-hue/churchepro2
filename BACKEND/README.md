# Churchepro — BACKEND (Supabase)

This folder holds the **backend** of Churchepro: the database, authentication,
and security rules. It runs on **Supabase** (a hosted PostgreSQL database with
built-in auth). The `FRONTEND` (Next.js app) talks to it.

## Project details

| Item | Value |
| --- | --- |
| Supabase project | `church-platform` |
| Project ref/ID | `olvyxnsgdwtzltbespei` |
| API URL | `https://olvyxnsgdwtzltbespei.supabase.co` |
| Organization | Care Access Nigeria |
| Region | eu-central-1 |
| Dashboard | https://supabase.com/dashboard/project/olvyxnsgdwtzltbespei |

## Folder layout

```
BACKEND/
├─ migrations/   SQL files that build the database (run in number order)
├─ seed/         Optional sample data for testing
└─ functions/    Edge functions (server-side logic), added later
```

## What's in the database so far

**Tables**
- `churches` — one row per church (a "tenant"). Each church is isolated.
- `profiles` — one row per user, linked to the login system. Holds their
  `church_id` and `role` (`admin` or `member`).

**Functions**
- `handle_new_user()` — trigger that auto-creates a profile on signup.
- `create_church(name)` — creates a church and makes the caller its admin.
- `current_church_id()` — helper used by the security rules.

**Security (Row Level Security)**
- Every church can only ever see its **own** data. The walls are enforced by the
  database itself, so even a bug in the frontend can't leak one church's data to
  another.

## How to apply these migrations

The migrations have **already been applied** to the live project. They're saved
here as the source of truth / history. To apply them to a fresh database:

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the contents of each file in `migrations/` **in number order**
   (`0001...` then `0002...`) and run it.

(Or, if using the Supabase CLI: `supabase db push`.)

## Adding new backend changes

Never edit an already-applied migration. Instead, create the **next** numbered
file (e.g. `0003_attendance.sql`) with your new tables/changes, then apply it.
This keeps a clean, replayable history of how the database was built.
