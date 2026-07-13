import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import IyashikeiHeader from '@/components/landing/iyashikei/IyashikeiHeader'
import IyashikeiHero from '@/components/landing/iyashikei/IyashikeiHero'
import { appConfig } from '@/config'

/** Voidborn — original dark fantasy landing shell. */
export function LandingHeader() {
  if (appConfig.landing?.variant === 'iyashikei') {
    return <IyashikeiHeader />
  }
  return <Header />
}

export function LandingHero() {
  if (appConfig.landing?.variant === 'iyashikei') {
    return <IyashikeiHero />
  }
  return <Hero />
}
