'use client'

import { formatCredits } from '@/config'
import { Button } from '@/components/ui/Button/Button'
import { useWallet } from '@/hooks/useWallet'

export default function PurchaseSuccess() {
  const { balanceCredits, refresh, loading } = useWallet()

  return (
    <div className="checkout-result">
      <h1>Payment received</h1>
      <span className="checkout-result__icon" aria-hidden="true" />
      <p className="checkout-result__lead">
        An invoice has been sent to your email (we will configure this shortly).
      </p>
      {!loading && (
        <p className="checkout-result__balance">
          Current balance: <strong>{formatCredits(balanceCredits)}</strong> credits
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        size="md"
        fantasy
        className="checkout-result__refresh"
        disabled={loading}
        onClick={() => void refresh()}
      >
        Refresh balance
      </Button>
    </div>
  )
}
