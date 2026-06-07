import Card, { type CardDisplayProps } from './Card'
import './styles.css'

interface CardPlaceholderProps {
  cards: CardDisplayProps[]
  layoutMode?: 'default' | 'hero'
}

export default function CardPlaceholder({ cards, layoutMode = 'default' }: CardPlaceholderProps) {
  const isHero = layoutMode === 'hero'

  return (
    <div className="card-fan" aria-label="Card previews">
      {cards.map((card) => (
        <Card
          key={card.id}
          {...card}
          layoutMode={isHero ? 'hero' : 'default'}
          showAbility={isHero ? false : undefined}
          showKeywords={isHero ? true : undefined}
          showRarity={isHero ? false : undefined}
          totalCards={cards.length}
        />
      ))}
    </div>
  )
}
