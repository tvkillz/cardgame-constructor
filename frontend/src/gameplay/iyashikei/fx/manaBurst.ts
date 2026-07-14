import { gsap } from 'gsap'

import { getStageMetrics, rectToStagePoint } from '../../shared/fx/stageMetrics'

export function playManaGainBurst(
  anchorEl: HTMLElement,
  stage: HTMLElement,
  fxLayer: HTMLElement,
  options?: { amount?: number; variant?: 'hero' | 'villain' },
): Promise<void> {
  const { stageRect, scaleX, scaleY } = getStageMetrics(stage, fxLayer)
  const anchorRect = anchorEl.getBoundingClientRect()
  const { x, y } = rectToStagePoint(anchorRect, stageRect, scaleX, scaleY, 'center')

  const burst = document.createElement('div')
  burst.className = `game-fx-mana-burst game-fx-mana-burst--${options?.variant ?? 'hero'}`
  burst.innerHTML = `
    <span class="game-fx-mana-burst__label">+${options?.amount ?? 1}</span>
    <span class="game-fx-mana-burst__sub">Spirit</span>
  `
  burst.style.left = `${x}px`
  burst.style.top = `${y}px`
  fxLayer.appendChild(burst)

  const bead = anchorEl.querySelector('.iyashikei-avatar__mana-bead--active:last-child')
  if (bead) {
    gsap.fromTo(
      bead,
      { scale: 1 },
      {
        scale: 1.18,
        duration: 0.26,
        yoyo: true,
        repeat: 1,
        ease: 'sine.out',
      },
    )
  }

  return new Promise((resolve) => {
    gsap.fromTo(
      burst,
      { opacity: 0, y: 8, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'sine.out' },
    )

    gsap.to(burst, {
      opacity: 0,
      y: -24,
      duration: 0.65,
      delay: 0.55,
      ease: 'sine.in',
      onComplete: () => {
        burst.remove()
        resolve()
      },
    })
  })
}
