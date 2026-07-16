import type { RosterCard } from '@/game/types'

type ShopPanelProps = {
  cards: RosterCard[]
  disabled: boolean
  onRecruit: (card: RosterCard) => void
  onReroll: () => void
}

export default function ShopPanel({ cards, disabled, onRecruit, onReroll }: ShopPanelProps) {
  return (
    <aside className="ab-shop" aria-label="Recruit shop">
      <header className="ab-shop__header">
        <h2>Recruit</h2>
        <button type="button" className="ab-btn ab-btn--ghost" disabled={disabled} onClick={onReroll}>
          Reroll
        </button>
      </header>
      <ul className="ab-shop__list">
        {cards.map((card) => (
          <li key={card.slug}>
            <button
              type="button"
              className="ab-shop__card"
              disabled={disabled}
              onClick={() => onRecruit(card)}
            >
              <div className="ab-shop__meta">
                <span className="ab-shop__role">{card.domain}</span>
                <strong>{card.title}</strong>
                <span className="ab-shop__stats">
                  {card.attackType.toUpperCase()} · ATK {card.stats.attack} · HP {card.stats.health} · MP{' '}
                  {card.stats.mana}
                </span>
              </div>
              <img src={card.artUrl} alt="" className="ab-shop__art" />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
