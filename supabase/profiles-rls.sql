-- Enable RLS + self-only access policies for public.profiles
-- Assumes profiles.id is the user's auth.users id (uuid).

-- 1) Ensure the table is in the API-exposed schema (usually public)
-- If your table isn't in public, either move it or adjust the schema qualifier below.

alter table public.profiles enable row level security;

-- Optional: lock down existing overly-permissive grants (keep if you previously granted broader access)
-- revoke all on table public.profiles from anon, authenticated;

-- 2) Allow logged-in users to read ONLY their own profile row
drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- 3) Allow logged-in users to insert ONLY their own profile row
drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- 4) Required table privileges for PostgREST/Supabase API access
-- (RLS policies don't take effect unless the role also has the base privilege.)
grant select, insert on table public.profiles to authenticated;

