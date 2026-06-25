'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

import Card from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'
import { formatCredits } from '@/config'
import { useMarketCurrency } from '@/hooks/useMarketCurrency'
import { domainLabel } from '@/lib/cards/domains'
import { preloadImage } from '@/lib/cards/preload'
import { toCardDisplayProps } from '@/lib/cards'
import type { CardRecord } from '@/lib/cards/types'
import { formatMarketMoney } from '@/lib/market/currency'
import '@/styles/coin-stack-icon.css'
import '@/styles/cart-icon.css'
import './MarketCard.css'

const PREVIEW_SCALE = 1.25
const PREVIEW_GAP_PX = 12

function rarityLabel(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

type PreviewPosition = {
  top: number
  left: number
  width: number
  height: number
}

function MarketCardHoverPreview({ card, position }: { card: CardRecord; position: PreviewPosition }) {
  const [artReady, setArtReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setArtReady(false)
    void preloadImage(card.artUrl).then(() => {
      if (!cancelled) setArtReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [card.id, card.artUrl])

  const display = artReady ? card : { ...card, artUrl: card.thumbUrl }

  return (
    <div
      className="market-card-popover"
      style={
        {
          '--glow-color': card.glowColor,
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
        } as CSSProperties
      }
    >
      <div className="market-card-preview">
        <Card
          {...toCardDisplayProps(display, 0)}
          totalCards={1}
          fanIndex={0}
          layoutMode="preview"
          showAbility
          showRarity={false}
        />
      </div>
    </div>
  )
}

type MarketCardProps = {
  card: CardRecord
  index: number
  onBuyCredits?: (card: CardRecord) => void
  onAddToCart?: (card: CardRecord) => void
}

export default function MarketCard({ card, index, onBuyCredits, onAddToCart }: MarketCardProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const { currency } = useMarketCurrency()
  const [hovered, setHovered] = useState(false)
  const [previewPos, setPreviewPos] = useState<PreviewPosition | null>(null)
  const [mounted, setMounted] = useState(false)

  const priceCents = card.priceCents ?? 0
  const creditCost = priceCents
  const creditsDisplay = creditCost > 0 ? formatCredits(creditCost) : '—'
  const moneyDisplay = priceCents > 0 ? formatMarketMoney(priceCents, currency) : '—'

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePreviewPosition = () => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return

    const width = rect.width * PREVIEW_SCALE
    const height = rect.height * PREVIEW_SCALE
    const top = rect.top + (rect.height - height) / 2
    let left = rect.left - width - PREVIEW_GAP_PX

    if (left < 8) {
      left = rect.right + PREVIEW_GAP_PX
    }

    const maxLeft = window.innerWidth - width - 8
    if (left > maxLeft) left = maxLeft

    setPreviewPos({ top, left, width, height })
  }

  const showPreview = () => {
    updatePreviewPosition()
    setHovered(true)
    void preloadImage(card.artUrl)
  }

  const hidePreview = () => {
    setHovered(false)
    setPreviewPos(null)
  }

  return (
    <>
      <article
        className={`market-card${hovered ? ' market-card--hovered' : ''}`}
        aria-label={`${card.title}, ${rarityLabel(card.rarity)}`}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        onFocus={showPreview}
        onBlur={hidePreview}
      >
        <div className="market-card__frame" ref={frameRef}>
          <Card
            {...toCardDisplayProps(card, index)}
            totalCards={1}
            fanIndex={0}
            layoutMode="market"
            showAbility={false}
            showKeywords={false}
            showRarity={false}
            thumbOnly
          />
        </div>

        <div className="market-card__footer">
          <div className="market-card__meta">
            <span className={`market-card__rarity market-card__rarity--${card.rarity}`}>
              {rarityLabel(card.rarity)}
            </span>
            <span className="market-card__domain">{domainLabel(card.domain)}</span>
          </div>

          <div className="market-card__actions">
            <button
              type="button"
              className="market-card__price market-card__price--credits"
              disabled={creditCost <= 0}
              onClick={() => onBuyCredits?.(card)}
            >
              <span className="coin-stack-icon" aria-hidden="true" />
              <span>{creditsDisplay} credits</span>
            </button>
            <button
              type="button"
              className="market-card__price market-card__price--money"
              disabled={priceCents <= 0}
              onClick={() => onAddToCart?.(card)}
            >
              <span className="cart-icon cart-icon--money cart-icon--sm" aria-hidden="true" />
              <span>{moneyDisplay}</span>
            </button>
          </div>
        </div>

        {mounted && hovered && previewPos
          ? createPortal(
              <MarketCardHoverPreview card={card} position={previewPos} />,
              document.body,
            )
          : null}
      </article>
    </>
  )
}
