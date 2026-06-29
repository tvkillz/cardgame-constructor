-- Player-to-player card listings (credits only).

create table if not exists public.player_market_listings (
  id            uuid primary key default gen_random_uuid(),
  site_id       text not null,
  seller_id     uuid not null references auth.users (id) on delete cascade,
  card_id       uuid not null references public.cards (id) on delete restrict,
  price_credits integer not null check (price_credits > 0),
  status        text not null default 'active'
    check (status in ('active', 'sold', 'cancelled')),
  created_at    timestamptz not null default now(),
  sold_at       timestamptz,
  buyer_id      uuid references auth.users (id) on delete set null
);

create index if not exists player_market_listings_site_active_idx
  on public.player_market_listings (site_id, created_at desc)
  where status = 'active';

create index if not exists player_market_listings_seller_idx
  on public.player_market_listings (seller_id, status);

alter table public.player_market_listings enable row level security;

create policy "Users read active listings"
  on public.player_market_listings for select
  using (status = 'active' or auth.uid() = seller_id or auth.uid() = buyer_id);
