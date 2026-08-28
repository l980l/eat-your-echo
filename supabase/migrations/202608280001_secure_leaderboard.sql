-- Keep the leaderboard readable by the game, but never writable from its
-- public browser key. All score writes go through the Edge Function instead.
alter table public.leaderboard enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'leaderboard'
  loop
    execute format('drop policy if exists %I on public.leaderboard', p.policyname);
  end loop;
end $$;

create policy "Leaderboard is publicly readable"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.leaderboard from anon, authenticated;

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  submitted_score integer,
  expires_at timestamptz not null default (now() + interval '4 hours')
);

alter table public.game_runs enable row level security;
revoke all on public.game_runs from anon, authenticated;

-- Remove the known forged submission. Adjust this predicate manually only if
-- a genuine 999,999-point score should be retained.
delete from public.leaderboard where score = 999999;
