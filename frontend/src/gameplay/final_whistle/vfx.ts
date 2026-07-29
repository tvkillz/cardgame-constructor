import { gsap } from 'gsap'

import type { ParticleBurstConfig } from '@/config/game/schema'
import type { OrbPresetConfig } from '@/config'

import { spawnBurst } from '../shared/vfx'
import { rectToStagePoint } from '../shared/fx/stageMetrics'
import { IYASHIKEI_ANIM_SCALE } from './animScale'
import { runKomorebiStrikeVfx as runLegacyKomorebiStrikeVfx } from '../iyashikei/vfx'

/**
 * Final Whistle combat strike — "pass/shot" animation from the attacker card to the target card.
 * (We keep the exported name used by `useGameMatchFx`.)
 */
export function runKomorebiStrikeVfx(opts: {
  stage: HTMLDivElement
  fxLayer: HTMLElement
  targetNode: HTMLElement
  attackerNode?: HTMLElement | null
  orbPreset: OrbPresetConfig
  particles: ParticleBurstConfig
  faceHit?: boolean
}): Promise<void> {
  const { stage, fxLayer, targetNode, attackerNode, orbPreset, particles, faceHit } = opts

  // Revert strike visuals back to the legacy KOMOREBI ambient impact.
  // (Our local projectile path remains below; it won't run for the current orb ids.)
  if (['blue', 'green', 'orange'].includes(orbPreset.id)) {
    return runLegacyKomorebiStrikeVfx(opts)
  }

  return new Promise((resolve) => {
    const stageRect = stage.getBoundingClientRect()
    const scaleX = stageRect.width / stage.clientWidth || 1
    const scaleY = stageRect.height / stage.clientHeight || 1

    const targetRect = targetNode.getBoundingClientRect()
    const { x: targetX, y: targetY } = rectToStagePoint(targetRect, stageRect, scaleX, scaleY)

    const attackerConnected = Boolean(attackerNode?.isConnected)
    const startRect = attackerConnected ? attackerNode!.getBoundingClientRect() : targetRect
    const { x: startX, y: startY } = rectToStagePoint(startRect, stageRect, scaleX, scaleY)

    const dx = targetX - startX
    const dy = targetY - startY
    const length = Math.max(18, Math.hypot(dx, dy))
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI

    // Mild arc: pulls the ball slightly "up" mid-flight.
    const arc = (faceHit ? -74 : -56) * (Math.abs(dy) / Math.max(80, Math.abs(dy)))
    const midX = startX + dx * 0.52
    const midY = startY + dy * 0.52 + arc

    const cleanup: HTMLElement[] = []
    const track = (el: HTMLElement) => {
      cleanup.push(el)
      return el
    }

    // Projectile elements (no external CSS dependency; inline styles only).
    const ballSize = faceHit ? 14 : 12

    const muzzle = track(document.createElement('div'))
    muzzle.style.position = 'absolute'
    muzzle.style.left = `${startX - ballSize / 2}px`
    muzzle.style.top = `${startY - ballSize / 2}px`
    muzzle.style.width = `${ballSize}px`
    muzzle.style.height = `${ballSize}px`
    muzzle.style.borderRadius = '50%'
    muzzle.style.background = `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, ${orbPreset.launchColor} 42%, rgba(0,0,0,0.2) 100%)`
    muzzle.style.boxShadow = `0 0 ${faceHit ? 18 : 14}px ${orbPreset.launchColor}, inset 0 0 8px rgba(255,255,255,0.25)`
    muzzle.style.opacity = '0'
    fxLayer.appendChild(muzzle)

    const beam = track(document.createElement('div'))
    beam.style.position = 'absolute'
    beam.style.left = `${startX}px`
    beam.style.top = `${startY}px`
    beam.style.height = `${faceHit ? 6 : 5}px`
    beam.style.width = `${length}px`
    beam.style.borderRadius = '999px'
    beam.style.background = `linear-gradient(90deg, ${orbPreset.launchColor} 0%, ${orbPreset.trailColor ?? orbPreset.launchColor} 30%, ${orbPreset.impactColor} 100%)`
    beam.style.opacity = '0'
    beam.style.transformOrigin = '0% 50%'
    beam.style.transform = `rotate(${angle}deg) scaleX(0)`
    fxLayer.appendChild(beam)

    const core = track(document.createElement('div'))
    core.style.position = 'absolute'
    core.style.left = `${startX}px`
    core.style.top = `${startY}px`
    core.style.height = `${faceHit ? 2.2 : 2}px`
    core.style.width = `${length}px`
    core.style.borderRadius = '999px'
    core.style.background = `linear-gradient(90deg, rgba(255,255,255,0.95) 0%, ${orbPreset.launchColor} 35%, ${orbPreset.impactColor} 100%)`
    core.style.opacity = '0'
    core.style.transformOrigin = '0% 50%'
    core.style.transform = `rotate(${angle}deg) scaleX(0.06)`
    fxLayer.appendChild(core)

    const impact = track(document.createElement('div'))
    const impactSize = faceHit ? 34 : 28
    impact.style.position = 'absolute'
    impact.style.left = `${targetX - impactSize / 2}px`
    impact.style.top = `${targetY - impactSize / 2}px`
    impact.style.width = `${impactSize}px`
    impact.style.height = `${impactSize}px`
    impact.style.borderRadius = '50%'
    impact.style.border = `2px solid ${orbPreset.impactColor}`
    impact.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 55%)`
    impact.style.opacity = '0'
    impact.style.transform = 'scale(0.35)'
    fxLayer.appendChild(impact)

    // Position the beam properly: rotate around its left edge.
    // (We keep the projectile "from->to" readable even at different scales.)

    const tl = gsap.timeline({
      timeScale: 1 / IYASHIKEI_ANIM_SCALE,
      onComplete: () => {
        cleanup.forEach((el) => el.remove())
        resolve()
      },
    })

    // --- Launch ---
    tl.to(muzzle, { opacity: 1, duration: 0.06, ease: 'power2.out' }, 0)
    tl.to(beam, { opacity: 0.95, duration: 0.06, ease: 'power2.out' }, 0.02)
    tl.to(core, { opacity: 0.95, duration: 0.06, ease: 'power2.out' }, 0.03)

    tl.to(
      beam,
      {
        // We scale the beam along X (its transform already contains rotate()).
        transform: `rotate(${angle}deg) scaleX(1)`,
        duration: 0.12,
        ease: 'power3.out',
      },
      0.04,
    )
    tl.to(
      core,
      {
        transform: `rotate(${angle}deg) scaleX(1)`,
        duration: 0.1,
        ease: 'power3.out',
      },
      0.06,
    )

    // --- Mid-flight arc (two segments for the "shot" feel) ---
    tl.to(
      muzzle,
      {
        x: midX - startX,
        y: midY - startY,
        rotation: faceHit ? 26 : 18,
        scale: 1.08,
        duration: 0.16,
        ease: 'power2.out',
      },
      0.1,
    )
    tl.to(
      muzzle,
      {
        x: dx,
        y: dy,
        rotation: faceHit ? 38 : 26,
        scale: 0.98,
        duration: 0.14,
        ease: 'power2.in',
      },
      0.26,
    )

    // --- Impact ---
    tl.call(
      () => {
        spawnBurst(
          fxLayer,
          targetX,
          targetY,
          orbPreset.impactColor,
          Math.max(4, Math.floor(orbPreset.impactCount * 0.55)),
          orbPreset.impactSpread * 0.85,
          orbPreset.impactSize,
          particles,
        )

        // Secondary "flash" for a football hit pop.
        spawnBurst(
          fxLayer,
          targetX,
          targetY,
          orbPreset.flashColor,
          Math.max(3, Math.floor(orbPreset.flashCount * 0.55)),
          orbPreset.flashSpread * 0.75,
          orbPreset.flashSize,
          particles,
        )
      },
      [],
      0.32,
    )

    tl.to(
      impact,
      { opacity: 1, transform: 'scale(1.2)', duration: 0.1, ease: 'power2.out' },
      0.3,
    )
    tl.to(impact, { opacity: 0, transform: 'scale(1.85)', duration: 0.32, ease: 'power2.in' }, 0.4)

    tl.fromTo(
      targetNode,
      { filter: 'brightness(1) saturate(1)' },
      {
        filter: `brightness(${orbPreset.brightness}) drop-shadow(0 0 ${faceHit ? 22 : 18}px ${orbPreset.launchColor})`,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      },
      0.34,
    )

    // Small stadium shake on a "face hit" for punch.
    const shake = faceHit ? 8 : 5
    tl.fromTo(
      stage,
      { x: 0 },
      { x: shake, duration: 0.04, yoyo: true, repeat: 2, ease: 'power1.inOut' },
      0.32,
    )

    // --- Fade out ---
    tl.to([beam, core], { opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.4)
    tl.to({}, { duration: 0.12 }, 0.92)
  })
}
