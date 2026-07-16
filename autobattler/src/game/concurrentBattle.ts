import { gsap } from 'gsap'
import {
  advanceUntilInRange,
  distanceBetween,
  MELEE_REACH_PX,
  RANGED_REACH_PX,
  runMeleeStrike,
  spawnCombatFloat,
} from '@/vfx/combatFx'
import { runFireballVfx } from '@/vfx/fireball'
import { resolveDamage, rollHit, type UnitInstance } from '@/game/types'

export type ConcurrentBattleOpts = {
  stage: HTMLElement
  fx: HTMLElement
  heroes: UnitInstance[]
  villains: UnitInstance[]
  unitRefs: Map<string, HTMLElement>
  onSync: (heroes: UnitInstance[], villains: UnitInstance[]) => void
  onStatus: (text: string) => void
  /** Soft time limit so a stalled fight cannot hang forever. */
  maxDurationMs?: number
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function pickNearestEnemy(
  attacker: UnitInstance,
  enemies: UnitInstance[],
  unitRefs: Map<string, HTMLElement>,
): UnitInstance | null {
  const living = enemies.filter((e) => e.health > 0)
  if (!living.length) return null

  const fromNode = unitRefs.get(attacker.instanceId)
  if (!fromNode) return living[0] ?? null

  let best: UnitInstance | null = null
  let bestDist = Infinity
  for (const enemy of living) {
    const node = unitRefs.get(enemy.instanceId)
    if (!node) {
      if (!best) best = enemy
      continue
    }
    const d = distanceBetween(fromNode, node)
    if (d < bestDist) {
      bestDist = d
      best = enemy
    }
  }
  return best
}

/**
 * Each living unit runs its own move→attack loop.
 * All loops run concurrently via Promise.all.
 */
export async function runConcurrentBattle(opts: ConcurrentBattleOpts): Promise<'win' | 'lose'> {
  const {
    stage,
    fx,
    unitRefs,
    onSync,
    onStatus,
    maxDurationMs = 45_000,
  } = opts

  const heroesLive = opts.heroes.map((u) => ({ ...u }))
  const villainsLive = opts.villains.map((u) => ({ ...u }))
  const byId = new Map<string, UnitInstance>()
  for (const u of [...heroesLive, ...villainsLive]) byId.set(u.instanceId, u)

  let finished = false
  const startedAt = Date.now()

  const sync = () => {
    onSync(
      heroesLive.map((u) => ({ ...u })),
      villainsLive.map((u) => ({ ...u })),
    )
  }

  const enemiesOf = (unit: UnitInstance) => (unit.team === 'hero' ? villainsLive : heroesLive)

  const battleOver = () => {
    const h = heroesLive.some((u) => u.health > 0)
    const v = villainsLive.some((u) => u.health > 0)
    return !h || !v
  }

  async function unitLoop(unitId: string) {
    // Stagger starts slightly so not everyone snaps at once.
    await wait(40 + Math.random() * 180)

    while (!finished && Date.now() - startedAt < maxDurationMs) {
      const unit = byId.get(unitId)
      if (!unit || unit.health <= 0) return
      if (battleOver()) return

      const target = pickNearestEnemy(unit, enemiesOf(unit), unitRefs)
      if (!target) return

      const fromNode = unitRefs.get(unit.instanceId)
      const targetNode = unitRefs.get(target.instanceId)
      const isMelee = unit.attackType === 'melee'
      const reach = isMelee ? MELEE_REACH_PX : RANGED_REACH_PX

      if (fromNode && targetNode && target.health > 0 && unit.health > 0) {
        const inRange = await advanceUntilInRange({
          fromNode,
          targetNode,
          maxRange: reach,
          maxSteps: 4,
        })

        // Re-check after movement — target may have died mid-advance.
        if (unit.health <= 0 || target.health <= 0 || battleOver()) continue
        if (!inRange) {
          await wait(120 + Math.random() * 80)
          continue
        }

        const hit = rollHit()
        const dmg = resolveDamage(unit.attack)

        if (isMelee) {
          await runMeleeStrike({ stage, fromNode, targetNode })
        } else {
          await runFireballVfx({ stage, fxLayer: fx, fromNode, targetNode })
        }

        if (unit.health <= 0 || battleOver()) continue

        if (!hit) {
          void spawnCombatFloat(fx, targetNode, stage, 'MISS', 'miss')
          onStatus(`${unit.card.title} misses!`)
          await wait(isMelee ? 380 : 480)
          continue
        }

        if (target.health <= 0) {
          await wait(200)
          continue
        }

        target.health = Math.max(0, target.health - dmg)
        void spawnCombatFloat(fx, targetNode, stage, `-${dmg}`, 'damage')
        onStatus(`${unit.card.title} hits ${target.card.title} for ${dmg}`)
        sync()

        if (target.health <= 0) {
          onStatus(`${target.card.title} falls.`)
          const deadNode = unitRefs.get(target.instanceId)
          if (deadNode) gsap.to(deadNode, { opacity: 0.35, duration: 0.25 })
        }

        // Attack cooldown — other units keep fighting during this wait.
        await wait(isMelee ? 520 + Math.random() * 180 : 640 + Math.random() * 220)
        continue
      }

      await wait(150)
    }
  }

  const allIds = [...heroesLive, ...villainsLive].map((u) => u.instanceId)
  onStatus('Battle joined — all units fighting!')

  await Promise.all(allIds.map((id) => unitLoop(id)))
  finished = true

  // Settle any in-flight floats briefly
  await wait(280)
  sync()

  const heroesAlive = heroesLive.some((u) => u.health > 0)
  const villainsAlive = villainsLive.some((u) => u.health > 0)
  if (heroesAlive && !villainsAlive) return 'win'
  return 'lose'
}
