'use client'

import PortalMarketGrid from '@/screens/Portal/PortalMarketGrid'
import { appConfig } from '@/config'
import './market.css'

export default function PortalMarketPage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'market')!

  return (
    <div className="portal-market-page">
      <p className="portal-market-page__subtitle">{section.subtitle}</p>
      <PortalMarketGrid />
    </div>
  )
}
