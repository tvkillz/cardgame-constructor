'use client'

import { useEffect, useState } from 'react'

import Card, { type CardDisplayProps } from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'
import { isImageCached, preloadImage } from '@/lib/cards/preload'
import './CardPreviewPanel.css'

type CardPreviewPanelProps = {
  card: CardDisplayProps
  className?: string
  showRarity?: boolean
}

/** Full card preview panel — shared by market hover popover and landing collection showcase. */
export default function CardPreviewPanel({
  card,
  className = '',
  showRarity = false,
}: CardPreviewPanelProps) {
  const [artReady, setArtReady] = useState(() => isImageCached(card.artUrl))

  useEffect(() => {
    if (isImageCached(card.artUrl)) {
      setArtReady(true)
      return
    }

    setArtReady(false)
    let cancelled = false
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
      className={`card-preview-panel${artReady ? ' card-preview-panel--ready' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <Card
        {...display}
        artUrl={display.artUrl}
        totalCards={1}
        fanIndex={0}
        layoutMode="preview"
        showAbility
        showRarity={showRarity}
      />
    </div>
  )
}
