import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const TOP_LIMIT = 100
const NEARBY_WINDOW = 5
const NEARBY_RADIUS = Math.floor(NEARBY_WINDOW / 2)

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-site-id',
}

type RankingRow = {
  user_id: string
  rating: number
  wins: number
  losses: number
  games_played: number
  updated_at: string
}

type LeaderboardEntry = {
  rank: number
  userId: string
  username: string
  rating: number
  wins: number
  losses: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
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
  return local.slice(sepIdx + 1) || null
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

function compareRankings(a: RankingRow, b: RankingRow): number {
  if (b.rating !== a.rating) return b.rating - a.rating
  return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
}

function rankEntries(rows: RankingRow[]): Map<string, number> {
  const sorted = [...rows].sort(compareRankings)
  const ranks = new Map<string, number>()
  sorted.forEach((row, index) => {
    ranks.set(row.user_id, index + 1)
  })
  return ranks
}

async function loadUsernames(
  admin: ReturnType<typeof createClient>,
  userIds: string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (!unique.length) return new Map()

  const { data, error } = await admin.from('profiles').select('id, username').in('id', unique)
  if (error) throw error

  const map = new Map<string, string>()
  for (const row of data ?? []) {
    const username = typeof row.username === 'string' && row.username.trim() ? row.username.trim() : 'Unknown'
    map.set(row.id, username)
  }
  return map
}

function toEntry(
  row: RankingRow,
  rank: number,
  usernames: Map<string, string>,
): LeaderboardEntry {
  return {
    rank,
    userId: row.user_id,
    username: usernames.get(row.user_id) ?? 'Unknown',
    rating: row.rating,
    wins: row.wins,
    losses: row.losses,
  }
}

function nearbyRange(viewerRank: number, totalRanked: number): { start: number; end: number } {
  if (totalRanked <= NEARBY_WINDOW) {
    return { start: 1, end: totalRanked }
  }

  let start = Math.max(1, viewerRank - NEARBY_RADIUS)
  let end = start + NEARBY_WINDOW - 1
  if (end > totalRanked) {
    end = totalRanked
    start = Math.max(1, end - NEARBY_WINDOW + 1)
  }
  return { start, end }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method not allowed' }, 405)
  }

  try {
    const siteId = siteIdFromRequest(req)
    if (!siteId) return json({ error: 'missing site id' }, 400)

    const userId = await getUserId(req)
    if (!userId) return json({ error: 'unauthorized' }, 401)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    if (!(await assertSiteAccess(admin, userId, siteId))) {
      return json({ error: 'forbidden' }, 403)
    }

    const body = await req.json().catch(() => ({}))
    if (body?.type !== 'get') return json({ error: 'unknown action' }, 400)

    await admin.rpc('ensure_player_ranking', { p_user_id: userId, p_site_id: siteId })

    const { data: ladderRows, error: ladderError } = await admin
      .from('player_rankings')
      .select('user_id, rating, wins, losses, games_played, updated_at')
      .eq('site_id', siteId)
      .order('rating', { ascending: false })
      .order('updated_at', { ascending: true })

    if (ladderError) return json({ error: ladderError.message }, 500)

    const ranked = (ladderRows ?? []) as RankingRow[]
    const ranks = rankEntries(ranked)
    const totalRanked = ranked.length

    const topRows = ranked.slice(0, TOP_LIMIT)
    const viewerRow = ranked.find((row) => row.user_id === userId) ?? null
    const viewerRank = viewerRow ? (ranks.get(userId) ?? null) : null

    let nearbyUserIds: string[] = []
    if (viewerRank != null && viewerRank > TOP_LIMIT && totalRanked > 0) {
      const { start, end } = nearbyRange(viewerRank, totalRanked)
      nearbyUserIds = ranked
        .slice(start - 1, end)
        .map((row) => row.user_id)
    }

    const usernames = await loadUsernames(admin, [
      ...topRows.map((row) => row.user_id),
      ...nearbyUserIds,
      ...(viewerRow ? [userId] : []),
    ])

    const top = topRows.map((row) => toEntry(row, ranks.get(row.user_id) ?? 0, usernames))

    let nearby: LeaderboardEntry[] | null = null
    if (viewerRank != null && viewerRank > TOP_LIMIT) {
      const { start, end } = nearbyRange(viewerRank, totalRanked)
      nearby = ranked
        .slice(start - 1, end)
        .map((row) => toEntry(row, ranks.get(row.user_id) ?? 0, usernames))
    }

    const viewer =
      viewerRow && viewerRank != null
        ? {
            ...toEntry(viewerRow, viewerRank, usernames),
            inTop: viewerRank <= TOP_LIMIT,
          }
        : null

    return json({
      top,
      viewer,
      nearby,
      totalRanked,
    })
  } catch (e) {
    console.error(e)
    return json({ error: String(e) }, 500)
  }
})
