-- Player-built decks for arena / collection.

create table public.player_decks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  max_cards  smallint not null default 30 check (max_cards > 0 and max_cards <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_decks_name_per_user unique (user_id, name)
);

create index player_decks_user_idx on public.player_decks (user_id);

create table public.player_deck_cards (
  deck_id    uuid not null references public.player_decks (id) on delete cascade,
  card_id    uuid not null references public.cards (id) on delete restrict,
  quantity   smallint not null default 1 check (quantity > 0 and quantity <= 4),
  sort_order smallint not null default 0,
  primary key (deck_id, card_id)
);

create index player_deck_cards_deck_idx on public.player_deck_cards (deck_id);

alter table public.player_decks enable row level security;
alter table public.player_deck_cards enable row level security;

create policy "Users read own decks"
  on public.player_decks for select
  using (auth.uid() = user_id);

create policy "Users insert own decks"
  on public.player_decks for insert
  with check (auth.uid() = user_id);

create policy "Users update own decks"
  on public.player_decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own decks"
  on public.player_decks for delete
  using (auth.uid() = user_id);

create policy "Users read cards in own decks"
  on public.player_deck_cards for select
  using (
    exists (
      select 1
      from public.player_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "Users insert cards in own decks"
  on public.player_deck_cards for insert
  with check (
    exists (
      select 1
      from public.player_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "Users update cards in own decks"
  on public.player_deck_cards for update
  using (
    exists (
      select 1
      from public.player_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.player_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "Users delete cards in own decks"
  on public.player_deck_cards for delete
  using (
    exists (
      select 1
      from public.player_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );
