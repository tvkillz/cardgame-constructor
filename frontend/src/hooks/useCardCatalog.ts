'use client'

import { useEffect, useState } from 'react'

import { CARDS_CATALOG, fetchPublishedCards } from '@/lib/cards'
import type { CardRecord } from '@/lib/cards/types'

/** Live catalog from Supabase when available; falls back to generated `public/data/cards-catalog.json`. */
export function useCardCatalog(): CardRecord[] {
  const [cards, setCards] = useState<CardRecord[]>(CARDS_CATALOG)

  useEffect(() => {
    let cancelled = false
    void fetchPublishedCards().then((live) => {
      if (!cancelled && live.length > 0) setCards(live)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return cards
}
