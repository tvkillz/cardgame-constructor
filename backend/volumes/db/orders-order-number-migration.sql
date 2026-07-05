-- Human-readable unique order reference (e.g. VB-A7K9M2X4) for invoices and history.
-- API VPS:
--   docker compose exec -T db psql -U postgres < volumes/db/orders-order-number-migration.sql
--   docker compose up -d functions --force-recreate

alter table public.orders add column if not exists order_number text;

-- Backfill: random 8-char suffix per row (avoids UUID-prefix collisions like 00000000).
update public.orders o
set order_number = 'VB-' || upper(substr(md5(o.id::text || o.created_at::text), 1, 8))
where o.order_number is null;

-- Resolve rare backfill collisions.
do $$
declare
  r record;
  n text;
begin
  for r in
    select o1.id
    from public.orders o1
    where exists (
      select 1
      from public.orders o2
      where o2.order_number = o1.order_number
        and o2.id <> o1.id
    )
  loop
    loop
      n := 'VB-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
      exit when not exists (select 1 from public.orders where order_number = n);
    end loop;
    update public.orders set order_number = n where id = r.id;
  end loop;
end $$;

create unique index if not exists orders_order_number_idx on public.orders (order_number);

alter table public.orders alter column order_number set not null;

notify pgrst, 'reload schema';
