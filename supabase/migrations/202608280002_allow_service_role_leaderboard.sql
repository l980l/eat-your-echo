-- Edge Functions use the service_role key. It bypasses RLS, but still needs
-- table privileges after the public roles were deliberately revoked.
grant select, insert, update, delete on public.leaderboard to service_role;
grant select, insert, update, delete on public.game_runs to service_role;
