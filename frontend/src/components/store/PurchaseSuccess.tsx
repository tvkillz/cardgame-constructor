'use client'

import Link from 'next/link'

import { appConfig } from '@/config'
import { useWallet } from '@/hooks/useWallet'

export default function PurchaseSuccess() {
  const { balanceCredits, refresh, loading } = useWallet()

  return (
    <div className="checkout-result">
      <h1>Payment received</h1>
      <p>
        Your order is being confirmed. Credits and inventory update when Stripe sends the
        webhook (usually within seconds).
      </p>
      {!loading && (
        <p>
          Current balance: <strong>{balanceCredits.toLocaleString()}</strong> credits
        </p>
      )}
      <p>
        <button type="button" onClick={() => void refresh()}>
          Refresh balance
        </button>
      </p>
      <p>
        <Link href={appConfig.domain.routes.portalTransactions}>View transactions</Link>
        {' · '}
        <Link href={appConfig.domain.routes.portalStore}>Back to store</Link>
      </p>
    </div>
  )
}
