import cardsJson from '@voidborn-cards'
import type { AttackType, RosterCard } from '@/game/types'

function artUrlFromPath(assetPath: string): string {
  const cleaned = assetPath.replace(/^\/+/, '')
  return `/voidborn-assets/${cleaned}`
}

function toRosterCard(
  raw: (typeof cardsJson.cards)[number],
  index: number,
): RosterCard {
  const attackType: AttackType = index % 2 === 0 ? 'melee' : 'ranged'
  return {
    title: raw.title,
    slug: raw.slug,
    domain: raw.domain,
    role: raw.role ?? 'Fighter',
    stats: {
      mana: raw.stats.mana,
      attack: raw.stats.attack,
      health: raw.stats.health,
    },
    artUrl: artUrlFromPath(raw.path),
    keywords: raw.keywords ?? [],
    attackType,
  }
}

const allCards = [...cardsJson.cards]
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((card, index) => toRosterCard(card, index))

const midpoint = Math.floor(allCards.length / 2)

/** First half of sorted voidborn cards — recruitable shop pool. */
export const HERO_POOL: RosterCard[] = allCards.slice(0, midpoint)

/** Second half — enemy roster. */
export const VILLAIN_POOL: RosterCard[] = allCards.slice(midpoint)

export function pickRandom<T>(pool: T[], count: number): T[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length))
}

export function createInstanceId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
