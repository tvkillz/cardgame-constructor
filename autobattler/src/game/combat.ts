import { createInstanceId, pickRandom, VILLAIN_POOL } from '@/data/roster'
import type { RosterCard, UnitInstance } from '@/game/types'

/**
 * Round 1 enemies are intentionally weak.
 * Later rounds can raise this multiplier / count.
 */
export function enemyStatScale(round: number): number {
  if (round <= 1) return 0.45
  return Math.min(1.2, 0.45 + (round - 1) * 0.15)
}

export function spawnVillains(round: number, heroCount: number): UnitInstance[] {
  const count = Math.max(1, Math.min(heroCount, 3))
  const scale = enemyStatScale(round)
  const picks = pickRandom(VILLAIN_POOL, count)

  return picks.map((card) => scaleCardToUnit(card, 'villain', scale))
}

export function scaleCardToUnit(
  card: RosterCard,
  team: 'hero' | 'villain',
  scale = 1,
): UnitInstance {
  const attack = Math.max(1, Math.round(card.stats.attack * scale))
  const health = Math.max(1, Math.round(card.stats.health * scale))
  return {
    instanceId: createInstanceId(team),
    card,
    attack,
    health,
    maxHealth: health,
    mana: card.stats.mana,
    team,
    attackType: card.attackType,
  }
}

export function heroesFromBench(bench: RosterCard[]): UnitInstance[] {
  return bench.map((card) => scaleCardToUnit(card, 'hero', 1))
}
