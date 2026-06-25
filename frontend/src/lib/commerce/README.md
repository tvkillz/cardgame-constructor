# Commerce API (transactional store)

Payments run on **Supabase Edge Functions**, not Next.js API routes.

## Flow

```
User → checkout_create → Stripe Checkout → stripe-webhook
  → wallet_apply_credits → order paid → player_inventory → receipt_sent_at
```

## Client

```ts
import { invokeCommerceAction } from '@/lib/commerce/api'

await invokeCommerceAction({ type: 'checkout_create', packId: 'pack-1000' })
```

Base URL: `POST ${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/commerce`

Webhook (Stripe only): `POST /functions/v1/stripe-webhook`

## REST mapping (conceptual)

| Spec | Implementation |
|------|----------------|
| `GET /products` | `{ type: 'products_list' }` |
| `GET /products/:id` | filter client-side or extend commerce |
| `POST /checkout/create` | `{ type: 'checkout_create', packId \| productId \| customCredits }` |
| `POST /payments/webhook` | `stripe-webhook` function |
| `GET /wallet` | `{ type: 'wallet_get' }` |
| `POST /wallet/top-up` | `{ type: 'checkout_create', ... }` |
| `GET /wallet/transactions` | `{ type: 'transactions_list' }` |
| `POST /store/purchase` | `{ type: 'purchase_with_credits', productId }` |
| `POST /market/buy` | `{ type: 'buy_card_with_credits', cardId }` — charges `cards.price_cents` credits |
| `GET /inventory` | `{ type: 'inventory_list' }` |
| `POST /withdrawals/create` | `{ type: 'withdrawal_create' }` |
| Admin endpoints | `admin_transactions`, `admin_products_upsert` |

## VPS deploy

1. Apply `voidborn-backend/docker/volumes/db/commerce.sql` on existing DB (init mount only on fresh volumes).
2. Set env on `functions` service: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`.
3. Stripe Dashboard → webhook URL: `https://<supabase>/functions/v1/stripe-webhook`, events: `checkout.session.completed`, `charge.refunded`.
4. Test cards: `4242 4242 4242 4242`. Apple Pay / Google Pay: enable in Stripe Checkout settings.
