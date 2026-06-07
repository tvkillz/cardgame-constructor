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

export type CommerceAction =
  | { type: 'products_list' }
  | { type: 'wallet_get' }
  | { type: 'transactions_list'; limit?: number }
  | { type: 'inventory_list' }
  | { type: 'orders_list' }
  | { type: 'checkout_create'; packId?: string; productId?: string; customCredits?: number }
  | { type: 'purchase_with_credits'; productId: string }
  | { type: 'withdrawal_create'; amountCredits: number; payoutMethod?: string }
  | { type: 'admin_transactions' }
  | { type: 'admin_products_upsert'; product: Record<string, unknown> }

export interface CommerceResponse {
  products?: StoreProduct[]
  wallet?: Wallet
  transactions?: WalletTransaction[]
  inventory?: InventoryItem[]
  orders?: unknown[]
  checkoutUrl?: string
  orderId?: string
  sessionId?: string
  ok?: boolean
  withdrawal?: unknown
  error?: string
  message?: string
}
