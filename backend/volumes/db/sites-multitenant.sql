-- Multi-tenant catalog + app tables (run after sites.sql on existing stacks).

-- Cards catalog is per site (compiled from projects/{id}/).
alter table public.cards add column if not exists site_id text references public.sites (id);

update public.cards set site_id = 'voidborn' where site_id is null;

alter table public.cards alter column site_id set default 'voidborn';
alter table public.cards alter column site_id set not null;

alter table public.cards drop constraint if exists cards_slug_key;
create unique index if not exists cards_site_slug_idx on public.cards (site_id, slug);

create index if not exists cards_site_idx on public.cards (site_id);

drop policy if exists "Published cards are readable by everyone" on public.cards;
create policy "Published cards are readable by everyone"
  on public.cards for select
  using (published = true);

alter table public.location_featured_cards add column if not exists site_id text references public.sites (id);
update public.location_featured_cards l
set site_id = c.site_id
from public.cards c
where l.card_id = c.id and l.site_id is null;
update public.location_featured_cards set site_id = 'voidborn' where site_id is null;
alter table public.location_featured_cards alter column site_id set not null;
create index if not exists location_featured_cards_site_idx on public.location_featured_cards (site_id);

-- Optional scoping on user data (auth users are already site-isolated via email prefix).
alter table public.matches add column if not exists site_id text references public.sites (id);
update public.matches m
set site_id = sm.site_id
from public.site_members sm
where m.user_id = sm.user_id and m.site_id is null;
alter table public.matches alter column site_id set default 'voidborn';

alter table public.player_decks add column if not exists site_id text references public.sites (id);
update public.player_decks d
set site_id = sm.site_id
from public.site_members sm
where d.user_id = sm.user_id and d.site_id is null;
alter table public.player_decks alter column site_id set default 'voidborn';

-- Commerce tables (if present)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'wallets') then
    alter table public.wallets add column if not exists site_id text references public.sites (id);
    update public.wallets w
    set site_id = sm.site_id
    from public.site_members sm
    where w.user_id = sm.user_id and w.site_id is null;
  end if;

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'store_products') then
    alter table public.store_products add column if not exists site_id text references public.sites (id);
    update public.store_products set site_id = 'voidborn' where site_id is null;
    alter table public.store_products alter column site_id set default 'voidborn';
    alter table public.store_products alter column site_id set not null;
    alter table public.store_products drop constraint if exists store_products_slug_key;
    create unique index if not exists store_products_site_slug_idx on public.store_products (site_id, slug);
    create index if not exists store_products_site_idx on public.store_products (site_id);
  end if;
end $$;
