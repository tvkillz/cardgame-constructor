-- Refresh ensure_test_deck: sites with <=20 published cards get every card in Test Deck (iyashikei showcase).
-- API VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/decks-test-deck-small-catalog.sql

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
