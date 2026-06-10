'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import ProtectedNavButton from '@/components/auth/ProtectedNavButton'
import { Button } from '@/components/ui/Button/Button'
import { appConfig } from '@/config'
import { routeRequiresAuth } from '@/lib/auth/guards'
import { FINAL_CTA_PARTICLES } from './finalCtaParticles'
import './FinalCtaSection.css'

const SECTION_THRESHOLD = 0.2

export default function FinalCtaSection() {
  const { finalCta } = appConfig.descriptions
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => setIsVisible(Boolean(entries[0]?.isIntersecting)),
      { threshold: SECTION_THRESHOLD },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const href = appConfig.domain.routes[finalCta.route]

  return (
    <section
      ref={sectionRef}
      className={`final-cta${isVisible ? ' visible' : ''}`}
      aria-label="Join the void"
    >
      {finalCta.backgroundImage ? (
        <div className="final-cta__bg" aria-hidden="true">
          <img
            src={finalCta.backgroundImage}
            alt=""
            className="final-cta__bg-image"
            loading="lazy"
            decoding="async"
          />
          <div className="final-cta__bg-scrim" />
        </div>
      ) : null}

      <div className="final-cta__particles" aria-hidden="true">
        {FINAL_CTA_PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="final-cta__particle"
            style={
              {
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                '--particle-color': particle.color,
                '--particle-drift': `${particle.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="landing-shell final-cta__inner">
        <div className="final-cta__copy">
          <h2 className="final-cta__title">{finalCta.title}</h2>
          <p className="final-cta__subtitle">{finalCta.subtitle}</p>
          <p className="final-cta__desc">{finalCta.description}</p>

          {routeRequiresAuth(finalCta.route) ? (
            <ProtectedNavButton
              label={finalCta.buttonLabel}
              href={href}
              variant="gold"
              className="final-cta__btn"
            />
          ) : (
            <Button
              as="link"
              href={href}
              variant="gold"
              size="lg"
              fantasy
              className="final-cta__btn"
            >
              {finalCta.buttonLabel}
            </Button>
          )}
        </div>

        {finalCta.siege.stats.length > 0 ? (
          <div className="final-cta__siege">
            <h3 className="final-cta__siege-title">{finalCta.siege.title}</h3>
            <ul className="final-cta__siege-stats" role="list">
              {finalCta.siege.stats.map((stat) => (
                <li key={stat.id} className="final-cta__siege-stat">
                  <span className="final-cta__siege-value">{stat.value}</span>
                  <span className="final-cta__siege-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
