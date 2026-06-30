export type StoreProductKind = 'credit_pack' | 'card' | 'vault' | 'bundle'

export interface StoreProduct {
  id: string
  slug: string
  kind: StoreProductKind
  title: string
  description: string | null
  price_cents: number
  currency: string
  credits_amount: number | null
  card_id: string | null
  image_url: string | null
  active: boolean
  sort_order: number
}

export interface Wallet {
  user_id: string
  balance_credits: number
  currency_code: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: string
  status: string
  amount_credits: number
  balance_after: number | null
  description: string | null
  created_at: string
  stripe_checkout_session_id?: string | null
}

export interface InventoryItem {
  id: string
  user_id: string
  card_id: string
  quantity: number
  source: string
  acquired_at: string
  cards?: { slug: string; title: string; thumb_storage_path: string | null } | null
}

export interface PlayerMarketListing {
  id: string
  site_id: string
  seller_id: string
  card_id: string
  price_credits: number
  status: string
  created_at: string
  cards?: {
    id: string
    slug: string
    title: string
    price_cents: number | null
    thumb_storage_path: string | null
  } | null
}

export type CommerceAction =
  | { type: 'products_list' }
  | { type: 'wallet_get' }
  | { type: 'transactions_list'; limit?: number }
  | { type: 'inventory_list' }
  | { type: 'market_listings_list'; scope?: 'all' | 'mine'; limit?: number }
  | { type: 'market_listing_create'; cardId: string; priceCredits: number }
  | { type: 'market_listing_cancel'; listingId: string }
  | { type: 'buy_market_listing'; listingId: string }
  | { type: 'orders_list' }
  | { type: 'checkout_create'; packId?: string; productId?: string; customCredits?: number; cardId?: string; currency?: string }
  | { type: 'checkout_init'; packId?: string; productId?: string; customCredits?: number; cardId?: string; currency?: string }
  | { type: 'checkout_get'; orderId: string }
  | { type: 'checkout_pay'; orderId: string }
  | { type: 'checkout_test'; orderId: string; outcome: 'success' | 'failure' }
  | { type: 'profile_get' }
  | { type: 'purchase_with_credits'; productId: string }
  | { type: 'buy_card_with_credits'; cardId: string }
  | { type: 'withdrawal_create'; amountCredits: number; payoutMethod?: string }
  | { type: 'admin_transactions' }
  | { type: 'admin_products_upsert'; product: Record<string, unknown> }

export interface CommerceResponse {
  products?: StoreProduct[]
  wallet?: Wallet
  transactions?: WalletTransaction[]
  inventory?: InventoryItem[]
  listings?: PlayerMarketListing[]
  listing?: PlayerMarketListing
  minPriceCredits?: number
  marketPriceCredits?: number
  orders?: unknown[]
  checkoutUrl?: string
  orderId?: string
  sessionId?: string
  credits?: number
  title?: string
  totalCents?: number
  vatCents?: number
  currency?: string
  status?: string
  gatewayUrl?: string | null
  isAdmin?: boolean
  ok?: boolean
  withdrawal?: unknown
  error?: string
  message?: string
}
