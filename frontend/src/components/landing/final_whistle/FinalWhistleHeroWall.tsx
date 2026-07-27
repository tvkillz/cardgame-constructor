'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { HERO_CARDS } from '@/config'
import { preloadCardImages } from '@/lib/cards/preload'
import Card from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'
import './styles.css'

/**
 * ── Hero wall arc tuning ──────────────────────────────────────────────
 * Edit WALL_ARC to reposition cards. Slots are computed on a semicircle:
 *
 *   x = sin(angle) × radiusX     ← horizontal offset from centre (px)
 *   y = (1 - cos(angle)) × radiusY   ← outer cards rise slightly (px)
 *   rotate = angle × rotateFactor    ← tilt toward centre (deg)
 *
 * | Knob          | Effect                                         |
 * |---------------|------------------------------------------------|
 * | radiusX       | Wider arc ↔ tighter (keep cards on screen)     |
 * | radiusY       | Flatter ↔ more “smile” at the wings            |
 * | halfAngle     | Narrow fan ↔ wide fan (degrees each side)      |
 * | rotateFactor  | Less tilt ↔ more tilt on outer cards           |
 * | edgeScaleDrop | How much smaller wing cards are (0–0.2)          |
 *
 * Card pixel size: `.fw-hero__wall-card` in `styles.css`.
 */
export const WALL_ARC = {
  radiusX: 500,
  radiusY: 24,
  halfAngle: 40,
  rotateFactor: 0,
  edgeScaleDrop: 0.1,
  delayStep: 0,
} as const

export type WallSlot = {
  rotate: number
  x: number
  y: number
  scale: number
  delay: number
}

export function buildWallSlots(count: number, arc = WALL_ARC): WallSlot[] {
  if (count <= 0) return []

  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.5 : index / (count - 1)
    const angle = -arc.halfAngle + t * arc.halfAngle * 2
    const rad = (angle * Math.PI) / 180

    return {
      rotate: angle * arc.rotateFactor,
      x: Math.sin(rad) * arc.radiusX,
      y: (1 - Math.cos(rad)) * arc.radiusY,
      scale: 1 - (Math.abs(angle) / arc.halfAngle) * arc.edgeScaleDrop,
      delay: index * arc.delayStep,
    }
  })
}

const WALL_SLOTS = buildWallSlots(6)

const SPOTLIGHT_INTERVAL_MS = 2800

export default function FinalWhistleHeroWall() {
  const cards = HERO_CARDS.slice(0, 6)
  const [spotlightIndex, setSpotlightIndex] = useState(2)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!cards.length) return
    void preloadCardImages(cards, { fullArt: true })
  }, [cards])

  useEffect(() => {
    if (!cards.length || hoveredIndex !== null) return

    const interval = window.setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % cards.length)
    }, SPOTLIGHT_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [cards.length, hoveredIndex])

  if (!cards.length) return null

  const activeIndex = hoveredIndex ?? spotlightIndex
  const activeSlot = WALL_SLOTS[activeIndex] ?? WALL_SLOTS[0]

  return (
    <div className="fw-hero__wall" aria-hidden={cards.length === 0}>
      <div className="fw-hero__wall-pitch" aria-hidden="true">
        <div className="fw-hero__wall-circle" />
        <div
          className="fw-hero__wall-spotlight"
          style={{ '--spot-x': `${activeSlot?.x ?? 0}px` } as CSSProperties}
        />
      </div>

      <ul className="fw-hero__wall-line">
        {cards.map((card, index) => {
          const slot = WALL_SLOTS[index % WALL_SLOTS.length]
          const isLit = index === activeIndex

          return (
            <li
              key={card.id}
              className={`fw-hero__wall-slot${isLit ? ' fw-hero__wall-slot--lit' : ''}`}
              style={
                {
                  '--wall-rotate': `${slot.rotate}deg`,
                  '--wall-x': `${slot.x}px`,
                  '--wall-y': `${slot.y}px`,
                  '--wall-scale': slot.scale,
                  '--wall-delay': `${slot.delay}s`,
                  zIndex: isLit ? 14 : 4 + index,
                } as CSSProperties
              }
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="fw-hero__wall-shadow" aria-hidden="true" />
              <Card
                {...card}
                layoutMode="hero"
                showAbility={false}
                showKeywords={false}
                showRarity={false}
                totalCards={1}
                fanIndex={0}
                className="fw-hero__wall-card"
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
