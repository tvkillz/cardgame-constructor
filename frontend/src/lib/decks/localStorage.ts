import type { PlayerDeck } from './types'

const STORAGE_KEY = 'voidborn.player_decks'

function readAll(): PlayerDeck[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PlayerDeck[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(decks: PlayerDeck[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

export function loadLocalDecks(userId: string): PlayerDeck[] {
  return readAll().filter((d) => d.id.startsWith(`${userId}:`) || d.id.includes(userId))
}

export function saveLocalDeck(userId: string, deck: PlayerDeck): PlayerDeck {
  const scopedId = deck.id.startsWith(`${userId}:`) ? deck.id : `${userId}:${deck.id}`
  const next = { ...deck, id: scopedId }
  const all = readAll().filter((d) => d.id !== scopedId)
  all.push(next)
  writeAll(all)
  return next
}

export function deleteLocalDeck(deckId: string) {
  writeAll(readAll().filter((d) => d.id !== deckId))
}

export function createDefaultLocalDecks(
  userId: string,
  catalogSlugs: string[],
): PlayerDeck[] {
  const slugs = catalogSlugs.slice(0, 30)
  const decks: PlayerDeck[] = [
    {
      id: `${userId}:starter-1`,
      name: 'Voidbound Strike',
      maxCards: 30,
      updatedAt: new Date().toISOString(),
      cards: slugs.map((slug, i) => ({
        cardId: slug,
        slug,
        quantity: 1,
        sortOrder: i,
      })),
    },
    {
      id: `${userId}:starter-2`,
      name: 'Elemental Mix',
      maxCards: 30,
      updatedAt: new Date().toISOString(),
      cards: [...slugs].reverse().map((slug, i) => ({
        cardId: slug,
        slug,
        quantity: 1,
        sortOrder: i,
      })),
    },
  ]
  for (const deck of decks) saveLocalDeck(userId, deck)
  return decks
}
