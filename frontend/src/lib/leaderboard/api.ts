import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'
import { getSiteId } from '@/lib/site'

import type { LeaderboardAction, LeaderboardResponse } from './types'

export type { LeaderboardAction, LeaderboardEntry, LeaderboardResponse, LeaderboardViewer } from './types'

async function authHeaders(): Promise<Record<string, string> | null> {
  if (!isSupabaseConfigured()) return null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
    'X-Site-Id': getSiteId(),
  }

  const supabase = getSupabaseBrowserClient()
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    headers.Authorization = `Bearer ${data.session?.access_token ?? supabaseAnonKey}`
  } else {
    headers.Authorization = `Bearer ${supabaseAnonKey}`
  }

  return headers
}

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const headers = await authHeaders()
  if (!headers) return { top: [], viewer: null, nearby: null, totalRanked: 0, error: 'offline' }

  const res = await fetch(`${supabaseUrl}/functions/v1/leaderboard`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type: 'get' } satisfies LeaderboardAction),
  })

  const body = (await res.json().catch(() => ({}))) as LeaderboardResponse
  if (!res.ok && !body.error) {
    return { top: [], viewer: null, nearby: null, totalRanked: 0, error: `http_${res.status}` }
  }
  return body
}
