import { BENCH_DRAG_MIME } from '@/components/Arena'
import type { RosterCard } from '@/game/types'

type BenchProps = {
  cards: RosterCard[]
  capacity: number
  disabled: boolean
  onRemove: (slug: string) => void
  onDeploy: (slug: string) => void
}

export default function Bench({ cards, capacity, disabled, onRemove, onDeploy }: BenchProps) {
  const slots = Array.from({ length: Math.max(capacity, cards.length) }, (_, i) => cards[i] ?? null)

  return (
    <section className="ab-bench" aria-label="Hero bench">
      <header className="ab-bench__header">
        <h2>Bench</h2>
        <span>
          {cards.length}/{capacity}
        </span>
      </header>
      <p className="ab-bench__hint">Drag onto the grid, or click Deploy. Right-click / ✕ removes.</p>
      <ul className="ab-bench__slots">
        {slots.map((card, index) => (
          <li key={card?.slug ?? `empty-${index}`} className="ab-bench__slot">
            {card ? (
              <div
                className={`ab-bench__unit${disabled ? ' ab-bench__unit--disabled' : ''}`}
                draggable={!disabled}
                onDragStart={(event) => {
                  if (disabled) {
                    event.preventDefault()
                    return
                  }
                  event.dataTransfer.setData(BENCH_DRAG_MIME, card.slug)
                  event.dataTransfer.effectAllowed = 'move'
                }}
              >
                <img src={card.artUrl} alt={card.title} draggable={false} />
                <span>{card.title}</span>
                <div className="ab-bench__actions">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onDeploy(card.slug)}
                  >
                    Deploy
                  </button>
                  <button
                    type="button"
                    className="ab-bench__remove"
                    disabled={disabled}
                    title="Remove from bench"
                    onClick={() => onRemove(card.slug)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="ab-bench__empty" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
