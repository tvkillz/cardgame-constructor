'use client'

import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { appConfig, LOCATIONS } from '@/config'
import type { DominionCitySlide, LocationConfig } from '@/config/schema'
import './DominionsSection.css'

const SLIDE_INTERVAL_MS = 5500
const MOBILE_BREAKPOINT = 919
const CARD_REVEAL_ROOT_MARGIN = '12% 0px 18% 0px'

function resolveSlides(loc: LocationConfig): DominionCitySlide[] {
  if (loc.cities?.length) return loc.cities
  const images = loc.images?.length ? loc.images : [loc.image]
  return images.map((image, index) => ({
    image,
    name: loc.name,
    description: index === 0 ? loc.short : '',
  }))
}

function DominionCard({ loc }: { loc: LocationConfig }) {
  const slides = resolveSlides(loc)
  const slideCount = slides.length
  const [index, setIndex] = useState(0)
  const activeCity = slides[index] ?? slides[0]

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slideCount) + slideCount) % slideCount)
    },
    [slideCount],
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    if (slideCount <= 1) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount)
    }, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [slideCount])

  return (
    <article
      className="dominions__card"
      style={{ '--dominion-glow': loc.glowColor } as CSSProperties}
    >
      <div className="dominions__slides" aria-hidden={slideCount <= 1}>
        {slides.map((slide, slideIndex) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            className={`dominions__slide${
              slideIndex === index ? ' dominions__slide--active' : ''
            }`}
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      <div className="dominions__card-overlay" aria-hidden="true" />

      <div className="dominions__card-copy">
        <h3 className="dominions__card-name">{loc.name}</h3>
        <p className="dominions__card-type">{loc.categoryLabel} Dominion</p>

        <div className="dominions__city-copy" key={`${loc.id}-${index}`}>
          <h4 className="dominions__city-name">{activeCity.name}</h4>
          {activeCity.description ? (
            <p className="dominions__city-desc">{activeCity.description}</p>
          ) : null}
        </div>
      </div>

      {slideCount > 1 && (
        <div className="dominions__footer">
          <div className="dominions__dots" role="tablist" aria-label={`${loc.name} cities`}>
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.image}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`${slide.name} (${dotIndex + 1} of ${slideCount})`}
                className={`dominions__dot${
                  dotIndex === index ? ' dominions__dot--active' : ''
                }`}
                onClick={() => goTo(dotIndex)}
              />
            ))}
          </div>

          <div className="dominions__arrows">
            <button
              type="button"
              className="dominions__arrow"
              aria-label={`Previous city in ${loc.name}`}
              onClick={goPrev}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className="dominions__arrow"
              aria-label={`Next city in ${loc.name}`}
              onClick={goNext}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

function DominionCardItem({
  loc,
  staggerIndex,
  sectionVisible,
}: {
  loc: LocationConfig
  staggerIndex: number
  sectionVisible: boolean
}) {
  const itemRef = useRef<HTMLLIElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = itemRef.current
    if (!el) return

    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    let observer: IntersectionObserver | null = null

    const attach = () => {
      observer?.disconnect()

      if (!mq.matches) {
        setInView(false)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          setInView(Boolean(entry?.isIntersecting))
        },
        { threshold: 0.15, rootMargin: CARD_REVEAL_ROOT_MARGIN },
      )
      observer.observe(el)
    }

    attach()
    mq.addEventListener('change', attach)
    return () => {
      observer?.disconnect()
      mq.removeEventListener('change', attach)
    }
  }, [])

  const mobileVisible = sectionVisible && inView

  return (
    <li
      ref={itemRef}
      className={`dominions__item${mobileVisible ? ' dominions__item--in-view' : ''}`}
      style={{ '--dominions-stagger': staggerIndex } as CSSProperties}
    >
      <DominionCard loc={loc} />
    </li>
  )
}

export default function DominionsSection() {
  const { dominions } = appConfig.descriptions
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const [isHeaderInView, setIsHeaderInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsSectionVisible(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    let observer: IntersectionObserver | null = null

    const attach = () => {
      observer?.disconnect()

      if (!mq.matches) {
        setIsHeaderInView(true)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          setIsHeaderInView(Boolean(entry?.isIntersecting))
        },
        { threshold: 0.2, rootMargin: '0px 0px 5% 0px' },
      )
      observer.observe(el)
    }

    attach()
    mq.addEventListener('change', attach)
    return () => {
      observer?.disconnect()
      mq.removeEventListener('change', attach)
    }
  }, [])

  const showHeader = isSectionVisible && isHeaderInView

  return (
    <section
      ref={sectionRef}
      className={`dominions${isSectionVisible ? ' visible' : ''}`}
      aria-label="Dominions"
    >
      <div className="landing-shell dominions__inner">
        <header
          ref={headerRef}
          className={`dominions__header${showHeader ? ' dominions__header--visible' : ''}`}
        >
          <h2 className="landing-section-title">{dominions.title}</h2>
          <p
            className="landing-section-lead"
            dangerouslySetInnerHTML={{ __html: dominions.description }}
          />
        </header>

        <ul className="dominions__grid" role="list">
          {LOCATIONS.map((loc, index) => (
            <DominionCardItem
              key={loc.id}
              loc={loc}
              staggerIndex={index}
              sectionVisible={isSectionVisible}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
