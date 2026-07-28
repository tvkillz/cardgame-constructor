import dynamic from 'next/dynamic'
import { LandingHeader, LandingHero, LandingLocations } from '@/components/landing/resolveLanding'
import { appConfig } from '@/config'

const DominionsSection = dynamic(
  () => import('@/components/DominionsSection/DominionsSection'),
  { ssr: true },
)
const FinalWhistleDominionsSection = dynamic(
  () => import('@/components/landing/final_whistle/FinalWhistleDominionsSection'),
  { ssr: true },
)

const GameModelSection = dynamic(
  () => import('@/components/GameModelSection/GameModelSection'),
  { ssr: true },
)
const FinalWhistleGameModelSection = dynamic(
  () => import('@/components/landing/final_whistle/FinalWhistleGameModelSection'),
  { ssr: true },
)

const FinalWhistleCatalogSection = dynamic(
  () => import('@/components/landing/final_whistle/FinalWhistleCatalogSection'),
  { ssr: true },
)

const FinalWhistlePathwaysSection = dynamic(
  () => import('@/components/landing/final_whistle/FinalWhistlePathwaysSection'),
  { ssr: true },
)

const CollectionSection = dynamic(
  () => import('@/components/CollectionSection/CollectionSection'),
  { ssr: true },
)

const PathwaysSection = dynamic(
  () => import('@/components/PathwaysSection/PathwaysSection'),
  { ssr: true },
)

const FaqSection = dynamic(() => import('@/components/FaqSection/FaqSection'), { ssr: true })

const FinalCtaSection = dynamic(
  () => import('@/components/FinalCtaSection/FinalCtaSection'),
  { ssr: true },
)

const Footer = dynamic(() => import('@/components/Footer/Footer'), { ssr: true })

export default function HomePage() {
  const isFinalWhistle = appConfig.landing?.variant === 'final_whistle'

  return (
    <div className="app">
      <LandingHeader />
      <main className="landing-flow">
        <LandingHero />
        <LandingLocations />
        {isFinalWhistle ? <FinalWhistleDominionsSection /> : <DominionsSection />}
        {isFinalWhistle ? <FinalWhistleGameModelSection /> : <GameModelSection />}
        {isFinalWhistle ? <FinalWhistleCatalogSection /> : <CollectionSection />}
        {isFinalWhistle ? <FinalWhistlePathwaysSection /> : <PathwaysSection />}
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  )
}
