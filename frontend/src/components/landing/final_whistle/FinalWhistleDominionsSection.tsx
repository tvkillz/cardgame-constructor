'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { LOCATIONS, appConfig } from '@/config'
import type { LocationConfig } from '@/config/schema'
import './final-whistle-dominions.css'

function resolvePrimaryCity(location: LocationConfig) {
  return location.cities?.[0] ?? { name: location.name, description: location.short, image: location.image }
}

export default function FinalWhistleDominionsSection() {
  const [activeId, setActiveId] = useState(LOCATIONS[0]?.id ?? '')
  const active = useMemo(
    () => LOCATIONS.find((location) => location.id === activeId) ?? LOCATIONS[0],
    [activeId],
  )
  const copy = appConfig.descriptions.dominions

  if (!active) return null
  const city = resolvePrimaryCity(active)

  return (
    <section className="fw-dominions" aria-label="Pitch Domains">
      <div className="landing-shell fw-dominions__shell">
        <header className="fw-dominions__header">
          <p className="fw-dominions__kicker">MATCHDAY BOARD · SECTION 03</p>
          <h2 className="landing-section-title fw-dominions__title">{copy.title}</h2>
          <p className="landing-section-lead fw-dominions__lead">{copy.description}</p>
        </header>

        <div className="fw-dominions__layout">
          <aside className="fw-dominions__rail" aria-label="Domain lineup">
            {LOCATIONS.map((location, index) => {
              const isActive = location.id === active.id
              const cityCount = location.cities?.length ?? 1
              return (
                <button
                  key={location.id}
                  type="button"
                  className={`fw-dominions__chip${isActive ? ' is-active' : ''}`}
                  style={{ ['--chip-glow' as string]: location.glowColor } as CSSProperties}
                  onClick={() => setActiveId(location.id)}
                  onMouseEnter={() => setActiveId(location.id)}
                  onFocus={() => setActiveId(location.id)}
                  aria-pressed={isActive}
                >
                  <span className="fw-dominions__chip-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="fw-dominions__chip-name">{location.name}</span>
                  <span className="fw-dominions__chip-meta">{cityCount} match zones</span>
                </button>
              )
            })}
          </aside>

          <article className="fw-dominions__board">
            <div className="fw-dominions__screen">
              <img
                key={active.id}
                src={city.image}
                alt={`${city.name} domain preview`}
                className="fw-dominions__image"
                loading="lazy"
                decoding="async"
              />
              <div className="fw-dominions__image-scrim" aria-hidden="true" />
              {/* <div className="fw-dominions__chalk fw-dominions__chalk--left" aria-hidden="true" /> */}
              {/* <div className="fw-dominions__chalk fw-dominions__chalk--right" aria-hidden="true" /> */}
            </div>

            <div className="fw-dominions__caption">
              <p className="fw-dominions__channel">Live Domain Feed</p>
              <h3>{active.name}</h3>
              <p>{city.description || active.short}</p>
            </div>
          </article>

          <aside className="fw-dominions__panel" aria-live="polite">
            <p className="fw-dominions__panel-label">Shape Notes</p>
            <h3 className="fw-dominions__panel-title">{active.categoryLabel}</h3>
            <p className="fw-dominions__panel-copy">{active.epithet}</p>
            <dl className="fw-dominions__panel-stats">
              <div>
                <dt>Domain Code</dt>
                <dd>{active.domainId.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Zone Focus</dt>
                <dd>{active.short}</dd>
              </div>
              <div>
                <dt>City Rotation</dt>
                <dd>{active.cities?.length ?? 1}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}
