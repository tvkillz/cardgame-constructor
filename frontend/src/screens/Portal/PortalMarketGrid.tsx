'use client'

import Card from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'
import { useCardCatalog } from '@/hooks/useCardCatalog'
import { toCardDisplayProps } from '@/lib/cards'
import './PortalMarketGrid.css'

export default function PortalMarketGrid() {
  const catalog = useCardCatalog()

  return (
    <div className="portal-market-grid" aria-label="Card market catalog">
      {catalog.map((card, index) => (
        <Card
          key={card.id}
          {...toCardDisplayProps(card, index)}
          totalCards={1}
          fanIndex={0}
          layoutMode="compact"
          showAbility
        />
      ))}
    </div>
  )
}
