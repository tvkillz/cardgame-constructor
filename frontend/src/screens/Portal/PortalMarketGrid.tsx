'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import gameConfig from '@project/game-config'
import BuyCardModal from '@/components/market/BuyCardModal'
import MarketToast from '@/components/market/MarketToast'
import { Button } from '@/components/ui/Button/Button'
import { useCardCatalog } from '@/hooks/useCardCatalog'
import { useMarketCart } from '@/hooks/useMarketCart'
import type { CardRarity, CardRecord } from '@/lib/cards/types'
import { MARKET_SORT_OPTIONS, sortMarketCards, type MarketSort } from '@/lib/market/sort'
import MarketCard from './MarketCard'
import './PortalMarketGrid.css'

const GRID_COLUMNS = 5
const ROWS_PER_PAGE = 4
const PAGE_SIZE = GRID_COLUMNS * ROWS_PER_PAGE

const RARITIES: CardRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

function rarityLabel(rarity: CardRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

export default function PortalMarketGrid() {
  const { cards: catalog, loading } = useCardCatalog()
  const { addItem } = useMarketCart()
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all')
  const [sort, setSort] = useState<MarketSort>('rarity')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [buyCard, setBuyCard] = useState<CardRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const domains = useMemo(() => {
    const fromConfig = (gameConfig.domains ?? []).map((d: { id: string; label: string }) => d.id)
    if (fromConfig.length) return fromConfig
    return [...new Set(catalog.map((c) => c.domain))].sort()
  }, [catalog])

  const domainLabels = useMemo(
    () => (gameConfig.domainLabels as Record<string, string>) ?? {},
    [],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matched = catalog.filter((card) => {
      if (domainFilter !== 'all' && card.domain !== domainFilter) return false
      if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false
      if (query && !card.title.toLowerCase().includes(query)) return false
      return true
    })
    return sortMarketCards(matched, sort)
  }, [catalog, domainFilter, rarityFilter, search, sort])

  const visibleCards = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  )

  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [domainFilter, rarityFilter, search, sort])

  const handleCreditPurchased = useCallback((card: CardRecord) => {
    setToastMessage(`${card.title} added to your collection`)
  }, [])

  const handleAddToCart = useCallback(
    (card: CardRecord) => {
      addItem(card)
    },
    [addItem],
  )

  if (loading && catalog.length === 0) {
    return (
      <p className="portal-market-grid__loading" role="status" aria-live="polite">
        Loading catalog…
      </p>
    )
  }

  return (
    <div className="portal-market">
      <MarketToast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <div className="portal-market__toolbar" role="search">
        <label className="portal-market__search">
          <span className="visually-hidden">Search cards by title</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label className="portal-market__select-wrap">
          <span className="visually-hidden">Filter by domain</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            aria-label="Domain"
          >
            <option value="all">All domains</option>
            {domains.map((domainId) => (
              <option key={domainId} value={domainId}>
                {domainLabels[domainId] ?? domainId}
              </option>
            ))}
          </select>
        </label>

        <label className="portal-market__select-wrap">
          <span className="visually-hidden">Filter by type</span>
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as CardRarity | 'all')}
            aria-label="Card type"
          >
            <option value="all">All types</option>
            {RARITIES.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarityLabel(rarity)}
              </option>
            ))}
          </select>
        </label>

        <label className="portal-market__select-wrap">
          <span className="visually-hidden">Sort cards</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MarketSort)}
            aria-label="Sort by"
          >
            {MARKET_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="portal-market__count" aria-live="polite">
        Showing {visibleCards.length} of {filtered.length} card{filtered.length === 1 ? '' : 's'}
      </p>

      {filtered.length === 0 ? (
        <p className="portal-market-grid__loading">No cards match your search or filters.</p>
      ) : (
        <>
          <div className="portal-market-grid" aria-label="Card market catalog">
            {visibleCards.map((card, index) => (
              <MarketCard
                key={card.id}
                card={card}
                index={index}
                onBuyCredits={setBuyCard}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <BuyCardModal
            card={buyCard}
            onClose={() => setBuyCard(null)}
            onPurchased={() => {
              if (buyCard) handleCreditPurchased(buyCard)
            }}
          />

          {hasMore ? (
            <div className="portal-market__load-more">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
