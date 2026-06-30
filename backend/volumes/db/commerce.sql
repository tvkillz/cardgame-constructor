-- VOIDBORN commerce: wallets, store, orders, inventory, withdrawals.

create type public.wallet_tx_type as enum (
  'top_up',
  'purchase',
  'refund',
  'adjustment',
  'withdrawal'
);

create type public.wallet_tx_status as enum (
  'pending',
  'completed',
  'failed',
  'refunded'
);

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'failed',
  'cancelled',
  'refunded'
);

create type public.store_product_kind as enum (
  'credit_pack',
  'card',
  'vault',
  'bundle'
);

create table public.wallets (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  balance_credits bigint not null default 0 check (balance_credits >= 0),
  currency_code   text not null default 'EUR',
  updated_at      timestamptz not null default now()
);

create table public.wallet_transactions (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users (id) on delete cascade,
  type                       public.wallet_tx_type not null,
  status                     public.wallet_tx_status not null default 'pending',
  amount_credits             bigint not null,
  balance_after              bigint,
  description                text,
  reference_type             text,
  reference_id               uuid,
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  metadata                   jsonb not null default '{}',
  created_at                 timestamptz not null default now()
);

create index wallet_transactions_user_idx on public.wallet_transactions (user_id, created_at desc);

create table public.store_products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  kind           public.store_product_kind not null,
  title          text not null,
  description    text,
  price_cents    integer not null check (price_cents >= 0),
  currency       text not null default 'eur',
  credits_amount integer,
  card_id        uuid references public.cards (id) on delete set null,
  image_url      text,
  active         boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.orders (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users (id) on delete cascade,
  status                     public.order_status not null default 'pending_payment',
  total_cents                integer not null default 0,
  currency                   text not null default 'eur',
  credits_granted            integer not null default 0,
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  receipt_email              text,
  receipt_sent_at            timestamptz,
  refund_status              text,
  metadata                   jsonb not null default '{}',
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid references public.store_products (id) on delete set null,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null,
  credits_amount   integer not null default 0,
  card_id          uuid references public.cards (id) on delete set null,
  title_snapshot   text not null
);

create table public.player_inventory (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  card_id      uuid not null references public.cards (id) on delete restrict,
  quantity     integer not null default 1 check (quantity > 0),
  source       text not null default 'purchase',
  acquired_at  timestamptz not null default now(),
  unique (user_id, card_id)
);

create index player_inventory_user_idx on public.player_inventory (user_id);

create table public.stripe_webhook_events (
  id           text primary key,
  type         text not null,
  processed_at timestamptz not null default now(),
  payload      jsonb
);

create table public.withdrawal_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  amount_credits  bigint not null check (amount_credits > 0),
  status          text not null default 'pending',
  payout_method   text,
  payout_details  jsonb not null default '{}',
  reject_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.withdrawal_requests add column if not exists reject_reason text;

-- Admin flag (profiles may exist from dev seed)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.profiles add column if not exists is_admin boolean not null default false;
  end if;
end $$;

create or replace function public.ensure_wallet(p_user_id uuid)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
begin
  insert into public.wallets (user_id) values (p_user_id)
  on conflict (user_id) do nothing;
  select * into w from public.wallets where user_id = p_user_id;
  return w;
end;
$$;

create or replace function public.wallet_apply_credits(
  p_user_id uuid,
  p_amount bigint,
  p_type public.wallet_tx_type,
  p_status public.wallet_tx_status,
  p_description text default null,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_stripe_checkout_session_id text default null,
  p_stripe_payment_intent_id text default null
)
returns public.wallet_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
  new_balance bigint;
  tx public.wallet_transactions;
begin
  perform public.ensure_wallet(p_user_id);
  select * into w from public.wallets where user_id = p_user_id for update;

  new_balance := w.balance_credits + p_amount;
  if new_balance < 0 then
    raise exception 'insufficient_credits';
  end if;

  update public.wallets
  set balance_credits = new_balance, updated_at = now()
  where user_id = p_user_id;

  insert into public.wallet_transactions (
    user_id, type, status, amount_credits, balance_after, description,
    reference_type, reference_id, stripe_checkout_session_id, stripe_payment_intent_id
  ) values (
    p_user_id, p_type, p_status, p_amount, new_balance, p_description,
    p_reference_type, p_reference_id, p_stripe_checkout_session_id, p_stripe_payment_intent_id
  )
  returning * into tx;

  return tx;
end;
$$;

grant execute on function public.ensure_wallet(uuid) to authenticated, service_role;
grant execute on function public.wallet_apply_credits(
  uuid, bigint, public.wallet_tx_type, public.wallet_tx_status,
  text, text, uuid, text, text
) to service_role;

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.store_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.player_inventory enable row level security;
alter table public.withdrawal_requests enable row level security;

create policy "Users read own wallet" on public.wallets for select using (auth.uid() = user_id);
create policy "Users read own wallet tx" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "Active products are public" on public.store_products for select using (active = true);
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users read own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users read own inventory" on public.player_inventory for select using (auth.uid() = user_id);
create policy "Users read own withdrawals" on public.withdrawal_requests for select using (auth.uid() = user_id);

insert into public.store_products (slug, kind, title, description, price_cents, currency, credits_amount, sort_order)
values
  ('pack-500', 'credit_pack', '500 Credits', 'Starter pack', 500, 'eur', 500, 10),
  ('pack-1000', 'credit_pack', '1,000 Credits', 'Popular pack', 1000, 'eur', 1000, 20),
  ('pack-5000', 'credit_pack', '5,000 Credits', 'Value pack', 5000, 'eur', 5000, 30),
  ('pack-20000', 'credit_pack', '20,000 Credits', 'Best value', 20000, 'eur', 20000, 40)
on conflict (slug) do nothing;
