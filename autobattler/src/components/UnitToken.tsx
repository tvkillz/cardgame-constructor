import { useEffect, useRef, type CSSProperties } from 'react'
import type { UnitInstance } from '@/game/types'

type UnitTokenProps = {
  unit: UnitInstance
  laneIndex: number
  laneCount: number
  interactive?: boolean
  register: (id: string, node: HTMLElement | null) => void
  onClick?: () => void
}

export default function UnitToken({
  unit,
  laneIndex,
  laneCount,
  interactive = false,
  register,
  onClick,
}: UnitTokenProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    register(unit.instanceId, ref.current)
    return () => register(unit.instanceId, null)
  }, [register, unit.instanceId])

  const hpPct = Math.max(0, Math.round((unit.health / unit.maxHealth) * 100))
  const dead = unit.health <= 0
  /** Vertical stagger via margin so GSAP can own transform x/y for combat movement. */
  const stackOffset = (laneIndex - (laneCount - 1) / 2) * 14

  return (
    <div
      ref={ref}
      className={`ab-unit${dead ? ' ab-unit--dead' : ''} ab-unit--${unit.team} ab-unit--${unit.attackType}${interactive ? ' ab-unit--interactive' : ''}`}
      data-unit-id={unit.instanceId}
      style={{ marginTop: stackOffset, marginBottom: -stackOffset } as CSSProperties}
      title={interactive ? 'Click to return to bench' : undefined}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      <div className="ab-unit__bars">
        <div className="ab-unit__bar ab-unit__bar--hp" title={`HP ${unit.health}/${unit.maxHealth}`}>
          <span style={{ width: `${hpPct}%` }} />
          <em>
            {unit.health}/{unit.maxHealth}
          </em>
        </div>
        <div className="ab-unit__bar ab-unit__bar--mp" title={`Mana ${unit.mana}`}>
          <span style={{ width: '100%' }} />
          <em>MP {unit.mana}</em>
        </div>
      </div>
      <div className="ab-unit__frame">
        <img src={unit.card.artUrl} alt={unit.card.title} draggable={false} />
        <div className={`ab-unit__type ab-unit__type--${unit.attackType}`}>
          {unit.attackType === 'melee' ? '⚔' : '🏹'}
        </div>
        <div className="ab-unit__atk">{unit.attack}</div>
      </div>
      <p className="ab-unit__name">{unit.card.title}</p>
    </div>
  )
}
