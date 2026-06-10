'use client'

import { useCallback, useMemo, useState } from 'react'

import Card from '@/components/CardPlaceholder/Card'
import '@/components/CardPlaceholder/styles.css'
import { Button } from '@/components/ui/Button/Button'
import { usePlayerDecks } from '@/hooks/usePlayerDecks'
import { useCardCatalog } from '@/hooks/useCardCatalog'
import { toCardDisplayProps } from '@/lib/cards'
import {
  DEFAULT_MAX_DECK_CARDS,
  MAX_COPIES_PER_CARD,
  createPlayerDeck,
  deckCardCount,
  removePlayerDeck,
  savePlayerDeck,
  type DeckCardEntry,
  type PlayerDeck,
} from '@/lib/decks'
import './PortalCollection.css'

export default function PortalCollection() {
  const { cards: catalog } = useCardCatalog()
  const { decks, loading, refresh, userId } = usePlayerDecks()
  const [activeDeckId, setActiveDeckId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const activeDeck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) ?? decks[0],
    [decks, activeDeckId],
  )

  const countInDeck = activeDeck ? deckCardCount(activeDeck) : 0

  const persistDeck = useCallback(
    async (deck: PlayerDeck) => {
      setSaving(true)
      try {
        await savePlayerDeck(userId, deck)
        await refresh()
      } finally {
        setSaving(false)
      }
    },
    [refresh, userId],
  )

  const updateActiveCards = (cards: DeckCardEntry[]) => {
    if (!activeDeck) return
    void persistDeck({ ...activeDeck, cards, updatedAt: new Date().toISOString() })
  }

  const addCardToDeck = (slug: string, cardId: string) => {
    if (!activeDeck) return
    if (countInDeck >= activeDeck.maxCards) return

    const existing = activeDeck.cards.find((c) => c.slug === slug)
    if (existing) {
      if (existing.quantity >= MAX_COPIES_PER_CARD) return
      updateActiveCards(
        activeDeck.cards.map((c) =>
          c.slug === slug ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      )
      return
    }

    updateActiveCards([
      ...activeDeck.cards,
      {
        cardId,
        slug,
        quantity: 1,
        sortOrder: activeDeck.cards.length,
      },
    ])
  }

  const removeOneFromDeck = (slug: string) => {
    if (!activeDeck) return
    const existing = activeDeck.cards.find((c) => c.slug === slug)
    if (!existing) return
    if (existing.quantity <= 1) {
      updateActiveCards(activeDeck.cards.filter((c) => c.slug !== slug))
      return
    }
    updateActiveCards(
      activeDeck.cards.map((c) =>
        c.slug === slug ? { ...c, quantity: c.quantity - 1 } : c,
      ),
    )
  }

  const handleCreateDeck = async () => {
    const created = await createPlayerDeck(
      userId,
      `Deck ${decks.length + 1}`,
      DEFAULT_MAX_DECK_CARDS,
    )
    await refresh()
    setActiveDeckId(created.id)
  }

  const handleDeleteDeck = async () => {
    if (!activeDeck || decks.length <= 1) return
    if (!window.confirm(`Delete "${activeDeck.name}"?`)) return
    await removePlayerDeck(userId, activeDeck.id)
    await refresh()
    setActiveDeckId('')
  }

  const handleRename = () => {
    if (!activeDeck) return
    const name = window.prompt('Deck name', activeDeck.name)?.trim()
    if (!name) return
    void persistDeck({ ...activeDeck, name })
  }

  if (loading) {
    return <p className="portal-collection__status">Loading your decks…</p>
  }

  return (
    <div className="portal-collection">
      <aside className="portal-collection__sidebar">
        <div className="portal-collection__sidebar-head">
          <h2 className="portal-collection__heading">Your decks</h2>
          <Button type="button" variant="primary" size="sm" onClick={() => void handleCreateDeck()}>
            + New deck
          </Button>
        </div>
        <ul className="portal-collection__deck-list">
          {decks.map((deck) => {
            const count = deckCardCount(deck)
            const isActive = deck.id === activeDeck?.id
            return (
              <li key={deck.id}>
                <button
                  type="button"
                  className={`portal-collection__deck-item${isActive ? ' portal-collection__deck-item--active' : ''}`}
                  onClick={() => setActiveDeckId(deck.id)}
                >
                  <span className="portal-collection__deck-name">{deck.name}</span>
                  <span className="portal-collection__deck-count">
                    {count}/{deck.maxCards}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {activeDeck && (
        <div className="portal-collection__main">
          <header className="portal-collection__toolbar">
            <div>
              <h3 className="portal-collection__deck-title">{activeDeck.name}</h3>
              <p className="portal-collection__deck-meta">
                {countInDeck}/{activeDeck.maxCards} cards · max {MAX_COPIES_PER_CARD} copies each
                {saving ? ' · Saving…' : ''}
              </p>
            </div>
            <div className="portal-collection__toolbar-actions">
              <Button type="button" variant="secondary" size="sm" onClick={handleRename}>
                Rename
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleDeleteDeck()}
                disabled={decks.length <= 1}
              >
                Delete
              </Button>
            </div>
          </header>

          <section className="portal-collection__in-deck" aria-label="Cards in deck">
            <h4>In this deck</h4>
            {activeDeck.cards.length === 0 ? (
              <p className="portal-collection__empty">Add cards from the catalog below.</p>
            ) : (
              <ul className="portal-collection__in-deck-list">
                {activeDeck.cards.map((entry) => {
                  const record = catalog.find((c) => c.slug === entry.slug)
                  if (!record) return null
                  return (
                    <li key={entry.slug} className="portal-collection__in-deck-row">
                      <span>{record.title}</span>
                      <span className="portal-collection__qty">×{entry.quantity}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeOneFromDeck(entry.slug)}
                      >
                        −
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="portal-collection__catalog" aria-label="Card catalog">
            <h4>Add cards</h4>
            <div className="portal-collection__grid">
              {catalog.map((card, index) => {
                const inDeck = activeDeck.cards.find((c) => c.slug === card.slug)
                const atMaxCopies = (inDeck?.quantity ?? 0) >= MAX_COPIES_PER_CARD
                const deckFull = countInDeck >= activeDeck.maxCards
                return (
                  <div key={card.id} className="portal-collection__catalog-slot">
                    <Card
                      {...toCardDisplayProps(card, index)}
                      totalCards={1}
                      fanIndex={0}
                      layoutMode="compact"
                    />
                    <div className="portal-collection__catalog-actions">
                      {inDeck ? (
                        <span className="portal-collection__in-deck-badge">×{inDeck.quantity}</span>
                      ) : null}
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={deckFull || atMaxCopies}
                        onClick={() => addCardToDeck(card.slug, card.id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
