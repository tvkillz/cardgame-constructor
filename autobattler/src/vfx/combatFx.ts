import { gsap } from 'gsap'

export type CombatFloatKind = 'damage' | 'miss' | 'heal'

/** Centers roughly one card apart = adjacent melee. */
export const MELEE_REACH_PX = 120
/** Ranged can shoot at about 3× melee reach — not across the whole map. */
export const RANGED_REACH_PX = MELEE_REACH_PX * 3

/** Formation X from own lane toward center (heroes +, villains −). */
export const FORMATION_X = {
  melee: 250,
  ranged: 85,
} as const

export function distanceBetween(a: HTMLElement, b: HTMLElement): number {
  const ar = a.getBoundingClientRect()
  const br = b.getBoundingClientRect()
  const dx = ar.left + ar.width / 2 - (br.left + br.width / 2)
  const dy = ar.top + ar.height / 2 - (br.top + br.height / 2)
  return Math.hypot(dx, dy)
}

/** March units to melee/ranged lines (GSAP owns x so later advances stay consistent). */
export function formUpUnits(
  units: Array<{ instanceId: string; team: 'hero' | 'villain'; attackType: 'melee' | 'ranged' }>,
  unitRefs: Map<string, HTMLElement>,
  durationSec = 2.4,
): Promise<void> {
  for (const unit of units) {
    const node = unitRefs.get(unit.instanceId)
    if (!node) continue
    const dir = unit.team === 'hero' ? 1 : -1
    const x = FORMATION_X[unit.attackType] * dir
    gsap.to(node, {
      x,
      y: 0,
      duration: durationSec,
      ease: 'power2.inOut',
    })
  }

  return new Promise((resolve) => {
    gsap.delayedCall(durationSec + 0.05, () => resolve())
  })
}

/** Floating combat label above a unit (MISS / -N). */
export function spawnCombatFloat(
  fxLayer: HTMLElement,
  anchor: HTMLElement,
  stage: HTMLElement,
  text: string,
  kind: CombatFloatKind = 'damage',
): Promise<void> {
  return new Promise((resolve) => {
    const stageRect = stage.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const scaleX = stageRect.width / stage.clientWidth || 1
    const scaleY = stageRect.height / stage.clientHeight || 1

    const x = (anchorRect.left - stageRect.left + anchorRect.width / 2) / scaleX
    const y = (anchorRect.top - stageRect.top) / scaleY

    const el = document.createElement('div')
    el.className = `ab-float ab-float--${kind}`
    el.textContent = text
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    fxLayer.appendChild(el)

    gsap.fromTo(
      el,
      { y: 0, opacity: 0, scale: 0.7 },
      {
        y: -36,
        opacity: 1,
        scale: 1,
        duration: 0.18,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(el, {
            y: -64,
            opacity: 0,
            duration: 0.55,
            delay: 0.22,
            ease: 'power1.in',
            onComplete: () => {
              el.remove()
              resolve()
            },
          })
        },
      },
    )
  })
}

/**
 * Step the attacker toward the target until within `maxRange` (or maxSteps).
 */
export async function advanceUntilInRange(opts: {
  fromNode: HTMLElement
  targetNode: HTMLElement
  maxRange: number
  maxSteps?: number
}): Promise<boolean> {
  const { fromNode, targetNode, maxRange, maxSteps = 8 } = opts

  for (let step = 0; step < maxSteps; step += 1) {
    const dist = distanceBetween(fromNode, targetNode)
    if (dist <= maxRange) return true

    const fromRect = fromNode.getBoundingClientRect()
    const targetRect = targetNode.getBoundingClientRect()
    const dx = targetRect.left + targetRect.width / 2 - (fromRect.left + fromRect.width / 2)
    const dy = targetRect.top + targetRect.height / 2 - (fromRect.top + fromRect.height / 2)
    const len = Math.hypot(dx, dy) || 1

    const excess = dist - maxRange
    const move = Math.min(Math.max(excess * 0.9, 24), 110)
    const mx = (dx / len) * move
    const my = (dy / len) * move

    const curX = Number(gsap.getProperty(fromNode, 'x')) || 0
    const curY = Number(gsap.getProperty(fromNode, 'y')) || 0

    await new Promise<void>((resolve) => {
      gsap.to(fromNode, {
        x: curX + mx,
        y: curY + my,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => resolve(),
      })
    })
  }

  return distanceBetween(fromNode, targetNode) <= maxRange * 1.1
}

/** Melee: close to stand next to target, strike, hold adjacent. */
export function runMeleeStrike(opts: {
  stage: HTMLElement
  fromNode: HTMLElement
  targetNode: HTMLElement
}): Promise<void> {
  const { stage, fromNode, targetNode } = opts

  return new Promise((resolve) => {
    const stageRect = stage.getBoundingClientRect()
    const fromRect = fromNode.getBoundingClientRect()
    const targetRect = targetNode.getBoundingClientRect()

    const dx = targetRect.left + targetRect.width / 2 - (fromRect.left + fromRect.width / 2)
    const dy = targetRect.top + targetRect.height / 2 - (fromRect.top + fromRect.height / 2)
    const dist = Math.hypot(dx, dy) || 1

    const stopShort = Math.max(0, dist - MELEE_REACH_PX * 0.9)
    const ratio = stopShort / dist
    const curX = Number(gsap.getProperty(fromNode, 'x')) || 0
    const curY = Number(gsap.getProperty(fromNode, 'y')) || 0
    const strikeX = curX + dx * ratio
    const strikeY = curY + dy * ratio

    const slash = document.createElement('div')
    slash.className = 'ab-melee-slash'
    const scaleX = stageRect.width / stage.clientWidth || 1
    const scaleY = stageRect.height / stage.clientHeight || 1
    const midX =
      (fromRect.left + fromRect.width / 2 + targetRect.left + targetRect.width / 2) / 2 -
      stageRect.left
    const midY =
      (fromRect.top + fromRect.height / 2 + targetRect.top + targetRect.height / 2) / 2 -
      stageRect.top
    slash.style.left = `${midX / scaleX}px`
    slash.style.top = `${midY / scaleY}px`
    stage.querySelector('.ab-arena__fx')?.appendChild(slash)

    gsap
      .timeline({
        onComplete: () => {
          slash.remove()
          resolve()
        },
      })
      .to(fromNode, {
        x: strikeX,
        y: strikeY,
        duration: 0.28,
        ease: 'power2.in',
      })
      .to(
        slash,
        {
          opacity: 1,
          scale: 1.15,
          duration: 0.12,
          ease: 'power2.out',
        },
        '-=0.05',
      )
      .to(
        slash,
        {
          opacity: 0,
          scale: 0.6,
          duration: 0.2,
        },
        '+=0.05',
      )
  })
}
