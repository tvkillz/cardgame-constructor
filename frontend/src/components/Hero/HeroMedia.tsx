'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { appConfig, LOCATION_SLIDES } from '@/config'

const SLIDE_INTERVAL_MS = 6000
const VIDEO_MIN_PLAY_MS = 8000

export default function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const transitionedRef = useRef(false)
  const [showVideo, setShowVideo] = useState(true)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [slidesVisible, setSlidesVisible] = useState(false)

  const transitionToSlides = useCallback(() => {
    if (transitionedRef.current) return
    transitionedRef.current = true
    setShowVideo(false)
    setSlidesVisible(true)
  }, [])

  useEffect(() => {
    for (const slide of LOCATION_SLIDES) {
      const img = new Image()
      img.src = slide.image
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const minTimer = window.setTimeout(() => {
      if (!video.ended) transitionToSlides()
    }, VIDEO_MIN_PLAY_MS)

    const onEnded = () => {
      window.clearTimeout(minTimer)
      transitionToSlides()
    }

    const onPlaying = () => setVideoPlaying(true)

    video.addEventListener('ended', onEnded)
    video.addEventListener('playing', onPlaying)
    if (!video.paused && !video.ended) setVideoPlaying(true)

    void video.play().catch(() => {
      transitionToSlides()
    })

    return () => {
      window.clearTimeout(minTimer)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('playing', onPlaying)
    }
  }, [transitionToSlides])

  useEffect(() => {
    if (!slidesVisible) return

    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % LOCATION_SLIDES.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [slidesVisible])

  const videoClassName = [
    'hero__video',
    showVideo && 'hero__video--visible',
    videoPlaying && 'hero__video--playing',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <video
        ref={videoRef}
        className={videoClassName}
        src={appConfig.arts.introVideo}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={false}
      />

      <div
        className={`hero__slides${slidesVisible ? ' hero__slides--visible' : ''}`}
      >
        {LOCATION_SLIDES.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt=""
            className={`hero__slide${
              slidesVisible && index === activeSlide ? ' hero__slide--active' : ''
            }`}
          />
        ))}
      </div>
    </>
  )
}
