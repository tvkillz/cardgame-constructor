-- Saved payment cards (display tokens only — first4 + last4, no full PAN).

create table if not exists public.user_payment_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  site_id     text not null references public.sites (id),
  brand       text not null default 'card',
  first4      text not null check (first4 ~ '^[0-9]{4}$'),
  last4       text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month   smallint not null check (exp_month between 1 and 12),
  exp_year    smallint not null check (exp_year >= 2020),
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists user_payment_cards_user_site_idx
  on public.user_payment_cards (user_id, site_id, created_at desc);

alter table public.user_payment_cards enable row level security;

drop policy if exists "Users read own payment cards" on public.user_payment_cards;
create policy "Users read own payment cards"
  on public.user_payment_cards for select
  using (auth.uid() = user_id);

grant select on public.user_payment_cards to authenticated;
grant all on public.user_payment_cards to service_role;
