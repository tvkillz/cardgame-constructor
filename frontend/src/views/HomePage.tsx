import dynamic from 'next/dynamic'
import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'

const LocationsSection = dynamic(
  () => import('@/components/LocationsSection/LocationsSection'),
  { ssr: true },
)

const DominionsSection = dynamic(
  () => import('@/components/DominionsSection/DominionsSection'),
  { ssr: true },
)

const GameModelSection = dynamic(
  () => import('@/components/GameModelSection/GameModelSection'),
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
  return (
    <div className="app">
      <Header />
      <main className="landing-flow">
        <Hero />
        <LocationsSection />
        <DominionsSection />
        <GameModelSection />
        <CollectionSection />
        <PathwaysSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  )
}
