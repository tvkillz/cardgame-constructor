import { gsap } from 'gsap'

export type OrbPreset = {
  gradient: string
  shadowPrimary: string
  shadowSecondary: string
  chargeTo: number
  chargeDuration: number
  travelDuration: number
  launchColor: string
  launchCount: number
  launchSpread: number
  launchSize: number
  trailColor: string
  trailChance: number
  trailSpread: number
  trailSize: number
  impactColor: string
  impactCount: number
  impactSpread: number
  impactSize: number
  flashColor: string
  flashCount: number
  flashSpread: number
  flashSize: number
  shakeOffset: number
  shakeRepeat: number
  brightness: number
}

/** Port of voidborn orange fireball preset (frontend/src/config/game/orbs.config.ts). */
export const ORANGE_ORB: OrbPreset = {
  gradient:
    'radial-gradient(circle at 30% 30%, #fff7ed 0%, #fed7aa 30%, #fb923c 60%, rgba(251, 146, 60, 0) 100%)',
  shadowPrimary: '0 0 24px rgba(253, 198, 147, 0.95)',
  shadowSecondary: '0 0 56px rgba(248, 142, 56, 0.88)',
  chargeTo: 1.35,
  chargeDuration: 0.26,
  travelDuration: 0.49,
  launchColor: '#fb923c',
  launchCount: 12,
  launchSpread: 120,
  launchSize: 6,
  trailColor: 'rgba(252, 193, 125, 0.9)',
  trailChance: 0.45,
  trailSpread: 40,
  trailSize: 14,
  impactColor: '#fdba74',
  impactCount: 18,
  impactSpread: 140,
  impactSize: 14,
  flashColor: 'rgba(255,255,255,0.9)',
  flashCount: 8,
  flashSpread: 48,
  flashSize: 5,
  shakeOffset: 6,
  shakeRepeat: 3,
  brightness: 1.8,
}

function spawnBurst(
  fxLayer: HTMLElement,
  x: number,
  y: number,
  color: string,
  count: number,
  spread: number,
  baseSize: number,
) {
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('div')
    particle.className = 'ab-vfx-particle'
    particle.style.background = color
    particle.style.width = `${baseSize + Math.random() * baseSize}px`
    particle.style.height = particle.style.width
    particle.style.left = `${x}px`
    particle.style.top = `${y}px`
    fxLayer.appendChild(particle)

    const angle = Math.random() * Math.PI * 2
    const distance = spread * (0.35 + Math.random() * 0.65)
    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0.35,
      duration: 0.42 + Math.random() * 0.2,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    })
  }
}

/** Adapted from frontend/src/gameplay/shared/vfx.ts — no return flight for cleaner MVP. */
export function runFireballVfx(opts: {
  stage: HTMLElement
  fxLayer: HTMLElement
  fromNode: HTMLElement
  targetNode: HTMLElement
  orb?: OrbPreset
}): Promise<void> {
  const orb = opts.orb ?? ORANGE_ORB
  const { stage, fxLayer, fromNode, targetNode } = opts

  return new Promise((resolveDone) => {
    const stageRect = stage.getBoundingClientRect()
    const fromRect = fromNode.getBoundingClientRect()
    const targetRect = targetNode.getBoundingClientRect()

    const scaleX = stageRect.width / stage.clientWidth || 1
    const scaleY = stageRect.height / stage.clientHeight || 1

    const startX = (fromRect.left - stageRect.left + fromRect.width / 2) / scaleX
    const startY = (fromRect.top - stageRect.top + fromRect.height / 2) / scaleY
    const endX = (targetRect.left - stageRect.left + targetRect.width / 2) / scaleX
    const endY = (targetRect.top - stageRect.top + targetRect.height / 2) / scaleY

    const fireball = document.createElement('div')
    fireball.className = 'ab-fireball'
    fireball.style.setProperty('--orb-gradient', orb.gradient)
    fireball.style.setProperty('--orb-shadow-primary', orb.shadowPrimary)
    fireball.style.setProperty('--orb-shadow-secondary', orb.shadowSecondary)
    fireball.style.setProperty('--trail-core', orb.launchColor)
    fireball.style.left = `${startX}px`
    fireball.style.top = `${startY}px`
    fxLayer.appendChild(fireball)

    const castRing = document.createElement('div')
    castRing.className = 'ab-cast-ring'
    castRing.style.left = `${startX}px`
    castRing.style.top = `${startY}px`
    castRing.style.setProperty('--cast-color', orb.launchColor)
    fxLayer.appendChild(castRing)

    spawnBurst(fxLayer, startX, startY, orb.launchColor, orb.launchCount, orb.launchSpread, orb.launchSize)

    const updateProjectile = (t: number) => {
      const x = startX + (endX - startX) * t
      const y = startY + (endY - startY) * t
      const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)
      fireball.style.left = `${x}px`
      fireball.style.top = `${y}px`
      fireball.style.setProperty('--flight-angle', `${angle}deg`)
      if (Math.random() > orb.trailChance) {
        spawnBurst(fxLayer, x, y, orb.trailColor, 1, orb.trailSpread, orb.trailSize)
      }
    }

    gsap.set(fireball, { scale: 0.05, opacity: 0 })
    gsap.fromTo(
      castRing,
      { scale: 0.24, opacity: 0.8 },
      {
        scale: 1.4,
        opacity: 0,
        duration: Math.max(0.2, orb.chargeDuration * 1.35),
        ease: 'power2.out',
        onComplete: () => castRing.remove(),
      },
    )

    gsap.to(fireball, {
      scale: orb.chargeTo,
      opacity: 1,
      duration: orb.chargeDuration,
      ease: 'power2.out',
    })

    const flight = { t: 0 }
    gsap.to(flight, {
      t: 1,
      duration: orb.travelDuration,
      ease: 'power2.in',
      onUpdate: () => updateProjectile(flight.t),
      onComplete: () => {
        spawnBurst(fxLayer, endX, endY, orb.impactColor, orb.impactCount, orb.impactSpread, orb.impactSize)
        spawnBurst(fxLayer, endX, endY, orb.flashColor, orb.flashCount, orb.flashSpread, orb.flashSize)

        gsap.fromTo(
          stage,
          { x: -orb.shakeOffset },
          {
            x: orb.shakeOffset,
            duration: 0.045,
            repeat: orb.shakeRepeat,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => gsap.set(stage, { x: 0 }),
          },
        )

        gsap.fromTo(
          targetNode,
          { filter: 'brightness(1)' },
          {
            filter: `brightness(${orb.brightness})`,
            duration: 0.12,
            yoyo: true,
            repeat: 1,
          },
        )

        gsap.to(fireball, {
          scale: 0.1,
          opacity: 0,
          duration: 0.18,
          ease: 'power2.out',
          onComplete: () => {
            fireball.remove()
            gsap.set(stage, { x: 0 })
            resolveDone()
          },
        })
      },
    })
  })
}
