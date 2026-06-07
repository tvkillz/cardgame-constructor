import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'
import { getSiteId } from '@/lib/site'

import type { CommerceAction, CommerceResponse } from './types'

export type { CommerceAction, CommerceResponse } from './types'
export type { StoreProduct, Wallet, WalletTransaction, InventoryItem } from './types'

async function authHeaders(): Promise<Record<string, string> | null> {
  const supabase = getSupabaseBrowserClient()
  if (!supabaseUrl || !supabaseAnonKey) return null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
    'X-Site-Id': getSiteId(),
  }

  if (supabase) {
    const { data } = await supabase.auth.getSession()
    headers.Authorization = `Bearer ${data.session?.access_token ?? supabaseAnonKey}`
  } else {
    headers.Authorization = `Bearer ${supabaseAnonKey}`
  }

  return headers
}

export async function invokeCommerceAction(action: CommerceAction): Promise<CommerceResponse> {
  const headers = await authHeaders()
  if (!headers) return { error: 'offline' }

  const res = await fetch(`${supabaseUrl}/functions/v1/commerce`, {
    method: 'POST',
    headers,
    body: JSON.stringify(action),
  })

  const body = (await res.json().catch(() => ({}))) as CommerceResponse
  if (!res.ok && !body.error) {
    return { error: `http_${res.status}` }
  }
  return body
}

/** Stripe webhook is server-only — POST /functions/v1/stripe-webhook */
