import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

export const STARTING_RATING = 1000
export const AI_OPPONENT_RATING = 1000
export const K_FACTOR = 32
export const MIN_RATING = 0

export function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400))
}

export function ratingDelta(playerRating: number, won: boolean): number {
  const score = won ? 1 : 0
  const expected = expectedScore(playerRating, AI_OPPONENT_RATING)
  return Math.round(K_FACTOR * (score - expected))
}

export function nextRating(currentRating: number, won: boolean): number {
  return Math.max(MIN_RATING, currentRating + ratingDelta(currentRating, won))
}

type RankingRow = {
  rating: number
  wins: number
  losses: number
}

export async function applyRankedMatchResult(
  admin: ReturnType<typeof createClient>,
  params: {
    userId: string
    siteId: string
    won: boolean
  },
): Promise<{ rating: number; delta: number }> {
  const { data: existing, error: loadError } = await admin
    .from('player_rankings')
    .select('user_id, site_id, rating, wins, losses, games_played')
    .eq('user_id', params.userId)
    .eq('site_id', params.siteId)
    .maybeSingle()

  if (loadError) throw new Error(loadError.message)

  const currentRating = existing?.rating ?? STARTING_RATING
  const delta = ratingDelta(currentRating, params.won)
  const rating = nextRating(currentRating, params.won)
  const wins = (existing?.wins ?? 0) + (params.won ? 1 : 0)
  const losses = (existing?.losses ?? 0) + (params.won ? 0 : 1)
  const gamesPlayed = wins + losses
  const now = new Date().toISOString()

  const { error: upsertError } = await admin.from('player_rankings').upsert(
    {
      user_id: params.userId,
      site_id: params.siteId,
      rating,
      wins,
      losses,
      games_played: gamesPlayed,
      updated_at: now,
      ...(existing ? {} : { created_at: now }),
    },
    { onConflict: 'user_id,site_id' },
  )

  if (upsertError) throw new Error(upsertError.message)

  return { rating, delta }
}
