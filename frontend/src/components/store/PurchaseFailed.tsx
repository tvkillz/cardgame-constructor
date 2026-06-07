'use client'

import Link from 'next/link'

import { appConfig } from '@/config'

export default function PurchaseFailed() {
  return (
    <div className="checkout-result">
      <h1>Checkout cancelled</h1>
      <p>No charge was made. You can try again from the store or top-up modal.</p>
      <p>
        <Link href={appConfig.domain.routes.portalStore}>Return to store</Link>
      </p>
    </div>
  )
}
