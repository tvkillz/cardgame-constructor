import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const corsHeaders = { 'Content-Type': 'application/json' }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',').map((p) => p.trim())
  const tPart = parts.find((p) => p.startsWith('t='))
  const v1Parts = parts.filter((p) => p.startsWith('v1='))
  if (!tPart || v1Parts.length === 0) return false

  const timestamp = tPart.slice(2)
  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  for (const v1 of v1Parts) {
    const received = v1.slice(3)
    if (received.length === expected.length && received === expected) return true
  }
  return false
}

async function fulfillOrder(
  admin: ReturnType<typeof createClient>,
  orderId: string,
  userId: string,
  sessionId: string,
  paymentIntentId: string | null,
) {
  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (!order || order.status === 'paid') return

  const credits = order.credits_granted ?? 0
  if (credits > 0) {
    await admin.rpc('wallet_apply_credits', {
      p_user_id: userId,
      p_amount: BigInt(credits),
      p_type: 'top_up',
      p_status: 'completed',
      p_description: `Stripe payment order ${orderId}`,
      p_reference_type: 'order',
      p_reference_id: orderId,
      p_stripe_checkout_session_id: sessionId,
      p_stripe_payment_intent_id: paymentIntentId,
    })
  }

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
    .from('wallet_transactions')
    .update({ status: 'completed' })
    .eq('stripe_checkout_session_id', sessionId)
    .eq('status', 'pending')

  await admin
    .from('orders')
    .update({
      status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
      receipt_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  if (STRIPE_WEBHOOK_SECRET && !(await verifyStripeSignature(rawBody, sig, STRIPE_WEBHOOK_SECRET))) {
    return json({ error: 'invalid_signature' }, 400)
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: seen } = await admin.from('stripe_webhook_events').select('id').eq('id', event.id).maybeSingle()
  if (seen) return json({ ok: true, duplicate: true })

  await admin.from('stripe_webhook_events').insert({
    id: event.id,
    type: event.type,
    payload: event,
  })

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = String(session.metadata?.order_id ?? session.client_reference_id ?? '')
    const userId = String(session.metadata?.user_id ?? '')
    const sessionId = String(session.id ?? '')
    const paymentIntentId = session.payment_intent ? String(session.payment_intent) : null

    if (orderId && userId) {
      await fulfillOrder(admin, orderId, userId, sessionId, paymentIntentId)
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object
    const paymentIntentId = charge.payment_intent ? String(charge.payment_intent) : null
    if (paymentIntentId) {
      const { data: order } = await admin
        .from('orders')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .maybeSingle()

      if (order && order.status === 'paid') {
        const credits = order.credits_granted ?? 0
        if (credits > 0) {
          try {
            await admin.rpc('wallet_apply_credits', {
              p_user_id: order.user_id,
              p_amount: -BigInt(credits),
              p_type: 'refund',
              p_status: 'completed',
              p_description: `Refund order ${order.id}`,
              p_reference_type: 'order',
              p_reference_id: order.id,
            })
          } catch {
            /* balance may be insufficient — admin adjustment */
          }
        }
        await admin
          .from('orders')
          .update({
            status: 'refunded',
            refund_status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id)
      }
    }
  }

  return json({ ok: true })
})
