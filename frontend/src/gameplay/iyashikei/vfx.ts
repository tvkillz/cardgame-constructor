import { gsap } from 'gsap'

import type { ParticleBurstConfig } from '@/config/game/schema'
import type { OrbPresetConfig } from '@/config'

import { spawnBurst, type FireballAnimConfig } from '../shared/vfx'

/** Gentle floating light instead of a fireball — KOMOREBI combat. */
export function runLightWispVfx(opts: {
  stage: HTMLDivElement
  fxLayer: HTMLElement
  fromNode: HTMLElement
  targetNode: HTMLElement
  orbPreset: OrbPresetConfig
  particles: ParticleBurstConfig
  fireballAnim: FireballAnimConfig
  skipReturnFlight?: boolean
}): Promise<void> {
  return new Promise((resolveDone) => {
    const {
      stage,
      fxLayer,
      fromNode,
      targetNode,
      orbPreset,
      particles,
      fireballAnim,
      skipReturnFlight,
    } = opts

    const stageRect = stage.getBoundingClientRect()
    const fromRect = fromNode.getBoundingClientRect()
    const targetRect = targetNode.getBoundingClientRect()

    const stageScaleX = stageRect.width / stage.clientWidth || 1
    const stageScaleY = stageRect.height / stage.clientHeight || 1

    const startX = (fromRect.left - stageRect.left + fromRect.width / 2) / stageScaleX
    const startY = (fromRect.top - stageRect.top + fromRect.height / 2) / stageScaleY
    const endX = (targetRect.left - stageRect.left + targetRect.width / 2) / stageScaleX
    const endY = (targetRect.top - stageRect.top + targetRect.height / 2) / stageScaleY

    const wisp = document.createElement('div')
    wisp.className = 'game-light-wisp'
    wisp.style.setProperty('--wisp-gradient', orbPreset.gradient)
    wisp.style.setProperty('--wisp-shadow', orbPreset.shadowPrimary)
    wisp.style.left = `${startX}px`
    wisp.style.top = `${startY}px`
    fxLayer.appendChild(wisp)

    const castRing = document.createElement('div')
    castRing.className = 'game-cast-ring game-cast-ring--soft'
    castRing.style.left = `${startX}px`
    castRing.style.top = `${startY}px`
    castRing.style.setProperty('--cast-color', orbPreset.launchColor)
    fxLayer.appendChild(castRing)

    spawnBurst(
      fxLayer,
      startX,
      startY,
      orbPreset.launchColor,
      orbPreset.launchCount,
      orbPreset.launchSpread,
      orbPreset.launchSize,
      particles,
    )

    const updateProjectile = (t: number) => {
      const eased = t * t * (3 - 2 * t)
      const x = startX + (endX - startX) * eased
      const y = startY + (endY - startY) * eased - Math.sin(t * Math.PI) * 18
      wisp.style.left = `${x}px`
      wisp.style.top = `${y}px`

      if (Math.random() > orbPreset.trailChance) {
        spawnBurst(fxLayer, x, y, orbPreset.trailColor, 1, orbPreset.trailSpread, orbPreset.trailSize, particles)
      }
    }

    gsap.set(wisp, {
      scale: fireballAnim.initialScale,
      opacity: 0,
    })

    gsap.fromTo(
      castRing,
      {
        scale: fireballAnim.castRing.fromScale * 0.85,
        opacity: fireballAnim.castRing.fromOpacity * 0.55,
      },
      {
        scale: fireballAnim.castRing.toScale * 0.9,
        opacity: 0,
        duration: Math.max(
          fireballAnim.castRing.minDuration,
          orbPreset.chargeDuration * fireballAnim.castRing.durationChargeMultiplier,
        ),
        ease: 'sine.out',
        onComplete: () => castRing.remove(),
      },
    )

    gsap.to(wisp, {
      scale: orbPreset.chargeTo,
      opacity: 1,
      duration: orbPreset.chargeDuration,
      ease: 'sine.out',
    })

    const flight = { t: 0 }
    gsap.to(flight, {
      t: 1,
      duration: orbPreset.travelDuration,
      ease: 'sine.inOut',
      onUpdate: () => updateProjectile(flight.t),
      onComplete: () => {
        spawnBurst(
          fxLayer,
          endX,
          endY,
          orbPreset.impactColor,
          orbPreset.impactCount,
          orbPreset.impactSpread,
          orbPreset.impactSize,
          particles,
        )
        spawnBurst(
          fxLayer,
          endX,
          endY,
          orbPreset.flashColor,
          orbPreset.flashCount,
          orbPreset.flashSpread,
          orbPreset.flashSize,
          particles,
        )

        gsap.fromTo(
          targetNode,
          { filter: 'brightness(1)' },
          {
            filter: `brightness(${orbPreset.brightness})`,
            duration: fireballAnim.targetHit.brightnessDuration * 1.4,
            yoyo: true,
            repeat: fireballAnim.targetHit.brightnessRepeat,
          },
        )

        const finishVfx = () => resolveDone()

        if (skipReturnFlight) {
          gsap.to(wisp, {
            scale: 0.2,
            opacity: 0,
            duration: fireballAnim.fadeOut.duration * 1.2,
            ease: 'sine.in',
            onComplete: () => {
              wisp.remove()
              finishVfx()
            },
          })
          return
        }

        gsap.to(flight, {
          t: 0,
          duration: orbPreset.travelDuration * fireballAnim.returnTravelMultiplier,
          ease: 'sine.inOut',
          onUpdate: () => updateProjectile(flight.t),
          onComplete: () => {
            const linger = fireballAnim.lingerBurst
            spawnBurst(
              fxLayer,
              startX,
              startY,
              orbPreset.launchColor,
              linger.count,
              linger.spread,
              linger.size,
              particles,
            )
            gsap.to(wisp, {
              scale: 0.15,
              opacity: 0,
              duration: fireballAnim.fadeOut.duration * 1.2,
              ease: 'sine.in',
              onComplete: () => {
                wisp.remove()
                finishVfx()
              },
            })
          },
        })
      },
    })
  })
}
