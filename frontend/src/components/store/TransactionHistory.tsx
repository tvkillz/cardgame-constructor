'use client'

import { useCallback, useEffect, useState } from 'react'

import { formatCredits } from '@/config'
import { invokeCommerceAction, type WalletTransaction } from '@/lib/commerce/api'

type OrderRow = {
  id: string
  status: string
  total_cents: number
  currency: string
  credits_granted: number
  created_at: string
  refund_status?: string | null
}

function formatTxType(type: string, description: string | null): string {
  if (description?.startsWith('Card sold:')) return 'Card sale'
  if (description?.startsWith('Bought listing:')) return 'Card purchase'
  if (description?.startsWith('Purchased card:')) return 'Store purchase'
  if (type === 'top_up') return 'Top up'
  if (type === 'purchase') return 'Purchase'
  if (type === 'adjustment') return 'Adjustment'
  if (type === 'withdrawal') return 'Withdrawal'
  if (type === 'refund') return 'Refund'
  return type
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [txRes, ordRes] = await Promise.all([
      invokeCommerceAction({ type: 'transactions_list', limit: 50 }),
      invokeCommerceAction({ type: 'orders_list' }),
    ])
    setTransactions(txRes.transactions ?? [])
    setOrders((ordRes.orders as OrderRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void load().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [load])

  if (loading) return <p>Loading transaction history…</p>

  return (
    <div className="store-page">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Credits</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <span className={`tx-status--${o.status}`}>{o.status}</span>
                </td>
                <td>
                  {(o.total_cents / 100).toFixed(2)} {o.currency.toUpperCase()}
                </td>
                <td>{o.credits_granted}</td>
                <td>{o.refund_status ?? (o.status === 'refunded' ? 'refunded' : '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Wallet activity</h2>
      {transactions.length === 0 ? (
        <p>No wallet transactions yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Balance after</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{formatTxType(tx.type, tx.description)}</td>
                <td>{tx.description ?? '—'}</td>
                <td>
                  <span className={`tx-status--${tx.status}`}>{tx.status}</span>
                </td>
                <td>
                  {tx.amount_credits > 0 ? '+' : ''}
                  {formatCredits(Math.abs(tx.amount_credits))} credits
                </td>
                <td>
                  {tx.balance_after != null ? `${formatCredits(tx.balance_after)} credits` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
