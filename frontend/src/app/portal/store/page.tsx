'use client'

import StorePage from '@/components/store/StorePage'
import { appConfig } from '@/config'
import '@/components/store/store.css'

export default function PortalStorePage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'store')

  return (
    <div className="portal-market-page">
      {section && <p className="portal-market-page__subtitle">{section.subtitle}</p>}
      <StorePage />
    </div>
  )
}
