import PortalCollection from '@/screens/Portal/PortalCollection'
import { appConfig } from '@/config'
import './collection.css'

export default function PortalCollectionPage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'collection')!

  return (
    <div className="portal-collection-page">
      <p className="portal-collection-page__subtitle">{section.subtitle}</p>
      <PortalCollection />
    </div>
  )
}
