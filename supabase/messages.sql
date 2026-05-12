-- Unsent message vault: one row per saved message, scoped to auth user.
-- Run in the Supabase SQL editor (or migrate) before using the app feature.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_created_at_idx
  on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;

drop policy if exists "Users read own messages" on public.messages;
create policy "Users read own messages"
on public.messages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own messages" on public.messages;
create policy "Users insert own messages"
on public.messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users delete own messages" on public.messages;
create policy "Users delete own messages"
on public.messages
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, delete on table public.messages to authenticated;
