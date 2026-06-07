import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import LocationsSection from '@/components/LocationsSection/LocationsSection'

export default function HomePage() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <LocationsSection />
      </main>
    </div>
  )
}
