-- Per-site card catalog, featured landing cards, and public card art storage.
-- Requires public.sites (96-sites.sql).

create type public.card_domain as enum ('terra', 'aqua', 'ignis', 'zephyr');

create type public.card_rarity as enum ('common', 'uncommon', 'rare', 'epic', 'legendary');

create table public.cards (
  id                 uuid primary key default gen_random_uuid(),
  site_id            text not null default 'voidborn' references public.sites (id),
  slug               text not null,
  title              text not null,
  domain             public.card_domain not null,
  role               text,
  rarity             public.card_rarity not null default 'common',
  mana               smallint not null check (mana >= 0),
  attack             smallint not null check (attack >= 0),
  health             smallint not null check (health >= 0),
  keywords           text[] not null default '{}',
  ability_name       text not null,
  ability_text       text not null,
  storage_bucket     text not null default 'cards',
  storage_path       text not null,
  thumb_storage_path text not null,
  glow_color         text,
  location_id        text,
  published          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint cards_site_slug_unique unique (site_id, slug),
  constraint cards_storage_path_unique unique (storage_bucket, storage_path),
  constraint cards_thumb_path_unique unique (storage_bucket, thumb_storage_path)
);

create index cards_site_idx on public.cards (site_id);
create index cards_site_location_idx on public.cards (site_id, location_id);
create index cards_domain_idx on public.cards (domain);
create index cards_rarity_idx on public.cards (rarity);
create index cards_published_idx on public.cards (published) where published;

create table public.location_featured_cards (
  site_id     text not null references public.sites (id),
  location_id text not null,
  card_id     uuid not null references public.cards (id) on delete restrict,
  updated_at  timestamptz not null default now(),
  primary key (site_id, location_id)
);

alter table public.cards enable row level security;
alter table public.location_featured_cards enable row level security;

create policy "Published cards are readable by everyone"
  on public.cards for select
  using (published = true);

create policy "Featured card mappings are readable by everyone"
  on public.location_featured_cards for select
  using (true);

insert into storage.buckets (id, name, public)
values ('cards', 'cards', true)
on conflict (id) do update set public = true;

create policy "Card art is publicly readable"
  on storage.objects for select
  using (bucket_id = 'cards');
