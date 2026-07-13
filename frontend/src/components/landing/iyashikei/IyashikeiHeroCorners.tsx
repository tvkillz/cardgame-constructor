'use client'

import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { HERO_CARDS } from '@/config'
import { preloadCardImages } from '@/lib/cards/preload'
import Card from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'

const CORNER_SLOTS = ['tl', 'tr', 'bl', 'br'] as const

export default function IyashikeiHeroCorners() {
  const cards = HERO_CARDS.slice(0, CORNER_SLOTS.length)

  useEffect(() => {
    if (!cards.length) return
    void preloadCardImages(cards, { fullArt: true })
  }, [cards])

  if (!cards.length) return null

  return (
    <div className="iyashikei-hero__corners" aria-hidden={cards.length === 0}>
      {cards.map((card, index) => {
        const slot = CORNER_SLOTS[index] ?? 'tl'

        return (
          <div
            key={card.id}
            className={`iyashikei-hero__corner iyashikei-hero__corner--${slot}`}
            style={{ '--corner-delay': `${index * 0.9}s` } as CSSProperties}
          >
            <div className="iyashikei-hero__corner-shine" aria-hidden="true" />
            <Card
              {...card}
              layoutMode="hero"
              showAbility={false}
              showKeywords={false}
              showRarity={false}
              totalCards={1}
              fanIndex={0}
              className="iyashikei-hero__corner-card"
            />
          </div>
        )
      })}
    </div>
  )
}
