-- Apply on existing DBs that used bot_* naming (safe to re-run).

do $$
begin
  if exists (
    select 1 from pg_enum e
    join pg_type t on e.enumtypid = t.oid
  where t.typname = 'match_phase' and e.enumlabel = 'bot_main'
  ) then
    alter type public.match_phase rename value 'bot_main' to 'villain_main';
  end if;
exception
  when others then null;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'matches' and column_name = 'bot_plays'
  ) then
    alter table public.matches rename column bot_plays to villain_plays;
  end if;
end $$;
