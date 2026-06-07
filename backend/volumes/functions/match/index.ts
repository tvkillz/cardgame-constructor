import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import {
  createMatch,
  runBattleSequence,
  runEndTurnSequence,
  playCardToBoard,
  checkWinner,
  startNextHeroTurn,
  shuffleDeck,
  VILLAIN_DECK_SIZE,
  type MatchCardInstance,
  type MatchState,
} from './engine.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-site-id',
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  })
}

function stripState(state: MatchState) {
  return state
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

async function loadMatch(admin: ReturnType<typeof createClient>, matchId: string, userId: string) {
  const { data, error } = await admin
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data
}

async function saveMatch(
  admin: ReturnType<typeof createClient>,
  matchId: string,
  patch: Record<string, unknown>,
) {
  const { data, error } = await admin
    .from('matches')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .select('id, revision, state, last_combat, villain_plays, turn, phase, winner, status')
    .single()
  if (error) throw error
  return data
}

type CardRow = { slug: string; mana: number; attack: number; health: number }
type DeckBuildResult =
  | { ok: true; instances: MatchCardInstance[] }
  | { ok: false; code: string; message: string }

function cardFromJoin(raw: unknown): CardRow | null {
  if (!raw) return null
  const c = Array.isArray(raw) ? raw[0] : raw
  if (!c || typeof c !== 'object') return null
  const row = c as Record<string, unknown>
  if (typeof row.slug !== 'string') return null
  return {
    slug: row.slug,
    mana: Number(row.mana ?? 0),
    attack: Number(row.attack ?? 0),
    health: Number(row.health ?? 0),
  }
}

function expandInstances(
  entries: { card: CardRow; quantity: number }[],
): MatchCardInstance[] {
  const instances: MatchCardInstance[] = []
  let n = 0
  for (const { card, quantity } of entries) {
    for (let i = 0; i < quantity; i += 1) {
      instances.push({
        instanceId: `${card.slug}-${n}`,
        slug: card.slug,
        mana: card.mana,
        attack: card.attack,
        health: card.health,
        maxHealth: card.health,
      })
      n += 1
    }
  }
  return instances
}

async function buildHeroDeck(
  admin: ReturnType<typeof createClient>,
  deckId: string,
  userId: string,
): Promise<DeckBuildResult> {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRe.test(deckId)) {
    return {
      ok: false,
      code: 'deck_not_synced',
      message:
        'This deck exists only in the browser. Open Portal → Collection, save the deck, then try again.',
    }
  }

  const { data: deck, error: deckErr } = await admin
    .from('player_decks')
    .select('id, player_deck_cards(card_id, quantity, cards(slug, mana, attack, health))')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle()

  if (deckErr) {
    console.error('buildHeroDeck query error', deckErr)
    return { ok: false, code: 'deck_query_failed', message: deckErr.message }
  }
  if (!deck) {
    return {
      ok: false,
      code: 'deck_not_found',
      message: 'Deck not found for this account.',
    }
  }

  const joined: { card: CardRow; quantity: number }[] = []
  for (const row of deck.player_deck_cards ?? []) {
    const card = cardFromJoin(row.cards)
    if (!card) continue
    joined.push({ card, quantity: row.quantity })
  }

  if (joined.length > 0) {
    const instances = expandInstances(joined)
    if (instances.length > 0) return { ok: true, instances }
  }

  const { data: deckCards, error: dcErr } = await admin
    .from('player_deck_cards')
    .select('card_id, quantity')
    .eq('deck_id', deckId)

  if (dcErr || !deckCards?.length) {
    return {
      ok: false,
      code: 'deck_empty',
      message:
        'Deck has no cards in the database. Add cards in Collection and save the deck.',
    }
  }

  const cardIds = [...new Set(deckCards.map((r) => r.card_id as string))]
  const { data: catalogCards, error: catErr } = await admin
    .from('cards')
    .select('id, slug, mana, attack, health')
    .in('id', cardIds)

  if (catErr || !catalogCards?.length) {
    return {
      ok: false,
      code: 'cards_missing',
      message:
        'Deck references cards that are not in the catalog. Run seed:cards:upload on the server.',
    }
  }

  const byId = new Map(catalogCards.map((c) => [c.id as string, c]))
  const fallback: { card: CardRow; quantity: number }[] = []
  for (const row of deckCards) {
    const c = byId.get(row.card_id as string)
    if (!c) continue
    fallback.push({
      card: {
        slug: c.slug as string,
        mana: Number(c.mana),
        attack: Number(c.attack),
        health: Number(c.health),
      },
      quantity: row.quantity as number,
    })
  }

  const instances = expandInstances(fallback)
  if (instances.length === 0) {
    return {
      ok: false,
      code: 'deck_empty',
      message: 'Could not resolve any cards for this deck.',
    }
  }

  return { ok: true, instances }
}

async function buildVillainDeck(admin: ReturnType<typeof createClient>, siteId: string) {
  const { data: cards } = await admin
    .from('cards')
    .select('slug, mana, attack, health')
    .eq('published', true)
    .eq('site_id', siteId)

  if (!cards?.length) return []

  const pool: {
    instanceId: string
    slug: string
    mana: number
    attack: number
    health: number
    maxHealth: number
  }[] = []

  let n = 0
  while (pool.length < VILLAIN_DECK_SIZE) {
    const c = cards[Math.floor(Math.random() * cards.length)]
    pool.push({
      instanceId: `villain-${c.slug}-${n}`,
      slug: c.slug,
      mana: c.mana,
      attack: c.attack,
      health: c.health,
      maxHealth: c.health,
    })
    n += 1
  }
  return pool
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type, x-site-id',
      },
    })
  }

  try {
    const userId = await getUserId(req)
    if (!userId) return jsonResponse({ error: 'unauthorized' }, 401)

    const siteId = siteIdFromRequest(req)
    if (!siteId) return jsonResponse({ error: 'missing_site_id' }, 400)

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const body = await req.json()
    const action = body?.type as string

    const siteOk = await assertSiteAccess(admin, userId, siteId)
    if (!siteOk) {
      if (action === 'get_active') return jsonResponse({ match: null })
      return jsonResponse({ error: 'site_forbidden' }, 403)
    }

    if (action === 'get_active') {
      const { data } = await admin
        .from('matches')
        .select('id, player_deck_id, mode, status, turn, phase, winner, state, revision, last_combat, villain_plays')
        .eq('user_id', userId)
        .eq('site_id', siteId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return jsonResponse({ match: data ?? null })
    }

    if (action === 'get') {
      const row = await loadMatch(admin, body.matchId, userId)
      if (!row) return jsonResponse({ error: 'match not found' }, 404)
      return jsonResponse({
        matchId: row.id,
        revision: row.revision,
        state: row.state,
        last_combat: row.last_combat,
        villain_plays: row.villain_plays,
        match: row,
      })
    }

    if (action === 'create') {
      const built = await buildHeroDeck(admin, body.deckId, userId)
      if (!built.ok) {
        return jsonResponse({ error: built.code, message: built.message }, 400)
      }
      const heroInstances = built.instances

      const villainInstances = await buildVillainDeck(admin, siteId)
      const matchState = createMatch(shuffleDeck(heroInstances), shuffleDeck(villainInstances))
      const persisted = stripState(matchState)

      const { data, error } = await admin
        .from('matches')
        .insert({
          user_id: userId,
          site_id: siteId,
          player_deck_id: body.deckId,
          mode: body.mode ?? 'casual',
          state: persisted,
          turn: matchState.turn,
          phase: matchState.phase,
        })
        .select('id, revision, state')
        .single()

      if (error) return jsonResponse({ error: error.message }, 500)

      await admin.rpc('match_abandon_others', { p_user_id: userId, p_keep_id: data.id })

      return jsonResponse({ matchId: data.id, revision: data.revision, state: data.state })
    }

    const matchId = body.matchId as string
    const row = await loadMatch(admin, matchId, userId)
    if (!row || row.status !== 'active') return jsonResponse({ error: 'match not found' }, 404)

    let state = row.state as MatchState

    if (action === 'play_card') {
      const result = playCardToBoard(state, 'hero', body.instanceId, body.slotIndex)
      if (!result) return jsonResponse({ error: 'invalid play' }, 400)
      state = result.state
      const saved = await saveMatch(admin, matchId, {
        state: stripState(state),
        turn: state.turn,
        phase: state.phase,
        revision: row.revision + 1,
      })
      return jsonResponse({
        matchId,
        revision: saved.revision,
        state: saved.state,
        freeze: result.freeze,
      })
    }

    if (action === 'end_turn') {
      const result = runEndTurnSequence(state)
      if (!result) return jsonResponse({ error: 'invalid phase' }, 400)

      const winner = checkWinner(result.state)
      const finalState = winner
        ? { ...result.state, phase: 'ended' as const, winner }
        : { ...result.state, phase: 'combat' as const }

      const saved = await saveMatch(admin, matchId, {
        state: stripState(finalState),
        turn: finalState.turn,
        phase: finalState.phase,
        winner: finalState.winner,
        last_combat: result.combat,
        villain_plays: result.villainPlays,
        revision: row.revision + 1,
        status: winner ? 'completed' : 'active',
        completed_at: winner ? new Date().toISOString() : null,
      })

      return jsonResponse({
        matchId,
        revision: saved.revision,
        state: saved.state,
        combat: result.combat,
        villainPlays: result.villainPlays,
        endTurn: {
          afterMana: stripState(result.afterMana),
          afterVillain: stripState(result.afterVillain),
          villainPlays: result.villainPlays,
          state: stripState(result.state),
          combat: result.combat,
          villainManaBefore: result.villainManaBefore,
        },
      })
    }

    if (action === 'battle') {
      const result = runBattleSequence(state)
      if (!result) return jsonResponse({ error: 'invalid phase' }, 400)

      const winner = checkWinner(result.state)
      const finalState = winner
        ? { ...result.state, phase: 'ended' as const, winner, heroCombatDone: false }
        : { ...result.state, phase: 'hero_main' as const, heroCombatDone: true }

      const saved = await saveMatch(admin, matchId, {
        state: stripState(finalState),
        phase: finalState.phase,
        winner: finalState.winner,
        last_combat: result.combat,
        villain_plays: null,
        revision: row.revision + 1,
        status: winner ? 'completed' : 'active',
        completed_at: winner ? new Date().toISOString() : null,
      })

      return jsonResponse({
        matchId,
        revision: saved.revision,
        state: saved.state,
        combat: result.combat,
      })
    }

    if (action === 'ack_combat') {
      if (state.winner || state.phase === 'ended') {
        return jsonResponse({ matchId, revision: row.revision, state: stripState(state) })
      }

      if (state.phase === 'hero_main' && state.heroCombatDone) {
        const saved = await saveMatch(admin, matchId, {
          state: stripState(state),
          phase: 'hero_main',
          last_combat: null,
          revision: row.revision + 1,
        })
        return jsonResponse({ matchId, revision: saved.revision, state: saved.state })
      }

      if (state.phase !== 'combat') {
        return jsonResponse({ error: 'invalid phase' }, 400)
      }

      const next = startNextHeroTurn(state)
      const saved = await saveMatch(admin, matchId, {
        state: stripState(next),
        turn: next.turn,
        phase: next.phase,
        last_combat: null,
        villain_plays: null,
        revision: row.revision + 1,
      })
      return jsonResponse({ matchId, revision: saved.revision, state: saved.state })
    }

    if (action === 'abandon') {
      await saveMatch(admin, matchId, { status: 'abandoned', revision: row.revision + 1 })
      return jsonResponse({ ok: true })
    }

    return jsonResponse({ error: 'unknown action' }, 400)
  } catch (e) {
    console.error(e)
    return jsonResponse({ error: String(e) }, 500)
  }
})
