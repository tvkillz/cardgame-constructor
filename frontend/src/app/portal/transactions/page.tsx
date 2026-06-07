'use client'

import TransactionHistory from '@/components/store/TransactionHistory'
import { appConfig } from '@/config'
import '@/components/store/store.css'

export default function PortalTransactionsPage() {
  const section = appConfig.portal.sections.find((s) => s.id === 'transactions')!

  return (
    <div className="portal-market-page">
      <p className="portal-market-page__subtitle">{section.subtitle}</p>
      <TransactionHistory />
    </div>
  )
}
