'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/components/providers/AuthProvider'
import {
  fetchPlayerInventory,
  ownedQuantityMap,
  type OwnedCardLine,
} from '@/lib/inventory/queries'

let cache: OwnedCardLine[] | null = null
let inflight: Promise<OwnedCardLine[]> | null = null

export function usePlayerInventory() {
  const { user, session } = useAuth()
  const userId = user?.id ?? session?.user?.id ?? 'guest'
  const [lines, setLines] = useState<OwnedCardLine[]>(() => cache ?? [])
  const [loading, setLoading] = useState(() => cache === null)

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true)
      try {
        const next = await fetchPlayerInventory(userId)
        cache = next
        setLines(next)
      } finally {
        if (!options?.silent) setLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    if (cache) {
      setLines(cache)
      setLoading(false)
      return
    }
    if (inflight) {
      void inflight.then((next) => {
        setLines(next)
        setLoading(false)
      })
      return
    }
    inflight = refresh()
    void inflight.finally(() => {
      inflight = null
    })
  }, [refresh])

  const ownedBySlug = ownedQuantityMap(lines)

  const getOwned = useCallback((slug: string) => ownedBySlug.get(slug) ?? 0, [ownedBySlug])

  return { lines, ownedBySlug, getOwned, loading, refresh }
}

export function prefetchPlayerInventory(userId: string): Promise<OwnedCardLine[]> {
  if (cache) return Promise.resolve(cache)
  if (inflight) return inflight
  inflight = fetchPlayerInventory(userId).then((next) => {
    cache = next
    return next
  })
  return inflight.finally(() => {
    inflight = null
  })
}
