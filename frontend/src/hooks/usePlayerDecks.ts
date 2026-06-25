'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/components/providers/AuthProvider'
import {
  fetchDeckSummaries,
  fetchPlayerDecks,
  type DeckSummary,
  type PlayerDeck,
} from '@/lib/decks'

export function usePlayerDecks() {
  const { user, session } = useAuth()
  const userId = user?.id ?? session?.user?.id ?? 'guest'
  const [decks, setDecks] = useState<PlayerDeck[]>([])
  const [summaries, setSummaries] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true)
    try {
      const [all, list] = await Promise.all([
        fetchPlayerDecks(userId),
        fetchDeckSummaries(userId),
      ])
      setDecks(all)
      setSummaries(list)
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [userId])

  const replaceDeck = useCallback((deck: PlayerDeck) => {
    setDecks((prev) => prev.map((d) => (d.id === deck.id ? deck : d)))
    setSummaries((prev) =>
      prev.map((s) =>
        s.id === deck.id
          ? {
              id: deck.id,
              name: deck.name,
              cards: deck.cards.reduce((sum, c) => sum + c.quantity, 0),
              maxCards: deck.maxCards,
            }
          : s,
      ),
    )
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { decks, summaries, loading, refresh, replaceDeck, userId }
}
