export type CardStats = {
  mana: number
  attack: number
  health: number
}

export type AttackType = 'melee' | 'ranged'

export type RosterCard = {
  title: string
  slug: string
  domain: string
  role: string
  stats: CardStats
  /** Vite-served URL into projects/voidborn/assets */
  artUrl: string
  keywords: string[]
  /** Stable 50/50 assignment from card index. */
  attackType: AttackType
}

export type UnitInstance = {
  instanceId: string
  card: RosterCard
  /** Live combat stats (may be scaled for villains). */
  attack: number
  health: number
  maxHealth: number
  mana: number
  team: 'hero' | 'villain'
  attackType: AttackType
}

export type Phase = 'prep' | 'battling' | 'result'

export type RoundResult = 'win' | 'lose' | null

/** Applied when resolving hits (base attack already includes enemy scaling). */
export const DAMAGE_MULTIPLIER = 0.5
export const MISS_CHANCE = 0.3

export function rollHit(): boolean {
  return Math.random() >= MISS_CHANCE
}

export function resolveDamage(attack: number): number {
  return Math.max(1, Math.round(attack * DAMAGE_MULTIPLIER))
}