import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SITE_URL = (Deno.env.get('SITE_URL') ?? Deno.env.get('PUBLIC_SITE_URL') ?? 'https://voidborn.fun').replace(
  /\/$/,
  '',
)

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-site-id',
}

function json(body: unknown, status = 200) {
  return new Response(
    JSON.stringify(body, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)),
    { status, headers: corsHeaders },
  )
}

function siteIdFromRequest(req: Request): string | null {
  return req.headers.get('X-Site-Id')?.trim() || req.headers.get('x-site-id')?.trim() || null
}

function siteIdFromAuthEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const at = email.lastIndexOf('@')
  if (at <= 0) return null
  const local = email.slice(0, at).toLowerCase()
  const sepIdx = local.lastIndexOf('+')
  if (sepIdx <= 0) return null
  const parsed = local.slice(sepIdx + 1)
  return parsed || null
}

function displayEmailFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const meta = user.user_metadata?.display_email
  if (typeof meta === 'string' && meta.trim()) return meta.trim()
  const email = user.email ?? ''
  const at = email.lastIndexOf('@')
  if (at <= 0) return email
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const sepIdx = local.lastIndexOf('+')
  if (sepIdx > 0) return `${local.slice(0, sepIdx)}@${domain}`
  return email
}

async function assertSiteAccess(
  admin: ReturnType<typeof createClient>,
  userId: string,
  siteId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('site_members')
    .select('site_id')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .maybeSingle()
  if (data?.site_id) return true

  const { data: userData, error } = await admin.auth.admin.getUserById(userId)
  if (error || !userData?.user) return false
  return siteIdFromAuthEmail(userData.user.email) === siteId
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data, error } = await admin.auth.getUser(auth.slice(7))
  if (error || !data.user) return null
  return data.user.id
}

async function isAdmin(admin: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await admin.from('profiles').select('is_admin').eq('id', userId).maybeSingle()
  if (data?.is_admin) return true
  const { data: userData } = await admin.auth.admin.getUserById(userId)
  return userData.user?.app_metadata?.is_admin === true
}

async function stripeRequest(path: string, body: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Stripe error ${res.status}`)
  }
  return data
}

type CheckoutBody = {
  type: 'checkout_create'
  productId?: string
  packId?: string
  customCredits?: number
  cardId?: string
  currency?: string
  successUrl?: string
  cancelUrl?: string
}

const RATE_FROM_EUR: Record<string, number> = {
  eur: 1,
  gbp: 0.86,
  usd: 1.08,
}

const LISTING_COMMISSION_RATE = 0.2
const LISTING_MIN_PRICE_RATIO = 0.75

type ResolvedCheckout = {
  productId: string | null
  credits: number
  title: string
  unitCents: number
  currency: string
  cardId: string | null
}

function formatCreditsPurchaseDescription(credits: number, totalCents: number, currency: string): string {
  const upper = currency.toUpperCase()
  const amount = (totalCents / 100).toFixed(2)
  const sym = upper === 'EUR' ? '€' : upper === 'GBP' ? '£' : upper === 'USD' ? '$' : ''
  return `Purchased ${credits} credits for ${sym}${amount} ${upper}`
}

async function resolveCheckoutPayload(
  admin: ReturnType<typeof createClient>,
  siteId: string,
  payload: {
    packId?: string
    productId?: string
    customCredits?: number
    cardId?: string
    currency?: string
  },
): Promise<{ ok: true; resolved: ResolvedCheckout } | { ok: false; error: string; status: number }> {
  let productId = payload.productId ?? null
  let credits = 0
  let title = 'VOIDBORN Credits'
  let unitCents = 0
  let currency = 'eur'
  let cardId: string | null = null
  let checkoutCurrencyApplied = false

  if (payload.packId || productId) {
    const slugOrId = payload.packId ?? productId!
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    let productQuery = admin.from('store_products').select('*').eq('active', true).eq('site_id', siteId)
    productQuery = uuidRe.test(slugOrId)
      ? productQuery.eq('id', slugOrId)
      : productQuery.eq('slug', slugOrId)
    const { data: product } = await productQuery.maybeSingle()

    if (!product) return { ok: false, error: 'product_not_found', status: 404 }
    productId = product.id
    credits = product.credits_amount ?? 0
    title = product.title
    unitCents = product.price_cents
    currency = product.currency ?? 'eur'
    cardId = product.card_id
  } else if (payload.customCredits && payload.customCredits > 0) {
    credits = Math.floor(payload.customCredits)
    unitCents = credits
    title = `${credits} Credits`
    productId = null
  } else if (payload.cardId) {
    const cardIdStr = String(payload.cardId)
    const { data: card } = await admin
      .from('cards')
      .select('id, title, price_cents, site_id, published')
      .eq('id', cardIdStr)
      .eq('site_id', siteId)
      .eq('published', true)
      .maybeSingle()

    if (!card || !card.price_cents || card.price_cents <= 0) {
      return { ok: false, error: 'card_not_found', status: 404 }
    }

    const displayCurrency = String(payload.currency ?? 'eur').toLowerCase()
    const rate = RATE_FROM_EUR[displayCurrency] ?? 1
    cardId = card.id
    credits = 0
    title = card.title
    unitCents = Math.round(Number(card.price_cents) * rate)
    currency = displayCurrency
    productId = null
    checkoutCurrencyApplied = true
  } else {
    return { ok: false, error: 'invalid_checkout', status: 400 }
  }

  if (!checkoutCurrencyApplied && payload.currency) {
    const displayCurrency = String(payload.currency).toLowerCase()
    const rate = RATE_FROM_EUR[displayCurrency]
    if (rate) {
      unitCents = Math.round(unitCents * rate)
      currency = displayCurrency
    }
  }

  return {
    ok: true,
    resolved: { productId, credits, title, unitCents, currency, cardId },
  }
}

async function createPendingOrder(
  admin: ReturnType<typeof createClient>,
  userId: string,
  resolved: ResolvedCheckout,
  receiptEmail: string | null,
): Promise<{ orderId: string } | { error: string }> {
  const { productId, credits, title, unitCents, currency, cardId } = resolved

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending_payment',
      total_cents: unitCents,
      currency,
      credits_granted: credits,
      receipt_email: receiptEmail,
      metadata: { product_id: productId, card_id: cardId, checkout_flow: 'internal' },
    })
    .select('id')
    .single()

  if (orderErr || !order) return { error: orderErr?.message ?? 'order_create_failed' }

  await admin.from('order_items').insert({
    order_id: order.id,
    product_id: productId,
    quantity: 1,
    unit_price_cents: unitCents,
    credits_amount: credits,
    card_id: cardId,
    title_snapshot: title,
  })

  return { orderId: order.id }
}

async function fulfillInternalOrder(
  admin: ReturnType<typeof createClient>,
  orderId: string,
  userId: string,
): Promise<{ ok: true } | { error: string; status: number }> {
  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (!order || order.user_id !== userId) return { error: 'order_not_found', status: 404 }
  if (order.status === 'paid') return { ok: true }

  const credits = order.credits_granted ?? 0
  const description = formatCreditsPurchaseDescription(
    credits,
    order.total_cents,
    order.currency ?? 'eur',
  )

  if (credits > 0) {
    const { error: rpcError } = await admin.rpc('wallet_apply_credits', {
      p_user_id: userId,
      p_amount: Number(credits),
      p_type: 'top_up',
      p_status: 'completed',
      p_description: description,
      p_reference_type: 'order',
      p_reference_id: orderId,
    })
    if (rpcError) return { error: rpcError.message, status: 500 }
  }

  await admin
    .from('wallet_transactions')
    .update({ status: 'failed', description: 'Replaced by completed checkout' })
    .eq('reference_type', 'order')
    .eq('reference_id', orderId)
    .eq('status', 'pending')

  const { data: items } = await admin.from('order_items').select('*').eq('order_id', orderId)
  for (const item of items ?? []) {
    if (item.card_id) {
      const { data: existing } = await admin
        .from('player_inventory')
        .select('quantity')
        .eq('user_id', userId)
        .eq('card_id', item.card_id)
        .maybeSingle()
      if (existing) {
        await admin
          .from('player_inventory')
          .update({ quantity: existing.quantity + (item.quantity ?? 1) })
          .eq('user_id', userId)
          .eq('card_id', item.card_id)
      } else {
        await admin.from('player_inventory').insert({
          user_id: userId,
          card_id: item.card_id,
          quantity: item.quantity ?? 1,
          source: 'purchase',
        })
      }
    }
  }

  await admin
    .from('orders')
    .update({
      status: 'paid',
      receipt_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  return { ok: true }
}

async function countCardInUserDecks(
  admin: ReturnType<typeof createClient>,
  userId: string,
  cardId: string,
): Promise<number> {
  const { data: decks } = await admin.from('player_decks').select('id').eq('user_id', userId)
  if (!decks?.length) return 0
  const deckIds = decks.map((d: { id: string }) => d.id)
  const { data: rows } = await admin
    .from('player_deck_cards')
    .select('quantity')
    .eq('card_id', cardId)
    .in('deck_id', deckIds)
  return (rows ?? []).reduce((sum: number, row: { quantity: number }) => sum + row.quantity, 0)
}

/** Remove one copy of a card from the user's decks (first deck that contains it). */
async function removeOneCardFromUserDecks(
  admin: ReturnType<typeof createClient>,
  userId: string,
  cardId: string,
): Promise<boolean> {
  const { data: decks } = await admin.from('player_decks').select('id').eq('user_id', userId)
  if (!decks?.length) return false

  for (const deck of decks) {
    const { data: row } = await admin
      .from('player_deck_cards')
      .select('quantity')
      .eq('deck_id', deck.id)
      .eq('card_id', cardId)
      .maybeSingle()

    if (!row || row.quantity <= 0) continue

    if (row.quantity <= 1) {
      await admin.from('player_deck_cards').delete().eq('deck_id', deck.id).eq('card_id', cardId)
    } else {
      await admin
        .from('player_deck_cards')
        .update({ quantity: row.quantity - 1 })
        .eq('deck_id', deck.id)
        .eq('card_id', cardId)
    }
    return true
  }

  return false
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const action = String(body.type ?? '')
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const siteId = siteIdFromRequest(req)

  if (action === 'products_list') {
    if (!siteId) return json({ error: 'missing_site_id' }, 400)
    const { data, error } = await admin
      .from('store_products')
      .select('*')
      .eq('active', true)
      .eq('site_id', siteId)
      .order('sort_order', { ascending: true })
    if (error) return json({ error: error.message }, 500)
    return json({ products: data })
  }

  const userId = await getUserId(req)
  if (!userId) return json({ error: 'unauthorized' }, 401)

  if (!siteId) return json({ error: 'missing_site_id' }, 400)
  if (!(await assertSiteAccess(admin, userId, siteId))) {
    return json({ error: 'site_forbidden' }, 403)
  }

  await admin.rpc('ensure_wallet', { p_user_id: userId })

  if (action === 'wallet_get') {
    const { data: wallet } = await admin.from('wallets').select('*').eq('user_id', userId).single()
    return json({ wallet })
  }

  if (action === 'transactions_list') {
    const limit = Math.min(Number(body.limit ?? 50), 100)
    const { data, error } = await admin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit * 3)
    if (error) return json({ error: error.message }, 500)

    const filtered = (data ?? []).filter((tx) => {
      const desc = String(tx.description ?? '')
      if (tx.status === 'failed' && desc.includes('Replaced by completed checkout')) return false
      if (tx.status === 'pending' && desc.startsWith('Checkout:')) return false
      if (tx.status === 'pending' && !desc.startsWith('Payment processing:')) return false
      return true
    })

    return json({ transactions: filtered.slice(0, limit) })
  }

  if (action === 'inventory_list') {
    const { data, error } = await admin
      .from('player_inventory')
      .select('*, cards ( slug, title, thumb_storage_path )')
      .eq('user_id', userId)
      .order('acquired_at', { ascending: false })
    if (error) return json({ error: error.message }, 500)
    return json({ inventory: data })
  }

  if (action === 'market_listings_list') {
    const scope = String(body.scope ?? 'all')
    let query = admin
      .from('player_market_listings')
      .select(
        'id, site_id, seller_id, card_id, price_credits, status, created_at, cards ( id, slug, title, price_cents, thumb_storage_path )',
      )
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(Math.min(Number(body.limit ?? 200), 500))

    if (scope === 'mine') {
      query = query.eq('seller_id', userId)
    }

    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)
    return json({ listings: data })
  }

  if (action === 'market_listing_create') {
    const cardId = String(body.cardId ?? '')
    const priceCredits = Math.floor(Number(body.priceCredits ?? 0))
    if (!cardId || priceCredits <= 0) return json({ error: 'invalid_listing' }, 400)

    const { data: card } = await admin
      .from('cards')
      .select('id, title, price_cents, site_id, published')
      .eq('id', cardId)
      .eq('site_id', siteId)
      .eq('published', true)
      .maybeSingle()

    if (!card) return json({ error: 'card_not_found' }, 404)

    const marketPrice = Number(card.price_cents ?? 0)
    if (marketPrice <= 0) return json({ error: 'card_not_for_sale' }, 400)

    const minPrice = Math.ceil(marketPrice * LISTING_MIN_PRICE_RATIO)
    if (priceCredits < minPrice) {
      return json({
        error: 'price_too_low',
        minPriceCredits: minPrice,
        marketPriceCredits: marketPrice,
      }, 400)
    }

    const inDecks = await countCardInUserDecks(admin, userId, cardId)
    const { data: inv } = await admin
      .from('player_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .maybeSingle()

    const owned = inv?.quantity ?? 0
    if (owned < 1) {
      return json({ error: 'no_available_copy', message: 'You do not own a copy of this card.' }, 400)
    }

    if (inDecks > 0) {
      await removeOneCardFromUserDecks(admin, userId, cardId)
    }

    const { data: listing, error: insertError } = await admin
      .from('player_market_listings')
      .insert({
        site_id: siteId,
        seller_id: userId,
        card_id: cardId,
        price_credits: priceCredits,
        status: 'active',
      })
      .select('*')
      .single()

    if (insertError) return json({ error: insertError.message }, 500)

    if (owned <= 1) {
      await admin.from('player_inventory').delete().eq('user_id', userId).eq('card_id', cardId)
    } else {
      await admin
        .from('player_inventory')
        .update({ quantity: owned - 1 })
        .eq('user_id', userId)
        .eq('card_id', cardId)
    }

    return json({ ok: true, listing })
  }

  if (action === 'market_listing_cancel') {
    const listingId = String(body.listingId ?? '')
    if (!listingId) return json({ error: 'missing_listing_id' }, 400)

    const { data: listing } = await admin
      .from('player_market_listings')
      .select('*')
      .eq('id', listingId)
      .eq('seller_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (!listing) return json({ error: 'listing_not_found' }, 404)

    await admin
      .from('player_market_listings')
      .update({ status: 'cancelled' })
      .eq('id', listingId)

    const { data: existing } = await admin
      .from('player_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', listing.card_id)
      .maybeSingle()

    if (existing) {
      await admin
        .from('player_inventory')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', userId)
        .eq('card_id', listing.card_id)
    } else {
      await admin.from('player_inventory').insert({
        user_id: userId,
        card_id: listing.card_id,
        quantity: 1,
        source: 'listing_cancelled',
      })
    }

    return json({ ok: true })
  }

  if (action === 'buy_market_listing') {
    const listingId = String(body.listingId ?? '')
    if (!listingId) return json({ error: 'missing_listing_id' }, 400)

    const { data: listing } = await admin
      .from('player_market_listings')
      .select('*, cards ( id, title )')
      .eq('id', listingId)
      .eq('site_id', siteId)
      .eq('status', 'active')
      .maybeSingle()

    if (!listing) return json({ error: 'listing_not_found' }, 404)
    if (listing.seller_id === userId) return json({ error: 'cannot_buy_own_listing' }, 400)

    const price = Number(listing.price_credits)
    const sellerProceeds = Math.floor(price * (1 - LISTING_COMMISSION_RATE))

    try {
      await admin.rpc('wallet_apply_credits', {
        p_user_id: userId,
        p_amount: -price,
        p_type: 'purchase',
        p_status: 'completed',
        p_description: `Bought listing: ${listing.cards?.title ?? 'card'}`,
        p_reference_type: 'market_listing',
        p_reference_id: listing.id,
      })
    } catch (e) {
      return json({ error: 'insufficient_credits', message: String(e) }, 400)
    }

    await admin.rpc('ensure_wallet', { p_user_id: listing.seller_id })

    await admin.rpc('wallet_apply_credits', {
      p_user_id: listing.seller_id,
      p_amount: sellerProceeds,
      p_type: 'adjustment',
      p_status: 'completed',
      p_description: `Card sold: ${listing.cards?.title ?? 'card'} (+${sellerProceeds} credits after ${Math.round(LISTING_COMMISSION_RATE * 100)}% commission)`,
      p_reference_type: 'market_listing',
      p_reference_id: listing.id,
    })

    await admin
      .from('player_market_listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
        buyer_id: userId,
      })
      .eq('id', listingId)

    const { data: buyerInv } = await admin
      .from('player_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', listing.card_id)
      .maybeSingle()

    if (buyerInv) {
      await admin
        .from('player_inventory')
        .update({ quantity: buyerInv.quantity + 1 })
        .eq('user_id', userId)
        .eq('card_id', listing.card_id)
    } else {
      await admin.from('player_inventory').insert({
        user_id: userId,
        card_id: listing.card_id,
        quantity: 1,
        source: 'player_market',
      })
    }

    return json({ ok: true })
  }

  if (action === 'orders_list') {
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items (*)')
      .eq('user_id', userId)
      .neq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return json({ error: error.message }, 500)
    return json({ orders: data })
  }

  if (action === 'checkout_create') {
    if (!STRIPE_SECRET_KEY) {
      return json({ error: 'stripe_not_configured', message: 'STRIPE_SECRET_KEY missing on server' }, 503)
    }

    const payload = body as CheckoutBody
    let productId = payload.productId ?? null
    let credits = 0
    let title = 'VOIDBORN Credits'
    let unitCents = 0
    let currency = 'eur'
    let cardId: string | null = null
    let checkoutCurrencyApplied = false

    if (payload.packId || productId) {
      const slugOrId = payload.packId ?? productId!
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      let productQuery = admin.from('store_products').select('*').eq('active', true).eq('site_id', siteId)
      productQuery = uuidRe.test(slugOrId)
        ? productQuery.eq('id', slugOrId)
        : productQuery.eq('slug', slugOrId)
      const { data: product } = await productQuery.maybeSingle()

      if (!product) return json({ error: 'product_not_found' }, 404)
      productId = product.id
      credits = product.credits_amount ?? 0
      title = product.title
      unitCents = product.price_cents
      currency = product.currency ?? 'eur'
      cardId = product.card_id
    } else if (payload.customCredits && payload.customCredits > 0) {
      credits = Math.floor(payload.customCredits)
      unitCents = credits
      title = `${credits} Credits`
      productId = null
    } else if (body.cardId) {
      const cardIdStr = String(body.cardId)
      const { data: card } = await admin
        .from('cards')
        .select('id, title, price_cents, site_id, published')
        .eq('id', cardIdStr)
        .eq('site_id', siteId)
        .eq('published', true)
        .maybeSingle()

      if (!card || !card.price_cents || card.price_cents <= 0) {
        return json({ error: 'card_not_found' }, 404)
      }

      const displayCurrency = String(body.currency ?? 'eur').toLowerCase()
      const rate = RATE_FROM_EUR[displayCurrency] ?? 1
      cardId = card.id
      credits = 0
      title = card.title
      unitCents = Math.round(Number(card.price_cents) * rate)
      currency = displayCurrency
      productId = null
      checkoutCurrencyApplied = true
    } else {
      return json({ error: 'invalid_checkout' }, 400)
    }

    if (!checkoutCurrencyApplied && payload.currency) {
      const displayCurrency = String(payload.currency).toLowerCase()
      const rate = RATE_FROM_EUR[displayCurrency]
      if (rate) {
        unitCents = Math.round(unitCents * rate)
        currency = displayCurrency
      }
    }

    const { data: userData } = await admin.auth.admin.getUserById(userId)
    const receiptEmail = userData.user ? displayEmailFromUser(userData.user) : null

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending_payment',
        total_cents: unitCents,
        currency,
        credits_granted: credits,
        receipt_email: receiptEmail,
        metadata: { product_id: productId, card_id: cardId },
      })
      .select('id')
      .single()

    if (orderErr || !order) return json({ error: orderErr?.message ?? 'order_create_failed' }, 500)

    await admin.from('order_items').insert({
      order_id: order.id,
      product_id: productId,
      quantity: 1,
      unit_price_cents: unitCents,
      credits_amount: credits,
      card_id: cardId,
      title_snapshot: title,
    })

    const successUrl =
      payload.successUrl ?? `${SITE_URL}/portal/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = payload.cancelUrl ?? `${SITE_URL}/portal/checkout/cancel`

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set('success_url', successUrl)
    params.set('cancel_url', cancelUrl)
    params.set('client_reference_id', order.id)
    params.set('metadata[user_id]', userId)
    params.set('metadata[order_id]', order.id)
    if (receiptEmail) params.set('customer_email', receiptEmail)
    params.set('line_items[0][quantity]', '1')
    params.set('line_items[0][price_data][currency]', currency)
    params.set('line_items[0][price_data][unit_amount]', String(unitCents))
    params.set('line_items[0][price_data][product_data][name]', title)
    params.set('payment_method_types[0]', 'card')
    params.append('payment_method_types[]', 'link')

    const session = await stripeRequest('checkout/sessions', params)

    await admin
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (credits > 0) {
      await admin.from('wallet_transactions').insert({
        user_id: userId,
        type: 'top_up',
        status: 'pending',
        amount_credits: credits,
        description: `Checkout: ${title}`,
        reference_type: 'order',
        reference_id: order.id,
        stripe_checkout_session_id: session.id,
      })
    }

    return json({
      orderId: order.id,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  }

  if (action === 'buy_card_with_credits') {
    const cardId = String(body.cardId ?? '')
    if (!cardId) return json({ error: 'missing_card_id' }, 400)

    const { data: card } = await admin
      .from('cards')
      .select('id, title, price_cents, site_id, published')
      .eq('id', cardId)
      .eq('site_id', siteId)
      .eq('published', true)
      .maybeSingle()

    if (!card) {
      return json({ error: 'card_not_found' }, 404)
    }

    const priceCredits = card.price_cents
    if (!priceCredits || priceCredits <= 0) {
      return json({ error: 'card_not_for_sale' }, 400)
    }

    try {
      await admin.rpc('wallet_apply_credits', {
        p_user_id: userId,
        p_amount: -Number(priceCredits),
        p_type: 'purchase',
        p_status: 'completed',
        p_description: `Purchased card: ${card.title}`,
        p_reference_type: 'card',
        p_reference_id: card.id,
      })
    } catch (e) {
      return json({ error: 'insufficient_credits', message: String(e) }, 400)
    }

    const { data: existing } = await admin
      .from('player_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', card.id)
      .maybeSingle()

    if (existing) {
      await admin
        .from('player_inventory')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', userId)
        .eq('card_id', card.id)
    } else {
      await admin.from('player_inventory').insert({
        user_id: userId,
        card_id: card.id,
        quantity: 1,
        source: 'purchase',
      })
    }

    return json({ ok: true })
  }

  if (action === 'purchase_with_credits') {
    const productId = String(body.productId ?? '')
    const { data: product } = await admin
      .from('store_products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .eq('site_id', siteId)
      .maybeSingle()
    if (!product || product.kind !== 'card' || !product.card_id) {
      return json({ error: 'product_not_found' }, 404)
    }

    const priceCredits = product.credits_amount ?? product.price_cents
    try {
      await admin.rpc('wallet_apply_credits', {
        p_user_id: userId,
        p_amount: -Number(priceCredits),
        p_type: 'purchase',
        p_status: 'completed',
        p_description: `Purchased: ${product.title}`,
        p_reference_type: 'product',
        p_reference_id: product.id,
      })
    } catch (e) {
      return json({ error: 'insufficient_credits', message: String(e) }, 400)
    }

    const { data: existing } = await admin
      .from('player_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('card_id', product.card_id)
      .maybeSingle()

    if (existing) {
      await admin
        .from('player_inventory')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', userId)
        .eq('card_id', product.card_id)
    } else {
      await admin.from('player_inventory').insert({
        user_id: userId,
        card_id: product.card_id,
        quantity: 1,
        source: 'purchase',
      })
    }

    return json({ ok: true })
  }

  if (action === 'withdrawal_create') {
    const amount = Math.floor(Number(body.amountCredits ?? 0))
    if (amount <= 0) return json({ error: 'invalid_amount' }, 400)

    const { data: row, error } = await admin
      .from('withdrawal_requests')
      .insert({
        user_id: userId,
        amount_credits: amount,
        status: 'pending',
        payout_method: body.payoutMethod ?? null,
        payout_details: body.payoutDetails ?? {},
      })
      .select('*')
      .single()
    if (error) return json({ error: error.message }, 500)
    return json({ withdrawal: row })
  }

  if (action === 'admin_transactions') {
    if (!(await isAdmin(admin, userId))) return json({ error: 'forbidden' }, 403)
    const { data, error } = await admin
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return json({ error: error.message }, 500)
    return json({ transactions: data })
  }

  if (action === 'admin_products_upsert') {
    if (!(await isAdmin(admin, userId))) return json({ error: 'forbidden' }, 403)
    const product = body.product as Record<string, unknown>
    if (!product) return json({ error: 'invalid_product' }, 400)
    const { data, error } = await admin.from('store_products').upsert(product).select('*').single()
    if (error) return json({ error: error.message }, 500)
    return json({ product: data })
  }

  if (action === 'profile_get') {
    const adminFlag = await isAdmin(admin, userId)
    return json({ isAdmin: adminFlag })
  }

  if (action === 'checkout_init') {
    const resolvedResult = await resolveCheckoutPayload(admin, siteId, {
      packId: body.packId ? String(body.packId) : undefined,
      productId: body.productId ? String(body.productId) : undefined,
      customCredits: body.customCredits ? Number(body.customCredits) : undefined,
      cardId: body.cardId ? String(body.cardId) : undefined,
      currency: body.currency ? String(body.currency) : undefined,
    })
    if (!resolvedResult.ok) return json({ error: resolvedResult.error }, resolvedResult.status)

    const { data: userData } = await admin.auth.admin.getUserById(userId)
    const receiptEmail = userData.user ? displayEmailFromUser(userData.user) : null

    const orderResult = await createPendingOrder(admin, userId, resolvedResult.resolved, receiptEmail)
    if ('error' in orderResult) return json({ error: orderResult.error }, 500)

    const { resolved } = resolvedResult
    return json({
      orderId: orderResult.orderId,
      credits: resolved.credits,
      title: resolved.title,
      totalCents: resolved.unitCents,
      currency: resolved.currency,
      vatCents: resolved.unitCents,
    })
  }

  if (action === 'checkout_get') {
    const orderId = String(body.orderId ?? '')
    if (!orderId) return json({ error: 'missing_order_id' }, 400)

    const { data: order } = await admin
      .from('orders')
      .select('*, order_items (*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!order) return json({ error: 'order_not_found' }, 404)

    const item = Array.isArray(order.order_items) ? order.order_items[0] : null
    return json({
      orderId: order.id,
      status: order.status,
      credits: order.credits_granted ?? 0,
      title: item?.title_snapshot ?? 'VOIDBORN Credits',
      totalCents: order.total_cents,
      currency: order.currency,
      vatCents: order.total_cents,
    })
  }

  if (action === 'checkout_pay') {
    const orderId = String(body.orderId ?? '')
    if (!orderId) return json({ error: 'missing_order_id' }, 400)

    const { data: order } = await admin
      .from('orders')
      .select('id, status, user_id, credits_granted, total_cents, currency, metadata')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!order) return json({ error: 'order_not_found' }, 404)
    if (order.status !== 'pending_payment') {
      return json({ error: 'order_not_payable', message: 'This order is no longer awaiting payment.' }, 400)
    }

    const credits = order.credits_granted ?? 0
    const processingDescription = `Payment processing: ${formatCreditsPurchaseDescription(
      credits,
      order.total_cents,
      order.currency ?? 'eur',
    )}`

    const { data: existingPending } = await admin
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reference_type', 'order')
      .eq('reference_id', orderId)
      .eq('status', 'pending')
      .maybeSingle()

    if (!existingPending && credits > 0) {
      await admin.from('wallet_transactions').insert({
        user_id: userId,
        type: 'top_up',
        status: 'pending',
        amount_credits: credits,
        description: processingDescription,
        reference_type: 'order',
        reference_id: orderId,
      })
    }

    await admin
      .from('orders')
      .update({
        metadata: { ...(order.metadata ?? {}), payment_processing: true },
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // Placeholder for external payment gateway integration.
    return json({
      status: 'awaiting_gateway',
      orderId,
      message: 'You will be redirected to a secure payment page to complete your purchase.',
      gatewayUrl: null,
    })
  }

  if (action === 'checkout_test') {
    if (!(await isAdmin(admin, userId))) return json({ error: 'forbidden' }, 403)

    const orderId = String(body.orderId ?? '')
    const outcome = String(body.outcome ?? '')
    if (!orderId) return json({ error: 'missing_order_id' }, 400)
    if (outcome !== 'success' && outcome !== 'failure') {
      return json({ error: 'invalid_outcome' }, 400)
    }

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
    if (!order) return json({ error: 'order_not_found' }, 404)
    if (order.user_id !== userId) return json({ error: 'forbidden' }, 403)

    if (outcome === 'success') {
      try {
        const result = await fulfillInternalOrder(admin, orderId, order.user_id)
        if ('error' in result) return json({ error: result.error, message: result.error }, result.status)
        return json({ ok: true, status: 'paid' })
      } catch (e) {
        return json({ error: 'fulfillment_failed', message: String(e) }, 500)
      }
    }

    await admin
      .from('wallet_transactions')
      .update({ status: 'failed' })
      .eq('reference_type', 'order')
      .eq('reference_id', orderId)
      .eq('status', 'pending')

    await admin
      .from('orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    return json({ ok: true, status: 'failed' })
  }

  return json({ error: 'unknown_action', action }, 400)
})
