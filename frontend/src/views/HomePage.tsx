import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import DominionsSection from '@/components/DominionsSection/DominionsSection'
import LocationsSection from '@/components/LocationsSection/LocationsSection'

export default function HomePage() {
  return (
    <div className="app">
      <Header />
      <main className="landing-flow">
        <Hero />
        <LocationsSection />
        <DominionsSection />
      </main>
    </div>
  )
}
