'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { appConfig, LOCATIONS } from '@/config'
import { Button } from '../ui/Button/Button'
import './LocationsSection.css'

type LocationId = (typeof LOCATIONS)[number]['id']

export default function LocationsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeLocation, setActiveLocation] = useState<LocationId>(LOCATIONS[0].id)
  const { locations: copy } = appConfig.descriptions

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsVisible(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.2 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const active = useMemo(() => {
    return LOCATIONS.find((l) => l.id === activeLocation) ?? LOCATIONS[0]
  }, [activeLocation])

  return (
    <section
      ref={sectionRef}
      className={`locations${isVisible ? ' visible' : ''}`}
      aria-label="Locations"
    >
      <div className="landing-shell locations__inner">
        <div className="locations__grid">
          <div className="locations__left">
            <div className="locations__copy">
              <h3 className="locations__kicker">{copy.kicker}</h3>
              <div className="locations__body">
                {copy.paragraphs.map((html) => (
                  <p
                    key={html.slice(0, 32)}
                    className="locations__text"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ))}
              </div>
            </div>

            <ul className="locations__menu" role="list">
              {LOCATIONS.map((loc) => {
                const isActive = loc.id === activeLocation
                return (
                  <li key={loc.id}>
                    <Button
                      type="button"
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      className={`locations__item${
                        isActive ? ' locations__item--active' : ''
                      }`}
                      onMouseEnter={() => setActiveLocation(loc.id)}
                      onFocus={() => setActiveLocation(loc.id)}
                    >
                      <span className="locations__item-title">{loc.name}</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="locations__right" aria-label="Location preview">
            <div className="locations__preview">
              {LOCATIONS.map((loc) => (
                <img
                  key={loc.id}
                  src={loc.image}
                  alt={`${loc.name} realm preview`}
                  className={`locations__image${
                    loc.id === active.id ? ' locations__image--active' : ''
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
              <div className="locations__preview-overlay" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
