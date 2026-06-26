-- Random bot opponent display name per match (casual and ranked).

alter table public.matches
  add column if not exists opponent_name text;
