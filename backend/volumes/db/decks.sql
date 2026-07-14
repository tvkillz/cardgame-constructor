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

-- Starter deck for play-testing (all cards when site catalog <=20, else 10).
create or replace function public.ensure_test_deck(
  p_user_id uuid,
  p_site_id text default 'voidborn'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deck_id uuid;
  v_card_count int;
  v_site_card_total int;
  v_deck_limit int;
  card_rec record;
  sort_idx int := 0;
begin
  select d.id
  into v_deck_id
  from public.player_decks d
  where d.user_id = p_user_id
    and d.site_id = p_site_id
    and d.name = 'Test Deck'
  limit 1;

  if v_deck_id is null then
    insert into public.player_decks (user_id, site_id, name, max_cards)
    values (p_user_id, p_site_id, 'Test Deck', 30)
    returning id into v_deck_id;
  end if;

  select count(*)::int
  into v_card_count
  from public.player_deck_cards
  where deck_id = v_deck_id;

  if v_card_count > 0 then
    return v_deck_id;
  end if;

  select count(*)::int
  into v_site_card_total
  from public.cards c
  where c.site_id = p_site_id
    and c.published = true;

  -- Small catalogs (showcase sites like iyashikei): grant every published card.
  -- Large catalogs (voidborn): cap at 10 starters.
  v_deck_limit := case when v_site_card_total <= 20 then v_site_card_total else 10 end;

  for card_rec in
    select c.id
    from public.cards c
    where c.site_id = p_site_id
      and c.published = true
    order by c.slug
    limit v_deck_limit
  loop
    insert into public.player_deck_cards (deck_id, card_id, quantity, sort_order)
    values (v_deck_id, card_rec.id, 1, sort_idx)
    on conflict (deck_id, card_id) do nothing;

    insert into public.player_inventory (user_id, card_id, quantity, source)
    values (p_user_id, card_rec.id, 1, 'test_deck')
    on conflict (user_id, card_id) do nothing;

    sort_idx := sort_idx + 1;
  end loop;

  update public.player_decks
  set updated_at = now()
  where id = v_deck_id;

  return v_deck_id;
end;
$$;

grant execute on function public.ensure_test_deck(uuid, text) to service_role;
