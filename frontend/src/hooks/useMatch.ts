'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { CardRecord } from '@/lib/cards/types'
import { preloadArenaHand } from '@/lib/cards'
import type { HandDeckEntry } from '@/lib/decks/buildHand'
import { checkWinner, firstEmptySlot } from '@/lib/game/match'
import type { BoardUnit, CombatRoundResult, MatchState } from '@/lib/game/match/types'
import { fetchMatchRow, invokeMatchAction } from '@/lib/matches/api'
import {
  endTurnFromApi,
  MATCH_SYNC_INTERVAL_MS,
  rowToMatchState,
  type EndTurnSnapshots,
  type MatchDbRow,
} from '@/lib/matches/sync'
import { useAuth } from '@/components/providers/AuthProvider'

export interface UseMatchOptions {
  deckEntries: HandDeckEntry[]
  catalog: CardRecord[]
  deckId: string
  mode?: string
  resumeMatchId?: string | null
}

export interface BoardSnapshot {
  hero: (BoardUnit | null)[]
  villain: (BoardUnit | null)[]
}

function captureBoardSnapshot(state: MatchState): BoardSnapshot {
  return {
    hero: state.hero.board.map((u) => (u ? { ...u } : null)),
    villain: state.villain.board.map((u) => (u ? { ...u } : null)),
  }
}

function apiErrorMessage(res: { error?: string; message?: string }, fallback: string): string {
  const msg = res.message?.trim()
  if (msg) return msg
  const code = res.error?.trim()
  if (code && code !== 'invalid deck') return code.replaceAll('_', ' ')
  return fallback
}

export function useMatch({
  catalog,
  deckId,
  mode = 'casual',
  resumeMatchId,
}: UseMatchOptions) {
  const { user } = useAuth()
  const [state, setState] = useState<MatchState | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [combatResult, setCombatResult] = useState<CombatRoundResult | null>(null)
  const [combatBoardSnapshot, setCombatBoardSnapshot] = useState<BoardSnapshot | null>(null)
  const [endTurnVisual, setEndTurnVisual] = useState<EndTurnSnapshots | null>(null)
  const [processing, setProcessing] = useState(false)
  const [serverOnline, setServerOnline] = useState(true)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  /** Попап победы/поражения — не сбрасывается автоматически после VFX. */
  const [matchEnded, setMatchEnded] = useState(false)

  const revisionRef = useRef(0)
  const matchIdRef = useRef<string | null>(null)
  const blockRemoteApplyRef = useRef(false)
  const heroOnlyCombatAckRef = useRef(false)

  useEffect(() => {
    matchIdRef.current = matchId
  }, [matchId])

  useEffect(() => {
    blockRemoteApplyRef.current =
      Boolean(endTurnVisual) || (Boolean(combatResult) && Boolean(combatBoardSnapshot))
  }, [endTurnVisual, combatResult, combatBoardSnapshot])

  const applyFromRow = useCallback(
    (row: MatchDbRow, options?: { combat?: CombatRoundResult | null }) => {
      const hydrated = rowToMatchState(row, catalog)
      setState(hydrated)
      revisionRef.current = row.revision
      setRevision(row.revision)

      const combat = options?.combat ?? row.last_combat
      // Не возобновляем бой поверх экрана окончания матча (синк с last_combat).
      if (
        combat &&
        !hydrated.winner &&
        (hydrated.phase === 'combat' || hydrated.phase === 'ended')
      ) {
        setCombatResult(combat)
      }
      if (hydrated.winner) {
        setMatchEnded(true)
      }
    },
    [catalog],
  )

  const preloadHeroHand = useCallback(async (match: MatchState) => {
    const hand = match.hero.hand
      .map((c) => c.display)
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
    if (hand.length === 0) return
    await preloadArenaHand(
      hand.map((d) => ({ ...d, id: d.id, thumbUrl: d.thumbUrl, artUrl: d.artUrl })),
    )
  }, [])

  useEffect(() => {
    if (catalog.length === 0) {
      setBooting(false)
      setBootError('Card catalog not loaded.')
      return
    }

    if (!user?.id) {
      setBooting(false)
      setBootError('Sign in to play a ranked match on the server.')
      return
    }

    if (!resumeMatchId && !deckId) {
      setBooting(false)
      setBootError('No deck selected.')
      return
    }

    let cancelled = false

    async function boot() {
      setBooting(true)
      setBootError(null)

      const supabaseProbe = await invokeMatchAction({ type: 'get_active' })
      if (supabaseProbe.error === 'offline') {
        setServerOnline(false)
        setBootError(
          'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart the dev server.',
        )
        setBooting(false)
        return
      }
      setServerOnline(true)

      if (resumeMatchId) {
        const res = await invokeMatchAction({ type: 'get', matchId: resumeMatchId })
        if (cancelled) return

        const row = res.match as MatchDbRow | undefined
        if (row?.state) {
          const hydrated = rowToMatchState(row, catalog)
          await preloadHeroHand(hydrated)
          setMatchId(resumeMatchId)
          setMatchEnded(Boolean(hydrated.winner))
          applyFromRow(row)
          setBooting(false)
          return
        }
        setBootError(apiErrorMessage(res, 'Could not resume match.'))
        setBooting(false)
        return
      }

      const created = await invokeMatchAction({ type: 'create', deckId, mode })
      if (cancelled) return

      if (created.matchId && created.state) {
        const hydrated = rowToMatchState(
          {
            id: created.matchId,
            revision: created.revision ?? 1,
            state: created.state,
            last_combat: null,
          },
          catalog,
        )
        await preloadHeroHand(hydrated)
        setMatchId(created.matchId)
        setMatchEnded(false)
        applyFromRow({
          id: created.matchId,
          revision: created.revision ?? 1,
          state: created.state,
          last_combat: null,
        })
        setBooting(false)
        return
      }

      setBootError(
        apiErrorMessage(
          created,
          'Match server unavailable. Apply matches.sql, deploy the match edge function, and restart Docker.',
        ),
      )
      setBooting(false)
    }

    void boot()
    return () => {
      cancelled = true
    }
  }, [catalog, deckId, mode, resumeMatchId, user?.id, applyFromRow, preloadHeroHand])

  useEffect(() => {
    const id = matchId
    if (!id) return

    const sync = async () => {
      const row = await fetchMatchRow(id)
      if (!row || !row.state) {
        setServerOnline(false)
        return
      }

      setLastSyncedAt(Date.now())
      setServerOnline(true)

      if (blockRemoteApplyRef.current) return

      const dbRow: MatchDbRow = {
        id: row.id,
        revision: row.revision,
        state: row.state as MatchDbRow['state'],
        last_combat: row.last_combat as CombatRoundResult | null,
      }

      if (dbRow.revision < revisionRef.current) return

      applyFromRow(dbRow)
    }

    const timer = window.setInterval(() => void sync(), MATCH_SYNC_INTERVAL_MS)
    void sync()

    return () => window.clearInterval(timer)
  }, [matchId, applyFromRow])

  const beginCombatPhase = useCallback(
    (
      boardBefore: MatchState,
      afterCombat: MatchState,
      combat: CombatRoundResult,
      winner: MatchState['winner'],
    ) => {
      setCombatBoardSnapshot(captureBoardSnapshot(boardBefore))
      setState({
        ...afterCombat,
        phase: winner ? 'ended' : 'combat',
        winner: winner ?? afterCombat.winner,
        hero: { ...afterCombat.hero, board: boardBefore.hero.board },
        villain: { ...afterCombat.villain, board: boardBefore.villain.board },
      })
      setCombatResult(combat)
      if (winner) {
        setMatchEnded(true)
      }
    },
    [],
  )

  const completeEndTurnVisual = useCallback(
    (endTurn: EndTurnSnapshots) => {
      heroOnlyCombatAckRef.current = false
      const winner =
        endTurn.state.hero.hp <= 0
          ? 'villain'
          : endTurn.state.villain.hp <= 0
            ? 'hero'
            : null
      beginCombatPhase(endTurn.afterVillain, endTurn.state, endTurn.combat, winner)
      setEndTurnVisual(null)
    },
    [beginCombatPhase],
  )

  const clearEndTurnVisual = useCallback(() => {
    setEndTurnVisual(null)
    setProcessing(false)
  }, [])

  const clearCombatVisual = useCallback(() => {
    setCombatResult(null)
    setCombatBoardSnapshot(null)
  }, [])

  const playHeroCard = useCallback(
    async (instanceId: string) => {
      if (!state || !matchId || state.phase !== 'hero_main' || state.winner || processing) return null

      const slot = firstEmptySlot(state.hero.board)
      if (slot === null) return null

      setActionError(null)
      setProcessing(true)

      const res = await invokeMatchAction({
        type: 'play_card',
        matchId,
        instanceId,
        slotIndex: slot,
      })

      setProcessing(false)

      if (res.error === 'offline') {
        setServerOnline(false)
        setActionError('Match server offline — check Supabase env vars.')
        return null
      }

      if (res.state && res.revision !== undefined) {
        applyFromRow({
          id: matchId,
          revision: res.revision,
          state: res.state,
          last_combat: null,
        })
        return res.freeze ?? null
      }

      setActionError(apiErrorMessage(res, 'Play card failed.'))
      return null
    },
    [state, matchId, processing, applyFromRow],
  )

  const endHeroTurn = useCallback(async () => {
    if (!state || !matchId || state.phase !== 'hero_main' || state.winner || processing) return

    setActionError(null)
    setProcessing(true)

    const res = await invokeMatchAction({ type: 'end_turn', matchId })

    if (!res.endTurn) {
      setProcessing(false)
      setActionError(apiErrorMessage(res, 'End turn failed.'))
      return
    }

    if (res.revision !== undefined) {
      revisionRef.current = res.revision
      setRevision(res.revision)
    }

    const snapshots = endTurnFromApi(res.endTurn, catalog)
    setState(snapshots.afterMana)
    setEndTurnVisual(snapshots)
  }, [state, matchId, processing, catalog])

  const startBattle = useCallback(async () => {
    if (!state || !matchId || state.phase !== 'hero_main' || state.winner || processing) return
    if (state.heroCombatDone) return

    setActionError(null)
    setProcessing(true)

    const res = await invokeMatchAction({ type: 'battle', matchId })

    if (!res.state || !res.combat) {
      setProcessing(false)
      setActionError(apiErrorMessage(res, 'Battle failed.'))
      return
    }

    if (res.revision !== undefined) {
      revisionRef.current = res.revision
      setRevision(res.revision)
    }

    const afterCombat = rowToMatchState(
      { id: matchId, revision: res.revision ?? revisionRef.current, state: res.state, last_combat: res.combat },
      catalog,
    )
    const winner = afterCombat.winner ?? checkWinner(afterCombat)
    heroOnlyCombatAckRef.current = !winner && afterCombat.phase === 'hero_main'
    beginCombatPhase(state, afterCombat, res.combat, winner)
  }, [state, matchId, processing, catalog, beginCombatPhase])

  const acknowledgeCombat = useCallback(async () => {
    const heroOnlyAck = heroOnlyCombatAckRef.current
    heroOnlyCombatAckRef.current = false

    const finishCombat = () => {
      setCombatResult(null)
      setCombatBoardSnapshot(null)
    }

    if (!matchId) {
      finishCombat()
      setProcessing(false)
      return
    }

    if (state?.winner || state?.phase === 'ended') {
      setMatchEnded(true)
      const res = await invokeMatchAction({ type: 'ack_combat', matchId })
      if (res.state && res.revision !== undefined) {
        applyFromRow({
          id: matchId,
          revision: res.revision,
          state: res.state,
          last_combat: null,
        })
      }
      finishCombat()
      setProcessing(false)
      return
    }

    setActionError(null)
    const res = await invokeMatchAction({ type: 'ack_combat', matchId })

    if (res.state && res.revision !== undefined) {
      applyFromRow({
        id: matchId,
        revision: res.revision,
        state: res.state,
        last_combat: null,
      })
      finishCombat()
      setProcessing(false)
      if (heroOnlyAck) {
        blockRemoteApplyRef.current = false
      }
      return
    }

    finishCombat()
    setProcessing(false)
    setActionError(apiErrorMessage(res, heroOnlyAck ? 'Could not resume main phase.' : 'Could not start next turn.'))
  }, [state, matchId, applyFromRow])

  return {
    state,
    matchId,
    revision,
    booting,
    bootError,
    actionError,
    processing,
    serverOnline,
    lastSyncedAt,
    matchEnded,
    combatResult,
    combatBoardSnapshot,
    endTurnVisual,
    playHeroCard,
    endHeroTurn,
    startBattle,
    acknowledgeCombat,
    completeEndTurnVisual,
    clearEndTurnVisual,
    clearCombatVisual,
  }
}
