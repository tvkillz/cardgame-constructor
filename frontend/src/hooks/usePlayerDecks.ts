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

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [all, list] = await Promise.all([
        fetchPlayerDecks(userId),
        fetchDeckSummaries(userId),
      ])
      setDecks(all)
      setSummaries(list)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { decks, summaries, loading, refresh, userId }
}
