import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import HelixHeader from '@/components/landing/helix/HelixHeader'
import HelixHero from '@/components/landing/helix/HelixHero'
import HelixLocations from '@/components/landing/helix/HelixLocations'
import IyashikeiHeader from '@/components/landing/iyashikei/IyashikeiHeader'
import IyashikeiHero from '@/components/landing/iyashikei/IyashikeiHero'
import LocationsSection from '@/components/LocationsSection/LocationsSection'
import { appConfig } from '@/config'

/** Project landing shell — Header + Hero (+ Locations for helix) swap by variant. */
export function LandingHeader() {
  const variant = appConfig.landing?.variant
  if (variant === 'iyashikei') return <IyashikeiHeader />
  if (variant === 'helix') return <HelixHeader />
  return <Header />
}

export function LandingHero() {
  const variant = appConfig.landing?.variant
  if (variant === 'iyashikei') return <IyashikeiHero />
  if (variant === 'helix') return <HelixHero />
  return <Hero />
}

export function LandingLocations() {
  if (appConfig.landing?.variant === 'helix') return <HelixLocations />
  return <LocationsSection />
}
